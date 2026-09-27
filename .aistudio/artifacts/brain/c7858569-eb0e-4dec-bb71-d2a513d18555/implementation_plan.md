# Réorganisation Multi-Métiers de la Plateforme Agrocampus & Albert DINUM

Structure unifiée et personnalisée permettant à chaque agent (enseignants, formateurs, exploitation agricole, administration, vie scolaire, personnel technique Région IdF et atelier paysager) d'accéder instantanément à un environnement de travail adapté à son métier, avec des gabarits de prompts ciblés, des consignes système spécialisées pour Albert et des corpus documentaires RAG contextualisés.

---

### Examen utilisateur & Décisions confirmées

> [!IMPORTANT]
> Les choix d'organisation confirmés lors de la phase de cadrage sont intégrés :
>
> - **Emplacement du sélecteur métier** : **Sélecteur de profil persistant dans le bandeau supérieur (Confirmé)**. Toujours visible et accessible dans l'en-tête de la plateforme, avec bascule immédiate en un clic et mémorisation locale du profil actif.
> - **Segmentation retenue** : **6 profils dédiés pour l'Agrocampus (Confirmé)** :
>   1. `enseignants` : **Enseignement / Lycée agricole** (Bac Pro, BTSA, CCF, progressions, fiches pédagogiques).
>   2. `formateurs` : **Formateurs / CFA - CFPPA** (Alternance, livrets d'apprentissage, blocs de compétences RNCP, formation continue).
>   3. `exploitation` : **Exploitation agricole & maraîchage** (Rotation, assolements bio, phytosanitaire, registre parcellaire, météo/sécheresse, circuits courts).
>   4. `administration` : **Administration / Direction & Intendance** (Marchés publics, arrêtés préfectoraux, courriers officiels, RH, gestion financière).
>   5. `vie_scolaire` : **Vie scolaire / CPE & Surveillants** (Gestion des absences, internat, commissions éducatives, protocole d'urgence, règlement intérieur).
>   6. `technique_idf` : **Technique, Région IdF & Paysage** (Agents régionaux IdF, maintenance bâtiment, atelier paysager, serres horticoles, sécurité matérielle).
> - **Portée de l'adaptation (Confirmée)** :
>   - **Gabarits de prompts** : Filtrage et mise en avant automatique des gabarits du profil choisi, avec possibilité d'accéder aux gabarits des autres pôles si besoin.
>   - **Consignes système Albert** : Injection d'un prompt système de rôle expert par défaut lors de la création d'un échange chat dans le profil actif.
>   - **Corpus RAG & recherche sémantique** : Suggestion prioritaire des collections documentaires pertinentes pour chaque métier (ex: réglementation éducation agricole pour enseignants, guide Ecophyto/arrêtés pour exploitation, code de la commande publique pour administration).
>   - **Tableau de bord AgrocampusHub** : Mise en valeur d'un encart d'accueil « Mon Espace Métier » synthétisant les missions clés, raccourcis et gabarits prioritaires du profil.

---

### 1. Vue d'ensemble & Concept métier

- **Problématique** : L'Agrocampus de Saint-Germain-en-Laye rassemble des équipes aux missions très hétérogènes (pédagogie lycée, apprentissage CFA/CFPPA, ouvriers et techniciens d'exploitation, agents de la Région Île-de-France, vie scolaire, secrétariat et gestion). Auparavant, tous les prompts et outils étaient mélangés sans distinction claire des priorités quotidiennes.
- **Solution apportée** : Un sélecteur de rôle interactif et élégant dans le header, qui agit comme un filtre transversal sur toute la plateforme :
  - Dans le **Studio Chat**, Albert adopte automatiquement la posture et le lexique adaptés au profil de l'agent.
  - Dans la **Bibliothèque de gabarits**, les prompts prioritaires correspondent exactement aux tâches de l'agent.
  - Dans l'**Explorateur RAG**, les collections documentaires suggérées ciblent les textes officiels du métier.
  - Dans l'**Espace Exploitation & Lycée (Hub)**, une vue contextualisée met en avant les raccourcis et documents utiles.
- **Liberté d'usage** : Aucun silo hermétique ; chaque agent peut à tout moment changer de profil ou afficher l'ensemble des ressources de l'Agrocampus.

---

### 2. Expérience Utilisateur & Design d'Interface

#### Parcours & Composants Visuels

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [AL] Albert DINUM · Agrocampus   [ Profil : Enseignants ▼ ]   [Chat] [Exploitation] [Gabarits] [RAG] [Audio] [⚙]│
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                                                  ▼
                        ┌──────────────────────────────────────────────────┐
                        │ 🏫 Enseignement · Lycée agricole                 │
                        │ 🎓 Formateurs · CFA & CFPPA                      │
                        │ 🌾 Exploitation agricole & Maraîchage            │
                        │ 🏛️ Administration · Direction & Intendance      │
                        │ 👥 Vie scolaire · CPE & Internat                 │
                        │ 🛠️ Technique · Région IdF & Paysage             │
                        └──────────────────────────────────────────────────┘
```

1. **Sélecteur persistant dans l'en-tête (`Header.tsx`)** :
   - Affichage du profil actif avec icône métier sobre et nom clair.
   - Menu déroulant accessible en un clic avec résumé de chaque pôle (sous-titre explicatif).
   - Indicateur visuel discret et mémorisation dans `localStorage`.

2. **Panneau d'accueil personnalisé (« Mon Espace Métier » dans `AgrocampusHub.tsx`)** :
   - Bannière haute présentant l'espace du profil actif, ses missions prioritaires et ses raccourcis vers Albert.
   - Boutons d'action rapide vers les prompts les plus utilisés du métier.
   - Sélecteur de filtre de rôle rapide pour basculer en un clic.

3. **Bibliothèque de gabarits structurée (`PromptsLibrary.tsx`)** :
   - Onglets de filtrage par profil métier : `Tous`, `Enseignants`, `Formateurs`, `Exploitation`, `Administration`, `Vie scolaire`, `Technique IdF & Paysage`.
   - Les gabarits sont pré-filtrés sur le profil actif par défaut pour éviter tout encombrement cognitif.
   - Ajout d'une collection complète de nouveaux gabarits métier authentiques (fiches CCF, conventions de stage/apprentissage, registre d'incident vie scolaire, protocole d'arrosage serres, commandes publiques, plans de formation continue).

4. **Studio Chat adapté (`ChatStudio.tsx`)** :
   - Lors de la création d'un nouvel échange, le `systemPrompt` intègre le contexte métier spécifique du profil actif (ex : expert en pédagogie agricole pour les enseignants, gestionnaire territorial pour le personnel régional, agronome pour l'exploitation).
   - Les suggestions d'accueil (quick prompts) s'ajustent pour refléter les cas d'usage du profil actif.

---

### 3. Architecture Technique & Modèle de Données

#### Nouveau Type `UserProfileRole`

```typescript
export type UserProfileRole =
  | 'tous'
  | 'enseignants'
  | 'formateurs'
  | 'exploitation'
  | 'administration'
  | 'vie_scolaire'
  | 'technique_idf';

export interface ProfileMetadata {
  id: UserProfileRole;
  label: string;
  shortLabel: string;
  description: string;
  badge: string;
  iconName: string;
  defaultSystemPrompt: string;
  recommendedCollections: string[];
  samplePrompts: string[];
}
```

#### Diagramme de Flux et Distribution du Rôle

```
                ┌──────────────────────────────────┐
                │          App.tsx                 │
                │  - activeRole: UserProfileRole   │
                │  - onSelectRole(role)            │
                └────────────────┬─────────────────┘
                                 │
     ┌───────────────────────────┼───────────────────────────┐
     │                           │                           │
┌────▼──────────────┐   ┌────────▼──────────────┐   ┌────────▼──────────────┐
│    Header.tsx     │   │   PromptsLibrary.tsx  │   │    ChatStudio.tsx     │
│ Sélecteur déroulant│   │ Filtre & badges par   │   │ SystemPrompt adapté   │
│ profil persistant │   │ profil métier         │   │ Suggestions métier    │
└───────────────────┘   └───────────────────────┘   └───────────────────────┘
                                 │
                        ┌────────▼──────────────┐
                        │   AgrocampusHub.tsx   │
                        │ Espace dédié au rôle  │
                        │ Outils & raccourcis   │
                        └───────────────────────┘
```

#### Nouveaux Gabarits de Prompts Métier Intégrés :

1. **Enseignants** :
   - Grille d'évaluation sommative et CCF pour Bac Pro / BTSA.
   - Fiche de préparation de séquence pédagogique et interdisciplinarité.
   - Sujet d'épreuve orale et barème critérié.
2. **Formateurs CFA / CFPPA** :
   - Suivi d'alternance et livret d'apprentissage en entreprise.
   - Scénarisation de module RNCP pour stagiaires adultes.
   - Plan individuel de formation et remédiation pédagogique.
3. **Exploitation agricole** :
   - Plan de fertilisation et registre phytosanitaire biologique.
   - Calendrier de semis, repiquage et rotation sous tunnels.
   - Synthèse arrêté sécheresse et gestion de l'irrigation.
4. **Administration & Intendance** :
   - Cahier des charges pour consultation marché public (ex. outillage, matériel).
   - Courrier officiel préfectoral / DRAAF / Rectorat.
   - Demande de subvention et bilan financier d'opération.
5. **Vie scolaire & Internat** :
   - Rapport d'incident et compte-rendu de commission éducative.
   - Fiche de protocole internat et gestion des arrivées/départs.
   - Communication aux familles pour suivi de l'assiduité.
6. **Technique, Région IdF & Paysage** :
   - Fiche de maintenance préventive bâtiment et réseaux du campus.
   - Plan de gestion différenciée des espaces verts et taille des végétaux.
   - Protocole de sécurité pour l'atelier mécanique et stockage produits.

---

### 4. Plan de Vérification & Tests

1. **Navigation et réactivité du sélecteur** :
   - Vérifier le basculement fluide entre les 6 profils depuis le bandeau supérieur.
   - Vérifier la persistance dans `localStorage` après rafraîchissement de la page.
2. **Filtrage des gabarits** :
   - S'assurer que chaque profil affiche en priorité ses propres gabarits tout en conservant l'option « Tous les gabarits ».
3. **Consignes système du Chat Studio** :
   - Tester la création d'une nouvelle session sous différents profils pour confirmer que la consigne système s'adapte automatiquement.
4. **Compilation et non-régression** :
   - Exécution de `lint_applet` (`tsc --noEmit`) et `compile_applet`.
   - Vérification de l'intégrité des fonctionnalités existantes (RAG, transcription Whisper, import de documents texte).
