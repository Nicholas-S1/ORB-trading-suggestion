import React from 'react';
import { AccountTier } from '../types';

interface AccountTierSelectorProps {
  accountSize: number;
  onAccountSizeChange: (size: number) => void;
  currentTier: AccountTier;
}

const tierInfo = {
  [AccountTier.SMALL]: {
    name: 'Small Account',
    range: '$0 - $5,000',
    description: 'Stocks under $250 • 20+ shares minimum',
    color: 'bg-blue-100 border-blue-500 text-blue-800'
  },
  [AccountTier.MEDIUM]: {
    name: 'Medium Account',
    range: '$5,000 - $50,000',
    description: 'Stocks under $2,500 • 20+ shares minimum',
    color: 'bg-green-100 border-green-500 text-green-800'
  },
  [AccountTier.LARGE]: {
    name: 'Large Account',
    range: '$50,000+',
    description: 'All liquid stocks • 10+ shares minimum',
    color: 'bg-purple-100 border-purple-500 text-purple-800'
  }
};

export const AccountTierSelector: React.FC<AccountTierSelectorProps> = ({
  accountSize,
  onAccountSizeChange,
  currentTier
}) => {
  const info = tierInfo[currentTier];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">Account Size</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Account Balance
        </label>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-700">$</span>
          <input
            type="number"
            min="0"
            step="100"
            value={accountSize}
            onChange={(e) => onAccountSizeChange(Number(e.target.value))}
            className="flex-1 px-4 py-2 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter account size"
          />
        </div>
      </div>

      <div className={`border-2 rounded-lg p-4 ${info.color}`}>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold">{info.name}</h3>
          <span className="text-sm font-semibold">{info.range}</span>
        </div>
        <p className="text-sm">{info.description}</p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {Object.entries(tierInfo).map(([tier, data]) => (
          <button
            key={tier}
            onClick={() => {
              if (tier === AccountTier.SMALL) onAccountSizeChange(2500);
              else if (tier === AccountTier.MEDIUM) onAccountSizeChange(25000);
              else onAccountSizeChange(100000);
            }}
            className={`px-3 py-2 text-xs rounded border ${
              currentTier === tier
                ? 'bg-blue-500 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {data.name}
          </button>
        ))}
      </div>
    </div>
  );
};
