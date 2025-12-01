import { AccountTier, TradingSuggestion } from '../types';
import fs from 'fs';
import path from 'path';

interface WatchlistItem {
  id: string;
  suggestion: TradingSuggestion;
  addedAt: string;
  expiresAt: string;
  tier: AccountTier;
}

interface WatchlistData {
  [AccountTier.SMALL]: WatchlistItem[];
  [AccountTier.MEDIUM]: WatchlistItem[];
  [AccountTier.LARGE]: WatchlistItem[];
}

class WatchlistService {
  private watchlistFile = path.join(__dirname, '../../data/watchlist.json');

  constructor() {
    // Create data directory if it doesn't exist
    const dataDir = path.dirname(this.watchlistFile);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Initialize watchlist file if it doesn't exist
    if (!fs.existsSync(this.watchlistFile)) {
      this.saveWatchlist({
        [AccountTier.SMALL]: [],
        [AccountTier.MEDIUM]: [],
        [AccountTier.LARGE]: []
      });
    }
  }

  private loadWatchlist(): WatchlistData {
    try {
      const data = fs.readFileSync(this.watchlistFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading watchlist:', error);
      return {
        [AccountTier.SMALL]: [],
        [AccountTier.MEDIUM]: [],
        [AccountTier.LARGE]: []
      };
    }
  }

  private saveWatchlist(data: WatchlistData): void {
    fs.writeFileSync(this.watchlistFile, JSON.stringify(data, null, 2));
  }

  private cleanExpired(watchlist: WatchlistData): WatchlistData {
    const now = new Date().toISOString();

    return {
      [AccountTier.SMALL]: watchlist[AccountTier.SMALL].filter(item => item.expiresAt > now),
      [AccountTier.MEDIUM]: watchlist[AccountTier.MEDIUM].filter(item => item.expiresAt > now),
      [AccountTier.LARGE]: watchlist[AccountTier.LARGE].filter(item => item.expiresAt > now)
    };
  }

  addToWatchlist(suggestion: TradingSuggestion, expirationDays: number): WatchlistItem {
    const watchlist = this.loadWatchlist();

    const now = new Date();
    const expiresAt = new Date(now);

    // Calculate expiration based on days
    if (expirationDays === 0) {
      // End of day (4 PM ET)
      expiresAt.setHours(16, 0, 0, 0);
      if (expiresAt <= now) {
        // If already past 4 PM, set to tomorrow 4 PM
        expiresAt.setDate(expiresAt.getDate() + 1);
      }
    } else {
      expiresAt.setDate(expiresAt.getDate() + expirationDays);
      expiresAt.setHours(16, 0, 0, 0); // Expire at 4 PM ET
    }

    const item: WatchlistItem = {
      id: `${suggestion.symbol}-${Date.now()}`,
      suggestion,
      addedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      tier: suggestion.tier
    };

    watchlist[suggestion.tier].push(item);
    this.saveWatchlist(watchlist);

    return item;
  }

  getWatchlist(): WatchlistData {
    let watchlist = this.loadWatchlist();
    watchlist = this.cleanExpired(watchlist);
    this.saveWatchlist(watchlist);
    return watchlist;
  }

  removeFromWatchlist(id: string): boolean {
    const watchlist = this.loadWatchlist();
    let found = false;

    for (const tier of [AccountTier.SMALL, AccountTier.MEDIUM, AccountTier.LARGE]) {
      const index = watchlist[tier].findIndex(item => item.id === id);
      if (index !== -1) {
        watchlist[tier].splice(index, 1);
        found = true;
        break;
      }
    }

    if (found) {
      this.saveWatchlist(watchlist);
    }

    return found;
  }

  clearExpired(): number {
    const watchlist = this.loadWatchlist();
    const beforeCount =
      watchlist[AccountTier.SMALL].length +
      watchlist[AccountTier.MEDIUM].length +
      watchlist[AccountTier.LARGE].length;

    const cleaned = this.cleanExpired(watchlist);
    this.saveWatchlist(cleaned);

    const afterCount =
      cleaned[AccountTier.SMALL].length +
      cleaned[AccountTier.MEDIUM].length +
      cleaned[AccountTier.LARGE].length;

    return beforeCount - afterCount;
  }
}

export default new WatchlistService();
