# Live Trading Setup Guide

This guide explains how to use the ORB Trading Suggestion system for live trading by scheduling it to run before market open.

## 🕐 Automated Pre-Market Snapshots

The system now automatically generates trading suggestions at **7:30 AM ET** every weekday (Monday-Friday), giving you 2 hours to review before market opens at 9:30 AM ET.

### How It Works:

1. **Automatic Scheduling**: When the backend starts, it automatically schedules snapshot generation at 7:30 AM ET
2. **Saved Snapshots**: Suggestions are saved to `backend/snapshots/premarket-YYYY-MM-DD.json`
3. **All Tiers Included**: Each snapshot contains suggestions for Small, Medium, and Large account tiers

## Setup Methods

### Option 1: Keep Server Running 24/7 (Recommended)

Install PM2 (process manager) to keep the backend running permanently:

```powershell
# Install PM2 globally
npm install -g pm2

# Navigate to backend folder
cd C:\Users\YourUsername\Downloads\ORB-trading-suggestion\backend

# Start with PM2
pm2 start npm --name "orb-backend" -- run dev

# Set to auto-start on Windows boot
pm2 startup
pm2 save

# Check status
pm2 status

# View logs
pm2 logs orb-backend
```

Now the backend runs 24/7 and automatically generates pre-market snapshots at 7:30 AM ET!

### Option 2: Windows Task Scheduler

Schedule the backend to start before market open:

**1. Create startup script:**

Create `start-orb.bat` in project root:
```batch
@echo off
cd C:\Users\YourUsername\Downloads\ORB-trading-suggestion
start cmd /k npm run dev:backend
timeout /t 10
start cmd /k npm run dev:frontend
```

**2. Schedule in Windows Task Scheduler:**
- Open Task Scheduler
- Create Basic Task
- Name: "ORB Trading System"
- Trigger: Daily at 7:00 AM
- Days: Monday, Tuesday, Wednesday, Thursday, Friday
- Action: Start a program
- Program: `C:\Users\YourUsername\Downloads\ORB-trading-suggestion\start-orb.bat`

**3. Additional Settings:**
- Run whether user is logged in or not
- Run with highest privileges
- Wake the computer to run this task

## Manual Snapshot Generation

You can also manually trigger a snapshot anytime:

### Via API:
```powershell
# Generate snapshot now
curl -X POST http://localhost:3000/api/snapshot/generate

# View latest snapshot
curl http://localhost:3000/api/snapshot/latest
```

### Via Browser:
- Generate: Open `http://localhost:3000/api/snapshot/generate` (use POST request tool)
- View: Open `http://localhost:3000/api/snapshot/latest`

## Viewing Your Trading Suggestions

### Morning Routine (7:30 AM - 9:30 AM):

1. **Check if backend is running:**
   - Open: `http://localhost:3000/api/health`
   - Should see: `{"status": "ok", ...}`

2. **View latest snapshot:**
   - Open: `http://localhost:3000/api/snapshot/latest`
   - Or use the main UI: `http://localhost:5173`

3. **Review suggestions:**
   - Look at all three account tiers
   - Note the ORB levels (high/low)
   - Check the reasoning for each suggestion

4. **Plan your trades:**
   - Pick 1-3 stocks that fit your strategy
   - Set alerts at the ORB high/low levels
   - Wait for market open at 9:30 AM ET

### During Market Hours (9:30 AM - 4:00 PM):

1. **Monitor your selected stocks** at 9:30 AM
2. **Watch for ORB breakouts** in the first 15 minutes (9:30-9:45 AM)
3. **Enter positions** when price breaks above opening high or below opening low
4. **Set stop losses** just outside the opening range

## Important Notes for Live Trading

### ⚠️ Risk Management:
- **Never risk more than 1-2% of your account per trade**
- Use proper stop losses (place just below ORB low for longs, above ORB high for shorts)
- Start with paper trading to test the system
- The suggestions are for educational purposes - do your own due diligence

### 📊 Data Limitations (Free Tier):
- IEX feed has 15-minute delay during market hours
- Snapshots use previous day's or recent hourly data
- ORB levels are calculated from historical intraday bars
- For real-time data during market hours, consider upgrading to Alpaca's paid tier ($99/month)

### 🎯 Best Practices:
- Review snapshots BEFORE market open, not during
- Focus on high-liquidity stocks (marked as HIGH or MEDIUM)
- Prioritize stocks with clear breakout signals
- Don't chase - wait for clean breakouts above/below ORB levels
- Use the first 15-30 minutes to confirm the setup

## Monitoring

### Check if scheduler is running:
```powershell
# With PM2
pm2 logs orb-backend

# Look for this message:
# "🕐 Pre-market scheduler started (will run at 7:30 AM ET on weekdays)"
```

### Verify snapshot generation:
```powershell
# List snapshots
dir backend\snapshots

# Should see files like:
# premarket-2025-12-01.json
# premarket-2025-12-02.json
```

## Troubleshooting

**Scheduler not running?**
- Make sure backend is running: `pm2 status` or check Task Scheduler
- Check logs: `pm2 logs orb-backend`

**No snapshots being generated?**
- Verify system time is correct
- Check timezone is set correctly (should auto-detect ET)
- Manually trigger: `POST http://localhost:3000/api/snapshot/generate`

**Backend crashes?**
- Check Alpaca API credentials in `backend/.env`
- Ensure you have internet connection
- Review logs: `pm2 logs orb-backend --lines 100`

## Accessing from Mobile

To check suggestions from your phone in the morning:

1. **Find your computer's IP address:**
   ```powershell
   ipconfig
   # Look for "IPv4 Address" (e.g., 192.168.1.100)
   ```

2. **Update backend to allow external connections:**
   Edit `backend/src/index.ts` and change:
   ```typescript
   app.listen(PORT, '0.0.0.0', () => {
   ```

3. **Access from phone:**
   - Connect to same WiFi as your computer
   - Open: `http://192.168.1.100:3000/api/snapshot/latest`
   - Or: `http://192.168.1.100:5173` for full UI

## Upgrading for Live Trading

For serious live trading, consider:

1. **Alpaca Markets Data** ($99/month)
   - Real-time market data
   - No delays
   - Full SIP feed access

2. **VPS/Cloud Hosting**
   - Deploy to Railway, Heroku, or AWS
   - Access from anywhere
   - 100% uptime

3. **Mobile App**
   - Build React Native wrapper
   - Push notifications for breakouts

---

**Ready to trade? Start with paper trading first!**

Generate a test snapshot: `POST http://localhost:3000/api/snapshot/generate`
