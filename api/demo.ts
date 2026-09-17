import { analyzeWebsite } from '../server/analyzer.js';
import { FALLBACK_DEMO_REPORT } from '../server/demoData.js';
import { validateReportConsistency } from '../src/validationPass.js';

export default async function handler(_req: any, res: any) {
  try {
    const liveDemo = await analyzeWebsite('https://thedailyfront.com', false);

    if (liveDemo.success && liveDemo.report) {
      res.status(200).json(liveDemo);
      return;
    }

    const validatedDemo = validateReportConsistency({
      ...FALLBACK_DEMO_REPORT,
      analyzedAt: new Date().toISOString(),
    });

    res.status(200).json({ success: true, report: validatedDemo });
  } catch {
    const validatedDemo = validateReportConsistency({
      ...FALLBACK_DEMO_REPORT,
      analyzedAt: new Date().toISOString(),
    });

    res.status(200).json({ success: true, report: validatedDemo });
  }
}
