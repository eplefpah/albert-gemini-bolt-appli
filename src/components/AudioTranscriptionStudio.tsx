import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Upload,
  FileAudio,
  Play,
  Pause,
  Download,
  Copy,
  Check,
  Sparkles,
  MessageSquare,
  Clock,
  Settings2,
  Trash2,
  AlertCircle,
  FileText,
  Volume2,
  ListOrdered,
} from 'lucide-react';
import { transcribeAudio } from '../services/albertApi';
import { AudioTranscriptionResult, UserSettings } from '../types';

interface AudioTranscriptionStudioProps {
  settings: UserSettings;
  onSendToChat: (promptText: string, systemPrompt?: string) => void;
}

const STORAGE_KEY_AUDIO_HISTORY = 'albert_transcription_history';

export const AudioTranscriptionStudio: React.FC<AudioTranscriptionStudioProps> = ({
  settings,
  onSendToChat,
}) => {
  // Mode : enregistrement micro ou import fichier
  const [activeMode, setActiveMode] = useState<'record' | 'upload'>('record');

  // Enregistrement microphone
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Fichier téléversé
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Paramètres Whisper
  const [language, setLanguage] = useState<'fr' | 'en' | 'auto'>('fr');
  const [responseFormat, setResponseFormat] = useState<
    'json' | 'text' | 'diarized_json' | 'srt'
  >('json');
  const [contextPrompt, setContextPrompt] = useState(
    'Contexte : Enseignement agricole public, exploitation maraîchère, lycée Agrocampus Saint-Germain-en-Laye, cours d’agronomie.'
  );

  // Traitement
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [currentResult, setCurrentResult] = useState<AudioTranscriptionResult | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Historique local
  const [history, setHistory] = useState<AudioTranscriptionResult[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_AUDIO_HISTORY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Références médias
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const saveToHistory = (item: AudioTranscriptionResult) => {
    const updated = [item, ...history.filter((h) => h.id !== item.id)].slice(0, 15);
    setHistory(updated);
    try {
      localStorage.setItem(STORAGE_KEY_AUDIO_HISTORY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Erreur stockage historique audio', e);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY_AUDIO_HISTORY);
  };

  // --- DÉMARRER ENREGISTREMENT MICRO ---
  const handleStartRecording = async () => {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(finalBlob);
        const url = URL.createObjectURL(finalBlob);
        setAudioUrl(url);

        // Arrêter les pistes micro
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = window.setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setErrorMessage(
        'Accès au microphone refusé ou non supporté : ' + (err.message || '')
      );
    }
  };

  // --- ARRÊTER ENREGISTREMENT ---
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // --- SÉLECTIONNER UN FICHIER AUDIO ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 20 * 1024 * 1024) {
        setErrorMessage('Le fichier dépasse la limite maximale de 20 Mo d’Albert API.');
        return;
      }
      setSelectedFile(file);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(URL.createObjectURL(file));
      setAudioBlob(file);
    }
  };

  // --- CONVERTIR UN BLOB EN BASE64 ---
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // --- LANCER LA TRANSCRIPTION SUR L'API ALBERT DINUM ---
  const handleRunTranscription = async () => {
    const targetBlob = activeMode === 'record' ? audioBlob : selectedFile;
    if (!targetBlob) {
      setErrorMessage('Veuillez d’abord enregistrer un message vocal ou choisir un fichier audio.');
      return;
    }

    setErrorMessage(null);
    setIsTranscribing(true);
    setCurrentResult(null);

    try {
      const audioBase64 = await blobToBase64(targetBlob);
      const fileName =
        selectedFile?.name ||
        (activeMode === 'record' ? 'enregistrement_micro.wav' : 'audio.mp3');
      const mimeType = targetBlob.type || 'audio/wav';

      const res = await transcribeAudio({
        audioBase64,
        fileName,
        mimeType,
        model: 'whisper-large-v3',
        language: language === 'auto' ? undefined : language,
        prompt: contextPrompt || undefined,
        response_format: responseFormat,
        temperature: 0,
        customApiKey: settings.albertApiKey,
      });

      const resultObj: AudioTranscriptionResult = {
        id: res.id || 'transc_' + Date.now(),
        text: res.text,
        model: res.model || 'whisper-large-v3',
        duration: res.duration || recordingDuration || null,
        language: language,
        segments: res.segments,
        usage: res.usage,
        filename: fileName,
        timestamp: Date.now(),
      };

      setCurrentResult(resultObj);
      saveToHistory(resultObj);
    } catch (err: any) {
      setErrorMessage(err.message || 'Échec de la transcription auprès d’Albert');
    } finally {
      setIsTranscribing(false);
    }
  };

  // --- COPIER LE TEXTE ---
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- TÉLÉCHARGER LE FICHIER TEXTE ---
  const handleDownloadText = (text: string, filename = 'transcription_albert.txt') => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- ENVOYER DANS LE CHAT AVEC UNE CONSIGNE MÉTIER ---
  const handleSendPromptToChat = (action: 'compte_rendu' | 'actions' | 'pedagogie') => {
    if (!currentResult?.text) return;

    let instruction = '';
    let system = 'Tu es conseiller agronomique et pédagogique pour l’enseignement public agricole.';

    if (action === 'compte_rendu') {
      instruction = `Voici la transcription brute d'un échange vocal enregistré sur le terrain :
"""
${currentResult.text}
"""

Peux-tu rédiger un compte-rendu clair, structuré et professionnel avec les points clés abordés et le contexte agronomique ?`;
    } else if (action === 'actions') {
      instruction = `À partir de la transcription audio suivante :
"""
${currentResult.text}
"""

Dresse un plan d'action opérationnel (to-do list) avec les priorités, les personnes concernées et les échéances nécessaires pour l'exploitation et le lycée.`;
    } else {
      instruction = `Voici la transcription d'une séance ou d'une consigne pratique :
"""
${currentResult.text}
"""

Transforme ce contenu en une fiche pédagogique pour les apprenants (Bac Pro ou BTSA), avec les objectifs d'apprentissage, le matériel requis et les règles de sécurité.`;
      system = 'Tu es formateur expert en pédagogie agricole publique (DGER).';
    }

    onSendToChat(instruction, system);
  };

  // Formatage chronomètre
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* En-tête de section */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Whisper Large V3 · Albert DINUM
                </span>
                <span className="text-xs text-slate-500">· Reconnaissance vocale souveraine</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Transcription Audio & Dictée Vocale
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                Dictez au micro ou déposez vos enregistrements de réunions d’exploitation, observations
                de parcelles maraîchères ou cours agricoles. Vos données vocales sont transcrites en toute confidentialité sur l’infrastructure de l’État français.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 rounded-md border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Whisper v3 Actif
              </span>
            </div>
          </div>
        </div>

        {/* Grille principale : Formulaire d'enregistrement + Paramètres */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne gauche (2/3) : Capture ou Upload */}
          <div className="lg:col-span-2 space-y-4">
            {/* Sélecteur d'onglets de capture */}
            <div className="flex items-center p-1 bg-slate-200/80 rounded-lg">
              <button
                onClick={() => {
                  setActiveMode('record');
                  setErrorMessage(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-colors ${
                  activeMode === 'record'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mic className="w-3.5 h-3.5 text-blue-700" />
                <span>Dictaphone / Microphone direct</span>
              </button>
              <button
                onClick={() => {
                  setActiveMode('upload');
                  setErrorMessage(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-colors ${
                  activeMode === 'upload'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5 text-blue-700" />
                <span>Déposer un fichier audio</span>
              </button>
            </div>

            {/* Zone d'action selon le mode */}
            {activeMode === 'record' ? (
              <div className="bg-white border border-slate-200 rounded-xl p-6 text-center space-y-4 shadow-2xs">
                <div className="flex flex-col items-center justify-center py-6">
                  {isRecording ? (
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center animate-ping absolute inset-0 opacity-75"></div>
                      <div className="w-20 h-20 rounded-full bg-red-600 text-white flex items-center justify-center relative shadow-lg">
                        <Mic className="w-8 h-8" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
                      <Mic className="w-8 h-8" />
                    </div>
                  )}

                  <div className="mt-4">
                    <span className="font-mono text-2xl font-bold text-slate-800">
                      {formatTime(recordingDuration)}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      {isRecording
                        ? 'Enregistrement en cours... Parlez naturellement.'
                        : audioBlob
                        ? 'Enregistrement prêt pour la transcription'
                        : 'Cliquez sur le bouton ci-dessous pour démarrer l’enregistrement'}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center gap-3">
                    {!isRecording ? (
                      <button
                        onClick={handleStartRecording}
                        className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Mic className="w-4 h-4" />
                        <span>Démarrer l'enregistrement</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleStopRecording}
                        className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2 animate-pulse cursor-pointer"
                      >
                        <Square className="w-4 h-4" />
                        <span>Arrêter l'enregistrement</span>
                      </button>
                    )}
                  </div>
                </div>

                {audioUrl && !isRecording && (
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg">
                    <span className="text-xs font-medium text-slate-700 flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-blue-600" />
                      Réécouter votre prise vocale ({formatTime(recordingDuration)})
                    </span>
                    <audio src={audioUrl} controls className="h-8 max-w-xs" />
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".mp3,.wav,.m4a,.ogg,.webm,audio/*"
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-8 text-center cursor-pointer transition-colors bg-slate-50 hover:bg-blue-50/30 group"
                >
                  <div className="w-12 h-12 rounded-full bg-white shadow-2xs text-blue-700 border border-slate-200 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <FileAudio className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    {selectedFile ? selectedFile.name : 'Sélectionnez ou déposez votre fichier audio'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Formats supportés : MP3, WAV, M4A, OGG, WebM (jusqu’à 20 Mo)
                  </p>
                  {selectedFile && (
                    <span className="inline-block mt-3 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[11px] font-mono">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} Mo
                    </span>
                  )}
                </div>

                {audioUrl && (
                  <div className="pt-2 flex items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="text-xs text-slate-700 font-medium truncate">
                      {selectedFile?.name}
                    </span>
                    <audio src={audioUrl} controls className="h-8 max-w-xs" />
                  </div>
                )}
              </div>
            )}

            {/* Bouton principal de lancement */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleRunTranscription}
                disabled={isTranscribing || (!audioBlob && !selectedFile)}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-semibold text-white shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isTranscribing || (!audioBlob && !selectedFile)
                    ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                    : 'bg-blue-700 hover:bg-blue-800 hover:shadow-md'
                }`}
              >
                {isTranscribing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Transcription en cours via Albert DINUM...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Transcrire avec Whisper Large V3</span>
                  </>
                )}
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Colonne droite (1/3) : Paramètres du modèle */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4 text-xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 font-semibold text-slate-800">
                <Settings2 className="w-4 h-4 text-blue-700" />
                <span>Paramètres de transcription</span>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Langue de sortie
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs text-slate-800"
                >
                  <option value="fr">Français (ISO-639-1: fr - recommandé)</option>
                  <option value="en">Anglais (en)</option>
                  <option value="auto">Détection automatique</option>
                </select>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Traduit automatiquement si la voix est dans une autre langue.
                </span>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Format de réponse
                </label>
                <select
                  value={responseFormat}
                  onChange={(e) => setResponseFormat(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs text-slate-800"
                >
                  <option value="json">JSON standard avec texte intégral</option>
                  <option value="diarized_json">JSON diarisé avec repérage des locuteurs</option>
                  <option value="srt">Sous-titres SubRip (.srt)</option>
                  <option value="text">Texte brut (.txt)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Prompt contextuel (Lexique métier)
                </label>
                <textarea
                  value={contextPrompt}
                  onChange={(e) => setContextPrompt(e.target.value)}
                  rows={3}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs text-slate-800 resize-none"
                  placeholder="Vocabulaire technique ou noms propres..."
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Aide Whisper à orthographier les termes agronomiques précis.
                </span>
              </div>
            </div>

            {/* Fiche d'information souveraineté */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 space-y-2">
              <span className="font-semibold block text-blue-950">Garantie Souveraine</span>
              <p className="text-[11px] leading-relaxed text-blue-800">
                Les flux audio sont traités sur les serveurs de la DINUM en France.
                Aucun échantillon audio n’est réutilisé pour l’entraînement de modèles commerciaux.
              </p>
            </div>
          </div>
        </div>

        {/* Résultat de la transcription en cours */}
        {currentResult && (
          <div className="bg-white border border-blue-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                  TX
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Transcription générée ({currentResult.model})
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                    <span>{new Date(currentResult.timestamp).toLocaleTimeString('fr-FR')}</span>
                    <span>·</span>
                    <span>{currentResult.filename}</span>
                    {currentResult.duration && (
                      <>
                        <span>·</span>
                        <span>{formatTime(Math.round(currentResult.duration))}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyText(currentResult.text)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copié !' : 'Copier'}</span>
                </button>
                <button
                  onClick={() => handleDownloadText(currentResult.text, `${currentResult.filename || 'transcription'}.txt`)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exporter (.txt)</span>
                </button>
              </div>
            </div>

            {/* Texte transcrit */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm leading-relaxed whitespace-pre-wrap selection:bg-blue-100">
              {currentResult.text || '(Aucune parole audible détectée dans cet extrait)'}
            </div>

            {/* Segments si présents */}
            {Array.isArray(currentResult.segments) && currentResult.segments.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <ListOrdered className="w-3.5 h-3.5 text-blue-600" />
                  Découpage chronologique & Intervenants
                </span>
                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-2">
                  {currentResult.segments.map((seg, i) => (
                    <div
                      key={i}
                      className="p-2 bg-white border border-slate-200 rounded text-xs flex items-start gap-3"
                    >
                      <span className="font-mono text-[11px] text-blue-700 font-semibold shrink-0 pt-0.5">
                        {seg.start ? `${seg.start.toFixed(1)}s` : `[${i + 1}]`}
                      </span>
                      {seg.speaker && (
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold text-[10px]">
                          {seg.speaker}
                        </span>
                      )}
                      <span className="text-slate-800">{seg.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions rapides d'exploitation dans le chat */}
            <div className="pt-3 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-700 block mb-2">
                Exploiter ce texte avec Albert DINUM :
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleSendPromptToChat('compte_rendu')}
                  className="px-3 py-2 text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-blue-700" />
                  <span>Rédiger un compte-rendu synthétique</span>
                </button>
                <button
                  onClick={() => handleSendPromptToChat('actions')}
                  className="px-3 py-2 text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Extraire la liste d'actions concrètes</span>
                </button>
                <button
                  onClick={() => handleSendPromptToChat('pedagogie')}
                  className="px-3 py-2 text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-700" />
                  <span>Créer une fiche de cours / TP pour les élèves</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Historique des transcriptions locales */}
        {history.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Historique des transcriptions ({history.length})
              </span>
              <button
                onClick={clearHistory}
                className="text-[11px] text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                Effacer l'historique
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/70 p-2 rounded-lg transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-0.5">
                      <span>{new Date(item.timestamp).toLocaleString('fr-FR')}</span>
                      <span>·</span>
                      <span className="font-mono text-blue-700">{item.filename || 'Audio'}</span>
                    </div>
                    <p className="text-xs text-slate-800 line-clamp-2">{item.text}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setCurrentResult(item)}
                      className="px-2.5 py-1 text-[11px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors cursor-pointer"
                    >
                      Consulter
                    </button>
                    <button
                      onClick={() => handleCopyText(item.text)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Copier"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
