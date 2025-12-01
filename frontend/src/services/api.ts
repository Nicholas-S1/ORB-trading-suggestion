import axios from 'axios';
import { SuggestionResponse, AccountTier } from '../types';

const API_BASE_URL = '/api';

export const apiService = {
  async getSuggestions(accountSize: number, tier?: AccountTier): Promise<SuggestionResponse> {
    const response = await axios.post(`${API_BASE_URL}/suggestions/generate`, {
      accountSize,
      tier
    });
    return response.data;
  },

  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      return response.data.status === 'ok';
    } catch {
      return false;
    }
  }
};
