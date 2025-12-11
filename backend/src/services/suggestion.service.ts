import { AccountTier, TradingSuggestion, SuggestionRequest, SuggestionResponse } from '../types';
import { TIER_CONFIGS, MIN_LIQUIDITY_VOLUME, BREAKOUT_THRESHOLD } from '../config/tiers';
import alpacaService from './alpaca.service';
import yahooService from './yahoo.service';

class SuggestionService {
  private determineAccountTier(accountSize: number): AccountTier {
    if (accountSize < 5000) return AccountTier.SMALL;
    if (accountSize < 50000) return AccountTier.MEDIUM;
    return AccountTier.LARGE;
  }

  async generateSuggestions(request: SuggestionRequest): Promise<SuggestionResponse> {
    const tier = request.tier || this.determineAccountTier(request.accountSize);
    const tierConfig = TIER_CONFIGS[tier];

    const suggestions: TradingSuggestion[] = [];
    const activeStocks = await alpacaService.getActiveStocks();

    console.log(`Scanning ${activeStocks.length} stocks for ${tier} tier...`);

    for (const symbol of activeStocks) {
      try {
        // Get stock quote
        const stockData = await alpacaService.getStockQuote(symbol);
        if (!stockData) {
          console.log(`${symbol}: No stock data available`);
          continue;
        }

        // Check if price is within tier range
        if (stockData.price > tierConfig.maxStockPrice) {
          console.log(`${symbol}: Price $${stockData.price} exceeds tier max $${tierConfig.maxStockPrice}`);
          continue;
        }
        if (stockData.price <= 0) continue;

        // Calculate how many shares can be bought
        const maxShares = Math.floor(request.accountSize / stockData.price);
        if (maxShares < tierConfig.minShares) continue;

        // Calculate ORB data
        const orbData = await alpacaService.calculateORB(symbol);
        if (!orbData) {
          console.log(`${symbol}: No ORB data available`);
          continue;
        }

        // More lenient liquidity check - accept MEDIUM and HIGH
        // (Skip only LOW liquidity during market hours, accept all outside hours)
        const isMarketHours = this.isMarketHours();
        if (isMarketHours && orbData.liquidity === 'LOW') {
          console.log(`${symbol}: Low liquidity during market hours`);
          continue;
        }

        // More lenient distance threshold - 5% instead of 2%
        const distToHigh = Math.abs(orbData.currentPrice - orbData.openingRangeHigh) / orbData.openingRangeHigh;
        const distToLow = Math.abs(orbData.currentPrice - orbData.openingRangeLow) / orbData.openingRangeLow;

        // Only suggest stocks with breakout or within 5% of opening range
        if (orbData.breakoutType === 'NONE' && distToHigh > 0.05 && distToLow > 0.05) {
          console.log(`${symbol}: Too far from ORB range (${(Math.min(distToHigh, distToLow) * 100).toFixed(1)}%)`);
          continue;
        }

        // Risk-based position sizing
        // Risk amount = average account size × risk percentage (1.5%)
        const riskAmount = tierConfig.averageAccountSize * tierConfig.riskPercentage;

        // Risk per share = ORB range (stop loss distance)
        const orbRange = orbData.openingRangeHigh - orbData.openingRangeLow;

        // Calculate shares based on risk
        // If ORB range is too small, use minimum viable range to avoid huge positions
        const minRange = stockData.price * 0.005; // 0.5% minimum range
        const effectiveRange = Math.max(orbRange, minRange);

        const suggestedShares = Math.floor(riskAmount / effectiveRange);

        // Ensure we meet minimum shares requirement
        const finalShares = Math.max(suggestedShares, tierConfig.minShares);

        const totalCost = finalShares * stockData.price;

        let reason = '';
        if (orbData.breakoutType === 'BULLISH') {
          reason = `Bullish ORB breakout (+${orbData.breakoutPercent.toFixed(2)}%) with ${orbData.liquidity} liquidity`;
        } else if (orbData.breakoutType === 'BEARISH') {
          reason = `Bearish ORB breakdown (-${orbData.breakoutPercent.toFixed(2)}%) with ${orbData.liquidity} liquidity`;
        } else {
          const distToHigh = ((orbData.openingRangeHigh - orbData.currentPrice) / orbData.currentPrice * 100);
          const distToLow = ((orbData.currentPrice - orbData.openingRangeLow) / orbData.currentPrice * 100);

          if (distToHigh < distToLow && distToHigh < 5) {
            reason = `Near ORB high resistance ($${orbData.openingRangeHigh.toFixed(2)}), watching for breakout`;
          } else if (distToLow < 5) {
            reason = `Near ORB low support ($${orbData.openingRangeLow.toFixed(2)}), watching for breakdown`;
          } else {
            reason = `Consolidating within range ($${orbData.openingRangeLow.toFixed(2)} - $${orbData.openingRangeHigh.toFixed(2)})`;
          }
        }

        console.log(`${symbol}: ✓ Added to suggestions (${orbData.breakoutType}, ${orbData.liquidity} liquidity)`);

        suggestions.push({
          symbol,
          price: stockData.price,
          suggestedShares: finalShares,
          totalCost,
          orbData,
          reason,
          tier
        });


      } catch (error) {
        console.error(`Error processing ${symbol}:`, error);
        continue;
      }
    }

    console.log(`Found ${suggestions.length} total suggestions for ${tier} tier`);

    // Sort by breakout strength
    suggestions.sort((a, b) => {
      const scoreA = Math.abs(a.orbData.breakoutPercent) * (a.orbData.liquidity === 'HIGH' ? 2 : 1);
      const scoreB = Math.abs(b.orbData.breakoutPercent) * (b.orbData.liquidity === 'HIGH' ? 2 : 1);
      return scoreB - scoreA;
    });

    // Return top 10 suggestions
    return {
      tier,
      accountSize: request.accountSize,
      suggestions: suggestions.slice(0, 10),
      timestamp: new Date().toISOString()
    };
  }

  private isMarketHours(): boolean {
    const now = new Date();
    const utcHours = now.getUTCHours();
    const utcMinutes = now.getUTCMinutes();

    // Market hours: 9:30 AM - 4:00 PM ET = 14:30 - 21:00 UTC
    const currentUTCTime = utcHours * 60 + utcMinutes;
    const marketOpen = 14 * 60 + 30; // 14:30 UTC
    const marketClose = 21 * 60; // 21:00 UTC

    const dayOfWeek = now.getUTCDay();
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;

    return isWeekday && currentUTCTime >= marketOpen && currentUTCTime < marketClose;
  }
}

export default new SuggestionService();
