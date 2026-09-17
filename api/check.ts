import { analyzeWebsite } from '../server/analyzer.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const { url, forceRefresh } = req.body || {};

    if (!url || typeof url !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Please provide a valid website URL (e.g. https://example.com)',
      });
      return;
    }

    const result = await analyzeWebsite(url, !!forceRefresh);

    if (!result.success) {
      res.status(422).json(result);
      return;
    }

    res.status(200).json(result);
  } catch (err: any) {
    console.error('Error handling /api/check:', err);
    res.status(500).json({
      success: false,
      error: 'An internal server error occurred while analyzing the website.',
    });
  }
}
