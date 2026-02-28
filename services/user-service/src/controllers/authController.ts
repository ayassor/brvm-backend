import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/User';
import RefreshToken from '../models/RefreshToken';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

function generateTokens(user: User) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    subscription_type: user.subscription_type,
  };
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
  const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions);
  return { accessToken, refreshToken };
}

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function register(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }
  const { name, email, password } = parsed.data;
  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Cet email est déjà utilisé.' });
      return;
    }
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashed });
    const { accessToken, refreshToken } = generateTokens(user);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({ user_id: user.id, token: refreshToken, expires_at: expiresAt });
    res.status(201).json({
      message: 'Compte créé avec succès.',
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, subscription_type: user.subscription_type },
    });
  } catch (err) {
    console.error('[register]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }
  const { email, password } = parsed.data;
  try {
    const user = await User.findOne({ where: { email, is_active: true } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
      return;
    }
    const { accessToken, refreshToken } = generateTokens(user);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({ user_id: user.id, token: refreshToken, expires_at: expiresAt });
    res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, subscription_type: user.subscription_type },
    });
  } catch (err) {
    console.error('[login]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400).json({ error: 'Token de rafraîchissement manquant.' });
    return;
  }
  try {
    const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { id: number };
    const stored = await RefreshToken.findOne({
      where: { user_id: payload.id, token: refreshToken },
    });
    if (!stored || stored.expires_at < new Date()) {
      res.status(401).json({ error: 'Token invalide ou expiré.' });
      return;
    }
    const user = await User.findByPk(payload.id);
    if (!user || !user.is_active) {
      res.status(401).json({ error: 'Utilisateur introuvable.' });
      return;
    }
    await stored.destroy();
    const tokens = generateTokens(user);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({ user_id: user.id, token: tokens.refreshToken, expires_at: expiresAt });
    res.json(tokens);
  } catch {
    res.status(401).json({ error: 'Token invalide.' });
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await RefreshToken.destroy({ where: { token: refreshToken } });
  }
  res.json({ message: 'Déconnexion réussie.' });
}
