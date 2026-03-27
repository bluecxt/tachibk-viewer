import { useMemo, useState } from "react";
import { buildExportBlob, type ExportOptions } from "../lib/exportBuilder";
import type { UiBackup, UiCategory, UiSource } from "../lib/types";

type Props = {
  backup: UiBackup;
  categories: UiCategory[];
  sources: UiSource[];
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
  sourceFilterMode: "include",
  selectedSourceIds: [],
};

export default function ExportModal({ backup, categories, sources, onClose }: Props) {
  const [options, setOptions] = useState<ExportOptions>(defaultOptions);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showSourceMenu, setShowSourceMenu] = useState(false);

  const categoryOptions = useMemo(
    () => [...categories].sort((a, b) => a.order - b.order),
    [categories],
  );

  const sourceOptions = useMemo(
      () => [...sources].sort((a, b) => a.name.localeCompare(b.name)),
      [sources]
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

  function toggleSource(id: number) {
      setOptions(prev => {
          const exists = prev.selectedSourceIds.includes(id);
          const next = exists 
            ? prev.selectedSourceIds.filter(o => o !== id)
            : [...prev.selectedSourceIds, id];
          return { ...prev, selectedSourceIds: next };
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
        style={{ maxWidth: '800px' }}
      >
        <div className="modal-actions">
          <button type="button" className="modal-close" onClick={onClose}>
            Close
          </button>
          <button type="button" className="modal-save" onClick={triggerExport}>
            Export
          </button>
        </div>
        <h3>Export Backup</h3>
        <p className="muted">
          Configure filters and format for your export.
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
              <option value="json">JSON (Full UI model)</option>
              <option value="ai-yaml">AI Optimized (YAML)</option>
              <option value="tachibk">Tachibk (AniZen compatible)</option>
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
                    <option value="include">Include selected</option>
                    <option value="exclude">Exclude selected</option>
                </select>
                <button 
                    type="button" 
                    className={`chip ${options.selectedCategoryOrders.length > 0 ? 'is-active' : ''}`}
                    onClick={() => { setShowCategoryMenu(!showCategoryMenu); setShowSourceMenu(false); }}
                >
                    {options.selectedCategoryOrders.length} selected
                </button>
              </div>
          </div>

          <div className="edit-block">
              <span>Sources filter</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select 
                    value={options.sourceFilterMode}
                    onChange={e => setOptions(p => ({ ...p, sourceFilterMode: e.target.value as any }))}
                    style={{ flex: 1 }}
                >
                    <option value="include">Include selected</option>
                    <option value="exclude">Exclude selected</option>
                </select>
                <button 
                    type="button" 
                    className={`chip ${options.selectedSourceIds.length > 0 ? 'is-active' : ''}`}
                    onClick={() => { setShowSourceMenu(!showSourceMenu); setShowCategoryMenu(false); }}
                >
                    {options.selectedSourceIds.length} selected
                </button>
              </div>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            {showCategoryMenu && (
                <div className="detail-block" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    <h4 style={{ marginBottom: '8px' }}>Select Categories</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '4px' }}>
                        {categoryOptions.map(cat => (
                            <label key={cat.order} className="edit-check" style={{ margin: 0, padding: '4px', background: options.selectedCategoryOrders.includes(cat.order) ? 'rgba(16, 185, 129, 0.1)' : 'transparent', borderRadius: '4px' }}>
                                <input 
                                    type="checkbox"
                                    checked={options.selectedCategoryOrders.includes(cat.order)}
                                    onChange={() => toggleCategory(cat.order)}
                                />
                                {cat.name || `ID ${cat.order}`}
                            </label>
                        ))}
                    </div>
                    {categoryOptions.length === 0 && <p className="muted">No categories</p>}
                </div>
            )}

            {showSourceMenu && (
                <div className="detail-block" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    <h4 style={{ marginBottom: '8px' }}>Select Sources</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '4px' }}>
                        {sourceOptions.map(src => (
                            <label key={src.sourceId} className="edit-check" style={{ margin: 0, padding: '4px', background: options.selectedSourceIds.includes(src.sourceId) ? 'rgba(16, 185, 129, 0.1)' : 'transparent', borderRadius: '4px' }}>
                                <input 
                                    type="checkbox"
                                    checked={options.selectedSourceIds.includes(src.sourceId)}
                                    onChange={() => toggleSource(src.sourceId)}
                                />
                                {src.name || `ID ${src.sourceId}`}
                            </label>
                        ))}
                    </div>
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

        {options.format !== "ai-yaml" && (
            <div className="detail-block">
            <h4>Sections to include</h4>
            <div className="edit-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
                <label className="edit-check"><input type="checkbox" checked={options.includeAnime} onChange={e => setOptions(p => ({ ...p, includeAnime: e.target.checked }))} /> Anime</label>
                <label className="edit-check"><input type="checkbox" checked={options.includeCategories} onChange={e => setOptions(p => ({ ...p, includeCategories: e.target.checked }))} /> Categories</label>
                <label className="edit-check"><input type="checkbox" checked={options.includeSources} onChange={e => setOptions(p => ({ ...p, includeSources: e.target.checked }))} /> Sources</label>
                <label className="edit-check"><input type="checkbox" checked={options.includePreferences} onChange={e => setOptions(p => ({ ...p, includePreferences: e.target.checked }))} /> Prefs</label>
                <label className="edit-check"><input type="checkbox" checked={options.includeSourcePreferences} onChange={e => setOptions(p => ({ ...p, includeSourcePreferences: e.target.checked }))} /> Source prefs</label>
                <label className="edit-check"><input type="checkbox" checked={options.includeExtensions} onChange={e => setOptions(p => ({ ...p, includeExtensions: e.target.checked }))} /> Extensions</label>
                <label className="edit-check"><input type="checkbox" checked={options.includeRepos} onChange={e => setOptions(p => ({ ...p, includeRepos: e.target.checked }))} /> Repos</label>
                <label className="edit-check"><input type="checkbox" checked={options.includeCustomButtons} onChange={e => setOptions(p => ({ ...p, includeCustomButtons: e.target.checked }))} /> Buttons</label>
            </div>
            </div>
        )}

        {options.format === "ai-yaml" && (
            <div className="detail-block" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'var(--accent)' }}>
                <h4>AI Optimized Export (YAML)</h4>
                <p className="muted" style={{ margin: 0 }}>
                    Produces a compact, context-rich YAML file. Includes titles, detailed status labels, genres, and external scores. Perfect for feeding into an LLM for recommendations.
                </p>
            </div>
        )}
      </div>
    </div>
  );
}
