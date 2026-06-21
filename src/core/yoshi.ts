export const LEVEL_COUNT = 0xDE;
export const LEVEL_POINTER_OFFSETS = [0x17F77F, 0x17F7C3] as const;
export const LEVEL_MAIN_ENTRANCE_OFFSETS = [[0x17F3A3, 0x17F42D], [0x17F3E7, 0x17F471]] as const;
export const LEVEL_MIDWAY_ENTRANCE_OFFSETS = [[0x17F50D, 0x17F597], [0x17F551, 0x17F5DB]] as const;

export const ROM_SIZES = ['4M', '8M', '16M', '32M', '64M'] as const;
export const RAM_SIZES = ['None', '16K', '64K', '256K', '512K', '1M'] as const;
export const REGIONS = [
  'Japan',
  'USA',
  'Europe',
  'Scandinavia',
  'French',
  'Dutch',
  'Spanish',
  'German',
  'Italian',
  'Chinese',
  'Korean',
  'Common',
  'Canada',
  'Brazil',
  'Nintendo Gateway System',
  'Australia',
  'Other (X)',
  'Other (Y)',
  'Other (Z)',
] as const;

export const OBJECT_TABLE = Uint8Array.from([
  0xFF, 0x02, 0x01, 0x01, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x01, 0x01, 0x01, 0x00, 0x01, 0x01,
  0xC2, 0xC2, 0xC2, 0x00, 0x02, 0x00, 0x02, 0x02, 0x02, 0x02, 0x00, 0x01, 0x01, 0x00, 0x00, 0x02,
  0x02, 0x02, 0x01, 0x01, 0x02, 0x01, 0x01, 0x82, 0x02, 0xC2, 0xC2, 0x01, 0x01, 0x01, 0x01, 0x01,
  0x01, 0x01, 0x02, 0x02, 0x00, 0x02, 0x01, 0x00, 0x02, 0x02, 0x02, 0x02, 0x41, 0x00, 0x01, 0x01,
  0x01, 0x00, 0x01, 0x01, 0x02, 0x02, 0x02, 0x02, 0x02, 0x01, 0x01, 0x01, 0x01, 0x01, 0x02, 0x02,
  0x01, 0x00, 0xC2, 0x00, 0xC2, 0xC2, 0xC2, 0x00, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02,
  0x02, 0x02, 0x02, 0x00, 0x00, 0x00, 0x02, 0x02, 0x02, 0x02, 0x00, 0x02, 0x02, 0x01, 0x02, 0x01,
  0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x01, 0x01, 0xC2, 0xC0, 0x02, 0xC2, 0xC0, 0x00, 0x00, 0x02,
  0xC0, 0xC0, 0x02, 0x00, 0x80, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x00, 0x01, 0x00, 0x82,
  0x82, 0x01, 0x01, 0x01, 0x02, 0x02, 0x02, 0x02, 0x02, 0x01, 0x01, 0x01, 0x01, 0x02, 0x00, 0x00,
  0x02, 0x02, 0x02, 0x02, 0x02, 0x01, 0x00, 0x02, 0x02, 0x01, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00,
  0x02, 0x00, 0x80, 0x80, 0x80, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x01,
  0x00, 0x00, 0x80, 0x80, 0x00, 0x01, 0x80, 0x00, 0x01, 0x80, 0x02, 0x02, 0xC2, 0x42, 0x80, 0x80,
  0x80, 0x01, 0x00, 0x02, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x02, 0x02, 0x02, 0x02, 0x01, 0x00,
  0x01, 0x02, 0x01, 0x02, 0x02, 0xC2, 0xC2, 0xC2, 0x02, 0x02, 0x02, 0x02, 0x02, 0xC2, 0x02, 0x02,
  0x02, 0x02, 0x02, 0x02, 0x41, 0x02, 0x02, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
]);

export type RomInfo = {
  fileName: string;
  title: string;
  gameCode: string;
  regionIndex: number;
  region: string;
  version: string;
  romSize: string;
  ramSize: string;
  exRamSize: string;
  hasHeader: boolean;
  valid: boolean;
  levelPointerOffset: number;
  entranceOffset: number;
};

export type LevelSnapshot = {
  id: number;
  dataPointer: number;
  spritePointer: number;
  header: Uint8Array;
  objects: Uint8Array;
  exits: Uint8Array;
  sprites: Uint8Array;
  objectCount: number;
  exitCount: number;
  spriteCount: number;
  size: number;
};

export type ExportEntry = { name: string; bytes: Uint8Array };

export type LevelImportFile = {
  id: number;
  header: Uint8Array;
  objects: Uint8Array;
  exits: Uint8Array;
  sprites: Uint8Array;
  dataSize: number;
  spriteSize: number;
  totalSize: number;
  sourceName: string;
};

export type FreeSpaceBlock = {
  offset: number;
  size: number;
  used: number;
};

export type ParsedRom = {
  bytes: Uint8Array;
  info: RomInfo;
  levels: LevelSnapshot[];
  entrances: Uint8Array;
};

function clampIndex(index: number, length: number): number {
  return index >= 0 && index < length ? index : -1;
}

export function addr2pc(address: number): number {
  const value = address | 0;
  if (value >= 0x400000) {
    return (value - 0x400000) | 0;
  }

  const bank = (value & 0xFF0000) >> 16;
  const absolute = value & 0x00FFFF;
  const corrected = absolute - 0x8000 * (1 - (bank % 2));

  return ((bank << 15) | corrected) | 0;
}

export function addr2snes(address: number): number {
  const value = address | 0;
  const bank = (value & 0xFF0000) * 2 + (value & 0x008000) * 2;
  const absolute = value & 0x00FFFF;
  const corrected = absolute + 0x008000 - (absolute & 0x008000);

  return (bank | corrected) | 0;
}

export function dickbutt2snes(address: number): number {
  return addr2snes(addr2pc(address));
}

export function isSupportedRomTitle(title: string): boolean {
  return /(YOSSY|YOSHI).*ISLAND/i.test(title);
}

export function normalizeRomBytes(input: Uint8Array): { bytes: Uint8Array; hasHeader: boolean } {
  const hasHeader = input.length % 1024 === 512;
  return hasHeader ? { bytes: input.slice(0x200), hasHeader } : { bytes: input, hasHeader };
}

export function readAscii(bytes: Uint8Array, offset: number, length: number): string {
  const end = Math.min(bytes.length, offset + length);
  let text = '';
  for (let i = offset; i < end; i++) {
    const value = bytes[i];
    if (value === 0) {
      break;
    }
    text += String.fromCharCode(value);
  }
  return text.trim();
}

export function readUint16LE(bytes: Uint8Array, offset: number): number {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

export function readUint24LE(bytes: Uint8Array, offset: number): number {
  return bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16);
}

function readRomByte(bytes: Uint8Array, snesAddress: number): number {
  return bytes[addr2pc(snesAddress)] ?? 0;
}

function ensureRange(bytes: Uint8Array, offset: number, length: number, label: string): void {
  if (offset < 0 || offset + length > bytes.length) {
    throw new Error(`${label} points outside the ROM (${offset.toString(16)})`);
  }
}

function parseLevelAt(bytes: Uint8Array, id: number, levelTableOffset: number): LevelSnapshot {
  const entryOffset = levelTableOffset + id * 6;
  const rawDataPointer = readUint24LE(bytes, entryOffset);
  const rawSpritePointer = readUint24LE(bytes, entryOffset + 3);
  const dataPointer = rawDataPointer;
  const spritePointer = rawSpritePointer;
  const dataPc = addr2pc(dataPointer);
  const spritePc = addr2pc(spritePointer);

  ensureRange(bytes, dataPc, 10, `Level ${id.toString(16).toUpperCase()} header`);
  const header = bytes.slice(dataPc, dataPc + 10);

  let cursor = dataPc + 10;
  let objectCount = 0;
  while (cursor < bytes.length) {
    const value = bytes[cursor];
    if (value === 0xFF) {
      cursor += 1;
      break;
    }

    const step = value === 0x00 || (OBJECT_TABLE[value] & 0x03) < 0x02 ? 4 : 5;
    cursor += step;
    objectCount += 1;
  }
  const objects = bytes.slice(dataPc + 10, cursor);

  const exitsStart = cursor;
  let exitCount = 0;
  while (cursor < bytes.length) {
    const value = bytes[cursor];
    cursor += 1;
    if (value >= 0x80) {
      break;
    }
    cursor += 4;
    exitCount += 1;
  }
  const exits = bytes.slice(exitsStart, cursor);

  ensureRange(bytes, spritePc, 2, `Level ${id.toString(16).toUpperCase()} sprites`);
  let spriteCursor = spritePc;
  let spriteCount = 0;
  while (spriteCursor + 1 < bytes.length) {
    if (readUint16LE(bytes, spriteCursor) === 0xFFFF) {
      spriteCursor += 2;
      break;
    }
    spriteCursor += 3;
    spriteCount += 1;
  }
  const sprites = bytes.slice(spritePc, spriteCursor);

  return {
    id,
    dataPointer,
    spritePointer,
    header,
    objects,
    exits,
    sprites,
    objectCount,
    exitCount,
    spriteCount,
    size: 1 + header.length + objects.length + exits.length + sprites.length,
  };
}

export function parseRom(input: Uint8Array, fileName = 'ROM.smc'): ParsedRom {
  const normalized = normalizeRomBytes(input);
  const bytes = normalized.bytes;
  if (bytes.length < 0x200000) {
    throw new Error("ROM is too small to be a valid Yoshi's Island image.");
  }

  const title = readAscii(bytes, addr2pc(0xFFC0), 21);
  const gameCode = readAscii(bytes, addr2pc(0xFFB2), 4);
  const regionIndex = readRomByte(bytes, 0xFFD9);
  const region = clampIndex(regionIndex, REGIONS.length) >= 0 ? REGIONS[regionIndex] : 'Invalid';
  const version = `1.${readRomByte(bytes, 0xFFDB)}`;
  const romSizeIndex = readRomByte(bytes, 0xFFD7) - 0x09;
  const romSize = romSizeIndex >= 0 && romSizeIndex < ROM_SIZES.length ? ROM_SIZES[romSizeIndex] : 'Invalid';
  const ramSizeByte = readRomByte(bytes, 0xFFD8);
  const exRamSizeByte = readRomByte(bytes, 0xFFBD);
  const ramSize = clampIndex(ramSizeByte, RAM_SIZES.length) >= 0 ? RAM_SIZES[ramSizeByte] : 'Invalid';
  const exRamSize = clampIndex(exRamSizeByte, RAM_SIZES.length) >= 0 ? RAM_SIZES[exRamSizeByte] : 'Invalid';
  const valid = isSupportedRomTitle(title) && (regionIndex === 0 || regionIndex === 1);
  const levelPointerOffset = LEVEL_POINTER_OFFSETS[regionIndex === 0 ? 0 : 1];
  const entranceOffset = LEVEL_MAIN_ENTRANCE_OFFSETS[regionIndex === 0 ? 0 : 1][0];
  const levelPointerPc = addr2pc(levelPointerOffset);
  const entrancePc = addr2pc(entranceOffset);

  const levels: LevelSnapshot[] = [];
  for (let id = 0; id < LEVEL_COUNT; id++) {
    levels.push(parseLevelAt(bytes, id, levelPointerPc));
  }

  return {
    bytes,
    info: {
      fileName,
      title,
      gameCode,
      regionIndex,
      region,
      version,
      romSize,
      ramSize,
      exRamSize,
      hasHeader: normalized.hasHeader,
      valid,
      levelPointerOffset,
      entranceOffset,
    },
    levels,
    entrances: bytes.slice(entrancePc, entrancePc + 988),
  };
}

export function buildLevelExport(level: LevelSnapshot): Uint8Array {
  const out = new Uint8Array(1 + level.header.length + level.objects.length + level.exits.length + level.sprites.length);
  let offset = 0;
  out[offset++] = level.id & 0xFF;
  out.set(level.header, offset);
  offset += level.header.length;
  out.set(level.objects, offset);
  offset += level.objects.length;
  out.set(level.exits, offset);
  offset += level.exits.length;
  out.set(level.sprites, offset);
  return out;
}

export function buildAllLevelExports(levels: readonly LevelSnapshot[]): ExportEntry[] {
  return levels.map((level) => ({
    name: `level_${level.id.toString(16).toUpperCase().padStart(2, '0')}.ylt`,
    bytes: buildLevelExport(level),
  }));
}

export function buildEntranceExport(entrances: Uint8Array): ExportEntry {
  return { name: 'entrances.yet', bytes: entrances.slice() };
}

export function parseLevelImport(bytes: Uint8Array, sourceName = 'level.ylt'): LevelImportFile {
  if (bytes.length < 12) {
    throw new Error(`Invalid level file: ${sourceName}`);
  }

  const id = bytes[0];
  const header = bytes.slice(1, 11);

  let cursor = 11;
  let objectCount = 0;
  while (cursor < bytes.length) {
    const value = bytes[cursor];
    cursor += 1;
    if (value === 0xFF) {
      break;
    }
    cursor += value === 0x00 || (OBJECT_TABLE[value] & 0x03) < 0x02 ? 3 : 4;
    objectCount += 1;
  }
  const objects = bytes.slice(11, cursor);

  const exitsStart = cursor;
  let exitCount = 0;
  while (cursor < bytes.length) {
    const value = bytes[cursor];
    cursor += 1;
    if (value >= 0x80) {
      break;
    }
    cursor += 4;
    exitCount += 1;
  }
  const exits = bytes.slice(exitsStart, cursor);

  const spriteStart = cursor;
  let spriteCount = 0;
  while (cursor + 1 < bytes.length) {
    if (readUint16LE(bytes, cursor) === 0xFFFF) {
      cursor += 2;
      break;
    }
    cursor += 3;
    spriteCount += 1;
  }
  const sprites = bytes.slice(spriteStart, cursor);

  return {
    id,
    header,
    objects,
    exits,
    sprites,
    dataSize: header.length + objects.length + exits.length,
    spriteSize: sprites.length,
    totalSize: 1 + header.length + objects.length + exits.length + sprites.length,
    sourceName,
  };
}

function crossBank(pcAddress: number, size: number): boolean {
  return (addr2snes(pcAddress) & 0xFF0000) !== (addr2snes(pcAddress + size) & 0xFF0000);
}

export function scanFreeSpace(bytes: Uint8Array): FreeSpaceBlock[] {
  const blocks: FreeSpaceBlock[] = [];
  let dataSize = 0;

  for (let freeOffset = 0; freeOffset < bytes.length; freeOffset++) {
    if (bytes[freeOffset] === 0xFF && !crossBank(freeOffset - dataSize, dataSize)) {
      dataSize += 1;
    } else if (dataSize > 5) {
      blocks.push({
        offset: freeOffset - dataSize,
        size: dataSize,
        used: 0,
      });
      dataSize = 0;
    } else {
      dataSize = 0;
    }
  }

  return blocks;
}

export function findFreeSpace(blocks: FreeSpaceBlock[], size: number): number | null {
  let bestIndex = -1;
  let bestSize = 0;
  const required = size + 3;

  for (let i = 0; i < blocks.length; i++) {
    const available = blocks[i].size - blocks[i].used;
    if (available >= required && (bestIndex === -1 || available < bestSize)) {
      bestIndex = i;
      bestSize = available;
    }
  }

  if (bestIndex === -1) {
    return null;
  }

  const block = blocks[bestIndex];
  const address = block.offset + block.used + 2;
  block.used += required;
  return address;
}

export function writeBytes(bytes: Uint8Array, pcAddress: number, data: Uint8Array): void {
  bytes.set(data, pcAddress);
}

export function writeByte(bytes: Uint8Array, pcAddress: number, value: number): void {
  bytes[pcAddress] = value & 0xFF;
}

export function writeUint24LE(bytes: Uint8Array, pcAddress: number, value: number): void {
  bytes[pcAddress] = value & 0xFF;
  bytes[pcAddress + 1] = (value >> 8) & 0xFF;
  bytes[pcAddress + 2] = (value >> 16) & 0xFF;
}

export function clearLevelBytes(bytes: Uint8Array, level: LevelSnapshot): void {
  const dataStart = addr2pc(level.dataPointer);
  const dataEnd = dataStart + level.header.length + level.objects.length + level.exits.length;
  const spriteStart = addr2pc(level.spritePointer);
  const spriteEnd = spriteStart + level.sprites.length;
  bytes.fill(0xFF, dataStart, dataEnd);
  bytes.fill(0xFF, spriteStart, spriteEnd);
}

export function setLevelPointers(bytes: Uint8Array, levelPointerOffset: number, id: number, dataPointer: number, spritePointer: number): void {
  const pcOffset = addr2pc(levelPointerOffset) + id * 6;
  writeUint24LE(bytes, pcOffset, dataPointer);
  writeUint24LE(bytes, pcOffset + 3, spritePointer);
}

export function importLevelsIntoRom(
  romBytes: Uint8Array,
  rom: ParsedRom,
  imports: readonly LevelImportFile[],
  overrideId: number | null = null,
): Uint8Array {
  const bytes = romBytes.slice();
  const current = parseRom(bytes, rom.info.fileName);
  const targets = new Set<number>();

  for (const entry of imports) {
    targets.add(overrideId ?? entry.id);
  }

  for (const id of targets) {
    const level = current.levels[id];
    if (!level) {
      throw new Error(`Invalid level ID ${id.toString(16).toUpperCase()}`);
    }
    clearLevelBytes(bytes, level);
  }

  const blocks = scanFreeSpace(bytes);

  for (const entry of imports) {
    const id = overrideId ?? entry.id;
    const level = current.levels[id];
    if (!level) {
      throw new Error(`Invalid level ID ${id.toString(16).toUpperCase()}`);
    }

    const dataOffset = findFreeSpace(blocks, entry.dataSize);
    if (dataOffset === null) {
      throw new Error(`Couldn't find available free space for level ${id.toString(16).toUpperCase()} data`);
    }

    setLevelPointers(bytes, rom.info.levelPointerOffset, id, addr2snes(dataOffset), level.spritePointer);
    writeBytes(bytes, dataOffset, entry.header);
    writeBytes(bytes, dataOffset + 10, entry.objects);
    writeBytes(bytes, dataOffset + 10 + entry.objects.length, entry.exits);

    const spriteOffset = findFreeSpace(blocks, entry.spriteSize);
    if (spriteOffset === null) {
      throw new Error(`Couldn't find available free space for level ${id.toString(16).toUpperCase()} sprites`);
    }

    setLevelPointers(bytes, rom.info.levelPointerOffset, id, addr2snes(dataOffset), addr2snes(spriteOffset));
    writeBytes(bytes, spriteOffset, entry.sprites);
  }

  return bytes;
}

export function importEntrancesIntoRom(romBytes: Uint8Array, rom: ParsedRom, entrances: Uint8Array): Uint8Array {
  if (entrances.length !== 988) {
    throw new Error('Invalid entrances file size');
  }

  const bytes = romBytes.slice();
  bytes.set(entrances, addr2pc(rom.info.entranceOffset));
  return bytes;
}
