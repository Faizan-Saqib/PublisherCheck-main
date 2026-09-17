import { reportCache } from '../server/cache.js';

export default function handler(_req: any, res: any) {
  res.status(200).json({
    status: 'ok',
    service: 'PublisherCheck API',
    timestamp: new Date().toISOString(),
    cachedDomainsCount: (reportCache as any).store?.size || 0,
  });
}
