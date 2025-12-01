import React from 'react';
import { TradingSuggestion } from '../types';

interface SuggestionCardProps {
  suggestion: TradingSuggestion;
  rank?: number;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, rank }) => {
  const { symbol, price, suggestedShares, totalCost, orbData, reason } = suggestion;

  const breakoutColor =
    orbData.breakoutType === 'BULLISH' ? 'text-green-600' :
    orbData.breakoutType === 'BEARISH' ? 'text-red-600' :
    'text-gray-600';

  const liquidityColor =
    orbData.liquidity === 'HIGH' ? 'bg-green-100 text-green-800' :
    orbData.liquidity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
    'bg-gray-100 text-gray-800';

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
    </div>
  );
};
