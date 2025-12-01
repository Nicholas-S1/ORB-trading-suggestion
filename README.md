# ORB Trading Suggestion Website

A web application that provides trading suggestions based on the Opening Range Breakout (ORB) strategy, tailored to different account sizes.

## Features

- **Account Tiers**:
  - Small ($0 - $5,000): Stocks under $250 (allows 20+ shares)
  - Medium ($5,000 - $50,000): Stocks under $2,500 (allows 20+ shares)
  - Large ($50,000+): All stocks with good liquidity

- **ORB Strategy Focus**: Identifies stocks with opening range breakout potential
- **Real-time Data**: Powered by Alpaca API
- **Liquidity Analysis**: Yahoo Finance integration for volume metrics

## Tech Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **APIs**: Alpaca (real-time data), Yahoo Finance (liquidity)

## Getting Started

### Prerequisites

- Node.js 18+
- Alpaca API credentials (get free account at [alpaca.markets](https://alpaca.markets))

### Installation

```bash
# Install all dependencies
npm run install:all

# Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your Alpaca API credentials
```

### Development

```bash
# Run both frontend and backend
npm run dev

# Or run separately:
npm run dev:frontend  # Frontend on http://localhost:5173
npm run dev:backend   # Backend on http://localhost:3000
```

### Environment Variables

Create `backend/.env`:

```
ALPACA_API_KEY=your_api_key
ALPACA_SECRET_KEY=your_secret_key
ALPACA_BASE_URL=https://paper-api.alpaca.markets
PORT=3000
```

## Project Structure

```
orb-trading-suggestion/
├── frontend/           # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── types/
│   └── package.json
├── backend/            # Express API backend
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   └── types/
│   └── package.json
└── package.json
```

## ORB Strategy

The Opening Range Breakout (ORB) strategy:
1. Identifies the high/low of the first 5-30 minutes of trading
2. Looks for breakouts above/below this range
3. Filters stocks by price, volume, and account size compatibility

## License

MIT
