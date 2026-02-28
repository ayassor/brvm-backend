import { Router } from 'express';
import { getMarketOverview, getTopMovers, getMostActive } from '../controllers/marketController';

const router = Router();
router.get('/overview', getMarketOverview);
router.get('/movers', getTopMovers);
router.get('/most-active', getMostActive);
export default router;
