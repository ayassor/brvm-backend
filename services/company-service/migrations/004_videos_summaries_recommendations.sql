-- Migration 004 : Vidéos, Résumés, Recommandations

CREATE TABLE IF NOT EXISTS company_videos (
  id            INT           NOT NULL AUTO_INCREMENT,
  ticker        VARCHAR(10)   NOT NULL,
  title         VARCHAR(300)  NOT NULL,
  url           TEXT          NOT NULL,
  thumbnail_url TEXT          DEFAULT NULL,
  duration_sec  INT           DEFAULT NULL,
  source        VARCHAR(100)  DEFAULT NULL,
  published_at  DATETIME      DEFAULT NULL,
  sort_order    TINYINT       NOT NULL DEFAULT 0,
  is_published  TINYINT(1)    NOT NULL DEFAULT 1,
  created_at    DATETIME      NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id),
  INDEX idx_ticker (ticker),
  INDEX idx_sort   (ticker, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS company_summaries (
  id             INT           NOT NULL AUTO_INCREMENT,
  ticker         VARCHAR(10)   NOT NULL UNIQUE,
  executive_text TEXT          DEFAULT NULL,
  bull_case      JSON          DEFAULT NULL,
  bear_case      JSON          DEFAULT NULL,
  updated_at     DATETIME      NOT NULL DEFAULT NOW() ON UPDATE NOW(),
  updated_by     VARCHAR(100)  DEFAULT NULL,
  PRIMARY KEY (id),
  INDEX idx_ticker (ticker)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS company_recommendations (
  id           INT            NOT NULL AUTO_INCREMENT,
  ticker       VARCHAR(10)    NOT NULL UNIQUE,
  consensus    ENUM('ACHAT FORT','ACHAT','NEUTRE','ALLÉGEMENT','VENTE') NOT NULL,
  fair_value   DECIMAL(12,2)  DEFAULT NULL,
  buy_price    DECIMAL(12,2)  DEFAULT NULL,
  stop_loss    DECIMAL(12,2)  DEFAULT NULL,
  horizon      VARCHAR(100)   DEFAULT NULL,
  methodology  TEXT           DEFAULT NULL,
  updated_at   DATETIME       NOT NULL DEFAULT NOW() ON UPDATE NOW(),
  published_at DATETIME       DEFAULT NULL,
  PRIMARY KEY (id),
  INDEX idx_ticker (ticker)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS company_thesis_points (
  id         INT          NOT NULL AUTO_INCREMENT,
  ticker     VARCHAR(10)  NOT NULL,
  type       ENUM('bull','risk','exit') NOT NULL,
  body       TEXT         NOT NULL,
  sort_order TINYINT      NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  INDEX idx_ticker_type (ticker, type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS analyst_recommendations (
  id           INT            NOT NULL AUTO_INCREMENT,
  ticker       VARCHAR(10)    NOT NULL,
  firm         VARCHAR(200)   NOT NULL,
  analyst_name VARCHAR(200)   DEFAULT NULL,
  consensus    ENUM('ACHAT FORT','ACHAT','NEUTRE','ALLÉGEMENT','VENTE') NOT NULL,
  target_price DECIMAL(12,2)  DEFAULT NULL,
  published_at DATETIME       DEFAULT NULL,
  PRIMARY KEY (id),
  INDEX idx_ticker (ticker)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Seed : vidéos ─────────────────────────────────────────────────────────────

INSERT INTO company_videos (ticker, title, url, thumbnail_url, duration_sec, source, published_at, sort_order) VALUES
('ETIT', 'Ecobank Transnational — Analyse & perspectives 2026',
 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
 270, 'Afrivest Research', '2026-03-01 10:00:00', 0),
('ETIT', 'Résultats annuels 2025 — Décryptage en 9 minutes',
 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
 NULL,
 540, 'BRVM TV', '2026-02-20 14:00:00', 1),
('SLBC', 'Solibra CI — Le brasseur ivoirien sur les marchés africains',
 'https://www.youtube.com/watch?v=9bZkp7q19f0',
 'https://img.youtube.com/vi/9bZkp7q19f0/hqdefault.jpg',
 384, 'Afrivest Research', '2026-02-15 11:00:00', 0),
('SGBC', 'SGB Burkina — Stratégie 2026 et objectif de cours',
 'https://www.youtube.com/watch?v=kXYiU_JCYtU',
 NULL,
 312, 'Afrivest Research', '2026-02-10 09:00:00', 0),
('ONTBF','Onatel Burkina — Mobile money & résultats 2025',
 'https://www.youtube.com/watch?v=JGwWNGJdvx8',
 'https://img.youtube.com/vi/JGwWNGJdvx8/hqdefault.jpg',
 465, 'BRVM TV', '2026-02-03 12:00:00', 0);

-- ── Seed : résumés ────────────────────────────────────────────────────────────

INSERT INTO company_summaries (ticker, executive_text, bull_case, bear_case, updated_by) VALUES
('ETIT',
 'Ecobank Transnational Incorporated (ETI) est le premier groupe bancaire panafricain coté à la BRVM, avec une présence dans 35 pays africains. Fondé en 1985, ETI offre des services bancaires de détail, corporate et d\'investissement à travers son réseau panafricain. Le groupe bénéficie d\'une position de leader dans les activités de trade finance et mobile banking en Afrique subsaharienne, avec un résultat net 2025 de 142 millions USD en hausse de 18 %.',
 JSON_ARRAY(
   'Valorisation attractive : PER 11× inférieur à la moyenne sectorielle de 15×',
   'Rendement dividendaire solide à 4,2%, supérieur à la moyenne BRVM',
   'Exposition croissante aux marchés UEMOA, zone à croissance structurelle de 6%+',
   'Programme de buy-back de 50 M USD témoignant de la confiance du management'
 ),
 JSON_ARRAY(
   'Risque de liquidité modéré sur le marché secondaire BRVM',
   'Exposition aux fluctuations des devises hors zone CFA',
   'Concentration sectorielle financière en cas de choc macroéconomique'
 ),
 'redaction@afrivest.com'),

('SLBC',
 'Solibra CI (SLBC) est le principal acteur du secteur des boissons en Côte d\'Ivoire, distribuant des bières (SoBra, Castel, Heineken sous licence), des softs et des eaux. Le groupe bénéficie d\'un positionnement dominant sur un marché en forte croissance démographique. Avec un chiffre d\'affaires de 94 milliards FCFA en 2025 et des marges parmi les plus élevées de la cote, SLBC reste une valeur de référence pour les investisseurs long terme sur la BRVM.',
 JSON_ARRAY(
   'Leadership incontesté sur le marché ivoirien des boissons (part de marché >60%)',
   'Marges opérationnelles élevées (EBITDA ~22%) et cash-flow libre abondant',
   'Dividende régulier et en croissance — rendement 4,6% au cours actuel',
   'Capacités de production étendues : nouvelle ligne inaugurée en décembre 2025'
 ),
 JSON_ARRAY(
   'Valorisation exigeante : PER 19× laissant peu de marge d\'erreur',
   'Faible liquidité du titre (flottant réduit)',
   'Sensibilité aux cours des matières premières (orge, aluminium, sucre)'
 ),
 'redaction@afrivest.com');

-- ── Seed : recommandations ────────────────────────────────────────────────────

INSERT INTO company_recommendations (ticker, consensus, fair_value, buy_price, stop_loss, horizon, methodology, published_at) VALUES
('ETIT', 'ACHAT', 18500.00, 16200.00, 13500.00,
 'Moyen terme (6–18 mois)',
 'DCF sur 5 ans + comparable sectoriel (PER cible 14×). Taux d\'actualisation de 12% retenu compte tenu du profil de risque panafricain.',
 '2026-03-10 09:00:00'),
('SLBC', 'ACHAT', 195000.00, 175000.00, 155000.00,
 'Long terme (12–24 mois)',
 'Sum-of-the-parts (valorisation par segment Bière / Softs / Eau) + DDM (Dividend Discount Model) avec un taux de croissance terminal de 4%.',
 '2026-02-28 10:00:00'),
('SGBC', 'ACHAT', 12500.00, 10500.00, 8800.00,
 'Moyen terme (6–18 mois)',
 'PER cible 8× sur BPA 2026 estimé + prime de 10% pour le rendement dividendaire exceptionnel.',
 '2026-02-15 11:00:00');

-- ── Seed : thèse ETIT ─────────────────────────────────────────────────────────

INSERT INTO company_thesis_points (ticker, type, body, sort_order) VALUES
('ETIT', 'bull', 'Valorisation décotée vs pairs : PER 11× contre une moyenne sectorielle BRVM de 15×', 0),
('ETIT', 'bull', 'Rendement dividendaire attractif à 4,2% — dividende en hausse continue depuis 2022', 1),
('ETIT', 'bull', 'Programme de buy-back de 50 M USD actif jusqu\'en mars 2027 — soutien mécanique au cours', 2),
('ETIT', 'bull', 'Croissance des revenus de commissions +23% en 2025 — moteur durable de la profitabilité', 3),
('ETIT', 'risk', 'Risque de liquidité : flottant de 18% — les positions importantes sont difficiles à liquider rapidement', 0),
('ETIT', 'risk', 'Exposition aux devises hors CFA (NGN, GHS, KES) : une dépréciation peut peser sur le résultat consolidé en USD', 1),
('ETIT', 'risk', 'Contexte réglementaire en évolution dans plusieurs marchés (Nigéria, Ghana, Kenya)', 2),
('ETIT', 'exit', 'Prendre les profits si le cours atteint l\'objectif de 18 500 FCFA (potentiel résiduel < 5%)', 0),
('ETIT', 'exit', 'Couper la position si le cours casse le support à 13 500 FCFA en clôture hebdomadaire', 1),

('SLBC', 'bull', 'Monopole de fait sur la bière en Côte d\'Ivoire — barrières à l\'entrée très élevées', 0),
('SLBC', 'bull', 'Marché cible de 30M d\'habitants avec une démographie jeune et une consommation per capita croissante', 1),
('SLBC', 'bull', 'Pipeline de nouveaux produits (bières premium, boissons énergisantes) pour capter les segments à forte marge', 2),
('SLBC', 'risk', 'Valorisation exigeante (PER 19×) — toute déception sur les résultats pourrait entraîner une correction significative', 0),
('SLBC', 'risk', 'Hausse des coûts des intrants (orge, aluminium, sucre) susceptible de comprimer les marges', 1),
('SLBC', 'exit', 'Alléger si le cours dépasse 200 000 FCFA — valorisation intégrant alors un scénario très optimiste', 0),
('SLBC', 'exit', 'Sortie défensive si le cours casse 155 000 FCFA en clôture mensuelle', 1);

-- ── Seed : recommandations analystes ─────────────────────────────────────────

INSERT INTO analyst_recommendations (ticker, firm, analyst_name, consensus, target_price, published_at) VALUES
('ETIT', 'Afrivest Research',  'Kofi Ouédraogo',    'ACHAT',      18500.00, '2026-03-10 09:00:00'),
('ETIT', 'SGBCI Bourse',       'Amadou Coulibaly',  'ACHAT',      18100.00, '2026-03-05 00:00:00'),
('ETIT', 'CGF Bourse',         'Mariam Sylla',      'NEUTRE',     16500.00, '2026-02-28 00:00:00'),
('ETIT', 'Hudson & Cie',       NULL,                'ACHAT',      19000.00, '2026-02-20 00:00:00'),
('SLBC', 'Afrivest Research',  'Jean-Baptiste Ouédraogo', 'ACHAT', 195000.00,'2026-02-28 10:00:00'),
('SLBC', 'SGBCI Bourse',       'Fatou Diallo',      'ACHAT',      190000.00,'2026-02-15 00:00:00'),
('SLBC', 'Coris Bourse',       NULL,                'NEUTRE',     178000.00,'2026-02-01 00:00:00'),
('SGBC', 'Afrivest Research',  'Jean-Baptiste Ouédraogo', 'ACHAT', 12500.00,'2026-02-15 11:00:00'),
('SGBC', 'CGF Bourse',         'Adama Traoré',      'ACHAT',      12000.00, '2026-02-10 00:00:00');
