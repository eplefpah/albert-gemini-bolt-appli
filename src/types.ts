export interface AlbertModel {
  id: string;
  type?: string;
  aliases?: string[];
  owned_by?: string;
  max_context_length?: number | null;
  created?: number;
}

export interface AttachedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string;
  charCount: number;
  wordCount: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  model?: string;
  tokens?: number;
  latencyMs?: number;
  carbonKwh?: number;
  carbonCo2?: number;
  isStreaming?: boolean;
  attachedDocs?: AttachedDocument[];
}

export interface ConversationSession {
  id: string;
  title: string;
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  isSyncedSupabase?: boolean;
  category?: 'agrocampus' | 'pedagogie' | 'exploitation' | 'general';
}

export type UserProfileId =
  | 'enseignant'
  | 'formateur'
  | 'exploitation'
  | 'administration'
  | 'viescolaire'
  | 'technique_idf';

export interface UserProfileConfig {
  id: UserProfileId;
  label: string;
  shortLabel: string;
  roleTitle: string;
  description: string;
  badge: string;
  iconName: string;
  colorScheme: {
    bgLight: string;
    textDark: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    accent: string;
  };
  defaultSystemPrompt: string;
  quickPrompts: string[];
  suggestedRagTags: string[];
  promptCategories: string[];
}

export interface PromptVariable {
  key: string;
  label: string;
  defaultValue: string;
  placeholder: string;
  options?: string[];
}

export interface AgrocampusPrompt {
  id: string;
  category: 'exploitation' | 'pedagogie' | 'reglementation' | 'administration' | 'circuits_courts' | 'viescolaire' | 'technique' | 'general_lycee';
  targetProfiles?: UserProfileId[];
  title: string;
  description: string;
  tag: string;
  systemPrompt?: string;
  template: string;
  variables: PromptVariable[];
}

export interface RagDocument {
  id: string;
  title: string;
  source: string;
  text: string;
  score: number;
  date?: string;
  url?: string;
  tags?: string[];
}

export interface ApiHealthStatus {
  status: string;
  timestamp: string;
  albert: {
    connected: boolean;
    latencyMs: number;
    endpoint: string;
  };
  supabase: {
    connected: boolean;
    latencyMs: number;
    url: string;
  };
}

export interface UserSettings {
  albertApiKey: string;
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  supabaseUrl: string;
  supabaseUser: string;
  supabasePass: string;
  autoSync: boolean;
}

export interface AudioTranscriptionResult {
  id: string;
  text: string;
  model: string;
  duration?: number | null;
  language?: string | null;
  segments?: Array<{
    id: number;
    start: number;
    end: number;
    text: string;
    speaker?: string;
  }> | null;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    impacts?: {
      kWh?: number;
      kgCO2eq?: number;
    };
  };
  filename?: string;
  timestamp: number;
}

export interface AlbertCollection {
  id: number;
  name: string;
  description?: string;
  visibility?: 'public' | 'private';
  documents?: number;
  size?: number;
  created?: number;
  updated?: number;
  owner?: number;
}

export interface AlbertDocumentItem {
  id: number;
  name: string;
  collection_id?: number;
  created?: number;
  chunks_count?: number;
}
