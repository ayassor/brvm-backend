import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = parseInt(process.env.PORT || '5000');
const JWT_SECRET = process.env.JWT_SECRET!;

// ── Middleware de base ──────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: '*', credentials: true }));
app.use(morgan('[:date[iso]] :method :url :status :response-time ms'));
app.set('trust proxy', 1);

// ── Rate limiting ──────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de requêtes, réessayez dans 15 minutes.' },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Limite IA atteinte, réessayez dans 1 minute.' },
});

app.use(globalLimiter);

// ── Health check ────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'api-gateway', timestamp: new Date().toISOString() });
});

// ── JWT Middleware ──────────────────────────────────────────
interface JwtPayload {
  id: number;
  email: string;
  role: string;
  subscription_type: string;
}

function authRequired(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token manquant ou invalide.' });
    return;
  }
  try {
    const payload = jwt.verify(header.split(' ')[1], JWT_SECRET) as JwtPayload;
    req.headers['x-user-id'] = String(payload.id);
    req.headers['x-user-email'] = payload.email;
    req.headers['x-user-role'] = payload.role;
    req.headers['x-user-subscription'] = payload.subscription_type;
    delete req.headers.authorization;
    next();
  } catch {
    res.status(401).json({ error: 'Token expiré ou invalide.' });
  }
}

function authOptional(
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction,
): void {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      const payload = jwt.verify(header.split(' ')[1], JWT_SECRET) as JwtPayload;
      req.headers['x-user-id'] = String(payload.id);
      req.headers['x-user-email'] = payload.email;
      req.headers['x-user-role'] = payload.role;
      req.headers['x-user-subscription'] = payload.subscription_type;
      delete req.headers.authorization;
    } catch {
      // ignore – accès public autorisé
    }
  }
  next();
}

// ── Proxy factory ───────────────────────────────────────────
// Express strips the mount prefix from req.url before reaching the proxy.
// - Sans prependPath : aucun rewrite (le path déjà strippé est correct)
// - Avec prependPath : on le réinsère en tête du path strippé
//   ex: GET /api/news/categories → req.url = '/categories' → '/news/categories'
function proxy(target: string, pathPrefix: string, prependPath?: string): express.RequestHandler {
  const pathRewrite = prependPath ? { '^': prependPath } : undefined;
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    ...(pathRewrite && { pathRewrite }),
    on: {
      error: (err: Error, _req, res) => {
        console.error(`[Proxy] Erreur → ${target}:`, err.message);
        const r = res as express.Response;
        if (!r.headersSent) {
          r.status(503).json({ error: 'Service temporairement indisponible.' });
        }
      },
    },
  }) as express.RequestHandler;
}

const U  = process.env.USER_SERVICE_URL!;
const C  = process.env.COMPANY_SERVICE_URL!;
const MD = process.env.MARKET_DATA_SERVICE_URL!;
const P  = process.env.PORTFOLIO_SERVICE_URL!;
const E  = process.env.EDUCATION_SERVICE_URL!;
const S  = process.env.SUBSCRIPTION_SERVICE_URL!;
const CR = process.env.CREDIT_SERVICE_URL!;
const AI = process.env.AI_SERVICE_URL!;
const R  = process.env.REPORT_SERVICE_URL!;

// ── Routes publiques ────────────────────────────────────────
app.use('/api/auth',                    proxy(U,  '/api/auth'));
app.use('/api/subscriptions/plans',     proxy(S,  '/api/subscriptions/plans'));
app.use('/api/education/glossary',      proxy(E,  '/api/education/glossary', '/glossary'));

// ── Routes publiques avec auth optionnelle ──────────────────
app.use('/api/news',                    authOptional, proxy(C,  '/api/news',       '/news'));
app.use('/api/v1/stocks',               authOptional, proxy(C,  '/api/v1/stocks'));
app.use('/api/companies',               authOptional, proxy(C,  '/api/companies'));
app.use('/api/market',                  authOptional, proxy(MD, '/api/market'));

// ── Routes admin (news + companies) ─────────────────────────
app.use('/api/admin/news',              authRequired, proxy(C,  '/api/admin/news',      '/admin/news'));
app.use('/api/admin/companies',         authRequired, proxy(C,  '/api/admin/companies', '/admin/companies'));
app.use('/api/education/admin',         authRequired, proxy(E,  '/api/education/admin', '/admin'));
app.use('/api/education/courses',       authOptional, proxy(E,  '/api/education/courses', '/courses'));
app.use('/api/education/articles',      authOptional, proxy(E,  '/api/education/articles', '/articles'));

// ── Routes protégées ────────────────────────────────────────
app.use('/api/users',                   authRequired, proxy(U,  '/api/users'));
app.use('/api/portfolios',              authRequired, proxy(P,  '/api/portfolios'));
app.use('/api/subscriptions',           authRequired, proxy(S,  '/api/subscriptions'));
app.use('/api/credits',                 authRequired, proxy(CR, '/api/credits'));
app.use('/api/ai',                      authRequired, aiLimiter, proxy(AI, '/api/ai'));
app.use('/api/reports',                 authRequired, proxy(R,  '/api/reports'));

// ── 404 ─────────────────────────────────────────────────────
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} introuvable.` });
});

app.listen(PORT, () => {
  console.log(`✅ API Gateway démarré sur le port ${PORT} [${process.env.NODE_ENV}]`);
});

export default app;
