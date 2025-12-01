import { Router } from 'express';
import suggestionsRoute from './suggestions.route';

const router = Router();

router.use('/suggestions', suggestionsRoute);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
