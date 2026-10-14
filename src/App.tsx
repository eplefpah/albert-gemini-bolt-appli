import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ChatStudio } from './components/ChatStudio';
import { AgrocampusHub } from './components/AgrocampusHub';
import { PromptsLibrary } from './components/PromptsLibrary';
import { RagSearch } from './components/RagSearch';
import { AudioTranscriptionStudio } from './components/AudioTranscriptionStudio';
import { ApiDiagnostics } from './components/ApiDiagnostics';
import { SettingsModal } from './components/SettingsModal';
import { AgentGuideStudio } from './components/AgentGuideStudio';
import {
  AlbertModel,
  ApiHealthStatus,
  ConversationSession,
  RagDocument,
  UserSettings,
  UserProfileId,
} from './types';
import { USER_PROFILES, DEFAULT_USER_PROFILE_ID } from './data/userProfiles';
import { getAlbertModels, testAlbertConnection } from './services/albertApi';
import {
  loadLocalSessions,
  upsertLocalSession,
  deleteLocalSession,
  loadUserSettings,
  saveUserSettings,
  exportSessionsToJson,
} from './services/storageService';

export default function App() {
  const [currentTab, setCurrentTab] = useState<
    'chat' | 'agrocampus' | 'prompts' | 'rag' | 'audio' | 'diagnostics' | 'guide'
  >('chat');

  // Gestion du profil métier persistant
  const [userProfileId, setUserProfileId] = useState<UserProfileId>(() => {
    const saved = localStorage.getItem('agrocampus_active_profile');
    if (saved && USER_PROFILES[saved as UserProfileId]) {
      return saved as UserProfileId;
    }
    return DEFAULT_USER_PROFILE_ID;
  });

  const activeProfile = USER_PROFILES[userProfileId] || USER_PROFILES[DEFAULT_USER_PROFILE_ID];

  const handleSelectProfile = (id: UserProfileId) => {
    setUserProfileId(id);
    localStorage.setItem('agrocampus_active_profile', id);
  };

  const [settings, setSettings] = useState<UserSettings>(loadUserSettings);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const [models, setModels] = useState<AlbertModel[]>([]);
  const [sessions, setSessions] = useState<ConversationSession[]>(() => {
    const loaded = loadLocalSessions();
    if (loaded && loaded.length > 0) return loaded;
    const initialSession: ConversationSession = {
      id: 'session_' + Date.now(),
      title: 'Accueil & Échange Albert',
      model: 'ministral-3-8b-instruct-2512',
      systemPrompt: activeProfile.defaultSystemPrompt,
      temperature: 0.3,
      maxTokens: 2048,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    upsertLocalSession(initialSession);
    return [initialSession];
  });
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    () => (sessions[0]?.id || null)
  );
  const [pendingPrompt, setPendingPrompt] = useState<{
    text: string;
    systemPrompt?: string;
  } | null>(null);
  const [health, setHealth] = useState<ApiHealthStatus | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Charger les modèles réels d'Albert DINUM
  const refreshModels = async (key: string = settingsRef.current.albertApiKey) => {
    const list = await getAlbertModels(key);
    setModels(list);
  };

  // Contrôler la connexion à Albert (via le proxy api/albert.php)
  const refreshHealth = async (key: string = settingsRef.current.albertApiKey) => {
    const res = await testAlbertConnection(key);
    setHealth({
      status: res.ok ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      albert: {
        connected: res.ok,
        latencyMs: res.latencyMs,
        endpoint: 'api/albert.php',
        modelsCount: res.modelsCount,
        error: res.error,
      },
    });
  };

  useEffect(() => {
    refreshModels();
    refreshHealth();

    const interval = setInterval(() => {
      refreshHealth();
    }, 45000);

    return () => clearInterval(interval);
  }, []);

  // Création d'une nouvelle session
  const handleCreateSession = (
    initialMessage?: string,
    systemPrompt?: string
  ): ConversationSession => {
    const newSession: ConversationSession = {
      id: 'session_' + Date.now(),
      title: initialMessage
        ? initialMessage.slice(0, 36) + (initialMessage.length > 36 ? '...' : '')
        : `Échange · ${activeProfile.shortLabel}`,
      model: settings.defaultModel || models[0]?.id || 'ministral-3-8b-instruct-2512',
      systemPrompt: systemPrompt || activeProfile.defaultSystemPrompt,
      temperature: settings.temperature,
      maxTokens: settings.maxTokens,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };

    const updated = upsertLocalSession(newSession);
    setSessions(updated);
    setActiveSessionId(newSession.id);
    return newSession;
  };

  // Mise à jour d'une session
  const handleUpdateSession = (session: ConversationSession) => {
    const updated = upsertLocalSession(session);
    setSessions(updated);
  };

  // Suppression d'une session
  const handleDeleteSession = (id: string) => {
    const updated = deleteLocalSession(id);
    setSessions(updated);
    if (activeSessionId === id) {
      setActiveSessionId(updated[0]?.id || null);
    }
  };

  // Exécution d'un gabarit ou prompt depuis un autre onglet
  const handleExecutePromptFromOtherTab = (
    promptText: string,
    systemPrompt?: string
  ) => {
    handleCreateSession(promptText, systemPrompt);
    setPendingPrompt({ text: promptText, systemPrompt });
    setCurrentTab('chat');
  };

  // Injection d'un document RAG dans une question pour Albert
  const handleInjectRagIntoChat = (doc: RagDocument) => {
    const prompt = `Voici un texte de référence (${doc.source}) :
"""
${doc.text}
"""

Peux-tu m'expliquer précisément comment cette réglementation ou ces dispositions s'appliquent à nos missions à l'Agrocampus Saint-Germain-en-Laye ?`;

    handleExecutePromptFromOtherTab(
      prompt,
      activeProfile.defaultSystemPrompt
    );
  };

  // Sauvegarde des paramètres
  const handleSaveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    saveUserSettings(newSettings);
    refreshModels(newSettings.albertApiKey);
    refreshHealth(newSettings.albertApiKey);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        health={health}
        onRefreshHealth={() => refreshHealth()}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onExportSessions={() => exportSessionsToJson(sessions)}
        userProfile={activeProfile}
        onSelectProfile={handleSelectProfile}
      />

      <div className="flex-1 flex flex-col">
        {currentTab === 'chat' && (
          <ChatStudio
            models={models}
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={setActiveSessionId}
            onCreateSession={handleCreateSession}
            onUpdateSession={handleUpdateSession}
            onDeleteSession={handleDeleteSession}
            settings={settings}
            pendingPrompt={pendingPrompt}
            onClearPendingPrompt={() => setPendingPrompt(null)}
            userProfile={activeProfile}
          />
        )}

        {currentTab === 'agrocampus' && (
          <AgrocampusHub
            onExecutePrompt={handleExecutePromptFromOtherTab}
            userProfile={activeProfile}
            onOpenGuide={() => setCurrentTab('guide')}
          />
        )}

        {currentTab === 'prompts' && (
          <PromptsLibrary
            onExecutePrompt={handleExecutePromptFromOtherTab}
            userProfile={activeProfile}
          />
        )}

        {currentTab === 'rag' && (
          <RagSearch
            onInjectIntoChat={handleInjectRagIntoChat}
            settings={settings}
            userProfile={activeProfile}
          />
        )}

        {currentTab === 'audio' && (
          <AudioTranscriptionStudio
            settings={settings}
            onSendToChat={handleExecutePromptFromOtherTab}
          />
        )}

        {currentTab === 'diagnostics' && (
          <ApiDiagnostics
            models={models}
            health={health}
            settings={settings}
            onRefreshHealth={() => refreshHealth()}
          />
        )}

        {currentTab === 'guide' && (
          <AgentGuideStudio
            onExecutePrompt={handleExecutePromptFromOtherTab}
            onSelectTab={setCurrentTab}
            userProfile={activeProfile}
          />
        )}
      </div>

      {isSettingsOpen && (
        <SettingsModal
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onSaveSettings={handleSaveSettings}
        />
      )}
    </div>
  );
}
