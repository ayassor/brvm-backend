-- Migration 002 : Module Actualités (News)
-- Tables: news_articles, news_tags, news_article_tags, news_company_links

CREATE TABLE IF NOT EXISTS news_articles (
  id              BIGINT        NOT NULL AUTO_INCREMENT,
  title           VARCHAR(500)  NOT NULL,
  summary         TEXT          NOT NULL,
  body            LONGTEXT      NOT NULL,
  category        VARCHAR(50)   NOT NULL,
  source          VARCHAR(200)  NOT NULL,
  author          VARCHAR(200)  DEFAULT NULL,
  published_at    DATETIME      NOT NULL,
  is_positive     TINYINT(1)    DEFAULT NULL,
  reading_time    TINYINT       NOT NULL DEFAULT 3,
  is_published    TINYINT(1)    NOT NULL DEFAULT 1,
  views_count     INT           NOT NULL DEFAULT 0,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_category    (category),
  INDEX idx_published_at (published_at DESC),
  INDEX idx_is_published (is_published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS news_tags (
  id      BIGINT       NOT NULL AUTO_INCREMENT,
  name    VARCHAR(100) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS news_article_tags (
  article_id  BIGINT NOT NULL,
  tag_id      BIGINT NOT NULL,
  PRIMARY KEY (article_id, tag_id),
  CONSTRAINT fk_nat_article FOREIGN KEY (article_id) REFERENCES news_articles(id) ON DELETE CASCADE,
  CONSTRAINT fk_nat_tag     FOREIGN KEY (tag_id)     REFERENCES news_tags(id)     ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS news_company_links (
  article_id  BIGINT      NOT NULL,
  ticker      VARCHAR(10) NOT NULL,
  PRIMARY KEY (article_id, ticker),
  CONSTRAINT fk_ncl_article FOREIGN KEY (article_id) REFERENCES news_articles(id) ON DELETE CASCADE,
  INDEX idx_ticker (ticker)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────────────
-- SEED : 12 articles de démonstration
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO news_articles
  (id, title, summary, body, category, source, author, published_at, is_positive, reading_time, is_published, views_count)
VALUES

-- 1 ── Marché / SLBC
(1,
 'Solibra CI : hausse de 7,5 % en séance, portée par des volumes records',
 'L\'action Solibra CI (SLBC) a clôturé en hausse de 7,5 % à 185 000 FCFA, avec 4 320 titres échangés — un record depuis janvier 2025.',
 'L\'action Solibra CI (SLBC) a signé l\'une des meilleures performances de la semaine sur la Bourse Régionale des Valeurs Mobilières (BRVM), clôturant en hausse de 7,5 % à 185 000 FCFA. Les volumes échangés ont atteint 4 320 titres, un niveau record depuis le début de l\'année.\n\nCette progression intervient dans un contexte de publications semestrielles solides. Le groupe brassicole ivoirien a fait état d\'une croissance de son chiffre d\'affaires de 12 % au premier semestre 2025, portée par la reprise de la consommation en Côte d\'Ivoire et l\'expansion dans la sous-région.\n\nDu côté des analystes, la majorité maintient une recommandation d\'achat sur le titre, avec un objectif de cours moyen relevé à 195 000 FCFA. Le dividende exceptionnel annoncé en mai dernier, d\'un montant de 8 500 FCFA par action, continue de soutenir l\'attractivité de la valeur pour les investisseurs en quête de rendement.',
 'Marché', 'BRVM Infos', 'Rédaction Afrivest',
 '2026-02-27 16:30:00', 1, 3, 1, 142),

-- 2 ── Résultats / ETIT
(2,
 'Ecobank Transnational affiche un bénéfice net en hausse de 18 % au T4 2025',
 'ETI (ETIT) publie des résultats trimestriels au-dessus des attentes avec un bénéfice net de 142 millions USD, tiré par la progression des revenus de commissions.',
 'Ecobank Transnational Incorporated (ETI – ETIT) a dévoilé ses résultats du quatrième trimestre 2025, faisant ressortir un bénéfice net de 142 millions USD, en hausse de 18 % par rapport à la même période en 2024. Ces chiffres dépassent les estimations consensuelles du marché, qui tablaient sur 128 millions USD.\n\nLa performance est portée en grande partie par la progression des revenus de commissions (+23 %), notamment sur les activités de trade finance et de mobile banking. Le groupe panafricain, présent dans 35 pays, tire également parti d\'un effet de change favorable dans plusieurs marchés anglophones.\n\nLe ratio de fonds propres Tier 1 s\'établit à 14,2 %, bien au-dessus du seuil réglementaire de 10 %. La banque confirme sa guidance annuelle avec un objectif de return on equity supérieur à 20 % pour l\'exercice 2026.\n\nLe titre ETIT a progressé de 3,2 % à l\'annonce des résultats, à 22 FCFA, portant sa capitalisation boursière à environ 980 milliards FCFA.',
 'Résultats', 'Afrique Finance', 'Kofi Mensah',
 '2026-02-20 09:15:00', 1, 4, 1, 89),

-- 3 ── Dividendes / BOAN
(3,
 'Bank of Africa Niger annonce un dividende de 950 FCFA par action pour 2025',
 'L\'assemblée générale de BOAN a approuvé la distribution d\'un dividende ordinaire de 950 FCFA par action, soit un rendement de 6,8 % au cours actuel.',
 'L\'assemblée générale ordinaire de Bank of Africa Niger (BOAN) réunie ce jeudi a approuvé la distribution d\'un dividende de 950 FCFA par action au titre de l\'exercice 2025, contre 820 FCFA versés l\'année précédente, soit une hausse de 15,9 %.\n\nAu cours actuel de 14 000 FCFA, ce dividende représente un rendement brut de 6,8 %, l\'un des plus élevés de la cote BRVM dans le secteur financier. La date de détachement du coupon a été fixée au 15 mars 2026, pour un paiement effectif le 31 mars.\n\nLa banque fait état d\'un résultat net consolidé de 12,4 milliards FCFA pour 2025, en progression de 11 % sur un an, malgré un environnement macroéconomique sahélien toujours sous pression. Le directeur général a souligné la solidité du portefeuille de crédits et la maîtrise du coût du risque.\n\nLes investisseurs ont salué la nouvelle : l\'action BOAN a progressé de 2,1 % en séance, à 14 295 FCFA.',
 'Dividendes', 'La Tribune Afrique', 'Aminata Diallo',
 '2026-02-18 14:00:00', 1, 3, 1, 67),

-- 4 ── Analyse / SGBC
(4,
 'Société Générale Burkina : notre analyse fondamentale — objectif de cours à 12 500 FCFA',
 'Nous initions la couverture de SGBC avec une recommandation ACHAT. Le titre décote de 18 % par rapport à ses pairs régionaux malgré des fondamentaux solides.',
 'Nous initions la couverture de Société Générale Burkina Faso (SGBC) avec une recommandation ACHAT et un objectif de cours à 12 mois de 12 500 FCFA, représentant un potentiel de hausse de 24 % par rapport au dernier cours de 10 075 FCFA.\n\n**Valorisation attractive.** Le titre se traite à 6,2x les bénéfices estimés 2026, soit une décote de 18 % par rapport à la médiane des banques régionales cotées sur la BRVM (7,5x). Cette décote nous paraît injustifiée au regard de la qualité du bilan et de la franchise commerciale de l\'établissement.\n\n**Catalyseurs identifiés.** Trois éléments devraient soutenir la revalorisation : (i) la reprise de l\'activité économique au Burkina Faso avec le retour progressif des flux commerciaux frontaliers ; (ii) la modernisation de l\'offre digitale, avec le lancement prévu de la super-app en S2 2026 ; (iii) le potentiel de hausse du dividende, le taux de distribution n\'ayant pas dépassé 40 % ces trois dernières années.\n\n**Risques principaux.** Le risque sécuritaire au Sahel reste le principal facteur d\'incertitude. Une dégradation de la situation pourrait peser sur la collecte de dépôts et le taux de recouvrement des créances.',
 'Analyse', 'Afrivest Research', 'Jean-Baptiste Ouédraogo',
 '2026-02-15 11:00:00', 1, 5, 1, 203),

-- 5 ── Corporate / PALC
(5,
 'PALM CI finalise l\'acquisition de 3 000 hectares supplémentaires en Côte d\'Ivoire',
 'Le palmiste coté PALC confirme l\'extension de son domaine foncier, renforçant sa capacité de production d\'huile de palme brute de 15 % d\'ici 2027.',
 'Palm Côte d\'Ivoire (PALC) a annoncé ce mardi la finalisation de l\'acquisition de 3 000 hectares de terres agricoles dans la région du Sud-Comoé, portant son domaine total à 22 800 hectares. Cette opération, d\'un montant de 4,5 milliards FCFA, avait été annoncée lors de la dernière assemblée générale.\n\nSelon la direction générale, les nouvelles plantations atteindront leur maturité productive d\'ici 2028, mais la mise en culture et les premières récoltes devraient déjà contribuer à la croissance du chiffre d\'affaires dès 2027, avec une augmentation estimée de 15 % de la capacité de production d\'huile de palme brute (CPO).\n\nL\'opération a été financée intégralement par autofinancement, sans recours à l\'endettement, ce qui témoigne de la solidité du bilan du groupe. Le directeur général a par ailleurs confirmé l\'objectif d\'un chiffre d\'affaires de 85 milliards FCFA pour l\'exercice 2026.\n\nCette acquisition s\'inscrit dans la stratégie de verticalisation du groupe, qui cherche à sécuriser ses approvisionnements en amont tout en réduisant sa dépendance aux cours mondiaux du CPO.',
 'Corporate', 'Agence Ecofin', 'Marie-Claire Bédié',
 '2026-02-12 10:30:00', 1, 3, 1, 58),

-- 6 ── Macro
(6,
 'Zone UEMOA : la croissance économique attendue à 6,2 % en 2026 selon la BCEAO',
 'La Banque Centrale des États de l\'Afrique de l\'Ouest révise légèrement à la hausse ses prévisions de croissance pour la zone, portées par les exportations et l\'investissement public.',
 'La Banque Centrale des États de l\'Afrique de l\'Ouest (BCEAO) a publié son rapport trimestriel de conjoncture, tablant sur une croissance de 6,2 % du PIB agrégé de la zone UEMOA pour 2026, contre une estimation de 5,9 % dans sa précédente livraison. Cette révision à la hausse reflète principalement la bonne tenue des exportations de matières premières et l\'accélération des dépenses d\'infrastructure dans plusieurs États membres.\n\nLa Côte d\'Ivoire reste le moteur principal de l\'union, avec une prévision de croissance de 6,8 %, tirée par le cacao, les services et les grands projets d\'infrastructures liés à la CAN 2025. Le Sénégal bénéficie de la montée en puissance de la production pétrolière et gazière (+9,1 % projeté), tandis que le Burkina Faso et le Mali affichent des perspectives plus modestes en raison des tensions sécuritaires.\n\nDu côté de l\'inflation, la BCEAO anticipe un reflux à 2,8 % en moyenne annuelle 2026, contre 3,4 % observés en 2025, la détente des prix alimentaires mondiaux jouant un rôle favorable.\n\nCes perspectives macroéconomiques positives constituent un facteur de soutien pour les valeurs de la BRVM, en particulier les bancaires et les biens de consommation exposés à la demande intérieure.',
 'Macro', 'BCEAO / Reprise Afrivest', NULL,
 '2026-02-10 08:00:00', 1, 4, 1, 311),

-- 7 ── Indice
(7,
 'BRVM Composite : le marché efface ses pertes du mois de janvier en trois séances',
 'L\'indice BRVM Composite a gagné 2,3 % sur la semaine écoulée, porté par les bancaires et les agro-industrielles. Le volume hebdomadaire dépasse 2,1 milliards FCFA.',
 'La BRVM a enchaîné trois séances de hausse consécutives, permettant à l\'indice BRVM Composite de regagner 2,3 % sur la semaine et d\'effacer intégralement le repli enregistré en janvier. L\'indice BRVM 30, qui regroupe les trente valeurs les plus liquides, a progressé dans les mêmes proportions à +2,1 %.\n\nLes secteurs bancaire et agro-industriel ont été les principaux contributeurs à cette performance. ETI, SGBCI et BOCI ont collectivement ajouté 45 points à l\'indice composite, tandis que PALC et SIVC tiraient vers le haut le compartiment agro-industriel.\n\nLe volume hebdomadaire total des transactions a atteint 2,15 milliards FCFA, un niveau supérieur de 38 % à la moyenne des quatre semaines précédentes, signalant un regain d\'appétit des investisseurs institutionnels pour les actifs de la zone UEMOA.\n\nLes analystes de marché attribuent ce rebond à la combinaison d\'un environnement macro favorable (cf. prévisions BCEAO à 6,2 %) et d\'un flux de résultats annuels globalement supérieurs aux attentes du consensus.',
 'Indice', 'BRVM Infos', 'Rédaction BRVM Infos',
 '2026-02-07 17:00:00', 1, 3, 1, 178),

-- 8 ── Marché / SIVC négatif
(8,
 'SIV CI sous pression : l\'action recule de 4,2 % après un avertissement sur résultats',
 'SIVC chute de 4,2 % après que la direction a prévenu d\'un impact négatif de la sécheresse 2025 sur les récoltes de canne à sucre, révisant ses prévisions de bénéfice à la baisse.',
 'L\'action SIV CI (SIVC) a accusé une baisse de 4,2 % en séance à 645 FCFA, dans des volumes inhabituellement élevés de 8 700 titres, après la publication d\'un communiqué de la direction avertissant d\'une révision à la baisse des prévisions de résultat pour l\'exercice 2025.\n\nLe groupe sucrier invoque les effets de la sécheresse prolongée de mi-2025 sur les récoltes de canne dans les périmètres irrigués de la Côte d\'Ivoire intérieure. La récolte 2025-2026 serait inférieure de 12 % aux objectifs fixés en début d\'année, ce qui se traduira par une baisse du chiffre d\'affaires estimée entre 6 et 9 % pour l\'exercice.\n\nLe bénéfice net pourrait ainsi s\'établir entre 3,2 et 3,8 milliards FCFA, contre un consensus qui anticipait 5,1 milliards avant cet avertissement.\n\nDeux courtiers ont d\'ores et déjà dégradé leur recommandation sur le titre, de ACHAT à CONSERVER, avec des objectifs de cours abaissés respectivement à 680 et 700 FCFA. Un troisième maintient sa recommandation d\'achat, estimant que le choc est ponctuel et que les fondamentaux long terme restent intacts.',
 'Marché', 'Reuters Afrique', 'Adjoua Konan',
 '2026-02-05 15:45:00', 0, 4, 1, 95),

-- 9 ── Résultats / ONTBF
(9,
 'Onatel Burkina : revenus mobiles en hausse de 21 %, le bénéfice dépasse les attentes',
 'ONTBF publie des résultats annuels 2025 en forte progression, porté par l\'explosion du mobile money et de la data. Le dividende est maintenu à 1 200 FCFA par action.',
 'Onatel Burkina Faso (ONTBF) a publié ses comptes annuels 2025 avec un chiffre d\'affaires consolidé de 142 milliards FCFA, en progression de 14 % sur un an, et un bénéfice net de 22,3 milliards FCFA, supérieur de 8 % aux estimations du consensus.\n\nLe segment mobile — voix, data et mobile money — représente désormais 78 % des revenus totaux, contre 71 % en 2024. Les revenus de mobile money ont particulièrement impressionné avec une hausse de 21 %, reflétant la pénétration croissante des services financiers digitaux au Burkina Faso malgré un contexte sécuritaire complexe.\n\nLa marge EBITDA s\'améliore de 180 points de base à 38,2 %, témoignant des efforts de maîtrise des coûts d\'exploitation et d\'optimisation du réseau. Les capex sont en recul de 7 % grâce à l\'achèvement du programme de déploiement de la fibre optique dans les principales villes.\n\nLe conseil d\'administration propose le maintien du dividende à 1 200 FCFA par action (inchangé par rapport à 2024), représentant un rendement de 5,4 % au cours actuel de 22 200 FCFA.',
 'Résultats', 'Jeune Investisseur', 'Mamadou Sawadogo',
 '2026-02-03 10:00:00', 1, 4, 1, 134),

-- 10 ── Dividendes / SGBC
(10,
 'SGBC relève son dividende de 12 % : 1 050 FCFA par action pour l\'exercice 2025',
 'Société Générale Burkina Faso (SGBC) annonce une hausse significative de son dividende, à 1 050 FCFA, récompensant ses actionnaires après une année record.',
 'Le conseil d\'administration de Société Générale Burkina Faso (SGBC) a approuvé la distribution d\'un dividende de 1 050 FCFA par action au titre de l\'exercice 2025, en hausse de 12 % par rapport au dividende versé l\'an dernier (937 FCFA). Cette proposition sera soumise au vote des actionnaires lors de l\'assemblée générale prévue le 28 mars 2026.\n\nAu cours actuel de 10 075 FCFA, le dividende proposé représente un rendement brut de 10,4 %, ce qui place SGBC parmi les valeurs les plus généreuses de la BRVM en termes de yield. La date de détachement envisagée est fixée au 5 avril 2026.\n\nCette hausse s\'appuie sur des résultats 2025 solides : le produit net bancaire a progressé de 9 % à 38,7 milliards FCFA, et le résultat net a atteint 11,2 milliards FCFA, un record historique pour l\'établissement.\n\nLe titre SGBC a réagi positivement à l\'annonce, gagnant 1,8 % en séance pour terminer à 10 255 FCFA, effaçant ainsi une partie du retard accumulé depuis le début de l\'année.',
 'Dividendes', 'Marchés Tropicaux', 'Isabelle Traoré',
 '2026-01-28 13:30:00', 1, 3, 1, 76),

-- 11 ── Corporate / ETIT
(11,
 'Ecobank annonce le rachat de 5 % de son capital propre — programme de buy-back lancé',
 'ETI démarre un programme de rachat d\'actions d\'un montant maximum de 50 millions USD, signe de confiance de la direction dans la valorisation actuelle du titre.',
 'Ecobank Transnational Incorporated (ETIT) a officiellement lancé un programme de rachat d\'actions propres pouvant porter sur jusqu\'à 5 % du capital, pour un montant maximum de 50 millions USD. Le programme s\'étalera sur douze mois à compter du 1er mars 2026.\n\nLe groupe a mandaté deux courtiers pour l\'exécution du programme sur les marchés de Lagos, Accra et la BRVM d\'Abidjan. Les titres rachetés seront annulés ou mis en réserve en vue d\'éventuelles opérations de croissance externe.\n\nCe type d\'opération est relativement rare en Afrique subsaharienne et constitue un signal fort envoyé par la direction : elle estime que l\'action est sous-valorisée par rapport à ses fondamentaux intrinsèques et à ses comparables internationaux.\n\nDe son côté, le marché a bien accueilli l\'annonce : ETIT a progressé de 2,8 % à 22,6 FCFA en séance, dans des volumes multipliés par quatre. Plusieurs grands fonds d\'investissement spécialisés en Afrique émergente ont déclaré avoir renforcé leurs positions sur la valeur.\n\nRappelons qu\'ETI avait déjà réalisé un buy-back partiel en 2022, rachetant pour 18 millions USD de ses propres titres.',
 'Corporate', 'Bloomberg Afrique', 'Kwame Asante',
 '2026-01-22 09:00:00', 1, 4, 1, 221),

-- 12 ── Analyse / SLBC + PALC
(12,
 'Agro-industrie BRVM : nos 3 convictions pour le premier semestre 2026',
 'Après une année 2025 en demi-teinte, les valeurs agro-industrielles de la BRVM offrent des points d\'entrée intéressants. Nous détaillons nos trois conviction plays pour S1 2026.',
 'Le secteur agro-industriel de la BRVM a sous-performé l\'indice général de 4,2 % en 2025, victime d\'une conjonction de facteurs défavorables : sécheresse dans le bassin cotonnier, tensions sur les prix mondiaux des matières premières et incertitudes politiques dans plusieurs pays producteurs.\n\nPour autant, nous pensons que 2026 marquera un point d\'inflexion, et identifions trois convictions d\'investissement pour le premier semestre.\n\n**1. SLBC – Solibra CI (Objectif : 195 000 FCFA).** Le brasseur ivoirien reste notre premier choix dans le secteur des boissons. La reprise de la consommation domestique, l\'extension des capacités de production inaugurée en décembre 2025 et le pipeline de nouveaux produits (bières premium, boissons énergisantes) justifient selon nous une prime de valorisation. Le titre offre par ailleurs un dividende yield de 4,6 % qui sécurise le portage.\n\n**2. PALC – Palm CI (Objectif : 8 200 FCFA).** L\'acquisition des 3 000 hectares additionnels et la remontée anticipée des cours mondiaux du CPO constituent des catalyseurs puissants à 12 mois. Le titre décote de 15 % sur sa valeur de remplacement des actifs fonciers.\n\n**3. SIVC – SIV CI (Objectif : 750 FCFA, attente).** Nous passons SIVC en position d\'attente après l\'avertissement sur résultats, mais maintenons un avis positif à moyen terme. Le choc climatique 2025 est exceptionnel et non structurel. Le titre pourrait offrir un point d\'entrée attractif si la baisse se poursuit.',
 'Analyse', 'Afrivest Research', 'Jean-Baptiste Ouédraogo',
 '2026-01-15 11:00:00', 1, 6, 1, 189);

-- ─── Tags ────────────────────────────────────────────────────────────────────

INSERT INTO news_tags (id, name) VALUES
( 1, 'SLBC'),
( 2, 'ETIT'),
( 3, 'BOAN'),
( 4, 'SGBC'),
( 5, 'PALC'),
( 6, 'SIVC'),
( 7, 'ONTBF'),
( 8, 'Hausses'),
( 9, 'Baisses'),
(10, 'Consommation'),
(11, 'Bancaire'),
(12, 'Agro-industrie'),
(13, 'Dividende'),
(14, 'Résultats'),
(15, 'Mobile Money'),
(16, 'Buy-back'),
(17, 'UEMOA'),
(18, 'Macro'),
(19, 'Analyse'),
(20, 'BRVM Composite');

-- ─── Article ↔ Tags ──────────────────────────────────────────────────────────

INSERT INTO news_article_tags (article_id, tag_id) VALUES
-- Article 1 : SLBC, Consommation, Hausses
(1,  1), (1, 10), (1,  8),
-- Article 2 : ETIT, Bancaire, Résultats, Hausses
(2,  2), (2, 11), (2, 14), (2,  8),
-- Article 3 : BOAN, Bancaire, Dividende
(3,  3), (3, 11), (3, 13),
-- Article 4 : SGBC, Bancaire, Analyse
(4,  4), (4, 11), (4, 19),
-- Article 5 : PALC, Agro-industrie, Corporate
(5,  5), (5, 12),
-- Article 6 : UEMOA, Macro
(6, 17), (6, 18),
-- Article 7 : BRVM Composite, Hausses
(7, 20), (7,  8),
-- Article 8 : SIVC, Agro-industrie, Baisses
(8,  6), (8, 12), (8,  9),
-- Article 9 : ONTBF, Résultats, Mobile Money
(9,  7), (9, 14), (9, 15),
-- Article 10 : SGBC, Bancaire, Dividende
(10, 4), (10, 11), (10, 13),
-- Article 11 : ETIT, Bancaire, Buy-back
(11, 2), (11, 11), (11, 16),
-- Article 12 : SLBC, PALC, SIVC, Agro-industrie, Analyse
(12, 1), (12,  5), (12,  6), (12, 12), (12, 19);

-- ─── Article ↔ Tickers ───────────────────────────────────────────────────────

INSERT INTO news_company_links (article_id, ticker) VALUES
( 1, 'SLBC'),
( 2, 'ETIT'),
( 3, 'BOAN'),
( 4, 'SGBC'),
( 5, 'PALC'),
( 8, 'SIVC'),
( 9, 'ONTBF'),
(10, 'SGBC'),
(11, 'ETIT'),
(12, 'SLBC'),
(12, 'PALC'),
(12, 'SIVC');
