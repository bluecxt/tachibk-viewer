import type { UiBackup, WorkerResult } from "./types";

export async function parseBackupBufferWithWorker(
  buffer: ArrayBuffer,
): Promise<UiBackup> {
  const worker = new Worker(
    new URL("../workers/backupWorker.ts", import.meta.url),
    {
      type: "module",
    },
  );

  return new Promise<UiBackup>((resolve, reject) => {
    worker.onmessage = (event: MessageEvent<WorkerResult>) => {
      worker.terminate();
      if (event.data.ok) {
        resolve(event.data.data);
      } else {
        reject(new Error(event.data.error));
      }
    };

    worker.onerror = (event) => {
      worker.terminate();
      reject(new Error(event.message || "Erreur worker"));
    };

    worker.postMessage({ buffer }, [buffer]);
  });
}

export async function parseBackupWithWorker(file: File): Promise<UiBackup> {
  const buffer = await file.arrayBuffer();
  return parseBackupBufferWithWorker(buffer);
}
