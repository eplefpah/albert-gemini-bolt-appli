import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Sprout,
  BookOpen,
  Search,
  Mic,
  Activity,
  Settings,
  Download,
  GraduationCap,
  Briefcase,
  Building2,
  Users,
  Wrench,
  ChevronDown,
  Check,
  Sparkles,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';
import { ApiHealthStatus, UserProfileConfig, UserProfileId } from '../types';
import { USER_PROFILES_LIST } from '../data/userProfiles';

interface HeaderProps {
  currentTab: 'chat' | 'agrocampus' | 'prompts' | 'rag' | 'audio' | 'diagnostics' | 'guide';
  onSelectTab: (tab: 'chat' | 'agrocampus' | 'prompts' | 'rag' | 'audio' | 'diagnostics' | 'guide') => void;
  health: ApiHealthStatus | null;
  onRefreshHealth: () => void;
  onOpenSettings: () => void;
  onExportSessions: () => void;
  userProfile: UserProfileConfig;
  onSelectProfile: (profileId: UserProfileId) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  health,
  onOpenSettings,
  onExportSessions,
  userProfile,
  onSelectProfile,
}) => {
  const albertOk = health?.albert.connected ?? true;

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const toolsMenuRef = useRef<HTMLDivElement>(null);

  // Fermer les menus déroulants au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setIsProfileMenuOpen(false);
      }
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(target)) {
        setIsToolsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Rendu de l'icône de profil
  const renderProfileIcon = (iconName: string, className = 'w-4 h-4') => {
    switch (iconName) {
      case 'GraduationCap':
        return <GraduationCap className={className} />;
      case 'Briefcase':
        return <Briefcase className={className} />;
      case 'Sprout':
        return <Sprout className={className} />;
      case 'Building2':
        return <Building2 className={className} />;
      case 'Users':
        return <Users className={className} />;
      case 'Wrench':
        return <Wrench className={className} />;
      default:
        return <GraduationCap className={className} />;
    }
  };

  const isToolActive = currentTab === 'audio' || currentTab === 'diagnostics';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 gap-2 sm:gap-4">
          {/* Zone 1 : Marque & Sélecteur de profil métier persistant */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-xs border border-blue-800 shrink-0">
              <span className="text-white text-xs font-semibold tracking-tighter">AL</span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight text-slate-900">
                  Albert DINUM
                </span>
                <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                  Agrocampus
                </span>
              </div>
              <span className="hidden 2xl:inline text-[10px] text-slate-400 font-medium">
                Saint-Germain-en-Laye
              </span>
            </div>

            {/* Sélecteur de profil métier persistant */}
            <div className="relative ml-1" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-xs font-medium transition-all shadow-2xs cursor-pointer ${userProfile.colorScheme.bgLight} ${userProfile.colorScheme.border} hover:opacity-90`}
                title="Changer de profil métier"
              >
                <span className={userProfile.colorScheme.textDark}>
                  {renderProfileIcon(userProfile.iconName, 'w-3.5 h-3.5')}
                </span>
                <span
                  className={`font-semibold ${userProfile.colorScheme.textDark} max-w-[95px] sm:max-w-[130px] lg:max-w-[150px] truncate text-left`}
                >
                  {userProfile.shortLabel}
                </span>
                <ChevronDown
                  className={`w-3 h-3 text-slate-500 transition-transform ${
                    isProfileMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Menu déroulant des 6 profils métiers */}
              {isProfileMenuOpen && (
                <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in-50 zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>Espaces Métiers Agrocampus</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">6 profils</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                      Basculez selon vos missions pour adapter les prompts, les consignes et les documents.
                    </p>
                  </div>

                  <div className="space-y-1 max-h-[70vh] overflow-y-auto p-0.5">
                    {USER_PROFILES_LIST.map((p) => {
                      const isSelected = p.id === userProfile.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            onSelectProfile(p.id);
                            setIsProfileMenuOpen(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex items-start gap-2.5 cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50/90 border border-blue-200 shadow-2xs'
                              : 'hover:bg-slate-50 border border-transparent'
                          }`}
                        >
                          <div
                            className={`p-2 rounded-lg shrink-0 mt-0.5 ${p.colorScheme.bgLight} ${p.colorScheme.textDark}`}
                          >
                            {renderProfileIcon(p.iconName, 'w-4 h-4')}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span
                                className={`font-bold truncate ${
                                  isSelected ? 'text-blue-900' : 'text-slate-800'
                                }`}
                              >
                                {p.label}
                              </span>
                              {isSelected && (
                                <Check className="w-4 h-4 text-blue-700 shrink-0" />
                              )}
                            </div>
                            <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                              {p.roleTitle}
                            </span>
                            <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                              {p.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Zone 2 : Navigation principale compacte et épurée (Desktop lg+) */}
          <nav className="hidden lg:flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200/80">
            {/* 1. Chat */}
            <button
              onClick={() => onSelectTab('chat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                currentTab === 'chat'
                  ? 'bg-white text-blue-900 shadow-xs border border-slate-200/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-700" />
              <span>Chat</span>
            </button>

            {/* 2. Pôles Métiers (Agrocampus Hub) */}
            <button
              onClick={() => onSelectTab('agrocampus')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                currentTab === 'agrocampus'
                  ? 'bg-white text-blue-900 shadow-xs border border-slate-200/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Sprout className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pôles Métiers</span>
            </button>

            {/* 3. Gabarits */}
            <button
              onClick={() => onSelectTab('prompts')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                currentTab === 'prompts'
                  ? 'bg-white text-blue-900 shadow-xs border border-slate-200/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Gabarits</span>
            </button>

            {/* 4. Documents (RAG) */}
            <button
              onClick={() => onSelectTab('rag')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                currentTab === 'rag'
                  ? 'bg-white text-blue-900 shadow-xs border border-slate-200/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-slate-700" />
              <span>Documents</span>
            </button>

            {/* 5. Menu déroulant Outils (Audio & Diagnostics) */}
            <div className="relative" ref={toolsMenuRef}>
              <button
                type="button"
                onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  isToolActive
                    ? 'bg-white text-blue-900 shadow-xs border border-slate-200/80 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
                title="Outils complémentaires : transcription vocale, inspecteur API, export"
              >
                {currentTab === 'audio' ? (
                  <>
                    <Mic className="w-3.5 h-3.5 text-amber-600" />
                    <span>Audio</span>
                  </>
                ) : currentTab === 'diagnostics' ? (
                  <>
                    <Activity className="w-3.5 h-3.5 text-blue-600" />
                    <span>API</span>
                  </>
                ) : (
                  <>
                    <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                    <span>Outils</span>
                  </>
                )}
                <ChevronDown
                  className={`w-3 h-3 text-slate-400 transition-transform ${
                    isToolsMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Menu des outils */}
              {isToolsMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50 animate-in fade-in-50 zoom-in-95 duration-100">
                  <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Outils & Diagnostics
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('audio');
                      setIsToolsMenuOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center gap-2.5 cursor-pointer ${
                      currentTab === 'audio'
                        ? 'bg-amber-50 text-amber-950 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="p-1.5 rounded-md bg-amber-100 text-amber-800">
                      <Mic className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block font-medium">Transcription Vocale</span>
                      <span className="text-[10px] text-slate-400">Audio, dictée & synthèses</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('diagnostics');
                      setIsToolsMenuOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center gap-2.5 cursor-pointer ${
                      currentTab === 'diagnostics'
                        ? 'bg-blue-50 text-blue-950 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="p-1.5 rounded-md bg-blue-100 text-blue-800">
                      <Activity className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block font-medium">Inspecteur API</span>
                      <span className="text-[10px] text-slate-400">Santé Albert & connectivité</span>
                    </div>
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    type="button"
                    onClick={() => {
                      onExportSessions();
                      setIsToolsMenuOpen(false);
                    }}
                    className="w-full text-left p-2 rounded-lg text-xs hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-2.5 cursor-pointer"
                  >
                    <div className="p-1.5 rounded-md bg-slate-100 text-slate-600">
                      <Download className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block font-medium">Exporter les conversations</span>
                      <span className="text-[10px] text-slate-400">Sauvegarde au format JSON</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Zone 3 : Actions rapides & Accès Guide */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Bouton Guide & Kit valorisé */}
            <button
              onClick={() => onSelectTab('guide')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs whitespace-nowrap ${
                currentTab === 'guide'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-blue-50/90 text-blue-800 hover:bg-blue-100 border border-blue-200'
              }`}
              title="Fiche pratique, tutoriel en 5 minutes et kit de communication"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Guide & Kit</span>
              <span className="sm:hidden">Guide</span>
            </button>

            {/* Statut de connexion compact */}
            <div className="hidden xl:flex items-center gap-2 px-2 py-1 bg-slate-100 rounded-md border border-slate-200 text-[11px] font-mono tabular-nums text-slate-600">
              <div
                className="flex items-center gap-1"
                title={`Albert DINUM API: ${albertOk ? 'Opérationnel' : health?.albert.error || 'Hors-ligne'}`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${albertOk ? 'bg-emerald-500' : 'bg-red-500'}`}
                />
                <span className="text-[10px]">Albert</span>
              </div>
            </div>

            {/* Bouton Paramètres */}
            <button
              onClick={onOpenSettings}
              className="p-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              title="Paramètres API & Connexions"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Barre de navigation secondaire pour tablettes et mobiles (< lg) */}
        <div className="flex lg:hidden items-center py-1.5 border-t border-slate-200 text-xs overflow-x-auto gap-1">
          <button
            onClick={() => onSelectTab('chat')}
            className={`py-1 px-2.5 rounded-md font-medium shrink-0 cursor-pointer ${
              currentTab === 'chat'
                ? 'font-bold text-blue-700 bg-blue-50 border border-blue-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => onSelectTab('agrocampus')}
            className={`py-1 px-2.5 rounded-md font-medium shrink-0 cursor-pointer ${
              currentTab === 'agrocampus'
                ? 'font-bold text-blue-700 bg-blue-50 border border-blue-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Pôles
          </button>
          <button
            onClick={() => onSelectTab('prompts')}
            className={`py-1 px-2.5 rounded-md font-medium shrink-0 cursor-pointer ${
              currentTab === 'prompts'
                ? 'font-bold text-blue-700 bg-blue-50 border border-blue-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Gabarits
          </button>
          <button
            onClick={() => onSelectTab('rag')}
            className={`py-1 px-2.5 rounded-md font-medium shrink-0 cursor-pointer ${
              currentTab === 'rag'
                ? 'font-bold text-blue-700 bg-blue-50 border border-blue-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Documents
          </button>
          <button
            onClick={() => onSelectTab('audio')}
            className={`py-1 px-2.5 rounded-md font-medium shrink-0 cursor-pointer ${
              currentTab === 'audio'
                ? 'font-bold text-amber-700 bg-amber-50 border border-amber-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Audio
          </button>
          <button
            onClick={() => onSelectTab('diagnostics')}
            className={`py-1 px-2.5 rounded-md font-medium shrink-0 cursor-pointer ${
              currentTab === 'diagnostics'
                ? 'font-bold text-blue-700 bg-blue-50 border border-blue-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            API
          </button>
          <button
            onClick={() => onSelectTab('guide')}
            className={`py-1 px-2.5 rounded-md font-bold shrink-0 cursor-pointer ${
              currentTab === 'guide'
                ? 'text-white bg-blue-600'
                : 'text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100'
            }`}
          >
            Guide
          </button>
        </div>
      </div>
    </header>
  );
};
