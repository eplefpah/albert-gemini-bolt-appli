import React, { useState } from 'react';
import {
  FileText,
  Compass,
  Mail,
  Copy,
  Check,
  Printer,
  Sparkles,
  ShieldCheck,
  Clock,
  GraduationCap,
  Sprout,
  Briefcase,
  Building2,
  Users,
  Wrench,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Download,
  Share2,
  Lock,
  Cpu,
  Layers,
  Search,
  Mic,
  MessageSquare,
  BookOpen,
} from 'lucide-react';
import { UserProfileConfig, UserProfileId } from '../types';

interface AgentGuideStudioProps {
  onExecutePrompt: (promptText: string, systemPrompt?: string) => void;
  onSelectTab: (tab: 'chat' | 'agrocampus' | 'prompts' | 'rag' | 'audio' | 'diagnostics' | 'guide') => void;
  userProfile?: UserProfileConfig;
}

export const AgentGuideStudio: React.FC<AgentGuideStudioProps> = ({
  onExecutePrompt,
  onSelectTab,
  userProfile,
}) => {
  const [subTab, setSubTab] = useState<'fiche' | 'tuto' | 'mail' | 'metiers'>('fiche');
  const [copiedMailIndex, setCopiedMailIndex] = useState<number | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  // E-mail découverte copywriting
  const emailSubjectOptions = [
    "🌱 Un nouvel allié d'État pour votre quotidien à l'Agrocampus (IA 100% souveraine)",
    "⚡ Fini les heures perdues sur les tâches répétitives : découvrez Albert Agrocampus !",
    "🛡️ Vos cours, fiches et notes méritent mieux que ChatGPT : voici Albert DINUM pour l'Agrocampus",
  ];

  const mainEmailBody = `Bonjour à toutes et à tous,

Combien d'heures passez-vous chaque semaine à rédiger des notes de service, reformuler des progressions pédagogiques, concevoir des grilles de CCF, calculer des plans d'assolement maraîcher ou rédiger des comptes-rendus de réunion ?

Nous le savons : votre véritable valeur ajoutée est auprès des élèves, des apprentis, sur les parcelles de l'exploitation ou sur le terrain. Pas dans la paperasse administrative répétitive.

Vous avez sans doute déjà entendu parler d'outils comme ChatGPT. Mais pour nos missions de service public, une question cruciale se posait : **la sécurité et la souveraineté de nos données**. Impossible de confier nos référentiels, nos notes internes ou nos données d'établissement à des serveurs privés étrangers.

C'est pourquoi nous mettons aujourd'hui à votre disposition un nouvel outil conçu sur-mesure pour notre établissement :

👉 **La Console Albert DINUM · Agrocampus Saint-Germain-en-Laye**

---

### Qu'est-ce que c'est concrètement ?
Albert est l'intelligence artificielle souveraine développée par l'État français (la DINUM - Direction Interministérielle du Numérique). 
Nous l'avons entièrement paramétrée pour les spécificités de notre Agrocampus (Lycée général et technologique, filières professionnelles, CFA/CFPPA, Exploitation agricole, Internat et Services régionaux).

### Ce qu'elle fait pour vous en 2 clics :
1. **6 Espaces Métiers Dédiés** : Sélectionnez votre métier en haut à droite (Enseignant, Formateur CFA, Exploitation agricole, Administration, Vie scolaire, Personnel technique IdF) pour que l'IA adopte immédiatement le vocabulaire, la rigueur et les codes de votre quotidien.
2. **Bibliothèque de Gabarits Prêts à l'Emploi** : Devoirs de SVT ou Maths avec barème, fiches CCF, rotations de cultures maraîchères bio, arrêtés préfectoraux sécheresse, protocoles HACCP, courriers éducatifs... Tout est déjà pré-formaté.
3. **Recherche Documentaire Intelligente (RAG)** : Interrogez directement les référentiels de diplômes, les textes réglementaires et vos propres documents PDF sans avoir à tout relire.
4. **Studio de Transcription Vocale** : Dictez vos bilans de stage ou comptes-rendus au micro, téléversez vos enregistrements audio, et obtenez en 10 secondes une synthèse professionnelle impeccable.

### La garantie absolue : 100% Souverain et Sécurisé
- 🔒 **Vos données restent en France** sur des infrastructures publiques et souveraines certifiées.
- 🚫 **Zéro utilisation commerciale** : Vos documents et vos cours ne servent JAMAIS à entraîner des modèles privés.
- ⚡ **Accès direct et instantané** : Aucun compte complexe à créer, accessible dès maintenant sur vos ordinateurs et tablettes.

---

### Comment tester en 3 minutes ?
1. Rendez-vous sur la plateforme : {{LIEN_DE_LA_PLATEFORME}}
2. Choisissez votre profil dans le bandeau supérieur.
3. Cliquez sur un exemple dans **Gabarits Métier** ou posez votre première question dans le **Studio Chat**.

Prenez 5 minutes aujourd'hui pour explorer votre espace métier. Vous verrez immédiatement le temps précieux que vous allez pouvoir économiser.

Bien cordialement,
L'équipe de direction & de coordination numérique
Agrocampus Saint-Germain-en-Laye
EPLEFPAH`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* En-tête principal */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 bottom-0 translate-y-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-200 border border-blue-400/30">
                <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                Kit de Déploiement & Information des Agents
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                IA Souveraine DINUM
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Kit de Présentation & Déploiement Agrocampus
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Tout le matériel prêt à l'emploi pour informer, rassurer et former l'ensemble des
              personnels de l'établissement (enseignants, formateurs, exploitation, vie scolaire,
              administration, agents techniques Région Île-de-France).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition-colors border border-white/20 cursor-pointer shadow-xs"
              title="Imprimer ou enregistrer au format PDF pour affichage ou distribution"
            >
              <Printer className="w-4 h-4 text-blue-300" />
              <span>Imprimer / Exporter PDF</span>
            </button>
            <button
              onClick={() => onSelectTab('chat')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Accéder à la console</span>
            </button>
          </div>
        </div>
      </div>

      {/* Barre de navigation interne du kit */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200 overflow-x-auto">
        <button
          onClick={() => setSubTab('fiche')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'fiche'
              ? 'bg-white text-blue-900 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <FileText className="w-4 h-4 text-blue-700" />
          <span>Fiche d'Information Officielle</span>
        </button>

        <button
          onClick={() => setSubTab('tuto')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'tuto'
              ? 'bg-white text-blue-900 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Compass className="w-4 h-4 text-indigo-700" />
          <span>Tutoriel Prise en Main (5 min)</span>
        </button>

        <button
          onClick={() => setSubTab('mail')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'mail'
              ? 'bg-white text-blue-900 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Mail className="w-4 h-4 text-emerald-700" />
          <span>Mail Découverte (Copywriting)</span>
        </button>

        <button
          onClick={() => setSubTab('metiers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'metiers'
              ? 'bg-white text-blue-900 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Layers className="w-4 h-4 text-amber-700" />
          <span>Fiches Pratiques par Métier</span>
        </button>
      </div>

      {/* CONTENU ONGLET 1 : FICHE D'INFORMATION OFFICIELLE */}
      {subTab === 'fiche' && (
        <div className="space-y-6">
          {/* Fiche imprimable */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8 print:border-none print:shadow-none print:p-0">
            {/* Entête institutionnel de la fiche */}
            <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-900 uppercase tracking-wider">
                    Fiche Pratique & Institutionnelle
                  </span>
                  <span className="text-xs text-slate-500 font-mono">Réf : AGRO-DINUM-2026</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mt-2">
                  Console Albert DINUM · Agrocampus Saint-Germain-en-Laye
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Portail d'Intelligence Artificielle Souveraine et Républicaine dédié aux équipes
                  pédagogiques, techniques et administratives de l'EPLEFPAH.
                </p>
              </div>

              <div className="text-right hidden sm:block shrink-0">
                <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200">
                  ✓ Conforme RGPD & DSI Éducation / Agriculture
                </span>
                <p className="text-[11px] text-slate-400 mt-1">Hébergement 100% France</p>
              </div>
            </div>

            {/* Pourquoi cet outil ? Le manifeste */}
            <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/50 rounded-xl p-5 border border-blue-200/70">
              <h3 className="text-sm font-bold text-blue-950 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                Pourquoi cette plateforme a-t-elle été conçue pour vous ?
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 mt-2 leading-relaxed">
                Les intelligences artificielles grand public (ChatGPT, Copilot, etc.) posent des
                problèmes majeurs de <strong>confidentialité des données</strong> et ne sont pas
                adaptées aux réalités des lycées agricoles, des exploitations maraîchères ou des
                établissements publics. La <strong>Console Albert DINUM</strong> a été conçue pour
                répondre à cette double exigence : apporter la puissance de l'IA aux agents dans
                leurs missions quotidiennes, tout en garantissant une{' '}
                <strong>totale indépendance technologique et réglementaire</strong>.
              </p>
            </div>

            {/* Grille des 4 Piliers Fonctionnels */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-700" />
                Les 4 Piliers Fonctionnels de la Plateforme
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pilier 1 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-800">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        1. Studio Conversationnel Métier
                      </h4>
                      <span className="text-[11px] text-blue-700 font-medium">Modèles souverains Albert</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Un dialogue interactif avec les modèles d'État (Ministral, Albert). L'assistant
                    adopte automatiquement les consignes spécifiques de votre métier dès que vous
                    sélectionnez votre profil dans le bandeau supérieur.
                  </p>
                  <ul className="mt-2.5 space-y-1 text-[11px] text-slate-600">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Rendu soigné des tableaux, formules et barèmes</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Paramètres de créativité (température) et longueur ajustables</span>
                    </li>
                  </ul>
                </div>

                {/* Pilier 2 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 rounded-lg bg-indigo-100 text-indigo-800">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        2. Gabarits Métiers Prêts à l'Emploi
                      </h4>
                      <span className="text-[11px] text-indigo-700 font-medium">Générateurs avec formulaire</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Plus besoin de réfléchir à comment formuler votre demande (« prompter »). Choisissez un
                    modèle (fiche de CCF, note de service, plan d'assolement, protocole de sécurité),
                    ajustez 2 champs et lancez la génération.
                  </p>
                  <ul className="mt-2.5 space-y-1 text-[11px] text-slate-600">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Filtrage instantané par profil métier actif</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Formulaires interactifs pour personnaliser le contenu</span>
                    </li>
                  </ul>
                </div>

                {/* Pilier 3 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                      <Search className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        3. RAG Documentaire & Recherche Sourcée
                      </h4>
                      <span className="text-[11px] text-emerald-700 font-medium">Corpus officiel & vos fichiers</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Interrogez la base de connaissances intégrée (référentiels Bac Pro, BTSA, arrêtés
                    sécheresse 78, règles phytosanitaires bio, charte internat). Déposez vos propres
                    PDF/DOCX pour que l'IA y réponde avec citations de sources.
                  </p>
                  <ul className="mt-2.5 space-y-1 text-[11px] text-slate-600">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Injection en 1 clic d'un texte de référence dans le Chat</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Filtres par thématique (pédagogie, exploitation, juridique...)</span>
                    </li>
                  </ul>
                </div>

                {/* Pilier 4 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        4. Transcription Vocale & Dictée Intelligente
                      </h4>
                      <span className="text-[11px] text-amber-700 font-medium">Audio vers texte & synthèse</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Parlez directement au micro ou téléversez un fichier audio de réunion, de visite de
                    stage ou de diagnostic sur parcelle. Obtenez une retranscription fidèle et demandez
                    un compte-rendu synthétique en un clic.
                  </p>
                  <ul className="mt-2.5 space-y-1 text-[11px] text-slate-600">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Reconnaissance vocale haute précision en français</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Génération directe de compte-rendu exécutif ou de plan d'action</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Tableau des Avantages & Opportunités */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                Avantages Concrets & Opportunités pour l'Établissement
              </h3>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Critère</th>
                      <th className="p-3">Solutions Privées / GAFAM</th>
                      <th className="p-3 text-blue-900 bg-blue-50/80">Console Albert DINUM Agrocampus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-600">
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Confidentialité & RGPD</td>
                      <td className="p-3 text-red-700">Données envoyées aux USA, risques légaux pour l'établissement.</td>
                      <td className="p-3 font-semibold text-emerald-700 bg-emerald-50/30">
                        ✓ 100% Souveraineté DINUM. Hébergement public en France. Aucune réutilisation.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Connaissance Métier</td>
                      <td className="p-3 text-slate-500">Générique, ignore les arrêtés 78, les CCF ou la DGER.</td>
                      <td className="p-3 font-semibold text-blue-900 bg-blue-50/30">
                        ✓ 6 profils calibrés avec les textes de l'enseignement agricole et général.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Gain de temps moyen</td>
                      <td className="p-3 text-slate-500">Nécessite de taper de longs prompts compliqués.</td>
                      <td className="p-3 font-semibold text-blue-900 bg-blue-50/30">
                        ✓ 2 à 4 heures économisées par semaine grâce aux gabarits prêts à l'emploi.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Coût pour l'agent</td>
                      <td className="p-3 text-slate-500">Abonnements payants individuels (20-25€/mois).</td>
                      <td className="p-3 font-semibold text-emerald-700 bg-emerald-50/30">
                        ✓ Totalement gratuit et financé pour les personnels de l'établissement.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Continuité pédagogique & technique</td>
                      <td className="p-3 text-slate-500">Chacun travaille dans son coin sans partage.</td>
                      <td className="p-3 font-semibold text-blue-900 bg-blue-50/30">
                        ✓ Standardisation des formats, lien direct lycée-exploitation-CFA.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pied de fiche / contact */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
              <span>Agrocampus Saint-Germain-en-Laye · Direction & Coordination Numérique</span>
              <span className="font-mono">Contact support : eplefpah.sgl@gmail.com</span>
            </div>
          </div>
        </div>
      )}

      {/* CONTENU ONGLET 2 : TUTORIEL PAS-À-PAS */}
      {subTab === 'tuto' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8">
            <div>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-900 uppercase tracking-wider">
                Guide Utilisateur Rapide
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-2">
                Prendre en main Albert Agrocampus en 5 étapes chrono
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Aucune compétence informatique avancée requise. Suivez ce guide interactif pour
                réaliser votre première tâche en moins de 3 minutes.
              </p>
            </div>

            {/* Les 5 Étapes */}
            <div className="space-y-6">
              {/* Étape 1 */}
              <div className="flex gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                <div className="w-8 h-8 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center shrink-0 text-sm shadow-xs">
                  1
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">
                      Sélectionnez votre Profil Métier (en haut à gauche)
                    </h3>
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded">
                      Essentiel
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Cliquez sur le bouton avec l'icône de métier dans le bandeau supérieur. Choisissez
                    parmi les 6 profils disponibles :
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    <span className="p-2 rounded bg-white border border-slate-200 text-[11px] font-medium text-slate-700 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                      <span>Enseignants</span>
                    </span>
                    <span className="p-2 rounded bg-white border border-slate-200 text-[11px] font-medium text-slate-700 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Formateurs CFA</span>
                    </span>
                    <span className="p-2 rounded bg-white border border-slate-200 text-[11px] font-medium text-slate-700 flex items-center gap-1.5">
                      <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Exploitation</span>
                    </span>
                    <span className="p-2 rounded bg-white border border-slate-200 text-[11px] font-medium text-slate-700 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-amber-600" />
                      <span>Administration</span>
                    </span>
                    <span className="p-2 rounded bg-white border border-slate-200 text-[11px] font-medium text-slate-700 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-purple-600" />
                      <span>Vie scolaire</span>
                    </span>
                    <span className="p-2 rounded bg-white border border-slate-200 text-[11px] font-medium text-slate-700 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-rose-600" />
                      <span>Technique & IdF</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 italic mt-1">
                    💡 Votre choix est mémorisé automatiquement sur votre navigateur pour votre
                    prochaine visite !
                  </p>
                </div>
              </div>

              {/* Étape 2 */}
              <div className="flex gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                <div className="w-8 h-8 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center shrink-0 text-sm shadow-xs">
                  2
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">
                      Gagnez du temps avec les « Gabarits Métier »
                    </h3>
                    <button
                      onClick={() => onSelectTab('prompts')}
                      className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Voir les gabarits</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Rendez-vous dans l'onglet <strong>« Gabarits Métier »</strong>. Sélectionnez une
                    fiche pré-configurée (ex : <em>Progression pédagogique</em>, <em>Sujet de CCF</em>,{' '}
                    <em>Note de service</em> ou <em>Plan d'assolement maraîcher</em>). Remplissez les 2 ou
                    3 variables dans le formulaire et cliquez sur <strong>« Lancer dans le chat »</strong>.
                  </p>
                </div>
              </div>

              {/* Étape 3 */}
              <div className="flex gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                <div className="w-8 h-8 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center shrink-0 text-sm shadow-xs">
                  3
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">
                      Travaillez avec vos documents (RAG Documentaire)
                    </h3>
                    <button
                      onClick={() => onSelectTab('rag')}
                      className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Aller au RAG</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Dans l'onglet <strong>« RAG & Documents »</strong>, vous avez accès à une bibliothèque
                    officielle (référentiels, règlements, arrêtés). Vous pouvez aussi{' '}
                    <strong>glisser-déposer vos propres fichiers (PDF, DOCX, TXT)</strong> directement
                    dans la zone de chat pour qu'Albert réponde exclusivement à partir de votre texte !
                  </p>
                </div>
              </div>

              {/* Étape 4 */}
              <div className="flex gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                <div className="w-8 h-8 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center shrink-0 text-sm shadow-xs">
                  4
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">
                      Dictez au micro vos comptes-rendus (Studio Audio)
                    </h3>
                    <button
                      onClick={() => onSelectTab('audio')}
                      className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Tester l'audio</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Vous revenez d'une visite de stage en entreprise ? D'un tour de parcelle sur la
                    ferme ? D'une réunion de pôle ? Ouvrez l'onglet <strong>« Transcription Vocale »</strong>,
                    enregistrez votre voix pendant 1 ou 2 minutes, et cliquez sur <em>« Synthétiser dans le Chat »</em>.
                    Vous obtenez un compte-rendu clair et structuré en quelques secondes.
                  </p>
                </div>
              </div>

              {/* Étape 5 */}
              <div className="flex gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                <div className="w-8 h-8 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center shrink-0 text-sm shadow-xs">
                  5
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="text-sm font-bold text-slate-900">
                    Copiez, adaptez et conservez le contrôle humain
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Chaque réponse générée dispose d'un bouton <strong>« Copier le texte »</strong>.
                    Collez-la directement dans Word, LibreOffice, Pronote ou votre messagerie.
                  </p>
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span>
                      <strong>Règle d'or de l'agent public :</strong> Albert est un assistant et un
                      accélérateur. Vous gardez toujours la relecture finale et la responsabilité de ce
                      que vous diffusez aux élèves ou aux partenaires.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Guide des 4 Astuces pour formuler une bonne question */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                La méthode "C-R-O-F" pour poser une question parfaite à Albert
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="font-bold text-blue-900 block mb-1">C · Contexte</span>
                  <p className="text-slate-600">
                    Précisez la filière ou la situation (ex: <em>« En classe de Seconde GT »</em> ou <em>« Pour la ferme maraîchère »</em>).
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="font-bold text-indigo-900 block mb-1">R · Rôle</span>
                  <p className="text-slate-600">
                    Déjà géré automatiquement par votre profil métier sélectionné !
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="font-bold text-emerald-900 block mb-1">O · Objectif</span>
                  <p className="text-slate-600">
                    Ce que vous voulez précisément (ex: <em>« Une grille de notation critériée sur 20 »</em>).
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="font-bold text-amber-900 block mb-1">F · Format</span>
                  <p className="text-slate-600">
                    Ex: <em>« Sous forme de tableau avec colonnes Critère, Indicateur, Points »</em>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTENU ONGLET 3 : MAIL DÉCOUVERTE (COPYWRITING) */}
      {subTab === 'mail' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-900 uppercase tracking-wider">
                  Kit de Communication E-mail
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-2">
                  Mail de Découverte (Prêt à l'envoi aux agents)
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Rédigé selon les meilleures techniques de copywriting (méthode PAS : Problème,
                  Agitation, Solution) pour susciter l'adhésion immédiate sans jargon technique.
                </p>
              </div>

              <button
                onClick={() => handleCopyText(mainEmailBody, 'full_mail')}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer shrink-0"
              >
                {copiedSection === 'full_mail' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-200" />
                    <span>E-mail copié dans le presse-papier !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copier tout le mail</span>
                  </>
                )}
              </button>
            </div>

            {/* Sélecteur d'objet du mail */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>3 Variantes d'objets percutants (au choix) :</span>
              </label>

              <div className="space-y-2">
                {emailSubjectOptions.map((subj, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/70 text-xs hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400 font-bold">Option {idx + 1} :</span>
                      <span className="font-semibold text-slate-800">{subj}</span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(subj);
                        setCopiedMailIndex(idx);
                        setTimeout(() => setCopiedMailIndex(null), 2000);
                      }}
                      className="text-slate-500 hover:text-blue-700 p-1 rounded hover:bg-white transition-colors cursor-pointer"
                      title="Copier cet objet"
                    >
                      {copiedMailIndex === idx ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Corps du message pré-visualisé */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Corps du message à envoyer :
              </span>
              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 font-sans text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap select-all">
                {mainEmailBody}
              </div>
            </div>

            {/* Version courte pour messagerie instantanée (ENT / Teams / WhatsApp) */}
            <div className="p-4 rounded-xl border border-slate-200 bg-indigo-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-indigo-700" />
                  <span>Version Courte pour ENT / Teams / Message instantané</span>
                </span>
                <button
                  onClick={() =>
                    handleCopyText(
                      `🚀 NOUVEAU : Albert Agrocampus est disponible !\nUne IA 100% souveraine d'État (DINUM) configurée pour nos métiers (enseignants, CFA, exploitation, administration, vie scolaire, technique Région IdF).\n👉 Vos données restent en France, zéro risque RGPD, et des dizaines de gabarits prêts pour vos cours, CCF, assonlements et notes de service.\nTestez votre profil en 2 minutes ici : {{LIEN_DE_LA_PLATEFORME}}`,
                      'short_msg'
                    )
                  }
                  className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
                >
                  {copiedSection === 'short_msg' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier le message court</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-700 italic">
                « 🚀 NOUVEAU : Albert Agrocampus est disponible ! Une IA 100% souveraine d'État (DINUM)
                configurée pour nos métiers (enseignants, CFA, exploitation, administration, vie scolaire,
                technique Région IdF). Vos données restent en France, zéro risque RGPD, et des dizaines
                de gabarits prêts pour vos cours, CCF, assolements et notes de service. Testez en 2 minutes
                ici : [LIEN] »
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CONTENU ONGLET 4 : FICHES PRATIQUES PAR MÉTIER */}
      {subTab === 'metiers' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 uppercase tracking-wider">
                Déclinaison Opérationnelle
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-2">
                Cas d'Usage Réels pour Chacun des 6 Métiers de l'Agrocampus
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Cliquez sur un cas d'usage pour lancer immédiatement la simulation dans le Studio Chat.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Enseignants */}
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-800">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-blue-950">1. Enseignants (Lycée Général, Techno & Pro)</h3>
                    <span className="text-[11px] text-blue-700">Seconde GT, 1ère/Terminale Spé, Bac Pro, BTSA</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600">
                  Génération de cours, devoirs surveillés avec barème, fiches d'évaluation CCF
                  critériées, différenciation pédagogique selon les profils d'élèves.
                </p>
                <button
                  onClick={() => {
                    onExecutePrompt(
                      "Conçois un sujet d'évaluation formative de SVT / Biologie-Écologie pour une classe de Première Générale sur le thème 'La dynamique des sols et la fertilité organique en agrosystème francilien'. Inclus 2 exercices d'analyse de documents et un barème détaillé sur 20 points.",
                      "Tu es professeur agrégé de SVT et biologie-écologie en lycée d'enseignement général et technologique agricole."
                    );
                    onSelectTab('chat');
                  }}
                  className="w-full py-2 px-3 bg-white hover:bg-blue-100 text-blue-900 rounded-lg border border-blue-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tester : Évaluation SVT 1ère Générale</span>
                </button>
              </div>

              {/* Formateurs CFA / CFPPA */}
              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-indigo-100 text-indigo-800">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-indigo-950">2. Formateurs (CFA & CFPPA)</h3>
                    <span className="text-[11px] text-indigo-700">Alternance, apprentissage & reconversion d'adultes</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600">
                  Grilles d'évaluation en situation de travail, livrets de liaison tuteur-centre,
                  ingénierie pédagogique par blocs de compétences pour BPA, BP et CS.
                </p>
                <button
                  onClick={() => {
                    onExecutePrompt(
                      "Construis une grille d'évaluation en situation de travail (milieu professionnel) pour un apprenti en BPA Aménagements Paysagers sur le module de pose de bordures et pavages, avec critères observables et indicateurs de réussite.",
                      "Tu es formateur expert en centre de formation des apprentis (CFA) agricole et travaux paysagers."
                    );
                    onSelectTab('chat');
                  }}
                  className="w-full py-2 px-3 bg-white hover:bg-indigo-100 text-indigo-900 rounded-lg border border-indigo-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Tester : Grille évaluation apprenti BPA</span>
                </button>
              </div>

              {/* Exploitation Agricole */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                    <Sprout className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-950">3. Exploitation Agricole & Ferme</h3>
                    <span className="text-[11px] text-emerald-700">Maraîchage biologique, verger & ateliers pédagogiques</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600">
                  Plan de rotation des cultures sur 4 ans, calculs de fertilisation organique,
                  conformité aux arrêtés sécheresse des Yvelines et traçabilité Bio/HVE.
                </p>
                <button
                  onClick={() => {
                    onExecutePrompt(
                      "Génère un plan de rotation maraîchère biologique sur 4 ans pour une parcelle de 1,5 hectare en sol limoneux à Saint-Germain-en-Laye, en alternant légumes feuilles, racines, fruits et légumineuses, avec engrais verts d'hiver.",
                      "Tu es agronome chef d'exploitation maraîchère biologique en lycée agricole public."
                    );
                    onSelectTab('chat');
                  }}
                  className="w-full py-2 px-3 bg-white hover:bg-emerald-100 text-emerald-900 rounded-lg border border-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tester : Rotation maraîchère 4 ans</span>
                </button>
              </div>

              {/* Administration & Direction */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-950">4. Administration & Intendance</h3>
                    <span className="text-[11px] text-amber-700">Direction, secrétariat général, marchés & gestion</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600">
                  Notes de service internes, délibérations du Conseil d'Administration, conventions
                  de stage tripartites, réponses administratives protocolaires.
                </p>
                <button
                  onClick={() => {
                    onExecutePrompt(
                      "Rédige une note de service officielle pour l'ensemble des personnels de l'Agrocampus rappelant les consignes de sécurité, de port des EPI et de circulation des engins agricoles sur l'exploitation.",
                      "Tu es secrétaire général et adjoint de direction en établissement public local d'enseignement agricole."
                    );
                    onSelectTab('chat');
                  }}
                  className="w-full py-2 px-3 bg-white hover:bg-amber-100 text-amber-900 rounded-lg border border-amber-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Tester : Note de service sécurité</span>
                </button>
              </div>

              {/* Vie Scolaire */}
              <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-800">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-purple-950">5. Vie Scolaire & Internat</h3>
                    <span className="text-[11px] text-purple-700">CPE, AED, climat scolaire & médiation</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600">
                  Courriers bienveillants et fermes aux familles, contrats d'engagement éducatif,
                  règlement d'internat et protocoles de gestion des absences.
                </p>
                <button
                  onClick={() => {
                    onExecutePrompt(
                      "Rédige une trame de contrat éducatif d'objectifs pour un élève interne de Seconde GT en situation de décrochage ou de retards répétés, avec engagements de l'élève, de la famille et de l'établissement.",
                      "Tu es Conseiller Principal d'Éducation (CPE) expérimenté en lycée avec internat."
                    );
                    onSelectTab('chat');
                  }}
                  className="w-full py-2 px-3 bg-white hover:bg-purple-100 text-purple-900 rounded-lg border border-purple-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Tester : Contrat éducatif internat</span>
                </button>
              </div>

              {/* Services Techniques & Région IdF */}
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-rose-100 text-rose-800">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-rose-950">6. Personnels Techniques & Région IdF</h3>
                    <span className="text-[11px] text-rose-700">Maintenance des bâtiments, atelier paysager, hygiène & cantine</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600">
                  Fiches de maintenance préventive du matériel motorisé, protocoles de sécurité ERP,
                  plans de nettoyage PMS/HACCP pour la restauration collective.
                </p>
                <button
                  onClick={() => {
                    onExecutePrompt(
                      "Établis une fiche technique de maintenance préventive pour le parc de tondeuses autoportées et débroussailleuses de l'atelier paysager (niveaux, filtres, affûtage des lames, contrôles des sécurités) avec périodicité et registre de signatures.",
                      "Tu es responsable d'atelier technique et chargé de maintenance pour les lycées de la Région Île-de-France."
                    );
                    onSelectTab('chat');
                  }}
                  className="w-full py-2 px-3 bg-white hover:bg-rose-100 text-rose-900 rounded-lg border border-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                  <span>Tester : Fiche entretien matériel paysager</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
