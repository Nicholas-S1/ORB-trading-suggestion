export enum AccountTier {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE'
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

export interface SuggestionResponse {
  tier: AccountTier;
  accountSize: number;
  suggestions: TradingSuggestion[];
  timestamp: string;
}
