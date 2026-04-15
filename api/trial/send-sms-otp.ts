import type { VercelRequest, VercelResponse } from '@vercel/node';
import sendSmsOtpHandler from '../../src/api/trial/send-sms-otp';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return sendSmsOtpHandler(req as any, res as any);
}

