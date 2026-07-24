const APP_URL = 'https://ming3733.github.io/prompt-workbench/';
const PENDING_CAPTURE_KEY = 'promptly-pending-capture-v1';
const COVER_INPUT_MAX_BYTES = 12 * 1024 * 1024;
const COVER_MAX_DATA_URL_LENGTH = 520000;

const pageTitle = document.querySelector('#page-title');
const pageUrl = document.querySelector('#page-url');
const title = document.querySelector('#title');
const type = document.querySelector('#type');
const typeSelect = document.querySelector('#type-select');
const typeTrigger = document.querySelector('.custom-select-trigger');
const typeLabel = document.querySelector('#type-label');
const tags = document.querySelector('#tags');
const content = document.querySelector('#content');
const imageBox = document.querySelector('#image-box');
const imageEmpty = document.querySelector('.image-empty');
const imagePreview = document.querySelector('#image-preview');
const removeImage = document.querySelector('#remove-image');
const selectionHint = document.querySelector('#selection-hint');
const message = document.querySelector('#message');
const collectButton = document.querySelector('#collect');
const syncButton = document.querySelector('#sync');
const backupButton = document.querySelector('#backup');
const queuedCount = document.querySelector('#queued-count');
const historyCount = document.querySelector('#history-count');
let imageData = '';
let imageProcessing = false;
let currentSource = { title: '', url: '' };

function setPromptType(value) {
  const normalized = normalizePromptType(value, imageData ? 'image' : 'text');
  type.value = normalized;
  typeLabel.textContent = normalized;
  document.querySelectorAll('.custom-select-option').forEach((option) => {
    const selected = option.dataset.value === normalized;
    option.classList.toggle('is-selected', selected);
    option.setAttribute('aria-selected', selected ? 'true' : 'false');
  });
}

function closeTypeMenu() {
  typeSelect.classList.remove('is-open');
  typeTrigger.setAttribute('aria-expanded', 'false');
}

function setMessage(text, isError = false) {
  message.textContent = text;
  message.style.color = isError ? '#c54c4c' : '#1bb86e';
}

function sendRuntimeMessage(payload) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(payload, (result) => {
      if (chrome.runtime.lastError) return resolve({ ok: false, message: chrome.runtime.lastError.message });
      resolve(result || { ok: false });
    });
  });
}

function readImageFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('read-image-failed'));
    reader.readAsDataURL(file);
  });
}

function loadImageFromDataUrl(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('load-image-failed'));
    image.src = dataUrl;
  });
}

function renderCompressedImageDataUrl(image, width, height, quality) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('canvas-unavailable');
  context.fillStyle = '#fff';
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', quality);
}

async function compressImageDataUrl(dataUrl) {
  const image = await loadImageFromDataUrl(dataUrl);
  const sourceWidth = image.naturalWidth || image.width || 1;
  const sourceHeight = image.naturalHeight || image.height || 1;
  const scale = Math.min(1, 1280 / sourceWidth, 720 / sourceHeight);
  let width = Math.max(1, Math.round(sourceWidth * scale));
  let height = Math.max(1, Math.round(sourceHeight * scale));
  let quality = 0.84;
  let compressed = renderCompressedImageDataUrl(image, width, height, quality);

  while (compressed.length > COVER_MAX_DATA_URL_LENGTH && (quality > 0.52 || width > 640 || height > 360)) {
    if (quality > 0.52) {
      quality = Math.max(0.52, quality - 0.08);
    } else {
      width = Math.max(320, Math.round(width * 0.82));
      height = Math.max(180, Math.round(height * 0.82));
      quality = 0.76;
    }
    compressed = renderCompressedImageDataUrl(image, width, height, quality);
  }
  return compressed;
}

async function prepareCoverImageFile(file) {
  if (!file?.type?.startsWith('image/') && !/\.(png|jpe?g|webp|gif|bmp|tiff?)$/i.test(file?.name || '')) throw new Error('cover-not-image');
  if (file.size > COVER_INPUT_MAX_BYTES) throw new Error('cover-too-large');
  const dataUrl = await readImageFileAsDataUrl(file);
  if (dataUrl.length <= COVER_MAX_DATA_URL_LENGTH) return dataUrl;
  return compressImageDataUrl(dataUrl);
}

function coverErrorMessage(error) {
  return error?.message === 'cover-too-large'
    ? '图片过大，请粘贴 12MB 内图片'
    : '图片读取失败，请换一张图片';
}

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    textarea.remove();
    return ok;
  }
}

async function refreshSyncStatus() {
  const stats = await sendRuntimeMessage({ type: 'capture-stats' });
  if (!stats.ok) return;
  queuedCount.textContent = `待同步 ${stats.queuedCount || 0} 条`;
  historyCount.textContent = `本机已保存 ${stats.historyCount || 0} 条`;
}

function compactTitle(value, fallback = '网页提示词收录') {
  const firstLine = String(value || '')
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/\s+/g, ' '))
    .find(Boolean);
  const text = firstLine || fallback;
  return text.length > 24 ? `${text.slice(0, 24)}…` : text;
}

function tagIdentity(tag) {
  return String(tag || '').replace(/^#+/, '').replace(/\s+/g, '').trim().toLowerCase();
}

function normalizeTag(tag) {
  const clean = String(tag || '').replace(/^#+/, '').replace(/\s+/g, ' ').trim();
  return clean ? `#${clean}` : '';
}

function normalizeTags(value, fallback = ['#浏览器收录']) {
  const source = Array.isArray(value) ? value : String(value || '').split(/[,，、;；|]+/);
  const seen = new Set();
  const normalized = [];
  source.forEach((tag) => {
    const clean = normalizeTag(tag);
    const key = tagIdentity(clean);
    if (!clean || seen.has(key)) return;
    seen.add(key);
    normalized.push(clean);
  });
  return normalized.length ? normalized : fallback;
}

function tagsToInputValue(value) {
  return normalizeTags(value, []).map((tag) => tag.replace(/^#/, '')).join('，');
}

function normalizePromptType(value, kind = 'text') {
  const raw = String(value || '').replace(/\s+/g, '').toLowerCase();
  if (raw.includes('图片') || raw.includes('image')) return '图片提示词';
  if (raw.includes('icon') || raw.includes('图标')) return 'icon提示词';
  if (raw.includes('视频') || raw.includes('video')) return '视频提示词';
  if (raw.includes('ui') || raw.includes('界面') || raw.includes('设计') || raw.includes('提示词') || raw.includes('描述词')) return 'UI提示词';
  return kind === 'image' ? '图片提示词' : 'UI提示词';
}

function setSource(source = {}) {
  currentSource = {
    title: source.title || '浏览器收录',
    url: source.url || '',
  };
  pageTitle.textContent = currentSource.title || '未命名网页';
  pageUrl.textContent = currentSource.url || '';
}

function setImage(dataUrl = '') {
  imageData = dataUrl;
  if (dataUrl) imagePreview.src = dataUrl;
  else imagePreview.removeAttribute('src');
  imagePreview.hidden = !dataUrl;
  removeImage.hidden = !dataUrl;
  imageEmpty.hidden = Boolean(dataUrl);
  imageBox.classList.toggle('has-image', Boolean(dataUrl));
  if (dataUrl) selectionHint.textContent = '已带入图片，可删除或直接粘贴新图片替换。';
}

function suggestedTitle(value) {
  if (imageData && !String(value || '').trim()) return '图片灵感收录';
  return compactTitle(value, imageData ? '图片灵感收录' : '网页提示词收录');
}

function applyCaptureDraft(capture) {
  setSource({ title: capture.sourceTitle || '浏览器收录', url: capture.sourceUrl || '' });
  content.value = capture.content || capture.text || '';
  title.value = compactTitle(capture.title || content.value, capture.kind === 'image' ? '网页参考图片' : '网页提示词收录');
  setPromptType(normalizePromptType(capture.type, capture.kind));
  tags.value = tagsToInputValue(capture.tags || []);
  setImage(capture.preview || capture.image || '');
  selectionHint.textContent = capture.kind === 'image'
    ? '已带入右键图片，可修改标题、提示词，或粘贴新图片替换。'
    : '已带入右键收录内容，可先编辑再加入提示词库。';
  setMessage('已带入右键收录内容');
}

function requestActiveContext() {
  chrome.runtime.sendMessage({ type: 'active-context' }, (context) => {
    if (chrome.runtime.lastError || !context?.ok) {
      setSource();
      setMessage('当前网页无法读取，请使用右键菜单。', true);
      return;
    }
    setSource({ title: context.title || '未命名网页', url: context.url || '' });
    content.value = context.selection || '';
    if (context.selection) title.value = suggestedTitle(context.selection);
    selectionHint.textContent = context.selection ? '已带入网页选中文字，可继续编辑。' : '未选中文字，可直接粘贴内容或图片。';
  });
}

function initializePopup() {
  chrome.storage.local.get(PENDING_CAPTURE_KEY, (result) => {
    const pendingCapture = result?.[PENDING_CAPTURE_KEY];
    if (pendingCapture) {
      chrome.storage.local.remove(PENDING_CAPTURE_KEY);
      applyCaptureDraft(pendingCapture);
      return;
    }
    requestActiveContext();
  });
  refreshSyncStatus();
}

document.addEventListener('paste', async (event) => {
  const item = [...(event.clipboardData?.items || [])].find((entry) => entry.type.startsWith('image/'));
  if (!item) return;
  const file = item.getAsFile();
  if (!file) return;
  event.preventDefault();
  imageProcessing = true;
  setMessage('正在处理图片...');
  try {
    setImage(await prepareCoverImageFile(file));
    setMessage('图片已粘贴并压缩');
  } catch (error) {
    setMessage(coverErrorMessage(error), true);
  } finally {
    imageProcessing = false;
  }
});

typeTrigger.addEventListener('click', (event) => {
  event.stopPropagation();
  const open = !typeSelect.classList.contains('is-open');
  typeSelect.classList.toggle('is-open', open);
  typeTrigger.setAttribute('aria-expanded', open ? 'true' : 'false');
});

document.querySelectorAll('.custom-select-option').forEach((option) => {
  option.addEventListener('click', (event) => {
    event.stopPropagation();
    setPromptType(option.dataset.value);
    closeTypeMenu();
  });
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.custom-select')) closeTypeMenu();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeTypeMenu();
});

removeImage.addEventListener('click', () => {
  setImage();
  setMessage('图片已删除');
  selectionHint.textContent = '图片已删除，可继续粘贴文字或新图片。';
});

document.querySelector('#ai-title').addEventListener('click', () => {
  title.value = suggestedTitle(content.value);
  setMessage('已生成标题');
});

collectButton.addEventListener('click', () => {
  if (imageProcessing) {
    setMessage('图片还在处理中，请稍等', true);
    return;
  }
  const text = content.value.trim();
  if (!text && !imageData) {
    setMessage('请先输入文字或粘贴图片', true);
    return;
  }
  collectButton.disabled = true;
  collectButton.textContent = '正在保存...';
  chrome.runtime.sendMessage({
    type: 'collect-current',
    capture: {
      id: `popup-${Date.now()}`,
      kind: imageData ? 'image' : 'text',
      type: normalizePromptType(type.value, imageData ? 'image' : 'text'),
      title: title.value.trim() || suggestedTitle(text),
      content: text || '已粘贴参考图片',
      preview: imageData,
      tags: normalizeTags(tags.value),
      sourceTitle: currentSource.title,
      sourceUrl: currentSource.url,
    },
  }, (result) => {
    if (chrome.runtime.lastError || !result?.ok) {
      setMessage(result?.message || chrome.runtime.lastError?.message || '收录失败，请重试。', true);
      collectButton.disabled = false;
      collectButton.textContent = '加入提示词库';
      return;
    }
    setMessage(result.queued ? '已保存在插件本机，正在同步线上库' : '已保存');
    collectButton.disabled = false;
    collectButton.textContent = '已保存，可继续收录';
    refreshSyncStatus();
  });
});

document.querySelector('#open').addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'open-workbench' }, (result) => {
    if (chrome.runtime.lastError || !result?.ok) chrome.tabs.create({ url: APP_URL });
  });
});

syncButton.addEventListener('click', async () => {
  syncButton.disabled = true;
  syncButton.textContent = '同步中...';
  const result = await sendRuntimeMessage({ type: 'flush-captures' });
  if (!result.ok) setMessage('同步失败，请先打开线上提示词库。', true);
  else setMessage((result.queuedCount || 0) ? `已打开线上库，待网页确认 ${result.queuedCount} 条` : '已同步完成');
  syncButton.disabled = false;
  syncButton.textContent = '同步到线上库';
  refreshSyncStatus();
});

backupButton.addEventListener('click', async () => {
  const result = await sendRuntimeMessage({ type: 'export-captures' });
  if (!result.ok) {
    setMessage('备份生成失败，请重试。', true);
    return;
  }
  const ok = await copyText(JSON.stringify(result.backup, null, 2));
  setMessage(ok ? '备份 JSON 已复制，可粘贴保存到文件。' : '复制失败，请重试。', !ok);
});

initializePopup();
setPromptType(type.value);
