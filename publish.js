#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BASE_DIR = path.resolve(__dirname);
const PRESETS_DIR = path.join(BASE_DIR, 'presets', 'mkp');
const HISTORY_DIR = path.join(BASE_DIR, 'history');
const MODELS_DIR = path.join(BASE_DIR, 'models');
const CONTENT_DIR = path.join(BASE_DIR, 'content');
const ASSETS_DIR = path.join(BASE_DIR, 'assets');
const INDEX_FILE = path.join(BASE_DIR, 'manifests', 'index.json');

function computeSha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function parseTomlMeta(content) {
  const meta = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# release_time:')) meta.releaseTime = trimmed.replace('# release_time:', '').trim();
    if (trimmed.startsWith('# version:')) meta.version = trimmed.replace('# version:', '').trim();
    if (trimmed.startsWith('# author:')) meta.author = trimmed.replace('# author:', '').trim();
    if (trimmed.startsWith('# changelog:')) meta.changelog = (meta.changelog || '') + trimmed.replace('# changelog:', '').trim() + '\n';
  }
  return meta;
}

function scanDir(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dirPath)) {
    if (!entry.toLowerCase().endsWith('.toml')) continue;
    const filePath = path.join(dirPath, entry);
    const stat = fs.statSync(filePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    const meta = parseTomlMeta(content);
    const modelName = path.basename(entry, path.extname(entry));
    results.push({
      id: modelName.toLowerCase().replace(/\s+/g, ''),
      name: modelName,
      fileName: entry,
      version: meta.version || "1.0.0",
      size: stat.size,
      releaseTime: meta.releaseTime || stat.mtime.toISOString().split('T')[0],
      author: meta.author || "MKP Studio",
      downloads: 0,
      compatible: [modelName],
      changelog: (meta.changelog || "").trim(),
      sha256: computeSha256(filePath),
      history: []
    });
  }
  return results;
}

function scanHistory() {
  if (!fs.existsSync(HISTORY_DIR)) return {};
  const historyMap = {};
  for (const modelDir of fs.readdirSync(HISTORY_DIR)) {
    const modelPath = path.join(HISTORY_DIR, modelDir);
    if (!fs.statSync(modelPath).isDirectory()) continue;
    const versions = [];
    for (const file of fs.readdirSync(modelPath).filter(f => f.endsWith('.toml'))) {
      const filePath = path.join(modelPath, file);
      const stat = fs.statSync(filePath);
      const content = fs.readFileSync(filePath, 'utf-8');
      const meta = parseTomlMeta(content);
      versions.push({
        version: meta.version || "unknown",
        fileName: `history/${modelDir}/${file}`,
        date: meta.releaseTime || stat.mtime.toISOString().split('T')[0],
        changelog: (meta.changelog || "").trim()
      });
    }
    versions.sort((a, b) => b.date.localeCompare(a.date));
    historyMap[modelDir] = versions;
  }
  return historyMap;
}

function scanModels() {
  if (!fs.existsSync(MODELS_DIR)) return [];
  const results = [];
  for (const entry of fs.readdirSync(MODELS_DIR)) {
    if (!entry.toLowerCase().endsWith('.3mf')) continue;
    const filePath = path.join(MODELS_DIR, entry);
    const stat = fs.statSync(filePath);
    results.push({
      fileName: entry,
      relativePath: 'models/' + entry,
      version: '1.0.0',
      sha256: computeSha256(filePath),
      size: stat.size,
      releaseTime: stat.mtime.toISOString(),
    });
  }
  return results;
}

function scanContent(contentVersion) {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const results = [];
  for (const entry of fs.readdirSync(CONTENT_DIR)) {
    if (!entry.toLowerCase().endsWith('.json')) continue;
    const filePath = path.join(CONTENT_DIR, entry);
    const stat = fs.statSync(filePath);
    results.push({
      fileName: entry,
      relativePath: 'content/' + entry,
      version: contentVersion || "0.0.6.0",
      sha256: computeSha256(filePath),
      size: stat.size,
    });
  }
  return results;
}

function scanAssets() {
  if (!fs.existsSync(ASSETS_DIR)) return [];
  const results = [];
  for (const subDir of fs.readdirSync(ASSETS_DIR)) {
    const subDirPath = path.join(ASSETS_DIR, subDir);
    if (!fs.statSync(subDirPath).isDirectory()) continue;
    const category = subDir.toLowerCase();
    for (const file of fs.readdirSync(subDirPath)) {
      if (file.endsWith('.gitkeep')) continue;
      const filePath = path.join(subDirPath, file);
      const stat = fs.statSync(filePath);
      if (!stat.isFile()) continue;
      results.push({
        fileName: file,
        category: category,
        relativePath: `assets/${category}/${file}`,
        size: stat.size,
        releaseTime: stat.mtime.toISOString(),
        sha256: computeSha256(filePath),
        isRegistered: true,
        isModified: false
      });
    }
  }
  return results;
}

function main() {
  console.log("=== MKP Preset Publisher ===\n");

  console.log(`扫描预设目录: ${PRESETS_DIR}`);
  const presets = scanDir(PRESETS_DIR);
  console.log(`发现 ${presets.length} 个预设文件`);

  console.log(`扫描历史目录: ${HISTORY_DIR}`);
  const historyMap = scanHistory();

  for (const preset of presets) {
    preset.history = historyMap[preset.name] || [];
  }

  console.log(`扫描模型目录: ${MODELS_DIR}`);
  const models = scanModels();
  console.log(`发现 ${models.length} 个模型文件`);

  let existingIndex = {
    contentVersion: "0.0.6.0",
    schemaVersion: "2.0.0",
    channel: "stable",
    updated: new Date().toISOString(),
    contentFiles: [],
    presets: [],
    models: [],
    assets: []
  };
  if (fs.existsSync(INDEX_FILE)) {
    try {
      const raw = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
      if (Array.isArray(raw)) {
        existingIndex = { ...existingIndex, updated: new Date().toISOString(), presets: raw, models: [] };
      } else if (raw && Array.isArray(raw.presets)) {
        existingIndex = { ...existingIndex, ...raw };
      }
    } catch {}
  }

  console.log(`扫描内容目录: ${CONTENT_DIR}`);
  const contentFiles = scanContent(existingIndex.contentVersion);
  console.log(`发现 ${contentFiles.length} 个内容文件`);

  console.log(`扫描资源目录: ${ASSETS_DIR}`);
  const assets = scanAssets();
  console.log(`发现 ${assets.length} 个资源文件`);

  const mergedPresets = new Map();
  for (const p of existingIndex.presets) mergedPresets.set(p.fileName, p);
  for (const p of presets) mergedPresets.set(p.fileName, { ...mergedPresets.get(p.fileName), ...p });

  const mergedModels = new Map();
  for (const m of existingIndex.models || []) mergedModels.set(m.fileName, m);
  for (const m of models) mergedModels.set(m.fileName, { ...mergedModels.get(m.fileName), ...m });

  const mergedAssets = new Map();
  for (const a of existingIndex.assets || []) mergedAssets.set(a.relativePath, a);
  for (const a of assets) mergedAssets.set(a.relativePath, { ...mergedAssets.get(a.relativePath), ...a });

  const output = {
    contentVersion: existingIndex.contentVersion || "0.0.6.0",
    schemaVersion: existingIndex.schemaVersion || "2.0.0",
    channel: existingIndex.channel || "stable",
    updated: new Date().toISOString(),
    contentFiles: contentFiles,
    models: Array.from(mergedModels.values()),
    presets: Array.from(mergedPresets.values()),
    assets: Array.from(mergedAssets.values())
  };

  if (existingIndex.modelCopy !== undefined) {
    output.modelCopy = existingIndex.modelCopy;
  }

  fs.writeFileSync(INDEX_FILE, JSON.stringify(output, null, 2));
  console.log(`\n索引已写入: ${INDEX_FILE}`);
  console.log(`共 ${output.presets.length} 个预设, ${output.models.length} 个模型, ${output.contentFiles.length} 个内容文件, ${output.assets.length} 个资源文件`);

  for (const p of output.presets) {
    console.log(`  - ${p.name} v${p.version} (${p.size} bytes)`);
  }
  for (const m of output.models) {
    console.log(`  - [模型] ${m.fileName} (${m.size} bytes)`);
  }
  for (const c of output.contentFiles) {
    console.log(`  - [内容] ${c.fileName} (${c.size} bytes)`);
  }
  for (const a of output.assets) {
    console.log(`  - [资源] ${a.category}/${a.fileName} (${a.size} bytes)`);
  }
}

main();
