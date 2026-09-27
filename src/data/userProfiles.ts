import { UserProfileConfig, UserProfileId } from '../types';

export const USER_PROFILES: Record<UserProfileId, UserProfileConfig> = {
  enseignant: {
    id: 'enseignant',
    label: 'Enseignants (Lycée Agricole & Général)',
    shortLabel: 'Enseignants',
    roleTitle: 'Professeurs tronc commun, spécialités & filières pro',
    description:
      'Seconde GT, 1ère/Terminale Générale (Maths, Physique, SVT Biologie-Écologie), Bac Pro & BTSA, CCF, progressions pédagogiques.',
    badge: 'Pédagogie & Lycée',
    iconName: 'GraduationCap',
    colorScheme: {
      bgLight: 'bg-blue-50',
      textDark: 'text-blue-900',
      border: 'border-blue-200',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-800',
      accent: 'blue',
    },
    defaultSystemPrompt:
      "Tu es l'assistant pédagogique Albert pour les enseignants de l'Agrocampus (Lycée d'Enseignement Général, Technologique et Professionnel Agricole). Tu assistes les professeurs du tronc commun et des spécialités (Mathématiques, Physique-Chimie, SVT / Biologie-Écologie en Seconde GT, Première Générale et Terminale Générale), ainsi que les filières technologiques et professionnelles (Bac Pro CGEA, Aménagements Paysagers, BTSA). Tu structures des cours rigoureux, des devoirs, des grilles d'évaluation critériées et des situations d'apprentissage conformes aux référentiels de l'Éducation Nationale et du Ministère de l'Agriculture.",
    quickPrompts: [
      "Conçois une séance de SVT / Biologie-Écologie de 1ère Générale sur le cycle de l'azote et les écosystèmes agricoles franciliens.",
      "Rédige une évaluation formative de Physique-Chimie (Terminale Générale) sur la spectrophotométrie et la cinétique chimique appliquée à l'agronomie.",
      "Prépare un devoir surveillé de Mathématiques en Seconde GT avec énoncé contextualisé (statistiques et fonctions) et barème détaillé.",
      "Rédige une fiche d'évaluation CCF pour élèves de Bac Pro Aménagements Paysagers ou CGEA avec critères observables.",
    ],
    suggestedRagTags: ['pedagogie', 'lycee_general', 'ccf', 'reglementation', 'referentiels'],
    promptCategories: ['pedagogie', 'general_lycee', 'reglementation'],
  },

  formateur: {
    id: 'formateur',
    label: 'Formateurs (CFA & CFPPA)',
    shortLabel: 'Formateurs CFA/CFPPA',
    roleTitle: 'Apprentissage, alternance & formation continue d’adultes',
    description:
      'Apprentissage, alternance, blocs de compétences, livrets de suivi, formations adultes & BPA/BP, lien tuteurs entreprises.',
    badge: 'Apprentissage & CFA',
    iconName: 'Briefcase',
    colorScheme: {
      bgLight: 'bg-indigo-50',
      textDark: 'text-indigo-900',
      border: 'border-indigo-200',
      badgeBg: 'bg-indigo-100',
      badgeText: 'text-indigo-800',
      accent: 'indigo',
    },
    defaultSystemPrompt:
      "Tu es l'assistant Albert pour les formateurs du CFA et du CFPPA de l'Agrocampus. Tu accompagnes la formation par apprentissage et la formation professionnelle continue d'adultes (BPA, BP, CS, BTSA en apprentissage). Tu aides à la modularisation par blocs de compétences, la conception de livrets d'apprentissage, le lien entreprise-centre, l'ingénierie pédagogique et les évaluations certificatives professionnelles.",
    quickPrompts: [
      "Construis une grille d'évaluation en situation de travail pour un apprenti en BPA Travaux des Aménagements Paysagers.",
      "Rédige un livret de liaison tuteur-formateur pour le suivi semestriel en entreprise d'un apprenti BTSA.",
      "Conçois un scénario pédagogique pour adultes en reconversion professionnelle sur la taille raisonnée des arbres fruitiers.",
      "Rédige une attestation de compétences professionnelles pour un module de formation continue en maraîchage biologique.",
    ],
    suggestedRagTags: ['apprentissage', 'cfa_cfppa', 'pedagogie', 'competences'],
    promptCategories: ['pedagogie', 'reglementation'],
  },

  exploitation: {
    id: 'exploitation',
    label: 'Personnel de l’Exploitation Agricole',
    shortLabel: 'Exploitation agricole',
    roleTitle: 'Ferme pédagogique, maraîchage bio & ateliers techniques',
    description:
      'Ferme pédagogique, parcelles maraîchères bio, rotation des cultures, cahier d’épandage, HVE & Bio, santé végétale et animale.',
    badge: 'Ferme & Agronomie',
    iconName: 'Sprout',
    colorScheme: {
      bgLight: 'bg-emerald-50',
      textDark: 'text-emerald-900',
      border: 'border-emerald-200',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-800',
      accent: 'emerald',
    },
    defaultSystemPrompt:
      "Tu es l'assistant agronomique et technique Albert pour les agents et responsables de l'exploitation agricole de l'Agrocampus (ferme pédagogique, parcelles maraîchères bio, verger, ateliers animaux). Tu maîtrises l'agronomie francilienne, les cahiers de fertilisation, la réglementation phytosanitaire et bio, le bien-être animal, les arrêtés préfectoraux sécheresse, le plan de désherbage mécanique et la valorisation en circuits courts.",
    quickPrompts: [
      "Conçois un plan de fertilisation bio pour carottes et poireaux en sol limono-argileux francilien.",
      "Rédige la trame d'un cahier d'épandage et de rotation culturale conforme au cahier des charges Agriculture Biologique.",
      "Quelles sont les restrictions d'arrosage pour le maraîchage lors d'un arrêté préfectoral Crise sécheresse dans les Yvelines ?",
      "Prépare le protocole sanitaire et les mesures de biosécurité pour l'atelier avicole de l'Agrocampus.",
    ],
    suggestedRagTags: ['exploitation', 'maraichage', 'reglementation', 'secheresse', 'bio'],
    promptCategories: ['exploitation', 'circuits_courts', 'reglementation'],
  },

  administration: {
    id: 'administration',
    label: 'Administration & Direction',
    shortLabel: 'Administration & RH',
    roleTitle: 'Direction, secrétariat, intendance, gestion & marchés',
    description:
      'Notes de service, conventions de stage, délibérations CA, marchés publics, budget, relations régionales et rectorat.',
    badge: 'Direction & Gestion',
    iconName: 'Building2',
    colorScheme: {
      bgLight: 'bg-amber-50',
      textDark: 'text-amber-900',
      border: 'border-amber-200',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800',
      accent: 'amber',
    },
    defaultSystemPrompt:
      "Tu es l'assistant administratif et managérial Albert pour la direction, le secrétariat général et l'intendance de l'Agrocampus. Tu rédiges avec une rigueur protocolaire exemplaire des notes de service, des projets de délibération du conseil d'administration, des cahiers des charges de marchés publics, des conventions de stage et des réponses institutionnelles pour le Ministère de l'Agriculture et la Région Île-de-France.",
    quickPrompts: [
      "Rédige une note de service pour le personnel concernant la sécurité sur l'exploitation et le port des EPI obligatoires.",
      "Prépare un modèle de convention tripartite de stage d'observation en milieu professionnel pour élèves de Seconde GT.",
      "Rédige le projet de délibération du Conseil d'Administration pour l'approbation du compte financier de l'exploitation.",
      "Formule un courrier officiel de demande de subvention régionale pour la modernisation énergétique des serres pédagogiques.",
    ],
    suggestedRagTags: ['administration', 'juridique', 'marches_publics', 'reglementation'],
    promptCategories: ['administration', 'reglementation'],
  },

  viescolaire: {
    id: 'viescolaire',
    label: 'Vie Scolaire & Éducative',
    shortLabel: 'Vie scolaire & Internat',
    roleTitle: 'CPE, assistants d’éducation, internat & climat scolaire',
    description:
      'Internat, gestion des absences, médiation, commissions éducatives, charte du vivre-ensemble, projets périscolaires et citoyenneté.',
    badge: 'Internat & Éducation',
    iconName: 'Users',
    colorScheme: {
      bgLight: 'bg-purple-50',
      textDark: 'text-purple-900',
      border: 'border-purple-200',
      badgeBg: 'bg-purple-100',
      badgeText: 'text-purple-800',
      accent: 'purple',
    },
    defaultSystemPrompt:
      "Tu es l'assistant éducatif Albert pour l'équipe de vie scolaire de l'Agrocampus (Conseillers Principaux d'Éducation - CPE, Assistants d'Éducation - AED, maîtres d'internat). Tu aides à la gestion quotidienne de l'internat, le climat scolaire, les fiches de suivi éducatif, les commissions éducatives, les courriers aux familles, le règlement intérieur et les animations socio-culturelles et citoyennes (ALEESA, MDL).",
    quickPrompts: [
      "Rédige un courrier bienveillant mais ferme aux responsables légaux concernant des retards répétés en internat.",
      "Prépare la trame d'une commission éducative pour un élève en rupture de scolarité avec contrat d'objectifs.",
      "Conçois un protocole d'accueil et d'intégration des nouveaux internes de Seconde GT et 1ère année Bac Pro.",
      "Rédige un projet d'animation périscolaire en soirée à l'internat autour de la biodiversité et de l'alimentation durable.",
    ],
    suggestedRagTags: ['vie_scolaire', 'internat', 'reglementation', 'climat_scolaire'],
    promptCategories: ['viescolaire', 'reglementation'],
  },

  technique_idf: {
    id: 'technique_idf',
    label: 'Personnel Région IdF & Services Techniques',
    shortLabel: 'Technique & Région IdF',
    roleTitle: 'Agents régionaux, atelier paysager, maintenance & restauration',
    description:
      'Maintenance bâtiment, atelier machines, hygiène, restauration collective EGalim, parc paysager, sécurité ERP.',
    badge: 'Région IdF & Maintenance',
    iconName: 'Wrench',
    colorScheme: {
      bgLight: 'bg-rose-50',
      textDark: 'text-rose-900',
      border: 'border-rose-200',
      badgeBg: 'bg-rose-100',
      badgeText: 'text-rose-800',
      accent: 'rose',
    },
    defaultSystemPrompt:
      "Tu es l'assistant technique Albert pour les agents régionaux d'Île-de-France et les personnels des services techniques de l'Agrocampus (maintenance générale, atelier paysager et matériel, hygiène et entretien, restauration collective). Tu rédiges des fiches de maintenance préventive du parc machines, des protocoles HACCP / EGalim pour la cantine, des plans d'intervention technique et des fiches de sécurité pour les produits et matériels motorisés.",
    quickPrompts: [
      "Établis une fiche de contrôle préventif et d'entretien pour le parc de tondeuses autoportées et débroussailleuses de l'atelier.",
      "Rédige un protocole de nettoyage et désinfection conforme au Plan de Maîtrise Sanitaire (PMS/HACCP) en cuisine collective.",
      "Prépare une procédure de consignation et de sécurité pour une intervention électrique ou sur chaudière sur le site.",
      "Rédige un compte-rendu d'intervention technique suite à une avarie sur le réseau d'arrosage automatique des serres.",
    ],
    suggestedRagTags: ['technique', 'idf', 'securite', 'egalim', 'maintenance'],
    promptCategories: ['technique', 'reglementation'],
  },
};

export const DEFAULT_USER_PROFILE_ID: UserProfileId = 'enseignant';

export const USER_PROFILES_LIST: UserProfileConfig[] = Object.values(USER_PROFILES);
