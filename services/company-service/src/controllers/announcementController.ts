import { Request, Response } from 'express';
import { z } from 'zod';
import CompanyAnnouncement from '../models/CompanyAnnouncement';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatAnnouncement(a: CompanyAnnouncement): Record<string, unknown> {
  return {
    id:          a.id,
    ticker:      a.ticker,
    category:    a.category,
    title:       a.title,
    body:        a.body,
    publishedAt: new Date(a.published_at).toISOString(),
    isPublished: Boolean(a.is_published),
    source:      a.source ?? null,
  };
}

const VALID_CATEGORIES = [
  'Résultats','AGO','Dividende','Partenariat','Nomination','Stratégie','Autre',
] as const;

const createSchema = z.object({
  category:    z.enum(VALID_CATEGORIES),
  title:       z.string().min(1).max(500),
  body:        z.string().min(1),
  publishedAt: z.string().datetime(),
  isPublished: z.boolean().default(true),
  source:      z.string().max(200).optional().nullable(),
});

const updateSchema = createSchema.partial();

// ── GET /api/companies/:ticker/announcements ──────────────────────────────────

export async function getAnnouncements(req: Request, res: Response): Promise<void> {
  try {
    const ticker  = req.params.ticker.toUpperCase();
    const page    = Math.max(1, parseInt(String(req.query.page  ?? '1')));
    const limit   = Math.min(50, Math.max(1, parseInt(String(req.query.limit ?? '10'))));
    const offset  = (page - 1) * limit;

    const where: Record<string, unknown> = { ticker, is_published: true };
    if (req.query.category) where.category = req.query.category;

    const { count, rows } = await CompanyAnnouncement.findAndCountAll({
      where,
      order:  [['published_at', 'DESC']],
      limit,
      offset,
    });

    res.json({
      data: rows.map(formatAnnouncement),
      meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    });
  } catch (err) {
    console.error('[getAnnouncements]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── POST /api/admin/companies/:ticker/announcements ───────────────────────────

export async function createAnnouncement(req: Request, res: Response): Promise<void> {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const data   = createSchema.parse(req.body);

    const announcement = await CompanyAnnouncement.create({
      ticker,
      category:    data.category,
      title:       data.title,
      body:        data.body,
      published_at: new Date(data.publishedAt),
      is_published: data.isPublished,
      source:      data.source ?? null,
    });

    res.status(201).json({ data: formatAnnouncement(announcement) });
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      res.status(400).json({ error: 'Données invalides.', details: err.errors });
      return;
    }
    console.error('[createAnnouncement]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── PUT /api/admin/companies/:ticker/announcements/:id ────────────────────────

export async function updateAnnouncement(req: Request, res: Response): Promise<void> {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const ann    = await CompanyAnnouncement.findOne({ where: { id: req.params.id, ticker } });
    if (!ann) { res.status(404).json({ error: 'Communiqué non trouvé.' }); return; }

    const data    = updateSchema.parse(req.body);
    const updates: Partial<CompanyAnnouncement> = {};

    if (data.category    !== undefined) updates.category     = data.category;
    if (data.title       !== undefined) updates.title        = data.title;
    if (data.body        !== undefined) updates.body         = data.body;
    if (data.publishedAt !== undefined) updates.published_at = new Date(data.publishedAt) as any;
    if (data.isPublished !== undefined) updates.is_published = data.isPublished as any;
    if ('source' in data)               updates.source       = data.source ?? null;

    await ann.update(updates);
    res.json({ data: formatAnnouncement(ann) });
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      res.status(400).json({ error: 'Données invalides.', details: err.errors });
      return;
    }
    console.error('[updateAnnouncement]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── DELETE /api/admin/companies/:ticker/announcements/:id ─────────────────────

export async function deleteAnnouncement(req: Request, res: Response): Promise<void> {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const ann    = await CompanyAnnouncement.findOne({ where: { id: req.params.id, ticker } });
    if (!ann) { res.status(404).json({ error: 'Communiqué non trouvé.' }); return; }

    await ann.destroy();
    res.json({ data: { success: true } });
  } catch (err) {
    console.error('[deleteAnnouncement]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}
