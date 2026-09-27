import { ConversationSession, UserSettings } from '../types';

const STORAGE_KEY_SESSIONS = 'albert_agrocampus_sessions_v1';
const STORAGE_KEY_SETTINGS = 'albert_agrocampus_settings_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  albertApiKey:
    'sk-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxNzQ1NCwidG9rZW5faWQiOjYyOTI1LCJleHBpcmVzIjoxODIxNzM2ODAwfQ.7P1delg6j--1zjiSTy4jAC1t2hHNL_ZFWJDswZCUs50',
  defaultModel: 'ministral-3-8b-instruct-2512',
  temperature: 0.7,
  maxTokens: 2048,
  supabaseUrl: 'http://185.219.215.120:8007',
  supabaseUser: 'supabase',
  supabasePass: '&1Supabase;',
  autoSync: true,
};

// --- GESTION DES PARAMÈTRES UTILISATEUR ---
export function loadUserSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
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

// --- SYNCHRONISATION SUPABASE ---
export async function syncSessionToSupabase(
  session: ConversationSession
): Promise<{ success: boolean; statusText: string }> {
  try {
    const resp = await fetch('/api/supabase/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session, storageType: 'dual' }),
    });

    if (!resp.ok) {
      return { success: false, statusText: `Erreur HTTP ${resp.status}` };
    }

    const data = await resp.json();
    return {
      success: true,
      statusText: data.remoteSyncStatus === 'supabase_stored'
        ? 'Enregistré sur Supabase'
        : 'Sauvegardé dans le tampon serveur sécurisé',
    };
  } catch (err: any) {
    return { success: false, statusText: err.message || 'Échec synchronisation' };
  }
}

export async function testSupabaseConnection(
  url?: string,
  user?: string,
  pass?: string
): Promise<{
  connected: boolean;
  statusCode: number;
  latencyMs: number;
  authenticated: boolean;
  error?: string;
}> {
  try {
    const params = new URLSearchParams();
    if (url) params.append('url', url);
    if (user) params.append('user', user);
    if (pass) params.append('pass', pass);

    const resp = await fetch(`/api/supabase/status?${params.toString()}`);
    if (!resp.ok) {
      return {
        connected: false,
        statusCode: resp.status,
        latencyMs: 0,
        authenticated: false,
        error: `Erreur serveur ${resp.status}`,
      };
    }
    return await resp.json();
  } catch (err: any) {
    return {
      connected: false,
      statusCode: 0,
      latencyMs: 0,
      authenticated: false,
      error: err.message || 'Serveur Supabase inaccessible',
    };
  }
}

// --- EXPORT COMPATIBLE IONOS /data/ ---
export function exportToIonosDataFile(sessions: ConversationSession[]): void {
  const payload = {
    metadonnees: {
      plateforme: 'Albert DINUM · Agrocampus Saint-Germain-en-Laye',
      dossier_destination: '/data/',
      date_export: new Date().toISOString(),
      nombre_conversations: sessions.length,
      version: '1.0.0',
    },
    conversations: sessions,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `albert_agrocampus_data_${new Date().toISOString().slice(0, 10)}.json`;
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
