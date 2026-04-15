import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const mod = await import('../../src/api/users/create-trial-access');
    const createTrialAccessHandler = (mod as any).default || (mod as any).POST;
    if (typeof createTrialAccessHandler !== 'function') {
      throw new Error('Handler de create-trial-access não encontrado');
    }
    return await createTrialAccessHandler(req as any, res as any);
  } catch (error: any) {
    return res.status(500).json({
      error: 'Falha ao inicializar endpoint create-trial-access',
      details: error?.message || String(error),
    });
  }
}

