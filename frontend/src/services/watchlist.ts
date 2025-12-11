import axios from 'axios';
import { TradingSuggestion, AccountTier } from '../types';

const API_BASE_URL = '/api/watchlist';

// Create axios instance with auth interceptor
const axiosInstance = axios.create();

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface WatchlistItem {
  id: string;
  suggestion: TradingSuggestion;
  addedAt: string;
  expiresAt: string;
  tier: AccountTier;
}

export const watchlistService = {
  async getWatchlist(): Promise<WatchlistItem[]> {
    const response = await axiosInstance.get(API_BASE_URL);
    return response.data;
  },

  async addToWatchlist(suggestion: TradingSuggestion, expirationDays: number): Promise<WatchlistItem> {
    const response = await axiosInstance.post(`${API_BASE_URL}/add`, {
      suggestion,
      expirationDays
    });
    return response.data.item;
  },

  async removeFromWatchlist(id: string): Promise<void> {
    await axiosInstance.delete(`${API_BASE_URL}/${id}`);
  },

  async clearExpired(): Promise<number> {
    const response = await axiosInstance.post(`${API_BASE_URL}/clear-expired`);
    return response.data.removedCount;
  }
};
