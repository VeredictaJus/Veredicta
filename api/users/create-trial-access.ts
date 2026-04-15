import type { VercelRequest, VercelResponse } from '@vercel/node';
import createTrialAccessHandler from '../../src/api/users/create-trial-access';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return createTrialAccessHandler(req as any, res as any);
}

