import {
  buildAllLevelExports,
  buildEntranceExport,
  clearLevelBytes,
  importEntrancesIntoRom,
  importLevelsIntoRom,
  parseLevelImport,
  parseRom,
  type ExportEntry,
  type LevelImportFile,
  type ParsedRom,
} from '../core/yoshi';
import { entriesToZip } from '../core/archive';

const headerUrl = new URL('../assets/header.png', import.meta.url).href;
const faviconUrl = new URL('../assets/icon.ico', import.meta.url).href;
const levelIconUrls = [
  new URL('../assets/icons/intro.png', import.meta.url).href,
  new URL('../assets/icons/tutorial.png', import.meta.url).href,
  new URL('../assets/icons/block.png', import.meta.url).href,
  new URL('../assets/icons/egg.png', import.meta.url).href,
  new URL('../assets/icons/world1 (1).png', import.meta.url).href,
  new URL('../assets/icons/world1 (2).png', import.meta.url).href,
  new URL('../assets/icons/world1 (3).png', import.meta.url).href,
  new URL('../assets/icons/world1 (4).png', import.meta.url).href,
  new URL('../assets/icons/world1 (5).png', import.meta.url).href,
  new URL('../assets/icons/world1 (6).png', import.meta.url).href,
  new URL('../assets/icons/world1 (7).png', import.meta.url).href,
  new URL('../assets/icons/world1 (8).png', import.meta.url).href,
  new URL('../assets/icons/world1 (9).png', import.meta.url).href,
  new URL('../assets/icons/world2 (1).png', import.meta.url).href,
  new URL('../assets/icons/world2 (2).png', import.meta.url).href,
  new URL('../assets/icons/world2 (3).png', import.meta.url).href,
  new URL('../assets/icons/world2 (4).png', import.meta.url).href,
  new URL('../assets/icons/world2 (5).png', import.meta.url).href,
  new URL('../assets/icons/world2 (6).png', import.meta.url).href,
  new URL('../assets/icons/world2 (7).png', import.meta.url).href,
  new URL('../assets/icons/world2 (8).png', import.meta.url).href,
  new URL('../assets/icons/world2 (9).png', import.meta.url).href,
  new URL('../assets/icons/world3 (1).png', import.meta.url).href,
  new URL('../assets/icons/world3 (2).png', import.meta.url).href,
  new URL('../assets/icons/world3 (3).png', import.meta.url).href,
  new URL('../assets/icons/world3 (4).png', import.meta.url).href,
  new URL('../assets/icons/world3 (5).png', import.meta.url).href,
  new URL('../assets/icons/world3 (6).png', import.meta.url).href,
  new URL('../assets/icons/world3 (7).png', import.meta.url).href,
  new URL('../assets/icons/world3 (8).png', import.meta.url).href,
  new URL('../assets/icons/world3 (9).png', import.meta.url).href,
  new URL('../assets/icons/world4 (1).png', import.meta.url).href,
  new URL('../assets/icons/world4 (2).png', import.meta.url).href,
  new URL('../assets/icons/world4 (3).png', import.meta.url).href,
  new URL('../assets/icons/world4 (4).png', import.meta.url).href,
  new URL('../assets/icons/world4 (5).png', import.meta.url).href,
  new URL('../assets/icons/world4 (6).png', import.meta.url).href,
  new URL('../assets/icons/world4 (7).png', import.meta.url).href,
  new URL('../assets/icons/world4 (8).png', import.meta.url).href,
  new URL('../assets/icons/world4 (9).png', import.meta.url).href,
  new URL('../assets/icons/world5 (1).png', import.meta.url).href,
  new URL('../assets/icons/world5 (2).png', import.meta.url).href,
  new URL('../assets/icons/world5 (3).png', import.meta.url).href,
  new URL('../assets/icons/world5 (4).png', import.meta.url).href,
  new URL('../assets/icons/world5 (5).png', import.meta.url).href,
  new URL('../assets/icons/world5 (6).png', import.meta.url).href,
  new URL('../assets/icons/world5 (7).png', import.meta.url).href,
  new URL('../assets/icons/world5 (8).png', import.meta.url).href,
  new URL('../assets/icons/world5 (9).png', import.meta.url).href,
  new URL('../assets/icons/world6 (1).png', import.meta.url).href,
  new URL('../assets/icons/world6 (2).png', import.meta.url).href,
  new URL('../assets/icons/world6 (3).png', import.meta.url).href,
  new URL('../assets/icons/world6 (4).png', import.meta.url).href,
  new URL('../assets/icons/world6 (5).png', import.meta.url).href,
  new URL('../assets/icons/world6 (6).png', import.meta.url).href,
  new URL('../assets/icons/world6 (7).png', import.meta.url).href,
  new URL('../assets/icons/world6 (8).png', import.meta.url).href,
  new URL('../assets/icons/world6 (9).png', import.meta.url).href,
] as const;

type AppState = {
  fileName: string;
  romBytes: Uint8Array | null;
  rom: ParsedRom | null;
  loading: boolean;
  status: string;
  statusKind: 'idle' | 'ok' | 'error';
  search: string;
  selected: Set<number>;
  modal:
    | { kind: 'none' }
    | { kind: 'about' }
    | {
        kind: 'confirm';
        title: string;
        message: string;
        confirmLabel: string;
        cancelLabel: string;
      };
};

type DomRefs = {
  loadRomBtn: HTMLButtonElement;
  exportBtn: HTMLButtonElement;
  clearLevelsBtn: HTMLButtonElement;
  saveRomBtn: HTMLButtonElement;
  importBtn: HTMLButtonElement;
  aboutBtn: HTMLButtonElement;
  fileName: HTMLElement;
  loadState: HTMLElement;
  statusLine: HTMLElement;
  searchInput: HTMLInputElement;
  selectVisible: HTMLInputElement;
  levelsBody: HTMLTableSectionElement;
  modalRoot: HTMLElement;
  romTitle: HTMLElement;
  romCode: HTMLElement;
  romRegion: HTMLElement;
  romVersion: HTMLElement;
  romRomSize: HTMLElement;
  romRamSize: HTMLElement;
  romSramSize: HTMLElement;
  romHeadered: HTMLElement;
  tableWrap: HTMLDivElement;
};

const state: AppState = {
  fileName: 'No ROM loaded',
  romBytes: null,
  rom: null,
  loading: false,
  status: "Load the Yoshi's Island ROM to begin.",
  statusKind: 'idle',
  search: '',
  selected: new Set(),
  modal: { kind: 'none' },
};

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('App root not found');
}

const dom = getDomRefs();
let dragDepth = 0;
let modalResolver: ((value: boolean) => void) | null = null;
let pendingTableScrollTop = 0;

setupStaticBranding();
bindEvents();
render();

function getDomRefs(): DomRefs {
  const required = <T extends HTMLElement>(selector: string) => {
    const node = document.querySelector<T>(selector);
    if (!node) {
      throw new Error(`Missing DOM node: ${selector}`);
    }
    return node;
  };

  return {
    loadRomBtn: required<HTMLButtonElement>('#load-rom-btn'),
    exportBtn: required<HTMLButtonElement>('#export-btn'),
    clearLevelsBtn: required<HTMLButtonElement>('#clear-levels-btn'),
    saveRomBtn: required<HTMLButtonElement>('#save-rom-btn'),
    importBtn: required<HTMLButtonElement>('#import-btn'),
    aboutBtn: required<HTMLButtonElement>('#about-btn'),
    fileName: required<HTMLElement>('#file-name'),
    loadState: required<HTMLElement>('#load-state'),
    statusLine: required<HTMLElement>('#status-line'),
    searchInput: required<HTMLInputElement>('#search-input'),
    selectVisible: required<HTMLInputElement>('#select-visible'),
    levelsBody: required<HTMLTableSectionElement>('#levels-body'),
    modalRoot: required<HTMLElement>('#modal-root'),
    romTitle: required<HTMLElement>('#rom-title'),
    romCode: required<HTMLElement>('#rom-code'),
    romRegion: required<HTMLElement>('#rom-region'),
    romVersion: required<HTMLElement>('#rom-version'),
    romRomSize: required<HTMLElement>('#rom-rom-size'),
    romRamSize: required<HTMLElement>('#rom-ram-size'),
    romSramSize: required<HTMLElement>('#rom-sram-size'),
    romHeadered: required<HTMLElement>('#rom-headered'),
    tableWrap: required<HTMLDivElement>('.table-wrap'),
  };
}

function setupStaticBranding(): void {
  const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]') ?? document.createElement('link');
  link.rel = 'icon';
  link.href = faviconUrl;
  if (!link.isConnected) {
    document.head.append(link);
  }
}

function bindEvents(): void {
  dom.loadRomBtn.addEventListener('click', () => ensureFileInput().click());
  dom.exportBtn.addEventListener('click', () => void exportLevels());
  dom.clearLevelsBtn.addEventListener('click', () => void clearLevels());
  dom.saveRomBtn.addEventListener('click', () => void saveRom());
  dom.importBtn.addEventListener('click', () => ensureImportInput().click());
  dom.aboutBtn.addEventListener('click', () => openAbout());

  dom.searchInput.addEventListener('input', () => {
    state.search = dom.searchInput.value;
    render();
  });

  dom.selectVisible.addEventListener('change', () => selectAllVisible(dom.selectVisible.checked));

  dom.levelsBody.addEventListener('change', (event) => {
    const target = event.target as HTMLInputElement | null;
    if (!target || target.tagName !== 'INPUT' || target.type !== 'checkbox') {
      return;
    }

    const id = Number(target.dataset.levelId);
    if (Number.isFinite(id)) {
      pendingTableScrollTop = dom.tableWrap.scrollTop;
      toggleLevelSelection(id, target.checked);
    }
  });

  dom.levelsBody.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }

    if (target.closest('input, button, a, label, select, textarea')) {
      return;
    }

    const row = target.closest<HTMLTableRowElement>('tr[data-level-id]');
    if (!row) {
      return;
    }

    const id = Number(row.dataset.levelId);
    if (!Number.isFinite(id)) {
      return;
    }

    pendingTableScrollTop = dom.tableWrap.scrollTop;
    toggleLevelSelection(id, !state.selected.has(id));
  });

  dom.tableWrap.addEventListener('scroll', () => {
    pendingTableScrollTop = dom.tableWrap.scrollTop;
  });

  dom.modalRoot.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    const button = target?.closest<HTMLButtonElement>('[data-modal-action]');
    if (!button) {
      return;
    }

    const action = button.dataset.modalAction;
    if (action === 'confirm') {
      closeModal(true);
    } else if (action === 'cancel' || action === 'ok') {
      closeModal(false);
    }
  });

  const fileInput = ensureFileInput();
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    if (file) {
      await loadRom(file);
    }
    fileInput.value = '';
  });

  const dropzone = document.querySelector<HTMLDivElement>('#dropzone');
  dropzone?.addEventListener('dragenter', (event) => {
    event.preventDefault();
    dragDepth += 1;
    dropzone.classList.add('dragover');
  });
  dropzone?.addEventListener('dragover', (event) => {
    event.preventDefault();
  });
  dropzone?.addEventListener('dragleave', (event) => {
    event.preventDefault();
    dragDepth = Math.max(0, dragDepth - 1);
    if (dragDepth === 0) {
      dropzone.classList.remove('dragover');
    }
  });
  dropzone?.addEventListener('drop', async (event) => {
    event.preventDefault();
    dragDepth = 0;
    dropzone.classList.remove('dragover');
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      await loadRom(file);
    }
  });
}

function setStatus(message: string, kind: AppState['statusKind'] = 'idle'): void {
  state.status = message;
  state.statusKind = kind;
  render();
}

function formatHex(value: number, digits = 6): string {
  return `0x${value.toString(16).toUpperCase().padStart(digits, '0')}`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes.toLocaleString()} B`;
  }

  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  }

  const mb = kb / 1024;
  return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
}

function formatCountAndBytes(count: number, bytes: number): string {
  return `${count.toLocaleString()} (${formatBytes(bytes)})`;
}

function levelIconUrl(id: number): string {
  return levelIconUrls[id % levelIconUrls.length];
}

function selectedLevels(): number[] {
  return [...state.selected].sort((a, b) => a - b);
}

function openAbout(): void {
  state.modal = { kind: 'about' };
  render();
}

function closeModal(result = false): void {
  const resolver = modalResolver;
  modalResolver = null;
  state.modal = { kind: 'none' };
  render();
  resolver?.(result);
}

function askConfirm(
  title: string,
  message: string,
  confirmLabel = 'Yes',
  cancelLabel = 'No',
): Promise<boolean> {
  state.modal = {
    kind: 'confirm',
    title,
    message,
    confirmLabel,
    cancelLabel,
  };
  render();
  return new Promise<boolean>((resolve) => {
    modalResolver = resolve;
  });
}

function downloadBlob(name: string, bytes: Uint8Array): void {
  const blob = new Blob([bytes], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.rel = 'noopener';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function downloadArchiveOrFile(entries: ExportEntry[], archiveName: string): void {
  if (entries.length === 1) {
    const entry = entries[0];
    downloadBlob(entry.name, entry.bytes);
    setStatus(`Downloaded ${entry.name}.`, 'ok');
    return;
  }

  const archive = entriesToZip(entries, archiveName);
  downloadBlob(archive.name, archive.bytes);
  setStatus(`Downloaded ${archive.name} with ${entries.length} files.`, 'ok');
}

async function fileToBytes(file: File): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer());
}

async function loadRom(file: File): Promise<void> {
  state.loading = true;
  render();

  try {
    const bytes = await fileToBytes(file);
    const rom = parseRom(bytes, file.name);
    if (!rom.info.valid) {
      const continueLoad = await askConfirm(
        'Invalid Yoshi\'s Island ROM',
        "Invalid ROM, you need a Yoshi's Island ROM file. Do you wanna try load the level data anyway?",
      );
      if (!continueLoad) {
        state.romBytes = null;
        state.rom = null;
        state.selected = new Set();
        setStatus('Load cancelled.', 'idle');
        return;
      }
    }

    state.romBytes = rom.bytes.slice();
    state.rom = rom;
    state.fileName = file.name;
    state.selected = new Set();
    setStatus(`Loaded ${file.name}.`, rom.info.valid ? 'ok' : 'idle');
  } catch (error) {
    state.romBytes = null;
    state.rom = null;
    state.selected = new Set();
    const message = error instanceof Error ? error.message : String(error);
    setStatus(message, 'error');
  } finally {
    state.loading = false;
    render();
  }
}

function updateRomInfo(): void {
  const rom = state.rom;
  if (!rom) {
    dom.romTitle.textContent = '-';
    dom.romCode.textContent = '-';
    dom.romRegion.textContent = '-';
    dom.romVersion.textContent = '-';
    dom.romRomSize.textContent = '-';
    dom.romRamSize.textContent = '-';
    dom.romSramSize.textContent = '-';
    dom.romHeadered.textContent = '-';
    return;
  }

  const { info } = rom;
  dom.romTitle.textContent = info.title;
  dom.romCode.textContent = info.gameCode;
  dom.romRegion.textContent = info.region;
  dom.romVersion.textContent = info.version;
  dom.romRomSize.textContent = info.romSize;
  dom.romRamSize.textContent = info.ramSize;
  dom.romSramSize.textContent = info.exRamSize;
  dom.romHeadered.textContent = info.hasHeader ? 'Yes' : 'No';
}

function updateControls(): void {
  const rom = state.rom;
  dom.fileName.textContent = state.fileName;
  dom.loadState.textContent = state.loading ? 'Reading...' : 'Ready';
  dom.statusLine.textContent = state.status;
  dom.statusLine.className = `status ${state.statusKind}`;
  dom.loadRomBtn.disabled = state.loading;
  dom.exportBtn.disabled = !rom;
  dom.clearLevelsBtn.disabled = !rom;
  dom.saveRomBtn.disabled = !state.romBytes;
  dom.importBtn.disabled = !rom;
  dom.aboutBtn.disabled = false;
  dom.searchInput.disabled = !rom;
  dom.selectVisible.disabled = !rom;
  dom.selectVisible.checked = filteredLevels().length > 0 && filteredLevels().every((level) => state.selected.has(level.id));
}

function filteredLevels() {
  if (!state.rom) {
    return [];
  }

  const query = state.search.trim().toLowerCase();
  if (!query) {
    return state.rom.levels;
  }

  return state.rom.levels.filter((level) => {
    const haystack = [
      level.id.toString(16).padStart(2, '0'),
      level.objectCount.toString(),
      level.exitCount.toString(),
      level.spriteCount.toString(),
      level.size.toString(),
      formatHex(level.dataPointer),
      formatHex(level.spritePointer),
    ].join(' ').toLowerCase();
    return haystack.includes(query);
  });
}

function renderLevelsTable(): void {
  const rom = state.rom;
  const levels = filteredLevels();
  const frag = document.createDocumentFragment();

  if (!rom) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 9;
    td.className = 'empty-row';
    td.textContent = 'Load a ROM to populate level data.';
    tr.append(td);
    frag.append(tr);
    dom.levelsBody.replaceChildren(frag);
    return;
  }

  for (const level of levels) {
    frag.append(renderLevelRow(level));
  }

  dom.levelsBody.replaceChildren(frag);
}

function renderLevelRow(level: ParsedRom['levels'][number]): HTMLTableRowElement {
  const tr = document.createElement('tr');
  tr.dataset.levelId = String(level.id);
  if (state.selected.has(level.id)) {
    tr.classList.add('selected');
  }

  const tdSelect = document.createElement('td');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.dataset.levelId = String(level.id);
  checkbox.checked = state.selected.has(level.id);
  tdSelect.append(checkbox);

  const tdIcon = document.createElement('td');
  const badge = document.createElement('span');
  badge.className = 'level-badge';
  const img = document.createElement('img');
  img.className = 'level-icon';
  img.src = levelIconUrl(level.id);
  img.alt = '';
  img.setAttribute('aria-hidden', 'true');
  const label = document.createElement('span');
  label.className = 'mono';
  label.textContent = level.id.toString(16).toUpperCase().padStart(2, '0');
  badge.append(img, label);
  tdIcon.append(badge);

  const tdLevel = document.createElement('td');
  tdLevel.className = 'mono';
  tdLevel.textContent = level.id.toString(16).toUpperCase().padStart(2, '0');

  const tdData = document.createElement('td');
  tdData.className = 'mono';
  tdData.textContent = formatHex(level.dataPointer);

  const tdSprite = document.createElement('td');
  tdSprite.className = 'mono';
  tdSprite.textContent = formatHex(level.spritePointer);

  const tdObjects = document.createElement('td');
  tdObjects.className = 'mono';
  tdObjects.textContent = formatCountAndBytes(level.objectCount, level.objects.length);

  const tdExits = document.createElement('td');
  tdExits.className = 'mono';
  tdExits.textContent = formatCountAndBytes(level.exitCount, level.exits.length);

  const tdSprites = document.createElement('td');
  tdSprites.className = 'mono';
  tdSprites.textContent = formatCountAndBytes(level.spriteCount, level.sprites.length);

  const tdSize = document.createElement('td');
  tdSize.className = 'mono';
  tdSize.textContent = formatBytes(level.size);

  tr.append(tdSelect, tdIcon, tdLevel, tdData, tdSprite, tdObjects, tdExits, tdSprites, tdSize);
  return tr;
}

function renderModal(): void {
  dom.modalRoot.replaceChildren();

  if (state.modal.kind === 'none') {
    return;
  }

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';

  const dialog = document.createElement('div');
  dialog.className = state.modal.kind === 'about' ? 'dialog about-dialog' : 'dialog confirm-dialog';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.style.backgroundImage = `linear-gradient(180deg, rgba(3, 16, 28, 0.18), rgba(3, 16, 28, 0.88)), url('${headerUrl}')`;

  if (state.modal.kind === 'about') {
    const header = document.createElement('div');
    header.className = 'about-header';

    const icon = document.createElement('img');
    icon.className = 'tool-icon about-tool-icon';
    icon.src = faviconUrl;
    icon.alt = '';
    icon.setAttribute('aria-hidden', 'true');

    const copy = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'dialog-title';
    title.id = 'about-title';
    title.textContent = 'About';
    const subtitle = document.createElement('div');
    subtitle.className = 'dialog-subtitle';
    subtitle.textContent = "Yoshi's Island Level Tool - v1.2";
    const meta = document.createElement('div');
    meta.className = 'dialog-meta';
    meta.textContent = 'Developer: FURiOUS';
    copy.append(title, subtitle, meta);
    header.append(icon, copy);

    const body = document.createElement('div');
    body.className = 'about-body';
    const p = document.createElement('p');
    p.textContent = 'Thanks to ArneTheGreat, RaidenTheQuick, Lui and all the ASM gods that helped me to make this tool :D';
    body.append(p);

    const footer = document.createElement('div');
    footer.className = 'dialog-footer';
    const ok = document.createElement('button');
    ok.className = 'btn classic default';
    ok.dataset.modalAction = 'ok';
    ok.textContent = 'OK';
    footer.append(ok);

    dialog.setAttribute('aria-labelledby', 'about-title');
    dialog.append(header, body, footer);
  } else {
    const title = document.createElement('div');
    title.className = 'dialog-title';
    title.id = 'confirm-title';
    title.textContent = state.modal.title;

    const body = document.createElement('div');
    body.className = 'dialog-body';
    for (const line of state.modal.message.split('\n')) {
      const text = document.createTextNode(line);
      body.append(text);
      body.append(document.createElement('br'));
    }
    if (body.lastChild?.nodeName === 'BR') {
      body.removeChild(body.lastChild);
    }

    const footer = document.createElement('div');
    footer.className = 'dialog-footer';
    const confirm = document.createElement('button');
    confirm.className = 'btn classic default';
    confirm.dataset.modalAction = 'confirm';
    confirm.textContent = state.modal.confirmLabel;
    const cancel = document.createElement('button');
    cancel.className = 'btn classic';
    cancel.dataset.modalAction = 'cancel';
    cancel.textContent = state.modal.cancelLabel;
    footer.append(confirm, cancel);

    dialog.setAttribute('aria-labelledby', 'confirm-title');
    dialog.append(title, body, footer);
  }

  backdrop.append(dialog);
  dom.modalRoot.append(backdrop);
}

async function saveRom(): Promise<void> {
  if (!state.romBytes) {
    setStatus('Load a ROM first.', 'error');
    return;
  }

  const base = state.fileName.replace(/\.(smc|sfc)$/i, '');
  const name = `${base}-edited.smc`;
  downloadBlob(name, state.romBytes);
  setStatus(`Downloaded ${name}.`, 'ok');
}

async function exportLevels(): Promise<void> {
  if (!state.rom) {
    setStatus('Load a ROM first.', 'error');
    return;
  }

  const ids = selectedLevels();
  const exportIds = ids.length > 0 ? ids : state.rom.levels.map((level) => level.id);
  const exportEntrancesToo = await askConfirm(
    'Export Levels',
    'Do you want to include the entrances data in the same zip file?',
    'Yes',
    'No',
  );

  const entries = buildAllLevelExports(exportIds.map((id) => state.rom!.levels[id]));
  if (exportEntrancesToo) {
    entries.push(buildEntranceExport(state.rom.entrances));
  }

  await exportEntries(
    entries,
    exportEntrancesToo
      ? `${state.rom.info.fileName.replace(/\.(smc|sfc)$/i, '')}-levels-and-entrances.zip`
      : `${state.rom.info.fileName.replace(/\.(smc|sfc)$/i, '')}-levels.zip`,
  );
}

async function exportEntries(entries: ExportEntry[], archiveName: string): Promise<void> {
  if (entries.length === 0) {
    setStatus('Nothing selected to export.', 'error');
    return;
  }
  downloadArchiveOrFile(entries, archiveName);
}

async function parseImportFiles(files: FileList | File[]): Promise<{ levelImports: LevelImportFile[]; entrances: Uint8Array | null }> {
  const levelImports: LevelImportFile[] = [];
  let entrances: Uint8Array | null = null;

  for (const file of Array.from(files)) {
    const lower = file.name.toLowerCase();
    const bytes = await fileToBytes(file);

    if (lower.endsWith('.zip')) {
      const { unzipSync } = await import('fflate');
      const entries = Object.entries(unzipSync(bytes)).sort(([a], [b]) => a.localeCompare(b));
      for (const [name, data] of entries) {
        const entryName = name.toLowerCase();
        if (entryName.endsWith('.ylt')) {
          levelImports.push(parseLevelImport(data, name));
        } else if (entryName.endsWith('.yet')) {
          entrances = data;
        }
      }
      continue;
    }

    if (lower.endsWith('.ylt')) {
      levelImports.push(parseLevelImport(bytes, file.name));
    } else if (lower.endsWith('.yet')) {
      entrances = bytes;
    }
  }

  return { levelImports, entrances };
}

async function importFiles(files: FileList | File[]): Promise<void> {
  if (!state.rom || !state.romBytes) {
    setStatus('Load a ROM first.', 'error');
    return;
  }

  const { levelImports, entrances } = await parseImportFiles(files);
  if (levelImports.length === 0 && !entrances) {
    setStatus('No importable files found.', 'error');
    return;
  }

  let importedLevels = false;
  if (levelImports.length > 0) {
    const overrideId = levelImports.length === 1 && state.selected.size === 1 ? [...state.selected][0] : null;
    const nextBytes = importLevelsIntoRom(state.romBytes, state.rom, levelImports, overrideId);
    state.romBytes = nextBytes;
    state.rom = parseRom(nextBytes, state.fileName);
    importedLevels = true;
    setStatus(`Imported ${levelImports.length} level file${levelImports.length === 1 ? '' : 's'}.`, 'ok');
  }

  if (entrances) {
    if (importedLevels) {
      const importEntrancesToo = await askConfirm(
        'Import Entrances',
        "I've found an entrances file in the selected files. Do you want to import it too?",
        'Yes',
        'No',
      );
      if (!importEntrancesToo) {
        return;
      }
    }

    const nextBytes = importEntrancesIntoRom(state.romBytes, state.rom, entrances);
    state.romBytes = nextBytes;
    state.rom = parseRom(nextBytes, state.fileName);
    setStatus(importedLevels ? 'Imported levels and entrances data.' : 'Imported entrances data.', 'ok');
  }
}

async function clearLevels(): Promise<void> {
  if (!state.rom || !state.romBytes) {
    setStatus('Load a ROM first.', 'error');
    return;
  }

  const ids = selectedLevels();
  const targetIds = ids.length > 0 ? ids : state.rom.levels.map((level) => level.id);
  const confirmed = await askConfirm(
    targetIds.length === 1 ? 'Clear Level' : 'Clear Levels',
    targetIds.length === 1
      ? 'Are you sure you wanna clear the level data and sprites?'
      : 'Are you sure you wanna clear all levels data and sprites?',
  );
  if (!confirmed) {
    return;
  }

  const nextBytes = state.romBytes.slice();
  for (const id of targetIds) {
    clearLevelBytes(nextBytes, state.rom.levels[id]);
  }
  state.romBytes = nextBytes;
  state.rom = parseRom(nextBytes, state.fileName);
  state.selected = new Set(targetIds);
  setStatus(
    targetIds.length === 1 ? 'Level cleared successfully :)' : 'All levels were successfully cleared! :D',
    'ok',
  );
}

function toggleLevelSelection(id: number, checked: boolean): void {
  if (checked) {
    state.selected.add(id);
  } else {
    state.selected.delete(id);
  }
  render();
}

function selectAllVisible(checked: boolean): void {
  if (!state.rom) {
    return;
  }
  const visibleIds = filteredLevels().map((level) => level.id);
  state.selected = checked ? new Set(visibleIds) : new Set();
  render();
}

function render(): void {
  const rom = state.rom;
  const levels = filteredLevels();
  const selectedVisible = levels.filter((level) => state.selected.has(level.id)).length;
  const allVisibleSelected = levels.length > 0 && selectedVisible === levels.length;

  updateControls();
  updateRomInfo();
  dom.selectVisible.checked = allVisibleSelected;

  renderLevelsTable();
  renderModal();

  requestAnimationFrame(() => {
    dom.tableWrap.scrollTop = pendingTableScrollTop;
  });
}

function ensureFileInput(): HTMLInputElement {
  let input = document.querySelector<HTMLInputElement>('#rom-input');
  if (!input) {
    input = document.createElement('input');
    input.type = 'file';
    input.accept = '.smc,.sfc';
    input.id = 'rom-input';
    input.style.display = 'none';
    document.body.append(input);
  }
  return input;
}

function ensureImportInput(): HTMLInputElement {
  let input = document.querySelector<HTMLInputElement>('#import-input');
  if (!input) {
    input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip,.ylt,.yet';
    input.multiple = true;
    input.id = 'import-input';
    input.style.display = 'none';
    input.addEventListener('change', async () => {
      const files = input?.files;
      if (files && files.length > 0) {
        await importFiles(files);
      }
      if (input) {
        input.value = '';
      }
    });
    document.body.append(input);
  }
  return input;
}
