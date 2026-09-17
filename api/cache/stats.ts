import { reportCache } from '../../server/cache.js';

export default function handler(_req: any, res: any) {
  res.status(200).json({
    ttlHours: reportCache.getTTLHours(),
  });
}
