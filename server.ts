import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { analyzeWebsite } from './server/analyzer.js';
import { FALLBACK_DEMO_REPORT } from './server/demoData.js';
import { reportCache } from './server/cache.js';
import { validateReportConsistency } from './src/validationPass.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '1mb' }));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'PublisherCheck API',
    timestamp: new Date().toISOString(),
    cachedDomainsCount: (reportCache as any).store?.size || 0,
  });
});

app.post('/api/check', async (req, res) => {
  try {
    const { url, forceRefresh } = req.body;

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

    res.json(result);
  } catch (err: any) {
    console.error('Error handling /api/check:', err);
    res.status(500).json({
      success: false,
      error: 'An internal server error occurred while analyzing the website.',
    });
  }
});

app.get('/api/demo', async (req, res) => {
  try {
    const liveDemo = await analyzeWebsite('https://thedailyfront.com', false);

    if (liveDemo.success && liveDemo.report) {
      res.json(liveDemo);
      return;
    }

    const validatedDemo = validateReportConsistency({
      ...FALLBACK_DEMO_REPORT,
      analyzedAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      report: validatedDemo,
    });
  } catch {
    const validatedDemo = validateReportConsistency({
      ...FALLBACK_DEMO_REPORT,
      analyzedAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      report: validatedDemo,
    });
  }
});

app.get('/api/cache/stats', (req, res) => {
  res.json({
    ttlHours: reportCache.getTTLHours(),
  });
});

// Local development uses Vite middleware.
// Vercel imports this Express app directly, so it never starts a local listener.
if (process.env.VERCEL !== '1') {
  if (process.env.NODE_ENV !== 'production') {
    const startDevServer = async () => {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });

      app.use(vite.middlewares);
    };

    startDevServer().catch((error) => {
      console.error('Failed to start Vite:', error);
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));

    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PublisherCheck server running on http://0.0.0.0:${PORT}`);
  });
}

export default app;
