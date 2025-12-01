import React, { useState } from 'react';
import { AccountTierSelector } from './components/AccountTierSelector';
import { SuggestionCard } from './components/SuggestionCard';
import { apiService } from './services/api';
import { AccountTier, SuggestionResponse } from './types';

function App() {
  const [accountSize, setAccountSize] = useState(2500);
  const [suggestions, setSuggestions] = useState<SuggestionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const determineTier = (size: number): AccountTier => {
    if (size < 5000) return AccountTier.SMALL;
    if (size < 50000) return AccountTier.MEDIUM;
    return AccountTier.LARGE;
  };

  const handleGetSuggestions = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiService.getSuggestions(accountSize);
      setSuggestions(result);
    } catch (err) {
      setError('Failed to fetch suggestions. Make sure the backend is running and Alpaca API keys are configured.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentTier = determineTier(accountSize);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ORB Trading Suggestions
          </h1>
          <p className="text-gray-600">
            Opening Range Breakout strategy tailored to your account size
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <AccountTierSelector
              accountSize={accountSize}
              onAccountSizeChange={setAccountSize}
              currentTier={currentTier}
            />

            <button
              onClick={handleGetSuggestions}
              disabled={loading || accountSize <= 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md"
            >
              {loading ? 'Analyzing Market...' : 'Get Trading Suggestions'}
            </button>

            <div className="mt-6 bg-white rounded-lg shadow-md p-4">
              <h3 className="font-bold text-gray-900 mb-2">About ORB Strategy</h3>
              <p className="text-sm text-gray-600 mb-2">
                The Opening Range Breakout identifies stocks breaking above or below
                their first 15 minutes of trading range.
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Bullish: Price breaks above opening high</li>
                <li>• Bearish: Price breaks below opening low</li>
                <li>• Watch List: Price near breakout levels</li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-2">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Scanning market for opportunities...</p>
              </div>
            )}

            {suggestions && !loading && (
              <>
                <div className="mb-4 bg-white rounded-lg shadow-md p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {suggestions.suggestions.length} Suggestions Found
                      </h2>
                      <p className="text-sm text-gray-500">
                        Updated: {new Date(suggestions.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <button
                      onClick={handleGetSuggestions}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium text-gray-700"
                    >
                      Refresh
                    </button>
                  </div>
                </div>

                {suggestions.suggestions.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <p className="text-gray-600">
                      No ORB setups found at the moment. Market conditions may not be favorable.
                      Try refreshing in a few minutes.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {suggestions.suggestions.map((suggestion) => (
                      <SuggestionCard key={suggestion.symbol} suggestion={suggestion} />
                    ))}
                  </div>
                )}
              </>
            )}

            {!suggestions && !loading && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ready to Find Trading Opportunities
                </h3>
                <p className="text-gray-600">
                  Enter your account size and click "Get Trading Suggestions" to discover
                  ORB breakout opportunities tailored to your portfolio.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
