import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { listPortfolios, createPortfolio, getPortfolio, buyStock, sellStock, getTransactions } from '../controllers/portfolioController';

const router = Router();
router.use(requireAuth);
router.get('/', listPortfolios);
router.post('/', createPortfolio);
router.get('/:id', getPortfolio);
router.post('/:id/buy', buyStock);
router.post('/:id/sell', sellStock);
router.get('/:id/transactions', getTransactions);
export default router;
