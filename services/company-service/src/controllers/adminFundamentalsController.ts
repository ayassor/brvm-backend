import { Request, Response } from 'express';
import { z } from 'zod';
import Company from '../models/Company';
import FinancialHistory from '../models/FinancialHistory';
import Shareholder from '../models/Shareholder';
import Dividend from '../models/Dividend';
import CompanyNews from '../models/CompanyNews';

// ── Schemas ───────────────────────────────────────────────────────────────────

const updateCompanySchema = z.object({
  ceo:            z.string().max(255).optional().nullable(),
  ceo_title:      z.string().max(255).optional().nullable(),
  founded:        z.number().int().optional().nullable(),
  employees:      z.number().int().optional().nullable(),
  website:        z.string().max(500).optional().nullable(),
  free_float_pct: z.number().optional().nullable(),
  activities:     z.array(z.string()).optional().nullable(),
  certifications: z.array(z.string()).optional().nullable(),
  shares_count:   z.number().int().optional().nullable(),
  description:    z.string().optional().nullable(),
  sector:         z.string().max(100).optional().nullable(),
  country:        z.string().max(100).optional().nullable(),
});

const financialHistoryRowSchema = z.object({
  year:                    z.number().int().min(1990).max(2100),
  revenue_m_fcfa:          z.number().optional().nullable(),
  ebitda_m_fcfa:           z.number().optional().nullable(),
  net_income_m_fcfa:       z.number().optional().nullable(),
  eps_fcfa:                z.number().optional().nullable(),
  pe_ratio:                z.number().optional().nullable(),
  dividend_per_share_fcfa: z.number().optional().nullable(),
});

const shareholderSchema = z.object({
  name: z.string().min(1).max(255),
  pct:  z.number().min(0).max(100),
  type: z.enum(['institutionnel', 'etat', 'public', 'fondateur']),
});

const createDividendSchema = z.object({
  year:         z.number().int().optional().nullable(),
  amount:       z.number().positive(),
  payment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  ex_date:      z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
});

const updateDividendSchema = createDividendSchema.partial();

const createNewsSchema = z.object({
  date:     z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  headline: z.string().min(1),
  positive: z.boolean().optional().nullable(),
});

// ── PUT /admin/companies/:ticker ──────────────────────────────────────────────

export async function updateCompanyInfo(req: Request, res: Response): Promise<void> {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const company = await Company.findOne({ where: { ticker } });
    if (!company) { res.status(404).json({ error: 'Société introuvable.' }); return; }

    const parsed = updateCompanySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Données invalides.', details: parsed.error.errors });
      return;
    }

    await company.update(parsed.data as Partial<Company>);
    res.json({ data: company });
  } catch (err) {
    console.error('[updateCompanyInfo]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── PUT /admin/companies/:ticker/financial-history ────────────────────────────

export async function upsertFinancialHistory(req: Request, res: Response): Promise<void> {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const company = await Company.findOne({ where: { ticker } });
    if (!company) { res.status(404).json({ error: 'Société introuvable.' }); return; }

    const rows = Array.isArray(req.body) ? req.body : [req.body];
    const parsed = z.array(financialHistoryRowSchema).safeParse(rows);
    if (!parsed.success) {
      res.status(400).json({ error: 'Données invalides.', details: parsed.error.errors });
      return;
    }

    const results = await Promise.all(parsed.data.map(async (row) => {
      const [record, created] = await FinancialHistory.findOrCreate({
        where: { ticker, year: row.year },
        defaults: {
          ticker,
          year:                    row.year,
          revenue_m_fcfa:          row.revenue_m_fcfa ?? null,
          ebitda_m_fcfa:           row.ebitda_m_fcfa ?? null,
          net_income_m_fcfa:       row.net_income_m_fcfa ?? null,
          eps_fcfa:                row.eps_fcfa ?? null,
          pe_ratio:                row.pe_ratio ?? null,
          dividend_per_share_fcfa: row.dividend_per_share_fcfa ?? null,
        },
      });
      if (!created) {
        await record.update({
          revenue_m_fcfa:          row.revenue_m_fcfa ?? null,
          ebitda_m_fcfa:           row.ebitda_m_fcfa ?? null,
          net_income_m_fcfa:       row.net_income_m_fcfa ?? null,
          eps_fcfa:                row.eps_fcfa ?? null,
          pe_ratio:                row.pe_ratio ?? null,
          dividend_per_share_fcfa: row.dividend_per_share_fcfa ?? null,
        });
      }
      return record;
    }));

    res.json({ data: results, count: results.length });
  } catch (err) {
    console.error('[upsertFinancialHistory]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── PUT /admin/companies/:ticker/shareholders ─────────────────────────────────

export async function replaceShareholders(req: Request, res: Response): Promise<void> {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const company = await Company.findOne({ where: { ticker } });
    if (!company) { res.status(404).json({ error: 'Société introuvable.' }); return; }

    const rows = Array.isArray(req.body) ? req.body : [req.body];
    const parsed = z.array(shareholderSchema).safeParse(rows);
    if (!parsed.success) {
      res.status(400).json({ error: 'Données invalides.', details: parsed.error.errors });
      return;
    }

    await Shareholder.destroy({ where: { ticker } });
    const created = await Shareholder.bulkCreate(
      parsed.data.map((s) => ({ ticker, name: s.name, pct: s.pct, type: s.type }))
    );

    res.json({ data: created, count: created.length });
  } catch (err) {
    console.error('[replaceShareholders]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── POST /admin/companies/:ticker/dividends ───────────────────────────────────

export async function createDividend(req: Request, res: Response): Promise<void> {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const company = await Company.findOne({ where: { ticker } });
    if (!company) { res.status(404).json({ error: 'Société introuvable.' }); return; }

    const parsed = createDividendSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Données invalides.', details: parsed.error.errors });
      return;
    }

    const dividend = await Dividend.create({
      ticker,
      year:         parsed.data.year ?? null,
      amount:       parsed.data.amount,
      payment_date: parsed.data.payment_date,
      ex_date:      parsed.data.ex_date ?? null,
    });

    res.status(201).json({ data: dividend });
  } catch (err) {
    console.error('[createDividend]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── PUT /admin/companies/:ticker/dividends/:id ────────────────────────────────

export async function updateDividend(req: Request, res: Response): Promise<void> {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const dividend = await Dividend.findOne({ where: { id: req.params.id, ticker } });
    if (!dividend) { res.status(404).json({ error: 'Dividende non trouvé.' }); return; }

    const parsed = updateDividendSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Données invalides.', details: parsed.error.errors });
      return;
    }

    await dividend.update(parsed.data as Partial<Dividend>);
    res.json({ data: dividend });
  } catch (err) {
    console.error('[updateDividend]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── DELETE /admin/companies/:ticker/dividends/:id ─────────────────────────────

export async function deleteDividend(req: Request, res: Response): Promise<void> {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const dividend = await Dividend.findOne({ where: { id: req.params.id, ticker } });
    if (!dividend) { res.status(404).json({ error: 'Dividende non trouvé.' }); return; }

    await dividend.destroy();
    res.json({ data: { success: true } });
  } catch (err) {
    console.error('[deleteDividend]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── POST /admin/companies/:ticker/news ────────────────────────────────────────

export async function createNews(req: Request, res: Response): Promise<void> {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const company = await Company.findOne({ where: { ticker } });
    if (!company) { res.status(404).json({ error: 'Société introuvable.' }); return; }

    const parsed = createNewsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Données invalides.', details: parsed.error.errors });
      return;
    }

    const news = await CompanyNews.create({
      ticker,
      date:     parsed.data.date,
      headline: parsed.data.headline,
      positive: parsed.data.positive ?? null,
    });

    res.status(201).json({ data: news });
  } catch (err) {
    console.error('[createNews]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── DELETE /admin/companies/:ticker/news/:id ──────────────────────────────────

export async function deleteNews(req: Request, res: Response): Promise<void> {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const news = await CompanyNews.findOne({ where: { id: req.params.id, ticker } });
    if (!news) { res.status(404).json({ error: 'Actualité non trouvée.' }); return; }

    await news.destroy();
    res.json({ data: { success: true } });
  } catch (err) {
    console.error('[deleteNews]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}
