-- Migration 003 : Rapports & Communiqués de presse

CREATE TABLE IF NOT EXISTS company_reports (
  id            INT           NOT NULL AUTO_INCREMENT,
  ticker        VARCHAR(10)   NOT NULL,
  year          SMALLINT      NOT NULL,
  type          ENUM('annual','semi_annual','quarterly') NOT NULL,
  label         VARCHAR(100)  NOT NULL,
  source        VARCHAR(200)  NOT NULL,
  file_url      TEXT          DEFAULT NULL,
  file_size_kb  INT           DEFAULT NULL,
  page_count    INT           DEFAULT NULL,
  is_published  TINYINT(1)    NOT NULL DEFAULT 0,
  published_at  DATETIME      DEFAULT NULL,
  created_at    DATETIME      NOT NULL DEFAULT NOW(),
  updated_at    DATETIME      NOT NULL DEFAULT NOW() ON UPDATE NOW(),
  PRIMARY KEY (id),
  INDEX idx_ticker (ticker),
  INDEX idx_year   (year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS company_announcements (
  id           INT           NOT NULL AUTO_INCREMENT,
  ticker       VARCHAR(10)   NOT NULL,
  category     ENUM('Résultats','AGO','Dividende','Partenariat','Nomination','Stratégie','Autre') NOT NULL,
  title        VARCHAR(500)  NOT NULL,
  body         TEXT          NOT NULL,
  published_at DATETIME      NOT NULL,
  is_published TINYINT(1)    NOT NULL DEFAULT 1,
  source       VARCHAR(200)  DEFAULT NULL,
  created_at   DATETIME      NOT NULL DEFAULT NOW(),
  updated_at   DATETIME      NOT NULL DEFAULT NOW() ON UPDATE NOW(),
  PRIMARY KEY (id),
  INDEX idx_ticker    (ticker),
  INDEX idx_published (published_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Seed : rapports ──────────────────────────────────────────────────────────

INSERT INTO company_reports (ticker, year, type, label, source, file_url, file_size_kb, page_count, is_published, published_at) VALUES
('ETIT', 2024, 'annual',      'Rapport Annuel 2024',        'Ecobank Group',      'https://cdn.afrivest.com/reports/ETIT_annuel_2024.pdf',      3840, 124, 1, '2025-03-15 00:00:00'),
('ETIT', 2024, 'semi_annual', 'Rapport Semestriel S1 2024', 'Ecobank Group',      'https://cdn.afrivest.com/reports/ETIT_s1_2024.pdf',          1920,  68, 1, '2024-09-10 00:00:00'),
('ETIT', 2023, 'annual',      'Rapport Annuel 2023',        'Ecobank Group',      'https://cdn.afrivest.com/reports/ETIT_annuel_2023.pdf',      3520, 118, 1, '2024-03-20 00:00:00'),
('SLBC', 2024, 'annual',      'Rapport Annuel 2024',        'Solibra CI',         'https://cdn.afrivest.com/reports/SLBC_annuel_2024.pdf',      2100,  87, 1, '2025-04-05 00:00:00'),
('SLBC', 2024, 'semi_annual', 'Rapport Semestriel S1 2024', 'Solibra CI',         NULL,                                                         NULL, NULL, 0, NULL),
('SGBC', 2024, 'annual',      'Rapport Annuel 2024',        'SGB Burkina',        'https://cdn.afrivest.com/reports/SGBC_annuel_2024.pdf',      2750,  96, 1, '2025-03-28 00:00:00'),
('ONTBF',2024, 'annual',      'Rapport Annuel 2024',        'Onatel Burkina',     'https://cdn.afrivest.com/reports/ONTBF_annuel_2024.pdf',     3100, 108, 1, '2025-04-12 00:00:00'),
('ONTBF',2024, 'quarterly',   'Rapport Trimestriel Q3 2024','Onatel Burkina',     'https://cdn.afrivest.com/reports/ONTBF_q3_2024.pdf',          980,  42, 1, '2024-11-15 00:00:00'),
('PALC', 2024, 'annual',      'Rapport Annuel 2024',        'Palm CI',            NULL,                                                         NULL, NULL, 0, NULL);

-- ── Seed : communiqués ───────────────────────────────────────────────────────

INSERT INTO company_announcements (ticker, category, title, body, published_at, is_published, source) VALUES
('ETIT', 'Résultats',    'Publication des résultats annuels 2025',
 'Ecobank Transnational Incorporated (ETI) annonce la publication de ses résultats annuels pour l\'exercice 2025. Le bénéfice net ressort à 142 millions USD, en hausse de 18 % par rapport à 2024. Le conseil d\'administration proposera un dividende de 0,012 USD par action à l\'assemblée générale.\n\nConférence de presse prévue le 25 février 2026 à 10h00 GMT.',
 '2026-02-20 09:00:00', 1, 'Ecobank Group'),

('ETIT', 'Dividende',    'Dividende 2025 : date de détachement fixée au 10 avril 2026',
 'Suite à l\'approbation par l\'assemblée générale ordinaire du 15 mars 2026, Ecobank Transnational Incorporated (ETI) annonce que le dividende de 0,012 USD par action sera mis en paiement selon le calendrier suivant :\n\n- Date de détachement : 10 avril 2026\n- Date de référence : 12 avril 2026\n- Date de paiement : 30 avril 2026\n\nLes actionnaires enregistrés à la date de référence recevront leur dividende via leur intermédiaire financier habituel.',
 '2026-03-16 14:00:00', 1, 'Ecobank Group'),

('SLBC', 'Résultats',    'Résultats semestriels S1 2025 : chiffre d\'affaires en hausse de 12 %',
 'Solibra CI (SLBC) publie ses résultats pour le premier semestre 2025. Le chiffre d\'affaires s\'établit à 47,3 milliards FCFA, en progression de 12 % par rapport au S1 2024. Le résultat net ressort à 8,1 milliards FCFA (+9 %).\n\nCette performance reflète la bonne dynamique de la consommation domestique et le succès des nouvelles références lancées en début d\'année.',
 '2025-09-05 10:00:00', 1, 'Solibra CI'),

('SLBC', 'AGO',          'Convocation à l\'Assemblée Générale Ordinaire 2026',
 'Le Conseil d\'Administration de Solibra CI a l\'honneur de convoquer les actionnaires à l\'Assemblée Générale Ordinaire qui se tiendra le vendredi 17 avril 2026 à 09h00 au siège social, sis à Abidjan-Yopougon.\n\nOrdre du jour :\n1. Approbation des comptes de l\'exercice 2025\n2. Affectation du résultat et fixation du dividende\n3. Renouvellement des mandats d\'administrateurs\n4. Questions diverses',
 '2026-03-10 08:00:00', 1, 'Solibra CI'),

('SGBC', 'Nomination',   'Nomination d\'un nouveau Directeur Général',
 'Le Conseil d\'Administration de Société Générale Burkina Faso (SGBC), réuni le 5 mars 2026, a procédé à la nomination de M. Thierry Compaoré en qualité de Directeur Général, avec prise d\'effet au 1er avril 2026.\n\nM. Compaoré, 48 ans, est diplômé de l\'ESSEC Paris et justifie de 22 ans d\'expérience dans le secteur bancaire africain. Il succède à M. Jean-Luc Kaboré, qui fait valoir ses droits à la retraite après 12 années à la tête de l\'établissement.',
 '2026-03-06 11:00:00', 1, 'SGB Burkina'),

('ONTBF','Partenariat',  'Onatel et Orange Money lancent l\'interopérabilité totale au Burkina Faso',
 'Onatel Burkina Faso (ONTBF) et Orange Money annoncent la mise en place d\'une interopérabilité complète entre leurs plateformes de mobile money, effective à compter du 1er mars 2026.\n\nCette initiative, soutenue par la BCEAO, permettra aux 4,2 millions d\'utilisateurs de mobile money au Burkina Faso d\'effectuer des transferts instantanés entre les deux réseaux sans frais supplémentaires.\n\nLes deux partenaires estiment que cette mesure contribuera à augmenter le taux d\'inclusion financière dans le pays, actuellement estimé à 43 %.',
 '2026-02-28 09:30:00', 1, 'Onatel Burkina'),

('PALC', 'Stratégie',    'Plan stratégique 2026-2028 : cap sur la transformation durable',
 'Palm CI (PALC) présente son plan stratégique triennal 2026-2028, articulé autour de trois axes :\n\n1. Extension foncière : acquisition de 5 000 hectares supplémentaires d\'ici 2028\n2. Transformation locale : construction d\'une nouvelle unité de raffinage d\'huile de palme (capacité 50 000 tonnes/an)\n3. Durabilité : certification RSPO de l\'ensemble du domaine d\'ici fin 2027\n\nL\'enveloppe d\'investissement prévue s\'élève à 28 milliards FCFA, financée à hauteur de 60 % par autofinancement et 40 % par endettement bancaire.',
 '2026-02-15 10:00:00', 1, 'Palm CI');
