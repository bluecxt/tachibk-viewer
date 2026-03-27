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
  categoryFilterMode: "include",
  selectedCategoryOrders: [],
};

export default function ExportModal({ backup, categories, onClose }: Props) {
  const [options, setOptions] = useState<ExportOptions>(defaultOptions);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

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

  function toggleCategory(order: number) {
      setOptions(prev => {
          const exists = prev.selectedCategoryOrders.includes(order);
          const next = exists 
            ? prev.selectedCategoryOrders.filter(o => o !== order)
            : [...prev.selectedCategoryOrders, order];
          return { ...prev, selectedCategoryOrders: next };
      });
  }

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="modal-content"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-actions">
          <button type="button" className="modal-close" onClick={onClose}>
            Close
          </button>
          <button type="button" className="modal-save" onClick={triggerExport}>
            Export
          </button>
        </div>
        <h3>Export</h3>
        <p className="muted">
          Choose exactly what to export and in which format.
        </p>

        <div className="edit-grid">
          <label>
            Format
            <select
              value={options.format}
              onChange={(event) =>
                setOptions((prev) => ({
                  ...prev,
                  format: event.target.value as any,
                }))
              }
            >
              <option value="json">JSON (Full)</option>
              <option value="ai-json">AI (Optimized)</option>
              <option value="tachibk">Tachibk (Standard)</option>
            </select>
          </label>

          <div className="edit-block">
              <span>Categories filter</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select 
                    value={options.categoryFilterMode}
                    onChange={e => setOptions(p => ({ ...p, categoryFilterMode: e.target.value as any }))}
                    style={{ flex: 1 }}
                >
                    <option value="include">Include</option>
                    <option value="exclude">Exclude</option>
                </select>
                <button 
                    type="button" 
                    className="chip"
                    onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                >
                    {options.selectedCategoryOrders.length} selected
                </button>
              </div>
              {showCategoryMenu && (
                  <div className="detail-block" style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '8px' }}>
                      {categoryOptions.map(cat => (
                          <label key={cat.order} className="edit-check" style={{ margin: '4px 0' }}>
                              <input 
                                type="checkbox"
                                checked={options.selectedCategoryOrders.includes(cat.order)}
                                onChange={() => toggleCategory(cat.order)}
                              />
                              {cat.name || `ID ${cat.order}`}
                          </label>
                      ))}
                      {categoryOptions.length === 0 && <p className="muted">No categories</p>}
                  </div>
              )}
          </div>

          <label className="edit-check">
            <input
              type="checkbox"
              checked={options.onlyWithExternalTracker}
              onChange={(event) =>
                setOptions((prev) => ({
                  ...prev,
                  onlyWithExternalTracker: event.target.checked,
                }))
              }
            />
            Only with external tracker
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px', alignItems: 'center' }}>
            <label className="edit-check" style={{ marginTop: 0 }}>
                <input
                type="checkbox"
                checked={options.minExternalScoreEnabled}
                onChange={(event) =>
                    setOptions((prev) => ({
                    ...prev,
                    minExternalScoreEnabled: event.target.checked,
                    }))
                }
                />
                Min score
            </label>
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
              style={{ opacity: options.minExternalScoreEnabled ? 1 : 0.5 }}
            />
          </div>
        </div>

        {options.format !== "ai-json" && (
            <div className="detail-block">
            <h4>Sections to include</h4>
            <div className="edit-grid">
                <label className="edit-check">
                <input
                    type="checkbox"
                    checked={options.includeAnime}
                    onChange={(event) =>
                    setOptions((prev) => ({
                        ...prev,
                        includeAnime: event.target.checked,
                    }))
                    }
                />
                Anime
                </label>
                <label className="edit-check">
                <input
                    type="checkbox"
                    checked={options.includeCategories}
                    onChange={(event) =>
                    setOptions((prev) => ({
                        ...prev,
                        includeCategories: event.target.checked,
                    }))
                    }
                />
                Categories
                </label>
                <label className="edit-check">
                <input
                    type="checkbox"
                    checked={options.includeSources}
                    onChange={(event) =>
                    setOptions((prev) => ({
                        ...prev,
                        includeSources: event.target.checked,
                    }))
                    }
                />
                Sources
                </label>
                <label className="edit-check">
                <input
                    type="checkbox"
                    checked={options.includePreferences}
                    onChange={(event) =>
                    setOptions((prev) => ({
                        ...prev,
                        includePreferences: event.target.checked,
                    }))
                    }
                />
                Preferences
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
                Source prefs
                </label>
                <label className="edit-check">
                <input
                    type="checkbox"
                    checked={options.includeExtensions}
                    onChange={(event) =>
                    setOptions((prev) => ({
                        ...prev,
                        includeExtensions: event.target.checked,
                    }))
                    }
                />
                Extensions
                </label>
                <label className="edit-check">
                <input
                    type="checkbox"
                    checked={options.includeRepos}
                    onChange={(event) =>
                    setOptions((prev) => ({
                        ...prev,
                        includeRepos: event.target.checked,
                    }))
                    }
                />
                Repos
                </label>
                <label className="edit-check">
                <input
                    type="checkbox"
                    checked={options.includeCustomButtons}
                    onChange={(event) =>
                    setOptions((prev) => ({
                        ...prev,
                        includeCustomButtons: event.target.checked,
                    }))
                    }
                />
                Buttons
                </label>
            </div>
            </div>
        )}

        {options.format === "ai-json" && (
            <div className="detail-block" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'var(--accent)' }}>
                <h4>AI Optimized Export</h4>
                <p className="muted" style={{ margin: 0 }}>
                    This format focuses on metadata (titles, genres, scores, status) to provide a compact context for AI recommendations.
                </p>
            </div>
        )}
      </div>
    </div>
  );
}
