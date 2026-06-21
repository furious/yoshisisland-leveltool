import { describe, expect, it } from 'vitest';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import {
  importEntrancesIntoRom,
  importLevelsIntoRom,
  parseLevelImport,
  parseRom,
  type LevelImportFile,
} from '../src/core/yoshi';

const root = process.cwd();
const romPath = join(root, 'tests', 'Super Mario - Yoshi Island (J) (V1.0).smc');
const importedRomPath = join(root, 'tests', 'Super Mario - Yoshi Island (J) (V1.0)-imported.smc');
const fixtureDir = join(root, 'tests', 'yi-jp-1.0-levels');

async function readBytes(path: string): Promise<Uint8Array> {
  return new Uint8Array(await readFile(path));
}

describe('Yoshi Island imports', () => {
  it('rebuilds the imported JP ROM from the exported fixtures', async () => {
    const original = await readBytes(romPath);
    const rom = parseRom(original, 'Super Mario - Yoshi Island (J) (V1.0).smc');
    const files = (await readdir(fixtureDir)).filter((name) => name.toLowerCase().endsWith('.ylt')).sort();

    const levelImports: LevelImportFile[] = [];
    for (const file of files) {
      levelImports.push(parseLevelImport(await readBytes(join(fixtureDir, file)), file));
    }

    const afterLevels = importLevelsIntoRom(rom.bytes, rom, levelImports);
    const afterLevelsRom = parseRom(afterLevels, 'Super Mario - Yoshi Island (J) (V1.0).smc');
    const entrances = await readBytes(join(fixtureDir, 'entrances.yet'));
    const finalRom = importEntrancesIntoRom(afterLevels, afterLevelsRom, entrances);
    const expected = await readBytes(importedRomPath);

    expect(Buffer.from(finalRom)).toEqual(Buffer.from(expected));
  });
});
