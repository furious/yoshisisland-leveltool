import { zipSync } from 'fflate';
import type { ExportEntry } from './yoshi';

export function entriesToZip(entries: readonly ExportEntry[], zipName: string): { name: string; bytes: Uint8Array } {
  const files: Record<string, Uint8Array> = {};
  for (const entry of entries) {
    files[entry.name] = entry.bytes;
  }
  return {
    name: zipName,
    bytes: zipSync(files, { level: 0 }),
  };
}
