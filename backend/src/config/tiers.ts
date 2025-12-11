import { AccountTier, AccountTierConfig } from '../types';

export const TIER_CONFIGS: Record<AccountTier, AccountTierConfig> = {
  [AccountTier.SMALL]: {
    tier: AccountTier.SMALL,
    minBalance: 0,
    maxBalance: 5000,
    maxStockPrice: 250, // Allows buying 20+ shares with $5k
    minShares: 20,
    averageAccountSize: 5000, // Average account size for risk calculation
    riskPercentage: 0.015 // 1.5% risk per trade
  },
  [AccountTier.MEDIUM]: {
    tier: AccountTier.MEDIUM,
    minBalance: 5000,
    maxBalance: 50000,
    maxStockPrice: 2500, // Allows buying 20+ shares with $50k
    minShares: 20,
    averageAccountSize: 25000, // Average account size for risk calculation
    riskPercentage: 0.015 // 1.5% risk per trade
  },
  [AccountTier.LARGE]: {
    tier: AccountTier.LARGE,
    minBalance: 50000,
    maxBalance: Infinity,
    maxStockPrice: Infinity,
    minShares: 10, // More flexible for large accounts
    averageAccountSize: 50000, // Average account size for risk calculation
    riskPercentage: 0.015 // 1.5% risk per trade
  }
};

export const MIN_LIQUIDITY_VOLUME = 100000; // Minimum daily volume
export const ORB_TIMEFRAME_MINUTES = 15; // Opening range duration
export const BREAKOUT_THRESHOLD = 0.5; // Minimum % breakout to consider
