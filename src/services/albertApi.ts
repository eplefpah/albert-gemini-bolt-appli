import { AlbertModel, ChatMessage, RagDocument } from '../types';
import { AGROCAMPUS_KNOWLEDGE_DOCS } from '../data/agrocampusKnowledge';
import { DEFAULT_SETTINGS } from './storageService';

const PROXY_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/albert-proxy`;

const DEFAULT_MODELS: AlbertModel[] = [
  {
    id: 'ministral-3-8b-instruct-2512',
    type: 'image-text-to-text',
    aliases: ['mistralai/Ministral-3-8B-Instruct-2512', 'openweight-small'],
    owned_by: 'Direction interministérielle du numérique (DINUM)',
    max_context_length: 262144,
  },
  {
    id: 'mistral-small-3-2-24b-instruct-2506',
    type: 'image-text-to-text',
    aliases: ['mistralai/Mistral-Small-3.2-24B-Instruct-2506', 'openweight-medium'],
    owned_by: 'Direction interministérielle du numérique (DINUM)',
    max_context_length: 128000,
  },
  {
    id: 'gpt-oss-120b',
    type: 'text-generation',
    aliases: ['openweight-large', 'openai/gpt-oss-120b'],
    owned_by: 'Direction interministérielle du numérique (DINUM)',
    max_context_length: 131072,
  },
  {
    id: 'qwen3-coder-30b-a3b-instruct',
    type: 'text-generation',
    aliases: ['openweight-code', 'Qwen/Qwen3-Coder-30B-A3B-Instruct'],
    owned_by: 'Direction interministérielle du numérique (DINUM)',
    max_context_length: 262144,
  },
  {
    id: 'gemma-4-31b-it',
    type: 'image-text-to-text',
    aliases: ['google/gemma-4-31B-it'],
    owned_by: 'Direction interministérielle du numérique (DINUM)',
    max_context_length: 262144,
  },
  {
    id: 'deepseek-v4-flash-0731',
    type: 'text-generation',
    aliases: ['deepseek-ai/DeepSeek-V4-Flash-0731'],
    owned_by: 'Direction interministérielle du numérique (DINUM)',
    max_context_length: 131072,
  },
];

function buildHeaders(customApiKey?: string, extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...extra };
  if (customApiKey) {
    headers['x-albert-key'] = customApiKey;
  }
  return headers;
}

export async function getAlbertModels(customApiKey?: string): Promise<AlbertModel[]> {
  try {
    const resp = await fetch(`${PROXY_BASE}/models`, {
      headers: buildHeaders(customApiKey),
    });
    if (!resp.ok) {
      return DEFAULT_MODELS;
    }
    const data = await resp.json();
    if (Array.isArray(data?.data) && data.data.length > 0) {
      const chatModels = data.data.filter(
        (m: any) =>
          m.type === 'text-generation' ||
          m.type === 'image-text-to-text' ||
          !m.type?.includes('embeddings')
      );
      return chatModels.length > 0 ? chatModels : data.data;
    }
    return DEFAULT_MODELS;
  } catch (err) {
    console.warn('[Albert API] Fallback sur les modèles par défaut', err);
    return DEFAULT_MODELS;
  }
}

export interface StreamCallbacks {
  onChunk: (text: string) => void;
  onUsage?: (usage: {
    tokens?: number;
    latencyMs?: number;
    carbonKwh?: number;
    carbonCo2?: number;
  }) => void;
  onError: (error: string) => void;
  onDone: () => void;
}

export async function streamAlbertChat(
  model: string,
  messages: Array<{ role: string; content: string }>,
  options: {
    temperature?: number;
    maxTokens?: number;
    customApiKey?: string;
  },
  callbacks: StreamCallbacks
): Promise<void> {
  const startTime = Date.now();
  try {
    const response = await fetch(`${PROXY_BASE}/chat/completions`, {
      method: 'POST',
      headers: buildHeaders(options.customApiKey, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      let errorMsg = `Erreur HTTP ${response.status}`;
      try {
        const parsed = JSON.parse(errBody);
        if (parsed.error?.message) errorMsg = parsed.error.message;
        else if (typeof parsed.error === 'string') errorMsg = parsed.error;
      } catch {
        errorMsg = errBody || errorMsg;
      }
      callbacks.onError(errorMsg);
      return;
    }

    if (!response.body) {
      callbacks.onError('Flux de réponse non disponible');
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let estimatedTokens = 0;
    let carbonKwh = 0;
    let carbonCo2 = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;

        if (trimmed.startsWith('data: ')) {
          try {
            const jsonStr = trimmed.slice(6);
            const parsed = JSON.parse(jsonStr);

            const deltaContent = parsed.choices?.[0]?.delta?.content;
            if (deltaContent) {
              callbacks.onChunk(deltaContent);
              estimatedTokens += Math.ceil(deltaContent.length / 4);
            }

            if (parsed.usage) {
              if (parsed.usage.completion_tokens) {
                estimatedTokens = parsed.usage.completion_tokens;
              }
              if (parsed.usage.carbon) {
                carbonKwh = parsed.usage.carbon.kWh?.min || parsed.usage.impacts?.kWh || 0;
                carbonCo2 = parsed.usage.carbon.kgCO2eq?.min || parsed.usage.impacts?.kgCO2eq || 0;
              }
            }
          } catch {
            // Ligne partielle ou non-JSON ignorée
          }
        }
      }
    }

    const latencyMs = Date.now() - startTime;
    callbacks.onUsage?.({
      tokens: estimatedTokens,
      latencyMs,
      carbonKwh: carbonKwh > 0 ? carbonKwh : estimatedTokens * 0.00000008,
      carbonCo2: carbonCo2 > 0 ? carbonCo2 : estimatedTokens * 0.0000000045,
    });
    callbacks.onDone();
  } catch (err: any) {
    callbacks.onError(err.message || "Erreur de connexion à l'API Albert");
  }
}

export async function searchRagCorpus(
  query: string,
  categoryFilter?: string,
  collectionIds?: number[]
): Promise<RagDocument[]> {
  const normalized = query.toLowerCase();
  const results: RagDocument[] = [];

  if (query.trim().length > 1) {
    try {
      const resp = await fetch(`${PROXY_BASE}/search`, {
        method: 'POST',
        headers: buildHeaders(DEFAULT_SETTINGS.albertApiKey, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          query: query.trim(),
          collections: collectionIds && collectionIds.length > 0 ? collectionIds : undefined,
          k: 6,
          method: 'semantic',
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        const items = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.results)
          ? data.results
          : [];

        for (const item of items) {
          const chunk = item.chunk || item;
          const meta = chunk.metadata || {};
          const title =
            meta.title ||
            meta.name ||
            meta.category ||
            (chunk.id !== undefined ? `Extrait officiel Albert #${chunk.id}` : 'Document Albert RAG');

          let sourceName = 'Corpus Albert DINUM';
          if (meta.types || meta.directory_url) sourceName = 'Annuaire des Services Publics';
          else if (meta.category === 'PROPOSITION_LOI' || meta.category === 'CODE') sourceName = 'Légifrance / Textes Officiels';
          else if (meta.source) sourceName = meta.source;

          results.push({
            id: `albert_${chunk.document_id || chunk.id || Math.random().toString(36).substring(7)}`,
            title,
            source: sourceName,
            text: chunk.content || chunk.text || '',
            score: item.score ? Math.round(item.score * 100) / 100 : 0.85,
            url: meta.directory_url || meta.url,
            date: meta.creation_date || meta.modification_date || undefined,
            tags: meta.types ? [meta.types] : (meta.category ? [meta.category] : ['Souverain DINUM']),
          });
        }
      }
    } catch (err) {
      console.log('[RAG] Fallback recherche locale Agrocampus', err);
    }
  }

  const tokens = normalized.split(/\s+/).filter((t) => t.length > 2);
  const scoredAgro = AGROCAMPUS_KNOWLEDGE_DOCS.map((doc) => {
    let matchCount = 0;
    const fullText = (doc.title + ' ' + doc.text + ' ' + (doc.tags || []).join(' ')).toLowerCase();
    for (const token of tokens) {
      if (fullText.includes(token)) matchCount += 1;
    }
    const calculatedScore =
      tokens.length > 0
        ? Math.min(0.98, Math.max(0.4, 0.4 + (matchCount / tokens.length) * 0.55))
        : doc.score;

    return {
      ...doc,
      score: Math.round(calculatedScore * 100) / 100,
    };
  });

  const agroFiltered = scoredAgro.filter((doc) => {
    if (categoryFilter && categoryFilter !== 'tous') {
      return doc.tags?.some((t) => t.toLowerCase() === categoryFilter.toLowerCase());
    }
    return true;
  });

  const allDocs = [...results, ...agroFiltered];
  return allDocs.sort((a, b) => b.score - a.score);
}

export async function testAlbertConnection(key?: string): Promise<{
  ok: boolean;
  latencyMs: number;
  modelsCount: number;
  error?: string;
}> {
  const start = Date.now();
  try {
    const resp = await fetch(`${PROXY_BASE}/models`, {
      headers: buildHeaders(key),
    });
    const latencyMs = Date.now() - start;

    if (!resp.ok) {
      const err = await resp.text();
      return { ok: false, latencyMs, modelsCount: 0, error: err };
    }

    const data = await resp.json();
    const count = Array.isArray(data?.data) ? data.data.length : 0;
    return { ok: true, latencyMs, modelsCount: count };
  } catch (err: any) {
    return {
      ok: false,
      latencyMs: Date.now() - start,
      modelsCount: 0,
      error: err.message || 'Hôte Albert inaccessible',
    };
  }
}

// --- TRANSCRIPTION AUDIO (Whisper Large V3) ---
export interface TranscribeAudioParams {
  audioBase64: string;
  fileName?: string;
  mimeType?: string;
  model?: string;
  language?: string;
  prompt?: string;
  response_format?: 'json' | 'text' | 'diarized_json' | 'srt' | 'vtt';
  temperature?: number;
  customApiKey?: string;
}

export async function transcribeAudio(
  params: TranscribeAudioParams
): Promise<{
  text: string;
  id?: string;
  model?: string;
  duration?: number | null;
  segments?: any[];
  usage?: any;
}> {
  const byteString = atob(params.audioBase64);
  const bytes = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) bytes[i] = byteString.charCodeAt(i);
  const blob = new Blob([bytes], { type: params.mimeType || 'audio/wav' });
  const formData = new FormData();
  formData.append('file', blob, params.fileName || 'recording.wav');
  formData.append('model', params.model || 'whisper-large-v3');
  if (params.language) formData.append('language', params.language);
  if (params.prompt) formData.append('prompt', params.prompt);
  if (params.response_format) formData.append('response_format', params.response_format);
  if (typeof params.temperature === 'number') formData.append('temperature', String(params.temperature));

  const resp = await fetch(`${PROXY_BASE}/audio/transcriptions`, {
    method: 'POST',
    headers: buildHeaders(params.customApiKey),
    body: formData,
  });

  if (!resp.ok) {
    const errText = await resp.text();
    let errorMsg = `Erreur HTTP ${resp.status}`;
    try {
      const parsed = JSON.parse(errText);
      if (parsed.error?.message) errorMsg = parsed.error.message;
      else if (parsed.error) errorMsg = parsed.error;
      else if (parsed.detail) errorMsg = JSON.stringify(parsed.detail);
    } catch {
      errorMsg = errText || errorMsg;
    }
    throw new Error(errorMsg);
  }

  const data = await resp.json();
  return {
    text: data.text || '',
    id: data.id,
    model: data.model || 'whisper-large-v3',
    duration: data.duration,
    segments: data.segments,
    usage: data.usage,
  };
}

// --- GESTION DES COLLECTIONS RAG ---
export async function getAlbertCollections(customApiKey?: string): Promise<any[]> {
  const resp = await fetch(`${PROXY_BASE}/collections?limit=100&offset=0`, {
    headers: buildHeaders(customApiKey),
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Erreur récupération collections: ${err}`);
  }
  const data = await resp.json();
  return Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
}

export async function createAlbertCollection(
  name: string,
  description?: string,
  customApiKey?: string
): Promise<{ id: number }> {
  const resp = await fetch(`${PROXY_BASE}/collections`, {
    method: 'POST',
    headers: buildHeaders(customApiKey, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ name, description }),
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Erreur création collection: ${err}`);
  }
  return await resp.json();
}

export async function deleteAlbertCollection(
  id: number,
  customApiKey?: string
): Promise<void> {
  const resp = await fetch(`${PROXY_BASE}/collections/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(customApiKey),
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Erreur suppression collection: ${err}`);
  }
}

// --- GESTION DES DOCUMENTS RAG ---
export async function getAlbertDocuments(
  collectionId?: number,
  customApiKey?: string
): Promise<any[]> {
  const url = collectionId
    ? `${PROXY_BASE}/documents?limit=50&collection_id=${collectionId}`
    : `${PROXY_BASE}/documents?limit=50`;

  const resp = await fetch(url, {
    headers: buildHeaders(customApiKey),
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Erreur récupération documents: ${err}`);
  }
  const data = await resp.json();
  return Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
}

export interface UploadDocumentParams {
  fileBase64: string;
  fileName: string;
  mimeType?: string;
  name?: string;
  collection_id: number;
  chunk_size?: number;
  chunk_overlap?: number;
  customApiKey?: string;
}

export async function uploadAlbertDocument(
  params: UploadDocumentParams
): Promise<{ id: number; name?: string }> {
  const byteString = atob(params.fileBase64);
  const bytes = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) bytes[i] = byteString.charCodeAt(i);
  const blob = new Blob([bytes], { type: params.mimeType || 'text/plain' });
  const formData = new FormData();
  formData.append('file', blob, params.fileName || 'document.txt');
  formData.append('collection_id', String(params.collection_id));
  if (params.name) formData.append('name', params.name);
  if (params.chunk_size) formData.append('chunk_size', String(params.chunk_size));
  if (params.chunk_overlap) formData.append('chunk_overlap', String(params.chunk_overlap));

  const resp = await fetch(`${PROXY_BASE}/documents`, {
    method: 'POST',
    headers: buildHeaders(params.customApiKey),
    body: formData,
  });

  if (!resp.ok) {
    const errText = await resp.text();
    let errorMsg = `Erreur HTTP ${resp.status}`;
    try {
      const parsed = JSON.parse(errText);
      if (parsed.error) errorMsg = parsed.error;
      else if (parsed.detail) errorMsg = JSON.stringify(parsed.detail);
    } catch {
      errorMsg = errText || errorMsg;
    }
    throw new Error(errorMsg);
  }

  return await resp.json();
}

export async function deleteAlbertDocument(
  id: number,
  customApiKey?: string
): Promise<void> {
  const resp = await fetch(`${PROXY_BASE}/documents/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(customApiKey),
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Erreur suppression document: ${err}`);
  }
}

// --- RECHERCHE OFFICIELLE SUR L'API ALBERT RAG ---
export async function searchAlbertOfficial(
  query: string,
  collectionIds: number[],
  limit: number = 5,
  customApiKey?: string
): Promise<RagDocument[]> {
  const resp = await fetch(`${PROXY_BASE}/search`, {
    method: 'POST',
    headers: buildHeaders(customApiKey, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      query,
      collection_ids: collectionIds,
      limit,
      method: 'semantic',
      score_threshold: 0,
    }),
  });

  if (!resp.ok) {
    throw new Error(`Erreur HTTP ${resp.status} lors de la recherche`);
  }

  const data = await resp.json();
  if (Array.isArray(data?.data)) {
    return data.data.map((item: any, idx: number) => ({
      id: `chunk_${item.chunk?.id || idx}_${Date.now()}`,
      title: item.chunk?.metadata?.title || `Extrait #${item.chunk?.id || idx + 1}`,
      source: item.chunk?.metadata?.theme || (item.chunk?.metadata?.url ? 'Légifrance / Service Public' : 'Corpus Albert'),
      text: item.chunk?.content || '',
      score: item.score ? Math.round(item.score * 100) / 100 : 0.85,
      url: item.chunk?.metadata?.url,
      date: item.created ? new Date(item.created * 1000).toLocaleDateString('fr-FR') : undefined,
      tags: item.chunk?.metadata?.audience ? [item.chunk.metadata.audience] : undefined,
    }));
  }

  return [];
}
