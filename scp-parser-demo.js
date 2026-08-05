const fileInput = document.querySelector('#scp-file');
const status = document.querySelector('#status');
const result = document.querySelector('#result');
const downloadButton = document.querySelector('#download-json');
const noteTypes = document.querySelector('#note-types');
const warningList = document.querySelector('#warnings');
let latestParsed = null;

function setStatus(message, state = '') {
  status.textContent = message;
  status.classList.toggle('is-error', state === 'error');
  status.classList.toggle('is-working', state === 'working');
}

function formatCount(value) {
  return new Intl.NumberFormat('zh-Hant').format(value);
}

function renderWarnings(level) {
  const warnings = [...level.warnings];
  if (!warnings.length) {
    const item = document.createElement('li');
    item.className = 'all-clear';
    item.textContent = '所有 entity reference 均可解析，沒有重複名稱。';
    warningList.replaceChildren(item);
    return;
  }
  warningList.replaceChildren(...warnings.map((warning) => {
    const item = document.createElement('li');
    item.textContent = `${warning.code}：${warning.message}${warning.count ? `（${warning.count}）` : ''}`;
    return item;
  }));
}

function renderLevel(level, levelIndex, levelCount) {
  document.querySelector('#level-subtitle').textContent = `${level.metadata.engine?.title || '未知引擎'} · Lv.${level.metadata.rating ?? '?'}${levelCount > 1 ? ` · 第 ${levelIndex + 1}/${levelCount} 關` : ''}`;
  document.querySelector('#result-title').textContent = level.metadata.title || level.metadata.name || '未命名關卡';
  document.querySelector('#level-credit').textContent = `${level.metadata.artists || '未知曲師'} · 譜面 ${level.metadata.author || '未知'}`;
  document.querySelector('#entity-count').textContent = formatCount(level.entities.length);
  document.querySelector('#note-count').textContent = formatCount(level.notes.length);
  document.querySelector('#playable-count').textContent = formatCount(level.playableNotes.length);
  document.querySelector('#connector-count').textContent = formatCount(level.connectors.length);
  document.querySelector('#bpm-count').textContent = formatCount(level.bpmChanges.length);
  document.querySelector('#timescale-count').textContent = formatCount(level.timeScaleChanges.length);

  const rows = Object.entries(level.noteArchetypeCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([archetype, count]) => {
      const row = document.createElement('tr');
      const name = document.createElement('td');
      const countCell = document.createElement('td');
      const playable = document.createElement('td');
      name.textContent = archetype;
      countCell.textContent = formatCount(count);
      playable.textContent = level.archetypeSchema[archetype]?.hasInput ? '是' : '否';
      row.append(name, countCell, playable);
      return row;
    });
  noteTypes.replaceChildren(...rows);
  renderWarnings(level);
  result.hidden = false;
}

fileInput.addEventListener('change', async () => {
  const [file] = fileInput.files;
  if (!file) return;
  result.hidden = true;
  downloadButton.disabled = true;
  latestParsed = null;
  setStatus(`正在解析 ${file.name}…`, 'working');
  try {
    const parser = window.GugaScpParser;
    if (!parser) throw new Error('SCP 解析器載入失敗，請重新整理頁面後再試。');
    const parsed = await parser.parseScp(file);
    latestParsed = parsed;
    renderLevel(parsed.levels[0], 0, parsed.levels.length);
    downloadButton.disabled = false;
    setStatus(`解析完成：${parsed.levels.length} 個關卡、${formatCount(parsed.archive.entryCount)} 個封裝項目。`);
  } catch (error) {
    console.error(error);
    setStatus(`${error.code ? `${error.code}：` : ''}${error.message}`, 'error');
  }
});

downloadButton.addEventListener('click', () => {
  if (!latestParsed) return;
  const parser = window.GugaScpParser;
  if (!parser) return;
  const json = parser.serializeScp(latestParsed);
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${latestParsed.levels[0]?.metadata.name || 'scp-chart'}.json`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
});
