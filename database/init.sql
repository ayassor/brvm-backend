-- ============================================================
-- BRVM Backend - Initialisation des bases de données
-- Exécuter: mysql -u root -p < database/init.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS brvm_users CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS brvm_companies CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS brvm_portfolios CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS brvm_education CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS brvm_subscriptions CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS brvm_credits CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS brvm_reports CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ── brvm_users ──────────────────────────────────────────────
USE brvm_users;

CREATE TABLE IF NOT EXISTS users (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  role        ENUM('user','admin') NOT NULL DEFAULT 'user',
  subscription_type ENUM('free','premium') NOT NULL DEFAULT 'free',
  credits_remaining INT NOT NULL DEFAULT 5,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  user_id     INT NOT NULL,
  token       VARCHAR(512) NOT NULL,
  expires_at  TIMESTAMP NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── brvm_companies ──────────────────────────────────────────
USE brvm_companies;

CREATE TABLE IF NOT EXISTS companies (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(255) NOT NULL,
  ticker      VARCHAR(20) NOT NULL UNIQUE,
  sector      VARCHAR(100),
  country     VARCHAR(100),
  description TEXT,
  logo_url    VARCHAR(500),
  market_cap  DECIMAL(20,2),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stock_prices (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  company_id  INT NOT NULL,
  date        DATE NOT NULL,
  open        DECIMAL(10,2),
  close       DECIMAL(10,2) NOT NULL,
  high        DECIMAL(10,2),
  low         DECIMAL(10,2),
  volume      BIGINT DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  UNIQUE KEY uq_company_date (company_id, date)
);

CREATE TABLE IF NOT EXISTS dividends (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  company_id   INT NOT NULL,
  amount       DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  ex_date      DATE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Données initiales BRVM
INSERT IGNORE INTO companies (name, ticker, sector, country, description) VALUES
('SONATEL', 'SNTS', 'Télécommunications', 'Sénégal', 'Société Nationale des Télécommunications du Sénégal'),
('ECOBANK TRANSNATIONAL', 'ETIT', 'Finance', 'Togo', 'Banque panafricaine présente dans 36 pays'),
('ORANGE CÔTE D''IVOIRE', 'ORAC', 'Télécommunications', 'Côte d''Ivoire', 'Opérateur télécom leader en Côte d''Ivoire'),
('PALMCI', 'PALC', 'Agriculture', 'Côte d''Ivoire', 'Producteur et transformateur d''huile de palme'),
('NESTLÉ CI', 'NSTC', 'Alimentation', 'Côte d''Ivoire', 'Filiale du groupe Nestlé en Côte d''Ivoire'),
('SOLIBRA', 'SLBC', 'Alimentation', 'Côte d''Ivoire', 'Société de Limonaderies et Brasseries d''Afrique'),
('SIB', 'SIBC', 'Finance', 'Côte d''Ivoire', 'Société Ivoirienne de Banque'),
('CORIS BANK INTERNATIONAL', 'CBIB', 'Finance', 'Burkina Faso', 'Banque burkinabè en forte croissance'),
('BOA MALI', 'BOAM', 'Finance', 'Mali', 'Bank of Africa Mali'),
('CFAO MOTORS CI', 'CFAC', 'Distribution', 'Côte d''Ivoire', 'Distribution de véhicules automobiles'),
('SICABLE', 'CABC', 'Industrie', 'Côte d''Ivoire', 'Fabricant de câbles électriques'),
('SERVAIR ABIDJAN', 'SIVC', 'Services', 'Côte d''Ivoire', 'Services de restauration aéroportuaire');

-- Cours boursiers d'exemple (90 derniers jours)
INSERT IGNORE INTO stock_prices (company_id, date, open, close, high, low, volume) VALUES
(1, CURDATE() - INTERVAL 1 DAY, 18500, 18750, 18900, 18400, 12500),
(1, CURDATE() - INTERVAL 2 DAY, 18200, 18500, 18600, 18100, 11800),
(1, CURDATE() - INTERVAL 3 DAY, 18000, 18200, 18350, 17900, 10200),
(2, CURDATE() - INTERVAL 1 DAY, 12, 12.50, 12.80, 11.90, 850000),
(2, CURDATE() - INTERVAL 2 DAY, 11.80, 12.00, 12.20, 11.70, 920000),
(3, CURDATE() - INTERVAL 1 DAY, 8900, 9050, 9200, 8850, 35000),
(3, CURDATE() - INTERVAL 2 DAY, 8750, 8900, 9000, 8700, 32000);

-- ── brvm_portfolios ─────────────────────────────────────────
USE brvm_portfolios;

CREATE TABLE IF NOT EXISTS portfolios (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  user_id         INT NOT NULL,
  name            VARCHAR(255) NOT NULL DEFAULT 'Mon Portefeuille',
  initial_capital DECIMAL(20,2) NOT NULL,
  cash_balance    DECIMAL(20,2) NOT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS portfolio_positions (
  id             INT PRIMARY KEY AUTO_INCREMENT,
  portfolio_id   INT NOT NULL,
  company_id     INT NOT NULL,
  ticker         VARCHAR(20) NOT NULL,
  quantity       INT NOT NULL DEFAULT 0,
  avg_buy_price  DECIMAL(10,2) NOT NULL,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE,
  UNIQUE KEY uq_portfolio_company (portfolio_id, company_id)
);

CREATE TABLE IF NOT EXISTS portfolio_transactions (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  portfolio_id INT NOT NULL,
  company_id   INT NOT NULL,
  ticker       VARCHAR(20) NOT NULL,
  type         ENUM('BUY','SELL') NOT NULL,
  quantity     INT NOT NULL,
  price        DECIMAL(10,2) NOT NULL,
  total        DECIMAL(20,2) NOT NULL,
  executed_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
);

-- ── brvm_education ──────────────────────────────────────────
USE brvm_education;

CREATE TABLE IF NOT EXISTS courses (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  title         VARCHAR(255) NOT NULL,
  description   TEXT,
  level         ENUM('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
  is_paid       BOOLEAN NOT NULL DEFAULT FALSE,
  price         DECIMAL(10,2) DEFAULT 0,
  thumbnail_url VARCHAR(500),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lessons (
  id               INT PRIMARY KEY AUTO_INCREMENT,
  course_id        INT NOT NULL,
  title            VARCHAR(255) NOT NULL,
  content          LONGTEXT,
  video_url        VARCHAR(500),
  pdf_url          VARCHAR(500),
  order_num        INT NOT NULL DEFAULT 0,
  duration_minutes INT DEFAULT 0,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS articles (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  title      VARCHAR(255) NOT NULL,
  content    LONGTEXT,
  summary    TEXT,
  author     VARCHAR(255),
  category   VARCHAR(100),
  is_paid    BOOLEAN NOT NULL DEFAULT FALSE,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS glossary (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  term       VARCHAR(255) NOT NULL UNIQUE,
  definition TEXT NOT NULL,
  category   VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO courses (title, description, level, is_paid, price) VALUES
('Introduction à la BRVM', 'Découvrez les bases de la bourse en Afrique de l''Ouest', 'beginner', FALSE, 0),
('Lire un graphique boursier', 'Apprenez à interpréter les graphiques et indicateurs techniques', 'beginner', FALSE, 0),
('Analyse fondamentale', 'Évaluer la valeur réelle d''une entreprise cotée', 'intermediate', TRUE, 19900),
('Gestion de portefeuille avancée', 'Stratégies d''investissement professionnelles', 'advanced', TRUE, 29900);

INSERT IGNORE INTO articles (title, summary, author, category, is_paid) VALUES
('Comprendre la BRVM', 'Guide complet sur la Bourse Régionale des Valeurs Mobilières', 'Équipe BRVM.com', 'Débutant', FALSE),
('Les meilleures actions BRVM 2025', 'Analyse des sociétés les plus performantes', 'Équipe BRVM.com', 'Analyse', FALSE),
('Stratégie de dividendes', 'Construire un portefeuille générateur de revenus passifs', 'Équipe BRVM.com', 'Stratégie', TRUE);

INSERT IGNORE INTO glossary (term, definition, category) VALUES
('Action', 'Titre de propriété représentant une part du capital d''une entreprise cotée en bourse.', 'Base'),
('BRVM', 'Bourse Régionale des Valeurs Mobilières, place boursière commune à 8 pays de l''UEMOA.', 'Institution'),
('Capitalisation boursière', 'Valeur totale d''une entreprise en bourse : Cours × Nombre d''actions.', 'Évaluation'),
('Cours', 'Prix auquel une action est échangée sur le marché.', 'Base'),
('Dividende', 'Part des bénéfices distribuée aux actionnaires.', 'Rémunération'),
('Indice BRVM Composite', 'Indice regroupant toutes les sociétés cotées à la BRVM.', 'Indice'),
('MACD', 'Moving Average Convergence Divergence – indicateur de tendance et momentum.', 'Analyse technique'),
('RSI', 'Relative Strength Index – mesure la vitesse et le changement des mouvements de prix.', 'Analyse technique'),
('OPV', 'Offre Publique de Vente – première mise en vente d''actions au grand public.', 'Opérations'),
('P/E Ratio', 'Price-to-Earnings Ratio – rapport cours/bénéfice par action.', 'Évaluation'),
('Volume', 'Nombre d''actions échangées sur une période donnée.', 'Marché'),
('Liquidité', 'Facilité avec laquelle un titre peut être acheté ou vendu sans impacter son cours.', 'Marché');

-- ── brvm_subscriptions ──────────────────────────────────────
USE brvm_subscriptions;

CREATE TABLE IF NOT EXISTS subscriptions (
  id                INT PRIMARY KEY AUTO_INCREMENT,
  user_id           INT NOT NULL,
  plan              ENUM('free','premium') NOT NULL DEFAULT 'free',
  start_date        DATE NOT NULL,
  end_date          DATE,
  status            ENUM('active','cancelled','expired') NOT NULL DEFAULT 'active',
  amount_paid       DECIMAL(10,2) DEFAULT 0,
  payment_reference VARCHAR(255),
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── brvm_credits ────────────────────────────────────────────
USE brvm_credits;

CREATE TABLE IF NOT EXISTS credit_accounts (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  user_id     INT NOT NULL UNIQUE,
  balance     INT NOT NULL DEFAULT 5,
  total_earned INT NOT NULL DEFAULT 5,
  total_used  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS credit_transactions (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  user_id       INT NOT NULL,
  type          ENUM('earned','used','refund') NOT NULL,
  amount        INT NOT NULL,
  description   VARCHAR(255),
  reference     VARCHAR(255),
  balance_after INT NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── brvm_reports ────────────────────────────────────────────
USE brvm_reports;

CREATE TABLE IF NOT EXISTS reports (
  id             INT PRIMARY KEY AUTO_INCREMENT,
  user_id        INT NOT NULL,
  company_id     INT NOT NULL,
  company_ticker VARCHAR(20) NOT NULL,
  title          VARCHAR(255) NOT NULL,
  file_path      VARCHAR(500),
  status         ENUM('pending','generating','completed','failed') NOT NULL DEFAULT 'pending',
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
