import { Router, Request, Response } from 'express';
import schedulerService from '../services/scheduler.service';

const router = Router();

// Manually trigger pre-market snapshot generation
router.post('/generate', async (req: Request, res: Response) => {
  try {
    await schedulerService.generatePreMarketSnapshot();
    res.json({
      success: true,
      message: 'Pre-market snapshot generated successfully'
    });
  } catch (error: any) {
    console.error('Error generating snapshot:', error);
    res.status(500).json({
      error: 'Failed to generate snapshot',
      message: error.message
    });
  }
});

// Get latest snapshot
router.get('/latest', (req: Request, res: Response) => {
  try {
    const snapshot = schedulerService.getLatestSnapshot();

    if (!snapshot) {
      return res.status(404).json({
        error: 'No snapshots available',
        message: 'Generate a snapshot first using POST /api/snapshot/generate'
      });
    }

    res.json(snapshot);
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to retrieve snapshot',
      message: error.message
    });
  }
});

export default router;
