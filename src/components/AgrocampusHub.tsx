import React, { useState, useEffect } from 'react';
import {
  Sprout,
  GraduationCap,
  Store,
  Users,
  Wrench,
  Building2,
  ArrowRight,
  Sparkles,
  BookOpen,
  Calendar,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { UserProfileConfig } from '../types';

interface AgrocampusHubProps {
  onExecutePrompt: (promptText: string, systemPrompt?: string) => void;
  userProfile?: UserProfileConfig;
  onOpenGuide?: () => void;
}

export const AgrocampusHub: React.FC<AgrocampusHubProps> = ({
  onExecutePrompt,
  userProfile,
  onOpenGuide,
}) => {
  const [activePole, setActivePole] = useState<
    'pedagogie' | 'exploitation' | 'circuits_courts' | 'viescolaire' | 'technique'
  >('pedagogie');

  // Synchroniser le pôle affiché avec le profil utilisateur actif
  useEffect(() => {
    if (!userProfile) return;
    if (userProfile.id === 'enseignant' || userProfile.id === 'formateur') {
      setActivePole('pedagogie');
    } else if (userProfile.id === 'exploitation') {
      setActivePole('exploitation');
    } else if (userProfile.id === 'administration') {
      setActivePole('circuits_courts');
    } else if (userProfile.id === 'viescolaire') {
      setActivePole('viescolaire');
    } else if (userProfile.id === 'technique_idf') {
      setActivePole('technique');
    }
  }, [userProfile?.id]);

  // État du générateur Enseignement Général & Technique
  const [pedagoNiveau, setPedagoNiveau] = useState('Seconde GT (SVT & Sciences)');
  const [pedagoDiscipline, setPedagoDiscipline] = useState('SVT / Biologie-Écologie');
  const [pedagoTheme, setPedagoTheme] = useState('Structure des agrosystèmes et dynamique de la matière organique');
  const [pedagoDuree, setPedagoDuree] = useState('2 heures (TP terrain + laboratoire)');
  const [pedagoModalite, setPedagoModalite] = useState('Investigation pratique avec prélèvement sur la ferme et observation microscopique');

  // État de l'assolement maraîcher
  const [assolementSurface, setAssolementSurface] = useState('1,5 hectare');
  const [assolementCultures, setAssolementCultures] = useState('Tomates anciennes, Carottes, Poireaux, Courges, Salades');
  const [assolementAnnees, setAssolementAnnees] = useState('4 ans');

  // État boutique & circuits courts
  const [boutiqueLegumes, setBoutiqueLegumes] = useState('Paniers de légumes bio, jus de pomme du verger, miel du campus');
  const [boutiqueHoraires, setBoutiqueHoraires] = useState('Mercredi 14h-18h et Vendredi 16h-19h');

  // État vie scolaire & internat
  const [vieScolaireAction, setVieScolaireAction] = useState('Protocole d’accueil et d’intégration des nouveaux internes de Seconde GT');
  const [vieScolaireCible, setVieScolaireCible] = useState('Élèves internes et demi-pensionnaires');

  // État technique & Région IdF
  const [techEquipement, setTechEquipement] = useState('Parc de tondeuses autoportées, débroussailleuses et motoculteurs de l’atelier');
  const [techActionType, setTechActionType] = useState('Fiche de contrôle préventif sécurité et carnet d’entretien périodique');

  const handleLaunchPedagogie = () => {
    const prompt = `Conçois une séquence d'enseignement complète et structurée pour la classe de : ${pedagoNiveau}.
Discipline / Spécialité : ${pedagoDiscipline}.
Thématique de la séance : ${pedagoTheme}.
Durée prévue : ${pedagoDuree}.
Modalités didactiques : ${pedagoModalite}.

La proposition doit comprendre :
1. Objectifs notionnels et compétences cibles (référentiel officiel Éducation Nationale / DGER).
2. Déroulé minuté de la séance (phase d'accroche/problématisation, activité des élèves, synthèse).
3. Matériel et ressources de l'Agrocampus mobilisés (ferme, serres, laboratoire).
4. Critères et barème d'évaluation formative ou sommative.`;

    onExecutePrompt(
      prompt,
      "Tu es professeur expert en lycée général et technologique agricole, préparant les élèves au Baccalauréat (Seconde GT, 1ère et Terminale Générale, Bac Pro et BTSA)."
    );
  };

  const handleLaunchAssolement = () => {
    const prompt = `Génère un plan d'assolement et de rotation des cultures maraîchères biologiques sur ${assolementAnnees} pour une surface de ${assolementSurface} à Agrocampus Saint-Germain-en-Laye (sol limoneux francilien).
Cultures prioritaires : ${assolementCultures}.
Intègre les engrais verts d'interculture, la rupture des cycles de bioagresseurs et la gestion de la fertilisation organique locale (fumier composté).`;
    onExecutePrompt(
      prompt,
      'Tu es agronome formateur expert en maraîchage biologique diversifié au sein d’un lycée agricole public.'
    );
  };

  const handleLaunchBoutique = () => {
    const prompt = `Rédige une communication officielle et attractive pour la communauté d'Agrocampus et les riverains concernant la vente directe à la Boutique de la Ferme du lycée.
Produits de saison récoltés par les élèves : ${boutiqueLegumes}.
Horaires d'ouverture : ${boutiqueHoraires}.
Mets en valeur la fraîcheur locale (zéro km), le label Bio/HVE et le soutien à la formation professionnelle des futurs agriculteurs et paysagistes.`;
    onExecutePrompt(
      prompt,
      'Tu es chargé de communication et responsable de la commercialisation en circuits courts pour un EPLEFPA.'
    );
  };

  const handleLaunchVieScolaire = () => {
    const prompt = `Rédige un protocole opérationnel de vie scolaire pour l'Agrocampus sur le sujet : "${vieScolaireAction}".
Public concerné : ${vieScolaireCible}.
Précise les étapes de mise en œuvre, le rôle des CPE et assistants d'éducation, la communication avec les familles et le lien avec le règlement intérieur de l'internat.`;
    onExecutePrompt(
      prompt,
      'Tu es Conseiller Principal d’Éducation (CPE) en lycée agricole avec internat, expert en climat scolaire et citoyenneté.'
    );
  };

  const handleLaunchTechnique = () => {
    const prompt = `Rédige une procédure technique de maintenance et de sécurité au travail pour les agents de la Région Île-de-France et personnels techniques d'Agrocampus.
Équipements ou installation : ${techEquipement}.
Type d'intervention : ${techActionType}.
Inclus : check-list des points de contrôle de sécurité, équipements de protection individuelle (EPI) obligatoires, procédure de consignation et registre d'émargement.`;
    onExecutePrompt(
      prompt,
      'Tu es responsable d’atelier de maintenance et chargé de sécurité ERP pour les lycées de la Région Île-de-France.'
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Espaces & Pôles Opérationnels Agrocampus
            </h1>
            {userProfile && (
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${userProfile.colorScheme.bgLight} ${userProfile.colorScheme.textDark} ${userProfile.colorScheme.border}`}>
                {userProfile.badge}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Générateurs instantanés configurés pour les besoins quotidiens des enseignants, formateurs,
            agents de l’exploitation, de la vie scolaire, de l’administration et de la Région IdF.
          </p>
        </div>

        {onOpenGuide && (
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 shadow-2xs"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Consulter la Fiche & le Tuto Agent</span>
          </button>
        )}
      </div>

      {/* Navigation entre les pôles métiers */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <button
          onClick={() => setActivePole('pedagogie')}
          className={`flex items-start gap-2.5 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activePole === 'pedagogie'
              ? 'bg-blue-50/80 border-blue-300 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-bold text-slate-900 truncate">
              Lycée & Pédagogie
            </span>
            <span className="text-[11px] text-slate-500 line-clamp-1">
              Général, Pro & BTSA
            </span>
          </div>
        </button>

        <button
          onClick={() => setActivePole('exploitation')}
          className={`flex items-start gap-2.5 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activePole === 'exploitation'
              ? 'bg-blue-50/80 border-blue-300 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Sprout className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-bold text-slate-900 truncate">
              Exploitation & Ferme
            </span>
            <span className="text-[11px] text-slate-500 line-clamp-1">
              Maraîchage bio, eau, sol
            </span>
          </div>
        </button>

        <button
          onClick={() => setActivePole('circuits_courts')}
          className={`flex items-start gap-2.5 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activePole === 'circuits_courts'
              ? 'bg-blue-50/80 border-blue-300 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Store className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-bold text-slate-900 truncate">
              Boutique & Gestion
            </span>
            <span className="text-[11px] text-slate-500 line-clamp-1">
              Circuits courts & Admin
            </span>
          </div>
        </button>

        <button
          onClick={() => setActivePole('viescolaire')}
          className={`flex items-start gap-2.5 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activePole === 'viescolaire'
              ? 'bg-blue-50/80 border-blue-300 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-bold text-slate-900 truncate">
              Vie Scolaire
            </span>
            <span className="text-[11px] text-slate-500 line-clamp-1">
              Internat & Climat
            </span>
          </div>
        </button>

        <button
          onClick={() => setActivePole('technique')}
          className={`flex items-start gap-2.5 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activePole === 'technique'
              ? 'bg-blue-50/80 border-blue-300 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <Wrench className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-bold text-slate-900 truncate">
              Services Région IdF
            </span>
            <span className="text-[11px] text-slate-500 line-clamp-1">
              Machines, HACCP, ERP
            </span>
          </div>
        </button>
      </div>

      {/* Contenu interactif selon le pôle choisi */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
        {/* PÔLE 1 : PÉDAGOGIE & LYCÉE (GÉNÉRAL + PRO + BTSA) */}
        {activePole === 'pedagogie' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-700" />
                <h2 className="text-base font-bold text-slate-900">
                  Générateur Pédagogique : Enseignement Général, Professionnel & Technologique
                </h2>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Concevez des cours, séances de travaux pratiques et devoirs pour la Seconde GT, les spécialités de 1ère et Terminale Générale (Maths, Physique-Chimie, SVT / Biologie), ainsi que les Bac Pro et BTSA.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Niveau / Filière
                </label>
                <select
                  value={pedagoNiveau}
                  onChange={(e) => setPedagoNiveau(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                >
                  <option value="Seconde GT (SVT & Sciences)">Seconde GT (SVT & Sciences)</option>
                  <option value="Seconde GT (Mathématiques)">Seconde GT (Mathématiques)</option>
                  <option value="Première Générale (Spécialité Biologie-Écologie / SVT)">Première Générale (Spé Biologie / SVT)</option>
                  <option value="Première Générale (Spécialité Mathématiques)">Première Générale (Spé Mathématiques)</option>
                  <option value="Terminale Générale (Spécialité Physique-Chimie)">Terminale Générale (Spé Physique-Chimie)</option>
                  <option value="Terminale Générale (Grand Oral du Baccalauréat)">Terminale Générale (Grand Oral du Bac)</option>
                  <option value="Bac Pro Aménagements Paysagers (1ère/Term)">Bac Pro Aménagements Paysagers</option>
                  <option value="Bac Pro CGEA Conduite de l'Entreprise Agricole">Bac Pro CGEA</option>
                  <option value="BTSA Agronomie Productions Végétales (APV)">BTSA Agronomie (APV)</option>
                  <option value="BTSA Aménagements Paysagers (CFA Apprentissage)">BTSA Paysage (CFA Apprentissage)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Discipline / Matière
                </label>
                <input
                  type="text"
                  value={pedagoDiscipline}
                  onChange={(e) => setPedagoDiscipline(e.target.value)}
                  placeholder="ex: SVT, Mathématiques, Physique-Chimie, Agronomie"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Durée de la séance
                </label>
                <input
                  type="text"
                  value={pedagoDuree}
                  onChange={(e) => setPedagoDuree(e.target.value)}
                  placeholder="ex: 1h30 TP + 1h cours"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Thème ou chapitre du programme officiel
                </label>
                <input
                  type="text"
                  value={pedagoTheme}
                  onChange={(e) => setPedagoTheme(e.target.value)}
                  placeholder="ex: Structure du sol, cycle de l'azote, équilibres chimiques acido-basiques"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Modalité pédagogique
                </label>
                <input
                  type="text"
                  value={pedagoModalite}
                  onChange={(e) => setPedagoModalite(e.target.value)}
                  placeholder="ex: TP sur la ferme, démarche d'investigation"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleLaunchPedagogie}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Générer la séquence pédagogique avec Albert</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* PÔLE 2 : EXPLOITATION AGRICOLE */}
        {activePole === 'exploitation' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-700" />
                <h2 className="text-base font-bold text-slate-900">
                  Générateur d’Assolement & Gestion Maraîchère Bio
                </h2>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Optimisez la rotation pluriannuelle pour limiter les adventices et maladies,
                maintenir la fertilité du sol limoneux et planifier les récoltes pour la vente directe.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Surface concernée
                </label>
                <input
                  type="text"
                  value={assolementSurface}
                  onChange={(e) => setAssolementSurface(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Durée de rotation
                </label>
                <input
                  type="text"
                  value={assolementAnnees}
                  onChange={(e) => setAssolementAnnees(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cultures prioritaires
                </label>
                <input
                  type="text"
                  value={assolementCultures}
                  onChange={(e) => setAssolementCultures(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleLaunchAssolement}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                <Sprout className="w-3.5 h-3.5" />
                <span>Générer le plan d’assolement dans Albert</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* PÔLE 3 : BOUTIQUE & CIRCUITS COURTS */}
        {activePole === 'circuits_courts' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-amber-700" />
                <h2 className="text-base font-bold text-slate-900">
                  Communication Vente Directe & Boutique de la Ferme
                </h2>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Générez des annonces pour valoriser la fraîcheur, l’engagement Bio/HVE et le travail des apprenants d’Agrocampus.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Produits et paniers disponibles
                </label>
                <input
                  type="text"
                  value={boutiqueLegumes}
                  onChange={(e) => setBoutiqueLegumes(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Horaires d’ouverture
                </label>
                <input
                  type="text"
                  value={boutiqueHoraires}
                  onChange={(e) => setBoutiqueHoraires(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleLaunchBoutique}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Rédiger l’annonce de vente directe</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* PÔLE 4 : VIE SCOLAIRE & INTERNAT */}
        {activePole === 'viescolaire' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-700" />
                <h2 className="text-base font-bold text-slate-900">
                  Vie Scolaire, Internat & Climat Scolaire
                </h2>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Concevez des protocoles éducatifs, fiches d'animation à l'internat, contrats d'engagement et courriers aux familles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Action ou protocole éducatif
                </label>
                <input
                  type="text"
                  value={vieScolaireAction}
                  onChange={(e) => setVieScolaireAction(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Public cible
                </label>
                <input
                  type="text"
                  value={vieScolaireCible}
                  onChange={(e) => setVieScolaireCible(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleLaunchVieScolaire}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Générer le protocole de vie scolaire</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* PÔLE 5 : SERVICES TECHNIQUES & RÉGION IDF */}
        {activePole === 'technique' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-rose-700" />
                <h2 className="text-base font-bold text-slate-900">
                  Services Régionaux IdF, Atelier Paysager & Sécurité
                </h2>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Formalisez les check-lists de sécurité du parc machines, les protocoles HACCP en restauration collective et les bons de consignation technique.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Équipements ou atelier concerné
                </label>
                <input
                  type="text"
                  value={techEquipement}
                  onChange={(e) => setTechEquipement(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Type d'intervention ou de contrôle
                </label>
                <input
                  type="text"
                  value={techActionType}
                  onChange={(e) => setTechActionType(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleLaunchTechnique}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Rédiger la fiche de maintenance et sécurité</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
