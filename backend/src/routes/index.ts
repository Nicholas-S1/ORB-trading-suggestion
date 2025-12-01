import { Router } from 'express';
import suggestionsRoute from './suggestions.route';
import testRoute from './test.route';
import snapshotRoute from './snapshot.route';
import watchlistRoute from './watchlist.route';

const router = Router();

router.use('/suggestions', suggestionsRoute);
router.use('/api', testRoute);
router.use('/snapshot', snapshotRoute);
router.use('/watchlist', watchlistRoute);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
