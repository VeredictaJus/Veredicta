import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const mod = await import('../../src/api/trial/send-email-otp');
    const sendEmailOtpHandler = (mod as any).default || (mod as any).POST;
    if (typeof sendEmailOtpHandler !== 'function') {
      throw new Error('Handler de send-email-otp não encontrado');
    }
    return await sendEmailOtpHandler(req as any, res as any);
  } catch (error: any) {
    return res.status(500).json({
      error: 'Falha ao inicializar endpoint send-email-otp',
      details: error?.message || String(error),
    });
  }
}

