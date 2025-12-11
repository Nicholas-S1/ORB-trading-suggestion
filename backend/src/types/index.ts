export enum AccountTier {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE'
}

export interface AccountTierConfig {
  tier: AccountTier;
  minBalance: number;
  maxBalance: number;
  maxStockPrice: number;
  minShares: number;
  averageAccountSize: number;
  riskPercentage: number;
}

export interface StockData {
  symbol: string;
  price: number;
  volume: number;
  change: number;
  changePercent: number;
  avgVolume?: number;
  marketCap?: number;
}

export interface ORBData {
  symbol: string;
  openingRangeHigh: number;
  openingRangeLow: number;
  currentPrice: number;
  breakoutType: 'BULLISH' | 'BEARISH' | 'NONE';
  breakoutPercent: number;
  volume: number;
  avgVolume: number;
  liquidity: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface TradingSuggestion {
  symbol: string;
  price: number;
  suggestedShares: number;
  totalCost: number;
  orbData: ORBData;
  reason: string;
  tier: AccountTier;
}

export interface SuggestionRequest {
  accountSize: number;
  tier?: AccountTier;
}

export interface SuggestionResponse {
  tier: AccountTier;
  accountSize: number;
  suggestions: TradingSuggestion[];
  timestamp: string;
}
