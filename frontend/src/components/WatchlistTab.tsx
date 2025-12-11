import React, { useState, useEffect } from 'react';
import { AccountTier } from '../types';
import { watchlistService, WatchlistItem } from '../services/watchlist';

interface GroupedWatchlistItem {
  symbol: string;
  items: WatchlistItem[];
}

export const WatchlistTab: React.FC = () => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const tierLabels = {
    [AccountTier.SMALL]: 'Small',
    [AccountTier.MEDIUM]: 'Medium',
    [AccountTier.LARGE]: 'Large'
  };

  const tierColors = {
    [AccountTier.SMALL]: 'bg-blue-500',
    [AccountTier.MEDIUM]: 'bg-green-500',
    [AccountTier.LARGE]: 'bg-purple-500'
  };

  const loadWatchlist = async () => {
    setLoading(true);
    try {
      const data = await watchlistService.getWatchlist();
      setWatchlist(data);
    } catch (error) {
      console.error('Failed to load watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await watchlistService.removeFromWatchlist(id);
      await loadWatchlist();
    } catch (error) {
      console.error('Failed to remove from watchlist:', error);
    }
  };

  useEffect(() => {
    loadWatchlist();
    // Refresh every minute to update expiration status
    const interval = setInterval(loadWatchlist, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatExpirationTime = (expiresAt: string): string => {
    const expires = new Date(expiresAt);
    const now = new Date();
    const diffMs = expires.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffMs < 0) return 'Expired';
    if (diffHours < 1) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h ${diffMins}m`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ${diffHours % 24}h`;
  };

  // Group watchlist items by symbol
  const groupedWatchlist: GroupedWatchlistItem[] = [];
  const symbolMap = new Map<string, WatchlistItem[]>();

  watchlist.forEach(item => {
    if (!symbolMap.has(item.suggestion.symbol)) {
      symbolMap.set(item.suggestion.symbol, []);
    }
    symbolMap.get(item.suggestion.symbol)!.push(item);
  });

  symbolMap.forEach((items, symbol) => {
    groupedWatchlist.push({ symbol, items });
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-4">Your Watchlist</h2>

        <button
          onClick={loadWatchlist}
          disabled={loading}
          className="px-4 py-2 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 disabled:bg-gray-400 transition-colors"
        >
          {loading ? 'Refreshing...' : 'Refresh Watchlist'}
        </button>
      </div>

      <div className="bg-white/95 backdrop-blur rounded-xl shadow-2xl p-6 min-h-[400px]">
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading watchlist...</p>
          </div>
        )}

        {!loading && watchlist.length === 0 && (
          <div className="text-center py-16">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No stocks in your watchlist
            </h3>
            <p className="text-gray-600">
              Add stocks from the suggestions tabs using the "Add to Watchlist" button
            </p>
          </div>
        )}

        {!loading && groupedWatchlist.length > 0 && (
          <div className="space-y-6">
            {groupedWatchlist.map((group) => (
              <div key={group.symbol} className="border-2 border-gray-200 rounded-xl p-4 bg-white">
                {/* Stock Symbol Header */}
                <div className="mb-3">
                  <h3 className="text-2xl font-bold text-gray-900">{group.symbol}</h3>
                  <div className="flex gap-2 mt-2">
                    {group.items.map(item => (
                      <span
                        key={item.id}
                        className={`px-3 py-1 ${tierColors[item.tier]} text-white text-xs font-bold rounded-full`}
                      >
                        {tierLabels[item.tier]} Account
                      </span>
                    ))}
                  </div>
                </div>

                {/* Display each tier variation */}
                <div className="space-y-4">
                  {group.items.map((item, index) => (
                    <div key={item.id} className="border-l-4 border-gray-300 pl-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className={`inline-block px-3 py-1 ${tierColors[item.tier]} text-white text-sm font-bold rounded`}>
                          {tierLabels[item.tier]} Account Setup
                        </div>
                      </div>

                      {/* Tier-specific suggestion details */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500 font-semibold">Price:</span>
                            <span className="ml-2 text-gray-900 font-bold">${item.suggestion.price.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 font-semibold">Shares:</span>
                            <span className="ml-2 text-gray-900 font-bold">{item.suggestion.suggestedShares}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 font-semibold">Total Cost:</span>
                            <span className="ml-2 text-gray-900 font-bold">${item.suggestion.totalCost.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 font-semibold">Breakout:</span>
                            <span className={`ml-2 font-bold ${
                              item.suggestion.orbData.breakoutType === 'BULLISH' ? 'text-green-600' :
                              item.suggestion.orbData.breakoutType === 'BEARISH' ? 'text-red-600' :
                              'text-gray-600'
                            }`}>
                              {item.suggestion.orbData.breakoutType}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500 font-semibold">Opening Range:</span>
                            <div className="text-gray-900">
                              ${item.suggestion.orbData.openingRangeLow.toFixed(2)} - ${item.suggestion.orbData.openingRangeHigh.toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500 font-semibold">Current Price:</span>
                            <div className="text-gray-900 font-bold">${item.suggestion.orbData.currentPrice.toFixed(2)}</div>
                          </div>
                          <div>
                            <span className="text-gray-500 font-semibold">Liquidity:</span>
                            <div className="text-gray-900">{item.suggestion.orbData.liquidity}</div>
                          </div>
                        </div>

                        <div className="mt-3 text-sm">
                          <span className="text-gray-500 font-semibold">Reason:</span>
                          <div className="text-gray-900 mt-1">{item.suggestion.reason}</div>
                        </div>
                      </div>

                      {/* Expiration and Remove Button */}
                      <div className="flex justify-between items-center bg-orange-50 p-3 rounded-lg border-l-4 border-orange-400">
                        <div className="flex items-center gap-4">
                          <div>
                            <span className="text-xs text-gray-500 font-semibold">Expires in:</span>
                            <span className="ml-2 text-sm font-bold text-orange-600">
                              {formatExpirationTime(item.expiresAt)}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Added:</span>
                            <span className="ml-2 text-sm">
                              {new Date(item.addedAt).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemove(item.id)}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
