import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Square,
  Copy,
  Check,
  Download,
  Trash2,
  Plus,
  Sliders,
  ChevronDown,
  ChevronUp,
  CloudUpload,
  Cpu,
  Leaf,
  Clock,
  Sparkles,
  Bot,
  User,
  Code,
  Mic,
  Paperclip,
  FileText,
  X,
  Eye,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import {
  AlbertModel,
  ChatMessage,
  ConversationSession,
  UserSettings,
  AttachedDocument,
  UserProfileConfig,
} from '../types';
import { streamAlbertChat, transcribeAudio } from '../services/albertApi';
import {
  syncSessionToSupabase,
  exportSingleSessionMarkdown,
} from '../services/storageService';
import { parseDocumentFile, formatFileSize } from '../utils/documentParser';
import { MarkdownViewer } from './MarkdownViewer';

interface ChatStudioProps {
  models: AlbertModel[];
  sessions: ConversationSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onCreateSession: (initialMessage?: string, systemPrompt?: string) => ConversationSession;
  onUpdateSession: (session: ConversationSession) => void;
  onDeleteSession: (id: string) => void;
  settings: UserSettings;
  pendingPrompt?: { text: string; systemPrompt?: string } | null;
  onClearPendingPrompt?: () => void;
  userProfile?: UserProfileConfig;
}

export const ChatStudio: React.FC<ChatStudioProps> = ({
  models,
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onUpdateSession,
  onDeleteSession,
  settings,
  pendingPrompt,
  onClearPendingPrompt,
  userProfile,
}) => {
  const currentSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0] || null;

  const [inputMessage, setInputMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [rawModeMessageIds, setRawModeMessageIds] = useState<Record<string, boolean>>({});

  const toggleRawMode = (id: string) => {
    setRawModeMessageIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Gestion de l'import de documents texte pour interrogation par Albert
  const [attachedDocs, setAttachedDocs] = useState<AttachedDocument[]>([]);
  const [isReadingDocs, setIsReadingDocs] = useState(false);
  const [docUploadError, setDocUploadError] = useState<string | null>(null);
  const [docPreviewModal, setDocPreviewModal] = useState<AttachedDocument | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsReadingDocs(true);
    setDocUploadError(null);
    const newDocs: AttachedDocument[] = [];
    const errors: string[] = [];

    for (const file of Array.from(files)) {
      try {
        const parsed = await parseDocumentFile(file);
        if (!parsed.content || parsed.content.trim().length === 0) {
          errors.push(`Le fichier "${file.name}" ne contient aucun texte exploitable.`);
        } else {
          newDocs.push(parsed);
        }
      } catch (err: any) {
        errors.push(`Erreur sur "${file.name}" : ${err?.message || 'lecture impossible'}`);
      }
    }

    if (newDocs.length > 0) {
      setAttachedDocs((prev) => [...prev, ...newDocs]);
    }
    if (errors.length > 0) {
      setDocUploadError(errors.join(' '));
      setTimeout(() => setDocUploadError(null), 7000);
    }
    setIsReadingDocs(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleProcessFiles(e.target.files);
    }
  };

  const removeAttachedDoc = (id: string) => {
    setAttachedDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      handleProcessFiles(e.dataTransfer.files);
    }
  };

  // Dictée vocale directe dans le chat via Whisper Large V3
  const [isDictating, setIsDictating] = useState(false);
  const [isTranscribingVoice, setIsTranscribingVoice] = useState(false);
  const dictationRecorderRef = useRef<MediaRecorder | null>(null);
  const dictationChunksRef = useRef<Blob[]>([]);

  const handleToggleDictation = async () => {
    if (isDictating) {
      if (dictationRecorderRef.current && dictationRecorderRef.current.state !== 'inactive') {
        dictationRecorderRef.current.stop();
      }
      setIsDictating(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        dictationChunksRef.current = [];
        const mimeType = MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4';
        const recorder = new MediaRecorder(stream, { mimeType });

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            dictationChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = async () => {
          stream.getTracks().forEach((track) => track.stop());
          const finalBlob = new Blob(dictationChunksRef.current, { type: mimeType });
          setIsTranscribingVoice(true);
          try {
            const reader = new FileReader();
            reader.onloadend = async () => {
              try {
                const dataUrl = reader.result as string;
                const base64 = dataUrl.split(',')[1];
                const res = await transcribeAudio({
                  audioBase64: base64,
                  fileName: 'dictation.webm',
                  mimeType,
                  model: 'whisper-large-v3',
                  language: 'fr',
                  customApiKey: settings.albertApiKey,
                });
                if (res.text && res.text.trim()) {
                  setInputMessage((prev) =>
                    prev ? prev.trim() + ' ' + res.text.trim() : res.text.trim()
                  );
                }
              } catch (err: any) {
                console.error('Erreur transcription vocale chat:', err);
              } finally {
                setIsTranscribingVoice(false);
              }
            };
            reader.readAsDataURL(finalBlob);
          } catch {
            setIsTranscribingVoice(false);
          }
        };

        recorder.start(250);
        dictationRecorderRef.current = recorder;
        setIsDictating(true);
      } catch (err: any) {
        alert('Accès au microphone refusé ou non supporté : ' + (err.message || ''));
      }
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages, isStreaming]);

  useEffect(() => {
    if (pendingPrompt && pendingPrompt.text && !isStreaming) {
      const textToRun = pendingPrompt.text;
      onClearPendingPrompt?.();
      handleSendMessage(textToRun);
    }
  }, [pendingPrompt]);

  // Modèle actuel
  const selectedModelId = currentSession?.model || settings.defaultModel;

  const handleSendMessage = async (textToSend?: string) => {
    const rawText = textToSend !== undefined ? textToSend : inputMessage;
    const text = rawText.trim();
    const docsForThisMessage = [...attachedDocs];

    // Si pas de texte écrit mais des documents attachés, proposer un prompt d'analyse par défaut
    const finalText =
      text ||
      (docsForThisMessage.length > 0
        ? 'Veuillez analyser, synthétiser et extraire les informations clés du ou des documents joints ci-dessus.'
        : '');

    if (!finalText || isStreaming) return;

    let targetSession = currentSession;
    if (!targetSession) {
      targetSession = onCreateSession(finalText, userProfile?.defaultSystemPrompt);
    }

    const userMessage: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: finalText,
      timestamp: Date.now(),
      attachedDocs: docsForThisMessage.length > 0 ? docsForThisMessage : undefined,
    };

    const assistantPlaceholderId = 'msg_asst_' + Date.now();
    const assistantMessage: ChatMessage = {
      id: assistantPlaceholderId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      model: selectedModelId,
      isStreaming: true,
    };

    const existingMessages = Array.isArray(targetSession?.messages)
      ? targetSession.messages
      : [];
    const updatedMessages = [...existingMessages, userMessage, assistantMessage];

    const defaultTitle =
      docsForThisMessage.length > 0
        ? `Doc: ${docsForThisMessage[0].name.slice(0, 24)}...`
        : finalText.slice(0, 36) + (finalText.length > 36 ? '...' : '');

    const sessionWithNewMessages: ConversationSession = {
      ...targetSession,
      title: existingMessages.length === 0 ? defaultTitle : targetSession.title,
      messages: updatedMessages,
      updatedAt: Date.now(),
    };

    onUpdateSession(sessionWithNewMessages);
    setInputMessage('');
    setAttachedDocs([]); // Vider le panier de documents joints après envoi
    setIsStreaming(true);

    // Formater la conversation pour l'API Albert DINUM
    const apiMessages: Array<{ role: string; content: string }> = [];
    if (targetSession.systemPrompt) {
      apiMessages.push({ role: 'system', content: targetSession.systemPrompt });
    }
    existingMessages.forEach((m) => {
      if (m.role === 'user' && m.attachedDocs && m.attachedDocs.length > 0) {
        const pastDocsContext = m.attachedDocs
          .map(
            (doc, idx) =>
              `[DOCUMENT JOINT ${idx + 1} : "${doc.name}" (${formatFileSize(doc.size)})]\n${doc.content}\n[FIN DU DOCUMENT "${doc.name}"]`
          )
          .join('\n\n');
        apiMessages.push({
          role: m.role,
          content: `${pastDocsContext}\n\nQuestion de l'utilisateur :\n${m.content}`,
        });
      } else {
        apiMessages.push({ role: m.role, content: m.content });
      }
    });

    if (docsForThisMessage.length > 0) {
      const docsContext = docsForThisMessage
        .map(
          (doc, idx) =>
            `[DOCUMENT JOINT ${idx + 1} : "${doc.name}" (${formatFileSize(doc.size)} · ${doc.wordCount} mots)]\n${doc.content}\n[FIN DU DOCUMENT "${doc.name}"]`
        )
        .join('\n\n');

      const fullPromptWithDocs = `${docsContext}\n\n[CONSIGNE POUR ALBERT : Tu es un assistant expert pour l'enseignement agricole et Agrocampus. Réponds à la question suivante en t'appuyant rigoureusement sur le contenu du ou des documents joints ci-dessus. Si une réponse s'y trouve, cite-la ou reformule-la fidèlement. Si l'information est absente des documents joints, signale-le avec précision.]\n\nDemande de l'utilisateur :\n${finalText}`;

      apiMessages.push({ role: 'user', content: fullPromptWithDocs });
    } else {
      apiMessages.push({ role: 'user', content: finalText });
    }

    let accumulatedContent = '';

    await streamAlbertChat(
      selectedModelId,
      apiMessages,
      {
        temperature: targetSession.temperature ?? 0.3,
        maxTokens: targetSession.maxTokens ?? 2048,
        customApiKey: settings.albertApiKey,
      },
      {
        onChunk: (chunk) => {
          accumulatedContent += chunk;
          const currentMsgs = [...sessionWithNewMessages.messages];
          const lastIdx = currentMsgs.length - 1;
          if (lastIdx >= 0) {
            currentMsgs[lastIdx] = {
              ...currentMsgs[lastIdx],
              content: accumulatedContent,
              isStreaming: true,
            };
            onUpdateSession({
              ...sessionWithNewMessages,
              messages: currentMsgs,
              updatedAt: Date.now(),
            });
          }
        },
        onUsage: (usage) => {
          const currentMsgs = [...sessionWithNewMessages.messages];
          const lastIdx = currentMsgs.length - 1;
          if (lastIdx >= 0) {
            currentMsgs[lastIdx] = {
              ...currentMsgs[lastIdx],
              content: accumulatedContent,
              isStreaming: false,
              tokens: usage.tokens,
              latencyMs: usage.latencyMs,
              carbonKwh: usage.carbonKwh,
              carbonCo2: usage.carbonCo2,
            };
            const finalizedSession: ConversationSession = {
              ...sessionWithNewMessages,
              messages: currentMsgs,
              updatedAt: Date.now(),
            };
            onUpdateSession(finalizedSession);

            if (settings.autoSync) {
              syncSessionToSupabase(finalizedSession).then((res) => {
                if (res.success) {
                  setSyncStatus('Synchronisé');
                  setTimeout(() => setSyncStatus(null), 3000);
                }
              });
            }
          }
        },
        onError: (err) => {
          const currentMsgs = [...sessionWithNewMessages.messages];
          const lastIdx = currentMsgs.length - 1;
          if (lastIdx >= 0) {
            currentMsgs[lastIdx] = {
              ...currentMsgs[lastIdx],
              content: `⚠️ Erreur Albert DINUM : ${err}`,
              isStreaming: false,
            };
            onUpdateSession({
              ...sessionWithNewMessages,
              messages: currentMsgs,
            });
          }
          setIsStreaming(false);
        },
        onDone: () => {
          setIsStreaming(false);
        },
      }
    );
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleManualSync = async () => {
    if (!currentSession) return;
    setSyncStatus('En cours...');
    const res = await syncSessionToSupabase(currentSession);
    setSyncStatus(res.statusText);
    setTimeout(() => setSyncStatus(null), 3500);
  };

  const quickPrompts = userProfile?.quickPrompts || [
    'Conçois un plan de fertilisation bio pour carottes et poireaux en sol francilien.',
    'Rédige une fiche d’évaluation CCF pour élèves de Bac Pro Aménagements Paysagers.',
    'Quelles sont les restrictions d’arrosage pour le maraîchage lors d’un arrêté Crise sécheresse ?',
    'Rédige un message pour les riverains expliquant le travail matinal du sol sur la ferme.',
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-50 overflow-hidden">
      {/* Panneau latéral des sessions */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700">Conversations</span>
          <button
            onClick={() => onCreateSession(undefined, userProfile?.defaultSystemPrompt)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouveau</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.length === 0 ? (
            <div className="text-center py-8 px-4 text-xs text-slate-400">
              Aucune conversation archivée. Démarrez un échange avec Albert.
            </div>
          ) : (
            sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => onSelectSession(s.id)}
                className={`group flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                  s.id === currentSession?.id
                    ? 'bg-blue-50 text-blue-900 border border-blue-200/80 font-medium'
                    : 'text-slate-700 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="truncate">{s.title || 'Nouvel échange'}</span>
                  <span className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {new Date(s.updatedAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(s.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 rounded transition-opacity"
                  title="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Pied de liste : État et persistance */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-500">
          <span>{sessions.length} session(s) locale(s)</span>
          {syncStatus && (
            <span className="text-blue-700 font-medium">{syncStatus}</span>
          )}
        </div>
      </aside>

      {/* Zone Principale de Chat */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Barre d'outils supérieure de session */}
        <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Sélecteur de modèle Albert */}
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-700 shrink-0" />
              <select
                value={selectedModelId}
                onChange={(e) => {
                  if (currentSession) {
                    onUpdateSession({ ...currentSession, model: e.target.value });
                  }
                }}
                className="text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer max-w-[240px] truncate"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.id}
                  </option>
                ))}
              </select>
            </div>

            <span className="hidden sm:inline text-slate-300">|</span>

            {/* Titre & métadonnées sans pilule */}
            <span className="hidden sm:inline text-xs text-slate-500 truncate max-w-sm">
              {currentSession?.title || 'Nouvelle session Agrocampus'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Bouton Paramètres avancés de session */}
            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                showConfig
                  ? 'bg-blue-50 border-blue-200 text-blue-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Paramètres modèle</span>
              {showConfig ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>

            {/* Bouton export Markdown */}
            {currentSession && (currentSession.messages?.length || 0) > 0 && (
              <button
                onClick={() => exportSingleSessionMarkdown(currentSession)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
                title="Exporter cette conversation en Markdown"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Export .md</span>
              </button>
            )}

            {/* Bouton Synchroniser Supabase */}
            {currentSession && (
              <button
                onClick={handleManualSync}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
                title="Synchroniser vers votre instance Supabase (185.219.215.120:8007)"
              >
                <CloudUpload className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden md:inline">Sync Supabase</span>
              </button>
            )}
          </div>
        </div>

        {/* Volet déroulant de configuration du modèle */}
        {showConfig && currentSession && (
          <div className="bg-slate-100/90 border-b border-slate-200 p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Température : <span className="font-mono">{currentSession.temperature}</span>
              </label>
              <input
                type="range"
                min="0"
                max="1.2"
                step="0.05"
                value={currentSession.temperature}
                onChange={(e) =>
                  onUpdateSession({
                    ...currentSession,
                    temperature: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-blue-600"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                0 = Factuel & strict · 1 = Créatif
              </span>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Jetons max (Max Tokens) : <span className="font-mono">{currentSession.maxTokens}</span>
              </label>
              <input
                type="range"
                min="256"
                max="8192"
                step="256"
                value={currentSession.maxTokens}
                onChange={(e) =>
                  onUpdateSession({
                    ...currentSession,
                    maxTokens: parseInt(e.target.value, 10),
                  })
                }
                className="w-full accent-blue-600"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Longueur maximale de la réponse
              </span>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Consigne système (System Prompt)
              </label>
              <textarea
                value={currentSession.systemPrompt || ''}
                placeholder="ex: Tu es agronome expert en maraîchage biologique..."
                onChange={(e) =>
                  onUpdateSession({
                    ...currentSession,
                    systemPrompt: e.target.value,
                  })
                }
                rows={2}
                className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        )}

        {/* Flux de messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {!currentSession || !currentSession.messages || currentSession.messages.length === 0 ? (
            <div className="max-w-2xl mx-auto py-10 text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-3 border border-blue-200">
                <Bot className="w-6 h-6" />
              </div>

              {userProfile && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-2.5 border shadow-2xs bg-white text-slate-700">
                  <span className={`w-2 h-2 rounded-full ${userProfile.colorScheme.bgLight} ${userProfile.colorScheme.border} border`} />
                  <span>Espace Métier : {userProfile.label}</span>
                </div>
              )}

              <h2 className="text-lg font-bold text-slate-900 mb-1.5">
                Albert DINUM · {userProfile ? userProfile.shortLabel : 'Assistant Agrocampus'}
              </h2>
              <p className="text-xs text-slate-600 mb-6 leading-relaxed max-w-lg mx-auto">
                {userProfile
                  ? userProfile.description
                  : 'Posez vos questions ou importez vos documents texte (.txt, .md, .csv, .pdf, .docx...) avec l’icône trombone à côté du micro.'}
              </p>

              {/* Suggestions Agrocampus adaptées au profil */}
              <div className="text-left mb-2 px-1 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>Suggestions recommandées pour votre domaine :</span>
                {userProfile && <span className="font-mono text-slate-400">{userProfile.badge}</span>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(qp)}
                    className="p-3 text-xs bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-lg text-slate-700 transition-colors text-left flex items-start gap-2 shadow-2xs group cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                    <span>{qp}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            (currentSession.messages || []).map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 max-w-3xl mx-auto ${
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                    AL
                  </div>
                )}

                <div
                  className={`flex flex-col max-w-[85%] sm:max-w-[78%] ${
                    m.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`rounded-2xl px-4 py-3.5 text-xs sm:text-[13px] leading-relaxed shadow-xs ${
                      m.role === 'user'
                        ? 'bg-blue-700 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none w-full shadow-2xs'
                    }`}
                  >
                    {m.role === 'assistant' ? (
                      rawModeMessageIds[m.id] ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between pb-1 border-b border-slate-100 text-[11px] text-slate-400 font-mono">
                            <span>Format brut Markdown</span>
                          </div>
                          <pre className="whitespace-pre-wrap font-mono text-[11.5px] text-slate-700 break-words bg-slate-50 p-2.5 rounded border border-slate-200 overflow-x-auto">
                            {m.content}
                          </pre>
                        </div>
                      ) : (
                        <MarkdownViewer
                          content={m.content}
                          isStreaming={m.isStreaming}
                        />
                      )
                    ) : (
                      <div className="space-y-2.5">
                        {m.attachedDocs && m.attachedDocs.length > 0 && (
                          <div className="flex flex-col gap-1.5 pb-2.5 border-b border-blue-500/40">
                            <span className="text-[11px] font-semibold text-blue-100 flex items-center gap-1.5">
                              <Paperclip className="w-3.5 h-3.5" />
                              <span>
                                {m.attachedDocs.length === 1
                                  ? 'Document texte joint :'
                                  : `${m.attachedDocs.length} documents texte joints :`}
                              </span>
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {m.attachedDocs.map((doc) => (
                                <button
                                  key={doc.id}
                                  type="button"
                                  onClick={() => setDocPreviewModal(doc)}
                                  className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-800/80 hover:bg-blue-900 border border-blue-400/40 rounded-lg text-[11px] text-white transition-colors cursor-pointer text-left shadow-2xs group"
                                  title="Cliquer pour afficher le texte intégral du document"
                                >
                                  <FileText className="w-3.5 h-3.5 text-blue-200 shrink-0 group-hover:text-white" />
                                  <span className="font-medium truncate max-w-[200px]">{doc.name}</span>
                                  <span className="text-[10px] text-blue-200 font-mono">
                                    ({formatFileSize(doc.size)})
                                  </span>
                                  <Eye className="w-3 h-3 text-blue-200 ml-0.5 opacity-80 group-hover:opacity-100" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="whitespace-pre-wrap font-sans break-words text-white">
                          {m.content}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Métadonnées épurées (zéro pillule, séparateur ·) */}
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-slate-400 font-mono tabular-nums px-1">
                    <span>
                      {new Date(m.timestamp).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    {m.role === 'assistant' && (
                      <>
                        {m.tokens ? (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{m.tokens} jetons</span>
                          </>
                        ) : null}

                        {m.latencyMs ? (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{m.latencyMs} ms</span>
                          </>
                        ) : null}

                        {m.carbonCo2 !== undefined && m.carbonCo2 > 0 ? (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-emerald-700 flex items-center gap-0.5">
                              <Leaf className="w-3 h-3 inline" />
                              {(m.carbonCo2 * 1000).toFixed(4)} gCO₂eq
                            </span>
                          </>
                        ) : null}

                        <span aria-hidden="true">·</span>
                        <button
                          onClick={() => toggleRawMode(m.id)}
                          className="hover:text-blue-700 transition-colors p-0.5 flex items-center gap-1 text-[11px] text-slate-500 font-sans"
                          title={
                            rawModeMessageIds[m.id]
                              ? 'Revenir à la mise en page enrichie'
                              : 'Afficher le format brut Markdown'
                          }
                        >
                          <Code className="w-3 h-3 inline" />
                          <span>{rawModeMessageIds[m.id] ? 'Formaté' : 'Brut'}</span>
                        </button>

                        <span aria-hidden="true">·</span>
                        <button
                          onClick={() => handleCopy(m.content, m.id)}
                          className="hover:text-slate-700 transition-colors p-0.5 flex items-center gap-1 text-[11px] text-slate-500 font-sans"
                          title="Copier le texte"
                        >
                          {copiedMessageId === m.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">Copié</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copier</span>
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 text-xs shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Zone de saisie */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          <div className="max-w-3xl mx-auto flex flex-col gap-2">
            {/* Plateau des documents texte joints s'il y en a */}
            {attachedDocs.length > 0 && (
              <div className="bg-blue-50/90 border border-blue-200 rounded-xl p-3 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-blue-900 font-semibold px-0.5">
                  <div className="flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-blue-700" />
                    <span>
                      {attachedDocs.length === 1
                        ? '1 document texte importé pour interrogation'
                        : `${attachedDocs.length} documents texte importés pour interrogation`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachedDocs([])}
                    className="text-[11px] font-normal text-slate-500 hover:text-red-600 transition-colors"
                  >
                    Tout retirer
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {attachedDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-2 pl-2.5 pr-1.5 py-1.5 bg-white border border-blue-200 rounded-lg text-xs shadow-2xs group"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <div className="flex flex-col min-w-0 pr-1">
                        <span
                          className="font-medium text-slate-800 truncate max-w-[190px]"
                          title={doc.name}
                        >
                          {doc.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatFileSize(doc.size)} · ~{doc.wordCount.toLocaleString('fr-FR')} mots
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDocPreviewModal(doc)}
                        className="p-1 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                        title="Aperçu du texte extrait"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeAttachedDoc(doc.id)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Retirer ce document"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alerte erreur d'import document */}
            {docUploadError && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center justify-between shadow-2xs">
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>{docUploadError}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setDocUploadError(null)}
                  className="text-red-500 hover:text-red-700 font-bold ml-2"
                >
                  ×
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative flex items-center rounded-xl border transition-all p-1.5 ${
                isDraggingFile
                  ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-300'
                  : 'bg-slate-100 border-slate-300 focus-within:border-blue-600 focus-within:bg-white focus-within:ring-1 focus-within:ring-blue-600'
              }`}
            >
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={
                  attachedDocs.length > 0
                    ? 'Posez une question sur le(s) document(s) importé(s) ou appuyez sur Entrée pour une synthèse...'
                    : 'Rédigez votre demande pour Albert (ex: préparation de TP, rotation de culture, arrêté sécheresse...)'
                }
                rows={1}
                className="w-full text-xs sm:text-[13px] bg-transparent text-slate-800 placeholder-slate-400 px-3 py-2 focus:outline-none resize-none max-h-32 min-h-[40px]"
              />

              <div className="flex items-center gap-1 shrink-0 px-1">
                {/* Input de sélection de documents (TXT, MD, CSV, PDF, DOCX, JSON...) */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".txt,.md,.markdown,.csv,.tsv,.json,.xml,.html,.docx,.pdf,text/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {/* Bouton d'import de document texte - placé à côté du micro dans la ligne de prompt */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isStreaming || isReadingDocs}
                  className={`p-2 rounded-lg transition-all cursor-pointer relative ${
                    attachedDocs.length > 0
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200/90 shadow-2xs'
                      : isReadingDocs
                      ? 'bg-amber-100 text-amber-800'
                      : 'text-slate-500 hover:text-blue-700 hover:bg-slate-200/70'
                  }`}
                  title={
                    isReadingDocs
                      ? 'Lecture du document en cours...'
                      : 'Importer un ou plusieurs documents texte (.txt, .md, .csv, .pdf, .docx...) à interroger'
                  }
                >
                  {isReadingDocs ? (
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Paperclip className="w-4 h-4" />
                  )}
                  {attachedDocs.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full text-[9px] font-bold w-4 h-4 flex items-center justify-center shadow-xs">
                      {attachedDocs.length}
                    </span>
                  )}
                </button>

                {/* Bouton dictée vocale Whisper */}
                <button
                  type="button"
                  onClick={handleToggleDictation}
                  disabled={isStreaming}
                  className={`p-2 rounded-lg transition-all cursor-pointer ${
                    isDictating
                      ? 'bg-red-600 text-white animate-pulse shadow-sm'
                      : isTranscribingVoice
                      ? 'bg-amber-100 text-amber-800'
                      : 'text-slate-500 hover:text-blue-700 hover:bg-slate-200/70'
                  }`}
                  title={
                    isDictating
                      ? 'Arrêter l’enregistrement et transcrire'
                      : isTranscribingVoice
                      ? 'Transcription Whisper en cours...'
                      : 'Dicter vocalement (Whisper Large V3)'
                  }
                >
                  {isTranscribingVoice ? (
                    <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </button>

                {isStreaming ? (
                  <button
                    type="button"
                    onClick={() => setIsStreaming(false)}
                    className="p-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                    title="Arrêter la génération"
                  >
                    <Square className="w-4 h-4 fill-white" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() && attachedDocs.length === 0}
                    className={`p-2 rounded-lg transition-colors ${
                      inputMessage.trim() || attachedDocs.length > 0
                        ? 'bg-blue-700 hover:bg-blue-800 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                    title={
                      attachedDocs.length > 0 && !inputMessage.trim()
                        ? 'Envoyer pour analyser et synthétiser le ou les documents joints'
                        : 'Envoyer'
                    }
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>

            {isDictating && (
              <div className="px-2 py-1 bg-red-50 border border-red-200 rounded-md text-[11px] text-red-700 flex items-center justify-between animate-pulse">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                  Microphone actif · Parlez naturellement...
                </span>
                <span className="text-[10px] text-red-600">
                  Cliquez à nouveau sur le micro pour transcrire
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span>
                Shift + Entrée pour un saut de ligne · Modèle actif :{' '}
                <span className="font-mono text-slate-700 font-medium">
                  {selectedModelId}
                </span>
              </span>
              <span className="hidden sm:inline">
                API Albert DINUM · Documents joints & RAG
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Modal d'aperçu du document texte importé */}
      {docPreviewModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setDocPreviewModal(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête modal */}
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <FileText className="w-5 h-5 text-blue-700 shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate">
                    {docPreviewModal.name}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                    <span>{formatFileSize(docPreviewModal.size)}</span>
                    <span aria-hidden="true">·</span>
                    <span>{docPreviewModal.charCount.toLocaleString('fr-FR')} caractères</span>
                    <span aria-hidden="true">·</span>
                    <span>~{docPreviewModal.wordCount.toLocaleString('fr-FR')} mots</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopy(docPreviewModal.content, docPreviewModal.id)}
                  className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Copier le texte extrait"
                >
                  {copiedMessageId === docPreviewModal.id ? (
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
                <button
                  type="button"
                  onClick={() => setDocPreviewModal(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors cursor-pointer"
                  title="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Corps modal */}
            <div className="flex-1 overflow-y-auto p-5 bg-white space-y-3">
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-start gap-2">
                <FileCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-semibold">Contenu textuel extrait :</span> Ce texte est
                  transmis au modèle Albert DINUM pour lui permettre de répondre précisément et de
                  sourcer ses réponses sur votre document.
                </div>
              </div>
              <pre className="whitespace-pre-wrap font-mono text-xs text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200 break-words select-text max-h-[50vh] overflow-y-auto">
                {docPreviewModal.content}
              </pre>
            </div>

            {/* Pied modal */}
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono text-[11px]">
                Format détecté : {docPreviewModal.type || 'text/plain'}
              </span>
              <button
                type="button"
                onClick={() => setDocPreviewModal(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-xs font-medium transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
