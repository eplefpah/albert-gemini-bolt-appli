import React, { useState } from 'react';
import {
  BookOpen,
  ArrowRight,
  Copy,
  Check,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { AgrocampusPrompt, UserProfileConfig } from '../types';
import { AGROCAMPUS_PROMPTS } from '../data/agrocampusPrompts';

interface PromptsLibraryProps {
  onExecutePrompt: (promptText: string, systemPrompt?: string) => void;
  userProfile?: UserProfileConfig;
}

export const PromptsLibrary: React.FC<PromptsLibraryProps> = ({
  onExecutePrompt,
  userProfile,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOnlyMyProfile, setFilterOnlyMyProfile] = useState(true);
  const [activePrompt, setActivePrompt] = useState<AgrocampusPrompt | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const categories = [
    { id: 'tous', label: 'Toutes les catégories' },
    { id: 'general_lycee', label: 'Lycée Général (Seconde GT, 1ère & Tle)' },
    { id: 'pedagogie', label: 'Pédagogie, Bac Pro & BTSA' },
    { id: 'exploitation', label: 'Exploitation & Maraîchage' },
    { id: 'administration', label: 'Administration & RH' },
    { id: 'viescolaire', label: 'Vie Scolaire & Internat' },
    { id: 'technique', label: 'Services Techniques & Région IdF' },
    { id: 'reglementation', label: 'Réglementation & Bio' },
  ];

  const filteredPrompts = AGROCAMPUS_PROMPTS.filter((p) => {
    if (filterOnlyMyProfile && userProfile) {
      const matchesProfile = p.targetProfiles
        ? p.targetProfiles.includes(userProfile.id)
        : true;
      if (!matchesProfile) return false;
    }
    const matchCategory = selectedCategory === 'tous' || p.category === selectedCategory;
    const matchSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleOpenPrompt = (prompt: AgrocampusPrompt) => {
    setActivePrompt(prompt);
    const initialVals: Record<string, string> = {};
    prompt.variables.forEach((v) => {
      initialVals[v.key] = v.defaultValue;
    });
    setVariableValues(initialVals);
  };

  const computeSubstitutedText = (prompt: AgrocampusPrompt): string => {
    let result = prompt.template;
    prompt.variables.forEach((v) => {
      const val = variableValues[v.key] ?? v.defaultValue;
      result = result.replaceAll(`[${v.key}]`, val);
    });
    return result;
  };

  const handleCopySubstituted = () => {
    if (!activePrompt) return;
    const text = computeSubstitutedText(activePrompt);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunch = () => {
    if (!activePrompt) return;
    const text = computeSubstitutedText(activePrompt);
    onExecutePrompt(text, activePrompt.systemPrompt);
    setActivePrompt(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Bibliothèque de Gabarits Métier Albert
            </h1>
            {userProfile && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${userProfile.colorScheme.bgLight} ${userProfile.colorScheme.textDark} ${userProfile.colorScheme.border}`}>
                {userProfile.shortLabel}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Gabarits d’ingénierie d’invites rédigés et validés pour l’enseignement général, technique et agricole,
            l’exploitation péri-urbaine, l’administration et les services régionaux.
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un gabarit..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
          />
        </div>
      </div>

      {/* Bandeau de filtrage par profil métier */}
      {userProfile && (
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-800">
              Espace actif : <span className="text-blue-700 font-bold">{userProfile.label}</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-mono text-[11px]">
              {filteredPrompts.length} gabarit(s) affiché(s)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterOnlyMyProfile(!filterOnlyMyProfile)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                filterOnlyMyProfile
                  ? 'bg-blue-50 border-blue-200 text-blue-800 font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>
                {filterOnlyMyProfile
                  ? `Filtré pour ${userProfile.shortLabel}`
                  : 'Afficher tous les profils de l’Agrocampus'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Filtres par catégorie */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-xs">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-blue-700 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grille des gabarits */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPrompts.map((p) => {
          const isTargetForCurrentProfile =
            userProfile && p.targetProfiles?.includes(userProfile.id);

          return (
            <div
              key={p.id}
              onClick={() => handleOpenPrompt(p)}
              className={`group bg-white border rounded-xl p-5 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between ${
                isTargetForCurrentProfile ? 'border-blue-200/90' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2 text-xs text-slate-500 font-mono">
                  <span className="truncate max-w-[180px]">{p.tag}</span>
                  <span>{p.variables.length} paramètre(s)</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2">
                    {p.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {p.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                {isTargetForCurrentProfile ? (
                  <span className="text-[11px] font-semibold text-blue-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Recommandé pour vous</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 font-mono">
                    {p.category}
                  </span>
                )}
                <span className="text-blue-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-medium">
                  <span>Configurer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPrompts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-6">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">Aucun gabarit trouvé</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Essayez de désactiver le filtre de profil métier ou de réinitialiser la recherche pour voir tous les gabarits.
          </p>
          {filterOnlyMyProfile && (
            <button
              onClick={() => setFilterOnlyMyProfile(false)}
              className="mt-4 px-4 py-1.5 text-xs bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-medium transition-colors cursor-pointer"
            >
              Afficher tous les gabarits de l'établissement
            </button>
          )}
        </div>
      )}

      {/* Modal de configuration du gabarit */}
      {activePrompt && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActivePrompt(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Entête modal */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between gap-4 bg-slate-50">
              <div>
                <span className="text-[11px] font-mono font-semibold text-blue-700 uppercase tracking-wider block">
                  {activePrompt.tag}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                  {activePrompt.title}
                </h2>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {activePrompt.description}
                </p>
              </div>
              <button
                onClick={() => setActivePrompt(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
                title="Fermer"
              >
                ✕
              </button>
            </div>

            {/* Corps modal : Variables à remplir */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Paramètres du prompt personnalisé ({activePrompt.variables.length})
              </h3>

              <div className="space-y-3">
                {activePrompt.variables.map((v) => (
                  <div key={v.key} className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      {v.label}
                    </label>
                    <input
                      type="text"
                      value={variableValues[v.key] ?? v.defaultValue}
                      onChange={(e) =>
                        setVariableValues({
                          ...variableValues,
                          [v.key]: e.target.value,
                        })
                      }
                      placeholder={v.placeholder}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800"
                    />
                  </div>
                ))}
              </div>

              {/* Aperçu du texte généré */}
              <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Aperçu de l'instruction envoyée à Albert DINUM
                  </span>
                  <button
                    onClick={handleCopySubstituted}
                    className="text-xs text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copié</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copier</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="whitespace-pre-wrap font-mono text-[11px] bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700 max-h-48 overflow-y-auto leading-relaxed select-text">
                  {computeSubstitutedText(activePrompt)}
                </pre>
              </div>
            </div>

            {/* Pied modal */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => setActivePrompt(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleLaunch}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ouvrir dans le Studio Chat</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
