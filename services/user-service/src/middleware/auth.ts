import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  userId?: number;
  userRole?: string;
  userSubscription?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    res.status(401).json({ error: 'Non autorisé.' });
    return;
  }
  req.userId = parseInt(userId as string);
  req.userRole = req.headers['x-user-role'] as string;
  req.userSubscription = req.headers['x-user-subscription'] as string;
  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.userRole !== 'admin') {
      res.status(403).json({ error: 'Accès administrateur requis.' });
      return;
    }
    next();
  });
}
