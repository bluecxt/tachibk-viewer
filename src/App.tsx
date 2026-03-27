import { useMemo, useState } from "react";
import AnimeTable from "./components/AnimeTable";
import CategoriesSection from "./components/CategoriesSection";
import PreferenceTable from "./components/PreferenceTable";
import SourcesSection from "./components/SourcesSection";
import SummaryCards from "./components/SummaryCards";
import { parseBackupWithWorker } from "./lib/workerClient";
import type { UiBackup } from "./lib/types";

type SectionId = "summary" | "library" | "categories" | "sources" | "preferences";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [backup, setBackup] = useState<UiBackup | null>(null);
  const [section, setSection] = useState<SectionId>("library");

  const sections = useMemo(
    () => [
      { id: "summary" as const, label: "Résumé" },
      { id: "library" as const, label: "Anime" },
      { id: "categories" as const, label: "Catégories" },
      { id: "sources" as const, label: "Sources" },
      { id: "preferences" as const, label: "Préférences" },
    ],
    [],
  );

  async function handleFile(file: File) {
    setLoading(true);
    setError(null);
    setFileName(file.name);
    try {
      const parsed = await parseBackupWithWorker(file);
      setBackup(parsed);
      setSection("library");
    } catch (err) {
      setBackup(null);
      setError(err instanceof Error ? err.message : "Impossible de parser ce fichier");
    } finally {
      setLoading(false);
    }
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
              <p>{backup.isLegacy ? "Format legacy détecté" : "Format moderne détecté"}</p>
            </div>
            <SummaryCards backup={backup} />
          </section>
        )}

        {backup && section === "library" && (
          <AnimeTable anime={backup.anime} categories={backup.categories} />
        )}

        {backup && section === "categories" && (
          <CategoriesSection anime={backup.anime} categories={backup.categories} />
        )}

        {backup && section === "sources" && <SourcesSection sources={backup.sources} />}

        {backup && section === "preferences" && (
          <PreferenceTable preferences={backup.preferences} />
        )}
      </section>
    </main>
  );
}
