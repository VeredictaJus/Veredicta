import type { VercelRequest, VercelResponse } from '@vercel/node';
import verifyEmailOtpHandler from '../../src/api/trial/verify-email-otp';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return verifyEmailOtpHandler(req as any, res as any);
}

