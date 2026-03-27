import pako from "pako";
import yaml from "js-yaml";
import { BackupType } from "./protoSchema";
import type { UiAnime, UiBackup } from "./types";

export type ExportFormat = "json" | "tachibk" | "ai-yaml";

export type ExportOptions = {
  format: ExportFormat;
  includeAnime: boolean;
  includeCategories: boolean;
  includeSources: boolean;
  includePreferences: boolean;
  includeSourcePreferences: boolean;
  includeExtensions: boolean;
  includeRepos: boolean;
  includeCustomButtons: boolean;
  onlyWithExternalTracker: boolean;
  minExternalScoreEnabled: boolean;
  minExternalScore: number;
  categoryFilterMode: "include" | "exclude";
  selectedCategoryOrders: number[];
  sourceFilterMode: "include" | "exclude";
  selectedSourceIds: number[];
};

function isExternalTracker(trackerId: number): boolean {
  return trackerId !== 0 && trackerId !== 999;
}

const statusLabels: Record<number, string> = {
    1: "Ongoing",
    2: "Completed",
    3: "Licensed",
    4: "Publishing finished",
    5: "Cancelled",
    6: "On hiatus"
};

function filterAnimeList(anime: UiAnime[], options: ExportOptions): UiAnime[] {
  return anime.filter((item) => {
    // Multi-category filter (Include / Exclude)
    if (options.selectedCategoryOrders.length > 0) {
        const hasMatch = item.categories.some(c => options.selectedCategoryOrders.includes(c));
        if (options.categoryFilterMode === "include" && !hasMatch) return false;
        if (options.categoryFilterMode === "exclude" && hasMatch) return false;
    }

    // Source filter (Include / Exclude)
    if (options.selectedSourceIds.length > 0) {
        const hasMatch = options.selectedSourceIds.includes(item.source);
        if (options.sourceFilterMode === "include" && !hasMatch) return false;
        if (options.sourceFilterMode === "exclude" && hasMatch) return false;
    }

    const externalTracks = item.tracking.filter((track) =>
      isExternalTracker(track.trackerId),
    );

    if (options.onlyWithExternalTracker && externalTracks.length === 0) {
      return false;
    }

    if (options.minExternalScoreEnabled) {
      const hasMinScore = externalTracks.some(
        (track) => track.score >= options.minExternalScore,
      );
      if (!hasMinScore) return false;
    }

    return true;
  });
}

export function buildFilteredBackup(
  backup: UiBackup,
  options: ExportOptions,
): UiBackup {
  const anime = options.includeAnime
    ? filterAnimeList(backup.anime, options)
    : [];
  const usedCategoryOrders = new Set(anime.flatMap((item) => item.categories));
  const usedSourceIds = new Set(anime.map((item) => item.source));

  return {
    ...backup,
    anime,
    animeCount: anime.length,
    categories: options.includeCategories
      ? backup.categories.filter((cat) => usedCategoryOrders.has(cat.order))
      : [],
    categoryCount: options.includeCategories
      ? backup.categories.filter((cat) => usedCategoryOrders.has(cat.order))
          .length
      : 0,
    sources: options.includeSources
      ? backup.sources.filter((source) => usedSourceIds.has(source.sourceId))
      : [],
    sourceCount: options.includeSources
      ? backup.sources.filter((source) => usedSourceIds.has(source.sourceId))
          .length
      : 0,
    preferences: options.includePreferences ? backup.preferences : [],
    preferenceCount: options.includePreferences ? backup.preferences.length : 0,
    sourcePreferences: options.includeSourcePreferences
      ? backup.sourcePreferences
      : [],
    sourcePreferenceCount: options.includeSourcePreferences
      ? backup.sourcePreferences.length
      : 0,
    extensions: options.includeExtensions ? backup.extensions : [],
    extensionCount: options.includeExtensions ? backup.extensions.length : 0,
    extensionRepos: options.includeRepos ? backup.extensionRepos : [],
    extensionRepoCount: options.includeRepos ? backup.extensionRepos.length : 0,
    customButtons: options.includeCustomButtons ? backup.customButtons : [],
    customButtonCount: options.includeCustomButtons
      ? backup.customButtons.length
      : 0,
  };
}

function toAiData(backup: UiBackup) {
    const categoryMap = new Map(backup.categories.map(c => [c.order, c.name]));
    
    return backup.anime.map(item => ({
        title: item.customTitle || item.title,
        status: `${item.customStatus || item.status} (${statusLabels[item.customStatus || item.status] || 'Unknown'})`,
        favorite: item.favorite,
        genres: item.customGenre.length > 0 ? item.customGenre : item.genres,
        categories: item.categories.map(order => categoryMap.get(order) || `ID:${order}`),
        tracking: item.tracking
            .filter(t => isExternalTracker(t.trackerId))
            .map(t => ({
                title: t.title,
                score: t.score,
                status: t.status
            })),
        notes: item.notes || undefined
    }));
}

function toBackupMessage(backup: UiBackup) {
  return {
    backupAnime: backup.anime.map((item) => ({
      source: item.source,
      url: item.url,
      title: item.title,
      artist: item.artist ?? undefined,
      author: item.author ?? undefined,
      description: item.description ?? undefined,
      genre: item.genres,
      status: item.status,
      thumbnailUrl: item.thumbnailUrl ?? undefined,
      dateAdded: item.dateAdded,
      episodes: item.episodes.map((ep) => ({
        url: ep.url,
        name: ep.name,
        scanlator: ep.scanlator ?? undefined,
        seen: ep.seen,
        bookmark: ep.bookmark,
        fillermark: ep.fillermark,
        lastSecondSeen: ep.lastSecondSeen,
        totalSeconds: ep.totalSeconds,
        episodeNumber: ep.episodeNumber,
        sourceOrder: ep.sourceOrder,
        dateFetch: ep.dateFetch,
        dateUpload: ep.dateUpload,
        lastModifiedAt: ep.lastModifiedAt,
        version: ep.version,
      })),
      categories: item.categories,
      tracking: item.tracking.map((track) => ({
        syncId: track.trackerId,
        libraryId: track.libraryId,
        mediaId: track.mediaId,
        trackingUrl: track.trackingUrl,
        title: track.title,
        lastEpisodeSeen: track.lastEpisodeSeen,
        totalEpisodes: track.totalEpisodes,
        score: track.score,
        status: track.status,
        startedWatchingDate: track.startedWatchingDate,
        finishedWatchingDate: track.finishedWatchingDate,
      })),
      favorite: item.favorite,
      episodeFlags: item.episodeFlags,
      viewer_flags: item.viewerFlags,
      history: item.history.map((h) => ({
        url: h.url,
        lastRead: h.lastRead,
        readDuration: h.readDuration,
      })),
      updateStrategy: item.updateStrategy,
      lastModifiedAt: item.lastModifiedAt,
      favoriteModifiedAt: item.favoriteModifiedAt ?? undefined,
      version: item.version,
      notes: item.notes,
      initialized: item.initialized,
      customStatus: item.customStatus,
      customTitle: item.customTitle ?? undefined,
      customArtist: item.customArtist ?? undefined,
      customAuthor: item.customAuthor ?? undefined,
      customDescription: item.customDescription ?? undefined,
      customGenre: item.customGenre,
      backgroundUrl: item.backgroundUrl ?? undefined,
      parentId: item.parentId ?? undefined,
      id: item.entryId ?? undefined,
    })),
    backupAnimeCategories: backup.categories.map((cat) => ({
      name: cat.name,
      order: cat.order,
      flags: cat.flags,
      hidden: cat.hidden,
    })),
    backupSources: backup.sources.map((source) => ({
      name: source.name,
      sourceId: source.sourceId,
    })),
    backupPreferences: backup.preferences.map((item) => ({
      key: item.key,
      value: item.rawValue,
    })),
    backupSourcePreferences: backup.sourcePreferences.map((item) => ({
      sourceKey: item.sourceKey,
      prefs: item.prefs.map((pref) => ({
        key: pref.key,
        value: pref.rawValue,
      })),
    })),
    backupExtensions: backup.extensions.map((item) => ({
      pkgName: item.pkgName,
      apk: item.apk,
    })),
    backupAnimeExtensionRepo: backup.extensionRepos.map((item) => ({
      baseUrl: item.baseUrl,
      name: item.name,
      shortName: item.shortName ?? undefined,
      website: item.website,
      signingKeyFingerprint: item.signingKeyFingerprint,
      isVisible: item.isVisible,
      author: item.author ?? undefined,
    })),
    backupCustomButton: backup.customButtons.map((item) => ({
      name: item.name,
      isFavorite: item.isFavorite,
      sortIndex: item.sortIndex,
      content: item.content,
      longPressContent: item.longPressContent,
      onStartup: item.onStartup,
    })),
  };
}

export function buildExportBlob(
  backup: UiBackup,
  options: ExportOptions,
): { blob: Blob; extension: string } {
  const filtered = buildFilteredBackup(backup, options);

  if (options.format === "ai-yaml") {
      const data = toAiData(filtered);
      return {
          blob: new Blob([yaml.dump(data)], {
              type: "text/yaml",
          }),
          extension: "yaml",
      };
  }

  if (options.format === "json") {
    const payload = {
      exportedAt: new Date().toISOString(),
      format: "ui-json",
      data: filtered,
    };
    return {
      blob: new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      }),
      extension: "json",
    };
  }

  const message = toBackupMessage(filtered);
  const rawBytes = BackupType.encode(message).finish();
  const compressed = pako.gzip(rawBytes);
  return {
    blob: new Blob([compressed], { type: "application/octet-stream" }),
    extension: "tachibk",
  };
}
