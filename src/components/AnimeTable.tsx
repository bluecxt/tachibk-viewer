import { useMemo, useState } from "react";
import type { UiAnime, UiCategory } from "../lib/types";

type Props = {
  anime: UiAnime[];
  categories: UiCategory[];
};

type SortBy =
  | "title"
  | "dateAdded"
  | "lastModified"
  | "episodes"
  | "tracking"
  | "source";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
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
  if (!value) return <code>(vide)</code>;
  if (isHttpLink(value)) {
    return (
      <a href={value} target="_blank" rel="noreferrer">
        {value}
      </a>
    );
  }
  return <code>{value}</code>;
}

export default function AnimeTable({ anime, categories }: Props) {
  const [filter, setFilter] = useState("");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [onlyTracked, setOnlyTracked] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState<SortBy>("title");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [pageSize, setPageSize] = useState(80);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<UiAnime | null>(null);

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
      { id: "all", label: "Toutes", count: anime.length },
      { id: "uncategorized", label: "Sans catégorie", count: uncategorized },
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
        return factor * a.title.localeCompare(b.title, "fr");
      if (sortBy === "dateAdded") return factor * (a.dateAdded - b.dateAdded);
      if (sortBy === "lastModified")
        return factor * (a.lastModifiedAt - b.lastModifiedAt);
      if (sortBy === "episodes")
        return factor * (a.episodes.length - b.episodes.length);
      if (sortBy === "tracking")
        return factor * (a.tracking.length - b.tracking.length);
      return factor * a.sourceName.localeCompare(b.sourceName, "fr");
    });
  }, [activeTab, anime, filter, onlyFavorites, onlyTracked, sortBy, sortDir]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  function formatCategoryList(categoryOrders: number[]) {
    if (categoryOrders.length === 0) return "Aucune";
    return categoryOrders
      .map((order) => categoryByOrder.get(order) ?? `ID ${order}`)
      .join(", ");
  }

  return (
    <section className="panel" id="library">
      <div className="panel-head">
        <h2>Bibliothèque anime</h2>
        <p>{filtered.length.toLocaleString("fr-FR")} résultats</p>
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
          placeholder="Rechercher titre, URL, source"
        />
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as SortBy)}
        >
          <option value="title">Tri: Titre</option>
          <option value="dateAdded">Tri: Date ajout</option>
          <option value="lastModified">Tri: Dernière modif</option>
          <option value="episodes">Tri: Nombre épisodes</option>
          <option value="tracking">Tri: Nombre trackers</option>
          <option value="source">Tri: Source</option>
        </select>
        <select
          value={sortDir}
          onChange={(event) => setSortDir(event.target.value as "asc" | "desc")}
        >
          <option value="asc">Ordre: Asc</option>
          <option value="desc">Ordre: Desc</option>
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
          Favoris
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
          Trackés
        </label>
      </div>

      <div className="entries-list">
        {visible.map((item) => (
          <article
            key={item.id}
            className="entry-card"
            onClick={() => setSelected(item)}
          >
            <h3>{item.customTitle || item.title || "(sans titre)"}</h3>
            <p>{item.sourceName || item.source}</p>
            <p>{formatCategoryList(item.categories)}</p>
            <div className="entry-meta">
              <span>{item.episodes.length} épisodes</span>
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
          Précédent
        </button>
        <span>
          Page {safePage} / {pageCount}
        </span>
        <button
          type="button"
          disabled={safePage >= pageCount}
          onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
        >
          Suivant
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
            <button
              type="button"
              className="modal-close"
              onClick={() => setSelected(null)}
            >
              Fermer
            </button>
            <h3>{selected.customTitle || selected.title || "(sans titre)"}</h3>
            <p className="muted">{selected.sourceName || selected.source}</p>

            <div className="detail-grid">
              <p>
                <span>ID entrée</span>
                <b>{selected.entryId ?? "-"}</b>
              </p>
              <p>
                <span>Parent ID</span>
                <b>{selected.parentId ?? "-"}</b>
              </p>
              <p>
                <span>Ajout</span>
                <b>{formatDate(selected.dateAdded)}</b>
              </p>
              <p>
                <span>Modifié</span>
                <b>{formatDate(selected.lastModifiedAt)}</b>
              </p>
              <p>
                <span>Favori</span>
                <b>{selected.favorite ? "Oui" : "Non"}</b>
              </p>
              <p>
                <span>Initialisé</span>
                <b>{selected.initialized ? "Oui" : "Non"}</b>
              </p>
              <p>
                <span>Épisodes</span>
                <b>{selected.episodes.length}</b>
              </p>
              <p>
                <span>Trackers</span>
                <b>{selected.tracking.length}</b>
              </p>
            </div>

            <div className="detail-block">
              <h4>Catégories</h4>
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
              <h4>Liens</h4>
              <p>{linkOrCode(selected.url)}</p>
              {selected.thumbnailUrl && (
                <p>{linkOrCode(selected.thumbnailUrl)}</p>
              )}
              {selected.backgroundUrl && (
                <p>{linkOrCode(selected.backgroundUrl)}</p>
              )}
            </div>

            <div className="detail-block">
              <h4>Suivi interne</h4>
              <p>
                Épisodes vus: {selected.episodes.filter((ep) => ep.seen).length}
              </p>
              <p>
                Épisodes bookmark:{" "}
                {selected.episodes.filter((ep) => ep.bookmark).length}
              </p>
              <p>Historique: {selected.history.length}</p>
              <p>
                Dernière lecture interne:{" "}
                {selected.history.length > 0
                  ? formatDate(
                      Math.max(...selected.history.map((h) => h.lastRead)),
                    )
                  : "-"}
              </p>
            </div>

            {selected.tracking.length > 0 && (
              <div className="detail-block">
                <h4>Trackers externes et internes</h4>
                <div className="kv-list">
                  {selected.tracking.map((track, index) => {
                    const isInternal = track.trackerId === 0;
                    return (
                      <article
                        key={`${track.trackerId}-${track.mediaId}-${index}`}
                        className="kv-item"
                      >
                        <h3>
                          {track.title ||
                            (isInternal
                              ? "Tracker interne"
                              : `Tracker ${track.trackerId}`)}
                        </h3>
                        <p>Type: {isInternal ? "Interne" : "Externe"}</p>
                        <p>Tracker ID: {track.trackerId}</p>
                        <p>Library ID: {track.libraryId || "-"}</p>
                        <p>Media ID: {track.mediaId || "-"}</p>
                        <p>Status: {track.status}</p>
                        <p>Score: {track.score}</p>
                        <p>
                          Progression: {track.lastEpisodeSeen} /{" "}
                          {track.totalEpisodes || "-"}
                        </p>
                        <p>Début: {formatDate(track.startedWatchingDate)}</p>
                        <p>Fin: {formatDate(track.finishedWatchingDate)}</p>
                        <p>Lien: {linkOrCode(track.trackingUrl)}</p>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
