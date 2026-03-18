import { Request, Response } from 'express';
import { z } from 'zod';
import sequelize from '../config/database';
import CompanyRecommendation from '../models/CompanyRecommendation';
import CompanyThesisPoint    from '../models/CompanyThesisPoint';
import AnalystRecommendation from '../models/AnalystRecommendation';

// ── Helpers ───────────────────────────────────────────────────────────────────

function toNum(v: string | null | undefined): number | null {
  if (v == null) return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

function fmtThesis(points: CompanyThesisPoint[]) {
  const grouped: Record<string, any[]> = { bull: [], risk: [], exit: [] };
  for (const p of points) {
    grouped[p.type].push({ id: p.id, body: p.body, sortOrder: p.sort_order });
  }
  return grouped;
}

function fmtReco(r: CompanyRecommendation, thesis: CompanyThesisPoint[]): Record<string, unknown> {
  return {
    ticker:      r.ticker,
    consensus:   r.consensus,
    fairValue:   toNum(r.fair_value),
    buyPrice:    toNum(r.buy_price),
    stopLoss:    toNum(r.stop_loss),
    horizon:     r.horizon    ?? null,
    methodology: r.methodology ?? null,
    updatedAt:   new Date(r.updated_at).toISOString(),
    publishedAt: r.published_at ? new Date(r.published_at).toISOString() : null,
    thesis:      fmtThesis(thesis),
  };
}

function fmtAnalyst(a: AnalystRecommendation): Record<string, unknown> {
  return {
    id:           a.id,
    ticker:       a.ticker,
    firm:         a.firm,
    analystName:  a.analyst_name ?? null,
    consensus:    a.consensus,
    targetPrice:  toNum(a.target_price),
    publishedAt:  a.published_at ? new Date(a.published_at).toISOString() : null,
  };
}

const CONSENSUS = ['ACHAT FORT','ACHAT','NEUTRE','ALLÉGEMENT','VENTE'] as const;

const recoSchema = z.object({
  consensus:   z.enum(CONSENSUS).optional(),
  fair_value:  z.number().positive().optional().nullable(),
  buy_price:   z.number().positive().optional().nullable(),
  stop_loss:   z.number().positive().optional().nullable(),
  horizon:     z.string().max(100).optional().nullable(),
  methodology: z.string().optional().nullable(),
  published_at:z.string().datetime().optional().nullable(),
});

const thesisSchema = z.object({
  bull: z.array(z.object({ body: z.string().min(1), sort_order: z.number().int().min(0) })).optional(),
  risk: z.array(z.object({ body: z.string().min(1), sort_order: z.number().int().min(0) })).optional(),
  exit: z.array(z.object({ body: z.string().min(1), sort_order: z.number().int().min(0) })).optional(),
});

const analystSchema = z.object({
  firm:         z.string().min(1).max(200),
  analyst_name: z.string().max(200).optional().nullable(),
  consensus:    z.enum(CONSENSUS),
  target_price: z.number().positive().optional().nullable(),
  published_at: z.string().datetime().optional().nullable(),
});

// ── GET /api/companies/:ticker/recommendation ─────────────────────────────────

export async function getRecommendation(req: Request, res: Response): Promise<void> {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const [reco, thesis] = await Promise.all([
      CompanyRecommendation.findOne({ where: { ticker } }),
      CompanyThesisPoint.findAll({ where: { ticker }, order: [['type','ASC'],['sort_order','ASC']] }),
    ]);

    if (!reco) {
      res.status(404).json({ error: 'Aucune recommandation disponible pour ce ticker.' });
      return;
    }
    res.json({ data: fmtReco(reco, thesis) });
  } catch (err) {
    console.error('[getRecommendation]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── PUT /api/admin/companies/:ticker/recommendation ───────────────────────────

export async function upsertRecommendation(req: Request, res: Response): Promise<void> {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const data   = recoSchema.parse(req.body);

    const existing = await CompanyRecommendation.findOne({ where: { ticker } });

    if (existing) {
      const updates: any = {};
      if (data.consensus   !== undefined) updates.consensus    = data.consensus;
      if ('fair_value'  in data)          updates.fair_value   = data.fair_value  ?? null;
      if ('buy_price'   in data)          updates.buy_price    = data.buy_price   ?? null;
      if ('stop_loss'   in data)          updates.stop_loss    = data.stop_loss   ?? null;
      if ('horizon'     in data)          updates.horizon      = data.horizon     ?? null;
      if ('methodology' in data)          updates.methodology  = data.methodology ?? null;
      if ('published_at' in data)         updates.published_at = data.published_at ? new Date(data.published_at) : null;
      await existing.update(updates);
    } else {
      if (!data.consensus) { res.status(400).json({ error: 'Le champ consensus est requis à la création.' }); return; }
      await CompanyRecommendation.create({
        ticker,
        consensus:   data.consensus,
        fair_value:  data.fair_value  ?? null,
        buy_price:   data.buy_price   ?? null,
        stop_loss:   data.stop_loss   ?? null,
        horizon:     data.horizon     ?? null,
        methodology: data.methodology ?? null,
        published_at:data.published_at ? new Date(data.published_at) : null,
      } as any);
    }

    const [reco, thesis] = await Promise.all([
      CompanyRecommendation.findOne({ where: { ticker } }),
      CompanyThesisPoint.findAll({ where: { ticker }, order: [['type','ASC'],['sort_order','ASC']] }),
    ]);
    res.json({ data: fmtReco(reco!, thesis) });
  } catch (err: any) {
    if (err?.name === 'ZodError') { res.status(400).json({ error: 'Données invalides.', details: err.errors }); return; }
    console.error('[upsertRecommendation]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── PUT /api/admin/companies/:ticker/thesis ───────────────────────────────────
// Remplace complètement toutes les lignes du ticker (DELETE + INSERT)

export async function upsertThesis(req: Request, res: Response): Promise<void> {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const data   = thesisSchema.parse(req.body);

    await sequelize.transaction(async t => {
      const types = (['bull','risk','exit'] as const).filter(type => data[type] !== undefined);
      if (types.length > 0) {
        await CompanyThesisPoint.destroy({ where: { ticker, type: types }, transaction: t });
        const rows: any[] = [];
        for (const type of types) {
          for (const point of data[type] ?? []) {
            rows.push({ ticker, type, body: point.body, sort_order: point.sort_order });
          }
        }
        if (rows.length > 0) await CompanyThesisPoint.bulkCreate(rows, { transaction: t });
      }
    });

    const thesis = await CompanyThesisPoint.findAll({
      where: { ticker },
      order: [['type','ASC'],['sort_order','ASC']],
    });
    res.json({ data: fmtThesis(thesis) });
  } catch (err: any) {
    if (err?.name === 'ZodError') { res.status(400).json({ error: 'Données invalides.', details: err.errors }); return; }
    console.error('[upsertThesis]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── GET /api/companies/:ticker/analyst-recommendations ───────────────────────

export async function getAnalystRecommendations(req: Request, res: Response): Promise<void> {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const rows   = await AnalystRecommendation.findAll({
      where: { ticker },
      order: [['published_at', 'DESC']],
    });
    res.json({ data: rows.map(fmtAnalyst) });
  } catch (err) {
    console.error('[getAnalystRecommendations]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── POST /api/admin/companies/:ticker/analyst-recommendations ─────────────────

export async function createAnalystRecommendation(req: Request, res: Response): Promise<void> {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const data   = analystSchema.parse(req.body);
    const row    = await AnalystRecommendation.create({
      ticker,
      firm:         data.firm,
      analyst_name: data.analyst_name ?? null,
      consensus:    data.consensus,
      target_price: data.target_price ?? null,
      published_at: data.published_at ? new Date(data.published_at) : null,
    } as any);
    res.status(201).json({ data: fmtAnalyst(row) });
  } catch (err: any) {
    if (err?.name === 'ZodError') { res.status(400).json({ error: 'Données invalides.', details: err.errors }); return; }
    console.error('[createAnalystRecommendation]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── PUT /api/admin/companies/:ticker/analyst-recommendations/:id ──────────────

export async function updateAnalystRecommendation(req: Request, res: Response): Promise<void> {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const row    = await AnalystRecommendation.findOne({ where: { id: req.params.id, ticker } });
    if (!row) { res.status(404).json({ error: 'Recommandation analyste non trouvée.' }); return; }

    const data = analystSchema.partial().parse(req.body);
    await row.update({
      ...(data.firm         !== undefined && { firm:         data.firm }),
      ...('analyst_name' in data          && { analyst_name: data.analyst_name ?? null }),
      ...(data.consensus    !== undefined && { consensus:    data.consensus }),
      ...('target_price' in data          && { target_price: data.target_price ?? null }),
      ...('published_at' in data          && { published_at: data.published_at ? new Date(data.published_at) : null }),
    });
    res.json({ data: fmtAnalyst(row) });
  } catch (err: any) {
    if (err?.name === 'ZodError') { res.status(400).json({ error: 'Données invalides.', details: err.errors }); return; }
    console.error('[updateAnalystRecommendation]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── DELETE /api/admin/companies/:ticker/analyst-recommendations/:id ───────────

export async function deleteAnalystRecommendation(req: Request, res: Response): Promise<void> {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const row    = await AnalystRecommendation.findOne({ where: { id: req.params.id, ticker } });
    if (!row) { res.status(404).json({ error: 'Recommandation analyste non trouvée.' }); return; }
    await row.destroy();
    res.json({ data: { success: true } });
  } catch (err) {
    console.error('[deleteAnalystRecommendation]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}
