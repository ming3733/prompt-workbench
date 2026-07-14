const APP_URL = 'https://ming3733.github.io/prompt-workbench/';
const PENDING_CAPTURE_KEY = 'promptly-pending-capture-v1';

const pageTitle = document.querySelector('#page-title');
const pageUrl = document.querySelector('#page-url');
const title = document.querySelector('#title');
const type = document.querySelector('#type');
const tags = document.querySelector('#tags');
const content = document.querySelector('#content');
const imageBox = document.querySelector('#image-box');
const imageEmpty = document.querySelector('.image-empty');
const imagePreview = document.querySelector('#image-preview');
const removeImage = document.querySelector('#remove-image');
const selectionHint = document.querySelector('#selection-hint');
const message = document.querySelector('#message');
const collectButton = document.querySelector('#collect');
let imageData = '';
let currentSource = { title: '', url: '' };

function setMessage(text, isError = false) {
  message.textContent = text;
  message.style.color = isError ? '#c54c4c' : '#1bb86e';
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
  type.value = normalizePromptType(capture.type, capture.kind);
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
}

document.addEventListener('paste', (event) => {
  const item = [...(event.clipboardData?.items || [])].find((entry) => entry.type.startsWith('image/'));
  if (!item) return;
  const file = item.getAsFile();
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => setImage(reader.result);
  reader.readAsDataURL(file);
  event.preventDefault();
  setMessage('图片已粘贴');
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
  const text = content.value.trim();
  if (!text && !imageData) {
    setMessage('请先输入文字或粘贴图片', true);
    return;
  }
  collectButton.disabled = true;
  collectButton.textContent = '正在录入...';
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
      setMessage('收录失败，请重试。', true);
      collectButton.disabled = false;
      collectButton.textContent = '加入提示词库';
      return;
    }
    setMessage('已录入提示库');
    collectButton.textContent = '已录入提示库';
  });
});

document.querySelector('#open').addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'open-workbench' }, (result) => {
    if (chrome.runtime.lastError || !result?.ok) chrome.tabs.create({ url: APP_URL });
  });
});

initializePopup();
