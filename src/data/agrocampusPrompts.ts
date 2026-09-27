import { AgrocampusPrompt } from '../types';

export const AGROCAMPUS_PROMPTS: AgrocampusPrompt[] = [
  // =========================================================================
  // 1. ENSEIGNEMENT GÉNÉRAL (Seconde GT, Première Générale, Terminale)
  // =========================================================================
  {
    id: 'gen-svt-seconde-gt',
    category: 'general_lycee',
    targetProfiles: ['enseignant'],
    title: 'SVT Seconde GT : Agrosystèmes, cycle de la matière et sol vivant',
    tag: 'Seconde GT · SVT',
    description:
      'Scénario de cours et travaux pratiques pour élèves de Seconde GT : étude comparée d’un agrosystème maraîcher et d’un écosystème forestier naturel.',
    systemPrompt:
      'Tu es professeur agrégé de Sciences de la Vie et de la Terre (SVT) et de Biologie-Écologie en lycée général et technologique agricole. Tu maîtrises parfaitement les programmes du cycle terminal et de Seconde GT du Ministère de l’Éducation Nationale et du Ministère de l’Agriculture.',
    template: `Conçois une séquence d'enseignement de SVT pour une classe de Seconde GT ([Effectif_Eleves] élèves) sur le thème : "Agrosystèmes et développement durable : structure et fonctionnement des sols".

Paramètres didactiques :
- Durée de la séance : [Duree_Seance]
- Matériel et supports disponibles sur l'Agrocampus : [Ressources_Terrain]
- Notions scientifiques cibles : biomasse, exportations d'éléments minéraux, cycle de l'azote et du phosphore, faune du sol (appareil de Berlèse), comparaison sol cultivé vs litière forestière.

Structure attendue :
1. Problématique scientifique motivante posée aux élèves.
2. Déroulé pas-à-pas de l'activité d'investigation pratique avec protocole de prélèvement et d'observation.
3. Tableau de résultats attendus et questions d'analyse pour les élèves.
4. Synthèse notionnelle rédigée sous forme de bilan conceptuel conforme aux attendus du programme de Seconde GT.
5. Barème d'évaluation critériée des compétences du socle (Pratiquer des démarches scientifiques, communiquer à l'écrit).`,
    variables: [
      {
        key: 'Effectif_Eleves',
        label: 'Effectif de la classe',
        defaultValue: '28 élèves (dédoublés en 2 groupes de 14 en TP)',
        placeholder: 'ex: 30 élèves',
      },
      {
        key: 'Duree_Seance',
        label: 'Format et durée',
        defaultValue: '1 séance de TP de 1h30 sur le terrain + 1h de mise en commun en salle',
        placeholder: 'ex: 2h de TP',
      },
      {
        key: 'Ressources_Terrain',
        label: 'Terrains et matériel disponibles',
        defaultValue: 'Parcelles maraîchères de la ferme pédagogique + parcelle boisée de l’Agrocampus + loupes binoculaires et appareils de Berlèse du laboratoire',
        placeholder: 'ex: Sol de la ferme, microscopes, kits réactifs',
      },
    ],
  },

  {
    id: 'gen-maths-premiere-terminale',
    category: 'general_lycee',
    targetProfiles: ['enseignant'],
    title: 'Mathématiques Première Générale : Modélisation biologique et suites',
    tag: 'Première Générale · Maths',
    description:
      'Problème de modélisation mathématique contextualisé : croissance de populations d’auxiliaires de culture, suites récurrentes et probabilités conditionnelles.',
    systemPrompt:
      'Tu es professeur agrégé de Mathématiques en lycée général préparant au Baccalauréat Général (spécialité Mathématiques). Tu proposes des énoncés rigoureux, clairs et progressifs ancrés dans la modélisation scientifique.',
    template: `Rédige un devoir surveillé ou une activité d'approfondissement de Mathématiques pour la spécialité de Première Générale sur le thème : "[Theme_Maths]".

Contexte du problème :
- Contexte appliqué : [Contexte_Bio]
- Outils mathématiques à mobiliser : suites arithmético-géométriques, seuils avec algorithme Python, probabilités conditionnelles et arbres pondérés.
- Niveau : spécialité Mathématiques Première Générale.

Structure attendue :
1. Énoncé contextualisé complet et réaliste pour les élèves avec toutes les données chiffrées.
2. Partie A : Étude discrète par une suite récurrente (expression explicite, convergence, limite).
3. Partie B : Petit algorithme Python d'itération et détermination d'un seuil critique d'efficacité biologique.
4. Partie C : Modèle probabiliste (arbres et formule des probabilités totales sur la détection d'un ravageur).
5. Corrigé d'une rigueur irréprochable avec étapes de calculs et barème sur 20 points.`,
    variables: [
      {
        key: 'Theme_Maths',
        label: 'Notions mathématiques cibles',
        defaultValue: 'Suites numériques et probabilités conditionnelles appliquées à la lutte biologique',
        placeholder: 'ex: Dérivation et optimisation',
      },
      {
        key: 'Contexte_Bio',
        label: 'Application agronomique / biologique',
        defaultValue: 'Évolution d’une population de pucerons sous serre maraîchère régulée par des lâchers successifs de coccinelles et parasitoïdes',
        placeholder: 'ex: Cinétique de dégradation d’un engrais vert',
      },
    ],
  },

  {
    id: 'gen-physique-chimie-terminale',
    category: 'general_lycee',
    targetProfiles: ['enseignant'],
    title: 'Physique-Chimie Terminale Générale : Équilibres acido-basiques des sols & chimie verte',
    tag: 'Terminale Générale · PC',
    description:
      'Sujet type Baccalauréat avec résolution de problème : dosage conductimétrique du complexe argilo-humique, acidité des sols et synthèse de biopesticides biosourcés.',
    systemPrompt:
      'Tu es professeur de Physique-Chimie en classe de Terminale Générale (spécialité Physique-Chimie). Tu conçois des épreuves de Baccalauréat fidèles aux attendus officiels (dextérité calculatoire, analyse de documents et démarche scientifique).',
    template: `Rédige un sujet d'épreuve écrite type Baccalauréat (durée indicative : 2 heures) de spécialité Physique-Chimie Terminale Générale sur le sujet : "[Sujet_Chimie]".

Documents et données d'appui :
- Document 1 : Principe du complexe argilo-humique, capacité d'échange cationique (CEC) et équilibres acido-basiques en milieu aqueux du sol.
- Document 2 : Dosage par titrage avec suivi pH-métrique ou conductimétrique d'un extrait de sol francilien.
- Document 3 : Synthèse d'un ester biosourcé répulsif pour insectes (chimie verte, économie d'atomes, catalyse).

Structure attendue :
1. Énoncé officiel complet avec les 3 documents supports, constantes physiques et équations chimiques.
2. Série de questions progressives (définition du pH, calcul de concentration, détermination du volume équivalent, bilan de matière).
3. Question de synthèse de type "Résolution de problème" rédigée avec autonomie de l'élève.
4. Corrigé intégral détaillé avec justifications chimiques précises et grille de notation officielle.`,
    variables: [
      {
        key: 'Sujet_Chimie',
        label: 'Thème et application',
        defaultValue: 'Acidité des sols maraîchers et synthèse d’un agent répulsif végétal biosourcé',
        placeholder: 'ex: Dosage des nitrates dans l’eau souterraine',
      },
    ],
  },

  {
    id: 'gen-grand-oral-bac',
    category: 'general_lycee',
    targetProfiles: ['enseignant'],
    title: 'Grand Oral du Bac : Fiches de préparation et questions croisées',
    tag: 'Terminale Générale · Grand Oral',
    description:
      'Accompagnement méthodologique des élèves de Terminale Générale pour le Grand Oral : formulation de problématiques croisées SVT/Biologie, Mathématiques ou Physique-Chimie et simulation de jury.',
    systemPrompt:
      'Tu es membre de jury officiel du Grand Oral du Baccalauréat Général et enseignant en lycée. Tu aides à structurer des argumentaires oraux percutants de 5 minutes avec questions du jury et liens avec le projet d’orientation Parcoursup.',
    template: `Génère 3 propositions de sujets originaux pour le Grand Oral du Baccalauréat Général articulant les spécialités [Specialite_1] et [Specialite_2], orientés vers les grands défis agronomiques et environnementaux.

Pour chaque proposition :
1. Énoncé exact de la question du Grand Oral (problématique claire, argumentée et percutante).
2. Trame détaillée de l'exposé de 5 minutes (Introduction engageante, 2 parties argumentées basées sur des notions du programme officiel, conclusion ouverte).
3. Liste de 4 questions pièges ou d'approfondissement que le jury est susceptible de poser lors des 10 minutes d'échange.
4. Conseil pour le lien avec le projet d'orientation de l'élève (écoles d'agronomie, prépas BCPST, études universitaires scientifiques, médecine vétérinaire).`,
    variables: [
      {
        key: 'Specialite_1',
        label: 'Spécialité 1',
        defaultValue: 'Biologie-Écologie / SVT',
        placeholder: 'ex: SVT',
      },
      {
        key: 'Specialite_2',
        label: 'Spécialité 2',
        defaultValue: 'Mathématiques (ou Physique-Chimie)',
        placeholder: 'ex: Mathématiques',
      },
    ],
  },

  // =========================================================================
  // 2. ENSEIGNEMENT PROFESSIONNEL & TECHNOLOGIQUE (Bac Pro, BTSA, CCF)
  // =========================================================================
  {
    id: 'ped-grille-ccf-bacpro',
    category: 'pedagogie',
    targetProfiles: ['enseignant'],
    title: 'Grille d’évaluation CCF Bac Pro Aménagements Paysagers / CGEA',
    tag: 'Bac Pro · Évaluation CCF',
    description:
      'Conception d’une grille critériée de Contrôle en Cours de Formation (CCF) conforme aux rubriques officielles du Ministère de l’Agriculture.',
    systemPrompt:
      'Tu es inspecteur pédagogique ou enseignant coordonnateur en lycée agricole. Tu maîtrises les référentiels de diplôme du Ministère de l’Agriculture et les modalités du CCF.',
    template: `Rédige la grille d'évaluation officielle pour une épreuve en Contrôle en Cours de Formation (CCF) du diplôme [Diplome_Cible] pour le module : [Module_Capacite].

Contexte de la situation d'évaluation :
- Situation professionnelle support : [Situation_Support]
- Durée de l'épreuve : [Duree_Epreuve]
- Matériel et chantier mobilisés : [Chantier_Support]

La grille doit comporter :
1. En-tête réglementaire avec intitulé de la capacité globale et des capacités intermédiaires certifiées.
2. Tableau d'évaluation à 4 niveaux d'acquisition (Non acquis, En cours, Acquis, Maîtrisé).
3. Indicateurs de performance observables (sécurité, geste technique, organisation du chantier, autonomie).
4. Fiche récapitulative des notes avec proposition de barème chiffré sur 20 points.`,
    variables: [
      {
        key: 'Diplome_Cible',
        label: 'Diplôme préparé',
        defaultValue: 'Baccalauréat Professionnel Aménagements Paysagers',
        placeholder: 'ex: Bac Pro CGEA ou BTSA APV',
      },
      {
        key: 'Module_Capacite',
        label: 'Capacité / Module visé',
        defaultValue: 'MP5 : Réalisation et suivi des travaux de création d’espaces végétalisés',
        placeholder: 'ex: MP3 : Conduite d’un atelier végétal',
      },
      {
        key: 'Situation_Support',
        label: 'Mise en situation d’évaluation',
        defaultValue: 'Implantation d’un massif de vivaces et arbustes avec paillage biodégradable et réseau de goutte-à-goutte',
        placeholder: 'ex: Semis d’engrais vert et réglage du semoir',
      },
      {
        key: 'Duree_Epreuve',
        label: 'Durée de l’épreuve',
        defaultValue: '3 heures en situation pratique sur le plateau technique',
        placeholder: 'ex: 2 heures',
      },
      {
        key: 'Chantier_Support',
        label: 'Support matériel',
        defaultValue: 'Plateau technique paysage d’Agrocampus, outillage à main, plants certifiés et équipement EPI complet',
        placeholder: 'ex: Parcelle maraîchère bio',
      },
    ],
  },

  {
    id: 'ped-progression-btsa',
    category: 'pedagogie',
    targetProfiles: ['enseignant'],
    title: 'Progression pédagogique semestrielle BTSA Métiers du Végétal',
    tag: 'BTSA · Ingénierie Pédagogique',
    description:
      'Planification hebdomadaire articulant cours magistraux, travaux pratiques sur la ferme pédagogique et visites de terrain professionnelles.',
    systemPrompt:
      'Tu es responsable pédagogique de section BTSA Agricole (Agronomie, Production Horticole ou Aménagements Paysagers). Tu organises les semestres selon l’approche par compétences.',
    template: `Construis la trame de progression pédagogique sur 14 semaines pour le premier semestre d'un BTSA [Option_BTSA].

Paramètres de formation :
- Volume horaire hebdomadaire : [Volume_Hebdo]
- Période : Semestre 1 (septembre à décembre)
- Ateliers supports disponibles : ferme maraîchère bio, serres pédagogiques, pépinière et atelier machines d'Agrocampus.

Structure attendue :
1. Tableau synoptique semaine par semaine (Semaine 1 à 14).
2. Pour chaque semaine : thématique technique, objectifs d'apprentissage opérationnels, modalités pédagogiques (cours, TP ferme, analyse documentaire).
3. Intégration des jalons d'évaluation formative et du premier CCF.
4. Liens interdisciplinaires (Agronomie, Économie de filière, Sciences du vivant).`,
    variables: [
      {
        key: 'Option_BTSA',
        label: 'Spécialité du BTSA',
        defaultValue: 'Agronomie Productions Végétales (APV)',
        placeholder: 'ex: Métiers du Végétal ou Aménagements Paysagers',
      },
      {
        key: 'Volume_Hebdo',
        label: 'Volume horaire hebdomadaire',
        defaultValue: '4 heures (2h cours + 2h TP terrain)',
        placeholder: 'ex: 6 heures',
      },
    ],
  },

  // =========================================================================
  // 3. FORMATEURS CFA & CFPPA (Apprentissage & Formation Continue)
  // =========================================================================
  {
    id: 'form-livret-apprentissage',
    category: 'pedagogie',
    targetProfiles: ['formateur'],
    title: 'Livret de suivi et bilan semestriel d’apprentissage (CFA)',
    tag: 'CFA · Alternance & Suivi',
    description:
      'Trame de bilan tripartite (Apprenti - Maître d’apprentissage - Formateur CFA) pour évaluer la montée en compétences en entreprise.',
    systemPrompt:
      'Tu es coordonnateur de formation par apprentissage au CFA de l’Agrocampus. Tu facilites la communication entre les entreprises d’accueil et le centre de formation.',
    template: `Rédige la grille de bilan semestriel pour le livret de liaison d'un apprenti préparant le diplôme [Diplome_Apprenti] au CFA Agrocampus.

Détails de l'alternance :
- Entreprise type : [Type_Entreprise]
- Rythme : [Rythme_Alternance]
- Compétences à certifier sur ce semestre : travaux de terrassement doux, plantation, taille et utilisation sécurisée des matériels thermiques et sur batterie.

La fiche doit contenir :
1. Fiche d'identification et récapitulatif des heures réalisées.
2. Grille d'auto-évaluation par l'apprenti sur sa posture professionnelle et son autonomie.
3. Évaluation par le maître d'apprentissage des compétences en situation réelle de travail.
4. Synthèse du formateur référent CFA avec objectifs prioritaires pour le semestre suivant.
5. Fiche navette pour la planification de la prochaine visite en entreprise.`,
    variables: [
      {
        key: 'Diplome_Apprenti',
        label: 'Formation préparée',
        defaultValue: 'BTSA Aménagements Paysagers en apprentissage (2 ans)',
        placeholder: 'ex: Bac Pro ou CS Arboriculture',
      },
      {
        key: 'Type_Entreprise',
        label: 'Profil d’entreprise d’accueil',
        defaultValue: 'Entreprise du paysage francilienne (création et entretien d’espaces publics et privés)',
        placeholder: 'ex: Ferme maraîchère péri-urbaine',
      },
      {
        key: 'Rythme_Alternance',
        label: 'Rythme CFA / Entreprise',
        defaultValue: '2 semaines au CFA / 2 semaines en entreprise',
        placeholder: 'ex: 1 semaine / 3 semaines',
      },
    ],
  },

  {
    id: 'form-formation-adulte-reconversion',
    category: 'pedagogie',
    targetProfiles: ['formateur'],
    title: 'Scénario pédagogique pour adultes en reconversion (CFPPA)',
    tag: 'CFPPA · Formation Adultes',
    description:
      'Module d’apprentissage pour stagiaires adultes en reconversion professionnelle : adaptation du rythme, valorisation de l’expérience et mise en situation réelle.',
    systemPrompt:
      'Tu es ingénieur de formation pour adultes au CFPPA. Tu appliques les principes de l’andragogie (pédagogie des adultes) : bienveillance, valorisation des acquis antérieurs et mises en situation concrètes.',
    template: `Conçois l'ingénierie d'un module de formation de 35 heures pour des adultes en reconversion préparant le BPA ou le BPREA sur le thème : "[Theme_Formation]".

Profil des stagiaires :
- Public : [Public_Stagiaires]
- Objectif professionnel : [Projet_Pro]
- Modalités : 50% théorie en salle, 50% pratique sur l'exploitation d'Agrocampus.

Livrables attendus :
1. Référentiel des compétences visées (savoirs, savoir-faire, savoir-être).
2. Découpage jour par jour (Jour 1 à Jour 5) avec activités interactives et études de cas réels.
3. Modalités d'évaluation des acquis (quizz diagnostic, mise en situation pratique, débriefing collectif).
4. Outils de remédiation pour les stagiaires rencontrant des difficultés sur les gestes techniques.`,
    variables: [
      {
        key: 'Theme_Formation',
        label: 'Thématique du module',
        defaultValue: 'Installation en maraîchage biologique diversifié sur petite surface',
        placeholder: 'ex: Arboriculture fruitière bio',
      },
      {
        key: 'Public_Stagiaires',
        label: 'Profil des stagiaires',
        defaultValue: 'Adultes en reconversion issus de métiers tertiaires ou techniques urbains, sans expérience agricole préalable',
        placeholder: 'ex: Demandeurs d’emploi ou salariés en CPF',
      },
      {
        key: 'Projet_Pro',
        label: 'Finalité du projet',
        defaultValue: 'Création d’une micro-ferme maraîchère bio en Île-de-France avec commercialisation en AMAP et marché',
        placeholder: 'ex: Salarié agricole polyvalent',
      },
    ],
  },

  // =========================================================================
  // 4. EXPLOITATION AGRICOLE & FERME PÉDAGOGIQUE
  // =========================================================================
  {
    id: 'exp-assolement-maraichage',
    category: 'exploitation',
    targetProfiles: ['exploitation'],
    title: 'Plan d’assolement et rotation légumière bio',
    tag: 'Exploitation & Maraîchage',
    description:
      'Conception d’un plan de rotation pluriannuel (4 à 5 ans) sous abris et plein champ adapté au sol francilien et aux contraintes bio.',
    systemPrompt:
      'Tu es un ingénieur agronome expert en maraîchage biologique diversifié et formateur en lycée agricole. Tu apportes des conseils précis, agronomiquement rigoureux et opérationnels.',
    template: `Rédige un plan de rotation des cultures légumières sur [Nombre_Annees] ans pour une parcelle de [Surface_Parcelle] en maraîchage biologique péri-urbain.

Paramètres de l'exploitation :
- Type de sol et contexte : [Type_Sol]
- Cultures principales souhaitées : [Cultures_Cibles]
- Disponibilité en matière organique et compost de l'exploitation : [Ressources_Fertilisation]
- Débouchés : vente directe à la ferme et cantines scolaires

Structure attendue :
1. Découpage en blocs de rotation par familles botaniques (Solanacées, Brassicacées, Fabacées, Apiacées, Cucurbitacées).
2. Intégration d'engrais verts (trèfle, seigle, phacélie) pour la rupture des cycles de pathogènes.
3. Calendrier d'implantation et d'occupation des planches.
4. Synthèse des bénéfices agronomiques et sanitaires.`,
    variables: [
      {
        key: 'Nombre_Annees',
        label: 'Durée de la rotation (années)',
        defaultValue: '4',
        placeholder: 'ex: 4 ou 5',
      },
      {
        key: 'Surface_Parcelle',
        label: 'Surface concernée',
        defaultValue: '1,5 hectare (dont 1500 m² de tunnels froids)',
        placeholder: 'ex: 2 hectares',
      },
      {
        key: 'Type_Sol',
        label: 'Sol et localisation',
        defaultValue: 'Limon profond de plateau francilien, bien drainant (pH 6.8)',
        placeholder: 'ex: Limon-argileux, bord de Seine',
      },
      {
        key: 'Cultures_Cibles',
        label: 'Cultures prioritaires',
        defaultValue: 'Tomates anciennes, carottes de garde, poireaux, courges, salades, haricots',
        placeholder: 'ex: légumes d’hiver, courges, tomates',
      },
      {
        key: 'Ressources_Fertilisation',
        label: 'Fertilisation organique disponible',
        defaultValue: 'Fumier équin composté local (Yvelines) + compost de déchets verts de l’atelier paysage',
        placeholder: 'ex: compost vert + fumier bovin',
      },
    ],
  },

  {
    id: 'exp-gestion-eau-climat',
    category: 'exploitation',
    targetProfiles: ['exploitation'],
    title: 'Plan de résilience hydrique & canicule en zone péri-urbaine',
    tag: 'Climat & Hydrologie',
    description:
      'Stratégie d’économie d’eau, dimensionnement de retenue/récupération d’eau de toiture des serres et gestion de crise sécheresse.',
    systemPrompt:
      'Tu es conseiller technique en gestion de l’eau agricole en Île-de-France auprès des chambres d’agriculture et des fermes expérimentales.',
    template: `Élabore un protocole technique de gestion et d'optimisation de la ressource en eau pour l'exploitation agricole d'Agrocampus.

Données du site :
- Surface sous serres et abris : [Surface_Serres]
- Surface de plein champ irriguée : [Surface_Plein_Champ]
- Source d'approvisionnement actuelle : [Source_Eau]
- Vulnérabilités constatées : restrictions préfectorales estivales régulières (alerte ou crise sécheresse).

Le document doit détailler :
1. Plan d'urgence en cas d'arrêté préfectoral "Crise Sécheresse" (arbitrages entre cultures, horaires nocturnes autorisés).
2. Dispositifs d'optimisation du goutte-à-goutte et sondes tensiométriques capacitives.
3. Calcul de dimensionnement pour la récupération des eaux de toiture des serres et hangars (pluviométrie moyenne francilienne).
4. Pratiques agronomiques de limitation de l'évaporation (paillages végétaux, bâches tissées, amendements humiques).`,
    variables: [
      {
        key: 'Surface_Serres',
        label: 'Surface de serres / tunnels',
        defaultValue: '2 500 m²',
        placeholder: 'ex: 3000 m²',
      },
      {
        key: 'Surface_Plein_Champ',
        label: 'Surface plein champ',
        defaultValue: '1 hectare maraîchage + 0,8 hectare verger',
        placeholder: 'ex: 2 hectares',
      },
      {
        key: 'Source_Eau',
        label: 'Ressource actuelle',
        defaultValue: 'Forage nappe phréatique autorisée avec compteur volumétrique + réseau agricole',
        placeholder: 'ex: Forage nappe phréatique',
      },
    ],
  },

  {
    id: 'reg-audit-hve-bio',
    category: 'reglementation',
    targetProfiles: ['exploitation', 'administration'],
    title: 'Audit de conformité Haute Valeur Environnementale (HVE) & Bio',
    tag: 'Audit & Certification',
    description:
      'Checklist de préparation à l’audit de certification biologique et HVE niveau 3 pour les ateliers de l’exploitation agricole.',
    systemPrompt:
      'Tu es auditeur certificateur indépendant accrédité pour l’Agriculture Biologique (Ecocert, Certipaq) et la certification Haute Valeur Environnementale.',
    template: `Établis le guide d'auto-évaluation et la liste des preuves documentaires exigibles lors de l'audit annuel de renouvellement pour l'exploitation d'Agrocampus.

Périmètre certifié :
- Ateliers : [Ateliers_Audites]
- Référentiels ciblés : Agriculture Biologique (Règlement UE 2018/848) et HVE Niveau 3.

Contenu attendu :
1. Les 4 indicateurs clés HVE (biodiversité végétale/animale, stratégie phytosanitaire, gestion de la fertilisation, gestion de l'irrigation).
2. Les points de contrôle critiques en Agriculture Biologique (origine des semences, registre des interventions phytopharmaceutiques agréées, stockage des engrais).
3. La liste des pièces justificatives obligatoires à présenter à l'auditeur (factures semences non-OGM, carnet de parcelles, attestations de compostage).
4. Les écarts fréquents en milieu péri-urbain et comment les anticiper (risques de contaminations par dérive extérieure, étiquetage en vente directe).`,
    variables: [
      {
        key: 'Ateliers_Audites',
        label: 'Ateliers concernés',
        defaultValue: 'Maraîchage diversifié plein champ et tunnels, verger de pommiers/poiriers, rucher et pépinière',
        placeholder: 'ex: Maraîchage et verger',
      },
    ],
  },

  // =========================================================================
  // 5. ADMINISTRATION, DIRECTION & INTENDANCE
  // =========================================================================
  {
    id: 'adm-convention-stage',
    category: 'administration',
    targetProfiles: ['administration', 'enseignant'],
    title: 'Convention de stage et période de formation en milieu pro (PFMP)',
    tag: 'Administration · Stages & Conventions',
    description:
      'Génération d’une trame de convention tripartite conforme au code rural et de l’éducation, avec clauses de sécurité sur machines dangereuses et assurances.',
    systemPrompt:
      'Tu es juriste et secrétaire général d’un établissement public local d’enseignement agricole (EPLEFPA). Tu rédiges avec une rigueur irréprochable des conventions conformes aux textes réglementaires.',
    template: `Rédige les clauses particulières d'une convention de stage / PFMP pour un élève de [Classe_Eleve] accueilli dans une entreprise [Type_Entreprise].

Paramètres de la convention :
- Dates du stage : [Dates_Stage]
- Travaux interdits et dérogations machines dangereuses : [Derogations_Machines]
- Modalités de tutorat et de gratification : [Gratification]

La convention doit préciser :
1. Engagements légaux de l'entreprise d'accueil (EPI, encadrement par tuteur qualifié, déclaration de dérogation auprès de l'inspection du travail).
2. Missions pédagogiques autorisées confiées à l'apprenant.
3. Procédure immédiate en cas d'accident du travail ou de maladie.
4. Modalités de rupture anticipée en cas de manquement grave ou d'inadaptation.`,
    variables: [
      {
        key: 'Classe_Eleve',
        label: 'Classe de l’apprenant',
        defaultValue: 'Seconde GT (stage d’observation obligatoire de 2 semaines) ou 1ère Bac Pro',
        placeholder: 'ex: Seconde GT ou Terminale Bac Pro',
      },
      {
        key: 'Type_Entreprise',
        label: 'Secteur de l’entreprise d’accueil',
        defaultValue: 'Exploitation arboricole et maraîchère ou bureau d’études paysager',
        placeholder: 'ex: Entreprise du paysage',
      },
      {
        key: 'Dates_Stage',
        label: 'Période du stage',
        defaultValue: 'Du 16 au 27 juin (durée : 10 jours ouvrés)',
        placeholder: 'ex: 2 semaines en juin',
      },
      {
        key: 'Derogations_Machines',
        label: 'Travaux réglementés pour mineurs',
        defaultValue: 'Interdiction formelle d’utilisation de tronçonneuse et travail en hauteur sans harnais; dérogation pour conduite de tracteur de moins de 50 ch sous surveillance directe',
        placeholder: 'ex: Travaux en hauteur, machines tournantes',
      },
      {
        key: 'Gratification',
        label: 'Gratification',
        defaultValue: 'Stage de moins de 2 mois : non gratifié obligatoirement, prise en charge des repas de midi par l’entreprise',
        placeholder: 'ex: Non gratifié',
      },
    ],
  },

  {
    id: 'adm-note-conseil-administration',
    category: 'administration',
    targetProfiles: ['administration'],
    title: 'Note de cadrage budgétaire pour le Conseil d’Administration',
    tag: 'Administration · Gouvernance CA',
    description:
      'Rapport officiel présenté au Directeur d’EPLEFPA et au CA sur le bilan technico-économique de l’exploitation et les investissements à voter.',
    systemPrompt:
      'Tu es directeur d’exploitation agricole (DEA) rattaché à la direction générale de l’enseignement et de la recherche (DGER).',
    template: `Rédige la note d'orientation budgétaire et stratégique pour le prochain Conseil d'Administration de l'EPLEFPA Agrocampus concernant l'exploitation agricole.

Ordre du jour :
- Bilan de la campagne maraîchère et arboricole écoulée : [Bilan_Campagne]
- Projet d'investissement proposé : [Projet_Investissement]
- Montant estimé et plan de financement : [Montant_Financement]
- Rôle pédagogique : heures de formation délivrées sur l'exploitation au profit des apprenants

La note doit être formalisée selon les usages administratifs :
1. Synthèse exécutive pour les membres du CA (Région Île-de-France, représentants professionnels, syndicats agricoles, parents d'élèves).
2. Analyse technico-économique de l'atelier (chiffre d'affaires vente directe, charges opérationnelles).
3. Justification stratégique de l'investissement (transition écologique, diminution de la pénibilité pour les salariés et élèves).
4. Projet de délibération formelle à soumettre au vote du CA.`,
    variables: [
      {
        key: 'Bilan_Campagne',
        label: 'Résultat de la campagne précédente',
        defaultValue: 'Chiffre d’affaires boutique en hausse de 12%, récolte verger satisfaisante, charges énergie en hausse sous serres chauffées',
        placeholder: 'ex: CA en hausse, charges stables',
      },
      {
        key: 'Projet_Investissement',
        label: 'Investissement proposé',
        defaultValue: 'Acquisition d’une bineuse électrique maraîchère à guidage caméra et pose de filets anti-insectes climatiques',
        placeholder: 'ex: Bineuse électrique, serres bioclimatiques',
      },
      {
        key: 'Montant_Financement',
        label: 'Montant et subventions envisagées',
        defaultValue: '38 000 € HT (sollicitation aide PCAE Région Île-de-France à hauteur de 40%, autofinancement 60%)',
        placeholder: 'ex: 45 000 € HT',
      },
    ],
  },

  // =========================================================================
  // 6. VIE SCOLAIRE & INTERNAT
  // =========================================================================
  {
    id: 'vie-commission-educative',
    category: 'viescolaire',
    targetProfiles: ['viescolaire'],
    title: 'Fiche de commission éducative & contrat d’engagement élève',
    tag: 'Vie Scolaire · Climat Scolaire',
    description:
      'Préparation d’une commission éducative bienveillante et responsabilisante : faits reprochés, objectifs progressifs et contrat d’engagement signé avec la famille.',
    systemPrompt:
      'Tu es Conseiller Principal d’Éducation (CPE) en lycée agricole avec internat. Tu privilégies la remobilisation, la clarté du cadre et l’écoute bienveillante pour prévenir le décrochage scolaire.',
    template: `Rédige la trame d'une commission éducative et le contrat d'engagement comportemental pour un élève de [Classe_Eleve] scolarisé à l'Agrocampus.

Contexte de la convocation :
- Motifs de la commission : [Motifs_Convocation]
- Statut de l'élève : [Statut_Eleve]
- Participants réunis : Chef d'établissement ou adjoint, CPE, professeur principal, représentant des élèves, l'élève et ses responsables légaux.

Contenu attendu :
1. Rappel solennel mais éducatif des règles du vivre-ensemble et des faits constatés.
2. Temps d'expression guidé pour l'élève (prise de recul, explication de ses difficultés).
3. Contrat d'objectifs comportementaux et scolaires précis (3 engagements mesurables sous 4 semaines).
4. Modalités de tutorat par un membre de l'équipe éducative et calendrier du point d'étape.
5. Conséquences explicitées en cas de non-respect des engagements (conseil de discipline, exclusion temporaire de l'internat).`,
    variables: [
      {
        key: 'Classe_Eleve',
        label: 'Niveau et classe',
        defaultValue: 'Seconde GT ou 1ère Bac Pro',
        placeholder: 'ex: Seconde GT',
      },
      {
        key: 'Motifs_Convocation',
        label: 'Motifs constatés',
        defaultValue: 'Absences répétées le matin, retards à l’extinction des feux à l’internat et usage non autorisé du téléphone portable pendant les heures d’étude',
        placeholder: 'ex: Dégradations légères, retards réguliers',
      },
      {
        key: 'Statut_Eleve',
        label: 'Régime de scolarité',
        defaultValue: 'Interne (du lundi matin au vendredi soir)',
        placeholder: 'ex: Demi-pensionnaire ou interne',
      },
    ],
  },

  {
    id: 'vie-animation-periscolaire-internat',
    category: 'viescolaire',
    targetProfiles: ['viescolaire'],
    title: 'Projet d’animation citoyenne & biodiversité en soirée à l’internat',
    tag: 'Vie Scolaire · Animation Internat',
    description:
      'Fiche action d’animation socio-culturelle pour les élèves internes (ALEESA, MDL) : atelier éco-citoyen, jardin partagé nocturne ou ciné-débat agricole.',
    systemPrompt:
      'Tu es animateur socio-culturel et CPE en établissement public agricole. Tu animes la vie de l’internat pour en faire un lieu d’émancipation, de convivialité et d’apprentissage de la citoyenneté.',
    template: `Conçois une fiche projet d'animation en soirée à l'internat d'Agrocampus sur le thème : "[Theme_Animation]".

Paramètres de l'animation :
- Public cible : [Public_Internes] (élèves volontaires)
- Créneau horaire : [Creneau_Horaire]
- Lieux mobilisés : foyer des élèves, cuisine pédagogique ou espace extérieur sécurisé.

La fiche projet doit comporter :
1. Objectifs éducatifs et citoyens (renforcement de la cohésion, sensibilisation écologique, autonomie).
2. Déroulement chronologique de la soirée (accueil, activité participative, restitution festive).
3. Matériel nécessaire et budget estimatif pris en charge par l'association des élèves (ALEESA).
4. Règles de sécurité et consignes spécifiques pour le retour au calme avant le coucher.`,
    variables: [
      {
        key: 'Theme_Animation',
        label: 'Thème de la soirée',
        defaultValue: 'Ciné-débat et confection d’en-cas anti-gaspillage à partir des fruits déclassés de l’exploitation',
        placeholder: 'ex: Tournoi d’échecs et biodiversité nocturne',
      },
      {
        key: 'Public_Internes',
        label: 'Public cible',
        defaultValue: '30 à 45 élèves internes de la Seconde aux BTSA',
        placeholder: 'ex: Élèves internes de Seconde et Première',
      },
      {
        key: 'Creneau_Horaire',
        label: 'Créneau horaire',
        defaultValue: 'Mardi soir de 20h00 à 21h45',
        placeholder: 'ex: Jeudi de 19h30 à 21h30',
      },
    ],
  },

  // =========================================================================
  // 7. PERSONNEL RÉGION IDF & SERVICES TECHNIQUES
  // =========================================================================
  {
    id: 'tech-maintenance-parc-machines',
    category: 'technique',
    targetProfiles: ['technique_idf', 'exploitation'],
    title: 'Fiche de contrôle préventif & sécurité du parc machines (Atelier Paysage)',
    tag: 'Services Techniques · Parc Machines',
    description:
      'Protocole d’entretien hebdomadaire et registre de sécurité pour les tondeuses autoportées, débroussailleuses et motoculteurs de l’atelier paysager.',
    systemPrompt:
      'Tu es responsable d’atelier de machinisme et agent de maintenance des lycées de la Région Île-de-France. Tu veilles au respect strict des normes de sécurité au travail et au maintien opérationnel des engins.',
    template: `Rédige la fiche de contrôle périodique et le protocole d'hivernage/remise en service pour les matériels motorisés de l'atelier paysager d'Agrocampus.

Matériels concernés :
- Parc machines : [Parc_Materiel]
- Utilisateurs réguliers : [Utilisateurs]
- Fréquence des contrôles : [Frequence_Controle]

Le document doit inclure :
1. Check-list visuelle et mécanique obligatoire avant chaque utilisation (niveaux d'huile, carters de protection, coupe-circuit, état des lames).
2. Procédure de consigne et d'isolement en cas de défaillance mécanique constatée.
3. Tableau de traçabilité des entretiens (vidange, affûtage, filtres à air, bougies) à afficher à l'atelier.
4. Rappel réglementaire des EPI obligatoires selon chaque type de matériel (visière grillagée, casque antibruit, gants anti-coupure, chaussures de sécurité).`,
    variables: [
      {
        key: 'Parc_Materiel',
        label: 'Matériels du parc',
        defaultValue: '4 tondeuses autoportées, 8 débroussailleuses thermiques et à batterie, 3 motoculteurs et 2 broyeurs de branches',
        placeholder: 'ex: Tondeuses, tronçonneuses, tracteurs',
      },
      {
        key: 'Utilisateurs',
        label: 'Profil des utilisateurs',
        defaultValue: 'Élèves de Bac Pro et apprentis sous supervision des professeurs et agents régionaux de l’atelier',
        placeholder: 'ex: Élèves et agents techniques',
      },
      {
        key: 'Frequence_Controle',
        label: 'Fréquence',
        defaultValue: 'Contrôle visuel hebdomadaire + révision complète toutes les 50 heures d’utilisation',
        placeholder: 'ex: Hebdomadaire',
      },
    ],
  },

  {
    id: 'tech-protocole-hygiene-egalim',
    category: 'technique',
    targetProfiles: ['technique_idf'],
    title: 'Plan de Maîtrise Sanitaire (HACCP) & valorisation locale EGalim',
    tag: 'Région IdF · Restauration & Hygiène',
    description:
      'Procédure de contrôle sanitaire en cuisine de collectivité avec traçabilité des denrées bio issues de la ferme pédagogique de l’Agrocampus.',
    systemPrompt:
      'Tu es responsable de la restauration collective en lycée régional d’Île-de-France et formateur en sécurité sanitaire des aliments (méthode HACCP).',
    template: `Rédige une procédure opérationnelle standard pour l'équipe de restauration scolaire de l'Agrocampus concernant l'intégration et la traçabilité des légumes bio de la ferme de l'établissement.

Paramètres de la restauration :
- Nombre de repas servis par jour : [Nombre_Couverts]
- Produits approvisionnés depuis l'exploitation : [Produits_Ferme]
- Exigences cibles : conformité Loi EGalim (50% de produits durables dont 20% bio) et respect du PMS (Plan de Maîtrise Sanitaire).

Structure de la procédure :
1. Protocole de réception des légumes bruts de la ferme (contrôle visuel, température, bon de livraison interne).
2. Procédure d'épluchage, de décontamination et de désinfection en zone légumes sans risque de contamination croisée.
3. Fiche d'enregistrement de traçabilité pour les inspecteurs de la DDPP.
4. Fiche d'information à destination des convives (élèves et personnels) valorisant l'origine locale "0 km" des produits de l'Agrocampus.`,
    variables: [
      {
        key: 'Nombre_Couverts',
        label: 'Couverts par jour',
        defaultValue: '450 déjeuners + 180 dîners pour les internes',
        placeholder: 'ex: 500 repas par jour',
      },
      {
        key: 'Produits_Ferme',
        label: 'Légumes livrés par la ferme',
        defaultValue: 'Pommes de terre, carottes, poireaux, salades et courges bio de saison',
        placeholder: 'ex: Légumes de saison',
      },
    ],
  },

  {
    id: 'tech-bon-intervention-securite',
    category: 'technique',
    targetProfiles: ['technique_idf'],
    title: 'Bon d’intervention technique, consignation et sécurité ERP',
    tag: 'Région IdF · Bâtiment & Sécurité',
    description:
      'Modèle officiel de bon de travail et de consignation pour les interventions des agents régionaux sur les serres, chaufferies et locaux pédagogiques.',
    systemPrompt:
      'Tu es agent technique en chef de la Région Île-de-France et responsable sécurité d’un Établissement Recevant du Public (ERP).',
    template: `Établis le modèle standardisé de Bon d'Intervention Technique et de Consignation Sécurité pour les travaux de maintenance sur le site de l'Agrocampus.

Contexte d'intervention :
- Nature du travail : [Nature_Intervention]
- Zone d'intervention : [Localisation]
- Risques identifiés : [Risques_Specifiques]

Le document doit formaliser :
1. Volet administratif (Demandeur, agent intervenant, date et créneau d'intervention, validation préalable de la direction).
2. Analyse préalable des risques et mesures de balisage pour protéger les élèves circulant sur le campus.
3. Procédure de consignation des fluides ou énergies (électricité, gaz, eau sous pression).
4. Procès-verbal de fin d'intervention et attestation de remise en service sécurisée.`,
    variables: [
      {
        key: 'Nature_Intervention',
        label: 'Nature de l’intervention',
        defaultValue: 'Réparation d’un moteur de ventilation ouvrants zénithaux sur serre pédagogique en hauteur',
        placeholder: 'ex: Dépannage électrique ou plomberie',
      },
      {
        key: 'Localisation',
        label: 'Bâtiment ou installation',
        defaultValue: 'Serre pédagogique n°2 et local technique irrigation',
        placeholder: 'ex: Internat bâtiment B',
      },
      {
        key: 'Risques_Specifiques',
        label: 'Risques particuliers',
        defaultValue: 'Travail en hauteur (> 3 mètres), présence d’humidité et circuit électrique 230/400V',
        placeholder: 'ex: Électrique, hauteur',
      },
    ],
  },
];
