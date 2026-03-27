import type { UiAnime, UiCategory } from "../lib/types";

type Props = {
  anime: UiAnime | null;
  categories: UiCategory[];
  onBack: () => void;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDate(value: number): string {
  if (!value) return "-";
  const normalized = value > 1_000_000_000_000 ? value : value * 1000;
  return dateFormatter.format(normalized);
}

function toCategoryNames(values: number[], categories: UiCategory[]): string {
  if (values.length === 0) return "None";
  const map = new Map(
    categories.map((cat) => [cat.order, cat.name || `Cat ${cat.order}`]),
  );
  return values.map((id) => map.get(id) ?? `ID ${id}`).join(", ");
}

export default function AnimeFullDetailsSection({
  anime,
  categories,
  onBack,
}: Props) {
  if (!anime) {
    return (
      <section className="panel">
        <div className="panel-head">
          <h2>Advanced details</h2>
          <p>No selected anime</p>
        </div>
      </section>
    );
  }

  return (
    <section className="panel" id="advanced">
      <div className="panel-head">
        <h2>Advanced details</h2>
        <button type="button" className="modal-close" onClick={onBack}>
          Back to library
        </button>
      </div>

      <div className="kv-list">
        <article className="kv-item">
          <h3>Identification</h3>
          <p>ID: {anime.id}</p>
          <p>Entry ID: {anime.entryId ?? "-"}</p>
          <p>Parent ID: {anime.parentId ?? "-"}</p>
          <p>Source ID: {anime.source}</p>
          <p>Source: {anime.sourceName || "-"}</p>
          <p>Title: {anime.title || "-"}</p>
          <p>Custom title: {anime.customTitle || "-"}</p>
        </article>

        <article className="kv-item">
          <h3>Metadata</h3>
          <p>Author: {anime.author || "-"}</p>
          <p>Artist: {anime.artist || "-"}</p>
          <p>Status: {anime.status}</p>
          <p>Custom status: {anime.customStatus}</p>
          <p>Favorite: {anime.favorite ? "Yes" : "No"}</p>
          <p>Initialized: {anime.initialized ? "Yes" : "No"}</p>
          <p>Version: {anime.version}</p>
          <p>Update strategy: {anime.updateStrategy}</p>
          <p>Episode flags: {anime.episodeFlags}</p>
          <p>Viewer flags: {anime.viewerFlags}</p>
          <p>Date added: {formatDate(anime.dateAdded)}</p>
          <p>Last modified: {formatDate(anime.lastModifiedAt)}</p>
          <p>Favorite modified: {formatDate(anime.favoriteModifiedAt ?? 0)}</p>
        </article>

        <article className="kv-item">
          <h3>Text content</h3>
          <p>URL: {anime.url || "-"}</p>
          <p>Thumbnail: {anime.thumbnailUrl || "-"}</p>
          <p>Background: {anime.backgroundUrl || "-"}</p>
          <p>Genres: {anime.genres.join(", ") || "-"}</p>
          <p>Custom genres: {anime.customGenre.join(", ") || "-"}</p>
          <p>Categories: {toCategoryNames(anime.categories, categories)}</p>
          <p>Description: {anime.description || "-"}</p>
          <p>Custom description: {anime.customDescription || "-"}</p>
          <p>Notes: {anime.notes || "-"}</p>
        </article>

        <article className="kv-item">
          <h3>Counters</h3>
          <p>Episodes: {anime.episodes.length}</p>
          <p>Seen episodes: {anime.episodes.filter((ep) => ep.seen).length}</p>
          <p>Bookmarks: {anime.episodes.filter((ep) => ep.bookmark).length}</p>
          <p>Trackers: {anime.tracking.length}</p>
          <p>History: {anime.history.length}</p>
        </article>
      </div>

      <section className="panel" style={{ marginTop: 12 }}>
        <div className="panel-head">
          <h2>Trackers (full)</h2>
          <p>{anime.tracking.length} entries</p>
        </div>
        <div className="kv-list">
          {anime.tracking.map((track, index) => (
            <article key={`${track.trackerId}-${index}`} className="kv-item">
              <h3>{track.title || `Tracker ${track.trackerId}`}</h3>
              <p>trackerId: {track.trackerId}</p>
              <p>libraryId: {track.libraryId}</p>
              <p>mediaId: {track.mediaId}</p>
              <p>status: {track.status}</p>
              <p>score: {track.score}</p>
              <p>lastEpisodeSeen: {track.lastEpisodeSeen}</p>
              <p>totalEpisodes: {track.totalEpisodes}</p>
              <p>trackingUrl: {track.trackingUrl || "-"}</p>
              <p>
                startedWatchingDate: {formatDate(track.startedWatchingDate)}
              </p>
              <p>
                finishedWatchingDate: {formatDate(track.finishedWatchingDate)}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel" style={{ marginTop: 12 }}>
        <div className="panel-head">
          <h2>Episodes (full)</h2>
          <p>{anime.episodes.length} entries</p>
        </div>
        <div className="kv-list">
          {anime.episodes.map((episode, index) => (
            <article key={`${episode.url}-${index}`} className="kv-item">
              <h3>{episode.name || "(unnamed)"}</h3>
              <p>url: {episode.url || "-"}</p>
              <p>scanlator: {episode.scanlator || "-"}</p>
              <p>seen: {episode.seen ? "true" : "false"}</p>
              <p>bookmark: {episode.bookmark ? "true" : "false"}</p>
              <p>fillermark: {episode.fillermark ? "true" : "false"}</p>
              <p>lastSecondSeen: {episode.lastSecondSeen}</p>
              <p>totalSeconds: {episode.totalSeconds}</p>
              <p>episodeNumber: {episode.episodeNumber}</p>
              <p>sourceOrder: {episode.sourceOrder}</p>
              <p>dateFetch: {formatDate(episode.dateFetch)}</p>
              <p>dateUpload: {formatDate(episode.dateUpload)}</p>
              <p>lastModifiedAt: {formatDate(episode.lastModifiedAt)}</p>
              <p>version: {episode.version}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel" style={{ marginTop: 12 }}>
        <div className="panel-head">
          <h2>History (full)</h2>
          <p>{anime.history.length} entries</p>
        </div>
        <div className="kv-list">
          {anime.history.map((item, index) => (
            <article key={`${item.url}-${index}`} className="kv-item">
              <h3>{item.url || "(no url)"}</h3>
              <p>lastRead: {formatDate(item.lastRead)}</p>
              <p>readDuration: {item.readDuration}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
