import { useMemo, useState } from "react";
import { buildExportBlob, type ExportOptions } from "../lib/exportBuilder";
import type { UiBackup, UiCategory } from "../lib/types";

type Props = {
  backup: UiBackup;
  categories: UiCategory[];
  onClose: () => void;
};

const defaultOptions: ExportOptions = {
  format: "json",
  includeAnime: true,
  includeCategories: true,
  includeSources: true,
  includePreferences: false,
  includeSourcePreferences: false,
  includeExtensions: false,
  includeRepos: true,
  includeCustomButtons: true,
  onlyWithExternalTracker: false,
  minExternalScoreEnabled: false,
  minExternalScore: 7,
  categoryFilter: "all",
};

export default function ExportModal({ backup, categories, onClose }: Props) {
  const [options, setOptions] = useState<ExportOptions>(defaultOptions);

  const categoryOptions = useMemo(
    () => [...categories].sort((a, b) => a.order - b.order),
    [categories],
  );

  function triggerExport() {
    const { blob, extension } = buildExportBlob(backup, options);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tachibk-export-${Date.now()}.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal-content" onClick={(event) => event.stopPropagation()}>
        <div className="modal-actions">
          <button type="button" className="modal-close" onClick={onClose}>
            Fermer
          </button>
          <button type="button" className="modal-save" onClick={triggerExport}>
            Exporter
          </button>
        </div>
        <h3>Export</h3>
        <p className="muted">Choisis précisément quoi exporter et dans quel format.</p>

        <div className="edit-grid">
          <label>
            Format
            <select
              value={options.format}
              onChange={(event) =>
                setOptions((prev) => ({ ...prev, format: event.target.value as "json" | "tachibk" }))
              }
            >
              <option value="json">JSON</option>
              <option value="tachibk">Tachibk</option>
            </select>
          </label>

          <label>
            Catégorie (filtre)
            <select
              value={String(options.categoryFilter)}
              onChange={(event) =>
                setOptions((prev) => ({
                  ...prev,
                  categoryFilter:
                    event.target.value === "all" ? "all" : Number.parseInt(event.target.value, 10),
                }))
              }
            >
              <option value="all">Toutes</option>
              {categoryOptions.map((cat) => (
                <option key={cat.order} value={cat.order}>
                  {cat.order} - {cat.name || "sans nom"}
                </option>
              ))}
            </select>
          </label>

          <label className="edit-check">
            <input
              type="checkbox"
              checked={options.onlyWithExternalTracker}
              onChange={(event) =>
                setOptions((prev) => ({ ...prev, onlyWithExternalTracker: event.target.checked }))
              }
            />
            Anime avec tracker externe
          </label>

          <label className="edit-check">
            <input
              type="checkbox"
              checked={options.minExternalScoreEnabled}
              onChange={(event) =>
                setOptions((prev) => ({ ...prev, minExternalScoreEnabled: event.target.checked }))
              }
            />
            Note externe min
          </label>

          <label>
            Valeur note min
            <input
              type="number"
              step="0.1"
              value={options.minExternalScore}
              onChange={(event) =>
                setOptions((prev) => ({
                  ...prev,
                  minExternalScore: Number.parseFloat(event.target.value) || 0,
                }))
              }
              disabled={!options.minExternalScoreEnabled}
            />
          </label>
        </div>

        <div className="detail-block">
          <h4>Sections à inclure</h4>
          <div className="edit-grid">
            <label className="edit-check">
              <input
                type="checkbox"
                checked={options.includeAnime}
                onChange={(event) =>
                  setOptions((prev) => ({ ...prev, includeAnime: event.target.checked }))
                }
              />
              Anime
            </label>
            <label className="edit-check">
              <input
                type="checkbox"
                checked={options.includeCategories}
                onChange={(event) =>
                  setOptions((prev) => ({ ...prev, includeCategories: event.target.checked }))
                }
              />
              Catégories
            </label>
            <label className="edit-check">
              <input
                type="checkbox"
                checked={options.includeSources}
                onChange={(event) =>
                  setOptions((prev) => ({ ...prev, includeSources: event.target.checked }))
                }
              />
              Sources
            </label>
            <label className="edit-check">
              <input
                type="checkbox"
                checked={options.includePreferences}
                onChange={(event) =>
                  setOptions((prev) => ({ ...prev, includePreferences: event.target.checked }))
                }
              />
              Préférences
            </label>
            <label className="edit-check">
              <input
                type="checkbox"
                checked={options.includeSourcePreferences}
                onChange={(event) =>
                  setOptions((prev) => ({
                    ...prev,
                    includeSourcePreferences: event.target.checked,
                  }))
                }
              />
              Prefs sources
            </label>
            <label className="edit-check">
              <input
                type="checkbox"
                checked={options.includeExtensions}
                onChange={(event) =>
                  setOptions((prev) => ({ ...prev, includeExtensions: event.target.checked }))
                }
              />
              Extensions
            </label>
            <label className="edit-check">
              <input
                type="checkbox"
                checked={options.includeRepos}
                onChange={(event) =>
                  setOptions((prev) => ({ ...prev, includeRepos: event.target.checked }))
                }
              />
              Repos
            </label>
            <label className="edit-check">
              <input
                type="checkbox"
                checked={options.includeCustomButtons}
                onChange={(event) =>
                  setOptions((prev) => ({ ...prev, includeCustomButtons: event.target.checked }))
                }
              />
              Boutons
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
