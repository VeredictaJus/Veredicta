import type { VercelRequest, VercelResponse } from '@vercel/node';
import verifySmsOtpHandler from '../../src/api/trial/verify-sms-otp';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return verifySmsOtpHandler(req as any, res as any);
}

