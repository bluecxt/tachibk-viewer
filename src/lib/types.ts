export type UiEpisode = {
  name: string;
  url: string;
  scanlator: string | null;
  seen: boolean;
  bookmark: boolean;
  fillermark: boolean;
  lastSecondSeen: number;
  totalSeconds: number;
  episodeNumber: number;
  sourceOrder: number;
  dateFetch: number;
  dateUpload: number;
  lastModifiedAt: number;
  version: number;
};

export type UiTracking = {
  trackerId: number;
  libraryId: number;
  mediaId: number;
  title: string;
  status: number;
  score: number;
  lastEpisodeSeen: number;
  totalEpisodes: number;
  trackingUrl: string;
  startedWatchingDate: number;
  finishedWatchingDate: number;
};

export type UiHistory = {
  url: string;
  lastRead: number;
  readDuration: number;
};

export type UiAnime = {
  id: string;
  entryId: number | null;
  parentId: number | null;
  source: number;
  sourceName: string;
  title: string;
  artist: string | null;
  author: string | null;
  url: string;
  thumbnailUrl: string | null;
  description: string | null;
  genres: string[];
  status: number;
  dateAdded: number;
  favorite: boolean;
  initialized: boolean;
  episodeFlags: number;
  viewerFlags: number;
  updateStrategy: number;
  lastModifiedAt: number;
  favoriteModifiedAt: number | null;
  version: number;
  notes: string;
  customStatus: number;
  customTitle: string | null;
  customArtist: string | null;
  customAuthor: string | null;
  customDescription: string | null;
  customGenre: string[];
  backgroundUrl: string | null;
  categories: number[];
  history: UiHistory[];
  episodes: UiEpisode[];
  tracking: UiTracking[];
};

export type UiCategory = {
  name: string;
  order: number;
  flags: number;
  hidden: boolean;
};

export type UiSource = {
  name: string;
  sourceId: number;
};

export type UiPreference = {
  key: string;
  valuePreview: string;
  rawValue: Uint8Array;
};

export type UiSourcePreference = {
  sourceKey: string;
  prefs: UiPreference[];
};

export type UiExtension = {
  pkgName: string;
  apkSize: number;
  apk: Uint8Array;
};

export type UiExtensionRepo = {
  baseUrl: string;
  name: string;
  shortName: string | null;
  website: string;
  signingKeyFingerprint: string;
  isVisible: boolean;
  author: string | null;
};

export type UiCustomButton = {
  name: string;
  isFavorite: boolean;
  sortIndex: number;
  content: string;
  longPressContent: string;
  onStartup: string;
};

export type UiBackup = {
  isLegacy: boolean;
  animeCount: number;
  categoryCount: number;
  sourceCount: number;
  preferenceCount: number;
  sourcePreferenceCount: number;
  extensionCount: number;
  extensionRepoCount: number;
  customButtonCount: number;
  anime: UiAnime[];
  categories: UiCategory[];
  sources: UiSource[];
  preferences: UiPreference[];
  sourcePreferences: UiSourcePreference[];
  extensions: UiExtension[];
  extensionRepos: UiExtensionRepo[];
  customButtons: UiCustomButton[];
};

export type WorkerResult =
  | { ok: true; data: UiBackup }
  | { ok: false; error: string };
