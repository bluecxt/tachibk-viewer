import pako from "pako";
import { Reader } from "protobufjs/light";
import { BackupDetectType, BackupType, LegacyBackupType } from "./protoSchema";
import type {
  UiAnime,
  UiBackup,
  UiCustomButton,
  UiExtension,
  UiExtensionRepo,
  UiPreference,
  UiSourcePreference,
} from "./types";

type AnyRecord = Record<string, unknown>;

const gzipMagic1 = 0x1f;
const gzipMagic2 = 0x8b;

const decoder = new TextDecoder();

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number.parseFloat(value);
  if (typeof value === "bigint") return Number(value);
  if (value && typeof value === "object" && "toString" in value) {
    return Number.parseFloat(String(value));
  }
  return 0;
}

function toBool(value: unknown): boolean {
  return Boolean(value);
}

function toStringSafe(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) =>
    typeof item === "string" ? item : String(item ?? ""),
  );
}

function toNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => toNumber(item));
}

function arrayOf<T extends AnyRecord>(value: unknown): T[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is T => typeof item === "object" && item !== null,
  );
}

function tryParseUtf8(bytes: Uint8Array): string | null {
  try {
    const text = decoder.decode(bytes);
    const printable = /^[\p{L}\p{N}\p{P}\p{S}\p{Z}\t\r\n]+$/u.test(text);
    return printable ? text : null;
  } catch {
    return null;
  }
}

function toHex(bytes: Uint8Array, max = 24): string {
  return Array.from(bytes.slice(0, max))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function parsePreferenceRaw(raw?: Uint8Array): string {
  if (!raw || raw.length === 0) return "(vide)";
  const reader = Reader.create(raw);

  try {
    const parsedStrings: string[] = [];
    while (reader.pos < reader.len) {
      const tag = reader.uint32();
      const field = tag >>> 3;
      const wireType = tag & 7;
      if (field !== 1) return `bytes:${toHex(raw)}`;

      if (wireType === 0) {
        const value = Number(reader.uint64());
        if (value === 0 || value === 1) return value === 1 ? "true" : "false";
        return String(value);
      }

      if (wireType === 5) {
        const value = reader.float();
        return Number.isFinite(value) ? String(value) : `bytes:${toHex(raw)}`;
      }

      if (wireType === 2) {
        const chunk = reader.bytes();
        const text = tryParseUtf8(chunk);
        if (text !== null) parsedStrings.push(text);
      } else {
        return `bytes:${toHex(raw)}`;
      }
    }

    if (parsedStrings.length === 1) return parsedStrings[0];
    if (parsedStrings.length > 1) return `[${parsedStrings.join(", ")}]`;
  } catch {
    return `bytes:${toHex(raw)}`;
  }

  return `bytes:${toHex(raw)}`;
}

function pickArrays(decoded: AnyRecord) {
  const animeModern = arrayOf<AnyRecord>(decoded.backupAnimeModern);
  const categoriesModern = arrayOf<AnyRecord>(decoded.backupCategoriesModern);
  const sourcesModern = arrayOf<AnyRecord>(decoded.backupSourcesModern);
  const extModern = arrayOf<AnyRecord>(decoded.backupExtensionsModern);
  const repoModern = arrayOf<AnyRecord>(decoded.backupExtensionRepoModern);
  const customModern = arrayOf<AnyRecord>(decoded.backupCustomButtonModern);

  return {
    isLegacy: toBool(decoded.isLegacy),
    anime: animeModern.length
      ? animeModern
      : arrayOf<AnyRecord>(decoded.backupAnime),
    categories: categoriesModern.length
      ? categoriesModern
      : arrayOf<AnyRecord>(decoded.backupAnimeCategories).length
        ? arrayOf<AnyRecord>(decoded.backupAnimeCategories)
        : arrayOf<AnyRecord>(decoded.backupCategories),
    sources: sourcesModern.length
      ? sourcesModern
      : arrayOf<AnyRecord>(decoded.backupSources),
    preferences: arrayOf<AnyRecord>(decoded.backupPreferences),
    sourcePreferences: arrayOf<AnyRecord>(decoded.backupSourcePreferences),
    extensions: extModern.length
      ? extModern
      : arrayOf<AnyRecord>(decoded.backupExtensions),
    extensionRepos: repoModern.length
      ? repoModern
      : arrayOf<AnyRecord>(decoded.backupAnimeExtensionRepo).length
        ? arrayOf<AnyRecord>(decoded.backupAnimeExtensionRepo)
        : arrayOf<AnyRecord>(decoded.backupExtensionRepo),
    customButtons: customModern.length
      ? customModern
      : arrayOf<AnyRecord>(decoded.backupCustomButton),
  };
}

function normalizeAnime(raw: AnyRecord): UiAnime {
  const customGenre = toStringArray(raw.customGenre);
  return {
    id: `${toNumber(raw.source)}::${toStringSafe(raw.url)}`,
    entryId: raw.id == null ? null : toNumber(raw.id),
    parentId: raw.parentId == null ? null : toNumber(raw.parentId),
    source: toNumber(raw.source),
    sourceName: "",
    title: toStringSafe(raw.title),
    artist: raw.artist ? String(raw.artist) : null,
    author: raw.author ? String(raw.author) : null,
    url: toStringSafe(raw.url),
    thumbnailUrl: raw.thumbnailUrl ? String(raw.thumbnailUrl) : null,
    description: raw.description ? String(raw.description) : null,
    genres: toStringArray(raw.genre),
    status: toNumber(raw.status),
    dateAdded: toNumber(raw.dateAdded),
    favorite: toBool(raw.favorite),
    initialized: toBool(raw.initialized),
    episodeFlags: toNumber(raw.episodeFlags),
    viewerFlags: toNumber(raw.viewer_flags),
    updateStrategy: toNumber(raw.updateStrategy),
    lastModifiedAt: toNumber(raw.lastModifiedAt),
    favoriteModifiedAt:
      raw.favoriteModifiedAt == null ? null : toNumber(raw.favoriteModifiedAt),
    version: toNumber(raw.version),
    notes: toStringSafe(raw.notes),
    customStatus: toNumber(raw.customStatus),
    customTitle: raw.customTitle ? String(raw.customTitle) : null,
    customArtist: raw.customArtist ? String(raw.customArtist) : null,
    customAuthor: raw.customAuthor ? String(raw.customAuthor) : null,
    customDescription:
      raw.customDescription == null ? null : String(raw.customDescription),
    customGenre,
    backgroundUrl: raw.backgroundUrl == null ? null : String(raw.backgroundUrl),
    categories: toNumberArray(raw.categories),
    history: arrayOf<AnyRecord>(raw.history).map((item) => ({
      url: toStringSafe(item.url),
      lastRead: toNumber(item.lastRead),
      readDuration: toNumber(item.readDuration),
    })),
    episodes: arrayOf<AnyRecord>(raw.episodes).map((ep) => ({
      name: toStringSafe(ep.name),
      url: toStringSafe(ep.url),
      scanlator: ep.scanlator ? String(ep.scanlator) : null,
      seen: toBool(ep.seen),
      bookmark: toBool(ep.bookmark),
      fillermark: toBool(ep.fillermark),
      lastSecondSeen: toNumber(ep.lastSecondSeen),
      totalSeconds: toNumber(ep.totalSeconds),
      episodeNumber: toNumber(ep.episodeNumber),
      sourceOrder: toNumber(ep.sourceOrder),
      dateFetch: toNumber(ep.dateFetch),
      dateUpload: toNumber(ep.dateUpload),
      lastModifiedAt: toNumber(ep.lastModifiedAt),
      version: toNumber(ep.version),
    })),
    tracking: arrayOf<AnyRecord>(raw.tracking).map((track) => ({
      trackerId: toNumber(track.syncId),
      libraryId: toNumber(track.libraryId),
      mediaId:
        toNumber(track.mediaId) !== 0
          ? toNumber(track.mediaId)
          : toNumber(track.mediaIdInt),
      title: toStringSafe(track.title),
      status: toNumber(track.status),
      score: toNumber(track.score),
      lastEpisodeSeen: toNumber(track.lastEpisodeSeen),
      totalEpisodes: toNumber(track.totalEpisodes),
      trackingUrl: toStringSafe(track.trackingUrl),
      startedWatchingDate: toNumber(track.startedWatchingDate),
      finishedWatchingDate: toNumber(track.finishedWatchingDate),
    })),
  };
}

function normalizePreferences(rawPrefs: AnyRecord[]): UiPreference[] {
  return rawPrefs.map((pref) => {
    const key = toStringSafe(pref.key);
    const valueRaw = pref.value instanceof Uint8Array ? pref.value : undefined;
    return {
      key,
      valuePreview: parsePreferenceRaw(valueRaw),
      rawValue: valueRaw ?? new Uint8Array(),
    };
  });
}

function decodePayload(payload: Uint8Array): AnyRecord {
  try {
    const detected = BackupDetectType.decode(payload) as unknown as AnyRecord;
    const isLegacy =
      toBool(detected.isLegacy) &&
      arrayOf<AnyRecord>(detected.backupSources).length > 0;
    if (isLegacy)
      return LegacyBackupType.decode(payload) as unknown as AnyRecord;
  } catch {
    // fallback to standard decode below
  }
  return BackupType.decode(payload) as unknown as AnyRecord;
}

export function parseBackupBuffer(bytes: Uint8Array): UiBackup {
  const payload =
    bytes[0] === gzipMagic1 && bytes[1] === gzipMagic2
      ? pako.ungzip(bytes)
      : bytes;
  const decoded = decodePayload(payload) as AnyRecord;
  const picked = pickArrays(decoded);

  const anime = picked.anime.map(normalizeAnime);
  const categories = picked.categories.map((cat) => ({
    name: toStringSafe(cat.name),
    order: toNumber(cat.order),
    flags: toNumber(cat.flags),
    hidden: toBool(cat.hidden),
  }));
  const sources = picked.sources.map((source) => ({
    name: toStringSafe(source.name),
    sourceId: toNumber(source.sourceId),
  }));
  const preferences = normalizePreferences(picked.preferences);
  const sourcePreferences: UiSourcePreference[] = picked.sourcePreferences.map(
    (item) => ({
      sourceKey: toStringSafe(item.sourceKey),
      prefs: normalizePreferences(arrayOf<AnyRecord>(item.prefs)),
    }),
  );
  const extensions: UiExtension[] = picked.extensions.map((item) => ({
    pkgName: toStringSafe(item.pkgName),
    apk: item.apk instanceof Uint8Array ? item.apk : new Uint8Array(),
    apkSize: item.apk instanceof Uint8Array ? item.apk.byteLength : 0,
  }));
  const extensionRepos: UiExtensionRepo[] = picked.extensionRepos.map(
    (item) => ({
      baseUrl: toStringSafe(item.baseUrl),
      name: toStringSafe(item.name),
      shortName: item.shortName ? String(item.shortName) : null,
      website: toStringSafe(item.website),
      signingKeyFingerprint: toStringSafe(item.signingKeyFingerprint),
      isVisible: toBool(item.isVisible),
      author: item.author ? String(item.author) : null,
    }),
  );
  const customButtons: UiCustomButton[] = picked.customButtons.map((item) => ({
    name: toStringSafe(item.name),
    isFavorite: toBool(item.isFavorite),
    sortIndex: toNumber(item.sortIndex),
    content: toStringSafe(item.content),
    longPressContent: toStringSafe(item.longPressContent),
    onStartup: toStringSafe(item.onStartup),
  }));
  const sourceMap = new Map<number, string>(
    sources.map((source) => [source.sourceId, source.name]),
  );
  const animeWithSources = anime.map((item) => ({
    ...item,
    sourceName: sourceMap.get(item.source) ?? "",
  }));

  return {
    isLegacy: picked.isLegacy,
    animeCount: animeWithSources.length,
    categoryCount: categories.length,
    sourceCount: sources.length,
    preferenceCount: picked.preferences.length,
    sourcePreferenceCount: picked.sourcePreferences.length,
    extensionCount: picked.extensions.length,
    extensionRepoCount: picked.extensionRepos.length,
    customButtonCount: picked.customButtons.length,
    anime: animeWithSources,
    categories,
    sources,
    preferences,
    sourcePreferences,
    extensions,
    extensionRepos,
    customButtons,
  };
}
