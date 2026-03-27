import { useMemo } from "react";
import type { UiAnime } from "../lib/types";
import { formatDuration } from "../lib/utils";

type Props = {
  anime: UiAnime[];
};

export default function StatisticsSection({ anime }: Props) {
  const stats = useMemo(() => {
    const genres = new Map<string, number>();
    const status = new Map<number, number>();
    const sources = new Map<string, number>();
    let favorites = 0;
    let totalEpisodes = 0;

    anime.forEach((item) => {
      if (item.favorite) favorites++;
      totalEpisodes += item.episodes.length;

      const gList = item.customGenre.length > 0 ? item.customGenre : item.genres;
      gList.forEach((g) => genres.set(g, (genres.get(g) ?? 0) + 1));

      const s = item.customStatus !== 0 ? item.customStatus : item.status;
      status.set(s, (status.get(s) ?? 0) + 1);

      sources.set(item.sourceName || String(item.source), (sources.get(item.sourceName || String(item.source)) ?? 0) + 1);
    });

    const sortedGenres = [...genres.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
    const sortedSources = [...sources.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);

    return {
      genres: sortedGenres,
      status: [...status.entries()],
      sources: sortedSources,
      favorites,
      totalEpisodes,
      totalAnime: anime.length,
      totalMinutes: totalEpisodes * 20
    };
  }, [anime]);

  const statusLabels: Record<number, string> = {
    1: "Ongoing",
    2: "Completed",
    3: "Licensed",
    4: "Publishing finished",
    5: "Cancelled",
    6: "On hiatus"
  };

  return (
    <section className="panel" id="statistics">
      <div className="panel-head">
        <h2>Visual Statistics</h2>
        <p>Overview of your {stats.totalAnime} anime</p>
      </div>

      <div className="cards-grid" style={{ marginTop: '20px' }}>
        <div className="stat-card">
            <p>Favorites</p>
            <strong>{stats.favorites}</strong>
        </div>
        <div className="stat-card">
            <p>Total Episodes</p>
            <strong>{stats.totalEpisodes}</strong>
        </div>
        <div className="stat-card">
            <p>Total Watch Time</p>
            <strong>{formatDuration(stats.totalMinutes)}</strong>
        </div>
        <div className="stat-card">
            <p>Avg. Episodes</p>
            <strong>{stats.totalAnime > 0 ? (stats.totalEpisodes / stats.totalAnime).toFixed(1) : 0}</strong>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', marginTop: '20px' }}>
        <div className="detail-block">
            <h4>Top 10 Genres</h4>
            <div style={{ display: 'grid', gap: '8px' }}>
                {stats.genres.map(([name, count]) => (
                    <div key={name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '2px' }}>
                            <span>{name}</span>
                            <span>{count}</span>
                        </div>
                        <div style={{ height: '6px', background: 'var(--line)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: 'var(--accent)', width: `${(count / stats.totalAnime) * 100}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="detail-block">
            <h4>Status Distribution</h4>
            <div style={{ display: 'grid', gap: '8px' }}>
                {stats.status.map(([s, count]) => (
                    <div key={s}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '2px' }}>
                            <span>{statusLabels[s] || `Status ${s}`}</span>
                            <span>{count}</span>
                        </div>
                        <div style={{ height: '6px', background: 'var(--line)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: '#6366f1', width: `${(count / stats.totalAnime) * 100}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="detail-block">
            <h4>Top 10 Sources</h4>
            <div style={{ display: 'grid', gap: '8px' }}>
                {stats.sources.map(([name, count]) => (
                    <div key={name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '2px' }}>
                            <span>{name}</span>
                            <span>{count}</span>
                        </div>
                        <div style={{ height: '6px', background: 'var(--line)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: '#f59e0b', width: `${(count / stats.totalAnime) * 100}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </section>
  );
}
