import { Router } from 'express'
import { Course } from '../models/Course'
import { Lesson } from '../models/Lesson'
import { Article } from '../models/Article'
import { Glossary } from '../models/Glossary'
import sequelize from '../config/database'
import { QueryTypes } from 'sequelize'

const router = Router()

// GET /courses — liste complète avec chapitres et leçons
router.get('/courses', async (_req, res) => {
  try {
    const courses = await Course.findAll({ where: { is_active: true }, order: [['id', 'ASC']] })

    const result = await Promise.all(courses.map(async (course) => {
      const chapters = await sequelize.query(
        'SELECT * FROM chapters WHERE course_id = ? ORDER BY order_num ASC',
        { replacements: [course.id], type: QueryTypes.SELECT }
      ) as any[]

      const chaptersWithLessons = await Promise.all(chapters.map(async (ch: any) => {
        const lessons = await Lesson.findAll({
          where: { course_id: course.id, chapter_id: ch.id, is_active: true },
          order: [['order_num', 'ASC']]
        })
        return {
          id: ch.id,
          title: ch.title,
          lessons: lessons.map(l => ({
            id: `c${course.id}-ch${ch.id}-l${l.id}`,
            title: l.title,
            videoId: (l as any).video_id || '',
          }))
        }
      }))

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        level: course.level,
        is_paid: course.is_paid,
        price: course.price,
        is_active: course.is_active,
        chapters: chaptersWithLessons,
      }
    }))

    res.json(result)
  } catch (err) {
    console.error('[GET /courses]', err)
    res.status(500).json({ error: 'Erreur serveur.' })
  }
})

// GET /articles
router.get('/articles', async (_req, res) => {
  try {
    const articles = await Article.findAll({ where: { is_active: true }, order: [['created_at', 'DESC']] })
    res.json(articles)
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' })
  }
})

// GET /glossary
router.get('/glossary', async (_req, res) => {
  try {
    const terms = await Glossary.findAll({ order: [['term', 'ASC']] })
    res.json(terms)
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' })
  }
})

// ─── ADMIN routes ─────────────────────────────────────────────

// POST /admin/courses
router.post('/admin/courses', async (req, res) => {
  try {
    const course = await Course.create(req.body)
    res.status(201).json(course)
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' })
  }
})

// PUT /admin/courses/:id
router.put('/admin/courses/:id', async (req, res) => {
  try {
    await Course.update(req.body, { where: { id: req.params.id } })
    const updated = await Course.findByPk(req.params.id)
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' })
  }
})

// DELETE /admin/courses/:id
router.delete('/admin/courses/:id', async (req, res) => {
  try {
    await Course.update({ is_active: false }, { where: { id: req.params.id } })
    res.json({ message: 'Cours désactivé.' })
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' })
  }
})

// POST /admin/chapters
router.post('/admin/chapters', async (req, res) => {
  try {
    const { course_id, title, order_num } = req.body
    const [result] = await sequelize.query(
      'INSERT INTO chapters (course_id, title, order_num) VALUES (?, ?, ?)',
      { replacements: [course_id, title, order_num || 0], type: QueryTypes.INSERT }
    )
    res.status(201).json({ id: result, course_id, title, order_num: order_num || 0 })
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' })
  }
})

// PUT /admin/chapters/:id
router.put('/admin/chapters/:id', async (req, res) => {
  try {
    const { title, order_num } = req.body
    await sequelize.query(
      'UPDATE chapters SET title = ?, order_num = ? WHERE id = ?',
      { replacements: [title, order_num, req.params.id], type: QueryTypes.UPDATE }
    )
    res.json({ id: req.params.id, title, order_num })
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' })
  }
})

// DELETE /admin/chapters/:id
router.delete('/admin/chapters/:id', async (req, res) => {
  try {
    await sequelize.query('DELETE FROM chapters WHERE id = ?', { replacements: [req.params.id], type: QueryTypes.DELETE })
    res.json({ message: 'Chapitre supprimé.' })
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' })
  }
})

// POST /admin/lessons
router.post('/admin/lessons', async (req, res) => {
  try {
    const lesson = await Lesson.create(req.body)
    res.status(201).json(lesson)
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' })
  }
})

// PUT /admin/lessons/:id
router.put('/admin/lessons/:id', async (req, res) => {
  try {
    await Lesson.update(req.body, { where: { id: req.params.id } })
    const updated = await Lesson.findByPk(req.params.id)
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' })
  }
})

// DELETE /admin/lessons/:id
router.delete('/admin/lessons/:id', async (req, res) => {
  try {
    await Lesson.destroy({ where: { id: req.params.id } })
    res.json({ message: 'Leçon supprimée.' })
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' })
  }
})

// POST /admin/articles
router.post('/admin/articles', async (req, res) => {
  try {
    const article = await Article.create(req.body)
    res.status(201).json(article)
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' })
  }
})

// PUT /admin/articles/:id
router.put('/admin/articles/:id', async (req, res) => {
  try {
    await Article.update(req.body, { where: { id: req.params.id } })
    const updated = await Article.findByPk(req.params.id)
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' })
  }
})

// DELETE /admin/articles/:id
router.delete('/admin/articles/:id', async (req, res) => {
  try {
    await Article.update({ is_active: false }, { where: { id: req.params.id } })
    res.json({ message: 'Article désactivé.' })
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' })
  }
})

// POST /admin/glossary
router.post('/admin/glossary', async (req, res) => {
  try {
    const term = await Glossary.create(req.body)
    res.status(201).json(term)
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' })
  }
})

// PUT /admin/glossary/:id
router.put('/admin/glossary/:id', async (req, res) => {
  try {
    await Glossary.update(req.body, { where: { id: req.params.id } })
    const updated = await Glossary.findByPk(req.params.id)
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' })
  }
})

// DELETE /admin/glossary/:id
router.delete('/admin/glossary/:id', async (req, res) => {
  try {
    await Glossary.destroy({ where: { id: req.params.id } })
    res.json({ message: 'Terme supprimé.' })
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' })
  }
})

// GET /courses/:id — détail complet d'un cours
router.get('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findOne({ where: { id: req.params.id } })
    if (!course) return res.status(404).json({ error: 'Cours introuvable.' })

    const chapters = await sequelize.query(
      'SELECT * FROM chapters WHERE course_id = ? ORDER BY order_num ASC',
      { replacements: [course.id], type: QueryTypes.SELECT }
    ) as any[]

    const chaptersWithLessons = await Promise.all(chapters.map(async (ch: any) => {
      const lessons = await Lesson.findAll({
        where: { course_id: course.id, chapter_id: ch.id },
        order: [['order_num', 'ASC']]
      })
      return {
        id: ch.id,
        title: ch.title,
        order_num: ch.order_num,
        course_id: course.id,
        lessons: lessons.map(l => ({
          id: l.id,
          title: l.title,
          video_id: (l as any).video_id || '',
          order_num: l.order_num,
          course_id: course.id,
          chapter_id: ch.id,
        }))
      }
    }))

    res.json({
      id: course.id,
      title: course.title,
      description: course.description,
      level: course.level,
      is_paid: course.is_paid,
      price: course.price,
      is_active: course.is_active,
      chapters: chaptersWithLessons,
    })
  } catch (err) {
    console.error('[GET /courses/:id]', err)
    res.status(500).json({ error: 'Erreur serveur.' })
  }
})

export default router
