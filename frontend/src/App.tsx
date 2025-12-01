import React, { useState, useEffect } from 'react';
import { SuggestionCard } from './components/SuggestionCard';
import { ORBInfoBar } from './components/ORBInfoBar';
import { WatchlistTab } from './components/WatchlistTab';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { apiService } from './services/api';
import { AccountTier, SuggestionResponse } from './types';
import { useAuth } from './contexts/AuthContext';

type TabType = AccountTier | 'WATCHLIST';

type TierData = {
  [key in AccountTier]: SuggestionResponse | null;
};

function App() {
  const { isAuthenticated, isLoading: authLoading, user, logout } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>(AccountTier.SMALL);
  const [tierData, setTierData] = useState<TierData>({
    [AccountTier.SMALL]: null,
    [AccountTier.MEDIUM]: null,
    [AccountTier.LARGE]: null,
  });
  const [loading, setLoading] = useState<{ [key in AccountTier]: boolean }>({
    [AccountTier.SMALL]: false,
    [AccountTier.MEDIUM]: false,
    [AccountTier.LARGE]: false,
  });
  const [error, setError] = useState<string | null>(null);

  const tierConfigs = {
    [AccountTier.SMALL]: {
      name: 'Small Accounts',
      range: '$0 - $5,000',
      accountSize: 2500,
      color: 'border-blue-500 bg-blue-500',
      inactiveColor: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    },
    [AccountTier.MEDIUM]: {
      name: 'Medium Accounts',
      range: '$5,000 - $50,000',
      accountSize: 25000,
      color: 'border-green-500 bg-green-500',
      inactiveColor: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    },
    [AccountTier.LARGE]: {
      name: 'Large Accounts',
      range: '$50,000+',
      accountSize: 100000,
      color: 'border-purple-500 bg-purple-500',
      inactiveColor: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    },
  };

  const fetchSuggestionsForTier = async (tier: AccountTier) => {
    setLoading(prev => ({ ...prev, [tier]: true }));
    setError(null);

    try {
      const result = await apiService.getSuggestions(tierConfigs[tier].accountSize, tier);
      setTierData(prev => ({
        ...prev,
        [tier]: {
          ...result,
          suggestions: result.suggestions.slice(0, 7) // Top 7 only
        }
      }));
    } catch (err) {
      setError('Failed to fetch suggestions. Make sure the backend is running and Alpaca API keys are configured.');
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, [tier]: false }));
    }
  };

  const fetchAllSuggestions = async () => {
    await Promise.all([
      fetchSuggestionsForTier(AccountTier.SMALL),
      fetchSuggestionsForTier(AccountTier.MEDIUM),
      fetchSuggestionsForTier(AccountTier.LARGE),
    ]);
  };

  useEffect(() => {
    // Fetch suggestions for the active tab on mount
    if (!tierData[activeTab]) {
      fetchSuggestionsForTier(activeTab);
    }
  }, [activeTab]);

  const currentData = tierData[activeTab];
  const isLoading = loading[activeTab];

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
          <p className="mt-4 text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Show Login/Register if not authenticated
  if (!isAuthenticated) {
    if (showRegister) {
      return <Register onSwitchToLogin={() => setShowRegister(false)} />;
    }
    return <Login onSwitchToRegister={() => setShowRegister(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex flex-col">
      <div className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <header className="text-center mb-8">
          <div className="flex justify-end mb-4">
            <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-2 text-white flex items-center gap-4">
              <span>Welcome, {user?.name || user?.email}</span>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded transition-colors text-sm font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-3">
            ORB Trading Suggestions
          </h1>
          <p className="text-blue-200 text-lg">
            Opening Range Breakout - Top 7 Stocks by Account Size
          </p>
        </header>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 justify-center flex-wrap">
          {Object.entries(tierConfigs).map(([tier, config]) => (
            <button
              key={tier}
              onClick={() => setActiveTab(tier as AccountTier)}
              className={`px-8 py-4 rounded-lg font-bold text-lg transition-all border-2 ${
                activeTab === tier
                  ? `${config.color} text-white shadow-lg scale-105`
                  : config.inactiveColor
              }`}
            >
              <div className="text-left">
                <div>{config.name}</div>
                <div className="text-sm font-normal opacity-80">{config.range}</div>
              </div>
            </button>
          ))}

          {/* Watchlist Tab */}
          <button
            onClick={() => setActiveTab('WATCHLIST')}
            className={`px-8 py-4 rounded-lg font-bold text-lg transition-all border-2 ${
              activeTab === 'WATCHLIST'
                ? 'border-orange-500 bg-orange-500 text-white shadow-lg scale-105'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span>Watchlist</span>
            </div>
          </button>
        </div>

        {/* Refresh Button - Only show for suggestion tabs */}
        {activeTab !== 'WATCHLIST' && (
          <div className="flex justify-center mb-6">
            <button
              onClick={() => fetchSuggestionsForTier(activeTab as AccountTier)}
              disabled={isLoading}
              className="px-6 py-2 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 disabled:bg-gray-400 disabled:text-gray-600 transition-colors shadow-md"
            >
              {isLoading ? 'Loading...' : 'Refresh Suggestions'}
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-500 text-white px-6 py-4 rounded-lg mb-6 text-center shadow-lg">
            {error}
          </div>
        )}

        {/* Content Area */}
        {activeTab === 'WATCHLIST' ? (
          <WatchlistTab />
        ) : (
          <div className="bg-white/95 backdrop-blur rounded-xl shadow-2xl p-6 min-h-[600px]">
            {isLoading && (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
              <p className="mt-6 text-gray-600 text-lg">Scanning market for best ORB opportunities...</p>
            </div>
          )}

          {!isLoading && currentData && (
            <>
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Top {currentData.suggestions.length} ORB Setups
                  </h2>
                  <p className="text-sm text-gray-500">
                    Last updated: {new Date(currentData.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              {currentData.suggestions.length === 0 ? (
                <div className="text-center py-20">
                  <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-600 text-lg">
                    No ORB setups found for this tier at the moment.
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Market conditions may not be favorable. Try refreshing in a few minutes.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {currentData.suggestions.map((suggestion, index) => (
                    <SuggestionCard
                      key={suggestion.symbol}
                      suggestion={suggestion}
                      rank={index + 1}
                    />
                  ))}
                </div>
              )}
            </>
          )}

            {!isLoading && !currentData && (
              <div className="text-center py-20">
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Ready to Discover ORB Opportunities
                </h3>
                <p className="text-gray-600">
                  Click "Refresh Suggestions" to load the top 7 ORB setups for {activeTab !== 'WATCHLIST' ? tierConfigs[activeTab as AccountTier].name.toLowerCase() : 'this tier'}.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ORB Info Bar at Bottom */}
      <ORBInfoBar />
    </div>
  );
}

export default App;
