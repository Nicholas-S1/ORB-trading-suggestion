import React, { useState } from 'react';
import { TradingSuggestion } from '../types';
import { watchlistService } from '../services/watchlist';

interface SuggestionCardProps {
  suggestion: TradingSuggestion;
  rank?: number;
  showWatchlistButton?: boolean;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  rank,
  showWatchlistButton = true
}) => {
  const { symbol, price, suggestedShares, totalCost, orbData, reason } = suggestion;
  const [showExpirationMenu, setShowExpirationMenu] = useState(false);
  const [adding, setAdding] = useState(false);

  const breakoutColor =
    orbData.breakoutType === 'BULLISH' ? 'text-green-600' :
    orbData.breakoutType === 'BEARISH' ? 'text-red-600' :
    'text-gray-600';

  const liquidityColor =
    orbData.liquidity === 'HIGH' ? 'bg-green-100 text-green-800' :
    orbData.liquidity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
    'bg-gray-100 text-gray-800';

  const expirationOptions = [
    { label: 'End of Day', days: 0 },
    { label: '1 Day', days: 1 },
    { label: '2 Days', days: 2 },
    { label: '3 Days', days: 3 },
    { label: '1 Week', days: 7 }
  ];

  const handleAddToWatchlist = async (days: number) => {
    setAdding(true);
    try {
      await watchlistService.addToWatchlist(suggestion, days);
      setShowExpirationMenu(false);
      alert(`${symbol} added to watchlist!`);
    } catch (error) {
      console.error('Failed to add to watchlist:', error);
      alert('Failed to add to watchlist. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-white to-gray-50 rounded-lg shadow-md p-5 hover:shadow-xl transition-all border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          {rank && (
            <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
              {rank}
            </div>
          )}
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{symbol}</h3>
            <p className="text-sm text-gray-500">Current Price: ${price.toFixed(2)}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${liquidityColor}`}>
          {orbData.liquidity} Volume
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded">
        <div>
          <p className="text-xs text-gray-500">Suggested Shares</p>
          <p className="text-lg font-bold text-gray-900">{suggestedShares}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Total Cost</p>
          <p className="text-lg font-bold text-gray-900">${totalCost.toFixed(2)}</p>
        </div>
      </div>

      <div className="mb-4 p-3 bg-blue-50 rounded">
        <p className="text-xs text-gray-600 font-semibold mb-1">Opening Range Breakout (ORB)</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">High: </span>
            <span className="font-semibold">${orbData.openingRangeHigh.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-gray-600">Low: </span>
            <span className="font-semibold">${orbData.openingRangeLow.toFixed(2)}</span>
          </div>
        </div>
        {orbData.breakoutType !== 'NONE' && (
          <div className="mt-2">
            <span className={`font-bold ${breakoutColor}`}>
              {orbData.breakoutType} Breakout: {orbData.breakoutPercent.toFixed(2)}%
            </span>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-gray-200">
        <p className="text-sm text-gray-700">{reason}</p>
      </div>

      {showWatchlistButton && (
        <div className="mt-4 relative">
          <button
            onClick={() => setShowExpirationMenu(!showExpirationMenu)}
            disabled={adding}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            {adding ? 'Adding...' : 'Add to Watchlist'}
          </button>

          {showExpirationMenu && (
            <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border-2 border-blue-500 rounded-lg shadow-xl z-10 overflow-hidden">
              <div className="bg-blue-500 text-white px-4 py-2 font-semibold text-sm">
                Select Expiration
              </div>
              {expirationOptions.map((option) => (
                <button
                  key={option.days}
                  onClick={() => handleAddToWatchlist(option.days)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <span className="font-medium text-gray-900">{option.label}</span>
                  {option.days === 0 && (
                    <span className="ml-2 text-xs text-gray-500">(4:00 PM today)</span>
                  )}
                </button>
              ))}
              <button
                onClick={() => setShowExpirationMenu(false)}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
