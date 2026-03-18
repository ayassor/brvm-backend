-- ─────────────────────────────────────────────────────────────────────────────
-- SEED UNIWAX (ticker : UNXC)
-- Rapports · Communiqués · Résumé · Recommandation · Analystes · Vidéos
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Rapports ──────────────────────────────────────────────────────────────────

INSERT INTO company_reports (ticker, year, type, label, source, file_url, file_size_kb, page_count, is_published, published_at) VALUES
('UNXC', 2024, 'annual',      'Rapport Annuel 2024',        'Uniwax SA',
 'https://cdn.afrivest.com/reports/UNXC_annuel_2024.pdf',      2240, 92, 1, '2025-04-10 00:00:00'),
('UNXC', 2024, 'semi_annual', 'Rapport Semestriel S1 2024', 'Uniwax SA',
 'https://cdn.afrivest.com/reports/UNXC_s1_2024.pdf',          1100, 44, 1, '2024-09-20 00:00:00'),
('UNXC', 2023, 'annual',      'Rapport Annuel 2023',        'Uniwax SA',
 'https://cdn.afrivest.com/reports/UNXC_annuel_2023.pdf',      2050, 88, 1, '2024-04-15 00:00:00'),
('UNXC', 2023, 'semi_annual', 'Rapport Semestriel S1 2023', 'Uniwax SA',
 'https://cdn.afrivest.com/reports/UNXC_s1_2023.pdf',           980, 40, 1, '2023-09-18 00:00:00'),
('UNXC', 2025, 'semi_annual', 'Rapport Semestriel S1 2025', 'Uniwax SA',
 NULL, NULL, NULL, 0, NULL);

-- ── Communiqués ───────────────────────────────────────────────────────────────

INSERT INTO company_announcements (ticker, category, title, body, published_at, is_published, source) VALUES

('UNXC', 'Résultats',
 'Résultats annuels 2024 : chiffre d\'affaires en hausse de 9 % malgré la pression des coûts',
 'Uniwax SA publie ses résultats pour l\'exercice 2024. Le chiffre d\'affaires s\'établit à 38,4 milliards FCFA, en progression de 9 % par rapport à 2023 (35,2 milliards FCFA). Le résultat net ressort à 3,1 milliards FCFA, en recul de 6 % sous l\'effet de la hausse des coûts des matières premières (coton, colorants synthétiques) et de l\'énergie.\n\nLa marge nette se contracte à 8,1 % contre 9,4 % en 2023. Néanmoins, la direction se montre confiante pour 2025, anticipant une stabilisation des coûts d\'intrants et une amélioration de la demande sur le segment export vers l\'Europe et l\'Amérique du Nord.\n\nLe conseil d\'administration proposera à l\'assemblée générale un dividende de 800 FCFA par action.',
 '2025-04-10 10:00:00', 1, 'Uniwax SA'),

('UNXC', 'Dividende',
 'Dividende 2024 : 800 FCFA par action — détachement le 15 mai 2025',
 'L\'assemblée générale ordinaire d\'Uniwax SA réunie le 25 avril 2025 a approuvé la distribution d\'un dividende de 800 FCFA par action au titre de l\'exercice 2024.\n\nCalendrier de paiement :\n- Date de détachement : 15 mai 2025\n- Date de référence : 17 mai 2025\n- Date de paiement : 31 mai 2025\n\nAu cours actuel de 9 200 FCFA, ce dividende représente un rendement brut de 8,7 %. Le dividende 2023 était de 750 FCFA par action, soit une progression de 6,7 %.',
 '2025-04-25 14:00:00', 1, 'Uniwax SA'),

('UNXC', 'AGO',
 'Convocation à l\'Assemblée Générale Ordinaire — 25 avril 2025',
 'Le Conseil d\'Administration de Uniwax SA a l\'honneur de convoquer les actionnaires à l\'Assemblée Générale Ordinaire annuelle qui se tiendra le vendredi 25 avril 2025 à 09h00 au siège social à Abidjan-Plateau.\n\nOrdre du jour :\n1. Lecture et approbation du rapport du Conseil d\'Administration\n2. Lecture et approbation du rapport des Commissaires aux Comptes\n3. Approbation des comptes de l\'exercice 2024\n4. Affectation du résultat — fixation du dividende\n5. Renouvellement et/ou nomination d\'administrateurs\n6. Questions diverses\n\nLes actionnaires souhaitant participer à l\'assemblée devront justifier de la détention de leurs titres cinq (5) jours ouvrés avant la date de réunion.',
 '2025-03-28 08:00:00', 1, 'Uniwax SA'),

('UNXC', 'Résultats',
 'Résultats S1 2024 : progression du volume de ventes malgré la pression tarifaire',
 'Uniwax SA publie ses résultats semestriels pour la période janvier–juin 2024. Le chiffre d\'affaires du premier semestre s\'établit à 18,9 milliards FCFA (+11 % vs S1 2023), porté par une hausse des volumes écoulés sur le marché ivoirien et les exportations vers le Sénégal et le Burkina Faso.\n\nLe résultat net semestriel s\'établit à 1,6 milliard FCFA, légèrement en dessous du S1 2023 (1,7 milliard FCFA) en raison de la hausse des charges d\'exploitation liée à l\'augmentation des coûts énergétiques.\n\nLa direction confirme ses prévisions annuelles et maintient un objectif de chiffre d\'affaires supérieur à 38 milliards FCFA pour l\'exercice 2024.',
 '2024-09-20 10:30:00', 1, 'Uniwax SA'),

('UNXC', 'Partenariat',
 'Uniwax renforce son partenariat avec Vlisco Group pour le développement de nouvelles collections',
 'Uniwax SA annonce le renforcement de son accord de licence et de distribution avec son actionnaire de référence, le groupe néerlandais Vlisco. Cet accord étendu permettra à Uniwax d\'accéder à de nouveaux designs exclusifs et de bénéficier du réseau de distribution international de Vlisco pour développer ses exportations.\n\nDans le cadre de ce partenariat, Uniwax lancera au second semestre 2025 une nouvelle gamme premium de tissus wax ciblant le segment de la mode africaine contemporaine, un marché estimé à 2,1 milliards USD au niveau mondial.\n\nCet accord s\'inscrit dans la stratégie de montée en gamme d\'Uniwax et de diversification de ses débouchés géographiques, notamment vers l\'Afrique de l\'Est et la diaspora africaine en Europe.',
 '2025-01-15 09:00:00', 1, 'Afrivest Research'),

('UNXC', 'Stratégie',
 'Plan de transformation 2025–2027 : investissements de 8 milliards FCFA pour moderniser l\'outil industriel',
 'Lors d\'une journée investisseurs organisée le 10 mars 2025, la direction générale d\'Uniwax SA a présenté son plan de transformation industrielle pour la période 2025–2027, doté d\'une enveloppe d\'investissement de 8 milliards FCFA.\n\nCe plan s\'articule autour de trois axes :\n\n1. Modernisation des lignes d\'impression (remplacement de 40 % des équipements datant des années 2000)\n2. Transition énergétique : installation de panneaux solaires pour couvrir 30 % des besoins énergétiques du site d\'Abidjan\n3. Digitalisation de la chaîne d\'approvisionnement et du système de gestion des stocks\n\nLe financement sera assuré à 70 % par autofinancement et 30 % par crédit bancaire. La direction estime que ces investissements permettront de réduire les coûts d\'exploitation de 12 % d\'ici 2027 et d\'améliorer la marge EBITDA de 3 à 4 points.',
 '2025-03-10 14:00:00', 1, 'Uniwax SA');

-- ── Résumé exécutif ───────────────────────────────────────────────────────────

INSERT INTO company_summaries (ticker, executive_text, bull_case, bear_case, updated_by)
VALUES (
  'UNXC',
  'Uniwax SA est le leader de la fabrication et de la commercialisation de tissus imprimés (wax) en Afrique de l\'Ouest, coté sur la BRVM depuis 1996. Filiale du groupe néerlandais Vlisco — référence mondiale du wax authentique —, la société bénéficie d\'un savoir-faire industriel unique et d\'une marque fortement ancrée dans la culture vestimentaire ouest-africaine. Basée à Abidjan-Yopougon, Uniwax opère la seule unité de production de wax en Côte d\'Ivoire avec une capacité annuelle de 18 millions de mètres linéaires. Le groupe distribue sous plusieurs marques (Uniwax, Woodin, Vlisco) et exporte vers une dizaine de pays africains ainsi qu\'en Europe via la diaspora.',

  JSON_ARRAY(
    'Rendement dividendaire élevé : 8,7 % au cours actuel — l\'un des meilleurs de la cote BRVM',
    'Position de leader absolu sur le marché du wax en Côte d\'Ivoire (part de marché estimée > 70 %)',
    'Adossement au groupe Vlisco : accès aux designs exclusifs, au réseau international et au savoir-faire technique',
    'Plan de modernisation industrielle 2025–2027 (8 Mds FCFA) visant une réduction des coûts de 12 %',
    'Marché sous-pénétré : fort potentiel de croissance à l\'export vers l\'Afrique de l\'Est et la diaspora'
  ),

  JSON_ARRAY(
    'Sensibilité élevée aux cours mondiaux du coton et des colorants — marges sous pression en cas de hausse des intrants',
    'Faible liquidité du titre (flottant réduit) : le volume journalier moyen reste inférieur à 50 titres',
    'Concurrence croissante des tissus wax asiatiques à bas coût qui gagnent des parts de marché sur le segment entrée de gamme',
    'Dépendance à la conjoncture économique ivoirienne : toute récession affecte directement la consommation de textile'
  ),

  'redaction@afrivest.com'
);

-- ── Recommandation ────────────────────────────────────────────────────────────

INSERT INTO company_recommendations (ticker, consensus, fair_value, buy_price, stop_loss, horizon, methodology, published_at)
VALUES (
  'UNXC',
  'ACHAT',
  11500.00,
  9500.00,
  7800.00,
  'Moyen terme (12–18 mois)',
  'DDM (Dividend Discount Model) avec un taux de croissance du dividende de 5 % sur 5 ans + comparable sectoriel (EV/EBITDA cible 7×). Prime de rendement de 200 bps appliquée pour tenir compte de la faible liquidité du titre.',
  '2026-03-01 10:00:00'
);

-- ── Thèse d\'investissement ────────────────────────────────────────────────────

INSERT INTO company_thesis_points (ticker, type, body, sort_order) VALUES

-- Bull case
('UNXC', 'bull', 'Rendement dividendaire de 8,7 % parmi les plus attractifs de la BRVM — dividende en croissance régulière (+6,7 % en 2024)', 0),
('UNXC', 'bull', 'Moat industriel fort : seule unité de production de wax en Côte d\'Ivoire, barrières à l\'entrée très élevées (capex, savoir-faire, marque)', 1),
('UNXC', 'bull', 'Plan de modernisation 2025–2027 : réduction attendue des coûts d\'exploitation de 12 % — catalyseur de réévaluation des marges', 2),
('UNXC', 'bull', 'Potentiel d\'expansion à l\'export : marché de la mode africaine estimé à 2,1 Mds USD, encore peu adressé par Uniwax', 3),

-- Facteurs de risque
('UNXC', 'risk', 'Exposition aux matières premières (coton, colorants) : une hausse de 10 % des intrants peut réduire la marge nette de 2 à 3 points', 0),
('UNXC', 'risk', 'Concurrence des wax asiatiques à bas coût : perte potentielle de parts de marché sur le segment entrée de gamme', 1),
('UNXC', 'risk', 'Liquidité limitée du titre : toute opération significative sur le marché peut induire un impact fort sur le cours', 2),

-- Quand vendre
('UNXC', 'exit', 'Prendre les profits si le cours atteint l\'objectif de 11 500 FCFA — potentiel résiduel inférieur à 5 %', 0),
('UNXC', 'exit', 'Couper la position si le cours casse le stop à 7 800 FCFA en clôture hebdomadaire', 1),
('UNXC', 'exit', 'Alléger si les marges 2025 se contractent en dessous de 7 % de marge nette lors de la publication des résultats annuels', 2);

-- ── Recommandations analystes ─────────────────────────────────────────────────

INSERT INTO analyst_recommendations (ticker, firm, analyst_name, consensus, target_price, published_at) VALUES
('UNXC', 'Afrivest Research',  'Jean-Baptiste Ouédraogo', 'ACHAT',   11500.00, '2026-03-01 10:00:00'),
('UNXC', 'SGBCI Bourse',       'Fatou Diallo',            'ACHAT',   11000.00, '2026-02-20 00:00:00'),
('UNXC', 'CGF Bourse',         'Adama Traoré',            'NEUTRE',   9800.00, '2026-02-10 00:00:00'),
('UNXC', 'Coris Bourse',       NULL,                      'ACHAT',   10500.00, '2026-01-28 00:00:00');

-- ── Vidéos ────────────────────────────────────────────────────────────────────

INSERT INTO company_videos (ticker, title, url, thumbnail_url, duration_sec, source, published_at, sort_order) VALUES
('UNXC',
 'Uniwax SA — Analyse fondamentale & objectif de cours 2026',
 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
 318, 'Afrivest Research', '2026-03-01 10:00:00', 0),
('UNXC',
 'Résultats 2024 Uniwax : décryptage en 6 minutes',
 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
 NULL,
 374, 'BRVM TV', '2025-04-12 14:00:00', 1);
