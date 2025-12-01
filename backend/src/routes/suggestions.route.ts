import { Router, Request, Response } from 'express';
import suggestionService from '../services/suggestion.service';
import { SuggestionRequest } from '../types';

const router = Router();

router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { accountSize, tier } = req.body as SuggestionRequest;

    if (!accountSize || accountSize <= 0) {
      return res.status(400).json({
        error: 'Invalid account size. Must be greater than 0.'
      });
    }

    const suggestions = await suggestionService.generateSuggestions({
      accountSize,
      tier
    });

    res.json(suggestions);
  } catch (error) {
    console.error('Error generating suggestions:', error);
    res.status(500).json({
      error: 'Failed to generate trading suggestions'
    });
  }
});

export default router;
