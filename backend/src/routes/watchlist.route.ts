import { Router, Response } from 'express';
import watchlistDBService from '../services/watchlist-db.service';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { TradingSuggestion } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all watchlist items for current user
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const watchlist = await watchlistDBService.getWatchlist(req.userId!);
    res.json(watchlist);
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to retrieve watchlist',
      message: error.message
    });
  }
});

// Add to watchlist
router.post('/add', async (req: AuthRequest, res: Response) => {
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

    const item = await watchlistDBService.addToWatchlist(req.userId!, suggestion, expirationDays);

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
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const removed = await watchlistDBService.removeFromWatchlist(req.userId!, id);

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
router.post('/clear-expired', async (req: AuthRequest, res: Response) => {
  try {
    const count = await watchlistDBService.clearExpired(req.userId!);
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
