# Tachibk Viewer

Local viewer for AniZen/Tachiyomi `.tachibk` backups built with React and Vite.

## Architecture

1. `src/lib/protoSchema.ts`
ProtoBuf schema derived from the AniZen backup model. It decodes `Backup` and `LegacyBackup`.

2. `src/lib/backupParser.ts`
Backup recovery pipeline:
- GZip detection via magic bytes `1f 8b`
- decompression with `pako`
- legacy backup detection with `BackupDetect`
- ProtoBuf decoding with `protobufjs`
- normalization into a UI-friendly model

3. `src/workers/backupWorker.ts`
Local worker used to keep parsing off the main UI thread.

4. `src/lib/workerClient.ts`
Main thread to worker bridge.

5. React UI (`src/App.tsx` + `src/components/*`)
Summary cards, anime library, advanced details, category/source views, repo browser, and export modal.

## Features

- Import `.tachibk` files locally
- Browse the local file history stored in the browser
- Edit anime metadata in a dedicated modal
- Open a full advanced details page for any anime
- Export filtered subsets as `JSON` or AniZen-compatible `tachibk`
- Navigate from clickable summary cards to detailed sections

## Filters

The export modal lets you filter by:

- anime category
- presence of external trackers
- minimum external score
- sections to include in the export

## Development

```bash
npm install
npm run dev
```

## Notes

- Preferences are decoded with heuristics because their payloads can vary by value type.
- Extension APK bytes are preserved when exporting `tachibk` files.
- The `tachibk` export aims to remain compatible with AniZen backup readers.

## TODO / Future Roadmap

1. **Batch Editing**: Select multiple anime to change categories, status, or favorite state in a single action.
2. **Advanced Filtering**: Add multi-select filters for genres, sources, and status in the library view.
3. **Visual Statistics**: Dashboard with charts for genre distribution, status counts, and source usage.
4. **Drag-and-Drop Reordering**: Support visual reordering for categories and custom buttons.
5. **Duplicate Detection**: Identify and merge duplicate entries from different sources.
6. **Source Preference Editing**: Support modifying source-specific settings directly within the app.
7. **PWA Support**: Make the app installable for full offline usage and better desktop integration.
8. **Thumbnail Grid View**: High-density visual layout for the library with poster images.
9. **External Metadata Sync**: Fetch missing images or descriptions from AniList/MAL/TMDB.
10. **Global Search**: Deep search across descriptions, notes, and tracking titles.
