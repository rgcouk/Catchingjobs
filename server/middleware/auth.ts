import type { Response, NextFunction, Request } from 'express';
import { requireAuth } from '@clerk/express';

export interface AuthRequest extends Request {
  auth?: { userId: string; [key: string]: any };
}

export const authenticate = requireAuth();
