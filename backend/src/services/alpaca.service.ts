import Alpaca from '@alpacahq/alpaca-trade-api';
import { StockData, ORBData } from '../types';

class AlpacaService {
  private alpaca: any;

  constructor() {
    this.alpaca = new Alpaca({
      keyId: process.env.ALPACA_API_KEY,
      secretKey: process.env.ALPACA_SECRET_KEY,
      paper: true,
      usePolygon: false
    });
  }

  async getStockQuote(symbol: string): Promise<StockData | null> {
    try {
      const quote = await this.alpaca.getLatestTrade(symbol);
      const snapshot = await this.alpaca.getSnapshot(symbol);

      return {
        symbol,
        price: quote.Price || snapshot.latestTrade?.p || 0,
        volume: snapshot.dailyBar?.v || 0,
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
      const end = new Date();
      const start = new Date();
      start.setHours(9, 30, 0, 0); // Market open

      const bars = await this.alpaca.getBarsV2(symbol, {
        start: start.toISOString(),
        end: end.toISOString(),
        timeframe,
        limit
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
    // Popular liquid stocks across different price ranges
    return [
      // Small account friendly (under $50)
      'F', 'SOFI', 'PLTR', 'NIO', 'AAL', 'SNAP', 'VALE', 'LUMN',
      // Medium price range ($50-$250)
      'AMD', 'INTC', 'BABA', 'NFLX', 'DIS', 'PYPL', 'UBER', 'COIN',
      // Higher price range (still accessible)
      'TSLA', 'NVDA', 'AMZN', 'GOOGL', 'MSFT', 'META', 'AAPL', 'AVGO'
    ];
  }
}

export default new AlpacaService();
