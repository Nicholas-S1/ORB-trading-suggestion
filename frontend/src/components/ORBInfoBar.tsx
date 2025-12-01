import React from 'react';

export const ORBInfoBar: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-6 px-4 shadow-lg">
      <div className="container mx-auto max-w-7xl">
        <h3 className="text-xl font-bold mb-3 text-center">
          📊 What is the ORB (Opening Range Breakout) Trading Method?
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
            <h4 className="font-bold text-lg mb-2">🎯 The Setup</h4>
            <p className="text-sm text-blue-100">
              The Opening Range is defined by the high and low of the first 15 minutes of trading (9:30-9:45 AM ET).
              This range acts as key support and resistance levels for the day.
            </p>
          </div>

          <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
            <h4 className="font-bold text-lg mb-2">📈 What to Look For</h4>
            <ul className="text-sm text-blue-100 space-y-1">
              <li>• <strong>Bullish Breakout:</strong> Price breaks above the opening high with volume</li>
              <li>• <strong>Bearish Breakdown:</strong> Price breaks below the opening low with volume</li>
              <li>• <strong>Watch List:</strong> Stocks hovering near opening range boundaries</li>
              <li>• <strong>High Liquidity:</strong> Ensure strong volume for easy entry/exit</li>
            </ul>
          </div>

          <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
            <h4 className="font-bold text-lg mb-2">⚡ Trading Strategy</h4>
            <ul className="text-sm text-blue-100 space-y-1">
              <li>• Enter on breakout confirmation with volume spike</li>
              <li>• Set stop loss just below opening low (long) or above opening high (short)</li>
              <li>• Target 1-3x the opening range size for profit taking</li>
              <li>• Best results in first 1-2 hours after market open</li>
            </ul>
          </div>
        </div>

        <p className="text-center text-sm text-blue-100 mt-4 italic">
          ⚠️ Always use proper risk management. Never risk more than 1-2% of your account per trade.
        </p>
      </div>
    </div>
  );
};
