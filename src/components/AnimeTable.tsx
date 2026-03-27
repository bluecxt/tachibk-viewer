import { useMemo, useState } from "react";
import AnimeEditModal from "./AnimeEditModal";
import type { UiAnime, UiCategory } from "../lib/types";

type Props = {
  anime: UiAnime[];
  categories: UiCategory[];
  onUpdateAnime: (anime: UiAnime) => void;
  onOpenFullDetails: (animeId: string) => void;
};

type SortBy =
  | "title"
  | "dateAdded"
  | "lastModified"
  | "episodes"
  | "tracking"
  | "source";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

function normalizeTimestamp(value: number): number {
  if (!value) return 0;
  return value > 1_000_000_000_000 ? value : value * 1000;
}

function formatDate(value: number): string {
  const normalized = normalizeTimestamp(value);
  if (!normalized) return "-";
  return dateFormatter.format(normalized);
}

function isHttpLink(value: string | null | undefined): value is string {
  return Boolean(value && /^https?:\/\//i.test(value));
}

function linkOrCode(value: string) {
  if (!value) return <code>(empty)</code>;
  if (isHttpLink(value)) {
    return (
      <a href={value} target="_blank" rel="noreferrer">
        {value}
      </a>
    );
  }
  return <code>{value}</code>;
}

function trackerStatusLabel(trackerId: number, status: number): string {
  const key = `${trackerId}:${status}`;
  const known: Record<string, string> = {
    "999:1": "Watching",
    "999:2": "Completed",
    "999:3": "On hold",
    "999:4": "Dropped",
    "999:5": "Plan to watch",
    "1:11": "Watching",
    "1:2": "Completed",
    "1:3": "On hold",
    "1:4": "Dropped",
    "1:16": "Plan to watch",
    "1:17": "Rewatching",
    "2:11": "Watching",
    "2:15": "Plan to watch",
    "2:2": "Completed",
    "2:16": "Rewatching",
    "2:3": "On hold",
    "2:4": "Dropped",
    "101:1": "Watching",
    "101:2": "Completed",
    "101:3": "On hold",
    "101:4": "Not interesting",
    "101:5": "Plan to watch",
  };
  return known[key] ?? `Status ${status}`;
}

export default function AnimeTable({
  anime,
  categories,
  onUpdateAnime,
  onOpenFullDetails,
}: Props) {
  const [filter, setFilter] = useState("");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [onlyTracked, setOnlyTracked] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState<SortBy>("title");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [pageSize, setPageSize] = useState(80);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<UiAnime | null>(null);
  const [editing, setEditing] = useState<UiAnime | null>(null);

  const categoryByOrder = useMemo(() => {
    const map = new Map<number, string>();
    categories.forEach((cat) =>
      map.set(cat.order, cat.name || `Cat ${cat.order}`),
    );
    return map;
  }, [categories]);

  const tabs = useMemo(() => {
    const counts = new Map<number, number>();
    let uncategorized = 0;
    anime.forEach((entry) => {
      if (entry.categories.length === 0) uncategorized += 1;
      entry.categories.forEach((order) =>
        counts.set(order, (counts.get(order) ?? 0) + 1),
      );
    });
    return [
      { id: "all", label: "All", count: anime.length },
      { id: "uncategorized", label: "Uncategorized", count: uncategorized },
      ...categories
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((cat) => ({
          id: String(cat.order),
          label: cat.name || `Cat ${cat.order}`,
          count: counts.get(cat.order) ?? 0,
        })),
    ];
  }, [anime, categories]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const scoped = anime.filter((item) => {
      if (activeTab === "uncategorized" && item.categories.length !== 0)
        return false;
      if (activeTab !== "all" && activeTab !== "uncategorized") {
        if (!item.categories.includes(Number(activeTab))) return false;
      }
      if (onlyFavorites && !item.favorite) return false;
      if (onlyTracked && item.tracking.length === 0) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.url.toLowerCase().includes(q) ||
        item.sourceName.toLowerCase().includes(q)
      );
    });

    return scoped.sort((a, b) => {
      const factor = sortDir === "asc" ? 1 : -1;
      if (sortBy === "title")
        return factor * a.title.localeCompare(b.title, "en");
      if (sortBy === "dateAdded") return factor * (a.dateAdded - b.dateAdded);
      if (sortBy === "lastModified")
        return factor * (a.lastModifiedAt - b.lastModifiedAt);
      if (sortBy === "episodes")
        return factor * (a.episodes.length - b.episodes.length);
      if (sortBy === "tracking")
        return factor * (a.tracking.length - b.tracking.length);
      return factor * a.sourceName.localeCompare(b.sourceName, "en");
    });
  }, [activeTab, anime, filter, onlyFavorites, onlyTracked, sortBy, sortDir]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  function formatCategoryList(categoryOrders: number[]) {
    if (categoryOrders.length === 0) return "None";
    return categoryOrders
      .map((order) => categoryByOrder.get(order) ?? `ID ${order}`)
      .join(", ");
  }

  return (
    <section className="panel" id="library">
      <div className="panel-head">
        <h2>Anime library</h2>
        <p>{filtered.length.toLocaleString("en-US")} results</p>
      </div>

      <div className="tabs-row no-scroll-row">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`chip ${activeTab === tab.id ? "is-active" : ""}`}
            onClick={() => {
              setActiveTab(tab.id);
              setPage(1);
            }}
          >
            <span>{tab.label}</span>
            <b>{tab.count}</b>
          </button>
        ))}
      </div>

      <div className="toolbar sticky-tools">
        <input
          value={filter}
          onChange={(event) => {
            setFilter(event.target.value);
            setPage(1);
          }}
          placeholder="Search title, URL, source"
        />
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as SortBy)}
        >
          <option value="title">Sort: Title</option>
          <option value="dateAdded">Sort: Date added</option>
          <option value="lastModified">Sort: Last modified</option>
          <option value="episodes">Sort: Episode count</option>
          <option value="tracking">Sort: Tracker count</option>
          <option value="source">Sort: Source</option>
        </select>
        <select
          value={sortDir}
          onChange={(event) => setSortDir(event.target.value as "asc" | "desc")}
        >
          <option value="asc">Order: Asc</option>
          <option value="desc">Order: Desc</option>
        </select>
        <select
          value={String(pageSize)}
          onChange={(event) => {
            setPageSize(Number(event.target.value));
            setPage(1);
          }}
        >
          <option value="40">40 / page</option>
          <option value="80">80 / page</option>
          <option value="120">120 / page</option>
          <option value="200">200 / page</option>
        </select>
        <label>
          <input
            type="checkbox"
            checked={onlyFavorites}
            onChange={(event) => {
              setOnlyFavorites(event.target.checked);
              setPage(1);
            }}
          />
          Favorites
        </label>
        <label>
          <input
            type="checkbox"
            checked={onlyTracked}
            onChange={(event) => {
              setOnlyTracked(event.target.checked);
              setPage(1);
            }}
          />
          With trackers
        </label>
      </div>

      <div className="entries-list">
        {visible.map((item) => (
          <article
            key={item.id}
            className="entry-card"
            onClick={() => setSelected(item)}
          >
            <div className="entry-head">
              <h3>{item.customTitle || item.title || "(untitled)"}</h3>
              <button
                type="button"
                className="entry-edit-btn"
                onClick={(event) => {
                  event.stopPropagation();
                  setEditing(item);
                }}
              >
                Edit
              </button>
            </div>
            <p>{item.sourceName || item.source}</p>
            <p>{formatCategoryList(item.categories)}</p>
            <div className="entry-meta">
              <span>{item.episodes.length} episodes</span>
              <span>{item.tracking.length} trackers</span>
              <span>{formatDate(item.dateAdded)}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="pager">
        <button
          type="button"
          disabled={safePage <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Previous
        </button>
        <span>
          Page {safePage} / {pageCount}
        </span>
        <button
          type="button"
          disabled={safePage >= pageCount}
          onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
        >
          Next
        </button>
      </div>

      {selected && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelected(null)}
        >
          <div
            className="modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-actions">
              <button
                type="button"
                className="modal-save"
                onClick={() => {
                  onOpenFullDetails(selected.id);
                  setSelected(null);
                }}
              >
                Advanced details
              </button>
              <button
                type="button"
                className="modal-close"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
            <h3>{selected.customTitle || selected.title || "(untitled)"}</h3>
            <p className="muted">{selected.sourceName || selected.source}</p>

            <div className="detail-grid">
              <p>
                <span>Entry ID</span>
                <b>{selected.entryId ?? "-"}</b>
              </p>
              <p>
                <span>Added</span>
                <b>{formatDate(selected.dateAdded)}</b>
              </p>
              <p>
                <span>Modified</span>
                <b>{formatDate(selected.lastModifiedAt)}</b>
              </p>
              <p>
                <span>Favorite</span>
                <b>{selected.favorite ? "Yes" : "No"}</b>
              </p>
              <p>
                <span>Initialized</span>
                <b>{selected.initialized ? "Yes" : "No"}</b>
              </p>
              <p>
                <span>Episodes</span>
                <b>{selected.episodes.length}</b>
              </p>
              <p>
                <span>Trackers</span>
                <b>{selected.tracking.length}</b>
              </p>
              <p>
                <span>Seen (internal)</span>
                <b>{selected.episodes.filter((ep) => ep.seen).length}</b>
              </p>
              <p>
                <span>Bookmarks</span>
                <b>{selected.episodes.filter((ep) => ep.bookmark).length}</b>
              </p>
              <p>
                <span>Reading history</span>
                <b>{selected.history.length}</b>
              </p>
              <p>
                <span>Last read</span>
                <b>
                  {selected.history.length > 0
                    ? formatDate(
                        Math.max(...selected.history.map((h) => h.lastRead)),
                      )
                    : "-"}
                </b>
              </p>
            </div>

            <div className="detail-block">
              <h4>Categories</h4>
              <p>{formatCategoryList(selected.categories)}</p>
            </div>
            {selected.description && (
              <div className="detail-block">
                <h4>Description</h4>
                <p>{selected.description}</p>
              </div>
            )}
            {selected.notes && (
              <div className="detail-block">
                <h4>Notes</h4>
                <p>{selected.notes}</p>
              </div>
            )}
            <div className="detail-block">
              <h4>Links</h4>
              <p>{linkOrCode(selected.url)}</p>
              {selected.thumbnailUrl && (
                <p>{linkOrCode(selected.thumbnailUrl)}</p>
              )}
              {selected.backgroundUrl && (
                <p>{linkOrCode(selected.backgroundUrl)}</p>
              )}
            </div>

            {selected.tracking.length > 0 && (
              <div className="detail-block">
                <h4>Trackers</h4>
                <div className="kv-list">
                  {selected.tracking.map((track, index) => {
                    const isInternal =
                      track.trackerId === 0 || track.trackerId === 999;
                    return (
                      <article
                        key={`${track.trackerId}-${track.mediaId}-${index}`}
                        className="kv-item"
                      >
                        <h3>
                          {track.title ||
                            (isInternal
                              ? "Internal tracker"
                              : `Tracker ${track.trackerId}`)}
                        </h3>
                        <p>Type: {isInternal ? "Internal" : "External"}</p>
                        <p>Tracker ID: {track.trackerId}</p>
                        <p>Library ID: {track.libraryId || "-"}</p>
                        <p>Media ID: {track.mediaId || "-"}</p>
                        <p>
                          Status:{" "}
                          {trackerStatusLabel(track.trackerId, track.status)} (
                          {track.status})
                        </p>
                        <p>Score: {track.score}</p>
                        <p>
                          Progress: {track.lastEpisodeSeen} /{" "}
                          {track.totalEpisodes || "-"}
                        </p>
                        <p>Start: {formatDate(track.startedWatchingDate)}</p>
                        <p>End: {formatDate(track.finishedWatchingDate)}</p>
                        <p>Link: {linkOrCode(track.trackingUrl)}</p>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {editing && (
        <AnimeEditModal
          anime={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSave={(updated) => {
            onUpdateAnime(updated);
            if (selected?.id === updated.id) {
              setSelected(updated);
            }
            setEditing(null);
          }}
        />
      )}
    </section>
  );
}
