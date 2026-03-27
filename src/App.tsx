import { useEffect, useMemo, useState } from "react";
import AnimeTable from "./components/AnimeTable";
import AnimeFullDetailsSection from "./components/AnimeFullDetailsSection";
import CategoriesSection from "./components/CategoriesSection";
import CustomButtonsSection from "./components/CustomButtonsSection";
import ExportModal from "./components/ExportModal";
import ExtensionsSection from "./components/ExtensionsSection";
import PreferenceTable from "./components/PreferenceTable";
import ReposSection from "./components/ReposSection";
import SourcePreferencesSection from "./components/SourcePreferencesSection";
import SourcesSection from "./components/SourcesSection";
import SummaryCards, { type SummaryTarget } from "./components/SummaryCards";
import {
  deleteStoredBackupFile,
  getStoredBackupFileBuffer,
  listStoredBackupFiles,
  saveBackupFile,
  type StoredBackupFileMeta,
} from "./lib/historyStorage";
import { parseBackupBufferWithWorker } from "./lib/workerClient";
import type { UiBackup } from "./lib/types";

type SectionId =
  | "summary"
  | "library"
  | "advanced"
  | "categories"
  | "sources"
  | "preferences"
  | "sourcePrefs"
  | "extensions"
  | "repos"
  | "customButtons";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [backup, setBackup] = useState<UiBackup | null>(null);
  const [section, setSection] = useState<SectionId>("library");
  const [advancedAnimeId, setAdvancedAnimeId] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [historyFiles, setHistoryFiles] = useState<StoredBackupFileMeta[]>([]);
  const [historyLoadingId, setHistoryLoadingId] = useState<string | null>(null);

  const sections = useMemo(
    () => [
      { id: "summary" as const, label: "Résumé" },
      { id: "library" as const, label: "Anime" },
      { id: "advanced" as const, label: "Infos avancées" },
      { id: "categories" as const, label: "Catégories" },
      { id: "sources" as const, label: "Sources" },
      { id: "preferences" as const, label: "Préférences" },
      { id: "sourcePrefs" as const, label: "Prefs sources" },
      { id: "extensions" as const, label: "Extensions" },
      { id: "repos" as const, label: "Repos" },
      { id: "customButtons" as const, label: "Boutons" },
    ],
    [],
  );

  useEffect(() => {
    void refreshHistory();
  }, []);

  async function refreshHistory() {
    const items = await listStoredBackupFiles();
    setHistoryFiles(items);
  }

  async function handleFile(file: File) {
    setLoading(true);
    setError(null);
    setFileName(file.name);
    try {
      const buffer = await file.arrayBuffer();
      const parsed = await parseBackupBufferWithWorker(buffer.slice(0));
      setBackup(parsed);
      setSection("library");
      setAdvancedAnimeId(parsed.anime[0]?.id ?? null);
      await saveBackupFile(file, buffer);
      await refreshHistory();
    } catch (err) {
      setBackup(null);
      setError(
        err instanceof Error ? err.message : "Impossible de parser ce fichier",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadHistoryItem(item: StoredBackupFileMeta) {
    setLoading(true);
    setHistoryLoadingId(item.id);
    setError(null);
    try {
      const buffer = await getStoredBackupFileBuffer(item.id);
      if (!buffer) {
        throw new Error("Fichier introuvable dans le stockage local");
      }
      const parsed = await parseBackupBufferWithWorker(buffer.slice(0));
      setBackup(parsed);
      setFileName(item.name);
      setSection("library");
      setAdvancedAnimeId(parsed.anime[0]?.id ?? null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger cet historique",
      );
    } finally {
      setLoading(false);
      setHistoryLoadingId(null);
    }
  }

  async function handleDeleteHistoryItem(id: string) {
    await deleteStoredBackupFile(id);
    await refreshHistory();
  }

  function formatShortDate(ts: number) {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(ts);
  }

  function handleUpdateAnime(updatedAnime: UiBackup["anime"][number]) {
    setBackup((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        anime: prev.anime.map((item) =>
          item.id === updatedAnime.id ? updatedAnime : item,
        ),
      };
    });
  }

  function openSummaryTarget(target: SummaryTarget) {
    setSection(target as SectionId);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar panel">
        <p className="badge">Tachibk Viewer</p>
        <h1>aniZen backup</h1>
        <label htmlFor="backupFile" className="upload-label">
          Importer un fichier
        </label>
        <input
          id="backupFile"
          className="upload-input"
          type="file"
          accept=".tachibk,.md,.bin"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
        {fileName && <p className="meta-line">{fileName}</p>}
        {loading && <p className="meta-line">Parsing en cours...</p>}
        {error && <p className="error">{error}</p>}
        <button
          type="button"
          className="upload-label export-btn"
          onClick={() => setShowExportModal(true)}
          disabled={!backup}
        >
          Export
        </button>

        <nav className="side-nav">
          {sections.map((item) => (
            <button
              key={item.id}
              type="button"
              className={section === item.id ? "is-active" : ""}
              onClick={() => setSection(item.id)}
              disabled={!backup}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <section className="history-box">
          <h2>Historique local</h2>
          {historyFiles.length === 0 && (
            <p className="meta-line">Aucun fichier stocké</p>
          )}
          {historyFiles.map((item) => (
            <article key={item.id} className="history-item">
              <div>
                <p className="history-name">{item.name}</p>
                <p className="history-meta">
                  {Math.round(item.size / 1024)} Ko •{" "}
                  {formatShortDate(item.importedAt)}
                </p>
              </div>
              <div className="history-actions">
                <button
                  type="button"
                  onClick={() => void handleLoadHistoryItem(item)}
                  disabled={loading}
                >
                  {historyLoadingId === item.id ? "..." : "Ouvrir"}
                </button>
                <button
                  type="button"
                  onClick={() => void handleDeleteHistoryItem(item.id)}
                >
                  X
                </button>
              </div>
            </article>
          ))}
        </section>
      </aside>

      <section className="content-zone">
        {!backup && (
          <section className="panel">
            <div className="panel-head">
              <h2>Aucun backup chargé</h2>
              <p>Importe un fichier `.tachibk` dans la barre de gauche.</p>
            </div>
          </section>
        )}

        {backup && section === "summary" && (
          <section className="panel" id="summary">
            <div className="panel-head">
              <h2>Résumé</h2>
              <p>
                {backup.isLegacy
                  ? "Format legacy détecté"
                  : "Format moderne détecté"}
              </p>
            </div>
            <SummaryCards backup={backup} onOpen={openSummaryTarget} />
          </section>
        )}

        {backup && section === "library" && (
          <AnimeTable
            anime={backup.anime}
            categories={backup.categories}
            onUpdateAnime={handleUpdateAnime}
            onOpenFullDetails={(animeId) => {
              setAdvancedAnimeId(animeId);
              setSection("advanced");
            }}
          />
        )}

        {backup && section === "advanced" && (
          <AnimeFullDetailsSection
            anime={
              backup.anime.find((item) => item.id === advancedAnimeId) ?? null
            }
            categories={backup.categories}
            onBack={() => setSection("library")}
          />
        )}

        {backup && section === "categories" && (
          <CategoriesSection
            anime={backup.anime}
            categories={backup.categories}
          />
        )}

        {backup && section === "sources" && (
          <SourcesSection sources={backup.sources} />
        )}

        {backup && section === "preferences" && (
          <PreferenceTable preferences={backup.preferences} />
        )}

        {backup && section === "sourcePrefs" && (
          <SourcePreferencesSection
            sourcePreferences={backup.sourcePreferences}
          />
        )}

        {backup && section === "extensions" && (
          <ExtensionsSection extensions={backup.extensions} />
        )}

        {backup && section === "repos" && (
          <ReposSection repos={backup.extensionRepos} />
        )}

        {backup && section === "customButtons" && (
          <CustomButtonsSection customButtons={backup.customButtons} />
        )}
      </section>

      {backup && showExportModal && (
        <ExportModal
          backup={backup}
          categories={backup.categories}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </main>
  );
}
