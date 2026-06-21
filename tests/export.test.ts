import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildAllLevelExports, buildEntranceExport, parseRom } from '../src/core/yoshi';

const root = process.cwd();
const romPath = join(root, 'tests', 'Super Mario - Yoshi Island (J) (V1.0).smc');
const fixtureDir = join(root, 'tests', 'yi-jp-1.0-levels');

async function readBytes(path: string): Promise<Uint8Array> {
  return new Uint8Array(await readFile(path));
}

describe('Yoshi Island exports', () => {
  it('matches the reference JP 1.0 level exports and entrances', async () => {
    const rom = parseRom(await readBytes(romPath), 'Super Mario - Yoshi Island (J) (V1.0).smc');

    expect(rom.info.title).toBe("YOSSY'S ISLAND");
    expect(rom.info.region).toBe('Japan');
    expect(rom.levels).toHaveLength(0xDE);

    const levelExports = buildAllLevelExports(rom.levels);
    for (const entry of levelExports) {
      const fixture = await readBytes(join(fixtureDir, entry.name));
      expect(Buffer.from(entry.bytes)).toEqual(Buffer.from(fixture));
    }

    const entrances = buildEntranceExport(rom.entrances);
    const fixtureEntrances = await readBytes(join(fixtureDir, 'entrances.yet'));
    expect(Buffer.from(entrances.bytes)).toEqual(Buffer.from(fixtureEntrances));
  });
});
