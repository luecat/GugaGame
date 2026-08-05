(function initScpParser(root, factory) {
  const isCommonJs = typeof module === 'object' && module.exports;
  const browserRoot = typeof window === 'object' ? window : root;
  const codec = isCommonJs
    ? require('./vendor/fflate-0.8.3.js')
    : browserRoot.fflate || root.fflate;
  const api = factory(codec);
  if (isCommonJs) module.exports = api;
  else {
    browserRoot.GugaScpParser = api;
    if (root !== browserRoot) root.GugaScpParser = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, (fflate) => {
  'use strict';

  const DEFAULT_LIMITS = Object.freeze({
    maxArchiveBytes: 128 * 1024 * 1024,
    maxEntryBytes: 64 * 1024 * 1024,
    maxInflatedBytes: 256 * 1024 * 1024,
  });
  const LEVEL_DETAIL_PATH = /^sonolus\/levels\/([^/]+)$/;
  const HASH_PATTERN = /^[0-9a-f]{40}$/i;
  const textDecoder = new TextDecoder('utf-8', { fatal: true });

  class ScpParseError extends Error {
    constructor(code, message, details = undefined) {
      super(message);
      this.name = 'ScpParseError';
      this.code = code;
      this.details = details;
    }
  }

  function assertCodec() {
    if (!fflate?.unzipSync || !fflate?.gunzipSync) {
      throw new ScpParseError('CODEC_MISSING', '找不到 fflate，無法解開 SCP/ZIP 與 GZip 資料。');
    }
  }

  async function toUint8Array(source) {
    if (source instanceof Uint8Array) return source;
    if (source instanceof ArrayBuffer) return new Uint8Array(source);
    if (ArrayBuffer.isView(source)) {
      return new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
    }
    if (source && typeof source.arrayBuffer === 'function') {
      return new Uint8Array(await source.arrayBuffer());
    }
    throw new ScpParseError('INVALID_INPUT', 'SCP 輸入必須是 File、Blob、ArrayBuffer 或 Uint8Array。');
  }

  function safeEntryName(name) {
    return typeof name === 'string'
      && !name.startsWith('/')
      && !name.startsWith('\\')
      && !name.includes('\0')
      && !name.split(/[\\/]/).includes('..');
  }

  function decodeText(bytes, path) {
    try {
      const text = textDecoder.decode(bytes);
      return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
    } catch (error) {
      throw new ScpParseError('INVALID_UTF8', `${path} 不是有效的 UTF-8 文字。`, { cause: error });
    }
  }

  function parseJsonBytes(bytes, path) {
    try {
      return JSON.parse(decodeText(bytes, path));
    } catch (error) {
      if (error instanceof ScpParseError) throw error;
      throw new ScpParseError('INVALID_JSON', `${path} 不是有效的 JSON。`, { cause: error });
    }
  }

  function requireEntry(files, path) {
    const bytes = files[path];
    if (!bytes) throw new ScpParseError('MISSING_ENTRY', `SCP 缺少必要項目：${path}`, { path });
    return bytes;
  }

  function repositoryPath(hash) {
    if (!HASH_PATTERN.test(hash || '')) {
      throw new ScpParseError('INVALID_HASH', `無效的 Sonolus repository hash：${String(hash)}`);
    }
    return `sonolus/repository/${hash.toLowerCase()}`;
  }

  function readRepositoryResource(files, resource, label) {
    const hash = resource?.hash;
    if (!hash) throw new ScpParseError('MISSING_RESOURCE_HASH', `${label} 沒有 repository hash。`);
    const path = repositoryPath(hash);
    return { hash: hash.toLowerCase(), path, bytes: requireEntry(files, path) };
  }

  function parseGzipJson(resource, label) {
    let inflated;
    try {
      inflated = fflate.gunzipSync(resource.bytes);
    } catch (error) {
      throw new ScpParseError('INVALID_GZIP', `${label} 不是有效的 GZip 資料。`, { cause: error });
    }
    return parseJsonBytes(inflated, resource.path);
  }

  function addField(target, name, value) {
    if (!Object.prototype.hasOwnProperty.call(target, name)) {
      target[name] = value;
      return;
    }
    if (Array.isArray(target[name])) target[name].push(value);
    else target[name] = [target[name], value];
  }

  function firstNumber(value) {
    const candidate = Array.isArray(value) ? value[0] : value;
    return Number.isFinite(candidate) ? candidate : null;
  }

  function normalizeEntity(entity, index, archetypeSchema) {
    if (!entity || typeof entity !== 'object' || typeof entity.archetype !== 'string') {
      throw new ScpParseError('INVALID_ENTITY', `entity[${index}] 缺少有效的 archetype。`, { index });
    }
    if (!Array.isArray(entity.data)) {
      throw new ScpParseError('INVALID_ENTITY_DATA', `entity[${index}] 的 data 不是陣列。`, { index });
    }

    const values = Object.create(null);
    const refs = Object.create(null);
    entity.data.forEach((entry, dataIndex) => {
      if (!entry || typeof entry.name !== 'string') {
        throw new ScpParseError(
          'INVALID_ENTITY_DATA_ENTRY',
          `entity[${index}].data[${dataIndex}] 缺少有效的 name。`,
          { index, dataIndex },
        );
      }
      if (Object.prototype.hasOwnProperty.call(entry, 'value')) addField(values, entry.name, entry.value);
      if (Object.prototype.hasOwnProperty.call(entry, 'ref')) addField(refs, entry.name, entry.ref);
    });

    const schema = archetypeSchema.get(entity.archetype);
    return {
      index,
      id: entity.name ?? `@${index}`,
      name: entity.name ?? null,
      archetype: entity.archetype,
      isNote: entity.archetype.endsWith('Note') || schema?.hasInput === true,
      isPlayable: schema ? schema.hasInput === true : null,
      beat: firstNumber(values['#BEAT']),
      lane: firstNumber(values.lane),
      size: firstNumber(values.size),
      direction: firstNumber(values.direction),
      values,
      refs,
      data: entity.data,
    };
  }

  function buildArchetypeSchema(enginePlayData) {
    const schema = new Map();
    if (!Array.isArray(enginePlayData?.archetypes)) return schema;
    enginePlayData.archetypes.forEach((archetype) => {
      if (!archetype || typeof archetype.name !== 'string') return;
      schema.set(archetype.name, {
        name: archetype.name,
        hasInput: archetype.hasInput === true,
        imports: Array.isArray(archetype.imports) ? archetype.imports : [],
        exports: Array.isArray(archetype.exports) ? archetype.exports : [],
      });
    });
    return schema;
  }

  function collapseTempoChanges(changes) {
    const collapsed = [];
    changes
      .filter(({ beat, bpm }) => Number.isFinite(beat) && Number.isFinite(bpm) && bpm > 0)
      .sort((a, b) => a.beat - b.beat || a.index - b.index)
      .forEach((change) => {
        if (collapsed.at(-1)?.beat === change.beat) collapsed[collapsed.length - 1] = change;
        else collapsed.push(change);
      });
    return collapsed;
  }

  function buildTempoMap(entities, warnings) {
    const changes = collapseTempoChanges(entities
      .filter((entity) => entity.archetype === '#BPM_CHANGE')
      .map((entity) => ({
        index: entity.index,
        beat: entity.beat,
        bpm: firstNumber(entity.values['#BPM']),
      })));

    if (!changes.length) {
      warnings.push({ code: 'NO_BPM', message: '譜面沒有有效的 #BPM_CHANGE，無法換算秒數。' });
      return { changes: [], beatToSeconds: () => null };
    }

    if (!changes.some((change) => change.beat === 0)) {
      const nearest = [...changes].reverse().find((change) => change.beat < 0) || changes[0];
      changes.push({ ...nearest, beat: 0, synthetic: true });
      changes.sort((a, b) => a.beat - b.beat || a.index - b.index);
      warnings.push({ code: 'SYNTHETIC_BEAT_ZERO_BPM', message: '譜面在 beat 0 沒有 BPM，解析器已用最近的 BPM 補上。' });
    }

    const zeroIndex = changes.findIndex((change) => change.beat === 0);
    changes[zeroIndex].seconds = 0;
    for (let index = zeroIndex + 1; index < changes.length; index += 1) {
      const previous = changes[index - 1];
      const current = changes[index];
      current.seconds = previous.seconds + (current.beat - previous.beat) * 60 / previous.bpm;
    }
    for (let index = zeroIndex - 1; index >= 0; index -= 1) {
      const current = changes[index];
      const next = changes[index + 1];
      current.seconds = next.seconds - (next.beat - current.beat) * 60 / current.bpm;
    }

    function beatToSeconds(beat) {
      if (!Number.isFinite(beat)) return null;
      let low = 0;
      let high = changes.length - 1;
      while (low <= high) {
        const middle = (low + high) >> 1;
        if (changes[middle].beat <= beat) low = middle + 1;
        else high = middle - 1;
      }
      const change = changes[Math.max(0, high)];
      return change.seconds + (beat - change.beat) * 60 / change.bpm;
    }

    return { changes, beatToSeconds };
  }

  function findReferenceIssues(entities) {
    const names = new Map();
    const duplicateNames = [];
    entities.forEach((entity) => {
      if (!entity.name) return;
      if (names.has(entity.name)) duplicateNames.push({ name: entity.name, first: names.get(entity.name), duplicate: entity.index });
      else names.set(entity.name, entity.index);
    });

    const unresolved = [];
    entities.forEach((entity) => {
      Object.entries(entity.refs).forEach(([field, refs]) => {
        const values = Array.isArray(refs) ? refs : [refs];
        values.forEach((ref) => {
          if (typeof ref !== 'string' || !names.has(ref)) unresolved.push({ entity: entity.index, field, ref });
        });
      });
    });
    return { duplicateNames, unresolved };
  }

  function collectResources(value, output = new Map()) {
    if (!value || typeof value !== 'object') return output;
    if (typeof value.hash === 'string' && HASH_PATTERN.test(value.hash)) {
      output.set(value.hash.toLowerCase(), {
        hash: value.hash.toLowerCase(),
        url: typeof value.url === 'string' ? value.url : null,
      });
    }
    Object.values(value).forEach((child) => collectResources(child, output));
    return output;
  }

  function assetReference(resource) {
    if (!resource?.hash || !HASH_PATTERN.test(resource.hash)) return null;
    const hash = resource.hash.toLowerCase();
    return { hash, path: repositoryPath(hash), url: typeof resource.url === 'string' ? resource.url : null };
  }

  function parseLevel(files, detailPath, detailPayload, sharedWarnings) {
    const item = detailPayload?.item ?? detailPayload;
    if (!item || typeof item !== 'object') {
      throw new ScpParseError('INVALID_LEVEL_DETAIL', `${detailPath} 沒有有效的 level item。`);
    }

    const levelWarnings = [];
    const levelResource = readRepositoryResource(files, item.data, `${item.name || detailPath} level data`);
    const levelData = parseGzipJson(levelResource, `${item.name || detailPath} level data`);
    if (!Array.isArray(levelData?.entities)) {
      throw new ScpParseError('INVALID_LEVEL_DATA', `${levelResource.path} 缺少 entities 陣列。`);
    }

    let enginePlayData = null;
    let enginePlayResource = null;
    if (item.engine?.playData?.hash) {
      enginePlayResource = readRepositoryResource(files, item.engine.playData, `${item.engine.name || 'engine'} play data`);
      enginePlayData = parseGzipJson(enginePlayResource, `${item.engine.name || 'engine'} play data`);
    } else {
      levelWarnings.push({ code: 'NO_ENGINE_PLAY_DATA', message: '關卡沒有 engine playData，無法精確辨識可判定 note。' });
    }

    const archetypeSchema = buildArchetypeSchema(enginePlayData);
    const entities = levelData.entities.map((entity, index) => normalizeEntity(entity, index, archetypeSchema));
    const tempoMap = buildTempoMap(entities, levelWarnings);
    entities.forEach((entity) => {
      entity.time = tempoMap.beatToSeconds(entity.beat);
    });

    const references = findReferenceIssues(entities);
    if (references.duplicateNames.length) {
      levelWarnings.push({ code: 'DUPLICATE_ENTITY_NAMES', count: references.duplicateNames.length, message: '譜面含重複 entity name。' });
    }
    if (references.unresolved.length) {
      levelWarnings.push({ code: 'UNRESOLVED_REFERENCES', count: references.unresolved.length, message: '譜面含無法解析的 entity ref。' });
    }

    const notes = entities.filter((entity) => entity.isNote);
    const inputEntities = entities.filter((entity) => entity.isPlayable === true);
    const playableNotes = notes.filter((entity) => entity.isPlayable === true);
    const archetypeCounts = Object.create(null);
    const noteArchetypeCounts = Object.create(null);
    entities.forEach((entity) => {
      archetypeCounts[entity.archetype] = (archetypeCounts[entity.archetype] || 0) + 1;
      if (entity.isNote) noteArchetypeCounts[entity.archetype] = (noteArchetypeCounts[entity.archetype] || 0) + 1;
    });

    const resourceManifest = [...collectResources(item).values()].map((resource) => ({
      ...resource,
      path: repositoryPath(resource.hash),
      present: Boolean(files[repositoryPath(resource.hash)]),
    }));
    const missingResources = resourceManifest.filter((resource) => !resource.present);
    if (missingResources.length) {
      levelWarnings.push({ code: 'MISSING_RESOURCES', count: missingResources.length, message: '關卡引用了 SCP 中不存在的 repository resource。' });
    }
    sharedWarnings.push(...levelWarnings.map((warning) => ({ ...warning, level: item.name ?? detailPath })));

    return {
      sourcePath: detailPath,
      metadata: {
        name: item.name ?? null,
        version: item.version ?? null,
        rating: item.rating ?? null,
        title: item.title ?? '',
        artists: item.artists ?? '',
        author: item.author ?? '',
        description: detailPayload?.description ?? '',
        engine: item.engine ? {
          name: item.engine.name ?? null,
          version: item.engine.version ?? null,
          title: item.engine.title ?? '',
        } : null,
      },
      bgmOffset: Number.isFinite(levelData.bgmOffset) ? levelData.bgmOffset : 0,
      assets: {
        bgm: assetReference(item.bgm),
        cover: assetReference(item.cover),
        preview: assetReference(item.preview),
      },
      entities,
      notes,
      inputEntities,
      playableNotes,
      connectors: entities.filter((entity) => entity.archetype.endsWith('Connector')),
      simLines: entities.filter((entity) => entity.archetype === 'SimLine'),
      guides: entities.filter((entity) => entity.archetype === 'Guide'),
      timeScaleGroups: entities.filter((entity) => entity.archetype === 'TimeScaleGroup'),
      timeScaleChanges: entities.filter((entity) => entity.archetype === 'TimeScaleChange' || entity.archetype === '#TIMESCALE_CHANGE'),
      bpmChanges: tempoMap.changes,
      archetypeCounts,
      noteArchetypeCounts,
      archetypeSchema: Object.fromEntries(archetypeSchema),
      references,
      resources: resourceManifest,
      warnings: levelWarnings,
      sourceResources: {
        levelData: { hash: levelResource.hash, path: levelResource.path },
        enginePlayData: enginePlayResource ? { hash: enginePlayResource.hash, path: enginePlayResource.path } : null,
      },
    };
  }

  function serializableLevel(level) {
    return {
      sourcePath: level.sourcePath,
      metadata: level.metadata,
      bgmOffset: level.bgmOffset,
      assets: level.assets,
      entities: level.entities,
      notes: level.notes,
      inputEntities: level.inputEntities,
      playableNotes: level.playableNotes,
      connectors: level.connectors,
      simLines: level.simLines,
      guides: level.guides,
      timeScaleGroups: level.timeScaleGroups,
      timeScaleChanges: level.timeScaleChanges,
      bpmChanges: level.bpmChanges,
      archetypeCounts: level.archetypeCounts,
      noteArchetypeCounts: level.noteArchetypeCounts,
      archetypeSchema: level.archetypeSchema,
      references: level.references,
      resources: level.resources,
      warnings: level.warnings,
      sourceResources: level.sourceResources,
    };
  }

  async function parseScp(source, options = {}) {
    assertCodec();
    const limits = { ...DEFAULT_LIMITS, ...(options.limits || {}) };
    const bytes = await toUint8Array(source);
    if (bytes.byteLength > limits.maxArchiveBytes) {
      throw new ScpParseError('ARCHIVE_TOO_LARGE', `SCP 超過大小上限 ${limits.maxArchiveBytes} bytes。`);
    }

    let files;
    try {
      files = fflate.unzipSync(bytes, {
        filter(entry) {
          if (!safeEntryName(entry.name)) {
            throw new ScpParseError('UNSAFE_ENTRY_PATH', `SCP 含不安全的項目路徑：${entry.name}`);
          }
          if (entry.originalSize > limits.maxEntryBytes) {
            throw new ScpParseError('ENTRY_TOO_LARGE', `${entry.name} 超過單一項目大小上限。`);
          }
          return true;
        },
      });
    } catch (error) {
      if (error instanceof ScpParseError) throw error;
      throw new ScpParseError('INVALID_ZIP', '檔案不是有效或受支援的 SCP/ZIP。', { cause: error });
    }

    const entryNames = Object.keys(files);
    const inflatedBytes = entryNames.reduce((total, name) => total + files[name].byteLength, 0);
    if (inflatedBytes > limits.maxInflatedBytes) {
      throw new ScpParseError('INFLATED_ARCHIVE_TOO_LARGE', `SCP 解壓後超過大小上限 ${limits.maxInflatedBytes} bytes。`);
    }

    const packageInfo = parseJsonBytes(requireEntry(files, 'sonolus/package'), 'sonolus/package');
    const serverInfo = files['sonolus/info'] ? parseJsonBytes(files['sonolus/info'], 'sonolus/info') : null;
    const detailPaths = entryNames.filter((path) => {
      const match = path.match(LEVEL_DETAIL_PATH);
      return match && match[1] !== 'info' && match[1] !== 'list';
    });
    if (!detailPaths.length) throw new ScpParseError('NO_LEVELS', 'SCP 中找不到任何 Sonolus level detail。');

    const warnings = [];
    const levels = detailPaths.map((path) => parseLevel(files, path, parseJsonBytes(files[path], path), warnings));
    return {
      format: 'sonolus-collection-package',
      package: packageInfo,
      serverInfo,
      archive: {
        compressedBytes: bytes.byteLength,
        inflatedBytes,
        entryCount: entryNames.length,
        entries: entryNames,
      },
      levels,
      warnings,
      getEntry(path) {
        return files[path] || null;
      },
      getRepositoryResource(hash) {
        return files[repositoryPath(hash)] || null;
      },
    };
  }

  function serializeScp(parsed, spacing = 2) {
    return JSON.stringify({
      format: parsed.format,
      package: parsed.package,
      serverInfo: parsed.serverInfo,
      archive: parsed.archive,
      levels: parsed.levels.map(serializableLevel),
      warnings: parsed.warnings,
    }, null, spacing);
  }

  return Object.freeze({
    parseScp,
    serializeScp,
    serializableLevel,
    ScpParseError,
    DEFAULT_LIMITS,
  });
});
