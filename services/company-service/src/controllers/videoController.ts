import { Request, Response } from 'express';
import { z } from 'zod';
import CompanyVideo from '../models/CompanyVideo';

function fmt(v: CompanyVideo): Record<string, unknown> {
  return {
    id:           v.id,
    ticker:       v.ticker,
    title:        v.title,
    url:          v.url,
    thumbnailUrl: v.thumbnail_url ?? null,
    durationSec:  v.duration_sec ?? null,
    source:       v.source ?? null,
    publishedAt:  v.published_at ? new Date(v.published_at).toISOString() : null,
    sortOrder:    v.sort_order,
  };
}

const schema = z.object({
  title:        z.string().min(1).max(300),
  url:          z.string().url(),
  thumbnailUrl: z.string().url().optional().nullable(),
  durationSec:  z.number().int().positive().optional().nullable(),
  source:       z.string().max(100).optional().nullable(),
  publishedAt:  z.string().datetime().optional().nullable(),
  sortOrder:    z.number().int().min(0).default(0),
  isPublished:  z.boolean().default(true),
});

// ── GET /api/companies/:ticker/videos ────────────────────────────────────────

export async function getVideos(req: Request, res: Response): Promise<void> {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const videos = await CompanyVideo.findAll({
      where: { ticker, is_published: true },
      order: [['sort_order', 'ASC'], ['published_at', 'DESC']],
    });
    res.json({ data: videos.map(fmt) });
  } catch (err) {
    console.error('[getVideos]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── POST /api/admin/companies/:ticker/videos ──────────────────────────────────

export async function createVideo(req: Request, res: Response): Promise<void> {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const data   = schema.parse(req.body);
    const video  = await CompanyVideo.create({
      ticker,
      title:         data.title,
      url:           data.url,
      thumbnail_url: data.thumbnailUrl ?? null,
      duration_sec:  data.durationSec  ?? null,
      source:        data.source       ?? null,
      published_at:  data.publishedAt  ? new Date(data.publishedAt) : null,
      sort_order:    data.sortOrder,
      is_published:  data.isPublished,
    });
    res.status(201).json({ data: fmt(video) });
  } catch (err: any) {
    if (err?.name === 'ZodError') { res.status(400).json({ error: 'Données invalides.', details: err.errors }); return; }
    console.error('[createVideo]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── PUT /api/admin/companies/:ticker/videos/:id ───────────────────────────────

export async function updateVideo(req: Request, res: Response): Promise<void> {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const video  = await CompanyVideo.findOne({ where: { id: req.params.id, ticker } });
    if (!video) { res.status(404).json({ error: 'Vidéo non trouvée.' }); return; }

    const data = schema.partial().parse(req.body);
    await video.update({
      ...(data.title        !== undefined && { title:         data.title }),
      ...(data.url          !== undefined && { url:           data.url }),
      ...('thumbnailUrl' in data          && { thumbnail_url: data.thumbnailUrl ?? null }),
      ...('durationSec'  in data          && { duration_sec:  data.durationSec  ?? null }),
      ...('source'       in data          && { source:        data.source        ?? null }),
      ...('publishedAt'  in data          && { published_at:  data.publishedAt ? new Date(data.publishedAt) : null }),
      ...(data.sortOrder    !== undefined && { sort_order:    data.sortOrder }),
      ...(data.isPublished  !== undefined && { is_published:  data.isPublished }),
    });
    res.json({ data: fmt(video) });
  } catch (err: any) {
    if (err?.name === 'ZodError') { res.status(400).json({ error: 'Données invalides.', details: err.errors }); return; }
    console.error('[updateVideo]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── DELETE /api/admin/companies/:ticker/videos/:id ────────────────────────────

export async function deleteVideo(req: Request, res: Response): Promise<void> {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const video  = await CompanyVideo.findOne({ where: { id: req.params.id, ticker } });
    if (!video) { res.status(404).json({ error: 'Vidéo non trouvée.' }); return; }
    await video.destroy();
    res.json({ data: { success: true } });
  } catch (err) {
    console.error('[deleteVideo]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}
