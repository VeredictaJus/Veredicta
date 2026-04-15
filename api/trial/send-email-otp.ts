import type { VercelRequest, VercelResponse } from '@vercel/node';
import sendEmailOtpHandler from '../../src/api/trial/send-email-otp';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return sendEmailOtpHandler(req as any, res as any);
}

