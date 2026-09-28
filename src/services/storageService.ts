import { ConversationSession, UserSettings } from '../types';

const STORAGE_KEY_SESSIONS = 'albert_agrocampus_sessions_v1';
const STORAGE_KEY_SETTINGS = 'albert_agrocampus_settings_v2';
// Anciens paramètres (contenaient une clé API et des accès Supabase) : on n'en reprend que les réglages du modèle.
const LEGACY_STORAGE_KEY_SETTINGS = 'albert_agrocampus_settings_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  // Vide = la clé configurée sur le serveur (api/config.php) est utilisée.
  albertApiKey: '',
  defaultModel: 'ministral-3-8b-instruct-2512',
  temperature: 0.7,
  maxTokens: 2048,
};

// --- GESTION DES PARAMÈTRES UTILISATEUR ---
export function loadUserSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };

    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY_SETTINGS);
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw);
      const migrated: UserSettings = {
        ...DEFAULT_SETTINGS,
        defaultModel: legacy.defaultModel || DEFAULT_SETTINGS.defaultModel,
        temperature: legacy.temperature ?? DEFAULT_SETTINGS.temperature,
        maxTokens: legacy.maxTokens ?? DEFAULT_SETTINGS.maxTokens,
      };
      saveUserSettings(migrated);
      localStorage.removeItem(LEGACY_STORAGE_KEY_SETTINGS);
      return migrated;
    }
    return DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveUserSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Erreur sauvegarde paramètres', err);
  }
}

// --- GESTION DES CONVERSATIONS LOCALES ---
export function loadLocalSessions(): ConversationSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((s) => ({
      ...s,
      messages: Array.isArray(s?.messages) ? s.messages : [],
    }));
  } catch {
    return [];
  }
}

export function saveLocalSessions(sessions: ConversationSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  } catch (err) {
    console.error('Erreur sauvegarde sessions locales', err);
  }
}

export function upsertLocalSession(session: ConversationSession): ConversationSession[] {
  const current = loadLocalSessions();
  const existingIdx = current.findIndex((s) => s.id === session.id);
  let updated: ConversationSession[];

  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = { ...session, updatedAt: Date.now() };
  } else {
    updated = [session, ...current];
  }

  saveLocalSessions(updated);
  return updated;
}

export function deleteLocalSession(sessionId: string): ConversationSession[] {
  const current = loadLocalSessions();
  const updated = current.filter((s) => s.id !== sessionId);
  saveLocalSessions(updated);
  return updated;
}

// --- SAUVEGARDE DES CONVERSATIONS (fichier JSON) ---
export function exportSessionsToJson(sessions: ConversationSession[]): void {
  const payload = {
    metadonnees: {
      plateforme: 'Albert DINUM · Agrocampus Saint-Germain-en-Laye',
      date_export: new Date().toISOString(),
      nombre_conversations: sessions.length,
      version: '2.0.0',
    },
    conversations: sessions,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `albert_agrocampus_conversations_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportSingleSessionMarkdown(session: ConversationSession): void {
  let md = `# ${session.title}\n\n`;
  md += `- **Date** : ${new Date(session.createdAt).toLocaleString('fr-FR')}\n`;
  md += `- **Modèle Albert** : \`${session.model}\`\n`;
  md += `- **Contexte** : Agrocampus Saint-Germain-en-Laye / Établissement Public Agricole\n\n`;
  if (session.systemPrompt) {
    md += `> **Consigne système** : ${session.systemPrompt}\n\n`;
  }
  md += `---\n\n`;

  for (const m of (session.messages || [])) {
    const roleLabel = m.role === 'user' ? '👤 Vous' : '🏛️ Albert DINUM';
    md += `### ${roleLabel} (${new Date(m.timestamp).toLocaleTimeString('fr-FR')})\n\n`;
    md += `${m.content}\n\n`;
    if (m.tokens || m.latencyMs) {
      md += `*${m.tokens || 0} jetons · ${m.latencyMs || 0} ms*\n\n`;
    }
  }

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${session.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
