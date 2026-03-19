import 'dotenv/config';
import sequelize from './config/database';
import { Course } from './models/Course';
import { Lesson } from './models/Lesson';
import { QueryTypes } from 'sequelize';

// Données des cours extraites du frontend Education.tsx

const SEED_DATA = [
  {
    title: 'Les Bases',
    description: "Commencez ici. Les fondamentaux de l'investissement expliqués simplement, sans jargon. Idéal pour découvrir la BRVM.",
    level: 'beginner' as const,
    is_paid: false,
    price: 0,
    chapters: [
      {
        title: "Les bases de l'investissement",
        order_num: 1,
        lessons: [
          { title: 'Les bases — Partie 1', video_id: 'rezkPsHZU-U', order_num: 1 },
          { title: 'Les bases — Partie 2', video_id: '9vSIS2XMadY', order_num: 2 },
          { title: 'Les bases — Partie 3', video_id: 'EmmyRBKRMwA', order_num: 3 },
        ],
      },
    ],
  },
  {
    title: 'Cours complet sur la BRVM',
    description: "Le programme complet : actions, obligations, stratégies, fonctionnement de la bourse et analyses de cas pratiques sur 6 chapitres.",
    level: 'beginner' as const,
    is_paid: true,
    price: 40000,
    chapters: [
      {
        title: 'Introduction à la Bourse',
        order_num: 1,
        lessons: [
          { title: 'Présentation et déroulé du programme', video_id: 'hH1XSWMIuoA', order_num: 1 },
          { title: "Qu'est-ce que la bourse ?", video_id: 'dJ4eFXeupGA', order_num: 2 },
          { title: 'Le marché primaire et le marché secondaire', video_id: '8MtWodC_RQw', order_num: 3 },
          { title: 'Les actions et les obligations', video_id: 'hOufur9bu0g', order_num: 4 },
        ],
      },
      {
        title: 'Les gains à la BRVM',
        order_num: 2,
        lessons: [
          { title: 'La notion de dividende', video_id: 'IjkP-sScIEo', order_num: 1 },
          { title: 'La notion de plus-value', video_id: '7e5QIcSvHiE', order_num: 2 },
          { title: 'Dividende vs intérêt bancaire : la différence', video_id: 'w1l2cVgsQ_M', order_num: 3 },
        ],
      },
      {
        title: "Stratégies d'investissement",
        order_num: 3,
        lessons: [
          { title: 'La stratégie de rente', video_id: 'T65OTRA2EAQ', order_num: 1 },
          { title: 'La stratégie de croissance', video_id: 'k1oGmvem__8', order_num: 2 },
        ],
      },
      {
        title: 'Fonctionnement de la BRVM',
        order_num: 4,
        lessons: [
          { title: 'Le bulletin de la cote — Partie 1', video_id: 'xioh5qHi-s0', order_num: 1 },
          { title: 'Le bulletin de la cote — Partie 2', video_id: 'TNoBt6lftMc', order_num: 2 },
          { title: 'Les indices boursiers', video_id: 'spdc9OtgVWY', order_num: 3 },
        ],
      },
      {
        title: 'Le choix des actions',
        order_num: 5,
        lessons: [
          { title: "Introduction au choix de l'action", video_id: 'rUBsJp-nw_g', order_num: 1 },
          { title: 'Étude des performances des entreprises — Partie 1', video_id: 'nlXMLbllEwI', order_num: 2 },
          { title: 'Étude des performances des entreprises — Partie 2', video_id: 'Mkn2IDep2tE', order_num: 3 },
          { title: 'Étude des perspectives des entreprises — Partie 1', video_id: 'hXyO5Onxvqw', order_num: 4 },
          { title: 'Étude des perspectives des entreprises — Partie 2', video_id: 'siJwEqhSx84', order_num: 5 },
        ],
      },
      {
        title: 'Cas pratiques et démonstrations',
        order_num: 6,
        lessons: [
          { title: 'Analyse de BOA CI', video_id: 'JianvcpoNJ0', order_num: 1 },
          { title: "Présentation d'un compte titre (Coris Bourse & SGI Togo)", video_id: 'Dh_kifSGBcg', order_num: 2 },
          { title: "Démonstration d'achat d'action et d'obligation", video_id: '7FDzvn6EUyc', order_num: 3 },
          { title: "Démonstration de vente d'action et d'obligation", video_id: 'auVNUVb_nmM', order_num: 4 },
        ],
      },
    ],
  },
  {
    title: 'Comprendre et investir dans les FCP',
    description: "Tout sur les Fonds Communs de Placement : fonctionnement, simulation, inscription et premiers investissements guidés pas-à-pas.",
    level: 'intermediate' as const,
    is_paid: true,
    price: 15000,
    chapters: [
      {
        title: 'Comprendre les produits',
        order_num: 1,
        lessons: [
          { title: "Les bases de l'investissement", video_id: 'Zyj-rPldWQI', order_num: 1 },
          { title: 'Fonctionnement des FCP', video_id: 'eCjZRR4XNGU', order_num: 2 },
        ],
      },
      {
        title: 'Guide pas-à-pas',
        order_num: 2,
        lessons: [
          { title: 'Simulation', video_id: 'TiQPMT3bA9M', order_num: 1 },
          { title: 'Inscription', video_id: 'VyMJeBHxzzU', order_num: 2 },
          { title: "Démo d'investissement", video_id: 'sFYju9KVZow', order_num: 3 },
          { title: 'Retirer son argent', video_id: 'OVgrft4XnIU', order_num: 4 },
        ],
      },
    ],
  },
  {
    title: 'Coaching Personnalisé',
    description: "Un accompagnement 100 % sur mesure selon vos objectifs, votre budget et votre niveau. Tarif adapté à chaque profil.",
    level: 'coaching' as any,
    is_paid: false,
    price: 0,
    chapters: [],
  },
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connecté à la DB');

    // S'assurer que la table chapters existe
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS chapters (
        id INT PRIMARY KEY AUTO_INCREMENT,
        course_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        order_num INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_course (course_id)
      )
    `);

    // Ajouter les colonnes manquantes si besoin
    await sequelize.query(`ALTER TABLE lessons ADD COLUMN IF NOT EXISTS chapter_id INT DEFAULT NULL`).catch(() => {});
    await sequelize.query(`ALTER TABLE lessons ADD COLUMN IF NOT EXISTS video_id VARCHAR(100) DEFAULT NULL`).catch(() => {});

    // Ajouter la valeur 'coaching' à l'ENUM si nécessaire
    await sequelize.query(`ALTER TABLE courses MODIFY COLUMN level ENUM('beginner','intermediate','advanced','coaching') DEFAULT 'beginner'`).catch(() => {});

    for (const courseData of SEED_DATA) {
      const { chapters, ...courseAttrs } = courseData;

      // Vérifier si le cours existe déjà
      const existing = await Course.findOne({ where: { title: courseAttrs.title } });
      let course: Course;

      if (existing) {
        console.log(`ℹ️  Cours existant : ${courseAttrs.title}`);
        course = existing;
      } else {
        course = await Course.create(courseAttrs as any);
        console.log(`✅ Cours créé : ${courseAttrs.title} (id=${course.id})`);
      }

      for (const chapterData of chapters) {
        const { lessons, ...chapterAttrs } = chapterData;

        // Vérifier si le chapitre existe
        const existingChapters = await sequelize.query(
          'SELECT id FROM chapters WHERE course_id = ? AND title = ?',
          { replacements: [course.id, chapterAttrs.title], type: QueryTypes.SELECT }
        ) as any[];

        let chapterId: number;
        if (existingChapters.length > 0) {
          chapterId = existingChapters[0].id;
          console.log(`  ℹ️  Chapitre existant : ${chapterAttrs.title}`);
        } else {
          const [insertId] = await sequelize.query(
            'INSERT INTO chapters (course_id, title, order_num) VALUES (?, ?, ?)',
            { replacements: [course.id, chapterAttrs.title, chapterAttrs.order_num], type: QueryTypes.INSERT }
          );
          chapterId = insertId as number;
          console.log(`  ✅ Chapitre créé : ${chapterAttrs.title} (id=${chapterId})`);
        }

        for (const lessonData of lessons) {
          const existing = await Lesson.findOne({ where: { course_id: course.id, chapter_id: chapterId, title: lessonData.title } });
          if (existing) {
            console.log(`    ℹ️  Leçon existante : ${lessonData.title}`);
          } else {
            await Lesson.create({
              course_id: course.id,
              chapter_id: chapterId,
              title: lessonData.title,
              video_id: lessonData.video_id,
              order_num: lessonData.order_num,
            } as any);
            console.log(`    ✅ Leçon créée : ${lessonData.title}`);
          }
        }
      }
    }

    console.log('\n🎉 Seed terminé avec succès !');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur seed:', err);
    process.exit(1);
  }
}

seed();
