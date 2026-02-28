import { Response } from 'express';
import axios from 'axios';
import { z } from 'zod';
import Portfolio from '../models/Portfolio';
import PortfolioPosition from '../models/PortfolioPosition';
import PortfolioTransaction from '../models/PortfolioTransaction';
import { AuthRequest } from '../middleware/auth';

const COMPANY_SERVICE_URL = process.env.COMPANY_SERVICE_URL!;

async function getLatestPrice(companyId: number): Promise<number | null> {
  try {
    const res = await axios.get(`${COMPANY_SERVICE_URL}/companies/${companyId}/prices?period=1d`);
    const prices = res.data.data as { close: number }[];
    return prices.length > 0 ? prices[prices.length - 1].close : null;
  } catch { return null; }
}

export async function listPortfolios(req: AuthRequest, res: Response): Promise<void> {
  try {
    const portfolios = await Portfolio.findAll({ where: { user_id: req.userId } });
    res.json({ data: portfolios });
  } catch (err) { res.status(500).json({ error: 'Erreur serveur.' }); }
}

export async function createPortfolio(req: AuthRequest, res: Response): Promise<void> {
  const schema = z.object({ name: z.string().optional(), initial_capital: z.number().positive() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }
  try {
    const portfolio = await Portfolio.create({
      user_id: req.userId!,
      name: parsed.data.name || 'Mon Portefeuille',
      initial_capital: parsed.data.initial_capital,
      cash_balance: parsed.data.initial_capital,
    });
    res.status(201).json(portfolio);
  } catch (err) { res.status(500).json({ error: 'Erreur serveur.' }); }
}

export async function getPortfolio(req: AuthRequest, res: Response): Promise<void> {
  try {
    const portfolio = await Portfolio.findOne({ where: { id: req.params.id, user_id: req.userId } });
    if (!portfolio) { res.status(404).json({ error: 'Portefeuille introuvable.' }); return; }

    const positions = await PortfolioPosition.findAll({ where: { portfolio_id: portfolio.id } });
    const enrichedPositions = await Promise.all(positions.map(async (pos) => {
      const currentPrice = await getLatestPrice(pos.company_id);
      const currentValue = currentPrice ? currentPrice * pos.quantity : pos.avg_buy_price * pos.quantity;
      const costBasis = pos.avg_buy_price * pos.quantity;
      const pnl = currentValue - costBasis;
      const pnlPercent = costBasis > 0 ? (pnl / costBasis * 100) : 0;
      return { ...pos.toJSON(), current_price: currentPrice, current_value: currentValue,
        pnl: parseFloat(pnl.toFixed(2)), pnl_percent: parseFloat(pnlPercent.toFixed(2)) };
    }));

    const positionsValue = enrichedPositions.reduce((sum, p) => sum + p.current_value, 0);
    const totalValue = portfolio.cash_balance + positionsValue;
    const totalPnl = totalValue - portfolio.initial_capital;
    const totalPnlPercent = portfolio.initial_capital > 0 ? (totalPnl / portfolio.initial_capital * 100) : 0;

    res.json({
      ...portfolio.toJSON(),
      positions: enrichedPositions,
      total_value: parseFloat(totalValue.toFixed(2)),
      positions_value: parseFloat(positionsValue.toFixed(2)),
      total_pnl: parseFloat(totalPnl.toFixed(2)),
      total_pnl_percent: parseFloat(totalPnlPercent.toFixed(2)),
    });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur serveur.' }); }
}

export async function buyStock(req: AuthRequest, res: Response): Promise<void> {
  const schema = z.object({ company_id: z.number().int().positive(), ticker: z.string(), quantity: z.number().int().positive(), price: z.number().positive() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }
  const { company_id, ticker, quantity, price } = parsed.data;
  const total = quantity * price;
  try {
    const portfolio = await Portfolio.findOne({ where: { id: req.params.id, user_id: req.userId } });
    if (!portfolio) { res.status(404).json({ error: 'Portefeuille introuvable.' }); return; }
    if (portfolio.cash_balance < total) { res.status(400).json({ error: 'Solde insuffisant.' }); return; }

    const [position] = await PortfolioPosition.findOrCreate({
      where: { portfolio_id: portfolio.id, company_id },
      defaults: { portfolio_id: portfolio.id, company_id, ticker, quantity: 0, avg_buy_price: price },
    });

    const newQty = position.quantity + quantity;
    const newAvgPrice = (position.avg_buy_price * position.quantity + price * quantity) / newQty;
    await position.update({ quantity: newQty, avg_buy_price: parseFloat(newAvgPrice.toFixed(2)) });
    await portfolio.update({ cash_balance: parseFloat((portfolio.cash_balance - total).toFixed(2)) });
    await PortfolioTransaction.create({ portfolio_id: portfolio.id, company_id, ticker, type: 'BUY', quantity, price, total });

    res.status(201).json({ message: `Achat de ${quantity} action(s) ${ticker} à ${price} FCFA.`, transaction: { type: 'BUY', quantity, price, total } });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur serveur.' }); }
}

export async function sellStock(req: AuthRequest, res: Response): Promise<void> {
  const schema = z.object({ company_id: z.number().int().positive(), ticker: z.string(), quantity: z.number().int().positive(), price: z.number().positive() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }
  const { company_id, ticker, quantity, price } = parsed.data;
  const total = quantity * price;
  try {
    const portfolio = await Portfolio.findOne({ where: { id: req.params.id, user_id: req.userId } });
    if (!portfolio) { res.status(404).json({ error: 'Portefeuille introuvable.' }); return; }
    const position = await PortfolioPosition.findOne({ where: { portfolio_id: portfolio.id, company_id } });
    if (!position || position.quantity < quantity) { res.status(400).json({ error: 'Quantité insuffisante.' }); return; }

    const newQty = position.quantity - quantity;
    if (newQty === 0) await position.destroy();
    else await position.update({ quantity: newQty });

    await portfolio.update({ cash_balance: parseFloat((portfolio.cash_balance + total).toFixed(2)) });
    await PortfolioTransaction.create({ portfolio_id: portfolio.id, company_id, ticker, type: 'SELL', quantity, price, total });

    res.json({ message: `Vente de ${quantity} action(s) ${ticker} à ${price} FCFA.`, transaction: { type: 'SELL', quantity, price, total } });
  } catch (err) { res.status(500).json({ error: 'Erreur serveur.' }); }
}

export async function getTransactions(req: AuthRequest, res: Response): Promise<void> {
  try {
    const portfolio = await Portfolio.findOne({ where: { id: req.params.id, user_id: req.userId } });
    if (!portfolio) { res.status(404).json({ error: 'Portefeuille introuvable.' }); return; }
    const txns = await PortfolioTransaction.findAll({
      where: { portfolio_id: portfolio.id }, order: [['executed_at', 'DESC']],
    });
    res.json({ data: txns });
  } catch (err) { res.status(500).json({ error: 'Erreur serveur.' }); }
}
