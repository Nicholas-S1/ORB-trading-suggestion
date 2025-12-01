import Alpaca from '@alpacahq/alpaca-trade-api';
import { StockData, ORBData } from '../types';

class AlpacaService {
  private alpaca: any;
  private requestDelay = 200; // 200ms delay between requests to avoid rate limits

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

  async getStockQuote(symbol: string): Promise<StockData | null> {
    try {
      await this.delay(this.requestDelay); // Rate limiting

      const snapshot = await this.alpaca.getSnapshot(symbol);

      if (!snapshot || !snapshot.latestTrade) {
        return null;
      }

      return {
        symbol,
        price: snapshot.latestTrade.p || 0,
        volume: snapshot.dailyBar?.v || snapshot.minuteBar?.v || 0,
        change: snapshot.dailyBar?.c - snapshot.dailyBar?.o || 0,
        changePercent: ((snapshot.dailyBar?.c - snapshot.dailyBar?.o) / snapshot.dailyBar?.o * 100) || 0,
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
      start.setDate(start.getDate() - 1); // Get data from yesterday to ensure we have enough

      const bars = await this.alpaca.getBarsV2(symbol, {
        start: start.toISOString(),
        end: end.toISOString(),
        timeframe,
        limit,
        feed: 'iex' // Explicitly use IEX feed
      });

      const barArray = [];
      for await (const bar of bars) {
        barArray.push(bar);
      }

      return barArray;
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
    // Reduced list to work with free tier rate limits
    // Popular liquid stocks across different price ranges
    return [
      // Small account friendly (under $50)
      'F', 'SOFI', 'PLTR', 'SNAP', 'AAL',
      // Medium price range ($50-$250)
      'AMD', 'INTC', 'UBER', 'PYPL',
      // Higher price range (still accessible)
      'TSLA', 'NVDA', 'AAPL', 'MSFT'
    ];
  }
}

export default new AlpacaService();
