import { Request, Response } from 'express';
import { z } from 'zod';
import CompanySummary from '../models/CompanySummary';

function fmt(s: CompanySummary): Record<string, unknown> {
  return {
    ticker:        s.ticker,
    executiveText: s.executive_text ?? null,
    bullCase:      s.bull_case ?? [],
    bearCase:      s.bear_case ?? [],
    updatedAt:     new Date(s.updated_at).toISOString(),
  };
}

const schema = z.object({
  executive_text: z.string().optional().nullable(),
  bull_case:      z.array(z.string()).optional().nullable(),
  bear_case:      z.array(z.string()).optional().nullable(),
});

// ── GET /api/companies/:ticker/summary ────────────────────────────────────────

export async function getSummary(req: Request, res: Response): Promise<void> {
  try {
    const ticker  = req.params.ticker.toUpperCase();
    const summary = await CompanySummary.findOne({ where: { ticker } });
    if (!summary) {
      // Retourne un objet vide plutôt qu'un 404 — le front affiche un état vide
      res.json({ data: { ticker, executiveText: null, bullCase: [], bearCase: [], updatedAt: null } });
      return;
    }
    res.json({ data: fmt(summary) });
  } catch (err) {
    console.error('[getSummary]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── PUT /api/admin/companies/:ticker/summary ──────────────────────────────────

export async function upsertSummary(req: Request, res: Response): Promise<void> {
  try {
    const ticker   = req.params.ticker.toUpperCase();
    const data     = schema.parse(req.body);
    const adminId  = (req as any).userId ? String((req as any).userId) : (req.headers['x-user-email'] as string | undefined) ?? null;

    const updates: Partial<CompanySummary> = { updated_by: adminId } as any;
    if ('executive_text' in data) (updates as any).executive_text = data.executive_text ?? null;
    if ('bull_case'      in data) (updates as any).bull_case      = data.bull_case ?? null;
    if ('bear_case'      in data) (updates as any).bear_case      = data.bear_case ?? null;

    const [summary] = await CompanySummary.upsert({ ticker, ...updates } as any);
    const fresh     = await CompanySummary.findOne({ where: { ticker } });

    res.json({ data: fmt(fresh!) });
  } catch (err: any) {
    if (err?.name === 'ZodError') { res.status(400).json({ error: 'Données invalides.', details: err.errors }); return; }
    console.error('[upsertSummary]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}
