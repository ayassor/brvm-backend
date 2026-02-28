import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { z } from 'zod';
import Company from '../models/Company';
import StockPrice from '../models/StockPrice';
import Dividend from '../models/Dividend';
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

    // Enrichir avec le dernier cours pour chaque société
    const enriched = await Promise.all(companies.map(async (c) => {
      const latest = await StockPrice.findOne({
        where: { company_id: c.id },
        order: [['date', 'DESC']],
      });
      const prev = latest ? await StockPrice.findOne({
        where: { company_id: c.id, date: { [Op.lt]: latest.date } },
        order: [['date', 'DESC']],
      }) : null;
      const variation = latest && prev ? ((latest.close - prev.close) / prev.close * 100) : 0;
      return {
        ...c.toJSON(),
        current_price: latest?.close ?? null,
        variation: parseFloat(variation.toFixed(2)),
        volume: latest?.volume ?? 0,
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
      where: { company_id: company.id }, order: [['date', 'DESC']],
    });
    const prevPrice = latestPrice ? await StockPrice.findOne({
      where: { company_id: company.id, date: { [Op.lt]: latestPrice.date } },
      order: [['date', 'DESC']],
    }) : null;
    const variation = latestPrice && prevPrice
      ? ((latestPrice.close - prevPrice.close) / prevPrice.close * 100) : 0;

    res.json({
      ...company.toJSON(),
      current_price: latestPrice?.close ?? null,
      variation: parseFloat(variation.toFixed(2)),
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

export async function getPriceHistory(req: Request, res: Response): Promise<void> {
  try {
    const { period = '1m' } = req.query;
    const periodDays: Record<string, number> = { '1d': 1, '1w': 7, '1m': 30, '3m': 90, '1y': 365, '5y': 1825 };
    const days = periodDays[period as string] || 30;
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const prices = await StockPrice.findAll({
      where: {
        company_id: req.params.id,
        date: { [Op.gte]: fromDate.toISOString().split('T')[0] },
      },
      order: [['date', 'ASC']],
    });
    res.json({ data: prices, period, count: prices.length });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

export async function getDividends(req: Request, res: Response): Promise<void> {
  try {
    const dividends = await Dividend.findAll({
      where: { company_id: req.params.id },
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

export async function addStockPrice(req: AuthRequest, res: Response): Promise<void> {
  const { date, open, close, high, low, volume } = req.body;
  if (!date || !close) { res.status(400).json({ error: 'date et close sont requis.' }); return; }
  try {
    const [price, created] = await StockPrice.findOrCreate({
      where: { company_id: req.params.id, date },
      defaults: { company_id: parseInt(req.params.id), date, open, close, high, low, volume: volume || 0 },
    });
    if (!created) await price.update({ open, close, high, low, volume });
    res.status(201).json(price);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}
