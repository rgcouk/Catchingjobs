import { Response, NextFunction, Request } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: number; role: string };
    req.user = decoded;
    next();
  } catch (_error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
