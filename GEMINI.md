# Tachibk Viewer

**Tachibk Viewer** is a local, privacy-first web application designed for viewing, editing, and managing backup files (`.tachibk`) from **AniZen** and **Tachiyomi**. It allows users to manipulate their library metadata, categories, and preferences without needing to use the mobile app.

## 🚀 Tech Stack

- **Frontend:** React 18 (TypeScript)
- **Build Tool:** Vite
- **Decompression:** [Pako](https://github.com/nodeca/pako) (GZip support)
- **Serialization:** [Protobuf.js](https://github.com/protobufjs/protobuf.js)
- **Exporting:** [js-yaml](https://github.com/nodeca/js-yaml) (for AI-optimized context)
- **PWA:** `vite-plugin-pwa` for offline capabilities and installation.

## 🏗️ Architecture

1.  **Local Processing:** All backup parsing happens locally in the browser. No data is ever sent to a server.
2.  **Web Workers:** Heavy Protobuf decoding and decompression tasks are offloaded to a background worker (`src/workers/backupWorker.ts`) to keep the UI responsive.
3.  **Normalized UI Model:** The complex Protobuf structure is normalized into a flat, developer-friendly TypeScript model (`UiBackup`) for easier manipulation.
4.  **Export Pipeline:** A dedicated builder (`src/lib/exportBuilder.ts`) handles re-encoding the modified data back into `.tachibk` (compressed Protobuf) or specialized JSON/YAML formats.

## ✨ Key Features

### 1. Advanced Library Management
- **Full Metadata Editing:** Edit title, author, artist, description, status, and custom fields for any anime.
- **Category Management:** Create, delete, and reorder categories. Bulk assign/remove anime via interactive chips.
- **Source & Repo Editing:** Manage extension repositories and individual source preferences.

### 2. Deep Insights & Statistics
- **Visual Stats:** A dashboard providing metrics on genre distribution, status counts, and source usage.
- **Seen Watch Time:** Calculates total time spent watching based on seen episodes (20m avg/ep), filterable by category.

### 3. Powerful Discovery & Filtering
- **Global Search:** Search through titles, notes, descriptions, and tracker titles simultaneously.
- **Interactive Filters:** Click on any Genre, Status, or Source in the UI to instantly filter the library.
- **Thumbnail Grid:** High-density visual layout for quick browsing.

### 4. AI-Ready Ecosystem
- **AI Optimized Export:** Generates a compact YAML file rich in context (titles + human-readable status + scores + genres) specifically designed to be used as context for LLMs (like Gemini or ChatGPT) to get personalized recommendations.

### 5. PWA (Progressive Web App)
- **Offline Mode:** Once loaded, the app works entirely offline.
- **Installable:** Can be installed as a standalone app on Android, iOS, and Desktop.

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build and deploy to GitHub Pages
npm run deploy
```

---
*Note: This project is strictly local. Your backup data remains in your browser's memory and local storage.*
