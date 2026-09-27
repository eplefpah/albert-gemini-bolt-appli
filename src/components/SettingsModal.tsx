import React, { useState } from 'react';
import {
  Settings,
  Key,
  Database,
  Cloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FolderTree,
  Save,
} from 'lucide-react';
import { UserSettings } from '../types';
import { testAlbertConnection } from '../services/albertApi';
import { testSupabaseConnection } from '../services/storageService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  if (!isOpen) return null;

  const [form, setForm] = useState<UserSettings>({ ...settings });
  const [testingAlbert, setTestingAlbert] = useState(false);
  const [albertResult, setAlbertResult] = useState<{
    ok: boolean;
    latencyMs?: number;
    error?: string;
  } | null>(null);

  const [testingSupabase, setTestingSupabase] = useState(false);
  const [supabaseResult, setSupabaseResult] = useState<{
    connected: boolean;
    latencyMs?: number;
    authenticated?: boolean;
    error?: string;
  } | null>(null);

  const handleTestAlbert = async () => {
    setTestingAlbert(true);
    setAlbertResult(null);
    try {
      const res = await testAlbertConnection(form.albertApiKey);
      setAlbertResult(res);
    } finally {
      setTestingAlbert(false);
    }
  };

  const handleTestSupabase = async () => {
    setTestingSupabase(true);
    setSupabaseResult(null);
    try {
      const res = await testSupabaseConnection(
        form.supabaseUrl,
        form.supabaseUser,
        form.supabasePass
      );
      setSupabaseResult(res);
    } finally {
      setTestingSupabase(false);
    }
  };

  const handleSave = () => {
    onSaveSettings(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* En-tête */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-700" />
            <h2 className="text-base font-bold text-slate-900">
              Paramètres de Connexion & Sauvegarde
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold p-1"
          >
            ✕
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-6 text-xs">
          {/* Section 1 : Clé API Albert DINUM */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-blue-700" />
                <span>Clé API Albert (DINUM / Gouvernement)</span>
              </span>
              <button
                type="button"
                onClick={handleTestAlbert}
                disabled={testingAlbert}
                className="text-[11px] font-medium text-blue-700 hover:underline flex items-center gap-1"
              >
                {testingAlbert ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : null}
                <span>Tester la clé</span>
              </button>
            </div>

            <input
              type="password"
              value={form.albertApiKey}
              onChange={(e) => setForm({ ...form, albertApiKey: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="sk-..."
            />

            {albertResult && (
              <div
                className={`p-2.5 rounded-lg flex items-center gap-2 ${
                  albertResult.ok
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {albertResult.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>
                  {albertResult.ok
                    ? `Connexion Albert validée (${albertResult.latencyMs} ms)`
                    : `Erreur : ${albertResult.error}`}
                </span>
              </div>
            )}
          </div>

          {/* Section 2 : Base Supabase Privée */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-700" />
                <span>Instance Supabase Privée</span>
              </span>
              <button
                type="button"
                onClick={handleTestSupabase}
                disabled={testingSupabase}
                className="text-[11px] font-medium text-blue-700 hover:underline flex items-center gap-1"
              >
                {testingSupabase ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : null}
                <span>Tester la connexion</span>
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-slate-600 font-medium block mb-1">
                  URL du serveur Supabase :
                </label>
                <input
                  type="text"
                  value={form.supabaseUrl}
                  onChange={(e) => setForm({ ...form, supabaseUrl: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 font-medium block mb-1">
                    Identifiant HTTP :
                  </label>
                  <input
                    type="text"
                    value={form.supabaseUser}
                    onChange={(e) => setForm({ ...form, supabaseUser: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-medium block mb-1">
                    Mot de passe HTTP :
                  </label>
                  <input
                    type="password"
                    value={form.supabasePass}
                    onChange={(e) => setForm({ ...form, supabasePass: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="autoSync"
                  checked={form.autoSync}
                  onChange={(e) => setForm({ ...form, autoSync: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="autoSync" className="text-slate-700 cursor-pointer">
                  Synchroniser automatiquement chaque fin de réponse sur le serveur
                </label>
              </div>
            </div>

            {supabaseResult && (
              <div
                className={`p-2.5 rounded-lg flex items-center gap-2 ${
                  supabaseResult.connected
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {supabaseResult.connected ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span>
                  {supabaseResult.connected
                    ? `Serveur Supabase joint (${supabaseResult.latencyMs} ms).`
                    : `Hôte distant injoignable directement : les conversations restent protégées dans le cache local et serveur.`}
                </span>
              </div>
            )}
          </div>

          {/* Section 3 : Hébergement Ionos /dossier data */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5 text-blue-700" />
              <span>Hébergement Ionos (Dossier /data/)</span>
            </span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Le bouton <strong>"Export Ionos /data/"</strong> génère un fichier JSON normé{' '}
              <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">
                albert_agrocampus_data.json
              </code>{' '}
              prêt à être déposé dans le répertoire <code className="font-mono">/data/</code> de votre hébergement Ionos.
            </p>
          </div>
        </div>

        {/* Pied de modal */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            Fermer
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Enregistrer les paramètres</span>
          </button>
        </div>
      </div>
    </div>
  );
};
