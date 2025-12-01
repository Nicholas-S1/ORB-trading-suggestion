import { Router } from 'express';
import suggestionsRoute from './suggestions.route';
import testRoute from './test.route';

const router = Router();

router.use('/suggestions', suggestionsRoute);
router.use('/api', testRoute);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
