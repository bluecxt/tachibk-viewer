# Tachibk Viewer (React + Vite)

Lecteur local de sauvegardes AniZen/Tachiyomi `.tachibk`.

## Architecture (tâches séparées)

1. `src/lib/protoSchema.ts`
Schéma ProtoBuf (numéros de champs issus du code AniZen) pour décoder `Backup` et `LegacyBackup`.

2. `src/lib/backupParser.ts`
Pipeline de récupération des données:
- détection GZip via magic bytes `1f 8b`
- décompression (`pako`)
- détection legacy (`BackupDetect`)
- décodage ProtoBuf (`protobufjs`)
- normalisation vers un modèle UI.

3. `src/workers/backupWorker.ts`
Sous-agent local (Web Worker): parsing isolé hors thread UI.

4. `src/lib/workerClient.ts`
Pont principal <-> worker.

5. UI React (`src/App.tsx` + `src/components/*`)
Affichage synthétique + table anime + aperçu préférences.

## Démarrage

```bash
npm install
npm run dev
```

## Limites actuelles

- Les préférences sont affichées avec une heuristique de décodage (bool/int/float/string/set).
- Le contenu APK des extensions n'est pas listé (compte uniquement), pour garder l'UI rapide.
