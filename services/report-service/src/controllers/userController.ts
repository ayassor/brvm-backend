import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8),
});

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password'] },
    });
    if (!user) {
      res.status(404).json({ error: 'Utilisateur introuvable.' });
      return;
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

export async function updateMe(req: AuthRequest, res: Response): Promise<void> {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      res.status(404).json({ error: 'Utilisateur introuvable.' });
      return;
    }
    if (parsed.data.email && parsed.data.email !== user.email) {
      const exists = await User.findOne({ where: { email: parsed.data.email } });
      if (exists) {
        res.status(409).json({ error: 'Cet email est déjà utilisé.' });
        return;
      }
    }
    await user.update(parsed.data);
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, subscription_type: user.subscription_type });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

export async function changePassword(req: AuthRequest, res: Response): Promise<void> {
  const parsed = passwordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      res.status(404).json({ error: 'Utilisateur introuvable.' });
      return;
    }
    const valid = await bcrypt.compare(parsed.data.currentPassword, user.password);
    if (!valid) {
      res.status(401).json({ error: 'Mot de passe actuel incorrect.' });
      return;
    }
    const hashed = await bcrypt.hash(parsed.data.newPassword, 12);
    await user.update({ password: hashed });
    res.json({ message: 'Mot de passe modifié avec succès.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

export async function getUserById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
    });
    if (!user) {
      res.status(404).json({ error: 'Utilisateur introuvable.' });
      return;
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}
