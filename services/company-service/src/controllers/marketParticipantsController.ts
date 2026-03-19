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
