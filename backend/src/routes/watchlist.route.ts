import { Router, Request, Response } from 'express';
import watchlistService from '../services/watchlist.service';
import { TradingSuggestion } from '../types';

const router = Router();

// Get all watchlist items
router.get('/', (req: Request, res: Response) => {
  try {
    const watchlist = watchlistService.getWatchlist();
    res.json(watchlist);
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to retrieve watchlist',
      message: error.message
    });
  }
});

// Add to watchlist
router.post('/add', (req: Request, res: Response) => {
  try {
    const { suggestion, expirationDays } = req.body as {
      suggestion: TradingSuggestion;
      expirationDays: number;
    };

    if (!suggestion || typeof expirationDays !== 'number') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'suggestion and expirationDays are required'
      });
    }

    const item = watchlistService.addToWatchlist(suggestion, expirationDays);

    res.json({
      success: true,
      item,
      message: 'Added to watchlist'
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to add to watchlist',
      message: error.message
    });
  }
});

// Remove from watchlist
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const removed = watchlistService.removeFromWatchlist(id);

    if (removed) {
      res.json({
        success: true,
        message: 'Removed from watchlist'
      });
    } else {
      res.status(404).json({
        error: 'Item not found'
      });
    }
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to remove from watchlist',
      message: error.message
    });
  }
});

// Clear expired items
router.post('/clear-expired', (req: Request, res: Response) => {
  try {
    const count = watchlistService.clearExpired();
    res.json({
      success: true,
      removedCount: count,
      message: `Removed ${count} expired items`
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to clear expired items',
      message: error.message
    });
  }
});

export default router;
