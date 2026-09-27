import React, { useState } from 'react';
import {
  Activity,
  Server,
  Database,
  Terminal,
  RefreshCw,
  Copy,
  Check,
  Zap,
  Leaf,
  Shield,
  Clock,
  Send,
} from 'lucide-react';
import { AlbertModel, ApiHealthStatus, UserSettings } from '../types';

interface ApiDiagnosticsProps {
  models: AlbertModel[];
  health: ApiHealthStatus | null;
  settings: UserSettings;
  onRefreshHealth: () => void;
}

export const ApiDiagnostics: React.FC<ApiDiagnosticsProps> = ({
  models,
  health,
  settings,
  onRefreshHealth,
}) => {
  const [testModel, setTestModel] = useState('ministral-3-8b-instruct-2512');
  const [testPrompt, setTestPrompt] = useState('Quels sont les objectifs du plan Enseigner à produire autrement ?');
  const [isLoading, setIsLoading] = useState(false);
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testLatency, setTestLatency] = useState<number | null>(null);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const curlCommand = `curl -X POST "https://albert.api.etalab.gouv.fr/v1/chat/completions" \\
  -H "Authorization: Bearer ${settings.albertApiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${testModel}",
    "messages": [{"role": "user", "content": "${testPrompt.replace(/"/g, '\\"')}"}],
    "max_tokens": 300
  }'`;

  const handleRunRawTest = async () => {
    setIsLoading(true);
    setTestResponse(null);
    const start = Date.now();
    try {
      const resp = await fetch('/api/albert/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-albert-key': settings.albertApiKey,
        },
        body: JSON.stringify({
          model: testModel,
          messages: [{ role: 'user', content: testPrompt }],
          max_tokens: 300,
        }),
      });
      const data = await resp.json();
      setTestLatency(Date.now() - start);
      setTestResponse({
        status: resp.status,
        statusText: resp.statusText,
        headers: {
          'content-type': resp.headers.get('content-type'),
        },
        body: data,
      });
    } catch (err: any) {
      setTestLatency(Date.now() - start);
      setTestResponse({ error: err.message || 'Erreur requête' });
    } finally {
      setIsLoading(false);
    }
  };

  const copyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Inspecteur & Banc de Test API Albert DINUM
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Surveillance en temps réel des services souverains, exploration des charges utiles JSON
            et mesure de la latence et de l’empreinte écologique.
          </p>
        </div>

        <button
          onClick={onRefreshHealth}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-700" />
          <span>Rafraîchir les sondes</span>
        </button>
      </div>

      {/* Cartes d'état de l'infrastructure */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Albert API */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Albert API DINUM
            </span>
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Opérationnel</span>
            </div>
          </div>
          <div className="space-y-1.5 text-xs text-slate-600 font-mono">
            <div className="flex justify-between">
              <span>Hôte :</span>
              <span className="text-slate-900 truncate max-w-[180px]">
                albert.api.etalab.gouv.fr
              </span>
            </div>
            <div className="flex justify-between">
              <span>Latence :</span>
              <span className="text-slate-900 font-semibold tabular-nums">
                {health?.albert.latencyMs ?? 180} ms
              </span>
            </div>
            <div className="flex justify-between">
              <span>Modèles actifs :</span>
              <span className="text-slate-900 font-semibold tabular-nums">
                {models.length} modèles
              </span>
            </div>
          </div>
        </div>

        {/* Supabase Privé */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Base Supabase Privée
            </span>
            <div className="flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              <Database className="w-3.5 h-3.5" />
              <span>Proxy Actif</span>
            </div>
          </div>
          <div className="space-y-1.5 text-xs text-slate-600 font-mono">
            <div className="flex justify-between">
              <span>Adresse :</span>
              <span className="text-slate-900 truncate max-w-[180px]">
                185.219.215.120:8007
              </span>
            </div>
            <div className="flex justify-between">
              <span>Protocole :</span>
              <span className="text-slate-900">Basic Auth + Envoy</span>
            </div>
            <div className="flex justify-between">
              <span>Stockage tampon :</span>
              <span className="text-slate-900 font-semibold">Mémoire + Local</span>
            </div>
          </div>
        </div>

        {/* Bilan Écologique DINUM */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Éco-Indicateurs DINUM
            </span>
            <div className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <Leaf className="w-3.5 h-3.5" />
              <span>Souveraineté</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            L’API Albert calcule automatiquement l’empreinte carbone (gCO₂eq) et l’énergie (kWh)
            de chaque requête générative pour respecter la sobriété numérique de l'État.
          </p>
        </div>
      </div>

      {/* Banc de test interactif de requêtes */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <Terminal className="w-4 h-4 text-blue-700" />
          <h2 className="text-sm font-bold text-slate-900">
            Console d'exécution directe & Générateur de requête
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Modèle Albert cible
              </label>
              <select
                value={testModel}
                onChange={(e) => setTestModel(e.target.value)}
                className="w-full text-xs font-mono p-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.id}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Message de test
              </label>
              <textarea
                rows={3}
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none font-sans"
              />
            </div>

            <button
              onClick={handleRunRawTest}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Exécution en cours...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Envoyer la requête test</span>
                </>
              )}
            </button>
          </div>

          {/* Commande cURL correspondante */}
          <div className="flex flex-col justify-between bg-slate-900 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-slate-400 font-mono">
                Commande cURL équivalente :
              </span>
              <button
                onClick={copyCurl}
                className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white transition-colors"
              >
                {copiedCurl ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copié</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copier cURL</span>
                  </>
                )}
              </button>
            </div>
            <pre className="text-[11px] font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap flex-1 bg-black/40 p-2.5 rounded-lg border border-slate-800">
              {curlCommand}
            </pre>
          </div>
        </div>

        {/* Réponse brute JSON si disponible */}
        {testResponse && (
          <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 font-mono">
              <span>
                Statut :{' '}
                <strong className={testResponse.status === 200 ? 'text-emerald-600' : 'text-red-600'}>
                  {testResponse.status || 'Erreur'} {testResponse.statusText || ''}
                </strong>
              </span>
              {testLatency && <span>Latence : {testLatency} ms</span>}
            </div>

            <pre className="text-[11px] font-mono bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto max-h-72 border border-slate-800">
              {JSON.stringify(testResponse.body || testResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Inventaire détaillé des modèles Albert DINUM */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900">
          Modèles d’IA Disponibles sur l’Infrastructure DINUM
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-mono">
                <th className="py-2 px-3 font-semibold">Identifiant du Modèle</th>
                <th className="py-2 px-3 font-semibold">Type</th>
                <th className="py-2 px-3 font-semibold text-right">Contexte Max</th>
                <th className="py-2 px-3 font-semibold">Opéré par</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {models.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-slate-900">{m.id}</td>
                  <td className="py-2.5 px-3 text-slate-600">{m.type || 'text-generation'}</td>
                  <td className="py-2.5 px-3 text-right text-slate-700 tabular-nums">
                    {m.max_context_length
                      ? `${(m.max_context_length / 1024).toFixed(0)}k jetons`
                      : 'Non spécifié'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                    {m.owned_by || 'DINUM / État français'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
