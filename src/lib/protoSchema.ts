import { Root, Type } from "protobufjs/light";

const root = Root.fromJSON({
  nested: {
    BackupSource: {
      fields: {
        name: { type: "string", id: 1 },
        sourceId: { type: "int64", id: 2 },
      },
    },
    BackupCategory: {
      fields: {
        name: { type: "string", id: 1 },
        order: { type: "int64", id: 2 },
        flags: { type: "int64", id: 100 },
        hidden: { type: "bool", id: 900 },
      },
    },
    BackupEpisode: {
      fields: {
        url: { type: "string", id: 1 },
        name: { type: "string", id: 2 },
        scanlator: { type: "string", id: 3 },
        seen: { type: "bool", id: 4 },
        bookmark: { type: "bool", id: 5 },
        lastSecondSeen: { type: "int64", id: 6 },
        dateFetch: { type: "int64", id: 7 },
        dateUpload: { type: "int64", id: 8 },
        episodeNumber: { type: "float", id: 9 },
        sourceOrder: { type: "int64", id: 10 },
        lastModifiedAt: { type: "int64", id: 11 },
        version: { type: "int64", id: 12 },
        fillermark: { type: "bool", id: 15 },
        totalSeconds: { type: "int64", id: 16 },
      },
    },
    BackupTracking: {
      fields: {
        syncId: { type: "int32", id: 1 },
        libraryId: { type: "int64", id: 2 },
        mediaIdInt: { type: "int32", id: 3 },
        trackingUrl: { type: "string", id: 4 },
        title: { type: "string", id: 5 },
        lastEpisodeSeen: { type: "float", id: 6 },
        totalEpisodes: { type: "int32", id: 7 },
        score: { type: "float", id: 8 },
        status: { type: "int32", id: 9 },
        startedWatchingDate: { type: "int64", id: 10 },
        finishedWatchingDate: { type: "int64", id: 11 },
        mediaId: { type: "int64", id: 100 },
      },
    },
    BackupHistory: {
      fields: {
        url: { type: "string", id: 1 },
        lastRead: { type: "int64", id: 2 },
        readDuration: { type: "int64", id: 3 },
      },
    },
    BackupAnime: {
      fields: {
        source: { type: "int64", id: 1 },
        url: { type: "string", id: 2 },
        title: { type: "string", id: 3 },
        artist: { type: "string", id: 4 },
        author: { type: "string", id: 5 },
        description: { type: "string", id: 6 },
        genre: { rule: "repeated", type: "string", id: 7 },
        status: { type: "int32", id: 8 },
        thumbnailUrl: { type: "string", id: 9 },
        dateAdded: { type: "int64", id: 13 },
        episodes: { rule: "repeated", type: "BackupEpisode", id: 16 },
        categories: { rule: "repeated", type: "int64", id: 17 },
        tracking: { rule: "repeated", type: "BackupTracking", id: 18 },
        favorite: { type: "bool", id: 100 },
        episodeFlags: { type: "int32", id: 101 },
        viewer_flags: { type: "int32", id: 103 },
        history: { rule: "repeated", type: "BackupHistory", id: 104 },
        updateStrategy: { type: "int32", id: 105 },
        lastModifiedAt: { type: "int64", id: 106 },
        favoriteModifiedAt: { type: "int64", id: 107 },
        version: { type: "int64", id: 109 },
        notes: { type: "string", id: 110 },
        initialized: { type: "bool", id: 111 },
        customStatus: { type: "int32", id: 200 },
        customTitle: { type: "string", id: 201 },
        customArtist: { type: "string", id: 202 },
        customAuthor: { type: "string", id: 203 },
        customDescription: { type: "string", id: 204 },
        customGenre: { rule: "repeated", type: "string", id: 205 },
        backgroundUrl: { type: "string", id: 500 },
        parentId: { type: "int64", id: 502 },
        id: { type: "int64", id: 503 },
      },
    },
    BackupPreference: {
      fields: {
        key: { type: "string", id: 1 },
        value: { type: "bytes", id: 2 },
      },
    },
    BackupSourcePreferences: {
      fields: {
        sourceKey: { type: "string", id: 1 },
        prefs: { rule: "repeated", type: "BackupPreference", id: 2 },
      },
    },
    BackupExtension: {
      fields: {
        pkgName: { type: "string", id: 1 },
        apk: { type: "bytes", id: 2 },
      },
    },
    BackupExtensionRepos: {
      fields: {
        baseUrl: { type: "string", id: 1 },
        name: { type: "string", id: 2 },
        shortName: { type: "string", id: 3 },
        website: { type: "string", id: 4 },
        signingKeyFingerprint: { type: "string", id: 5 },
        isVisible: { type: "bool", id: 6 },
        author: { type: "string", id: 7 },
      },
    },
    BackupCustomButtons: {
      fields: {
        name: { type: "string", id: 1 },
        isFavorite: { type: "bool", id: 2 },
        sortIndex: { type: "int64", id: 3 },
        content: { type: "string", id: 4 },
        longPressContent: { type: "string", id: 5 },
        onStartup: { type: "string", id: 6 },
      },
    },
    Backup: {
      fields: {
        backupAnime: { rule: "repeated", type: "BackupAnime", id: 3 },
        backupAnimeCategories: {
          rule: "repeated",
          type: "BackupCategory",
          id: 4,
        },
        backupSources: { rule: "repeated", type: "BackupSource", id: 103 },
        backupPreferences: {
          rule: "repeated",
          type: "BackupPreference",
          id: 104,
        },
        backupSourcePreferences: {
          rule: "repeated",
          type: "BackupSourcePreferences",
          id: 105,
        },
        backupExtensions: {
          rule: "repeated",
          type: "BackupExtension",
          id: 106,
        },
        backupAnimeExtensionRepo: {
          rule: "repeated",
          type: "BackupExtensionRepos",
          id: 107,
        },
        backupCustomButton: {
          rule: "repeated",
          type: "BackupCustomButtons",
          id: 109,
        },
        isLegacy: { type: "bool", id: 500 },
        backupAnimeModern: { rule: "repeated", type: "BackupAnime", id: 501 },
        backupCategoriesModern: {
          rule: "repeated",
          type: "BackupCategory",
          id: 502,
        },
        backupSourcesModern: {
          rule: "repeated",
          type: "BackupSource",
          id: 503,
        },
        backupExtensionsModern: {
          rule: "repeated",
          type: "BackupExtension",
          id: 504,
        },
        backupExtensionRepoModern: {
          rule: "repeated",
          type: "BackupExtensionRepos",
          id: 505,
        },
        backupCustomButtonModern: {
          rule: "repeated",
          type: "BackupCustomButtons",
          id: 506,
        },
      },
    },
    LegacyBackup: {
      fields: {
        backupAnime: { rule: "repeated", type: "BackupAnime", id: 3 },
        backupCategories: { rule: "repeated", type: "BackupCategory", id: 4 },
        backupSources: { rule: "repeated", type: "BackupSource", id: 103 },
        backupPreferences: {
          rule: "repeated",
          type: "BackupPreference",
          id: 104,
        },
        backupSourcePreferences: {
          rule: "repeated",
          type: "BackupSourcePreferences",
          id: 105,
        },
        backupExtensions: {
          rule: "repeated",
          type: "BackupExtension",
          id: 106,
        },
        backupExtensionRepo: {
          rule: "repeated",
          type: "BackupExtensionRepos",
          id: 107,
        },
        backupCustomButton: {
          rule: "repeated",
          type: "BackupCustomButtons",
          id: 109,
        },
      },
    },
    BackupDetect: {
      fields: {
        backupSources: { rule: "repeated", type: "BackupSource", id: 103 },
        isLegacy: { type: "bool", id: 500 },
      },
    },
  },
});

export const BackupType = root.lookupType("Backup") as Type;
export const LegacyBackupType = root.lookupType("LegacyBackup") as Type;
export const BackupDetectType = root.lookupType("BackupDetect") as Type;
