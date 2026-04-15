import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const mod = await import('../../src/api/trial/verify-email-otp');
    const verifyEmailOtpHandler = (mod as any).default || (mod as any).POST;
    if (typeof verifyEmailOtpHandler !== 'function') {
      throw new Error('Handler de verify-email-otp não encontrado');
    }
    return await verifyEmailOtpHandler(req as any, res as any);
  } catch (error: any) {
    return res.status(500).json({
      error: 'Falha ao inicializar endpoint verify-email-otp',
      details: error?.message || String(error),
    });
  }
}

