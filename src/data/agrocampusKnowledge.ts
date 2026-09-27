import { RagDocument } from '../types';

export const AGROCAMPUS_KNOWLEDGE_DOCS: RagDocument[] = [
  {
    id: 'doc-dger-eplefpa',
    title: 'Statut et missions des exploitations agricoles annexées aux EPLEFPA',
    source: 'Code rural et de la pêche maritime · Art. R811-37 à R811-45',
    date: 'Mis à jour 2025/2026',
    score: 0.96,
    tags: ['Législation', 'Enseignement agricole', 'Exploitation'],
    text: `Les exploitations agricoles et ateliers technologiques constituent des composantes pédagogiques et économiques indissociables des établissements publics locaux d'enseignement et de formation professionnelle agricole (EPLEFPA).
Leur triple vocation comprend :
1. La mise en œuvre des formations pratiques des élèves, étudiants, apprentis et stagiaires sous la responsabilité des équipes pédagogiques.
2. La démonstration et l'expérimentation de pratiques innovantes et agroécologiques adaptées à leur territoire d'implantation.
3. La participation au développement agricole local, à l'animation des territoires ruraux et péri-urbains, et à l'approvisionnement des filières de proximité.
La direction de l'exploitation est confiée à un directeur d'exploitation agricole (DEA) dont le budget annexe est soumis à l'approbation du Conseil d'Administration.`,
    url: 'https://www.legifrance.gouv.fr/codes/id/LEGISCTA000006180373/',
  },

  {
    id: 'doc-periurbain-idf-sdrif',
    title: 'Préservation des terres agricoles et cohabitation péri-urbaine en Île-de-France',
    source: 'Région Île-de-France · SDRIF-Environnemental & Pacte Agricole',
    date: '2025/2026',
    score: 0.93,
    tags: ['Péri-urbain', 'Urbanisme', 'Foncier'],
    text: `L'agriculture péri-urbaine francilienne, notamment dans la Boucle de la Seine et la plaine de Versailles (Yvelines), remplit un rôle écologique, paysager et nourricier majeur.
Le SDRIF-E sanctuarise le zéro artificialisation nette (ZAN) des terres cultivées et encourage :
- Les ceintures maraîchères de proximité et les plateformes logistiques alimentaires décarbonées.
- La mise en place de zones tampons paysagères (haies champêtres, bandes enherbées arborées) entre les lotissements pavillonnaires et les parcelles cultivées pour prévenir les conflits d'usage (poussière, odeurs, bruit).
- La contractualisation avec les collectivités territoriales pour la fourniture des cantines scolaires en produits locaux bio.
- L'aménagement de cheminements doux piétons et cyclables sécurisés évitant le piétinement des cultures par les promeneurs.`,
    url: 'https://www.iledefrance.fr/agriculture-alimentation',
  },

  {
    id: 'doc-bio-fertilisation-itab',
    title: 'Guide technique de la fertilisation organique en maraîchage biologique',
    source: 'ITAB (Institut Technique de l’Agriculture Biologique) & DRAAF IDF',
    date: '2024/2025',
    score: 0.89,
    tags: ['Maraîchage', 'Bio', 'Agronomie'],
    text: `En agriculture biologique (Règlement UE 2018/848), la fertilité et l'activité biologique du sol doivent être maintenues ou augmentées par :
1. La culture de légumineuses, d'engrais verts (phacélie, vesce, seigle, trèfle incarnat) et de plantes à enracinement profond dans le cadre d'un programme de rotation pluriannuel adapté.
2. L'incorporation au sol de matières organiques de ferme compostées (fumier équin, bovin, fientes conformes, composts de déchets verts certifiés).
3. L'interdiction absolue de tout engrais azoté minéral de synthèse. Les engrais de complément autorisés (farine de plumes, patenkali, patentkali naturel, phosphates naturels tendres) ne doivent intervenir qu'en cas de carence avérée prouvée par analyse de sol.
En zone vulnérable Directive Nitrates (toute l'Île-de-France), le plafond d'apport en azote organique est strictement limité à 170 kg N/ha/an sur la surface agricole utile.`,
    url: 'https://itab.asso.fr/publications/maraichage-bio',
  },

  {
    id: 'doc-referentiel-cgea-btsa',
    title: 'Référentiels de compétences DGER : BTSA Métiers du végétal et Bac Pro CGEA',
    source: 'Ministère de l’Agriculture et de la Souveraineté Alimentaire · DGER',
    date: 'Édition consolidée 2026',
    score: 0.91,
    tags: ['Pédagogie', 'Diplômes', 'DGER'],
    text: `Les cursus de formation initiale et par apprentissage de l'enseignement agricole public intègrent le plan ministériel "Enseigner à produire autrement" (EPA 2) :
- Capacité C1 : Conduire un diagnostic agroécologique et territorial d'une exploitation agricole ou d'une entreprise du paysage.
- Capacité C2 : Piloter un système de culture respectueux de la biodiversité, réduisant les intrants de synthèse (démarche IFT zéro en bio) et adaptatif aux aléas climatiques (stress hydrique, gelées tardives).
- Capacité C3 : Maîtriser les matériels, agroéquipements et outils d'agriculture de précision (guidage GPS, binage mécanique, télédétection).
- Modalités d'évaluation certificative : Épreuves terminales et Contrôle en Cours de Formation (CCF) basées sur des situations professionnelles vécues sur l'exploitation pédagogique de l'établissement.`,
    url: 'https://chlorofil.fr/diplomes',
  },

  {
    id: 'doc-egalim-circuits-courts',
    title: 'Dispositif Loi EGalim 3 et commande publique pour les fermes de lycée',
    source: 'Direction Générale de l’Alimentation (DGAL) · Circulaire Restauration',
    date: '2025',
    score: 0.88,
    tags: ['EGalim', 'Restauration collective', 'Circuits courts'],
    text: `Depuis la consolidation des lois EGalim et Climat & Résilience :
- Les restaurants collectifs publics (cantines scolaires de lycées, collèges, écoles primaires, hôpitaux) ont l'obligation de servir au moins 50% de produits durables et de qualité, dont un minimum de 20% issus de l'Agriculture Biologique.
- Les exploitations agricoles pédagogiques des EPLEFPA disposent d'un statut privilégié de fournisseur public de proximité :
  1. Achats de gré à gré sous le seuil réglementaire de passation des marchés publics (100 000 € HT pour les denrées alimentaires).
  2. Allotissement géographique et critères environnementaux (bilan carbone, fraîcheur, saisonnalité) favorisant l'ancrage local.
  3. Traçabilité complète du champ à l'assiette et sensibilisation des convives aux métiers du vivant.`,
    url: 'https://agriculture.gouv.fr/egalim-restauration-collective',
  },

  {
    id: 'doc-secheresse-yvelines',
    title: 'Arrêté préfectoral cadre sur la gestion de crise sécheresse dans les Yvelines',
    source: 'Préfecture des Yvelines · Direction Départementale des Territoires (DDT 78)',
    date: 'Réglementation estivale',
    score: 0.87,
    tags: ['Sécheresse', 'Arrêtés', 'Yvelines'],
    text: `Le département des Yvelines est soumis à une gestion concertée de la ressource en eau souterraine (nappe de la Craie, nappe des calcaires de Champigny et nappe de l'Albien) :
- Stade Vigilance : Sensibilisation et suivi quotidien des compteurs d'irrigation.
- Stade Alerte : Interdiction d'arrosage des espaces verts et des pelouses entre 11h et 18h. Réduction de 20% des volumes d'irrigation agricole autorisés.
- Stade Alerte Renforcée : Interdiction de l'irrigation agricole entre 9h et 20h, avec dérogations spécifiques pour le maraîchage sous abris équipés de goutte-à-goutte économe.
- Stade Crise : Suspension totale des prélèvements non prioritaires. Seuls l'abreuvement des animaux et le sauvetage sous réserve de notification à la DDT des cultures horticoles et maraîchères sous serre restent tolérés selon des plages horaires strictes (20h à 8h du matin).`,
    url: 'https://www.yvelines.gouv.fr/Actions-de-l-Etat/Environnement/Gestion-de-l-eau/Secheresse',
  },
];
