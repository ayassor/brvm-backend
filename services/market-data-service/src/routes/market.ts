import { Router } from 'express';
import {
  listCompanies, getCompany, createCompany, updateCompany,
  getPriceHistory, getLatestPrice, bulkImportPrices,
  getMarketOverview, getTopMovers, getMostActive,
} from '../controllers/marketController';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// ─── Companies cotées ────────────────────────────────────────────────────────
// GET  /companies              → liste toutes les sociétés cotées
// GET  /companies/:symbol      → détail d'une société
// POST /companies              → créer une société  (admin)
// PATCH /companies/:symbol     → mettre à jour une société (admin)
router.get('/companies',          listCompanies);
router.get('/companies/:symbol',  getCompany);
router.post('/companies',         requireAdmin, createCompany);
router.patch('/companies/:symbol', requireAdmin, updateCompany);

// ─── Historique des prix ─────────────────────────────────────────────────────
// GET  /prices/:symbol         → historique complet (query: from, to, limit)
// GET  /prices/:symbol/latest  → dernier cours connu
// POST /prices/bulk            → injection en masse (admin)
router.get('/prices/:symbol/latest', getLatestPrice);
router.get('/prices/:symbol',        getPriceHistory);
router.post('/prices/bulk',          requireAdmin, bulkImportPrices);

// ─── Vues marché ─────────────────────────────────────────────────────────────
router.get('/overview',     getMarketOverview);
router.get('/movers',       getTopMovers);
router.get('/most-active',  getMostActive);

export default router;
