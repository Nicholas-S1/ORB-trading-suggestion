import yahooFinance from 'yahoo-finance2';

class YahooFinanceService {
  async getStockInfo(symbol: string) {
    try {
      const quote = await yahooFinance.quote(symbol);
      return {
        symbol,
        marketCap: quote.marketCap,
        avgVolume: quote.averageDailyVolume10Day || quote.averageDailyVolume3Month,
        fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
      };
    } catch (error) {
      console.error(`Error fetching Yahoo Finance data for ${symbol}:`, error);
      return null;
    }
  }

  async isLiquid(symbol: string, minVolume: number = 100000): Promise<boolean> {
    try {
      const info = await this.getStockInfo(symbol);
      return info ? (info.avgVolume || 0) >= minVolume : false;
    } catch (error) {
      return false;
    }
  }
}

export default new YahooFinanceService();
