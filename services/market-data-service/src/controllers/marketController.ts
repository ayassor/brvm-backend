import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { z } from 'zod';
import sequelize from '../config/database';
import ListedCompany from '../models/ListedCompany';
import PriceHistory from '../models/PriceHistory';

// ─── Schémas de validation ───────────────────────────────────────────────────

const companySchema = z.object({
  symbol:       z.string().min(1).max(20),
  name:         z.string().min(1).nullable().optional(),
  sector:       z.string().nullable().optional(),
  country:      z.string().max(10).nullable().optional(),
  isin:         z.string().max(12).nullable().optional(),
  currency:     z.string().max(5).optional(),
  market_cap:   z.number().positive().nullable().optional(),
  listing_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  description:  z.string().nullable().optional(),
  logo_url:     z.string().url().nullable().optional(),
  is_active:    z.boolean().optional(),
});

const priceRowSchema = z.object({
  symbol: z.string().min(1).max(20),
  date:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format attendu: YYYY-MM-DD'),
  open:   z.number().nullable().optional(),
  high:   z.number().nullable().optional(),
  low:    z.number().nullable().optional(),
  close:  z.number().nullable().optional(),
  volume: z.number().int().nonnegative().nullable().optional(),
});

const bulkSchema = z.object({
  prices: z.array(priceRowSchema).min(1).max(10000),
});

// ─── Companies ───────────────────────────────────────────────────────────────

export async function listCompanies(req: Request, res: Response): Promise<void> {
  try {
    const { sector, country, search, active } = req.query;
    const where: Record<string, unknown> = {};
    if (active !== 'all') where.is_active = true;
    if (sector) where.sector = sector;
    if (country) where.country = country;
    if (search) where.name = { [Op.like]: `%${search}%` };

    const companies = await ListedCompany.findAll({ where, order: [['symbol', 'ASC']] });
    res.json({ data: companies, total: companies.length });
  } catch (err) {
    console.error('[listCompanies]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

export async function getCompany(req: Request, res: Response): Promise<void> {
  try {
    const company = await ListedCompany.findByPk(req.params.symbol);
    if (!company) { res.status(404).json({ error: 'Société introuvable.' }); return; }
    res.json({ data: company });
  } catch (err) {
    console.error('[getCompany]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

export async function createCompany(req: Request, res: Response): Promise<void> {
  try {
    const parsed = companySchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

    const [company, created] = await ListedCompany.findOrCreate({
      where: { symbol: parsed.data.symbol },
      defaults: parsed.data as any,
    });

    if (!created) { res.status(409).json({ error: 'Symbole déjà existant.', data: company }); return; }
    res.status(201).json({ data: company });
  } catch (err) {
    console.error('[createCompany]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

export async function updateCompany(req: Request, res: Response): Promise<void> {
  try {
    const company = await ListedCompany.findByPk(req.params.symbol);
    if (!company) { res.status(404).json({ error: 'Société introuvable.' }); return; }

    const parsed = companySchema.partial().safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

    await company.update(parsed.data as any);
    res.json({ data: company });
  } catch (err) {
    console.error('[updateCompany]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ─── Price History ───────────────────────────────────────────────────────────

export async function getPriceHistory(req: Request, res: Response): Promise<void> {
  try {
    const { symbol } = req.params;
    const { from, to, limit = '500' } = req.query;

    const where: Record<string, unknown> = { symbol };
    if (from || to) {
      const dateFilter: Record<string, unknown> = {};
      if (from) dateFilter[Op.gte as any] = from;
      if (to)   dateFilter[Op.lte as any] = to;
      where.date = dateFilter;
    }

    const prices = await PriceHistory.findAll({
      where,
      order: [['date', 'ASC']],
      limit: Math.min(parseInt(limit as string) || 500, 5000),
    });

    res.json({ symbol, data: prices, total: prices.length });
  } catch (err) {
    console.error('[getPriceHistory]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

export async function getLatestPrice(req: Request, res: Response): Promise<void> {
  try {
    const { symbol } = req.params;
    const latest = await PriceHistory.findOne({ where: { symbol }, order: [['date', 'DESC']] });
    if (!latest) { res.status(404).json({ error: 'Aucune donnée pour ce symbole.' }); return; }
    res.json({ data: latest });
  } catch (err) {
    console.error('[getLatestPrice]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ─── Bulk Import ─────────────────────────────────────────────────────────────

export async function bulkImportPrices(req: Request, res: Response): Promise<void> {
  try {
    const parsed = bulkSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

    const { prices } = parsed.data;

    // 1. Auto-créer les sociétés inconnues (symbole seul, champs nullable)
    const uniqueSymbols = [...new Set(prices.map(p => p.symbol))];
    await Promise.all(
      uniqueSymbols.map(symbol => ListedCompany.findOrCreate({ where: { symbol }, defaults: { symbol } }))
    );

    // 2. Récupérer les (symbol, date) déjà en base pour les ignorer
    const datesInBatch = [...new Set(prices.map(p => p.date))];
    const existing = await PriceHistory.findAll({
      where: {
        symbol: { [Op.in]: uniqueSymbols },
        date:   { [Op.in]: datesInBatch },
      },
      attributes: ['symbol', 'date'],
    });
    const existingSet = new Set(existing.map(e => `${e.symbol}__${e.date}`));

    // 3. Filtrer et insérer uniquement les nouvelles lignes
    const toInsert = prices.filter(p => !existingSet.has(`${p.symbol}__${p.date}`));

    if (toInsert.length > 0) {
      await sequelize.transaction(async (t) => {
        await PriceHistory.bulkCreate(toInsert as any, { transaction: t });
      });
    }

    res.status(201).json({
      inserted: toInsert.length,
      skipped:  prices.length - toInsert.length,
      total:    prices.length,
    });
  } catch (err) {
    console.error('[bulkImportPrices]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ─── Market Overview ─────────────────────────────────────────────────────────

export async function getMarketOverview(req: Request, res: Response): Promise<void> {
  try {
    const companies = await ListedCompany.findAll({ where: { is_active: true } });
    let advances = 0, declines = 0, unchanged = 0;

    const stocks = await Promise.all(companies.map(async (c) => {
      const latest = await PriceHistory.findOne({ where: { symbol: c.symbol }, order: [['date', 'DESC']] });
      const prev = latest
        ? await PriceHistory.findOne({ where: { symbol: c.symbol, date: { [Op.lt]: latest.date } }, order: [['date', 'DESC']] })
        : null;
      const variation = latest?.close && prev?.close
        ? parseFloat(((latest.close - prev.close) / prev.close * 100).toFixed(2)) : 0;
      if (variation > 0) advances++;
      else if (variation < 0) declines++;
      else unchanged++;
      return {
        symbol: c.symbol, name: c.name, sector: c.sector, country: c.country,
        current_price: latest?.close ?? null, variation, volume: latest?.volume ?? 0,
        date: latest?.date ?? null,
      };
    }));

    res.json({ stocks, summary: { total_companies: companies.length, advances, declines, unchanged } });
  } catch (err) {
    console.error('[getMarketOverview]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

export async function getTopMovers(req: Request, res: Response): Promise<void> {
  try {
    const { type = 'gainers', limit = '5' } = req.query;
    const companies = await ListedCompany.findAll({ where: { is_active: true } });

    const movers = (await Promise.all(companies.map(async (c) => {
      const latest = await PriceHistory.findOne({ where: { symbol: c.symbol }, order: [['date', 'DESC']] });
      if (!latest?.close) return null;
      const prev = await PriceHistory.findOne({ where: { symbol: c.symbol, date: { [Op.lt]: latest.date } }, order: [['date', 'DESC']] });
      if (!prev?.close) return null;
      const variation = parseFloat(((latest.close - prev.close) / prev.close * 100).toFixed(2));
      return { symbol: c.symbol, name: c.name, current_price: latest.close, variation, volume: latest.volume ?? 0 };
    }))).filter(Boolean) as { symbol: string; name: string | null; current_price: number; variation: number; volume: number }[];

    const sorted = type === 'gainers'
      ? movers.sort((a, b) => b.variation - a.variation)
      : movers.sort((a, b) => a.variation - b.variation);

    res.json({ data: sorted.slice(0, parseInt(limit as string)), type });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

export async function getMostActive(req: Request, res: Response): Promise<void> {
  try {
    const { limit = '5' } = req.query;
    const companies = await ListedCompany.findAll({ where: { is_active: true } });

    const active = (await Promise.all(companies.map(async (c) => {
      const latest = await PriceHistory.findOne({ where: { symbol: c.symbol }, order: [['date', 'DESC']] });
      if (!latest) return null;
      return { symbol: c.symbol, name: c.name, current_price: latest.close, volume: Number(latest.volume ?? 0) };
    }))).filter(Boolean) as { symbol: string; name: string | null; current_price: number | null; volume: number }[];

    res.json({ data: active.sort((a, b) => b.volume - a.volume).slice(0, parseInt(limit as string)) });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}
