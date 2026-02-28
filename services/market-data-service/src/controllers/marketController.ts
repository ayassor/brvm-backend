import { Request, Response } from 'express';
import { Op } from 'sequelize';
import sequelize from '../config/database';

// On réutilise les modèles Company et StockPrice de la même DB
import { DataTypes, Model } from 'sequelize';

class Company extends Model {
  public id!: number; public name!: string; public ticker!: string;
  public sector!: string; public country!: string; public is_active!: boolean;
}
Company.init({
  id: { type: DataTypes.INTEGER, primaryKey: true },
  name: { type: DataTypes.STRING }, ticker: { type: DataTypes.STRING },
  sector: { type: DataTypes.STRING }, country: { type: DataTypes.STRING },
  is_active: { type: DataTypes.BOOLEAN },
}, { sequelize, tableName: 'companies', timestamps: false });

class StockPrice extends Model {
  public id!: number; public company_id!: number; public date!: string;
  public open!: number; public close!: number; public high!: number;
  public low!: number; public volume!: number;
}
StockPrice.init({
  id: { type: DataTypes.INTEGER, primaryKey: true },
  company_id: { type: DataTypes.INTEGER },
  date: { type: DataTypes.DATEONLY },
  open: { type: DataTypes.DECIMAL(10,2) }, close: { type: DataTypes.DECIMAL(10,2) },
  high: { type: DataTypes.DECIMAL(10,2) }, low: { type: DataTypes.DECIMAL(10,2) },
  volume: { type: DataTypes.BIGINT },
}, { sequelize, tableName: 'stock_prices', timestamps: false });

async function getLatestPriceForCompany(companyId: number) {
  return StockPrice.findOne({ where: { company_id: companyId }, order: [['date', 'DESC']] });
}

export async function getMarketOverview(req: Request, res: Response): Promise<void> {
  try {
    const companies = await Company.findAll({ where: { is_active: true } });
    let advances = 0, declines = 0, unchanged = 0;

    const stocks = await Promise.all(companies.map(async (c) => {
      const latest = await getLatestPriceForCompany(c.id);
      const prev = latest ? await StockPrice.findOne({
        where: { company_id: c.id, date: { [Op.lt]: latest.date } },
        order: [['date', 'DESC']],
      }) : null;
      const variation = latest && prev
        ? parseFloat(((latest.close - prev.close) / prev.close * 100).toFixed(2)) : 0;
      if (variation > 0) advances++;
      else if (variation < 0) declines++;
      else unchanged++;
      return {
        id: c.id, name: c.name, ticker: c.ticker, sector: c.sector, country: c.country,
        current_price: latest?.close ?? null, variation, volume: latest?.volume ?? 0,
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
    const companies = await Company.findAll({ where: { is_active: true } });
    const movers = (await Promise.all(companies.map(async (c) => {
      const latest = await getLatestPriceForCompany(c.id);
      if (!latest) return null;
      const prev = await StockPrice.findOne({
        where: { company_id: c.id, date: { [Op.lt]: latest.date } }, order: [['date', 'DESC']],
      });
      if (!prev) return null;
      const variation = parseFloat(((latest.close - prev.close) / prev.close * 100).toFixed(2));
      return { id: c.id, name: c.name, ticker: c.ticker, current_price: latest.close, variation, volume: latest.volume };
    }))).filter(Boolean) as { id: number; name: string; ticker: string; current_price: number; variation: number; volume: number }[];

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
    const companies = await Company.findAll({ where: { is_active: true } });
    const active = (await Promise.all(companies.map(async (c) => {
      const latest = await getLatestPriceForCompany(c.id);
      if (!latest) return null;
      return { id: c.id, name: c.name, ticker: c.ticker, current_price: latest.close, volume: latest.volume || 0 };
    }))).filter(Boolean) as { id: number; name: string; ticker: string; current_price: number; volume: number }[];

    const sorted = active.sort((a, b) => b.volume - a.volume);
    res.json({ data: sorted.slice(0, parseInt(limit as string)) });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}
