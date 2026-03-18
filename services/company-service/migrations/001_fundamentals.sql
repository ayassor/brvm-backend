-- ============================================================
-- Migration 001 — Fundamentals (LiveChart page)
-- Service : company-service
-- Date    : 2026-03-11
-- ============================================================

-- ── 1. Nouvelles colonnes sur `companies` ───────────────────
ALTER TABLE companies
  ADD COLUMN shares_count   BIGINT           NULL COMMENT 'Nombre total de titres en circulation',
  ADD COLUMN ceo            VARCHAR(255)     NULL COMMENT 'Nom du Directeur Général',
  ADD COLUMN ceo_title      VARCHAR(255)     NULL COMMENT 'Titre exact du DG',
  ADD COLUMN founded        INT              NULL COMMENT 'Année de fondation',
  ADD COLUMN employees      INT              NULL COMMENT 'Nombre d\'employés',
  ADD COLUMN website        VARCHAR(500)     NULL COMMENT 'Site web (ex: sonatel.sn)',
  ADD COLUMN free_float_pct DECIMAL(5,2)     NULL COMMENT '% du capital en flottant public',
  ADD COLUMN activities     JSON             NULL COMMENT 'Liste des activités principales',
  ADD COLUMN certifications JSON             NULL COMMENT 'Liste des certifications (ISO, etc.)';

-- ── 2. Nouvelle colonne sur `dividends` ─────────────────────
ALTER TABLE dividends
  ADD COLUMN year INT NULL COMMENT 'Exercice fiscal concerné' AFTER company_id;

-- ── 3. Table historique financier (5 ans) ───────────────────
CREATE TABLE IF NOT EXISTS financial_history (
  id                      INT            NOT NULL AUTO_INCREMENT,
  company_id              INT            NOT NULL,
  year                    INT            NOT NULL,
  revenue_m_fcfa          DECIMAL(18,2)  NULL COMMENT 'Chiffre d\'affaires en millions FCFA',
  net_income_m_fcfa       DECIMAL(18,2)  NULL COMMENT 'Résultat net en millions FCFA',
  ebitda_m_fcfa           DECIMAL(18,2)  NULL COMMENT 'EBITDA en millions FCFA',
  pe_ratio                DECIMAL(8,2)   NULL COMMENT 'Price-to-Earnings cette année',
  eps_fcfa                DECIMAL(12,2)  NULL COMMENT 'Bénéfice Net Par Action (FCFA)',
  dividend_per_share_fcfa DECIMAL(12,2)  NULL COMMENT 'Dividende versé par action (FCFA)',
  PRIMARY KEY (id),
  UNIQUE KEY uq_fin_history_company_year (company_id, year),
  KEY idx_fin_history_company (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 4. Table actionnariat ────────────────────────────────────
CREATE TABLE IF NOT EXISTS shareholders (
  id          INT            NOT NULL AUTO_INCREMENT,
  company_id  INT            NOT NULL,
  name        VARCHAR(255)   NOT NULL,
  pct         DECIMAL(6,2)   NOT NULL COMMENT 'Pourcentage détenu',
  type        ENUM('institutionnel','etat','public','fondateur') NOT NULL,
  PRIMARY KEY (id),
  KEY idx_shareholders_company (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 5. Table actualités liées à une entreprise ──────────────
CREATE TABLE IF NOT EXISTS company_news (
  id          INT      NOT NULL AUTO_INCREMENT,
  company_id  INT      NOT NULL,
  date        DATE     NOT NULL,
  headline    TEXT     NOT NULL,
  positive    TINYINT(1) NULL COMMENT '1=positif, 0=négatif, NULL=neutre',
  PRIMARY KEY (id),
  KEY idx_company_news_company (company_id),
  KEY idx_company_news_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
