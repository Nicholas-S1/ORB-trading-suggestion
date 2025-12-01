import { Router, Request, Response } from 'express';
import alpacaService from '../services/alpaca.service';

const router = Router();

router.get('/test', async (req: Request, res: Response) => {
  try {
    console.log('Testing Alpaca API connection...');

    // Test a simple stock quote
    const testSymbol = 'AAPL';
    const quote = await alpacaService.getStockQuote(testSymbol);

    if (!quote) {
      return res.status(500).json({
        error: 'Failed to fetch stock quote',
        message: 'Check your Alpaca API credentials in .env file',
        tested: testSymbol
      });
    }

    res.json({
      success: true,
      message: 'Alpaca API connected successfully!',
      testData: {
        symbol: testSymbol,
        price: quote.price,
        volume: quote.volume
      }
    });
  } catch (error: any) {
    console.error('Alpaca API test failed:', error);
    res.status(500).json({
      error: 'Alpaca API test failed',
      message: error.message || 'Unknown error',
      hint: 'Verify your ALPACA_API_KEY and ALPACA_SECRET_KEY in backend/.env'
    });
  }
});

export default router;
