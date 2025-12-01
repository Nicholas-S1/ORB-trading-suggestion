import axios from 'axios';
import { TradingSuggestion, AccountTier } from '../types';

const API_BASE_URL = '/api/watchlist';

export interface WatchlistItem {
  id: string;
  suggestion: TradingSuggestion;
  addedAt: string;
  expiresAt: string;
  tier: AccountTier;
}

export interface WatchlistData {
  SMALL: WatchlistItem[];
  MEDIUM: WatchlistItem[];
  LARGE: WatchlistItem[];
}

export const watchlistService = {
  async getWatchlist(): Promise<WatchlistData> {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  },

  async addToWatchlist(suggestion: TradingSuggestion, expirationDays: number): Promise<WatchlistItem> {
    const response = await axios.post(`${API_BASE_URL}/add`, {
      suggestion,
      expirationDays
    });
    return response.data.item;
  },

  async removeFromWatchlist(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/${id}`);
  },

  async clearExpired(): Promise<number> {
    const response = await axios.post(`${API_BASE_URL}/clear-expired`);
    return response.data.removedCount;
  }
};
