import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { z } from 'zod';
import sequelize from '../config/database';
import NewsArticle from '../models/NewsArticle';
import NewsTag from '../models/NewsTag';
import NewsArticleTag from '../models/NewsArticleTag';
import NewsCompanyLink from '../models/NewsCompanyLink';

// ── Associations (idempotent) ─────────────────────────────────────────────────
NewsArticle.belongsToMany(NewsTag, {
  through: NewsArticleTag,
  foreignKey: 'article_id',
  otherKey: 'tag_id',
  as: 'tags',
});
NewsTag.belongsToMany(NewsArticle, {
  through: NewsArticleTag,
  foreignKey: 'tag_id',
  otherKey: 'article_id',
});
NewsArticle.hasMany(NewsCompanyLink, { foreignKey: 'article_id', as: 'companyLinks' });
NewsCompanyLink.belongsTo(NewsArticle, { foreignKey: 'article_id' });

// ── Constants ─────────────────────────────────────────────────────────────────
const VALID_CATEGORIES = [
  'Marché', 'Résultats', 'Dividendes', 'Analyse', 'Corporate', 'Macro', 'Indice',
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function calculateReadingTime(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.ceil(words / 200) || 1;
}

function formatArticle(article: NewsArticle, includeBody = false): Record<string, unknown> {
  const tags: string[] = (article.tags ?? []).map((t: any) => t.name);

  const result: Record<string, unknown> = {
    id:          Number(article.id),
    title:       article.title,
    summary:     article.summary,
    category:    article.category,
    source:      article.source,
    author:      article.author ?? null,
    date:        new Date(article.published_at).toISOString(),
    isPositive:  article.is_positive === null ? null : Boolean(article.is_positive),
    tags,
    readingTime: article.reading_time,
  };

  if (includeBody) result.body = article.body;
  return result;
}

const tagsInclude = {
  model: NewsTag,
  as: 'tags',
  through: { attributes: [] },
  attributes: ['name'],
};

async function fetchFullArticle(id: number | string): Promise<NewsArticle | null> {
  return NewsArticle.findOne({
    where: { id, is_published: true },
    include: [tagsInclude],
  });
}

// ── GET /news ─────────────────────────────────────────────────────────────────

export async function listNews(req: Request, res: Response): Promise<void> {
  try {
    const page    = Math.max(1, parseInt(String(req.query.page  ?? '1')));
    const limit   = Math.min(50, Math.max(1, parseInt(String(req.query.limit ?? '20'))));
    const offset  = (page - 1) * limit;
    const { category, tag, ticker, search, sort = 'date_desc' } = req.query as Record<string, string>;

    const where: Record<string, unknown> = { is_published: true };
    if (category) where.category = category;

    // Build include for tags
    const tagsIncludeLocal: any = { ...tagsInclude };
    if (tag) {
      tagsIncludeLocal.where    = { name: tag };
      tagsIncludeLocal.required = true;
    }

    const include: any[] = [tagsIncludeLocal];

    // Filter by ticker
    if (ticker) {
      include.push({
        model:      NewsCompanyLink,
        as:         'companyLinks',
        where:      { ticker: ticker.toUpperCase() },
        required:   true,
        attributes: [],
      });
    }

    // Full-text search on title, summary, or tags
    if (search) {
      const like = `%${search}%`;
      const matchingTags = await NewsTag.findAll({ where: { name: { [Op.like]: like } }, attributes: ['id'] });
      const matchingTagIds = matchingTags.map((t: any) => Number(t.id));
      let tagArticleIds: number[] = [];
      if (matchingTagIds.length > 0) {
        const rows = await NewsArticleTag.findAll({
          where: { tag_id: { [Op.in]: matchingTagIds } },
          attributes: ['article_id'],
        });
        tagArticleIds = [...new Set(rows.map((r: any) => Number(r.article_id)))];
      }

      const orConditions: any[] = [
        { title:   { [Op.like]: like } },
        { summary: { [Op.like]: like } },
      ];
      if (tagArticleIds.length > 0) orConditions.push({ id: { [Op.in]: tagArticleIds } });
      where[Op.or as any] = orConditions;
    }

    // Sort
    const ORDER_MAP: Record<string, [string, string]> = {
      date_desc:  ['published_at', 'DESC'],
      date_asc:   ['published_at', 'ASC'],
      views_desc: ['views_count',  'DESC'],
    };
    const order: any[] = [ORDER_MAP[sort] ?? ORDER_MAP.date_desc];

    const { count, rows } = await NewsArticle.findAndCountAll({
      where,
      include,
      order,
      limit,
      offset,
      distinct: true,
      attributes: { exclude: ['body'] },
    });

    res.json({
      data: rows.map(a => formatArticle(a)),
      meta: {
        total:      count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    console.error('[listNews]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── GET /news/categories ──────────────────────────────────────────────────────

export async function getNewsCategories(_req: Request, res: Response): Promise<void> {
  try {
    const rows = await NewsArticle.findAll({
      where:      { is_published: true },
      attributes: ['category', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group:      ['category'],
      raw:        true,
    }) as any[];

    const countMap = new Map<string, number>(rows.map(r => [r.category, parseInt(r.count)]));

    const data = VALID_CATEGORIES.map(name => ({
      name,
      count: countMap.get(name) ?? 0,
    }));

    res.json({ data });
  } catch (err) {
    console.error('[getNewsCategories]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── GET /news/:id ─────────────────────────────────────────────────────────────

export async function getNewsById(req: Request, res: Response): Promise<void> {
  try {
    const article = await fetchFullArticle(req.params.id);
    if (!article) {
      res.status(404).json({ error: 'Article non trouvé.' });
      return;
    }

    // Increment views_count asynchronously (don't await)
    NewsArticle.increment('views_count', { where: { id: article.id } }).catch(() => {});

    // Find related: same category OR shares a tag
    const tagNames: string[] = (article.tags ?? []).map((t: any) => t.name);

    let tagArticleIds: number[] = [];
    if (tagNames.length > 0) {
      const matchingTags = await NewsTag.findAll({ where: { name: { [Op.in]: tagNames } }, attributes: ['id'] });
      const matchingTagIds = matchingTags.map((t: any) => Number(t.id));
      if (matchingTagIds.length > 0) {
        const rows = await NewsArticleTag.findAll({
          where: { tag_id: { [Op.in]: matchingTagIds }, article_id: { [Op.ne]: article.id } },
          attributes: ['article_id'],
        });
        tagArticleIds = [...new Set(rows.map((r: any) => Number(r.article_id)))];
      }
    }

    const relatedOrConditions: any[] = [{ category: article.category }];
    if (tagArticleIds.length > 0) relatedOrConditions.push({ id: { [Op.in]: tagArticleIds } });

    const related = await NewsArticle.findAll({
      where: {
        id:           { [Op.ne]: article.id },
        is_published: true,
        [Op.or]:      relatedOrConditions,
      },
      include:    [tagsInclude],
      order:      [['published_at', 'DESC']],
      limit:      3,
      attributes: { exclude: ['body'] },
    });

    res.json({
      data: {
        ...formatArticle(article, true),
        related: related.map(a => formatArticle(a)),
      },
    });
  } catch (err) {
    console.error('[getNewsById]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── GET /companies/:ticker/news ───────────────────────────────────────────────

export async function getNewsByTicker(req: Request, res: Response): Promise<void> {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const limit  = Math.min(20, Math.max(1, parseInt(String(req.query.limit ?? '10'))));

    const links = await NewsCompanyLink.findAll({
      where:      { ticker },
      attributes: ['article_id'],
    });

    if (links.length === 0) {
      res.json({ data: [] });
      return;
    }

    const articleIds = links.map((l: any) => Number(l.article_id));

    const articles = await NewsArticle.findAll({
      where:      { id: { [Op.in]: articleIds }, is_published: true },
      include:    [tagsInclude],
      order:      [['published_at', 'DESC']],
      limit,
      attributes: { exclude: ['body'] },
    });

    res.json({ data: articles.map(a => formatArticle(a)) });
  } catch (err) {
    console.error('[getNewsByTicker]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── Validation schemas ────────────────────────────────────────────────────────

const createSchema = z.object({
  title:       z.string().min(1).max(500),
  summary:     z.string().min(1).max(1000),
  body:        z.string().min(100),
  category:    z.enum(VALID_CATEGORIES),
  source:      z.string().min(1),
  author:      z.string().nullable().optional(),
  publishedAt: z.string().datetime(),
  isPositive:  z.boolean().nullable().optional(),
  tags:        z.array(z.string().max(100)).default([]),
  tickers:     z.array(z.string().max(10)).default([]),
  isPublished: z.boolean().default(true),
});

const updateSchema = createSchema.partial();

// ── Helper: sync tags & tickers inside a transaction ─────────────────────────

async function syncTags(articleId: number, tagNames: string[], t: any): Promise<void> {
  await NewsArticleTag.destroy({ where: { article_id: articleId }, transaction: t });
  if (tagNames.length === 0) return;
  const tagRecords = await Promise.all(
    tagNames.map(name => NewsTag.findOrCreate({ where: { name }, transaction: t })),
  );
  await NewsArticleTag.bulkCreate(
    tagRecords.map(([tag]: any) => ({ article_id: articleId, tag_id: tag.id })),
    { transaction: t },
  );
}

async function syncTickers(articleId: number, tickers: string[], t: any): Promise<void> {
  await NewsCompanyLink.destroy({ where: { article_id: articleId }, transaction: t });
  if (tickers.length === 0) return;
  await NewsCompanyLink.bulkCreate(
    tickers.map(ticker => ({ article_id: articleId, ticker: ticker.toUpperCase() })),
    { transaction: t },
  );
}

// ── POST /admin/news ──────────────────────────────────────────────────────────

export async function createNews(req: Request, res: Response): Promise<void> {
  try {
    const data = createSchema.parse(req.body);

    const article = await sequelize.transaction(async t => {
      const a = await NewsArticle.create(
        {
          title:        data.title,
          summary:      data.summary,
          body:         data.body,
          category:     data.category,
          source:       data.source,
          author:       data.author ?? null,
          published_at: new Date(data.publishedAt),
          is_positive:  data.isPositive ?? null,
          reading_time: calculateReadingTime(data.body),
          is_published: data.isPublished ?? true,
        },
        { transaction: t },
      );
      await syncTags(Number(a.id), data.tags, t);
      await syncTickers(Number(a.id), data.tickers, t);
      return a;
    });

    const full = await fetchFullArticle(Number(article.id));
    if (!full) {
      res.status(500).json({ error: 'Erreur lors de la création.' });
      return;
    }
    res.status(201).json({ data: formatArticle(full, true) });
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      res.status(400).json({ error: 'Données invalides.', details: err.errors });
      return;
    }
    console.error('[createNews]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── PUT /admin/news/:id ───────────────────────────────────────────────────────

export async function updateNews(req: Request, res: Response): Promise<void> {
  try {
    const article = await NewsArticle.findByPk(req.params.id);
    if (!article) {
      res.status(404).json({ error: 'Article non trouvé.' });
      return;
    }

    const data = updateSchema.parse(req.body);

    await sequelize.transaction(async t => {
      const updates: Partial<NewsArticle> = {};
      if (data.title       !== undefined) updates.title        = data.title;
      if (data.summary     !== undefined) updates.summary      = data.summary;
      if (data.body        !== undefined) {
        updates.body         = data.body;
        updates.reading_time = calculateReadingTime(data.body);
      }
      if (data.category    !== undefined) updates.category     = data.category;
      if (data.source      !== undefined) updates.source       = data.source;
      if ('author'     in data)           updates.author       = data.author ?? null;
      if (data.publishedAt !== undefined) updates.published_at = new Date(data.publishedAt) as any;
      if ('isPositive' in data)           updates.is_positive  = data.isPositive ?? null;
      if (data.isPublished !== undefined) updates.is_published = data.isPublished as any;

      if (Object.keys(updates).length > 0) {
        await article.update(updates, { transaction: t });
      }
      if (data.tags    !== undefined) await syncTags(Number(article.id), data.tags, t);
      if (data.tickers !== undefined) await syncTickers(Number(article.id), data.tickers, t);
    });

    const full = await fetchFullArticle(Number(article.id));
    res.json({ data: formatArticle(full!, true) });
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      res.status(400).json({ error: 'Données invalides.', details: err.errors });
      return;
    }
    console.error('[updateNews]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── DELETE /admin/news/:id ────────────────────────────────────────────────────

export async function deleteNews(req: Request, res: Response): Promise<void> {
  try {
    const article = await NewsArticle.findByPk(req.params.id);
    if (!article) {
      res.status(404).json({ error: 'Article non trouvé.' });
      return;
    }
    await article.update({ is_published: false });
    res.json({ data: { success: true } });
  } catch (err) {
    console.error('[deleteNews]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── POST /admin/news/:id/publish ──────────────────────────────────────────────

export async function publishNews(req: Request, res: Response): Promise<void> {
  try {
    const article = await NewsArticle.findByPk(req.params.id);
    if (!article) {
      res.status(404).json({ error: 'Article non trouvé.' });
      return;
    }
    await article.update({ is_published: true });
    res.json({ data: { id: Number(article.id), isPublished: true } });
  } catch (err) {
    console.error('[publishNews]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── POST /admin/news/:id/unpublish ────────────────────────────────────────────

export async function unpublishNews(req: Request, res: Response): Promise<void> {
  try {
    const article = await NewsArticle.findByPk(req.params.id);
    if (!article) {
      res.status(404).json({ error: 'Article non trouvé.' });
      return;
    }
    await article.update({ is_published: false });
    res.json({ data: { id: Number(article.id), isPublished: false } });
  } catch (err) {
    console.error('[unpublishNews]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}
