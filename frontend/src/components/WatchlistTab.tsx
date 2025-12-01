import React, { useState, useEffect } from 'react';
import { AccountTier } from '../types';
import { watchlistService, WatchlistData } from '../services/watchlist';
import { SuggestionCard } from './SuggestionCard';

export const WatchlistTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<AccountTier>(AccountTier.SMALL);
  const [watchlist, setWatchlist] = useState<WatchlistData | null>(null);
  const [loading, setLoading] = useState(false);

  const tierLabels = {
    [AccountTier.SMALL]: 'Small Accounts',
    [AccountTier.MEDIUM]: 'Medium Accounts',
    [AccountTier.LARGE]: 'Large Accounts'
  };

  const tierColors = {
    [AccountTier.SMALL]: 'border-blue-500 bg-blue-500',
    [AccountTier.MEDIUM]: 'border-green-500 bg-green-500',
    [AccountTier.LARGE]: 'border-purple-500 bg-purple-500'
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

  const currentWatchlist = watchlist ? watchlist[activeSubTab] : [];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-4">Your Watchlist</h2>

        {/* Sub-tabs for tiers */}
        <div className="flex gap-3 mb-4">
          {Object.entries(tierLabels).map(([tier, label]) => (
            <button
              key={tier}
              onClick={() => setActiveSubTab(tier as AccountTier)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all border-2 ${
                activeSubTab === tier
                  ? `${tierColors[tier as AccountTier]} text-white shadow-lg`
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {label}
              {watchlist && watchlist[tier as AccountTier].length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-white/30 rounded-full text-xs">
                  {watchlist[tier as AccountTier].length}
                </span>
              )}
            </button>
          ))}
        </div>

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

        {!loading && currentWatchlist.length === 0 && (
          <div className="text-center py-16">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No stocks in your {tierLabels[activeSubTab].toLowerCase()} watchlist
            </h3>
            <p className="text-gray-600">
              Add stocks from the suggestions tabs using the "Add to Watchlist" button
            </p>
          </div>
        )}

        {!loading && currentWatchlist.length > 0 && (
          <div className="space-y-4">
            {currentWatchlist.map((item, index) => (
              <div key={item.id} className="relative">
                <SuggestionCard
                  suggestion={item.suggestion}
                  rank={index + 1}
                  showWatchlistButton={false}
                />

                <div className="mt-2 flex justify-between items-center bg-gray-50 p-3 rounded-lg border-l-4 border-orange-400">
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
        )}
      </div>
    </div>
  );
};
