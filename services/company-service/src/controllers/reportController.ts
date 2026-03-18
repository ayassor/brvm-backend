import { Request, Response } from 'express';
import { z } from 'zod';
import CompanyReport from '../models/CompanyReport';
import { uploadPdfToS3 } from '../utils/s3Upload';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatReport(r: CompanyReport): Record<string, unknown> {
  return {
    id:          r.id,
    ticker:      r.ticker,
    year:        r.year,
    type:        r.type,
    label:       r.label,
    source:      r.source,
    fileUrl:     r.file_url ?? null,
    fileSizeKb:  r.file_size_kb ?? null,
    pageCount:   r.page_count ?? null,
    isPublished: Boolean(r.is_published),
    publishedAt: r.published_at ? new Date(r.published_at).toISOString() : null,
  };
}

const createSchema = z.object({
  year:        z.number().int().min(2000).max(2100),
  type:        z.enum(['annual', 'semi_annual', 'quarterly']),
  label:       z.string().min(1).max(100),
  source:      z.string().min(1).max(200),
  file_url:    z.string().url().optional().nullable(),
  file_size_kb:z.number().int().positive().optional().nullable(),
  page_count:  z.number().int().positive().optional().nullable(),
  is_published:z.boolean().default(false),
  published_at:z.string().datetime().optional().nullable(),
});

const updateSchema = createSchema.partial();

// ── GET /api/companies/:ticker/reports ────────────────────────────────────────

export async function getReports(req: Request, res: Response): Promise<void> {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const where: Record<string, unknown> = { ticker, is_published: true };
    if (req.query.year) where.year = parseInt(String(req.query.year));

    const reports = await CompanyReport.findAll({
      where,
      order: [['year', 'DESC'], ['type', 'ASC']],
    });

    res.json({ data: reports.map(formatReport) });
  } catch (err) {
    console.error('[getReports]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── POST /api/admin/companies/:ticker/reports ─────────────────────────────────

export async function createReport(req: Request, res: Response): Promise<void> {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const data   = createSchema.parse(req.body);

    const report = await CompanyReport.create({
      ticker,
      year:         data.year,
      type:         data.type,
      label:        data.label,
      source:       data.source,
      file_url:     data.file_url ?? null,
      file_size_kb: data.file_size_kb ?? null,
      page_count:   data.page_count ?? null,
      is_published: data.is_published,
      published_at: data.published_at ? new Date(data.published_at) : null,
    });

    res.status(201).json({ data: formatReport(report) });
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      res.status(400).json({ error: 'Données invalides.', details: err.errors });
      return;
    }
    console.error('[createReport]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── PUT /api/admin/companies/:ticker/reports/:id ──────────────────────────────

export async function updateReport(req: Request, res: Response): Promise<void> {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const report = await CompanyReport.findOne({ where: { id: req.params.id, ticker } });
    if (!report) { res.status(404).json({ error: 'Rapport non trouvé.' }); return; }

    const data    = updateSchema.parse(req.body);
    const updates: Partial<CompanyReport> = {};

    if (data.year        !== undefined) updates.year         = data.year;
    if (data.type        !== undefined) updates.type         = data.type;
    if (data.label       !== undefined) updates.label        = data.label;
    if (data.source      !== undefined) updates.source       = data.source;
    if ('file_url'    in data)          updates.file_url     = data.file_url ?? null;
    if ('file_size_kb' in data)         updates.file_size_kb = data.file_size_kb ?? null;
    if ('page_count'  in data)          updates.page_count   = data.page_count ?? null;
    if (data.is_published !== undefined) updates.is_published = data.is_published as any;
    if ('published_at' in data)         updates.published_at = data.published_at ? new Date(data.published_at) as any : null;

    await report.update(updates);
    res.json({ data: formatReport(report) });
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      res.status(400).json({ error: 'Données invalides.', details: err.errors });
      return;
    }
    console.error('[updateReport]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── DELETE /api/admin/companies/:ticker/reports/:id ───────────────────────────

export async function deleteReport(req: Request, res: Response): Promise<void> {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const report = await CompanyReport.findOne({ where: { id: req.params.id, ticker } });
    if (!report) { res.status(404).json({ error: 'Rapport non trouvé.' }); return; }

    await report.destroy();
    res.json({ data: { success: true } });
  } catch (err) {
    console.error('[deleteReport]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── POST /api/admin/companies/:ticker/reports/:id/upload ──────────────────────

export async function uploadReport(req: Request, res: Response): Promise<void> {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const report = await CompanyReport.findOne({ where: { id: req.params.id, ticker } });
    if (!report) { res.status(404).json({ error: 'Rapport non trouvé.' }); return; }

    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) {
      res.status(400).json({ error: 'Aucun fichier reçu. Envoyez un PDF dans le champ "file".' });
      return;
    }
    if (file.mimetype !== 'application/pdf') {
      res.status(400).json({ error: 'Seuls les fichiers PDF sont acceptés.' });
      return;
    }

    let uploadResult: { url: string; fileSizeKb: number };
    try {
      uploadResult = await uploadPdfToS3(file.buffer, file.originalname, ticker, report.id);
    } catch (s3Err: any) {
      res.status(501).json({ error: s3Err.message });
      return;
    }

    await report.update({
      file_url:     uploadResult.url,
      file_size_kb: uploadResult.fileSizeKb,
    });

    res.json({ data: formatReport(report) });
  } catch (err) {
    console.error('[uploadReport]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}
