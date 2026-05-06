import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
  userId?: number; userRole?: string; userSubscription?: string;
}
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const userId = req.headers['x-user-id'];
  if (!userId) { res.status(401).json({ error: 'Non autorisé.' }); return; }
  req.userId = parseInt(userId as string);
  req.userRole = req.headers['x-user-role'] as string;
  req.userSubscription = req.headers['x-user-subscription'] as string;
  next();
}
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.userRole !== 'admin') { res.status(403).json({ error: 'Admin requis.' }); return; }
    next();
  });
}
export function requirePremium(req: AuthRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.userSubscription !== 'premium' && req.userRole !== 'admin') {
      res.status(403).json({ error: 'Abonnement premium requis.' }); return;
    }
    next();
  });
}

// Optional auth: reads user headers if present, never blocks
export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  const userId = req.headers['x-user-id'];
  if (userId) {
    req.userId = parseInt(userId as string);
    req.userRole = req.headers['x-user-role'] as string;
    req.userSubscription = req.headers['x-user-subscription'] as string;
  }
  next();
}
