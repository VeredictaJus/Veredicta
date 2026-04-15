import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const mod = await import('../../src/api/trial/send-sms-otp');
    const sendSmsOtpHandler = (mod as any).default || (mod as any).POST;
    if (typeof sendSmsOtpHandler !== 'function') {
      throw new Error('Handler de send-sms-otp não encontrado');
    }
    return await sendSmsOtpHandler(req as any, res as any);
  } catch (error: any) {
    return res.status(500).json({
      error: 'Falha ao inicializar endpoint send-sms-otp',
      details: error?.message || String(error),
    });
  }
}

