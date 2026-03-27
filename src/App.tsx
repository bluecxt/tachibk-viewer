import { useEffect, useMemo, useState } from "react";
import AnimeTable from "./components/AnimeTable";
import AnimeFullDetailsSection from "./components/AnimeFullDetailsSection";
import CategoryEditModal from "./components/CategoryEditModal";
import CategoriesSection from "./components/CategoriesSection";
import CustomButtonsSection from "./components/CustomButtonsSection";
import CustomButtonEditModal from "./components/CustomButtonEditModal";
import ExportModal from "./components/ExportModal";
import ExtensionsSection from "./components/ExtensionsSection";
import PreferenceTable from "./components/PreferenceTable";
import PreferenceEditModal from "./components/PreferenceEditModal";
import RepoEditModal from "./components/RepoEditModal";
import ReposSection from "./components/ReposSection";
import SourcePreferencesSection from "./components/SourcePreferencesSection";
import SourcesSection from "./components/SourcesSection";
import StatisticsSection from "./components/StatisticsSection";
import SummaryCards, { type SummaryTarget } from "./components/SummaryCards";
import {
  deleteStoredBackupFile,
  getStoredBackupFileBuffer,
  listStoredBackupFiles,
  saveBackupFile,
  type StoredBackupFileMeta,
} from "./lib/historyStorage";
import { parseBackupBufferWithWorker } from "./lib/workerClient";
import type {
  UiBackup,
  UiCategory,
  UiCustomButton,
  UiExtensionRepo,
  UiPreference,
  UiSourcePreference,
} from "./lib/types";

type SectionId =
  | "summary"
  | "stats"
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
  const [editingCategory, setEditingCategory] = useState<{
    index: number;
    item: UiCategory;
  } | null>(null);
  const [editingRepo, setEditingRepo] = useState<{
    index: number;
    item: UiExtensionRepo;
  } | null>(null);
  const [editingCustomButton, setEditingCustomButton] = useState<{
    index: number;
    item: UiCustomButton;
  } | null>(null);
  const [editingPreference, setEditingPreference] = useState<{
    index: number;
    item: UiPreference;
  } | null>(null);
  const [editingSourcePrefs, setEditingSourcePrefs] = useState<{
    sourceIndex: number;
    prefIndex: number | null;
  } | null>(null);

  const sections = useMemo(
    () => [
      { id: "summary" as const, label: "Summary" },
      { id: "stats" as const, label: "Stats" },
      { id: "library" as const, label: "Anime" },
      { id: "advanced" as const, label: "Advanced" },
      { id: "categories" as const, label: "Categories" },
      { id: "sources" as const, label: "Sources" },
      { id: "preferences" as const, label: "Preferences" },
      { id: "sourcePrefs" as const, label: "Source preferences" },
      { id: "extensions" as const, label: "Extensions" },
      { id: "repos" as const, label: "Repos" },
      { id: "customButtons" as const, label: "Buttons" },
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
        err instanceof Error ? err.message : "Unable to parse this file",
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
        throw new Error("File not found in local storage");
      }
      const parsed = await parseBackupBufferWithWorker(buffer.slice(0));
      setBackup(parsed);
      setFileName(item.name);
      setSection("library");
      setAdvancedAnimeId(parsed.anime[0]?.id ?? null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load this history item",
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
    return new Intl.DateTimeFormat("en-US", {
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

  function handleUpdateCategory(index: number, updatedCategory: UiCategory) {
    setBackup((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        categories: prev.categories.map((item, itemIndex) =>
          itemIndex === index ? updatedCategory : item,
        ),
      };
    });
  }

  function handleAddCategory() {
    setBackup((prev) => {
      if (!prev) return prev;
      const nextOrder = Math.max(0, ...prev.categories.map(c => c.order)) + 1;
      const newCat: UiCategory = {
        name: "New Category",
        order: nextOrder,
        flags: 0,
        hidden: false
      };
      return {
        ...prev,
        categories: [...prev.categories, newCat]
      };
    });
  }

  function handleDeleteCategory(order: number) {
    setBackup((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        categories: prev.categories.filter(c => c.order !== order),
        // We should also remove this category from all anime
        anime: prev.anime.map(a => ({
            ...a,
            categories: a.categories.filter(o => o !== order)
        }))
      };
    });
  }

  function handleUpdateRepo(index: number, updatedRepo: UiExtensionRepo) {
    setBackup((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        extensionRepos: prev.extensionRepos.map((item, itemIndex) =>
          itemIndex === index ? updatedRepo : item,
        ),
      };
    });
  }

  function handleAddRepo() {
    setBackup((prev) => {
        if (!prev) return prev;
        const newRepo: UiExtensionRepo = {
            name: "New Repo",
            baseUrl: "https://",
            shortName: null,
            website: "https://",
            signingKeyFingerprint: "",
            isVisible: true,
            author: null
        };
        return {
            ...prev,
            extensionRepos: [...prev.extensionRepos, newRepo]
        };
    });
  }

  function handleDeleteRepo(index: number) {
    setBackup((prev) => {
        if (!prev) return prev;
        return {
            ...prev,
            extensionRepos: prev.extensionRepos.filter((_, i) => i !== index)
        };
    });
  }

  function handleUpdateCustomButton(
    index: number,
    updatedButton: UiCustomButton,
  ) {
    setBackup((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        customButtons: prev.customButtons.map((item, itemIndex) =>
          itemIndex === index ? updatedButton : item,
        ),
      };
    });
  }

  function handleUpdatePreference(index: number, updated: UiPreference) {
    setBackup((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        preferences: prev.preferences.map((item, i) => i === index ? updated : item)
      };
    });
  }

  function handleUpdateSourcePreference(sourceIndex: number, prefIndex: number, updated: UiPreference) {
    setBackup((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sourcePreferences: prev.sourcePreferences.map((s, si) => {
            if (si !== sourceIndex) return s;
            return {
                ...s,
                prefs: s.prefs.map((p, pi) => pi === prefIndex ? updated : p)
            };
        })
      };
    });
  }

  function handleAddCustomButton() {
    setBackup((prev) => {
        if (!prev) return prev;
        const nextIndex = Math.max(0, ...prev.customButtons.map(b => b.sortIndex)) + 1;
        const newButton: UiCustomButton = {
            name: "New Button",
            isFavorite: false,
            sortIndex: nextIndex,
            content: "",
            longPressContent: "",
            onStartup: ""
        };
        return {
            ...prev,
            customButtons: [...prev.customButtons, newButton]
        };
    });
  }

  function handleDeleteCustomButton(index: number) {
    setBackup((prev) => {
        if (!prev) return prev;
        return {
            ...prev,
            customButtons: prev.customButtons.filter((_, i) => i !== index)
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
          Import file
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
        {loading && <p className="meta-line">Parsing...</p>}
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
          <h2>Local history</h2>
          {historyFiles.length === 0 && (
            <p className="meta-line">No stored files</p>
          )}
          {historyFiles.map((item) => (
            <article key={item.id} className="history-item">
              <div>
                <p className="history-name">{item.name}</p>
                <p className="history-meta">
                  {Math.round(item.size / 1024)} KB •{" "}
                  {formatShortDate(item.importedAt)}
                </p>
              </div>
              <div className="history-actions">
                <button
                  type="button"
                  onClick={() => void handleLoadHistoryItem(item)}
                  disabled={loading}
                >
                  {historyLoadingId === item.id ? "..." : "Open"}
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
              <h2>No backup loaded</h2>
              <p>Import a `.tachibk` file from the left sidebar.</p>
            </div>
          </section>
        )}

        {backup && section === "summary" && (
          <section className="panel" id="summary">
            <div className="panel-head">
              <h2>Summary</h2>
              <p>
                {backup.isLegacy
                  ? "Legacy format detected"
                  : "Modern format detected"}
              </p>
            </div>
            <SummaryCards backup={backup} onOpen={(target) => setSection(target as SectionId)} />
          </section>
        )}

        {backup && section === "stats" && (
          <StatisticsSection anime={backup.anime} />
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
            onEditCategory={(index) =>
              setEditingCategory({
                index,
                item: backup.categories.find((cat) => cat.order === index) ?? {
                  name: "",
                  order: index,
                  flags: 0,
                  hidden: false,
                },
              })
            }
            onAddCategory={handleAddCategory}
          />
        )}

        {backup && section === "sources" && (
          <SourcesSection sources={backup.sources} />
        )}

        {backup && section === "preferences" && (
          <PreferenceTable 
            preferences={backup.preferences} 
            onEditPreference={(index) => setEditingPreference({ index, item: backup.preferences[index] })}
          />
        )}

        {backup && section === "sourcePrefs" && (
          <>
            {editingSourcePrefs && editingSourcePrefs.prefIndex === null ? (
                <div className="panel">
                    <div className="panel-head">
                        <h3>Editing: {backup.sourcePreferences[editingSourcePrefs.sourceIndex].sourceKey}</h3>
                        <button className="modal-close" onClick={() => setEditingSourcePrefs(null)}>Back</button>
                    </div>
                    <PreferenceTable 
                        preferences={backup.sourcePreferences[editingSourcePrefs.sourceIndex].prefs}
                        onEditPreference={(pi) => setEditingSourcePrefs(prev => prev ? { ...prev, prefIndex: pi } : null)}
                    />
                </div>
            ) : (
                <SourcePreferencesSection
                    sourcePreferences={backup.sourcePreferences}
                    onEditSource={(index) => setEditingSourcePrefs({ sourceIndex: index, prefIndex: null })}
                />
            )}
          </>
        )}

        {backup && section === "extensions" && (
          <ExtensionsSection extensions={backup.extensions} />
        )}

        {backup && section === "repos" && (
          <ReposSection
            repos={backup.extensionRepos}
            onEditRepo={(index) =>
              setEditingRepo({ index, item: backup.extensionRepos[index] })
            }
            onAddRepo={handleAddRepo}
          />
        )}

        {backup && section === "customButtons" && (
          <CustomButtonsSection
            customButtons={backup.customButtons}
            onEditButton={(index) =>
              setEditingCustomButton({
                index,
                item: backup.customButtons[index],
              })
            }
            onAddButton={handleAddCustomButton}
          />
        )}
      </section>

      {backup && showExportModal && (
        <ExportModal
          backup={backup}
          categories={backup.categories}
          sources={backup.sources}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {backup && editingCategory && (
        <CategoryEditModal
          category={editingCategory.item}
          onClose={() => setEditingCategory(null)}
          onSave={(updated) => {
            handleUpdateCategory(editingCategory.index, updated);
            setEditingCategory(null);
          }}
          onDelete={() => {
              handleDeleteCategory(editingCategory.index);
              setEditingCategory(null);
          }}
        />
      )}

      {backup && editingRepo && (
        <RepoEditModal
          repo={editingRepo.item}
          onClose={() => setEditingRepo(null)}
          onSave={(updated) => {
            handleUpdateRepo(editingRepo.index, updated);
            setEditingRepo(null);
          }}
          onDelete={() => {
              handleDeleteRepo(editingRepo.index);
              setEditingRepo(null);
          }}
        />
      )}

      {backup && editingCustomButton && (
        <CustomButtonEditModal
          button={editingCustomButton.item}
          onClose={() => setEditingCustomButton(null)}
          onSave={(updated) => {
            handleUpdateCustomButton(editingCustomButton.index, updated);
            setEditingCustomButton(null);
          }}
          onDelete={() => {
              handleDeleteCustomButton(editingCustomButton.index);
              setEditingCustomButton(null);
          }}
        />
      )}

      {backup && editingPreference && (
        <PreferenceEditModal
          preference={editingPreference.item}
          onClose={() => setEditingPreference(null)}
          onSave={(updated) => {
            handleUpdatePreference(editingPreference.index, updated);
            setEditingPreference(null);
          }}
        />
      )}

      {backup && editingSourcePrefs && editingSourcePrefs.prefIndex !== null && (
        <PreferenceEditModal
          preference={backup.sourcePreferences[editingSourcePrefs.sourceIndex].prefs[editingSourcePrefs.prefIndex]}
          onClose={() => setEditingSourcePrefs(prev => prev ? { ...prev, prefIndex: null } : null)}
          onSave={(updated) => {
            handleUpdateSourcePreference(editingSourcePrefs.sourceIndex, editingSourcePrefs.prefIndex!, updated);
            setEditingSourcePrefs(prev => prev ? { ...prev, prefIndex: null } : null);
          }}
        />
      )}
    </main>
  );
}
