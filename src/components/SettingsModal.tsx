import React, { useState } from 'react';
import {
  Settings,
  Key,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  HardDrive,
  Save,
} from 'lucide-react';
import { UserSettings } from '../types';
import { testAlbertConnection } from '../services/albertApi';

interface SettingsModalProps {
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [form, setForm] = useState<UserSettings>({ ...settings });
  const [testingAlbert, setTestingAlbert] = useState(false);
  const [albertResult, setAlbertResult] = useState<{
    ok: boolean;
    latencyMs?: number;
    modelsCount?: number;
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

  const handleSave = () => {
    onSaveSettings({ ...form, albertApiKey: form.albertApiKey.trim() });
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
              Paramètres de connexion
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
                <span>Clé API Albert personnelle (facultatif)</span>
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
                <span>Tester la connexion</span>
              </button>
            </div>

            <input
              type="password"
              value={form.albertApiKey}
              onChange={(e) => setForm({ ...form, albertApiKey: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Laisser vide pour utiliser la clé du serveur"
            />

            <p className="text-slate-500 leading-relaxed text-[11px]">
              Par défaut, l’application utilise la clé API enregistrée sur le serveur, dans le
              fichier <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">api/config.php</code>.
              Renseignez une clé ici uniquement pour utiliser votre propre compte Albert depuis ce navigateur.
            </p>

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
                    ? `Connexion Albert validée (${albertResult.latencyMs} ms · ${albertResult.modelsCount} modèles)`
                    : `Erreur : ${albertResult.error}`}
                </span>
              </div>
            )}
          </div>

          {/* Section 2 : Sauvegarde des conversations */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-blue-700" />
              <span>Sauvegarde des conversations</span>
            </span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Les conversations sont enregistrées dans ce navigateur. Le menu{' '}
              <strong>Outils → Exporter les conversations</strong> télécharge une copie de
              sauvegarde au format JSON.
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
