import Alpaca from '@alpacahq/alpaca-trade-api';
import { StockData, ORBData } from '../types';

class AlpacaService {
  private alpaca: any;
  private requestDelay = 300; // 300ms delay between requests to avoid rate limits
  private maxRetries = 2;

  constructor() {
    this.alpaca = new Alpaca({
      keyId: process.env.ALPACA_API_KEY,
      secretKey: process.env.ALPACA_SECRET_KEY,
      paper: true,
      usePolygon: false,
      feed: 'iex' // Use free IEX feed instead of paid SIP feed
    });
  }

  // Helper to delay requests and avoid rate limits
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Retry logic for rate-limited requests
  private async retryRequest<T>(fn: () => Promise<T>, retries: number = this.maxRetries): Promise<T | null> {
    for (let i = 0; i <= retries; i++) {
      try {
        return await fn();
      } catch (error: any) {
        if (error?.message?.includes('429') && i < retries) {
          await this.delay(1000 * (i + 1)); // Exponential backoff
          continue;
        }
        throw error;
      }
    }
    return null;
  }

  async getStockQuote(symbol: string): Promise<StockData | null> {
    try {
      await this.delay(this.requestDelay); // Rate limiting

      // Try snapshot first
      const snapshot = await this.retryRequest(() => this.alpaca.getSnapshot(symbol));

      // Debug logging
      if (!snapshot) {
        console.log(`${symbol}: Snapshot is null/undefined`);
      } else if (!snapshot.latestTrade) {
        console.log(`${symbol}: Snapshot has no latestTrade. Keys: ${Object.keys(snapshot).join(', ')}`);
      } else if (!snapshot.latestTrade.p || snapshot.latestTrade.p <= 0) {
        console.log(`${symbol}: Invalid price: ${snapshot.latestTrade.p}`);
      }

      if (snapshot && snapshot.latestTrade && snapshot.latestTrade.p > 0) {
        console.log(`${symbol}: ✓ Got snapshot - $${snapshot.latestTrade.p}`);
        return {
          symbol,
          price: snapshot.latestTrade.p || 0,
          volume: snapshot.dailyBar?.v || snapshot.minuteBar?.v || 0,
          change: snapshot.dailyBar?.c - snapshot.dailyBar?.o || 0,
          changePercent: ((snapshot.dailyBar?.c - snapshot.dailyBar?.o) / snapshot.dailyBar?.o * 100) || 0,
        };
      }

      // Fallback: Use latest bar data if snapshot unavailable
      console.log(`${symbol}: Falling back to bar data`);

      // Try 1-hour bars first (more recent than daily)
      let bars = await this.getBars(symbol, '1Hour', 10);

      // If no hourly bars, try daily bars
      if (bars.length === 0) {
        console.log(`${symbol}: No hourly bars, trying daily`);
        bars = await this.getBars(symbol, '1Day', 5);
      }

      if (bars.length === 0) {
        console.log(`${symbol}: No bar data available at all`);
        return null;
      }

      const latestBar = bars[bars.length - 1];
      const previousBar = bars.length > 1 ? bars[bars.length - 2] : null;

      console.log(`${symbol}: ✓ Using bar data - $${latestBar.ClosePrice} (${bars.length} bars, timeframe: ${bars.length > 5 ? '1Hour' : '1Day'})`);

      return {
        symbol,
        price: latestBar.ClosePrice || 0,
        volume: latestBar.Volume || 0,
        change: previousBar ? (latestBar.ClosePrice - previousBar.ClosePrice) : 0,
        changePercent: previousBar ? ((latestBar.ClosePrice - previousBar.ClosePrice) / previousBar.ClosePrice * 100) : 0,
      };
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      return null;
    }
  }

  async getBars(symbol: string, timeframe: string = '5Min', limit: number = 20): Promise<any[]> {
    try {
      await this.delay(this.requestDelay); // Rate limiting

      const end = new Date();
      const start = new Date();

      // Adjust start date based on timeframe
      if (timeframe.includes('Day')) {
        start.setDate(start.getDate() - 7); // Last 7 days for daily bars
      } else if (timeframe.includes('Hour')) {
        start.setDate(start.getDate() - 3); // Last 3 days for hourly bars
      } else {
        start.setDate(start.getDate() - 1); // Last day for minute bars
      }

      const bars = await this.retryRequest(async () => {
        const barsIterator = await this.alpaca.getBarsV2(symbol, {
          start: start.toISOString(),
          end: end.toISOString(),
          timeframe,
          limit,
          feed: 'iex' // Explicitly use IEX feed
        });

        const barArray = [];
        for await (const bar of barsIterator) {
          barArray.push(bar);
        }
        return barArray;
      });

      return bars || [];
    } catch (error) {
      console.error(`Error fetching bars for ${symbol}:`, error);
      return [];
    }
  }

  async calculateORB(symbol: string): Promise<ORBData | null> {
    try {
      const bars = await this.getBars(symbol, '5Min', 5);

      if (bars.length < 3) {
        return null;
      }

      // Calculate opening range (first 15 minutes = 3 bars of 5min each)
      const openingRangeBars = bars.slice(0, 3);
      const openingRangeHigh = Math.max(...openingRangeBars.map(b => b.HighPrice));
      const openingRangeLow = Math.min(...openingRangeBars.map(b => b.LowPrice));

      const latestBar = bars[bars.length - 1];
      const currentPrice = latestBar.ClosePrice;

      // Determine breakout type
      let breakoutType: 'BULLISH' | 'BEARISH' | 'NONE' = 'NONE';
      let breakoutPercent = 0;

      if (currentPrice > openingRangeHigh) {
        breakoutType = 'BULLISH';
        breakoutPercent = ((currentPrice - openingRangeHigh) / openingRangeHigh) * 100;
      } else if (currentPrice < openingRangeLow) {
        breakoutType = 'BEARISH';
        breakoutPercent = ((openingRangeLow - currentPrice) / openingRangeLow) * 100;
      }

      const totalVolume = bars.reduce((sum, bar) => sum + bar.Volume, 0);
      const avgVolume = totalVolume / bars.length;

      return {
        symbol,
        openingRangeHigh,
        openingRangeLow,
        currentPrice,
        breakoutType,
        breakoutPercent,
        volume: totalVolume,
        avgVolume,
        liquidity: totalVolume > 500000 ? 'HIGH' : totalVolume > 100000 ? 'MEDIUM' : 'LOW'
      };
    } catch (error) {
      console.error(`Error calculating ORB for ${symbol}:`, error);
      return null;
    }
  }

  async getActiveStocks(): Promise<string[]> {
    // Comprehensive list of liquid stocks across all price ranges
    return [
      // Small account friendly (under $10)
      'F', 'SOFI', 'NIO', 'AAL', 'SNAP', 'PLUG', 'LCID', 'RIVN', 'CCL', 'NOK',
      // Under $20
      'PLTR', 'WBD', 'VZ', 'GOLD', 'BMY', 'T', 'PFE', 'KGC', 'BAC', 'VALE',
      // Under $50
      'INTC', 'CSCO', 'ORCL', 'WFC', 'GM', 'ABBV', 'CVX', 'PEP', 'QCOM', 'TXN',
      // Under $100
      'AMD', 'SBUX', 'MU', 'DIS', 'AXP', 'CRM', 'PYPL', 'SHOP', 'SQ', 'ADBE',
      // Under $200
      'UBER', 'COIN', 'BABA', 'NFLX', 'IBM', 'DHR', 'LLY', 'BA', 'UNH', 'CAT',
      // Under $500
      'TSLA', 'MA', 'V', 'JPM', 'JNJ', 'WMT', 'PG', 'HD', 'CVS', 'MRK',
      // Higher priced but accessible
      'NVDA', 'AMZN', 'META', 'GOOGL', 'GOOG', 'MSFT', 'AAPL', 'AVGO', 'BRK.B', 'COST'
    ];
  }
}

export default new AlpacaService();
