import { Request, Response } from 'express'
import sequelize from '../config/database'
import { QueryTypes } from 'sequelize'

export const getSGIs = async (_req: Request, res: Response) => {
  try {
    const sgis = await sequelize.query('SELECT * FROM sgis ORDER BY country, name', { type: QueryTypes.SELECT })
    res.json({ data: sgis })
  } catch (err) {
    console.error('[GET /market-participants/sgis]', err)
    res.status(500).json({ error: 'Erreur serveur.' })
  }
}

export const getSGOs = async (_req: Request, res: Response) => {
  try {
    const sgos = await sequelize.query('SELECT * FROM sgos ORDER BY country, name', { type: QueryTypes.SELECT }) as any[]
    const funds = await sequelize.query('SELECT * FROM sgo_funds ORDER BY sgo_id, id', { type: QueryTypes.SELECT }) as any[]
    const fundsBySgoId: Record<number, any[]> = {}
    for (const f of funds) {
      if (!fundsBySgoId[f.sgo_id]) fundsBySgoId[f.sgo_id] = []
      fundsBySgoId[f.sgo_id].push({ id: f.id, name: f.name, cat: f.category, vlCurrent: f.vl_current ? parseFloat(f.vl_current) : null, perfWeek: f.perf_week })
    }
    res.json({ data: sgos.map(s => ({ ...s, funds: fundsBySgoId[s.id] ?? [] })) })
  } catch (err) {
    console.error('[GET /market-participants/sgos]', err)
    res.status(500).json({ error: 'Erreur serveur.' })
  }
}

// ── SGI CRUD ─────────────────────────────────────────────────────────────────

export const createSGI = async (req: Request, res: Response) => {
  try {
    const { name, country, country_code, phone, website, min_deposit, opening_fees } = req.body
    if (!name || !country || !country_code) {
      res.status(400).json({ error: 'Champs obligatoires : name, country, country_code.' })
      return
    }
    const [result] = await sequelize.query(
      'INSERT INTO sgis (name, country, country_code, phone, website, min_deposit, opening_fees) VALUES (?, ?, ?, ?, ?, ?, ?)',
      { replacements: [name, country, country_code, phone || null, website || null, min_deposit || null, opening_fees || null], type: QueryTypes.INSERT }
    ) as any
    const newSGI = await sequelize.query('SELECT * FROM sgis WHERE id = ?', { replacements: [result], type: QueryTypes.SELECT })
    res.status(201).json({ data: (newSGI as any[])[0] })
  } catch (err) {
    console.error('[POST /market-participants/sgis]', err)
    res.status(500).json({ error: 'Erreur serveur.' })
  }
}

export const updateSGI = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, country, country_code, phone, website, min_deposit, opening_fees } = req.body
    await sequelize.query(
      'UPDATE sgis SET name=?, country=?, country_code=?, phone=?, website=?, min_deposit=?, opening_fees=? WHERE id=?',
      { replacements: [name, country, country_code, phone || null, website || null, min_deposit || null, opening_fees || null, id], type: QueryTypes.UPDATE }
    )
    const updated = await sequelize.query('SELECT * FROM sgis WHERE id = ?', { replacements: [id], type: QueryTypes.SELECT }) as any[]
    if (!updated.length) { res.status(404).json({ error: 'SGI introuvable.' }); return }
    res.json({ data: updated[0] })
  } catch (err) {
    console.error('[PUT /market-participants/sgis/:id]', err)
    res.status(500).json({ error: 'Erreur serveur.' })
  }
}

export const deleteSGI = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await sequelize.query('DELETE FROM sgis WHERE id = ?', { replacements: [id], type: QueryTypes.DELETE })
    res.json({ message: 'SGI supprimé.' })
  } catch (err) {
    console.error('[DELETE /market-participants/sgis/:id]', err)
    res.status(500).json({ error: 'Erreur serveur.' })
  }
}

// ── SGO CRUD ─────────────────────────────────────────────────────────────────

export const createSGO = async (req: Request, res: Response) => {
  try {
    const { name, country, country_code, address, phone, email, website, partner_sgi } = req.body
    if (!name || !country || !country_code) {
      res.status(400).json({ error: 'Champs obligatoires : name, country, country_code.' })
      return
    }
    const [result] = await sequelize.query(
      'INSERT INTO sgos (name, country, country_code, address, phone, email, website, partner_sgi) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      { replacements: [name, country, country_code, address || null, phone || null, email || null, website || null, partner_sgi || null], type: QueryTypes.INSERT }
    ) as any
    const newSGO = await sequelize.query('SELECT * FROM sgos WHERE id = ?', { replacements: [result], type: QueryTypes.SELECT })
    res.status(201).json({ data: (newSGO as any[])[0] })
  } catch (err) {
    console.error('[POST /market-participants/sgos]', err)
    res.status(500).json({ error: 'Erreur serveur.' })
  }
}

export const updateSGO = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, country, country_code, address, phone, email, website, partner_sgi } = req.body
    await sequelize.query(
      'UPDATE sgos SET name=?, country=?, country_code=?, address=?, phone=?, email=?, website=?, partner_sgi=? WHERE id=?',
      { replacements: [name, country, country_code, address || null, phone || null, email || null, website || null, partner_sgi || null, id], type: QueryTypes.UPDATE }
    )
    const updated = await sequelize.query('SELECT * FROM sgos WHERE id = ?', { replacements: [id], type: QueryTypes.SELECT }) as any[]
    if (!updated.length) { res.status(404).json({ error: 'SGO introuvable.' }); return }
    res.json({ data: updated[0] })
  } catch (err) {
    console.error('[PUT /market-participants/sgos/:id]', err)
    res.status(500).json({ error: 'Erreur serveur.' })
  }
}

export const deleteSGO = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await sequelize.query('DELETE FROM sgos WHERE id = ?', { replacements: [id], type: QueryTypes.DELETE })
    res.json({ message: 'SGO supprimé.' })
  } catch (err) {
    console.error('[DELETE /market-participants/sgos/:id]', err)
    res.status(500).json({ error: 'Erreur serveur.' })
  }
}

// ── Funds CRUD ────────────────────────────────────────────────────────────────

export const getFunds = async (_req: Request, res: Response) => {
  try {
    const funds = await sequelize.query('SELECT * FROM sgo_funds ORDER BY sgo_id, id', { type: QueryTypes.SELECT })
    res.json({ data: funds })
  } catch (err) {
    console.error('[GET /market-participants/funds]', err)
    res.status(500).json({ error: 'Erreur serveur.' })
  }
}

export const createFund = async (req: Request, res: Response) => {
  try {
    const { sgo_id, name, category, vl_current, perf_week } = req.body
    if (!sgo_id || !name || !category) {
      res.status(400).json({ error: 'Champs obligatoires : sgo_id, name, category.' })
      return
    }
    const [result] = await sequelize.query(
      'INSERT INTO sgo_funds (sgo_id, name, category, vl_current, perf_week) VALUES (?, ?, ?, ?, ?)',
      { replacements: [sgo_id, name, category, vl_current || null, perf_week || null], type: QueryTypes.INSERT }
    ) as any
    const newFund = await sequelize.query('SELECT * FROM sgo_funds WHERE id = ?', { replacements: [result], type: QueryTypes.SELECT })
    res.status(201).json({ data: (newFund as any[])[0] })
  } catch (err) {
    console.error('[POST /market-participants/funds]', err)
    res.status(500).json({ error: 'Erreur serveur.' })
  }
}

export const updateFund = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { sgo_id, name, category, vl_current, perf_week } = req.body
    await sequelize.query(
      'UPDATE sgo_funds SET sgo_id=?, name=?, category=?, vl_current=?, perf_week=? WHERE id=?',
      { replacements: [sgo_id, name, category, vl_current || null, perf_week || null, id], type: QueryTypes.UPDATE }
    )
    const updated = await sequelize.query('SELECT * FROM sgo_funds WHERE id = ?', { replacements: [id], type: QueryTypes.SELECT }) as any[]
    if (!updated.length) { res.status(404).json({ error: 'Fonds introuvable.' }); return }
    res.json({ data: updated[0] })
  } catch (err) {
    console.error('[PUT /market-participants/funds/:id]', err)
    res.status(500).json({ error: 'Erreur serveur.' })
  }
}

export const deleteFund = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await sequelize.query('DELETE FROM sgo_funds WHERE id = ?', { replacements: [id], type: QueryTypes.DELETE })
    res.json({ message: 'Fonds supprimé.' })
  } catch (err) {
    console.error('[DELETE /market-participants/funds/:id]', err)
    res.status(500).json({ error: 'Erreur serveur.' })
  }
}
