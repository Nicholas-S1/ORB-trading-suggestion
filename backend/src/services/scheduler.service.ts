import { AccountTier } from '../types';
import suggestionService from './suggestion.service';
import fs from 'fs';
import path from 'path';

class SchedulerService {
  private snapshotsDir = path.join(__dirname, '../../snapshots');

  constructor() {
    // Create snapshots directory if it doesn't exist
    if (!fs.existsSync(this.snapshotsDir)) {
      fs.mkdirSync(this.snapshotsDir, { recursive: true });
    }
  }

  async generatePreMarketSnapshot(): Promise<void> {
    console.log('📸 Generating pre-market snapshot...');

    const timestamp = new Date().toISOString();
    const results = {
      timestamp,
      generatedAt: new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }),
      tiers: {} as any
    };

    // Generate suggestions for all tiers
    for (const tier of [AccountTier.SMALL, AccountTier.MEDIUM, AccountTier.LARGE]) {
      console.log(`Generating suggestions for ${tier} tier...`);

      const accountSizes = {
        [AccountTier.SMALL]: 2500,
        [AccountTier.MEDIUM]: 25000,
        [AccountTier.LARGE]: 100000
      };

      const suggestions = await suggestionService.generateSuggestions({
        accountSize: accountSizes[tier],
        tier
      });

      results.tiers[tier] = suggestions;
    }

    // Save to file
    const filename = `premarket-${new Date().toISOString().split('T')[0]}.json`;
    const filepath = path.join(this.snapshotsDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(results, null, 2));

    console.log(`✅ Pre-market snapshot saved to: ${filepath}`);
    console.log(`📊 Total suggestions: SMALL=${results.tiers.SMALL.suggestions.length}, MEDIUM=${results.tiers.MEDIUM.suggestions.length}, LARGE=${results.tiers.LARGE.suggestions.length}`);

    return;
  }

  getLatestSnapshot(): any {
    const files = fs.readdirSync(this.snapshotsDir)
      .filter(f => f.startsWith('premarket-'))
      .sort()
      .reverse();

    if (files.length === 0) {
      return null;
    }

    const latestFile = path.join(this.snapshotsDir, files[0]);
    const content = fs.readFileSync(latestFile, 'utf-8');
    return JSON.parse(content);
  }

  // Schedule to run at 7:30 AM ET every weekday
  startPreMarketSchedule(): void {
    const checkAndRun = () => {
      const now = new Date();
      const etTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
      const hours = etTime.getHours();
      const minutes = etTime.getMinutes();
      const dayOfWeek = etTime.getDay();

      // Run at 7:30 AM ET on weekdays (Monday=1 to Friday=5)
      if (dayOfWeek >= 1 && dayOfWeek <= 5 && hours === 7 && minutes === 30) {
        this.generatePreMarketSnapshot().catch(console.error);
      }
    };

    // Check every minute
    setInterval(checkAndRun, 60000);
    console.log('🕐 Pre-market scheduler started (will run at 7:30 AM ET on weekdays)');
  }
}

export default new SchedulerService();
