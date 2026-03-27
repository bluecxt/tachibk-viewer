import { useEffect, useMemo, useState } from "react";
import type { UiAnime, UiCategory } from "../lib/types";

type Props = {
  anime: UiAnime;
  categories: UiCategory[];
  onClose: () => void;
  onSave: (anime: UiAnime) => void;
};

type FormState = {
  // Identification & Core
  id: string;
  entryId: string;
  parentId: string;
  source: string;
  sourceName: string;
  url: string;
  title: string;
  customTitle: string;

  // Metadata
  author: string;
  customAuthor: string;
  artist: string;
  customArtist: string;
  description: string;
  customDescription: string;
  genreCsv: string;
  customGenreCsv: string;
  status: string;
  customStatus: string;
  notes: string;

  // Visuals
  thumbnailUrl: string;
  backgroundUrl: string;

  // Flags & State
  favorite: boolean;
  initialized: boolean;
  episodeFlags: string;
  viewerFlags: string;
  updateStrategy: string;

  // Timestamps & Version
  dateAdded: string;
  lastModifiedAt: string;
  favoriteModifiedAt: string;
  version: string;

  // Categories
  categories: number[];
};

function toForm(anime: UiAnime): FormState {
  return {
    id: anime.id,
    entryId: String(anime.entryId ?? ""),
    parentId: String(anime.parentId ?? ""),
    source: String(anime.source),
    sourceName: anime.sourceName,
    url: anime.url,
    title: anime.title,
    customTitle: anime.customTitle ?? "",

    author: anime.author ?? "",
    customAuthor: anime.customAuthor ?? "",
    artist: anime.artist ?? "",
    customArtist: anime.customArtist ?? "",
    description: anime.description ?? "",
    customDescription: anime.customDescription ?? "",
    genreCsv: anime.genres.join(", "),
    customGenreCsv: anime.customGenre.join(", "),
    status: String(anime.status),
    customStatus: String(anime.customStatus),
    notes: anime.notes,

    thumbnailUrl: anime.thumbnailUrl ?? "",
    backgroundUrl: anime.backgroundUrl ?? "",

    favorite: anime.favorite,
    initialized: anime.initialized,
    episodeFlags: String(anime.episodeFlags),
    viewerFlags: String(anime.viewerFlags),
    updateStrategy: String(anime.updateStrategy),

    dateAdded: String(anime.dateAdded),
    lastModifiedAt: String(anime.lastModifiedAt),
    favoriteModifiedAt: String(anime.favoriteModifiedAt ?? ""),
    version: String(anime.version),

    categories: anime.categories,
  };
}

function parseCsv(csv: string): string[] {
  return csv
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export default function AnimeEditModal({
  anime,
  categories,
  onClose,
  onSave,
}: Props) {
  const [form, setForm] = useState<FormState>(() => toForm(anime));
  const [activeTab, setActiveTab] = useState<"general" | "metadata" | "advanced" | "categories">("general");

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.order - b.order),
    [categories],
  );

  useEffect(() => {
    setForm(toForm(anime));
  }, [anime]);

  function toggleCategory(order: number) {
    setForm((prev) => {
      const exists = prev.categories.includes(order);
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter((value) => value !== order)
          : [...prev.categories, order].sort((a, b) => a - b),
      };
    });
  }

  function handleSave() {
    onSave({
      ...anime,
      id: form.id,
      entryId: Number.parseInt(form.entryId, 10) || null,
      parentId: Number.parseInt(form.parentId, 10) || null,
      source: Number.parseInt(form.source, 10) || 0,
      sourceName: form.sourceName.trim(),
      url: form.url.trim(),
      title: form.title.trim(),
      customTitle: form.customTitle.trim() || null,

      author: form.author.trim() || null,
      customAuthor: form.customAuthor.trim() || null,
      artist: form.artist.trim() || null,
      customArtist: form.customArtist.trim() || null,
      description: form.description.trim() || null,
      customDescription: form.customDescription.trim() || null,
      genres: parseCsv(form.genreCsv),
      customGenre: parseCsv(form.customGenreCsv),
      status: Number.parseInt(form.status, 10) || 0,
      customStatus: Number.parseInt(form.customStatus, 10) || 0,
      notes: form.notes,

      thumbnailUrl: form.thumbnailUrl.trim() || null,
      backgroundUrl: form.backgroundUrl.trim() || null,

      favorite: form.favorite,
      initialized: form.initialized,
      episodeFlags: Number.parseInt(form.episodeFlags, 10) || 0,
      viewerFlags: Number.parseInt(form.viewerFlags, 10) || 0,
      updateStrategy: Number.parseInt(form.updateStrategy, 10) || 0,

      dateAdded: Number.parseInt(form.dateAdded, 10) || 0,
      lastModifiedAt: Number.parseInt(form.lastModifiedAt, 10) || 0,
      favoriteModifiedAt: Number.parseInt(form.favoriteModifiedAt, 10) || null,
      version: Number.parseInt(form.version, 10) || 0,

      categories: form.categories,
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
        style={{ width: "min(1000px, 100%)" }}
      >
        <div className="modal-actions">
          <button type="button" className="modal-close" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="modal-save"
            onClick={handleSave}
          >
            Save Changes
          </button>
        </div>

        <h3>Edit Anime: {anime.title}</h3>
        <p className="muted">Modify all internal and custom fields for this entry.</p>

        <div className="tabs-row" style={{ marginBottom: "16px" }}>
            <button 
                className={`chip ${activeTab === "general" ? "is-active" : ""}`}
                onClick={() => setActiveTab("general")}
            >General</button>
            <button 
                className={`chip ${activeTab === "metadata" ? "is-active" : ""}`}
                onClick={() => setActiveTab("metadata")}
            >Metadata & Visuals</button>
            <button 
                className={`chip ${activeTab === "categories" ? "is-active" : ""}`}
                onClick={() => setActiveTab("categories")}
            >Categories</button>
            <button 
                className={`chip ${activeTab === "advanced" ? "is-active" : ""}`}
                onClick={() => setActiveTab("advanced")}
            >Advanced / IDs</button>
        </div>

        {activeTab === "general" && (
            <div className="edit-grid">
                <label>
                    Title
                    <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                </label>
                <label>
                    Custom Title
                    <input value={form.customTitle} onChange={e => setForm(p => ({ ...p, customTitle: e.target.value }))} />
                </label>
                <label>
                    Source Name
                    <input value={form.sourceName} onChange={e => setForm(p => ({ ...p, sourceName: e.target.value }))} />
                </label>
                <label>
                    Source ID
                    <input type="number" value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))} />
                </label>
                <label>
                    URL
                    <input value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} />
                </label>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <label className="edit-check">
                        <input type="checkbox" checked={form.favorite} onChange={e => setForm(p => ({ ...p, favorite: e.target.checked }))} />
                        Favorite
                    </label>
                    <label className="edit-check">
                        <input type="checkbox" checked={form.initialized} onChange={e => setForm(p => ({ ...p, initialized: e.target.checked }))} />
                        Initialized
                    </label>
                </div>
                
                <label className="edit-block" style={{ gridColumn: 'span 2' }}>
                    Notes
                    <textarea rows={3} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
                </label>
            </div>
        )}

        {activeTab === "metadata" && (
            <div className="edit-grid">
                <label>
                    Author
                    <input value={form.author} onChange={e => setForm(p => ({ ...p, author: e.target.value }))} />
                </label>
                <label>
                    Custom Author
                    <input value={form.customAuthor} onChange={e => setForm(p => ({ ...p, customAuthor: e.target.value }))} />
                </label>
                <label>
                    Artist
                    <input value={form.artist} onChange={e => setForm(p => ({ ...p, artist: e.target.value }))} />
                </label>
                <label>
                    Custom Artist
                    <input value={form.customArtist} onChange={e => setForm(p => ({ ...p, customArtist: e.target.value }))} />
                </label>
                <label>
                    Status
                    <input type="number" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} />
                </label>
                <label>
                    Custom Status
                    <input type="number" value={form.customStatus} onChange={e => setForm(p => ({ ...p, customStatus: e.target.value }))} />
                </label>
                <label>
                    Thumbnail URL
                    <input value={form.thumbnailUrl} onChange={e => setForm(p => ({ ...p, thumbnailUrl: e.target.value }))} />
                </label>
                <label>
                    Background URL
                    <input value={form.backgroundUrl} onChange={e => setForm(p => ({ ...p, backgroundUrl: e.target.value }))} />
                </label>
                <label className="edit-block" style={{ gridColumn: 'span 2' }}>
                    Genres (CSV)
                    <input value={form.genreCsv} onChange={e => setForm(p => ({ ...p, genreCsv: e.target.value }))} />
                </label>
                <label className="edit-block" style={{ gridColumn: 'span 2' }}>
                    Custom Genres (CSV)
                    <input value={form.customGenreCsv} onChange={e => setForm(p => ({ ...p, customGenreCsv: e.target.value }))} />
                </label>
                <label className="edit-block" style={{ gridColumn: 'span 2' }}>
                    Description
                    <textarea rows={4} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                </label>
                <label className="edit-block" style={{ gridColumn: 'span 2' }}>
                    Custom Description
                    <textarea rows={4} value={form.customDescription} onChange={e => setForm(p => ({ ...p, customDescription: e.target.value }))} />
                </label>
            </div>
        )}

        {activeTab === "categories" && (
            <div className="detail-block">
                <h4>Categories</h4>
                <p className="muted">
                    Select categories by name. The saved backup still uses category orders internally.
                </p>
                <div className="category-pick-grid" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '8px',
                    marginTop: '12px'
                }}>
                    {sortedCategories.map((cat) => {
                    const active = form.categories.includes(cat.order);
                    return (
                        <button
                        key={cat.order}
                        type="button"
                        className={`chip category-pick ${active ? "is-active" : ""}`}
                        onClick={() => toggleCategory(cat.order)}
                        style={{ justifyContent: 'space-between', width: '100%' }}
                        >
                        <span>{cat.name || "(unnamed)"}</span>
                        <small style={{ opacity: 0.6 }}>#{cat.order}</small>
                        </button>
                    );
                    })}
                </div>
            </div>
        )}

        {activeTab === "advanced" && (
            <div className="edit-grid">
                <label>
                    Internal ID
                    <input value={form.id} onChange={e => setForm(p => ({ ...p, id: e.target.value }))} />
                </label>
                <label>
                    Entry ID
                    <input value={form.entryId} onChange={e => setForm(p => ({ ...p, entryId: e.target.value }))} />
                </label>
                <label>
                    Parent ID
                    <input value={form.parentId} onChange={e => setForm(p => ({ ...p, parentId: e.target.value }))} />
                </label>
                <label>
                    Version
                    <input type="number" value={form.version} onChange={e => setForm(p => ({ ...p, version: e.target.value }))} />
                </label>
                <label>
                    Episode Flags
                    <input type="number" value={form.episodeFlags} onChange={e => setForm(p => ({ ...p, episodeFlags: e.target.value }))} />
                </label>
                <label>
                    Viewer Flags
                    <input type="number" value={form.viewerFlags} onChange={e => setForm(p => ({ ...p, viewerFlags: e.target.value }))} />
                </label>
                <label>
                    Update Strategy
                    <input type="number" value={form.updateStrategy} onChange={e => setForm(p => ({ ...p, updateStrategy: e.target.value }))} />
                </label>
                <label>
                    Date Added
                    <input type="number" value={form.dateAdded} onChange={e => setForm(p => ({ ...p, dateAdded: e.target.value }))} />
                </label>
                <label>
                    Last Modified
                    <input type="number" value={form.lastModifiedAt} onChange={e => setForm(p => ({ ...p, lastModifiedAt: e.target.value }))} />
                </label>
                <label>
                    Favorite Modified
                    <input type="number" value={form.favoriteModifiedAt} onChange={e => setForm(p => ({ ...p, favoriteModifiedAt: e.target.value }))} />
                </label>
            </div>
        )}
      </div>
    </div>
  );
}
