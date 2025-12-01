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

    for (const symbol of activeStocks) {
      try {
        // Get stock quote
        const stockData = await alpacaService.getStockQuote(symbol);
        if (!stockData) continue;

        // Check if price is within tier range
        if (stockData.price > tierConfig.maxStockPrice) continue;
        if (stockData.price <= 0) continue;

        // Calculate how many shares can be bought
        const maxShares = Math.floor(request.accountSize / stockData.price);
        if (maxShares < tierConfig.minShares) continue;

        // Calculate ORB data
        const orbData = await alpacaService.calculateORB(symbol);
        if (!orbData) continue;

        // Check liquidity
        if (orbData.liquidity === 'LOW') continue;

        // Only suggest stocks with breakout or near breakout
        if (orbData.breakoutType === 'NONE' &&
            Math.abs(orbData.currentPrice - orbData.openingRangeHigh) / orbData.openingRangeHigh > 0.02 &&
            Math.abs(orbData.currentPrice - orbData.openingRangeLow) / orbData.openingRangeLow > 0.02) {
          continue;
        }

        // Determine suggested share quantity (use ~25% of buying power per position)
        const suggestedShares = Math.floor((request.accountSize * 0.25) / stockData.price);
        const totalCost = suggestedShares * stockData.price;

        let reason = '';
        if (orbData.breakoutType === 'BULLISH') {
          reason = `Bullish ORB breakout (+${orbData.breakoutPercent.toFixed(2)}%) with ${orbData.liquidity} liquidity`;
        } else if (orbData.breakoutType === 'BEARISH') {
          reason = `Bearish ORB breakdown (-${orbData.breakoutPercent.toFixed(2)}%) with ${orbData.liquidity} liquidity`;
        } else {
          const distToHigh = ((orbData.openingRangeHigh - orbData.currentPrice) / orbData.currentPrice * 100);
          const distToLow = ((orbData.currentPrice - orbData.openingRangeLow) / orbData.currentPrice * 100);

          if (distToHigh < distToLow && distToHigh < 2) {
            reason = `Near ORB high resistance ($${orbData.openingRangeHigh.toFixed(2)}), watching for breakout`;
          } else if (distToLow < 2) {
            reason = `Near ORB low support ($${orbData.openingRangeLow.toFixed(2)}), watching for breakdown`;
          } else {
            continue; // Too far from opening range
          }
        }

        suggestions.push({
          symbol,
          price: stockData.price,
          suggestedShares,
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
}

export default new SuggestionService();
