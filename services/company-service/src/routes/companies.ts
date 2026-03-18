import { Router } from 'express';
import { requireAdmin } from '../middleware/auth';
import {
  listCompanies, getCompany, getPriceHistory, getDividends,
  createCompany, addStockPrice, getFundamentals,
} from '../controllers/companyController';
import { getNewsByTicker } from '../controllers/newsController';
import { getReports }                  from '../controllers/reportController';
import { getAnnouncements }            from '../controllers/announcementController';
import { getVideos }                   from '../controllers/videoController';
import { getSummary }                  from '../controllers/summaryController';
import { getRecommendation, getAnalystRecommendations } from '../controllers/recommendationController';

const router = Router();

router.get('/',    listCompanies);
router.post('/',   requireAdmin, createCompany);
router.get('/:ticker/fundamentals',             getFundamentals);
router.get('/:ticker/news',                     getNewsByTicker);
router.get('/:ticker/reports',                  getReports);
router.get('/:ticker/announcements',            getAnnouncements);
router.get('/:ticker/videos',                   getVideos);
router.get('/:ticker/summary',                  getSummary);
router.get('/:ticker/recommendation',           getRecommendation);
router.get('/:ticker/analyst-recommendations',  getAnalystRecommendations);
router.get('/:id', getCompany);
router.get('/:symbol/history',   getPriceHistory);
router.get('/:id/dividends',     getDividends);
router.post('/:symbol/prices',   requireAdmin, addStockPrice);

export default router;
