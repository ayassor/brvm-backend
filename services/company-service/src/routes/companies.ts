import { Router } from 'express';
import { requireAdmin } from '../middleware/auth';
import {
  listCompanies, getCompany, getPriceHistory, getDividends,
  createCompany, addStockPrice,
} from '../controllers/companyController';

const router = Router();
router.get('/', listCompanies);
router.get('/:id', getCompany);
router.get('/:id/prices', getPriceHistory);
router.get('/:id/dividends', getDividends);
router.post('/', requireAdmin, createCompany);
router.post('/:id/prices', requireAdmin, addStockPrice);
export default router;
