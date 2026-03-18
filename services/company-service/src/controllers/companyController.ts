import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { z } from 'zod';
import Company from '../models/Company';
import StockPrice from '../models/StockPrice';
import Dividend from '../models/Dividend';
import FinancialHistory from '../models/FinancialHistory';
import Shareholder from '../models/Shareholder';
import CompanyNews from '../models/CompanyNews';
import { AuthRequest } from '../middleware/auth';

const createSchema = z.object({
  name: z.string().min(2), ticker: z.string().min(1).max(20),
  sector: z.string().optional(), country: z.string().optional(),
  description: z.string().optional(), logo_url: z.string().url().optional(),
});

export async function listCompanies(req: Request, res: Response): Promise<void> {
  try {
    const { sector, country, search } = req.query;
    const where: Record<string, unknown> = { is_active: true };
    if (sector) where.sector = sector;
    if (country) where.country = country;
    if (search) where.name = { [Op.like]: `%${search}%` };

    const companies = await Company.findAll({ where, order: [['name', 'ASC']] });

    const enriched = await Promise.all(companies.map(async (c) => {
      const latest = await StockPrice.findOne({
        where: { symbol: c.ticker },
        order: [['date', 'DESC']],
      });
      return {
        ...c.toJSON(),
        current_price: latest?.close ?? null,
        previous_close: latest?.previous_close ?? null,
        volume: latest?.volume ?? null,
      };
    }));

    res.json({ data: enriched, total: enriched.length });
  } catch (err) {
    console.error('[listCompanies]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

export async function getCompany(req: Request, res: Response): Promise<void> {
  try {
    const company = await Company.findOne({ where: { id: req.params.id, is_active: true } });
    if (!company) { res.status(404).json({ error: 'Société introuvable.' }); return; }

    const latestPrice = await StockPrice.findOne({
      where: { symbol: company.ticker },
      order: [['date', 'DESC']],
    });

    res.json({
      ...company.toJSON(),
      current_price: latestPrice?.close ?? null,
      previous_close: latestPrice?.previous_close ?? null,
      volume: latestPrice?.volume ?? null,
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

export async function getPriceHistory(req: Request, res: Response): Promise<void> {
  try {
    const prices = await StockPrice.findAll({
      where: { symbol: req.params.symbol },
      order: [['date', 'ASC']],
    });

    if (prices.length === 0) {
      res.json({ data: [], count: 0, date_min: null, date_max: null });
      return;
    }

    const date_min = prices[0].date;
    const date_max = prices[prices.length - 1].date;

    res.json({ data: prices, count: prices.length, date_min, date_max });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

export async function getDividends(req: Request, res: Response): Promise<void> {
  try {
    // req.params.id peut être un ticker (ex: UNTC) ou un id numérique
    const param = req.params.id;
    const isNumeric = /^\d+$/.test(param);
    let ticker: string | null = null;

    if (isNumeric) {
      const company = await Company.findOne({ where: { id: param } });
      ticker = company?.ticker ?? null;
    } else {
      ticker = param.toUpperCase();
    }

    if (!ticker) { res.status(404).json({ error: 'Société introuvable.' }); return; }

    const dividends = await Dividend.findAll({
      where: { ticker },
      order: [['payment_date', 'DESC']],
    });
    res.json({ data: dividends });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

export async function createCompany(req: AuthRequest, res: Response): Promise<void> {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }
  try {
    const exists = await Company.findOne({ where: { ticker: parsed.data.ticker } });
    if (exists) { res.status(409).json({ error: 'Ce ticker existe déjà.' }); return; }
    const company = await Company.create(parsed.data);
    res.status(201).json(company);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// Parse un champ JSON qui peut arriver comme string ou tableau depuis MySQL
function parseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) return value as string[];
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return []; }
  }
  return [];
}

// Cast un DECIMAL Sequelize (string) en number, ou null si absent
function toNum(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return isNaN(n) ? null : n;
}

export async function getFundamentals(req: Request, res: Response): Promise<void> {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const company = await Company.findOne({ where: { ticker, is_active: true } });
    if (!company) { res.status(404).json({ error: 'Société introuvable.' }); return; }

    const [latestPrice, history, shareholders, dividends, recentNews] = await Promise.all([
      StockPrice.findOne({ where: { symbol: ticker }, order: [['date', 'DESC']] }),
      FinancialHistory.findAll({ where: { ticker }, order: [['year', 'DESC']], limit: 5 }),
      Shareholder.findAll({ where: { ticker }, order: [['pct', 'DESC']] }),
      Dividend.findAll({ where: { ticker }, order: [['payment_date', 'DESC']], limit: 10 }),
      CompanyNews.findAll({ where: { ticker }, order: [['date', 'DESC']], limit: 5 }),
    ]);

    const currentPrice = toNum(latestPrice?.close);
    const sharesCount  = toNum(company.shares_count);
    const latestHistory = history[0] ?? null;

    // ── Calculs dérivés ──────────────────────────────────────
    const market_cap_fcfa = (currentPrice !== null && sharesCount !== null)
      ? Math.round(currentPrice * sharesCount)
      : null;

    const eps = toNum(latestHistory?.eps_fcfa);
    const pe_ratio = (currentPrice !== null && eps !== null && eps !== 0)
      ? Math.round((currentPrice / eps) * 10) / 10
      : (toNum(latestHistory?.pe_ratio));

    const latestDividendAmount = toNum(dividends[0]?.amount ?? null);
    const dividend_yield_pct = (currentPrice !== null && latestDividendAmount !== null && currentPrice !== 0)
      ? Math.round((latestDividendAmount / currentPrice) * 1000) / 10
      : null;

    const rev  = toNum(latestHistory?.revenue_m_fcfa);
    const ni   = toNum(latestHistory?.net_income_m_fcfa);
    const ebit = toNum(latestHistory?.ebitda_m_fcfa);

    const revenue_bn_fcfa    = rev  !== null ? Math.round(rev)  / 1000 : null;
    const net_income_bn_fcfa = ni   !== null ? Math.round(ni)   / 1000 : null;
    const ebitda_bn_fcfa     = ebit !== null ? Math.round(ebit) / 1000 : null;
    const net_margin_pct     = (ni !== null && rev !== null && rev !== 0)
      ? Math.round((ni / rev) * 1000) / 10
      : null;

    res.json({
      ticker,
      market_cap_fcfa,
      pe_ratio,
      dividend_yield_pct,
      revenue_bn_fcfa,
      net_income_bn_fcfa,
      ebitda_bn_fcfa,
      net_margin_pct,

      // ── Historique 5 ans ──
      history: history.map((h) => ({
        year:                    h.year,
        revenue_m_fcfa:          toNum(h.revenue_m_fcfa),
        net_income_m_fcfa:       toNum(h.net_income_m_fcfa),
        ebitda_m_fcfa:           toNum(h.ebitda_m_fcfa),
        pe_ratio:                toNum(h.pe_ratio),
        eps_fcfa:                toNum(h.eps_fcfa),
        dividend_per_share_fcfa: toNum(h.dividend_per_share_fcfa) ?? 0,
      })),

      // ── Infos entreprise ──
      ceo:            company.ceo            ?? null,
      ceo_title:      company.ceo_title      ?? null,
      founded:        toNum(company.founded),
      employees:      toNum(company.employees),
      website:        company.website        ?? null,
      free_float_pct: toNum(company.free_float_pct),
      activities:     parseJsonArray(company.activities),
      certifications: parseJsonArray(company.certifications),

      // ── Actionnariat ──
      shareholders: shareholders.map((s) => ({
        name: s.name,
        pct:  toNum(s.pct),
        type: s.type,
      })),

      // ── Dividendes ──
      dividends: dividends.map((d) => ({
        year:         d.year          ?? null,
        amount_fcfa:  toNum(d.amount),
        payment_date: d.payment_date,
        ex_date:      d.ex_date       ?? null,
      })),

      // ── Actualités ──
      recent_news: recentNews.map((n) => ({
        date:     n.date,
        headline: n.headline,
        positive: n.positive ?? null,
      })),
    });
  } catch (err) {
    console.error('[getFundamentals]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

export async function addStockPrice(req: AuthRequest, res: Response): Promise<void> {
  const { date, open, close, high, low, previous_close, volume } = req.body;
  if (!date) { res.status(400).json({ error: 'date est requis.' }); return; }
  const symbol = req.params.symbol;
  try {
    const company = await Company.findOne({ where: { ticker: symbol } });
    if (!company) { res.status(404).json({ error: 'Ticker introuvable.' }); return; }

    const [price, created] = await StockPrice.findOrCreate({
      where: { symbol, date },
      defaults: { symbol, date, open, close, high, low, previous_close, volume },
    });
    if (!created) await price.update({ open, close, high, low, previous_close, volume });
    res.status(201).json(price);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}
