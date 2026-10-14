import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  FolderPlus,
  UploadCloud,
  FileText,
  Trash2,
  ExternalLink,
  MessageSquareShare,
  Sparkles,
  FileCheck,
  Tag,
  ArrowRight,
  Database,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Folder,
  Layers,
  Info,
  Clock,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { RagDocument, AlbertCollection, AlbertDocumentItem, UserSettings, UserProfileConfig } from '../types';
import {
  searchRagCorpus,
  getAlbertCollections,
  createAlbertCollection,
  deleteAlbertCollection,
  getAlbertDocuments,
  uploadAlbertDocument,
  deleteAlbertDocument,
} from '../services/albertApi';

interface RagSearchProps {
  onInjectIntoChat: (contextDoc: RagDocument) => void;
  settings?: UserSettings;
  userProfile?: UserProfileConfig;
}

export const RagSearch: React.FC<RagSearchProps> = ({ onInjectIntoChat, settings, userProfile }) => {
  // Navigation entre Recherche et Gestion des Collections
  const [activeSubTab, setActiveSubTab] = useState<'search' | 'collections'>('search');

  // État de recherche
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('tous');
  const [results, setResults] = useState<RagDocument[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [minScoreThreshold, setMinScoreThreshold] = useState(0.4);
  const [filterCollectionId, setFilterCollectionId] = useState<number | 'all'>('all');

  // État des Collections & Documents RAG (API Albert DINUM)
  const [collections, setCollections] = useState<AlbertCollection[]>([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<AlbertCollection | null>(null);
  const [collectionDocuments, setCollectionDocuments] = useState<AlbertDocumentItem[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  // Modal création collection
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [isCreatingCol, setIsCreatingCol] = useState(false);

  // Téléversement de fichier
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [uploadChunkSize, setUploadChunkSize] = useState(2048);
  const [uploadChunkOverlap, setUploadChunkOverlap] = useState(100);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const tags = [
    'tous',
    'Législation',
    'Maraîchage',
    'Pédagogie',
    'Péri-urbain',
    'Sécheresse',
    'EGalim',
  ];

  // 1. Charger les collections Albert DINUM
  const loadCollections = async () => {
    setIsLoadingCollections(true);
    setErrorMsg(null);
    try {
      const data = await getAlbertCollections(settings?.albertApiKey);
      setCollections(data);
      if (data.length > 0 && !selectedCollection) {
        setSelectedCollection(data[0]);
      }
    } catch (err: any) {
      console.warn('Erreur chargement collections Albert:', err);
      setErrorMsg(
        'Impossible de récupérer les collections distantes : ' +
          (err.message || 'Vérifiez la clé API')
      );
    } finally {
      setIsLoadingCollections(false);
    }
  };

  // 2. Charger les documents d'une collection
  const loadDocumentsForCollection = async (colId: number) => {
    setIsLoadingDocs(true);
    try {
      const docs = await getAlbertDocuments(colId, settings?.albertApiKey);
      setCollectionDocuments(docs);
    } catch (err: any) {
      console.warn('Erreur chargement documents collection', err);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  useEffect(() => {
    if (selectedCollection) {
      loadDocumentsForCollection(selectedCollection.id);
    }
  }, [selectedCollection]);

  // 3. Exécuter la recherche sémantique
  const handleSearch = async (searchTerm = query) => {
    setIsLoadingSearch(true);
    setErrorMsg(null);
    try {
      const colIds =
        filterCollectionId !== 'all' ? [Number(filterCollectionId)] : undefined;
      const docs = await searchRagCorpus(searchTerm, selectedTag, colIds, settings?.albertApiKey);
      setResults(docs.filter((d) => d.score >= minScoreThreshold));
    } catch (err: any) {
      setErrorMsg('Erreur de recherche RAG : ' + (err.message || ''));
    } finally {
      setIsLoadingSearch(false);
    }
  };

  useEffect(() => {
    handleSearch(query);
  }, [selectedTag, filterCollectionId, minScoreThreshold]);

  // 4. Créer une nouvelle collection Albert
  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    setIsCreatingCol(true);
    setErrorMsg(null);
    try {
      const res = await createAlbertCollection(
        newColName.trim(),
        newColDesc.trim() || undefined,
        settings?.albertApiKey
      );
      setNewColName('');
      setNewColDesc('');
      setIsCreateModalOpen(false);
      await loadCollections();
      if (res?.id) {
        const found = collections.find((c) => c.id === res.id);
        if (found) setSelectedCollection(found);
      }
    } catch (err: any) {
      setErrorMsg('Erreur lors de la création de la collection : ' + err.message);
    } finally {
      setIsCreatingCol(false);
    }
  };

  // 5. Supprimer une collection
  const handleDeleteCollection = async (colId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Voulez-vous vraiment supprimer cette collection et tous ses documents ?')) {
      return;
    }
    try {
      await deleteAlbertCollection(colId, settings?.albertApiKey);
      if (selectedCollection?.id === colId) {
        setSelectedCollection(null);
      }
      await loadCollections();
    } catch (err: any) {
      setErrorMsg('Erreur suppression : ' + err.message);
    }
  };

  // 6. Convertir fichier en base64 pour envoi API
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        resolve(dataUrl.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // 7. Importer et indexer un fichier dans la collection sélectionnée
  const handleUploadFile = async () => {
    if (!selectedUploadFile || !selectedCollection) return;

    setIsUploading(true);
    setErrorMsg(null);
    setUploadSuccessMsg(null);

    try {
      const base64 = await fileToBase64(selectedUploadFile);
      const res = await uploadAlbertDocument({
        fileBase64: base64,
        fileName: selectedUploadFile.name,
        mimeType: selectedUploadFile.type || 'text/plain',
        name: selectedUploadFile.name,
        collection_id: selectedCollection.id,
        chunk_size: uploadChunkSize,
        chunk_overlap: uploadChunkOverlap,
        customApiKey: settings?.albertApiKey,
      });

      setUploadSuccessMsg(
        `Fichier "${selectedUploadFile.name}" indexé avec succès dans "${selectedCollection.name}" ! (ID Document : ${res.id})`
      );
      setSelectedUploadFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      // Rafraîchir les documents et la collection
      await loadDocumentsForCollection(selectedCollection.id);
      await loadCollections();
    } catch (err: any) {
      setErrorMsg('Échec de l’importation du fichier : ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // 8. Supprimer un document d'une collection
  const handleDeleteDocument = async (docId: number) => {
    if (!confirm('Supprimer ce document de la collection ?')) return;
    try {
      await deleteAlbertDocument(docId, settings?.albertApiKey);
      if (selectedCollection) {
        await loadDocumentsForCollection(selectedCollection.id);
      }
      await loadCollections();
    } catch (err: any) {
      setErrorMsg('Erreur suppression document : ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* En-tête & Switch de sous-onglets */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              API Albert DINUM · Recherche Augmentée par Génération
            </span>
            <span className="text-xs text-slate-500">· Souveraineté des corpus</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Centre RAG & Gestion Documentaire
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Recherchez dans les millions de textes officiels de l'État (Légifrance, Programmes
            scolaires, Fiches service-public) ou indexez vos propres règlements, plans de culture et
            cours Agrocampus dans des collections sécurisées.
          </p>
        </div>

        {/* Boutons d'onglets principaux */}
        <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 shrink-0 self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab('search')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors ${
              activeSubTab === 'search'
                ? 'bg-white text-blue-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-blue-700" />
            <span>Recherche Sémantique</span>
          </button>
          <button
            onClick={() => setActiveSubTab('collections')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors ${
              activeSubTab === 'collections'
                ? 'bg-white text-blue-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-700" />
            <span>Mes Collections & Fichiers ({collections.length})</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2 shadow-2xs">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <span className="font-semibold">Information système : </span>
            {errorMsg}
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-red-500 hover:text-red-700 font-bold ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* VUE 1 : RECHERCHE SÉMANTIQUE & INTERROGATION              */}
      {/* ========================================================= */}
      {activeSubTab === 'search' && (
        <div className="space-y-6">
          {/* Barre de recherche et filtres avancés */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="flex flex-col sm:flex-row gap-2"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Posez une question ou tapez des mots-clés (ex: maraîchage biologique, arrêtés sécheresse Yvelines, CCF Bac Pro, EGalim...)"
                  className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-900"
                />
              </div>
              <button
                type="submit"
                disabled={isLoadingSearch}
                className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                {isLoadingSearch ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Recherche...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Lancer la recherche</span>
                  </>
                )}
              </button>
            </form>

            {/* Filtres de collections & curseur de score */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* Filtre de collection */}
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Corpus interrogé :</span>
                <select
                  value={filterCollectionId}
                  onChange={(e) =>
                    setFilterCollectionId(
                      e.target.value === 'all' ? 'all' : Number(e.target.value)
                    )
                  }
                  className="p-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">Toutes les collections (Albert + Agrocampus)</option>
                  {collections.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name} ({col.documents || 0} doc
                      {col.documents && col.documents > 1 ? 's' : ''})
                    </option>
                  ))}
                </select>
              </div>

              {/* Seuil de similarité sémantique */}
              <div className="flex items-center gap-2">
                <span className="text-slate-500">
                  Score min : <span className="font-mono font-bold text-blue-700">{Math.round(minScoreThreshold * 100)}%</span>
                </span>
                <input
                  type="range"
                  min="0.2"
                  max="0.9"
                  step="0.05"
                  value={minScoreThreshold}
                  onChange={(e) => setMinScoreThreshold(parseFloat(e.target.value))}
                  className="w-24 accent-blue-600"
                  title="Ajuster le seuil de pertinence"
                />
              </div>

              {/* Tags thématiques */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                <span className="text-slate-400 text-[11px] mr-1">Thématique :</span>
                {tags.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTag(t)}
                    className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                      selectedTag === t
                        ? 'bg-blue-100 text-blue-900 font-semibold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Suggestions documentaires ciblées selon le profil métier actif */}
              {userProfile && userProfile.suggestedRagTags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs w-full">
                  <span className="text-slate-500 font-medium text-[11px] flex items-center gap-1">
                    <Tag className="w-3 h-3 text-blue-600" />
                    <span>Suggestions pour {userProfile.shortLabel} :</span>
                  </span>
                  {userProfile.suggestedRagTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setQuery(tag);
                        handleSearch(tag);
                      }}
                      className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-[11px] hover:bg-blue-100 transition-colors font-medium cursor-pointer"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Liste des résultats */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-slate-700">
                {results.length} extrait(s) pertinent(s) trouvé(s)
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                Moteur sémantique Albert /v1/search (embeddings bge-m3)
              </span>
            </div>

            {results.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-xs text-slate-500 space-y-2">
                <p className="font-semibold text-slate-700">Aucun résultat pour ce critère</p>
                <p>
                  Essayez avec des termes plus larges ou baissez le curseur de score de similarité.
                </p>
              </div>
            ) : (
              results.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 transition-all shadow-2xs flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 text-xs text-blue-800 font-semibold">
                        <FileCheck className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>{doc.source}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-slate-500">
                        {doc.date && <span>{doc.date}</span>}
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Similarité : {(doc.score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mb-2">
                      {doc.title}
                    </h3>

                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-3.5 rounded-lg border border-slate-100 font-sans">
                      {doc.text}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      {doc.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                      {doc.url && (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-slate-500 hover:text-blue-700 transition-colors ml-2"
                          title="Consulter la source officielle"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span className="text-[11px]">Source officielle</span>
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() => onInjectIntoChat(doc)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-2xs cursor-pointer"
                    >
                      <MessageSquareShare className="w-3.5 h-3.5" />
                      <span>Analyser avec Albert dans le Chat</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VUE 2 : MES COLLECTIONS & IMPORT DE FICHIERS (API ALBERT)  */}
      {/* ========================================================= */}
      {activeSubTab === 'collections' && (
        <div className="space-y-6">
          {/* Bannière explicative souveraine */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-blue-950">
                Pipeline RAG Souverain de l'État (DINUM) :
              </span>{' '}
              Lorsque vous déposez un fichier, Albert API le découpe en fragments (chunks) sémantiques
              de 2048 caractères et calcule leurs vecteurs d'embeddings (bge-m3) directement sur les
              serveurs sécurisés de l'État français. Vos données restent confidentielles et privées.
            </div>
          </div>

          {/* Grille principale : Collections à gauche / Documents & Import à droite */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonne gauche (1/3) : Liste des Collections */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-blue-700" />
                  <span>Collections Albert ({collections.length})</span>
                </h2>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                >
                  <FolderPlus className="w-3 h-3" />
                  <span>Nouvelle</span>
                </button>
              </div>

              {isLoadingCollections ? (
                <div className="p-8 bg-white border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                  <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-blue-600" />
                  Chargement des collections...
                </div>
              ) : collections.length === 0 ? (
                <div className="p-6 bg-white border border-slate-200 rounded-xl text-center text-xs text-slate-500 space-y-2">
                  <p>Aucune collection pour l’instant.</p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="text-blue-700 hover:underline font-semibold"
                  >
                    Créer ma première collection
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
                  {collections.map((col) => {
                    const isSelected = selectedCollection?.id === col.id;
                    const isPublic = col.visibility === 'public';

                    return (
                      <div
                        key={col.id}
                        onClick={() => setSelectedCollection(col)}
                        className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50/80 border-blue-300 shadow-2xs ring-1 ring-blue-300'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-slate-900 truncate">
                            {col.name}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${
                              isPublic
                                ? 'bg-slate-100 text-slate-600 border border-slate-200'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {isPublic ? 'Public État' : 'Privé'}
                          </span>
                        </div>

                        {col.description && (
                          <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">
                            {col.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-slate-100/80 text-[11px] text-slate-500 font-mono">
                          <span>
                            {col.documents ?? 0} document{col.documents !== 1 ? 's' : ''}
                          </span>

                          {!isPublic && (
                            <button
                              onClick={(e) => handleDeleteCollection(col.id, e)}
                              className="text-slate-400 hover:text-red-600 p-0.5 rounded hover:bg-red-50 transition-colors"
                              title="Supprimer la collection"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Colonne droite (2/3) : Fichiers de la collection sélectionnée & Import */}
            <div className="lg:col-span-2 space-y-4">
              {selectedCollection ? (
                <>
                  {/* Carte d'en-tête de la collection */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            Collection #{selectedCollection.id}
                          </span>
                          <h2 className="text-base font-bold text-slate-900">
                            {selectedCollection.name}
                          </h2>
                        </div>
                        {selectedCollection.description && (
                          <p className="text-xs text-slate-600 mt-1">
                            {selectedCollection.description}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setFilterCollectionId(selectedCollection.id);
                          setActiveSubTab('search');
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Rechercher dans ce corpus</span>
                      </button>
                    </div>

                    {/* Zone de dépôt et téléversement de fichier */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <UploadCloud className="w-4 h-4 text-blue-700" />
                          <span>Importer et indexer un fichier dans cette collection</span>
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Formats : PDF, TXT, DOCX, MD, CSV
                        </span>
                      </div>

                      <input
                        type="file"
                        ref={fileInputRef}
                        accept=".pdf,.txt,.docx,.md,.csv,text/plain,application/pdf"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setSelectedUploadFile(e.target.files[0]);
                            setUploadSuccessMsg(null);
                          }
                        }}
                        className="hidden"
                      />

                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white rounded-lg p-5 text-center cursor-pointer transition-colors group"
                      >
                        <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-blue-600 mx-auto mb-1.5 transition-colors" />
                        <span className="text-xs font-semibold text-slate-800 block">
                          {selectedUploadFile
                            ? selectedUploadFile.name
                            : 'Cliquez ou glissez un fichier ici pour l’indexer'}
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          {selectedUploadFile
                            ? `${(selectedUploadFile.size / 1024).toFixed(1)} Ko`
                            : 'Le document sera automatiquement découpé en morceaux indexés'}
                        </span>
                      </div>

                      {/* Paramètres de chunking avancés */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-1">
                            Taille des fragments (chunk_size) :{' '}
                            <span className="font-mono font-bold text-slate-800">
                              {uploadChunkSize} car.
                            </span>
                          </label>
                          <input
                            type="range"
                            min="512"
                            max="4096"
                            step="256"
                            value={uploadChunkSize}
                            onChange={(e) => setUploadChunkSize(parseInt(e.target.value, 10))}
                            className="w-full accent-blue-600"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-1">
                            Chevauchement (chunk_overlap) :{' '}
                            <span className="font-mono font-bold text-slate-800">
                              {uploadChunkOverlap} car.
                            </span>
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="500"
                            step="50"
                            value={uploadChunkOverlap}
                            onChange={(e) => setUploadChunkOverlap(parseInt(e.target.value, 10))}
                            className="w-full accent-blue-600"
                          />
                        </div>
                      </div>

                      {/* Bouton d'action d'importation */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                        {selectedUploadFile && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUploadFile(null);
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-md"
                          >
                            Annuler
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleUploadFile}
                          disabled={!selectedUploadFile || isUploading}
                          className={`px-4 py-2 rounded-lg text-xs font-semibold text-white transition-colors flex items-center gap-2 cursor-pointer shadow-xs ${
                            !selectedUploadFile || isUploading
                              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                              : 'bg-blue-700 hover:bg-blue-800'
                          }`}
                        >
                          {isUploading ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Indexation en cours via Albert API...</span>
                            </>
                          ) : (
                            <>
                              <UploadCloud className="w-3.5 h-3.5" />
                              <span>Indexer dans cette collection</span>
                            </>
                          )}
                        </button>
                      </div>

                      {uploadSuccessMsg && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{uploadSuccessMsg}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Documents indexés dans cette collection */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-700" />
                        <span>Documents indexés dans cette collection ({collectionDocuments.length})</span>
                      </h3>
                      <button
                        onClick={() => loadDocumentsForCollection(selectedCollection.id)}
                        className="text-xs text-blue-700 hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Actualiser</span>
                      </button>
                    </div>

                    {isLoadingDocs ? (
                      <div className="p-6 text-center text-xs text-slate-500">
                        <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-blue-600" />
                        Récupération des documents...
                      </div>
                    ) : collectionDocuments.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">
                        Aucun document spécifique téléversé dans cette collection. Déposez un fichier ci-dessus pour démarrer.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
                        {collectionDocuments.map((doc) => (
                          <div
                            key={doc.id}
                            className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-50 p-2 rounded transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <span className="font-semibold text-slate-900 block truncate">
                                {doc.name || `Document #${doc.id}`}
                              </span>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                                <span>ID : {doc.id}</span>
                                {doc.chunks_count !== undefined && (
                                  <>
                                    <span>·</span>
                                    <span>{doc.chunks_count} fragments</span>
                                  </>
                                )}
                                {doc.created && (
                                  <>
                                    <span>·</span>
                                    <span>
                                      {new Date(doc.created * 1000).toLocaleDateString('fr-FR')}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                              title="Supprimer ce document de la collection"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-xs text-slate-500">
                  Sélectionnez une collection à gauche pour afficher ses fichiers et en ajouter de nouveaux.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Création Nouvelle Collection */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-blue-700" />
                <span>Créer une collection Albert RAG</span>
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateCollection} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Nom de la collection *
                </label>
                <input
                  type="text"
                  required
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  placeholder="ex: agrocampus-maraichage-bio"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs text-slate-900 font-mono"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Identifiant sans espaces ni caractères spéciaux (lettres minuscules, tirets).
                </span>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Description & Objectif du corpus
                </label>
                <textarea
                  rows={3}
                  value={newColDesc}
                  onChange={(e) => setNewColDesc(e.target.value)}
                  placeholder="ex: Corpus rassemblant les fiches de culture maraîchère, rotations bio et arrêtés préfectoraux d'irrigation pour l'Agrocampus."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs text-slate-900 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900 rounded-md"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCol || !newColName.trim()}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  {isCreatingCol ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Création...</span>
                    </>
                  ) : (
                    <>
                      <FolderPlus className="w-3.5 h-3.5" />
                      <span>Créer la collection</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
