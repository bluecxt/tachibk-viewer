/// <reference lib="webworker" />

import { parseBackupBuffer } from "../lib/backupParser";
import type { WorkerResult } from "../lib/types";

self.onmessage = (event: MessageEvent<{ buffer: ArrayBuffer }>) => {
  try {
    const bytes = new Uint8Array(event.data.buffer);
    const parsed = parseBackupBuffer(bytes);
    const result: WorkerResult = { ok: true, data: parsed };
    self.postMessage(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inconnue pendant le parsing";
    const result: WorkerResult = { ok: false, error: message };
    self.postMessage(result);
  }
};
