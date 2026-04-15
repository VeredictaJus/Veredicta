import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const mod = await import('../../src/api/trial/verify-sms-otp');
    const verifySmsOtpHandler = (mod as any).default || (mod as any).POST;
    if (typeof verifySmsOtpHandler !== 'function') {
      throw new Error('Handler de verify-sms-otp não encontrado');
    }
    return await verifySmsOtpHandler(req as any, res as any);
  } catch (error: any) {
    return res.status(500).json({
      error: 'Falha ao inicializar endpoint verify-sms-otp',
      details: error?.message || String(error),
    });
  }
}

