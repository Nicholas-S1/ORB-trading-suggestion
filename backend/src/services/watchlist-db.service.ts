import { PrismaClient } from '@prisma/client';
import { AccountTier, TradingSuggestion } from '../types';

const prisma = new PrismaClient();

interface WatchlistItemDB {
  id: string;
  userId: string;
  symbol: string;
  tier: string;
  price: number;
  suggestedShares: number;
  totalCost: number;
  openingRangeHigh: number;
  openingRangeLow: number;
  currentPrice: number;
  breakoutType: string;
  breakoutPercent: number;
  volume: number;
  avgVolume: number;
  liquidity: string;
  reason: string;
  addedAt: Date;
  expiresAt: Date;
}

class WatchlistDBService {
  async addToWatchlist(userId: string, suggestion: TradingSuggestion, expirationDays: number) {
    const now = new Date();
    const expiresAt = new Date(now);

    if (expirationDays === 0) {
      expiresAt.setHours(16, 0, 0, 0);
      if (expiresAt <= now) {
        expiresAt.setDate(expiresAt.getDate() + 1);
      }
    } else {
      expiresAt.setDate(expiresAt.getDate() + expirationDays);
      expiresAt.setHours(16, 0, 0, 0);
    }

    const item = await prisma.watchlistItem.create({
      data: {
        userId,
        symbol: suggestion.symbol,
        tier: suggestion.tier,
        price: suggestion.price,
        suggestedShares: suggestion.suggestedShares,
        totalCost: suggestion.totalCost,
        openingRangeHigh: suggestion.orbData.openingRangeHigh,
        openingRangeLow: suggestion.orbData.openingRangeLow,
        currentPrice: suggestion.orbData.currentPrice,
        breakoutType: suggestion.orbData.breakoutType,
        breakoutPercent: suggestion.orbData.breakoutPercent,
        volume: suggestion.orbData.volume,
        avgVolume: suggestion.orbData.avgVolume,
        liquidity: suggestion.orbData.liquidity,
        reason: suggestion.reason,
        expiresAt
      }
    });

    return this.formatWatchlistItem(item);
  }

  async getWatchlist(userId: string) {
    // First, delete expired items
    await prisma.watchlistItem.deleteMany({
      where: {
        userId,
        expiresAt: {
          lt: new Date()
        }
      }
    });

    // Then fetch remaining items
    const items = await prisma.watchlistItem.findMany({
      where: { userId },
      orderBy: { addedAt: 'desc' }
    });

    // Group by tier
    const grouped = {
      [AccountTier.SMALL]: [] as any[],
      [AccountTier.MEDIUM]: [] as any[],
      [AccountTier.LARGE]: [] as any[]
    };

    items.forEach(item => {
      const formatted = this.formatWatchlistItem(item);
      if (grouped[item.tier as AccountTier]) {
        grouped[item.tier as AccountTier].push(formatted);
      }
    });

    return grouped;
  }

  async removeFromWatchlist(userId: string, id: string) {
    const deleted = await prisma.watchlistItem.deleteMany({
      where: {
        id,
        userId // Ensure user owns this item
      }
    });

    return deleted.count > 0;
  }

  async clearExpired(userId: string) {
    const deleted = await prisma.watchlistItem.deleteMany({
      where: {
        userId,
        expiresAt: {
          lt: new Date()
        }
      }
    });

    return deleted.count;
  }

  private formatWatchlistItem(item: WatchlistItemDB) {
    return {
      id: item.id,
      suggestion: {
        symbol: item.symbol,
        price: item.price,
        suggestedShares: item.suggestedShares,
        totalCost: item.totalCost,
        orbData: {
          symbol: item.symbol,
          openingRangeHigh: item.openingRangeHigh,
          openingRangeLow: item.openingRangeLow,
          currentPrice: item.currentPrice,
          breakoutType: item.breakoutType as any,
          breakoutPercent: item.breakoutPercent,
          volume: item.volume,
          avgVolume: item.avgVolume,
          liquidity: item.liquidity as any
        },
        reason: item.reason,
        tier: item.tier as AccountTier
      },
      addedAt: item.addedAt.toISOString(),
      expiresAt: item.expiresAt.toISOString(),
      tier: item.tier as AccountTier
    };
  }
}

export default new WatchlistDBService();
