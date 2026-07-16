import { createIcons, icons } from 'lucide';
import './style.css';

const assetBase = import.meta.env.BASE_URL || './';
const publicAsset = (path) => `${assetBase}${path.replace(/^\/+/, '')}`;

const referenceImages = {
  defaultCover: publicAsset('reference/prompt-default-cover.png'),
  library: publicAsset('reference/prompt-library-reference.png'),
  mobile: publicAsset('reference/prompt-mobile-reference.png'),
  collector: publicAsset('reference/prompt-collector-reference.png'),
};

function normalizePreviewSource(preview, fallback = referenceImages.defaultCover) {
  const raw = String(preview || '').trim();
  if (!raw || raw.startsWith('blob:')) return fallback;
  const referencePath = raw.match(/(?:^|\/)(reference\/[^?#]+)/)?.[1];
  if (referencePath) return publicAsset(referencePath);
  return raw;
}

const promptTypes = ['UI提示词', '图片提示词', 'icon提示词', '视频提示词'];

const starterPrompts = [
  {
    id: 1,
    title: '高密度创作型提示词管理后台',
    type: 'UI提示词',
    folder: '产品界面',
    tags: ['#工作台', '#三栏布局'],
    status: '常用',
    updated: '今天 09:42',
    source: '截图分析',
    preview: referenceImages.library,
    prompt: '请设计一个面向 AI 创作者的高密度提示词管理后台。采用浅灰蓝背景、白色内容卡片和蓝色主按钮，桌面端使用固定顶部导航、左侧文档库和右侧三列提示词卡片布局。卡片显示标题、摘要、来源、标签与图片预览。保留清晰的筛选、批量选择、导入导出与一键复制能力，并适配窄屏阅读。',
    favorite: true,
  },
  {
    id: 2,
    title: '克制留白的移动端收集页',
    type: 'UI提示词',
    folder: '产品界面',
    tags: ['#移动端', '#搜索'],
    status: '最近使用',
    updated: '昨天 18:16',
    source: '参考图',
    preview: referenceImages.mobile,
    prompt: '请生成一个移动端提示词收集页。顶部放置品牌名、模式切换与大字号标题，中间是带清除按钮的搜索框，下面是横向滚动的分类标签和提示词结果卡。卡片采用白底、细灰边框、大留白和轻量阴影，底部固定一个黑色大按钮用于查看全部提示词。',
    favorite: false,
  },
  {
    id: 3,
    title: '奶油质感玩偶渲染',
    type: '图片提示词',
    folder: '图片风格',
    tags: ['#人物渲染', '#玩偶'],
    status: '常用',
    updated: '2026/06/18',
    source: '手动收录',
    preview: referenceImages.collector,
    prompt: '请根据输入的参考图还原毛绒玩偶造型，并保持原图的构图、比例、位置关系与整体轮廓。使用奶油白和浅绿色的柔和配色，细腻织物纹理，柔光摄影，干净的浅色背景，主体居中，商业产品图质感。',
    favorite: true,
  },
  {
    id: 4,
    title: '冷调蓝光数字海报',
    type: '图片提示词',
    folder: '图片风格',
    tags: ['#文字渲染', '#光影合成'],
    status: '最近使用',
    updated: '2026/06/15',
    source: '灵感收录',
    preview: referenceImages.mobile,
    prompt: '设计一张冷调数字主题海报，深蓝背景与大面积留白形成对比，中心放置高反差的三维数字，边缘有柔和蓝色体积光与玻璃反射。画面克制、精确、电影感，标题字形清晰，保留可读的中文信息层级。',
    favorite: false,
  },
  {
    id: 5,
    title: '清透玻璃质感功能图标',
    type: 'icon提示词',
    folder: '图片风格',
    tags: ['#图标', '#玻璃质感'],
    status: '全部',
    updated: '2026/06/12',
    source: '灵感收录',
    preview: referenceImages.library,
    prompt: '设计一枚清透玻璃质感的应用功能图标，主体为发光的魔法闪光符号，保持 1:1 构图、圆角图标容器、柔和蓝色高光、轻微折射和干净阴影。图标需要在小尺寸下保持识别清晰，背景透明或极浅色。',
    favorite: false,
  },
  {
    id: 6,
    title: '产品功能发布短视频',
    type: '视频提示词',
    folder: '图片风格',
    tags: ['#短视频', '#产品发布'],
    status: '全部',
    updated: '2026/06/09',
    source: '手动收录',
    preview: referenceImages.collector,
    prompt: '生成一支 12 秒产品功能发布短视频。节奏从快速网页收录开始，镜头推进到提示词库卡片，再切到复制提示词和 UI 分析结果。整体使用浅色 SaaS 工作台风格、蓝色关键高亮、轻快转场、干净字幕和清晰鼠标操作轨迹，结尾停在“已录入提示库”的成功状态。',
    favorite: false,
  },
];

const promptStorageKey = 'promptly-prompts-v1';
const folderStorageKey = 'promptly-folders-v1';
const accountStorageKey = 'promptly-account-v1';
const workspaceStorageKey = 'promptly-workspaces-v1';
const themeStorageKey = 'promptly-theme-v1';

function cloneStarterPrompts() {
  return starterPrompts.map((prompt) => ({ ...prompt, tags: [...prompt.tags], preview: normalizePreviewSource(prompt.preview) }));
}

function loadStoredArray(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function loadStoredObject(key, fallback = null) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value && typeof value === 'object' ? value : fallback;
  } catch {
    return fallback;
  }
}

function loadThemePreference() {
  try {
    return localStorage.getItem(themeStorageKey) === 'dark';
  } catch {
    return false;
  }
}

function persistThemePreference() {
  try {
    localStorage.setItem(themeStorageKey, state.dark ? 'dark' : 'light');
  } catch {
    // Theme preference is optional; the current session remains usable.
  }
}

function syncThemeClass() {
  const theme = state.dark ? 'dark' : 'light';
  document.documentElement.classList.toggle('theme-dark', state.dark);
  document.body.classList.toggle('theme-dark', state.dark);
  document.documentElement.dataset.theme = theme;
  document.body.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

function normalizePromptType(type, kind = 'text') {
  const raw = String(type || '').replace(/\s+/g, '').toLowerCase();
  if (raw.includes('图片') || raw.includes('image')) return '图片提示词';
  if (raw.includes('icon') || raw.includes('图标')) return 'icon提示词';
  if (raw.includes('视频') || raw.includes('video')) return '视频提示词';
  if (raw.includes('ui') || raw.includes('界面') || raw.includes('设计') || raw.includes('提示词') || raw.includes('描述词')) return 'UI提示词';
  return kind === 'image' ? '图片提示词' : 'UI提示词';
}

function promptTypeClass(type) {
  const normalized = normalizePromptType(type);
  if (normalized === '图片提示词') return 'image-type';
  if (normalized === 'icon提示词') return 'icon-type';
  if (normalized === '视频提示词') return 'video-type';
  return 'ui-type';
}

function tagIdentity(tag) {
  return String(tag || '')
    .replace(/^#+/, '')
    .replace(/\s+/g, '')
    .trim()
    .toLowerCase();
}

function normalizeTag(tag) {
  const clean = String(tag || '')
    .replace(/^#+/, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!clean) return '';
  return `#${clean}`;
}

function normalizeTags(tags, fallback = ['#未整理']) {
  const source = Array.isArray(tags) ? tags : String(tags || '').split(/[,，、;；|]+/);
  const seen = new Set();
  const normalized = [];
  source.forEach((tag) => {
    const clean = normalizeTag(tag);
    const key = tagIdentity(clean);
    if (!clean || seen.has(key)) return;
    seen.add(key);
    normalized.push(clean);
  });
  return normalized.length ? normalized : [...fallback];
}

function tagsToInputValue(tags) {
  return normalizeTags(tags).map((tag) => tag.replace(/^#/, '')).join('，');
}

const imageExtractionGuidance = '请提取这张图片的构图、主体、色彩、材质和光影特征，整理成可复用的图片生成提示词。';

function sanitizePromptContent(value) {
  return String(value || '')
    .replaceAll(imageExtractionGuidance, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function clonePrompts(prompts) {
  return (Array.isArray(prompts) ? prompts : []).map((prompt) => ({
    ...prompt,
    type: normalizePromptType(prompt.type),
    tags: normalizeTags(prompt.tags),
    preview: normalizePreviewSource(prompt.preview),
    prompt: sanitizePromptContent(prompt.prompt),
  }));
}

function normalizeWorkspace(workspace, index = 0) {
  return {
    id: String(workspace?.id || `local-${index}`),
    name: String(workspace?.name || '我的本地库'),
    prompts: clonePrompts(workspace?.prompts),
    folders: [...new Set(['浏览器收集箱', ...(Array.isArray(workspace?.folders) ? workspace.folders : ['产品界面', '图片风格', '未整理'])])],
  };
}

function loadWorkspaceCatalog() {
  const stored = loadStoredObject(workspaceStorageKey);
  if (Array.isArray(stored?.workspaces) && stored.workspaces.length) {
    const workspaces = stored.workspaces.map(normalizeWorkspace);
    return { version: 1, activeId: String(stored.activeId || workspaces[0].id), workspaces, hydratedFromStorage: true };
  }
  return {
    version: 1,
    activeId: 'local-main',
    hydratedFromStorage: false,
    workspaces: [normalizeWorkspace({
      id: 'local-main',
      name: '我的本地库',
      prompts: loadStoredArray(promptStorageKey, cloneStarterPrompts()),
      folders: loadStoredArray(folderStorageKey, ['产品界面', '图片风格', '未整理']),
    })],
  };
}

function getActiveWorkspace() {
  return state.workspaces.find((workspace) => workspace.id === state.workspaceId) || state.workspaces[0];
}

function persistWorkspaceCatalog() {
  try {
    const active = getActiveWorkspace();
    if (active) {
      active.prompts = clonePrompts(state.prompts);
      active.folders = [...state.folders];
    }
    localStorage.setItem(workspaceStorageKey, JSON.stringify({ version: 1, activeId: state.workspaceId, workspaces: state.workspaces }));
  } catch {
    // The app remains usable in memory when local storage is full or unavailable.
  }
}

function persistPrompts() {
  try {
    localStorage.setItem(promptStorageKey, JSON.stringify(state.prompts));
    persistWorkspaceCatalog();
  } catch {
    // Local storage is optional; the current session remains usable when unavailable.
  }
}

function persistFolders() {
  try {
    localStorage.setItem(folderStorageKey, JSON.stringify(state.folders));
    persistWorkspaceCatalog();
  } catch {
    // Local storage is optional; the current session remains usable when unavailable.
  }
}

function persistAccount() {
  try {
    if (state.account) localStorage.setItem(accountStorageKey, JSON.stringify(state.account));
    else localStorage.removeItem(accountStorageKey);
  } catch {
    // Account state is optional in the prototype.
  }
}

function readIncomingCapture() {
  try {
    const value = new URLSearchParams(window.location.search).get('capture');
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function titleFromText(text) {
  const firstLine = String(text || '').split(/\r?\n/).map((line) => line.trim()).find(Boolean) || '网页收录的提示词';
  return firstLine.length > 28 ? `${firstLine.slice(0, 28)}…` : firstLine;
}

function promptFromCapture(capture) {
  if (!capture) return null;
  const content = String(capture.content || capture.text || '').trim();
  const sourceUrl = String(capture.sourceUrl || '').trim();
  if (!content && !sourceUrl) return null;
  const type = normalizePromptType(capture.type, capture.kind);
  const rawPrompt = type === '图片提示词'
    ? `参考图片：${content}`
    : content || `收录页面：${capture.sourceTitle || sourceUrl}`;
  const prompt = sanitizePromptContent(rawPrompt);
  return {
    id: capture.id || Date.now(),
    createdAt: Date.now(),
    title: capture.title || titleFromText(content),
    type,
    folder: '浏览器收集箱',
    tags: normalizeTags(capture.tags, ['#浏览器收录']),
    status: '未整理',
    updated: '刚刚',
    source: capture.sourceTitle || '浏览器收录',
    sourceUrl,
    preview: normalizePreviewSource(capture.preview),
    prompt,
    favorite: false,
  };
}

function acknowledgeExtensionCaptures(ids) {
  if (!ids.length) return;
  window.postMessage({ source: 'promptly-app', type: 'captures-imported', ids }, window.location.origin);
}

function importExtensionCaptures(captures) {
  const incoming = Array.isArray(captures) ? captures : [];
  if (!incoming.length) return;
  const importedIds = [];
  const newPrompts = [];
  incoming.forEach((capture, index) => {
    const captureId = capture?.id || `extension-${Date.now()}-${index}`;
    importedIds.push(captureId);
    const normalizedCapture = { ...capture, id: captureId };
    const prompt = promptFromCapture(normalizedCapture);
    if (prompt && !state.prompts.some((item) => samePromptId(item.id, prompt.id))) newPrompts.push(prompt);
  });
  if (newPrompts.length) {
    state.prompts = [...newPrompts.reverse(), ...state.prompts];
    persistPrompts();
    render();
    showToast(newPrompts.length === 1 ? '已录入提示库' : `已录入 ${newPrompts.length} 条提示词`, 'bookmark-check');
  }
  acknowledgeExtensionCaptures(importedIds);
}

const incomingCapture = readIncomingCapture();
const workspaceCatalog = loadWorkspaceCatalog();
const initialWorkspace = workspaceCatalog.workspaces.find((workspace) => workspace.id === workspaceCatalog.activeId) || workspaceCatalog.workspaces[0];
const state = {
  view: 'library',
  search: '',
  libraryFilter: '全部',
  typeFilter: '全部类型',
  selectedTag: '',
  selectedPromptId: null,
  selectedPromptIds: [],
  selectMode: false,
  sortDirection: 'desc',
  drawerEditing: false,
  dark: loadThemePreference(),
  workspaceId: initialWorkspace.id,
  workspaces: workspaceCatalog.workspaces,
  prompts: clonePrompts(initialWorkspace.prompts),
  folders: [...initialWorkspace.folders],
  account: loadStoredObject(accountStorageKey),
  incomingCapture: Boolean(incomingCapture),
  hasRendered: false,
  analysis: {
    source: '截图',
    hasAsset: true,
    assetPreview: referenceImages.library,
    assetName: '提示词管理后台.png',
    assetMeta: '1080 × 624 · PNG · 1.8 MB',
    assetIsImage: true,
    analyzing: false,
    completed: true,
    engine: 'local',
    target: 'Codex',
    saved: false,
    savedPromptId: null,
    expanded: false,
    promptByTarget: null,
    profile: null,
    note: '',
  },
};

if (incomingCapture) {
  const capturedPrompt = promptFromCapture(incomingCapture);
  if (capturedPrompt) {
    state.prompts.unshift(capturedPrompt);
    persistPrompts();
  }
  window.history.replaceState({}, document.title, window.location.pathname);
}
if (!incomingCapture && !workspaceCatalog.hydratedFromStorage) {
  persistWorkspaceCatalog();
}

const analysisPrompt = {
  Codex: `请基于上传的界面参考，生成一个可运行的响应式网页原型。

【产品定位】
这是一个 AI 提示词工作台，帮助创作者管理提示词，并从截图、PRD 或原型图中提取 UI 设计规则。

【布局结构】
- 顶部固定导航：品牌、一级入口、全局搜索、JSON 导入导出、主题切换、新建按钮
- 左侧固定文档库：文件夹、标签、同步状态
- 主内容区：页面标题、统计信息、筛选标签、三列提示词卡片
- 卡片包含：选择框、标题、正文摘要、图片预览、来源、标签、更新时间、复制按钮

【视觉规范】
使用浅灰蓝页面背景、白色卡片、深色文字和明亮蓝色主操作。边框细而克制，圆角 12px，阴影很轻。标题使用清晰的中文无衬线字体，正文灰度分层，信息密度适中。

【交互与适配】
支持关键词搜索、标签筛选、卡片详情、复制提示词、批量选择、新增和导入导出。桌面端采用三栏布局，平板端收起左侧栏，移动端改为单列卡片并保留底部主操作。`,
  'Figma Make': `Create a responsive prompt workbench for AI creators.

Use a fixed top bar, a compact left documentation sidebar, and a spacious three-column prompt library. The product has two primary destinations: Prompt Library and UI Analysis.

Visual language: pale blue-gray canvas, white surfaces, crisp black typography, blue primary actions, thin cool-gray borders, 12px radius, subtle shadows, and calm information density.

Library cards show prompt title, type, excerpt, source, tags, update date, preview image, favorite, and copy actions. UI Analysis accepts a screenshot, PRD, or prototype link and returns structured layout, content, typography, color, component, and responsive rules. Include search, filters, import/export, detail drawer, copy feedback, and add-to-library states.`,
  通用: `设计一个面向 AI 创作者的「提示词库」。包含提示词库和 UI 分析两个入口：提示词库支持关键词搜索、标签筛选、预览、复制、导入导出和新增；UI 分析支持上传截图、粘贴 PRD 或输入原型链接，输出布局、内容、色彩、字体、组件、交互与响应式规则，并可编辑、复制和加入提示词库。整体采用浅蓝灰背景、白色卡片、黑色文字、蓝色主按钮、细边框和适度圆角，桌面端三栏、移动端单列适配。`,
};

state.analysis.promptByTarget = { ...analysisPrompt };
state.analysis.profile = createDefaultAnalysisProfile();

function getAnalysisContent() {
  return state.analysis.promptByTarget?.[state.analysis.target] || analysisPrompt[state.analysis.target];
}

function getAnalysisProfile() {
  return state.analysis.profile || createDefaultAnalysisProfile();
}

function createDefaultAnalysisProfile() {
  return {
    title: '已提取 6 类界面规则',
    chips: ['布局层级', '色彩系统', '内容结构', '响应式', '组件行为', '视觉密度'],
    cards: [
      { icon: 'layout-dashboard', title: '布局结构', body: '固定顶部导航 + 左侧文档库 + 三列内容卡片，主内容区留有稳定的呼吸感。', value: '12 / 24 / 32px' },
      { icon: 'palette', title: '颜色系统', body: '以浅蓝灰做空间底色，白色承载内容，蓝色只用于主操作和选中状态。', value: 'Blue / Mist / Ink' },
      { icon: 'blocks', title: '组件与行为', body: '搜索、标签筛选、卡片复制、批量选择、来源预览和详情抽屉构成核心使用闭环。', value: '8 个交互点' },
      { icon: 'smartphone', title: '响应式适配', body: '桌面三栏，平板收起文件夹，移动端改单列并保留底部主要操作。', value: 'Desktop → Mobile' },
    ],
  };
}

function createPendingAnalysisProfile(label = '素材已更新') {
  return {
    title: '等待重新分析',
    chips: [label, '待提取布局', '待提取颜色', '待生成提示词'],
    cards: [
      { icon: 'image', title: '分析素材', body: '素材已更新，点击开始分析后会重新生成右侧提示词和摘要。', value: 'Ready' },
      { icon: 'palette', title: '颜色系统', body: '等待读取图片主色、明暗倾向和视觉风格。', value: 'Pending' },
      { icon: 'blocks', title: '组件结构', body: '等待从输入内容中提取导航、卡片、表单、按钮和状态规则。', value: 'Pending' },
      { icon: 'smartphone', title: '适配策略', body: '等待判断桌面、平板和移动端的布局变化。', value: 'Pending' },
    ],
  };
}

function samePromptId(left, right) {
  return String(left) === String(right);
}

function findPrompt(id) {
  return state.prompts.find((prompt) => samePromptId(prompt.id, id));
}

function replacePrompt(updatedPrompt) {
  let replaced = false;
  state.prompts = state.prompts.map((prompt) => {
    if (!samePromptId(prompt.id, updatedPrompt.id)) return prompt;
    replaced = true;
    return clonePrompts([updatedPrompt])[0];
  });
  return replaced;
}

function isPromptSelected(id) {
  return state.selectedPromptIds.some((selectedId) => samePromptId(selectedId, id));
}

function getTagStats() {
  const stats = new Map();
  state.prompts.forEach((prompt) => {
    normalizeTags(prompt.tags).forEach((tag) => {
      const key = tagIdentity(tag);
      const current = stats.get(key);
      if (current) current.count += 1;
      else stats.set(key, { tag, key, count: 1 });
    });
  });
  return [...stats.values()].sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'zh-CN'));
}

function promptHasTag(prompt, selectedTag) {
  if (!selectedTag) return true;
  const key = tagIdentity(selectedTag);
  return normalizeTags(prompt.tags).some((tag) => tagIdentity(tag) === key);
}

function applyWorkspaceCatalogSnapshot(catalog, options = {}) {
  if (!Array.isArray(catalog?.workspaces) || !catalog.workspaces.length) return false;
  const workspaces = catalog.workspaces.map(normalizeWorkspace);
  const preferredId = String(catalog.activeId || state.workspaceId || workspaces[0].id);
  const nextWorkspace = workspaces.find((workspace) => workspace.id === preferredId)
    || workspaces.find((workspace) => workspace.id === state.workspaceId)
    || workspaces[0];
  state.workspaces = workspaces;
  state.workspaceId = nextWorkspace.id;
  state.prompts = clonePrompts(nextWorkspace.prompts);
  state.folders = [...nextWorkspace.folders];
  if (!findPrompt(state.selectedPromptId)) {
    state.selectedPromptId = null;
    state.drawerEditing = false;
  }
  state.selectedPromptIds = state.selectedPromptIds.filter((id) => findPrompt(id));
  render();
  if (options.toast) showToast('已同步最新本地数据', 'refresh-cw');
  return true;
}

const app = document.querySelector('#app');

const syncModalScrollLock = () => {
  document.body.classList.toggle('modal-open', Boolean(document.querySelector('.modal-backdrop')));
};

new MutationObserver(syncModalScrollLock).observe(document.body, { childList: true });

const scrollActivityTimers = new WeakMap();

function markScrollActivity(scroller) {
  if (!scroller?.classList) return;
  scroller.classList.add('is-scrolling');
  const existingTimer = scrollActivityTimers.get(scroller);
  if (existingTimer) window.clearTimeout(existingTimer);
  const timer = window.setTimeout(() => {
    scroller.classList.remove('is-scrolling');
    scrollActivityTimers.delete(scroller);
  }, 900);
  scrollActivityTimers.set(scroller, timer);
}

window.addEventListener('scroll', () => {
  markScrollActivity(document.documentElement);
}, { passive: true });

document.addEventListener('scroll', (event) => {
  if (event.target instanceof HTMLElement) markScrollActivity(event.target);
}, { capture: true, passive: true });

function icon(name, size = 16) {
  return `<i data-lucide="${name}" width="${size}" height="${size}"></i>`;
}

function renderCustomSelect(id, options, selectedValue, iconName = 'list-filter') {
  const selected = options.includes(selectedValue) ? selectedValue : options[0];
  return `
    <div class="custom-select" data-custom-select="${escapeAttr(id)}">
      <input type="hidden" id="${escapeAttr(id)}" value="${escapeAttr(selected)}" />
      <button class="custom-select-trigger" type="button" data-select-trigger aria-haspopup="listbox" aria-expanded="false">
        <span class="custom-select-value"><span class="custom-select-icon">${icon(iconName, 15)}</span><span data-select-label>${escapeHtml(selected)}</span></span>
        <span class="custom-select-caret">${icon('chevron-down', 15)}</span>
      </button>
      <div class="custom-select-menu" role="listbox">
        ${options.map((option) => `<button class="custom-select-option ${option === selected ? 'is-selected' : ''}" type="button" role="option" aria-selected="${option === selected ? 'true' : 'false'}" data-select-option="${escapeAttr(option)}">${escapeHtml(option)}</button>`).join('')}
      </div>
    </div>
  `;
}

function wireCustomSelect(root) {
  const trigger = root?.querySelector('[data-select-trigger]');
  const input = root?.querySelector('input[type="hidden"]');
  const label = root?.querySelector('[data-select-label]');
  const options = [...(root?.querySelectorAll('[data-select-option]') || [])];
  const close = () => {
    root?.classList.remove('is-open');
    trigger?.setAttribute('aria-expanded', 'false');
  };
  const open = () => {
    root?.classList.add('is-open');
    trigger?.setAttribute('aria-expanded', 'true');
  };
  const setValue = (value) => {
    if (!input || !label) return;
    input.value = value;
    label.textContent = value;
    options.forEach((option) => {
      const selected = option.dataset.selectOption === value;
      option.classList.toggle('is-selected', selected);
      option.setAttribute('aria-selected', selected ? 'true' : 'false');
    });
  };
  trigger?.addEventListener('click', (event) => {
    event.stopPropagation();
    root?.classList.contains('is-open') ? close() : open();
  });
  options.forEach((option) => option.addEventListener('click', (event) => {
    event.stopPropagation();
    setValue(option.dataset.selectOption);
    close();
    trigger?.focus();
  }));
  root?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      close();
      trigger?.focus();
    }
  });
  return { close, setValue };
}

function sidebarFolderIcon(folder) {
  const label = String(folder || '').toLowerCase();
  if (folder === '全部') return 'library-big';
  if (label.includes('浏览器') || label.includes('收集')) return 'inbox';
  if (label.includes('产品') || label.includes('界面') || label.includes('ui')) return 'panels-top-left';
  if (label.includes('图片') || label.includes('图像') || label.includes('风格') || label.includes('灵感')) return 'images';
  if (folder === '未整理' || label.includes('未整理')) return 'archive';
  return 'folder-open';
}

function render() {
  syncThemeClass();
  app.innerHTML = `
    <div class="app-shell ${state.dark ? 'is-dark' : ''} ${state.hasRendered ? 'has-rendered' : 'is-entering'}">
      ${renderTopbar()}
      <div class="scroll-progress" aria-hidden="true"><span></span></div>
      <div class="app-body">
        ${renderSidebar()}
        <main class="main-content">
          ${renderMainView()}
        </main>
      </div>
      ${state.selectedPromptId ? renderPromptDrawer() : ''}
      <div class="toast-region" aria-live="polite"></div>
      <input class="visually-hidden" type="file" id="asset-input" accept="image/*,.pdf,.txt,.md" />
      <input class="visually-hidden" type="file" id="import-input" accept=".json,application/json" />
    </div>
  `;
  createIcons({ icons });
  bindEvents();
  updateMotionState();
  state.hasRendered = true;
}

function renderMainView() {
  if (state.view === 'library') return renderLibrary();
  if (state.view === 'analyzer') return renderAnalyzer();
  return renderDataCenter();
}

function renderTopbar() {
  const libraryActive = state.view === 'library';
  const analyzerActive = state.view === 'analyzer';
  const dataActive = state.view === 'data';
  const themeLabel = state.dark ? '浅色模式' : '暗色模式';
  const themeTitle = state.dark ? '切换到浅色模式' : '切换到暗色模式';
  return `
    <header class="topbar">
      <div class="brand-lockup">
        <div class="brand-mark">${icon('sparkles', 17)}</div>
        <div>
          <div class="brand-name">提示词库</div>
          <div class="brand-subtitle">AI 创作工作台</div>
        </div>
      </div>
      <nav class="primary-nav" aria-label="主导航">
        <button class="nav-item ${libraryActive ? 'is-active' : ''}" data-view="library">
          ${icon('library', 16)}<span>提示词库</span><span class="nav-count">${state.prompts.length}</span>
        </button>
        <button class="nav-item ${analyzerActive ? 'is-active' : ''}" data-view="analyzer">
          ${icon('scan-search', 16)}<span>UI 分析</span><span class="nav-new">新</span>
        </button>
        <button class="nav-item ${dataActive ? 'is-active' : ''}" data-view="data">
          ${icon('database', 16)}<span>数据中心</span><span class="nav-count">本地</span>
        </button>
      </nav>
      <label class="global-search">
        ${icon('search', 17)}
        <input id="global-search" value="${escapeAttr(state.search)}" placeholder="搜索提示词、内容、标签..." />
        <kbd>⌘K</kbd>
      </label>
      <div class="topbar-actions">
        <button class="theme-button" data-action="toggle-theme" title="${themeTitle}" aria-pressed="${state.dark ? 'true' : 'false'}">${icon(state.dark ? 'sun' : 'moon', 16)}<span>${themeLabel}</span></button>
        <button class="account-button ${state.account ? 'is-signed-in' : ''}" data-action="open-account" title="邮箱登录与同步">${icon(state.account ? 'cloud-check' : 'log-in', 15)}<span>${state.account ? escapeHtml(state.account.email) : '登录同步'}</span></button>
        <button class="primary-button top-create" data-action="quick-capture">${icon('plus', 16)}<span>收录内容</span></button>
        <button class="mobile-menu" data-action="toggle-mobile-sidebar" title="打开导航">${icon('menu', 18)}</button>
      </div>
    </header>
  `;
}

function renderSidebar() {
  const tags = getTagStats();
  const selectedFolder = state.selectedTag ? '' : (state.libraryFilter === '全部' || state.folders.includes(state.libraryFilter) ? state.libraryFilter : '');
  const folderCount = (folder) => state.prompts.filter((prompt) => (
    folder === '未整理' ? promptMatchesLibraryFilter(prompt, '未整理') : prompt.folder === folder
  )).length;
  return `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-section sidebar-intro">
        <div class="sidebar-label">文档库</div>
        <button class="icon-button small" data-action="new-folder" title="新建文件夹">${icon('plus', 14)}</button>
      </div>
      <div class="folder-list">
        <button class="folder-item ${selectedFolder === '全部' ? 'is-selected' : ''}" data-filter="全部">${icon(sidebarFolderIcon('全部'), 15)}<span>全部提示词</span><span class="folder-count">${state.prompts.length}</span></button>
        ${state.folders.map((folder) => `<button class="folder-item ${selectedFolder === folder ? 'is-selected' : ''}" data-filter="${escapeAttr(folder)}">${icon(sidebarFolderIcon(folder), 15)}<span>${escapeHtml(folder)}</span><span class="folder-count">${folderCount(folder)}</span></button>`).join('')}
      </div>
      <div class="sidebar-divider"></div>
      <div class="sidebar-section tag-heading">
        <div class="sidebar-label">常用标签</div>
        <span class="tag-total">${tags.length}</span>
      </div>
      <div class="sidebar-tags">
        ${tags.map(({ tag, count }) => `<button class="sidebar-tag ${tagIdentity(state.selectedTag) === tagIdentity(tag) ? 'is-selected' : ''}" data-tag="${escapeAttr(tag)}">${escapeHtml(tag)}<span>${count}</span></button>`).join('')}
      </div>
      <div class="sidebar-bottom">
        <button class="sync-status" data-action="open-account"><span class="status-dot"></span><span>${state.account ? '已登录 · 已同步' : '仅本地保存 · 登录同步'}</span><span class="sync-time">${state.account ? '刚刚' : '登录'}</span></button>
        <button class="help-link" data-action="show-help">${icon('circle-help', 15)}<span>快捷键与帮助</span></button>
      </div>
    </aside>
  `;
}

function renderLibrary() {
  const filtered = getFilteredPrompts();
  const libraryFilters = [
    { label: '全部', count: state.prompts.length },
    { label: '常用', count: state.prompts.filter((prompt) => promptMatchesLibraryFilter(prompt, '常用')).length },
    { label: '最近使用', count: state.prompts.filter((prompt) => promptMatchesLibraryFilter(prompt, '最近使用')).length },
    { label: '未整理', count: state.prompts.filter((prompt) => promptMatchesLibraryFilter(prompt, '未整理')).length },
  ];
  return `
    <section class="page-view library-view">
      <div class="page-heading">
        <div>
          <div class="eyebrow">PROMPT LIBRARY <span class="eyebrow-line"></span> ${state.prompts.length} 个提示词</div>
          <h1>提示词库</h1>
          <p class="page-description">把好用的提示词、视觉方向和界面规则，整理成随时可复用的创作资产。</p>
        </div>
        <div class="heading-stats">
          <div><strong>${state.prompts.filter((item) => item.type === 'UI提示词').length}</strong><span>UI提示词</span></div>
          <div><strong>${state.prompts.filter((item) => item.type === '图片提示词').length}</strong><span>图片提示词</span></div>
          <div><strong>${state.prompts.filter((item) => item.type === 'icon提示词').length}</strong><span>icon提示词</span></div>
          <div><strong>${state.prompts.filter((item) => item.type === '视频提示词').length}</strong><span>视频提示词</span></div>
        </div>
      </div>
      <div class="library-toolbar">
        <div class="filter-tabs">
          ${libraryFilters.map((item) => `<button class="filter-tab ${state.libraryFilter === item.label ? 'is-active' : ''}" data-library-filter="${item.label}">${item.label}<span>${item.count}</span></button>`).join('')}
        </div>
        <div class="toolbar-actions">
          <button class="outline-button ${state.selectMode ? 'is-active' : ''}" data-action="select-mode">${icon('list-checks', 15)}<span>${state.selectMode ? '退出选择' : '选择'}</span></button>
          ${state.selectMode ? `<button class="outline-button" data-action="select-all">${icon('check-check', 15)}<span>全选</span></button><button class="outline-button" data-action="copy-selected" ${state.selectedPromptIds.length ? '' : 'disabled'}>${icon('copy', 15)}<span>复制选中 (${state.selectedPromptIds.length})</span></button>` : ''}
          <button class="outline-button" data-action="sort-prompts">${icon('arrow-down-up', 15)}<span>${state.sortDirection === 'desc' ? '最近更新' : '最早更新'}</span></button>
        </div>
      </div>
      <div class="filter-chip-row">
        <span class="filter-caption">筛选：</span>
        ${['全部类型', ...promptTypes].map((item) => `<button class="filter-chip ${item === state.typeFilter ? 'is-active' : ''}" data-type-filter="${item}">${item}</button>`).join('')}
        <span class="filter-result">已显示 ${filtered.length} 个</span>
      </div>
      <div class="prompt-grid" id="prompt-grid">
        ${filtered.length ? filtered.map(renderPromptCard).join('') : renderEmptyState()}
      </div>
    </section>
  `;
}

function renderPromptCard(prompt, index = 0) {
  const promptContent = sanitizePromptContent(prompt.prompt);
  const preview = normalizePreviewSource(prompt.preview);
  return `
    <article class="prompt-card ${samePromptId(state.selectedPromptId, prompt.id) ? 'is-focused' : ''} ${isPromptSelected(prompt.id) ? 'is-selected' : ''}" data-prompt-id="${escapeAttr(prompt.id)}" style="--card-index:${Math.min(index, 12)}">
      <div class="card-topline">
        ${state.selectMode ? `<label class="check-wrap"><input type="checkbox" aria-label="选择 ${escapeAttr(prompt.title)}" ${isPromptSelected(prompt.id) ? 'checked' : ''} /><span></span></label>` : ''}
        <span class="prompt-type ${promptTypeClass(prompt.type)}">${escapeHtml(normalizePromptType(prompt.type))}</span>
      </div>
      <button class="card-main" data-open-prompt="${escapeAttr(prompt.id)}">
        <div class="card-title-line"><h2>${escapeHtml(prompt.title)}</h2><span class="favorite-button ${prompt.favorite ? 'is-favorite' : ''}" data-favorite="${escapeAttr(prompt.id)}" role="button" title="${prompt.favorite ? '取消常用' : '加入常用'}">${icon(prompt.favorite ? 'star' : 'star', 16)}</span></div>
        <p class="prompt-excerpt">${escapeHtml(promptContent)}</p>
        <div class="prompt-preview-wrap"><img src="${escapeAttr(preview)}" data-fallback-src="${escapeAttr(referenceImages.defaultCover)}" alt="${escapeAttr(prompt.title)} 参考图" /><span class="preview-overlay">${icon('scan-search', 15)}<span>查看来源</span></span></div>
      </button>
      <div class="card-footer">
        <div class="card-meta"><span>${icon('link-2', 13)}${escapeHtml(prompt.source)}</span><span>${escapeHtml(prompt.updated)}</span></div>
        <div class="card-bottom-row">
          <div class="tag-list">${normalizeTags(prompt.tags).map((tag) => `<span class="prompt-tag">${escapeHtml(tag)}</span>`).join('')}</div>
          <button class="copy-button" data-copy-prompt="${escapeAttr(prompt.id)}" title="复制提示词">${icon('copy', 14)}<span>复制</span></button>
        </div>
      </div>
    </article>
  `;
}

function renderEmptyState() {
  return `
    <div class="empty-state">
      <div class="empty-icon">${icon('search-x', 22)}</div>
      <h2>没有匹配的提示词</h2>
      <p>试试换一个关键词，或清除当前筛选条件。</p>
      <button class="outline-button" data-action="clear-filters">清除筛选</button>
    </div>
  `;
}

function renderAnalyzer() {
  const a = state.analysis;
  const profile = getAnalysisProfile();
  const analyzerStatus = a.analyzing ? '正在分析' : a.completed ? (a.engine === 'deepseek' ? 'DeepSeek 已完成' : '本地分析已完成') : '等待素材';
  return `
    <section class="page-view analyzer-view">
      <div class="page-heading analyzer-heading">
        <div>
          <div class="eyebrow">UI INSPECTOR <span class="eyebrow-line"></span> 从参考到可执行提示词</div>
          <h1>UI 分析</h1>
          <p class="page-description">上传截图、原型或 PRD，让界面规则变成 Codex 和 Figma Make 能直接理解的提示词。</p>
        </div>
        <div class="analyzer-state ${a.completed ? 'is-done' : ''}">${icon(a.completed ? (a.engine === 'deepseek' ? 'sparkles' : 'check-circle-2') : 'sparkles', 16)}<span>${analyzerStatus}</span></div>
      </div>
      <div class="analyzer-workspace">
        <div class="source-panel panel">
          <div class="panel-heading">
            <div><span class="section-kicker">01</span><h2>添加分析素材</h2></div>
            <button class="icon-button" data-action="reset-analysis" title="重新开始">${icon('rotate-ccw', 15)}</button>
          </div>
          <div class="source-tabs">
            ${['截图', 'PRD', '原型链接'].map((item) => `<button class="source-tab ${a.source === item ? 'is-active' : ''}" data-source-tab="${item}">${item}</button>`).join('')}
          </div>
          ${renderSourceContent()}
          <div class="source-note">${icon('lock-keyhole', 13)}<span>素材仅用于本次分析，不会自动上传。</span></div>
        </div>
        <div class="result-panel panel ${a.expanded ? 'is-expanded' : ''}">
          <div class="panel-heading result-heading">
            <div><span class="section-kicker">02</span><h2>生成提示词</h2></div>
            <div class="result-tools"><span class="result-length">${a.completed ? `${getAnalysisContent().length.toLocaleString()} 字` : '等待分析'}</span><button class="icon-button" data-action="toggle-result-expand" title="${a.expanded ? '收起结果' : '展开结果'}">${icon(a.expanded ? 'minimize-2' : 'maximize-2', 15)}</button></div>
          </div>
          <div class="target-switcher">
            <span class="target-label">输出到</span>
            ${['Codex', 'Figma Make', '通用'].map((item) => `<button class="target-option ${a.target === item ? 'is-active' : ''}" data-target="${item}">${item === 'Codex' ? icon('code-2', 14) : item === 'Figma Make' ? icon('figma', 14) : icon('sparkles', 14)}<span>${item}</span></button>`).join('')}
          </div>
          <div class="analysis-summary">
            <div class="summary-title"><span class="summary-dot"></span><strong>${escapeHtml(profile.title)}</strong><span class="summary-time">${a.completed ? (a.engine === 'deepseek' ? 'DeepSeek' : '本地') : '待分析'}</span></div>
            <div class="summary-chips">${profile.chips.map((chip) => `<span>${escapeHtml(chip)}</span>`).join('')}</div>
          </div>
          <label class="prompt-editor-wrap">
            <span class="editor-label">可执行提示词 <span>可直接编辑</span></span>
            <textarea id="analysis-editor" spellcheck="false">${escapeHtml(getAnalysisContent())}</textarea>
          </label>
          <div class="result-footer">
            <button class="outline-button" data-action="copy-analysis">${icon('copy', 15)}<span>复制提示词</span></button>
            <button class="primary-button" data-action="save-analysis">${icon(a.saved ? 'check' : 'bookmark-plus', 15)}<span>${a.saved ? '已加入提示词库' : '加入提示词库'}</span></button>
          </div>
        </div>
      </div>
      <div class="analysis-breakdown">
        <div class="breakdown-intro"><span class="section-kicker">03</span><h2>分析结果摘要</h2><p>先看懂这张图，再决定提示词如何落地。</p></div>
        <div class="breakdown-grid">
          ${profile.cards.map((card, index) => renderBreakdownCard(card.icon, card.title, card.body, card.value, index)).join('')}
        </div>
      </div>
    </section>
  `;
}

function renderDataCenter() {
  const stats = getLocalDataStats();
  return `
    <section class="page-view data-view">
      <div class="page-heading data-heading">
        <div>
          <div class="eyebrow">LOCAL DATA <span class="eyebrow-line"></span> 先跑通，再接云端</div>
          <h1>数据与接入中心</h1>
          <p class="page-description">默认保存在当前浏览器本机；需要迁移、分享或上线时，再通过导出文件、GitHub 部署、DeepSeek 分析和邮箱登录逐步接入。</p>
        </div>
        <div class="heading-stats">
          <div><strong>${state.workspaces.length}</strong><span>本地页签</span></div>
          <div><strong>${state.prompts.length}</strong><span>当前提示词</span></div>
          <div><strong>${stats.sizeLabel}</strong><span>本机占用</span></div>
        </div>
      </div>

      <div class="data-grid">
        <div class="panel data-panel">
          <div class="panel-heading">
            <div><span class="section-kicker">01</span><h2>本地保存</h2></div>
            <span class="data-status is-ready">${icon('hard-drive', 14)}已启用</span>
          </div>
          <p class="data-copy">所有提示词、文件夹和本地页签都会写入浏览器本机。不同用户打开这个网页时，默认各自保存自己的数据。</p>
          <div class="data-action-row">
            <button class="outline-button" data-action="open-workspaces">${icon('layers-2', 15)}<span>管理本地页签</span></button>
            <button class="outline-button" data-action="export-all">${icon('download', 15)}<span>导出全部页签</span></button>
          </div>
          <div class="data-metrics">
            <span>当前页签：${escapeHtml(getActiveWorkspace()?.name || '我的本地库')}</span>
            <span>字段：提示词 / 文件夹 / 标签 / 图片预览</span>
          </div>
        </div>

        <div class="panel data-panel">
          <div class="panel-heading">
            <div><span class="section-kicker">02</span><h2>备份与迁移</h2></div>
            <span class="data-status">${icon('file-json', 14)}JSON</span>
          </div>
          <p class="data-copy">JSON 适合完整备份和迁移，能保留标签、图片预览、文件夹和本地页签结构。导入会合并到当前本地页签，不会要求注册账号。</p>
          <div class="data-action-row">
            <button class="outline-button" data-action="export">${icon('file-json', 15)}<span>导出当前 JSON</span></button>
            <button class="primary-button" data-action="import">${icon('upload', 15)}<span>导入文件</span></button>
          </div>
          <div class="data-metrics">
            <span>推荐：每个项目一个本地页签</span>
            <span>团队协作：先用 JSON 文件传递</span>
          </div>
        </div>

        <div class="panel data-panel">
          <div class="panel-heading">
            <div><span class="section-kicker">03</span><h2>上线部署</h2></div>
            <span class="data-status is-next">${icon('github', 14)}GitHub 可用</span>
          </div>
          <div class="integration-list">
            ${renderIntegrationItem('GitHub', '存代码、版本管理、协作修改', '需要仓库名和是否公开')}
            ${renderIntegrationItem('Vercel / Netlify', '把网页发布成可访问链接', '需要绑定 GitHub 仓库')}
            ${renderIntegrationItem('GitHub Pages', '纯前端也能托管', '适合无后端的本地版')}
          </div>
        </div>

        <div class="panel data-panel">
          <div class="panel-heading">
            <div><span class="section-kicker">04</span><h2>AI 分析接口</h2></div>
            <span class="data-status is-next">${icon('sparkles', 14)}DeepSeek</span>
          </div>
          <p class="data-copy">DeepSeek 适合把 PRD、链接描述和 OCR 后的截图信息整理成 UI 提示词。真正的图片理解建议在后端加截图解析或视觉模型中转。</p>
          <div class="integration-list compact">
            ${renderIntegrationItem('API Key', '服务端环境变量保存', '不要放在公开前端代码里')}
            ${renderIntegrationItem('模型与 Base URL', '默认 deepseek-v4-flash + https://api.deepseek.com', '可在 .env.local 调整')}
            ${renderIntegrationItem('提示词模板', '把布局、颜色、内容、组件拆成结构化输出', '当前 UI 分析已预留编辑区')}
          </div>
          <div class="data-action-row">
            <button class="outline-button" data-action="copy-env-template">${icon('copy', 15)}<span>复制接入清单</span></button>
          </div>
        </div>

        <div class="panel data-panel wide-panel">
          <div class="panel-heading">
            <div><span class="section-kicker">05</span><h2>邮箱登录与云端同步</h2></div>
            <span class="data-status is-next">${icon('mail-check', 14)}建议 Supabase</span>
          </div>
          <div class="roadmap-grid">
            ${renderRoadmapStep('本地版', '现在可用', 'localStorage 保存、页签隔离、JSON 导入导出')}
            ${renderRoadmapStep('账号版', '下一步', '邮箱验证码登录，用户数据写入云端数据库')}
            ${renderRoadmapStep('团队版', '后续', '共享库、权限、图片存储、AI 分析记录')}
          </div>
          <div class="data-action-row">
            <button class="outline-button" data-action="open-account">${icon('log-in', 15)}<span>查看登录入口</span></button>
            <button class="outline-button" data-action="copy-schema-template">${icon('database', 15)}<span>复制数据表草案</span></button>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderIntegrationItem(title, body, meta) {
  return `<div class="integration-item"><strong>${title}</strong><span>${body}</span><small>${meta}</small></div>`;
}

function renderRoadmapStep(title, stage, body) {
  return `<div class="roadmap-step"><span>${stage}</span><strong>${title}</strong><p>${body}</p></div>`;
}

function getLocalDataStats() {
  const keys = [promptStorageKey, folderStorageKey, accountStorageKey, workspaceStorageKey];
  const bytes = keys.reduce((total, key) => total + new Blob([localStorage.getItem(key) || '']).size, 0);
  const sizeLabel = bytes < 1024 ? `${bytes}B` : `${Math.ceil(bytes / 1024)}KB`;
  return { bytes, sizeLabel };
}

function renderSourceContent() {
  const a = state.analysis;
  if (a.source === '截图') {
    const assetVisual = a.assetIsImage ? `<div class="asset-preview"><img src="${a.assetPreview || referenceImages.library}" alt="已上传的参考图" /><span class="asset-badge">${icon('check', 12)}已添加</span></div>` : `<div class="asset-file-preview">${icon('file-text', 25)}<strong>${escapeHtml(a.assetName || '已添加文件')}</strong><span>文件已就绪，分析时将读取内容</span></div>`;
    return `
      <button class="dropzone ${a.hasAsset ? 'has-asset' : ''}" data-action="pick-asset">
        ${a.hasAsset ? assetVisual : `<div class="drop-icon">${icon('image-plus', 24)}</div>`}
        <div class="drop-content"><strong>${a.hasAsset ? escapeHtml(a.assetName || '已添加素材') : '拖拽截图到这里'}</strong><span>${a.hasAsset ? escapeHtml(a.assetMeta || '本地文件已添加') : '或点击选择图片、PDF、Markdown'}</span></div>
        <span class="drop-action">${a.hasAsset ? '更换素材' : '选择文件'}</span>
      </button>
      <div class="source-sample"><span>快速试用参考图</span><button class="sample-card ${a.assetPreview === referenceImages.mobile ? 'is-selected' : ''}" data-sample="${referenceImages.mobile}" data-action="use-sample"><img src="${referenceImages.mobile}" alt="移动端提示词收集页参考图" />${a.assetPreview === referenceImages.mobile ? `<span>${icon('check', 12)}</span>` : ''}</button><button class="sample-card ${a.assetPreview === referenceImages.collector ? 'is-selected' : ''}" data-sample="${referenceImages.collector}" data-action="use-sample"><img src="${referenceImages.collector}" alt="提示词收集器参考图" />${a.assetPreview === referenceImages.collector ? `<span>${icon('check', 12)}</span>` : ''}</button></div>
      <button class="analyze-button ${a.analyzing ? 'is-loading' : ''}" data-action="analyze">${icon(a.analyzing ? 'loader-circle' : 'wand-sparkles', 17)}<span>${a.analyzing ? '正在分析界面...' : a.completed ? '重新分析这张图' : '开始分析'}</span></button>
    `;
  }
  if (a.source === 'PRD') {
    return `
      <label class="prd-input-wrap"><span>把产品需求粘贴到这里</span><textarea id="prd-input" placeholder="例如：做一个能收录 UI 提示词的工作台，用户可以搜索、复制，并从截图生成适合 Codex 的前端提示词。">${escapeHtml(a.note)}</textarea></label>
      <div class="input-footnote">支持 Markdown、纯文本和产品需求摘要</div>
      <button class="analyze-button ${a.analyzing ? 'is-loading' : ''}" data-action="analyze">${icon(a.analyzing ? 'loader-circle' : 'wand-sparkles', 17)}<span>${a.analyzing ? '正在分析需求...' : '分析这段 PRD'}</span></button>
    `;
  }
  return `
    <label class="link-input-wrap"><span>输入公开的原型或产品链接</span><div class="url-field">${icon('link-2', 16)}<input id="prototype-url" placeholder="https://..." value="${escapeAttr(a.note)}" /><button data-action="clear-url" title="清除链接">${icon('x', 15)}</button></div></label>
    <div class="input-footnote">支持 Figma 原型、网页链接和本地预览地址</div>
    <button class="analyze-button ${a.analyzing ? 'is-loading' : ''}" data-action="analyze">${icon(a.analyzing ? 'loader-circle' : 'scan-search', 17)}<span>${a.analyzing ? '正在读取原型...' : '读取并分析原型'}</span></button>
  `;
}

function renderBreakdownCard(iconName, title, body, value, index = 0) {
  return `<div class="breakdown-card" style="--card-index:${Math.min(index, 8)}"><div class="breakdown-icon">${icon(iconName, 18)}</div><div class="breakdown-copy"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p><span class="breakdown-value">${escapeHtml(value)}</span></div></div>`;
}

function renderPromptDrawer() {
  const prompt = findPrompt(state.selectedPromptId);
  if (!prompt) return '';
  const editing = state.drawerEditing;
  const promptContent = sanitizePromptContent(prompt.prompt);
  const preview = normalizePreviewSource(prompt.preview);
  return `
    <div class="drawer-backdrop" data-action="close-drawer"></div>
    <aside class="prompt-drawer">
      <div class="drawer-head"><div><span class="eyebrow">PROMPT DETAIL</span><h2>提示词详情</h2></div><button class="icon-button" data-action="close-drawer" title="关闭详情">${icon('x', 17)}</button></div>
      <div class="drawer-scroll">
        <img id="${editing ? 'drawer-cover-preview' : ''}" class="drawer-image ${editing ? 'is-paste-target' : ''}" src="${escapeAttr(preview)}" data-preview="${escapeAttr(preview)}" data-fallback-src="${escapeAttr(referenceImages.defaultCover)}" alt="${escapeAttr(prompt.title)} 参考图" ${editing ? 'tabindex="0" title="编辑状态下可粘贴图片替换封面"' : ''} />
        <div class="drawer-type-row"><span class="prompt-type ${promptTypeClass(prompt.type)}">${escapeHtml(normalizePromptType(prompt.type))}</span><span class="drawer-source">${escapeHtml(prompt.source)} · ${escapeHtml(prompt.updated)}</span></div>
        ${editing ? `<label class="drawer-title-editor"><span>标题 <em>编辑中</em></span><input id="drawer-title" value="${escapeAttr(prompt.title)}" placeholder="输入标题" /></label>` : `<h3 class="drawer-title">${escapeHtml(prompt.title)}</h3>`}
        ${editing ? `<label class="drawer-tag-editor"><span>标签 <em>编辑中</em></span><input id="drawer-tags" value="${escapeAttr(tagsToInputValue(prompt.tags))}" placeholder="例如：UI 设计，参考图" /><small>逗号、顿号或竖线分隔，保存时自动去重。</small></label>` : `<div class="drawer-tags">${normalizeTags(prompt.tags).map((tag) => `<span class="prompt-tag">${escapeHtml(tag)}</span>`).join('')}</div>`}
        <label class="drawer-editor"><span>完整提示词 ${editing ? '<em>编辑中</em>' : ''}</span><textarea id="drawer-editor" ${editing ? '' : 'readonly'}>${escapeHtml(promptContent)}</textarea></label>
        <div class="drawer-note">${icon('info', 14)}<span>复制后可直接粘贴到 Codex、Figma Make 或图片生成工具。</span></div>
      </div>
      <div class="drawer-actions"><button class="danger-button" data-action="delete-prompt">${icon('trash-2', 15)}<span>删除</span></button><button class="outline-button" data-action="edit-prompt">${icon(editing ? 'save' : 'pencil', 15)}<span>${editing ? '保存修改' : '编辑'}</span></button><button class="primary-button" data-copy-prompt="${prompt.id}">${icon('copy', 15)}<span>复制提示词</span></button></div>
    </aside>
  `;
}

function promptMatchesLibraryFilter(prompt, filter) {
  if (filter === '全部') return true;
  if (filter === '常用') return Boolean(prompt.favorite);
  if (filter === '最近使用') return prompt.status === '最近使用' || prompt.updated === '刚刚';
  if (filter === '未整理') return prompt.status === '未整理' || prompt.folder === '未整理';
  return prompt.folder === filter;
}

function getFilteredPrompts() {
  const filtered = state.prompts.filter((prompt) => {
    const haystack = [prompt.title, prompt.prompt, prompt.type, prompt.folder, normalizeTags(prompt.tags).join(' ')].join(' ').toLowerCase();
    const matchesSearch = !state.search || haystack.includes(state.search.toLowerCase());
    const matchesFolder = promptMatchesLibraryFilter(prompt, state.libraryFilter);
    const matchesTag = promptHasTag(prompt, state.selectedTag);
    const matchesType = state.typeFilter === '全部类型' || normalizePromptType(prompt.type) === state.typeFilter;
    return matchesSearch && matchesFolder && matchesTag && matchesType;
  });
  return filtered.sort((a, b) => {
    const left = Number(a.createdAt || a.id) || 0;
    const right = Number(b.createdAt || b.id) || 0;
    return state.sortDirection === 'desc' ? right - left : left - right;
  });
}

function bindEvents() {
  document.querySelectorAll('[data-view]').forEach((button) => button.addEventListener('click', () => {
    state.view = button.dataset.view;
    state.selectedPromptId = null;
    state.drawerEditing = false;
    render();
  }));

  const search = document.querySelector('#global-search');
  search?.addEventListener('input', (event) => {
    state.search = event.target.value;
    if (state.view !== 'library') return;
    renderLibraryOnly();
  });

  document.querySelectorAll('[data-library-filter]').forEach((button) => button.addEventListener('click', () => {
    state.libraryFilter = button.dataset.libraryFilter;
    state.selectedTag = '';
    state.typeFilter = '全部类型';
    render();
  }));
  document.querySelectorAll('[data-type-filter]').forEach((button) => button.addEventListener('click', () => {
    state.typeFilter = button.dataset.typeFilter;
    renderLibraryOnly();
  }));
  document.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => {
    state.libraryFilter = button.dataset.filter;
    state.selectedTag = '';
    state.typeFilter = '全部类型';
    render();
  }));
  document.querySelectorAll('[data-tag]').forEach((button) => button.addEventListener('click', () => {
    state.selectedTag = tagIdentity(state.selectedTag) === tagIdentity(button.dataset.tag) ? '' : button.dataset.tag;
    state.libraryFilter = '全部';
    state.typeFilter = '全部类型';
    render();
  }));
  document.querySelectorAll('[data-open-prompt]').forEach((button) => button.addEventListener('click', () => {
    if (state.selectMode) {
      togglePromptSelection(button.dataset.openPrompt);
      return;
    }
    state.selectedPromptId = button.dataset.openPrompt;
    state.drawerEditing = false;
    render();
  }));
  document.querySelectorAll('[data-copy-prompt]').forEach((button) => button.addEventListener('click', (event) => {
    event.stopPropagation();
    const prompt = findPrompt(button.dataset.copyPrompt);
    copyText(sanitizePromptContent(prompt?.prompt), '提示词已复制');
  }));
  document.querySelectorAll('[data-favorite]').forEach((button) => button.addEventListener('click', (event) => {
    event.stopPropagation();
    const prompt = findPrompt(button.dataset.favorite);
    if (prompt) prompt.favorite = !prompt.favorite;
    persistPrompts();
    render();
    showToast(prompt?.favorite ? '已加入常用' : '已从常用移除', 'star');
  }));
  document.querySelectorAll('.check-wrap input').forEach((input) => input.addEventListener('change', () => {
    const id = input.closest('.prompt-card')?.dataset.promptId;
    togglePromptSelection(id);
  }));
  document.querySelectorAll('[data-source-tab]').forEach((button) => button.addEventListener('click', () => {
    syncAnalysisInputs();
    state.analysis.source = button.dataset.sourceTab;
    state.analysis.completed = false;
    state.analysis.saved = false;
    state.analysis.savedPromptId = null;
    state.analysis.profile = createPendingAnalysisProfile(state.analysis.source);
    render();
  }));
  document.querySelectorAll('[data-target]').forEach((button) => button.addEventListener('click', () => {
    syncAnalysisInputs();
    state.analysis.target = button.dataset.target;
    render();
  }));
  document.querySelectorAll('[data-action]').forEach((button) => button.addEventListener('click', (event) => handleAction(button.dataset.action, button, event)));
  document.querySelector('#asset-input')?.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (file) handleAssetFile(file);
  });
  document.querySelector('#import-input')?.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (file) handleImportFile(file);
  });
  document.querySelector('#analysis-editor')?.addEventListener('input', (event) => {
    state.analysis.promptByTarget[state.analysis.target] = event.target.value;
  });
  document.querySelector('.prompt-drawer')?.addEventListener('paste', (event) => {
    if (!state.drawerEditing) return;
    const item = [...(event.clipboardData?.items || [])].find((entry) => entry.type.startsWith('image/'));
    if (!item) return;
    const file = item.getAsFile();
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return showToast('封面图片请控制在 2MB 内', 'triangle-alert');
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      const preview = document.querySelector('#drawer-cover-preview');
      if (!preview) return;
      preview.src = dataUrl;
      preview.dataset.preview = dataUrl;
      showToast('封面已替换，保存后生效', 'image');
    };
    reader.readAsDataURL(file);
    event.preventDefault();
  });
  document.querySelector('#prd-input')?.addEventListener('input', (event) => { state.analysis.note = event.target.value; });
  document.querySelector('#prototype-url')?.addEventListener('input', (event) => { state.analysis.note = event.target.value; });
  document.querySelector('.dropzone')?.addEventListener('dragover', (event) => event.preventDefault());
  document.querySelector('.dropzone')?.addEventListener('drop', (event) => {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) handleAssetFile(file);
  });
}

function renderLibraryOnly() {
  const current = document.querySelector('.main-content');
  if (!current) return render();
  current.innerHTML = renderLibrary();
  createIcons({ icons });
  bindEvents();
  updateMotionState();
}

function createAnalysisState(overrides = {}) {
  return {
    source: '截图',
    hasAsset: true,
    assetPreview: referenceImages.library,
    assetName: '提示词管理后台.png',
    assetMeta: '1080 × 624 · PNG · 1.8 MB',
    assetIsImage: true,
    analyzing: false,
    completed: false,
    engine: 'local',
    target: 'Codex',
    saved: false,
    savedPromptId: null,
    expanded: false,
    promptByTarget: { ...analysisPrompt },
    profile: createDefaultAnalysisProfile(),
    note: '',
    ...overrides,
  };
}

function syncAnalysisInputs() {
  const editor = document.querySelector('#analysis-editor');
  if (editor) state.analysis.promptByTarget[state.analysis.target] = editor.value;
  const sourceInput = document.querySelector('#prd-input') || document.querySelector('#prototype-url');
  if (sourceInput) state.analysis.note = sourceInput.value;
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function runAnalysis() {
  const currentSource = state.analysis.source;
  state.analysis.analyzing = true;
  state.analysis.completed = false;
  state.analysis.engine = 'local';
  render();
  try {
    const [profile] = await Promise.all([createAnalysisProfileFromInput(), wait(520)]);
    if (state.analysis.source !== currentSource) return;
    const deepSeekResult = await enhanceAnalysisWithDeepSeek(profile);
    state.analysis.profile = profile;
    const deepSeekPromptSet = deepSeekResult?.promptByTarget;
    state.analysis.promptByTarget = deepSeekPromptSet || createPromptSetFromProfile(profile);
    state.analysis.analyzing = false;
    state.analysis.completed = true;
    state.analysis.engine = deepSeekPromptSet ? 'deepseek' : 'local';
    state.analysis.saved = false;
    state.analysis.savedPromptId = null;
    render();
    const fallbackMessage = deepSeekResult?.error ? `${deepSeekResult.error}，已回退本地分析` : '本地分析完成，提示词已刷新';
    showToast(deepSeekPromptSet ? 'DeepSeek 分析完成，提示词已刷新' : fallbackMessage, deepSeekPromptSet ? 'sparkles' : 'check-circle-2');
  } catch {
    state.analysis.analyzing = false;
    state.analysis.completed = false;
    render();
    showToast('分析失败，请更换素材再试', 'triangle-alert');
  }
}

async function enhanceAnalysisWithDeepSeek(profile) {
  try {
    const response = await fetch('/api/analyze-ui', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: state.analysis.source,
        target: state.analysis.target,
        note: state.analysis.note,
        assetName: state.analysis.assetName,
        assetMeta: state.analysis.assetMeta,
        profile: {
          title: profile.title,
          chips: profile.chips,
          cards: profile.cards,
          keywords: profile.keywords || [],
          palette: profile.palette || [],
          metrics: profile.metrics || null,
          sourceType: profile.sourceType,
          sourceName: profile.sourceName,
        },
      }),
    });
    if (response.status === 501) return null;
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: normalizeDeepSeekError(errorData?.detail || errorData?.error || 'DeepSeek 请求失败') };
    }
    const data = await response.json();
    const promptByTarget = data?.promptByTarget;
    if (!promptByTarget?.Codex && !promptByTarget?.['Figma Make'] && !promptByTarget?.通用) return null;
    return { promptByTarget };
  } catch {
    return null;
  }
}

function normalizeDeepSeekError(message) {
  const text = String(message || '');
  if (/insufficient balance|余额不足/i.test(text)) return 'DeepSeek 余额不足';
  if (/unauthorized|invalid api key|认证|key/i.test(text)) return 'DeepSeek Key 无效';
  if (/model/i.test(text)) return 'DeepSeek 模型配置异常';
  return 'DeepSeek 暂不可用';
}

async function createAnalysisProfileFromInput() {
  const a = state.analysis;
  if (a.source === 'PRD') return createTextAnalysisProfile(a.note, 'PRD');
  if (a.source === '原型链接') return createLinkAnalysisProfile(a.note);
  if (a.assetIsImage && a.assetPreview) {
    const metrics = await inspectImage(a.assetPreview);
    return createImageAnalysisProfile(metrics);
  }
  return createFileAnalysisProfile();
}

function createFileAnalysisProfile() {
  const a = state.analysis;
  const name = a.assetName || '已添加文件';
  return {
    sourceType: '文件',
    sourceName: name,
    palette: ['#f7f9fc', '#0d7be8', '#1d2530'],
    title: `已读取文件：${name}`,
    chips: ['文档输入', '结构提取', '内容规划', '组件规则', '响应式'],
    cards: [
      { icon: 'file-text', title: '素材类型', body: `${name} 已加入分析队列，首版会按文档输入生成 UI 规划提示词。`, value: 'Document' },
      { icon: 'layout-dashboard', title: '布局建议', body: '建议先抽取页面目标、模块顺序、主操作和状态，再生成界面结构。', value: 'Flow first' },
      { icon: 'blocks', title: '组件建议', body: '根据文档内容沉淀导航、列表、卡片、表单、弹窗和空状态规则。', value: 'Components' },
      { icon: 'smartphone', title: '适配建议', body: '默认输出桌面优先，同时补充平板和移动端的栅格降级方式。', value: 'Responsive' },
    ],
  };
}

function createTextAnalysisProfile(text, sourceType) {
  const cleaned = String(text || '').trim();
  const keywords = extractKeywords(cleaned);
  const featureCount = Math.max(3, Math.min(9, cleaned.split(/[，。；;,\n、]/).filter((item) => item.trim().length > 3).length));
  const hasData = /数据|导入|导出|数据库|本地|同步|保存/.test(cleaned);
  const hasAi = /AI|DeepSeek|分析|生成|提示词|截图|模型/i.test(cleaned);
  const hasLogin = /登录|注册|邮箱|账号|权限|用户/.test(cleaned);
  const chips = [
    `${sourceType} 输入`,
    `${featureCount} 个功能点`,
    hasData ? '数据闭环' : '内容结构',
    hasAi ? 'AI 生成' : '人工编辑',
    hasLogin ? '账号状态' : '轻登录',
  ];
  return {
    sourceType,
    sourceName: sourceType === 'PRD' ? '产品需求文本' : '文本输入',
    keywords,
    palette: ['#f5f8fc', '#0d7be8', '#1d2530'],
    title: `已解析 ${featureCount} 个需求线索`,
    chips,
    cards: [
      { icon: 'list-checks', title: '需求结构', body: `从文本中提取到 ${keywords.slice(0, 6).join('、') || '核心工作流'} 等关键词，适合先搭建工作台页面。`, value: `${featureCount} items` },
      { icon: 'layout-dashboard', title: '布局建议', body: hasData ? '建议采用左侧分类、主区卡片列表和右侧结果区，保证收录、筛选、复制、同步形成闭环。' : '建议采用顶部导航、主内容列表和结果编辑区，突出生成后的可编辑与复用。', value: 'Workbench' },
      { icon: 'blocks', title: '组件建议', body: `${hasAi ? '需要分析按钮、生成状态、结果编辑器和复制反馈。' : '需要输入框、筛选器、结果卡片和详情抽屉。'}${hasLogin ? '账号入口要保留未登录、验证码、已同步状态。' : ''}`, value: 'States' },
      { icon: 'smartphone', title: '适配建议', body: '桌面端保留多列效率布局，移动端改为单列任务流，主操作固定在当前上下文附近。', value: 'Desktop → Mobile' },
    ],
  };
}

function createLinkAnalysisProfile(url) {
  const cleanUrl = String(url || '').trim();
  let host = '原型链接';
  try { host = new URL(cleanUrl).hostname || host; } catch {}
  const isFigma = /figma\.com/i.test(cleanUrl);
  const isLocal = /localhost|127\.0\.0\.1/i.test(cleanUrl);
  return {
    sourceType: '原型链接',
    sourceName: host,
    palette: ['#f7f9fc', '#7a5af8', '#1d2530'],
    title: `已解析链接来源：${host}`,
    chips: [isFigma ? 'Figma 原型' : isLocal ? '本地预览' : '网页链接', '页面结构', '交互状态', '响应式', '可复制提示词'],
    cards: [
      { icon: isFigma ? 'figma' : 'link-2', title: '来源识别', body: `${host} 会作为界面参考来源，首版先根据链接类型生成结构化 UI 复刻提示词。`, value: isFigma ? 'Figma' : isLocal ? 'Local' : 'URL' },
      { icon: 'layout-dashboard', title: '布局建议', body: isFigma ? '优先复刻 Frame 的层级、约束、组件命名和变量风格。' : '优先拆解首屏导航、内容区、卡片/表单和底部操作。', value: 'Structure' },
      { icon: 'blocks', title: '交互建议', body: '生成提示词时保留 hover、选中、空状态、弹窗、复制反馈和加载状态。', value: 'Interaction' },
      { icon: 'smartphone', title: '适配建议', body: '要求输出桌面、平板、移动端三档适配规则，避免只生成静态桌面图。', value: '3 breakpoints' },
    ],
  };
}

function createImageAnalysisProfile(metrics) {
  const a = state.analysis;
  const orientation = metrics.orientation;
  const paletteLabel = describePalette(metrics);
  const density = metrics.area > 1200000 ? '高密度' : metrics.area > 520000 ? '中等密度' : '轻量密度';
  return {
    sourceType: '截图',
    sourceName: a.assetName || '上传截图',
    metrics,
    palette: metrics.colors,
    title: `已分析图片：${metrics.width}×${metrics.height} · ${paletteLabel}`,
    chips: [orientation, paletteLabel, density, `主色 ${metrics.colors[0]}`, metrics.brightnessLabel, '本地取色'],
    cards: [
      { icon: orientation === '移动端纵屏' ? 'smartphone' : 'layout-dashboard', title: '布局结构', body: `${metrics.width}×${metrics.height}，判断为${orientation}。建议生成时保持主体区域比例、边距节奏和模块层级，不要把信息重新洗成无关布局。`, value: metrics.ratioLabel },
      { icon: 'palette', title: '颜色系统', body: `近似主色为 ${metrics.colors.join(' / ')}，整体${metrics.brightnessLabel}、${paletteLabel}。生成时把这些颜色转成背景、边框、主按钮和文字层级。`, value: metrics.colors.slice(0, 3).join(' ') },
      { icon: 'blocks', title: '内容与组件', body: `按${density}界面处理：保留导航、卡片、输入区、操作按钮、状态标签和结果区域，并补齐 hover、选中、加载、空状态。`, value: density },
      { icon: 'smartphone', title: '响应式适配', body: orientation === '移动端纵屏' ? '以移动端单列为基准，桌面端可以扩展为双列或三栏，但保留原图的留白和卡片节奏。' : '以桌面/宽屏为基准，平板收窄栏宽，移动端改为单列并保留主操作入口。', value: orientation === '移动端纵屏' ? 'Mobile first' : 'Desktop first' },
    ],
  };
}

async function inspectImage(src) {
  const image = await loadImage(src);
  const canvas = document.createElement('canvas');
  const maxSide = 96;
  const scale = Math.min(1, maxSide / Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height));
  const width = Math.max(1, Math.round((image.naturalWidth || image.width) * scale));
  const height = Math.max(1, Math.round((image.naturalHeight || image.height) * scale));
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(image, 0, 0, width, height);
  const pixels = context.getImageData(0, 0, width, height).data;
  const buckets = new Map();
  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let totalLuma = 0;
  let totalSat = 0;
  let count = 0;
  for (let index = 0; index < pixels.length; index += 16) {
    const alpha = pixels[index + 3];
    if (alpha < 20) continue;
    const r = pixels[index];
    const g = pixels[index + 1];
    const b = pixels[index + 2];
    const luma = getLuma(r, g, b);
    const sat = getSaturation(r, g, b);
    totalR += r;
    totalG += g;
    totalB += b;
    totalLuma += luma;
    totalSat += sat;
    count += 1;
    if (luma > 244 || luma < 12) continue;
    const key = [r, g, b].map((value) => Math.round(value / 32) * 32).join(',');
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }
  const average = count ? [totalR / count, totalG / count, totalB / count].map(Math.round) : [245, 248, 252];
  const colors = [...buckets.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([key]) => rgbToHex(...key.split(',').map(Number)));
  if (!colors.length) colors.push(rgbToHex(...average));
  while (colors.length < 4) colors.push(['#f5f8fc', '#0d7be8', '#1d2530', '#ffffff'][colors.length]);
  const naturalWidth = image.naturalWidth || image.width;
  const naturalHeight = image.naturalHeight || image.height;
  const ratio = naturalWidth / naturalHeight;
  const avgLuma = count ? totalLuma / count : 230;
  const avgSat = count ? totalSat / count : 0.12;
  return {
    width: naturalWidth,
    height: naturalHeight,
    area: naturalWidth * naturalHeight,
    ratio,
    ratioLabel: `${ratio.toFixed(2)}:1`,
    orientation: ratio > 1.25 ? '桌面横屏' : ratio < 0.82 ? '移动端纵屏' : '近方形画面',
    colors: [...new Set(colors)],
    brightness: avgLuma,
    saturation: avgSat,
    brightnessLabel: avgLuma > 205 ? '明亮浅色' : avgLuma < 92 ? '深色高对比' : '中性明度',
  };
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function getLuma(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getSaturation(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max ? (max - min) / max : 0;
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0')).join('')}`;
}

function describePalette(metrics) {
  const [r, g, b] = hexToRgb(metrics.colors[0]);
  if (metrics.saturation < 0.12) return '低饱和灰阶';
  if (b > r + 18 && b > g - 8) return '冷调蓝灰';
  if (r > b + 28 && g > b + 8) return '暖调柔和';
  if (g > r + 10 && g > b + 10) return '自然绿色';
  return '克制中性色';
}

function hexToRgb(hex) {
  const value = String(hex || '#000000').replace('#', '').padEnd(6, '0').slice(0, 6);
  return [0, 2, 4].map((index) => parseInt(value.slice(index, index + 2), 16) || 0);
}

function extractKeywords(text) {
  const raw = String(text || '');
  const concepts = ['提示词库', '图片提示词', 'UI 分析', '上传截图', '本地保存', '导入导出', 'DeepSeek', '邮箱登录', '注册', '多工作区', '同步', '数据库', 'Figma', 'Codex'];
  const normalizedRaw = raw.toLowerCase().replace(/\s+/g, '');
  const hits = concepts.filter((concept) => normalizedRaw.includes(concept.toLowerCase().replace(/\s+/g, '')));
  const clean = raw.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]+/g, ' ');
  const words = clean.split(/\s+/).filter((word) => word.length >= 2);
  const preferred = words.filter((word) => /提示词|图片|UI|分析|上传|搜索|复制|登录|数据|导入|导出|本地|同步|Figma|Codex|DeepSeek/i.test(word));
  return [...new Set([...hits, ...preferred, ...words])].slice(0, 8);
}

function createPromptSetFromProfile(profile) {
  const cards = profile.cards.map((card) => `- ${card.title}：${card.body}`).join('\n');
  const palette = (profile.palette || ['#f5f8fc', '#0d7be8', '#1d2530']).join(' / ');
  const keywordLine = Array.isArray(profile.keywords) && profile.keywords.length ? `\n【识别关键词】\n${profile.keywords.join('、')}\n` : '';
  return {
    Codex: `请基于当前${profile.sourceType || '输入'}「${profile.sourceName || '参考素材'}」生成一个可运行的响应式网页 / App UI 原型。

【分析摘要】
${profile.title}
${keywordLine}

【视觉与结构规则】
${cards}

【颜色建议】
使用这些近似颜色作为设计起点：${palette}。请映射为页面背景、内容卡片、边框、主按钮、状态标签和正文文字层级。

【实现要求】
- 保留原始参考的布局比例、信息密度、留白节奏和主操作位置
- 做出完整可交互状态：搜索、筛选、复制、上传/输入、分析中、结果编辑、保存到提示词库
- 桌面端优先保证效率布局，移动端改为单列任务流
- 使用真实按钮、输入框、标签、卡片、弹窗和 toast 反馈
- 不要生成营销落地页，直接进入可用的产品工作台界面`,
    'Figma Make': `Create a responsive product UI based on this analyzed reference: ${profile.sourceName || 'uploaded UI source'}.

Analysis summary: ${profile.title}
${keywordLine}

Design rules:
${cards}

Palette: ${palette}

Build a usable prompt workbench rather than a marketing page. Preserve the reference's density, spacing rhythm, visual hierarchy, and primary action placement. Include upload/input states, analyzing state, editable generated prompt, copy feedback, save-to-library action, filters, cards, drawer/modal states, and responsive desktop-to-mobile behavior.`,
    通用: `根据「${profile.sourceName || '参考素材'}」规划一个可复用 UI 生成提示词。

分析结论：${profile.title}
${keywordLine}

重点规则：
${cards}

颜色方向：${palette}

生成时请保留参考图的信息密度、布局比例、留白节奏、组件状态和主操作路径。输出界面应包含上传/输入、分析中、结果编辑、复制、加入提示词库、筛选、卡片、弹窗与移动端适配。`,
  };
}

function togglePromptSelection(id) {
  if (!id) return;
  state.selectMode = true;
  state.selectedPromptIds = isPromptSelected(id)
    ? state.selectedPromptIds.filter((selectedId) => !samePromptId(selectedId, id))
    : [...state.selectedPromptIds, String(id)];
  render();
}

function formatFileSize(bytes) {
  if (!bytes) return '本地文件已添加';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function persistablePreview(preview) {
  return normalizePreviewSource(preview, referenceImages.defaultCover);
}

function handleAssetFile(file) {
  const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif)$/i.test(file.name);
  if (!isImage && !/\.(pdf|txt|md)$/i.test(file.name)) {
    showToast('仅支持图片、PDF、TXT 或 Markdown 文件', 'triangle-alert');
    return;
  }
  state.analysis.hasAsset = true;
  state.analysis.completed = false;
  state.analysis.saved = false;
  state.analysis.savedPromptId = null;
  state.analysis.note = file.name;
  state.analysis.assetName = file.name;
  state.analysis.assetMeta = `${file.type || '文件'} · ${formatFileSize(file.size)}`;
  state.analysis.assetIsImage = isImage;
  state.analysis.assetPreview = isImage ? URL.createObjectURL(file) : '';
  state.analysis.profile = createPendingAnalysisProfile(file.name);
  render();
  showToast(`已添加 ${file.name}`, 'image-plus');
  if (isImage && file.size <= 2 * 1024 * 1024) {
    const reader = new FileReader();
    reader.onload = () => {
      if (state.analysis.assetName !== file.name) return;
      state.analysis.assetPreview = String(reader.result || '');
      render();
    };
    reader.readAsDataURL(file);
  }
}

async function handleImportFile(file) {
  try {
    const text = await file.text();
    const raw = JSON.parse(text);
    if (Array.isArray(raw?.workspaces)) {
      importWorkspaceCatalog(raw.workspaces);
      return;
    }
    let records = Array.isArray(raw) ? raw : raw.prompts;
    if (raw?.schema === 'promptly.extension.backup.v1') {
      const seen = new Set();
      records = [...(Array.isArray(raw.historyCaptures) ? raw.historyCaptures : []), ...(Array.isArray(raw.queuedCaptures) ? raw.queuedCaptures : [])]
        .filter((capture) => {
          const key = String(capture?.id || `${capture?.title || ''}-${capture?.content || capture?.prompt || ''}`);
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      state.folders = [...new Set([...state.folders, '浏览器收集箱'])];
    }
    if (!Array.isArray(records)) throw new Error('invalid-format');
    if (Array.isArray(raw.folders)) state.folders = [...new Set([...state.folders, ...raw.folders.map(String)])];
    const imported = records.map((record, index) => normalizeImportedPrompt(record, index)).filter(Boolean);
    if (!imported.length) throw new Error('empty');
    state.prompts = [...imported, ...state.prompts];
    persistFolders();
    persistPrompts();
    render();
    showToast(`已导入 ${imported.length} 条提示词到「${getActiveWorkspace()?.name || '本地库'}」`, 'upload');
  } catch {
    showToast('导入失败，请选择有效的 JSON 文件', 'triangle-alert');
  }
}

function importWorkspaceCatalog(workspaces) {
  persistWorkspaceCatalog();
  const imported = workspaces
    .map((workspace, index) => normalizeWorkspace({
      ...workspace,
      id: `import-${Date.now()}-${index}`,
      name: uniqueWorkspaceName(workspace?.name || `导入页签 ${index + 1}`),
    }, state.workspaces.length + index))
    .filter((workspace) => workspace.prompts.length || workspace.folders.length);
  if (!imported.length) throw new Error('empty-workspaces');
  state.workspaces = [...state.workspaces, ...imported];
  state.workspaceId = imported[0].id;
  state.prompts = clonePrompts(imported[0].prompts);
  state.folders = [...imported[0].folders];
  state.search = '';
  state.libraryFilter = '全部';
  state.typeFilter = '全部类型';
  state.selectedTag = '';
  state.selectedPromptId = null;
  state.selectedPromptIds = [];
  state.selectMode = false;
  persistWorkspaceCatalog();
  render();
  showToast(`已导入 ${imported.length} 个本地页签`, 'upload');
}

function uniqueWorkspaceName(name) {
  const cleanName = String(name).trim() || '导入页签';
  if (!state.workspaces.some((workspace) => workspace.name === cleanName)) return cleanName;
  let count = 2;
  while (state.workspaces.some((workspace) => workspace.name === `${cleanName} ${count}`)) count += 1;
  return `${cleanName} ${count}`;
}

function normalizeImportedPrompt(record, index) {
  if (!record || typeof record !== 'object') return null;
  const title = String(record.title || record.name || `导入提示词 ${index + 1}`).trim();
  const prompt = String(record.prompt || record.content || record.description || '').trim();
  if (!prompt) return null;
  const type = normalizePromptType(record.type);
  const tags = normalizeTags(record.tags);
  return {
    id: `${Date.now()}-${index}`,
    createdAt: Date.now() + index,
    title,
    type,
    folder: state.folders.includes(record.folder) ? record.folder : (record.sourceTitle || record.sourceUrl ? '浏览器收集箱' : '未整理'),
    tags,
    status: '全部',
    updated: '刚刚',
    source: record.source || record.sourceTitle || '文件导入',
    sourceUrl: record.sourceUrl || '',
    preview: normalizePreviewSource(record.preview, referenceImages.defaultCover),
    prompt,
    favorite: Boolean(record.favorite),
  };
}

function exportPrompts() {
  const filename = `promptly-prompts-${new Date().toISOString().slice(0, 10)}`;
  const payload = {
    schema: 'promptly.local.v1',
    exportedAt: new Date().toISOString(),
    workspace: { id: state.workspaceId, name: getActiveWorkspace()?.name || '我的本地库' },
    folders: state.folders,
    prompts: state.prompts,
  };
  downloadFile(`${filename}-${state.workspaceId}.json`, JSON.stringify(payload, null, 2), 'application/json');
  showToast(`已导出 ${state.prompts.length} 条提示词为 JSON`, 'download');
}

function exportAllWorkspaces() {
  persistWorkspaceCatalog();
  const payload = {
    schema: 'promptly.catalog.v1',
    exportedAt: new Date().toISOString(),
    activeId: state.workspaceId,
    workspaces: state.workspaces,
  };
  const filename = `promptly-workspaces-${new Date().toISOString().slice(0, 10)}.json`;
  downloadFile(filename, JSON.stringify(payload, null, 2), 'application/json');
  showToast(`已导出 ${state.workspaces.length} 个本地页签`, 'download');
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function handleAction(action, element, event) {
  if (action === 'quick-capture') return openCaptureModal();
  if (action === 'open-account') return openAccountModal();
  if (action === 'open-workspaces') return openWorkspaceModal();
  if (action === 'toggle-theme') {
    state.dark = !state.dark;
    persistThemePreference();
    render();
    showToast(state.dark ? '已切换暗色模式' : '已切换浅色模式', state.dark ? 'moon' : 'sun');
    return;
  }
  if (action === 'import') {
    document.querySelector('#import-input')?.click();
    return;
  }
  if (action === 'export') {
    exportPrompts();
    return;
  }
  if (action === 'export-all') {
    exportAllWorkspaces();
    return;
  }
  if (action === 'select-mode') {
    state.selectMode = !state.selectMode;
    if (!state.selectMode) state.selectedPromptIds = [];
    render();
    showToast(state.selectMode ? '已进入批量选择模式' : '已退出批量选择模式', 'list-checks');
    return;
  }
  if (action === 'select-all') {
    const visibleIds = getFilteredPrompts().map((prompt) => String(prompt.id));
    const allSelected = visibleIds.length && visibleIds.every((id) => isPromptSelected(id));
    state.selectedPromptIds = allSelected ? state.selectedPromptIds.filter((id) => !visibleIds.includes(String(id))) : [...new Set([...state.selectedPromptIds.map(String), ...visibleIds])];
    render();
    return;
  }
  if (action === 'copy-selected') {
    const selected = state.prompts.filter((prompt) => isPromptSelected(prompt.id));
    if (!selected.length) return showToast('请先选择提示词', 'info');
    copyText(selected.map((prompt) => `${prompt.title}\n${sanitizePromptContent(prompt.prompt)}`).join('\n\n'), `已复制 ${selected.length} 条提示词`);
    return;
  }
  if (action === 'sort-prompts') {
    state.sortDirection = state.sortDirection === 'desc' ? 'asc' : 'desc';
    render();
    return;
  }
  if (action === 'new-folder') return openFolderModal();
  if (action === 'show-help') return showToast('⌘K 搜索 · ⌘Enter 复制 · N 新建', 'circle-help');
  if (action === 'clear-filters') {
    state.search = '';
    state.libraryFilter = '全部';
    state.typeFilter = '全部类型';
    state.selectedTag = '';
    render();
    return;
  }
  if (action === 'close-drawer') {
    state.selectedPromptId = null;
    state.drawerEditing = false;
    render();
    return;
  }
  if (action === 'delete-prompt') {
    const prompt = state.prompts.find((item) => samePromptId(item.id, state.selectedPromptId));
    if (!prompt) return;
    if (!window.confirm(`确定删除「${prompt.title}」吗？`)) return;
    state.prompts = state.prompts.filter((item) => !samePromptId(item.id, state.selectedPromptId));
    state.selectedPromptId = null;
    state.drawerEditing = false;
    persistPrompts();
    render();
    showToast('提示词已删除', 'trash-2');
    return;
  }
  if (action === 'edit-prompt') {
    const prompt = findPrompt(state.selectedPromptId);
    if (!prompt) return;
    if (!state.drawerEditing) {
      state.drawerEditing = true;
      render();
      document.querySelector('#drawer-editor')?.focus();
      return;
    }
    const editor = document.querySelector('#drawer-editor');
    const titleEditor = document.querySelector('#drawer-title');
    const coverPreview = document.querySelector('#drawer-cover-preview');
    const tagEditor = document.querySelector('#drawer-tags');
    const updatedPrompt = {
      ...prompt,
      title: titleEditor?.value.trim() || prompt.title,
      prompt: editor ? sanitizePromptContent(editor.value.trim()) || prompt.prompt : prompt.prompt,
      preview: coverPreview?.dataset.preview || prompt.preview,
      tags: tagEditor ? normalizeTags(tagEditor.value) : normalizeTags(prompt.tags),
      updated: '刚刚',
    };
    replacePrompt(updatedPrompt);
    state.drawerEditing = false;
    persistPrompts();
    render();
    showToast('提示词修改已保存', 'save');
    return;
  }
  if (action === 'toggle-mobile-sidebar') {
    document.querySelector('#sidebar')?.classList.toggle('is-mobile-open');
    return;
  }
  if (action === 'pick-asset') {
    document.querySelector('#asset-input')?.click();
    return;
  }
  if (action === 'use-sample') {
    const sample = element?.dataset.sample || referenceImages.mobile;
    state.analysis.hasAsset = true;
    state.analysis.assetPreview = sample;
    state.analysis.assetName = sample === referenceImages.mobile ? '移动端收集页参考图.png' : '提示词收集器参考图.png';
    state.analysis.assetMeta = '本地参考素材';
    state.analysis.assetIsImage = true;
    state.analysis.note = '';
    state.analysis.completed = false;
    state.analysis.saved = false;
    state.analysis.savedPromptId = null;
    state.analysis.profile = createPendingAnalysisProfile(state.analysis.assetName);
    render();
    showToast('已载入参考素材', 'image');
    return;
  }
  if (action === 'reset-analysis') {
    state.analysis = createAnalysisState({ hasAsset: false, assetPreview: '', assetName: '', assetMeta: '', assetIsImage: false, profile: createPendingAnalysisProfile('等待素材') });
    render();
    return;
  }
  if (action === 'toggle-result-expand') {
    syncAnalysisInputs();
    state.analysis.expanded = !state.analysis.expanded;
    render();
    return;
  }
  if (action === 'analyze') {
    syncAnalysisInputs();
    if (state.analysis.source === '截图' && !state.analysis.hasAsset) return showToast('请先添加截图或参考素材', 'image-plus');
    if (state.analysis.source !== '截图' && !state.analysis.note.trim()) return showToast(state.analysis.source === 'PRD' ? '请先粘贴 PRD 内容' : '请先输入原型链接', 'info');
    runAnalysis();
    return;
  }
  if (action === 'copy-analysis') {
    syncAnalysisInputs();
    copyText(getAnalysisContent(), '分析提示词已复制');
    return;
  }
  if (action === 'save-analysis') {
    syncAnalysisInputs();
    const content = getAnalysisContent();
    const title = state.analysis.source === '截图' ? `${state.analysis.assetName || '参考图'} UI 分析` : state.analysis.source === 'PRD' ? 'PRD UI 规划提示词' : '原型 UI 解析结果';
    const existing = state.prompts.find((prompt) => prompt.id === state.analysis.savedPromptId);
    if (existing) {
      existing.prompt = content;
      existing.title = title;
      existing.updated = '刚刚';
    } else {
      const id = Date.now();
      state.prompts.unshift({ id, createdAt: Date.now(), title, type: 'UI提示词', folder: '产品界面', tags: ['#UI 设计', '#截图分析'], status: '常用', updated: '刚刚', source: 'UI 分析', preview: persistablePreview(state.analysis.assetPreview), prompt: content, favorite: true });
      state.analysis.savedPromptId = id;
    }
    persistPrompts();
    state.analysis.saved = true;
    render();
    showToast(existing ? '已更新提示词库中的内容' : '已加入提示词库', 'bookmark-check');
    return;
  }
  if (action === 'clear-url') {
    state.analysis.note = '';
    render();
    return;
  }
  if (action === 'copy-env-template') {
    copyText(`DeepSeek 接入需要准备：
1. DEEPSEEK_API_KEY：在服务端环境变量保存，不放进前端代码
2. DEEPSEEK_BASE_URL：https://api.deepseek.com
3. DEEPSEEK_MODEL：deepseek-v4-flash
4. 后端接口：POST /api/analyze-ui
5. 输入字段：sourceType、prdText、prototypeUrl、image/OCRText、targetTool
6. 输出字段：summary、layout、colors、components、responsiveRules、prompt`, '已复制 DeepSeek 接入清单');
    return;
  }
  if (action === 'copy-schema-template') {
    copyText(`云端数据表草案：
users：id、email、created_at
workspaces：id、user_id、name、created_at、updated_at
folders：id、workspace_id、name、sort_order
prompts：id、workspace_id、folder_id、title、type、prompt、tags、source、source_url、preview_url、favorite、created_at、updated_at
assets：id、workspace_id、prompt_id、file_url、file_type、metadata、created_at
analysis_runs：id、workspace_id、source_type、input_snapshot、target_tool、output_prompt、created_at`, '已复制云端数据表草案');
  }
}

function openCaptureModal() {
  if (document.querySelector('.modal-backdrop')) return;
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.innerHTML = `
    <div class="prompt-modal capture-modal" role="dialog" aria-modal="true" aria-labelledby="capture-modal-title">
      <div class="modal-head"><div><span class="eyebrow">QUICK CAPTURE</span><h2 id="capture-modal-title">快速收录</h2></div><button class="icon-button" data-modal-action="close" title="关闭">${icon('x', 17)}</button></div>
      <div class="modal-body">
        <div class="capture-image-box" id="capture-image-box" aria-label="封面区域，粘贴图片后显示封面">
          <img id="capture-image-preview" alt="已添加封面" hidden />
          <button class="icon-button capture-image-remove" data-modal-action="remove-image" title="删除封面" hidden>${icon('trash-2', 14)}</button>
        </div>
        <div class="capture-title-row"><label class="field-label">标题<input id="capture-title" placeholder="可留空，让 AI 生成" /></label><button class="outline-button capture-ai-button" data-modal-action="ai-title">${icon('wand-sparkles', 14)}<span>AI 标题</span></button></div>
        <label class="field-label has-dropdown">类型${renderCustomSelect('capture-type', promptTypes, promptTypes[0], 'shapes')}</label>
        <label class="field-label">标签（可选）<input id="capture-tags" list="capture-tag-suggestions" placeholder="例如：UI 设计，参考图" /></label>
        <datalist id="capture-tag-suggestions">${getTagStats().map(({ tag }) => `<option value="${escapeAttr(tag.replace(/^#/, ''))}"></option>`).join('')}</datalist>
        <div class="field-hint">用逗号、顿号或竖线分隔；保存时自动补 # 并合并重复标签。</div>
        <label class="field-label">内容<textarea id="capture-body" placeholder="粘贴你想复用的提示词..."></textarea></label>
        <label class="field-label">来源链接（可选）<input id="capture-source" value="${escapeAttr(window.location.href)}" placeholder="https://..." /></label>
      </div>
      <div class="modal-actions capture-actions"><button class="outline-button" data-modal-action="copy">${icon('copy', 15)}<span>只复制</span></button><button class="primary-button" data-modal-action="save">${icon('bookmark-plus', 15)}<span>加入提示词库</span></button></div>
    </div>
  `;
  document.body.appendChild(modal);
  createIcons({ icons });
  const body = modal.querySelector('#capture-body');
  const title = modal.querySelector('#capture-title');
  const preview = modal.querySelector('#capture-image-preview');
  const removeImage = modal.querySelector('[data-modal-action="remove-image"]');
  const imageBox = modal.querySelector('#capture-image-box');
  const typeSelect = wireCustomSelect(modal.querySelector('[data-custom-select="capture-type"]'));
  let imageData = '';
  const updateImage = (value) => {
    imageData = value || '';
    if (imageData) preview.src = imageData;
    else preview.removeAttribute('src');
    preview.hidden = !imageData;
    removeImage.hidden = !imageData;
    imageBox.classList.toggle('has-image', Boolean(imageData));
  };
  const readCaptureImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return showToast('请选择图片文件', 'triangle-alert');
    if (file.size > 2 * 1024 * 1024) return showToast('图片请控制在 2MB 内', 'triangle-alert');
    const reader = new FileReader();
    reader.onload = () => updateImage(String(reader.result || ''));
    reader.readAsDataURL(file);
  };
  modal.querySelectorAll('[data-modal-action="close"]').forEach((button) => button.addEventListener('click', () => modal.remove()));
  modal.addEventListener('click', (event) => {
    if (!event.target.closest('.custom-select')) typeSelect.close();
  });
  modal.addEventListener('paste', (event) => {
    const item = [...(event.clipboardData?.items || [])].find((entry) => entry.type.startsWith('image/'));
    if (!item) return;
    const file = item.getAsFile();
    readCaptureImageFile(file);
    event.preventDefault();
  });
  removeImage.addEventListener('click', () => updateImage(''));
  modal.querySelector('[data-modal-action="ai-title"]')?.addEventListener('click', () => {
    const value = titleFromText(body.value || (imageData ? '图片灵感收录' : ''));
    title.value = value;
    showToast('已生成标题', 'wand-sparkles');
  });
  modal.querySelector('[data-modal-action="copy"]')?.addEventListener('click', () => {
    const content = sanitizePromptContent(body.value.trim());
    if (!content) return showToast('请先粘贴提示词文字', 'info');
    copyText(content, '提示词已复制');
  });
  modal.querySelector('[data-modal-action="save"]')?.addEventListener('click', () => {
    const content = sanitizePromptContent(body.value.trim());
    if (!content && !imageData) return showToast('请先粘贴文字或图片', 'info');
    const capture = {
      id: Date.now(),
      createdAt: Date.now(),
      type: normalizePromptType(modal.querySelector('#capture-type').value),
      title: title.value.trim(),
      content: content || '已粘贴参考图片',
      preview: imageData,
      tags: normalizeTags(modal.querySelector('#capture-tags').value, ['#手动收录']),
      sourceUrl: modal.querySelector('#capture-source').value.trim(),
      sourceTitle: document.title,
    };
    const prompt = promptFromCapture(capture);
    state.prompts.unshift(prompt);
    persistPrompts();
    modal.remove();
    state.libraryFilter = '浏览器收集箱';
    state.typeFilter = '全部类型';
    state.view = 'library';
    render();
    showToast('已加入浏览器收集箱', 'bookmark-check');
  });
  body.focus();
}

function openAccountModal() {
  if (document.querySelector('.modal-backdrop')) return;
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  const account = state.account;
  modal.innerHTML = `
    <div class="prompt-modal account-modal" role="dialog" aria-modal="true" aria-labelledby="account-modal-title">
      <div class="modal-head"><div><span class="eyebrow">SYNC ACCOUNT</span><h2 id="account-modal-title">${account ? '同步账号' : '邮箱登录'}</h2></div><button class="icon-button" data-modal-action="close" title="关闭">${icon('x', 17)}</button></div>
      <div class="modal-body">
        ${account ? `<div class="account-state"><div class="account-avatar">${escapeHtml(account.email.slice(0, 1).toUpperCase())}</div><div><strong>${escapeHtml(account.email)}</strong><span>已开启跨设备同步</span></div></div><div class="sync-callout">${icon('cloud-check', 17)}<span>提示词会先保存在本机，登录后可同步到你的账号。</span></div>` : `<p class="capture-helper">用邮箱登录后，浏览器收录和提示词库可以在不同设备继续使用。</p><label class="field-label">邮箱地址<input id="account-email" type="email" autocomplete="email" placeholder="name@example.com" /></label><div class="login-note">首版先验证登录流程，接入真实验证码和云端存储后即可跨设备同步。</div>`}
      </div>
      <div class="modal-actions">${account ? `<button class="outline-button" data-modal-action="logout">${icon('log-out', 15)}<span>退出登录</span></button><button class="primary-button" data-modal-action="close">完成</button>` : `<button class="outline-button" data-modal-action="close">稍后登录</button><button class="primary-button" data-modal-action="login">${icon('mail-check', 15)}<span>登录并同步</span></button>`}</div>
    </div>
  `;
  document.body.appendChild(modal);
  createIcons({ icons });
  modal.querySelectorAll('[data-modal-action="close"]').forEach((button) => button.addEventListener('click', () => modal.remove()));
  modal.querySelector('[data-modal-action="login"]')?.addEventListener('click', () => {
    const email = modal.querySelector('#account-email').value.trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) return showToast('请输入有效的邮箱地址', 'triangle-alert');
    state.account = { email, loggedInAt: new Date().toISOString() };
    persistAccount();
    modal.remove();
    render();
    showToast('已登录，提示词会自动同步', 'cloud-check');
  });
  modal.querySelector('[data-modal-action="logout"]')?.addEventListener('click', () => {
    state.account = null;
    persistAccount();
    modal.remove();
    render();
    showToast('已退出登录，提示词仍保存在本机', 'log-out');
  });
  modal.querySelector('#account-email')?.focus();
}

function switchWorkspace(id) {
  const next = state.workspaces.find((workspace) => workspace.id === id);
  if (!next || next.id === state.workspaceId) return;
  persistWorkspaceCatalog();
  state.workspaceId = next.id;
  state.prompts = clonePrompts(next.prompts);
  state.folders = [...next.folders];
  state.search = '';
  state.libraryFilter = '全部';
  state.typeFilter = '全部类型';
  state.selectedTag = '';
  state.selectedPromptId = null;
  state.selectedPromptIds = [];
  state.selectMode = false;
  state.drawerEditing = false;
  persistWorkspaceCatalog();
  render();
  showToast(`已切换到本地页签「${next.name}」`, 'layers-2');
}

function openWorkspaceModal() {
  if (document.querySelector('.modal-backdrop')) return;
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.innerHTML = `
    <div class="prompt-modal workspace-modal" role="dialog" aria-modal="true" aria-labelledby="workspace-modal-title">
      <div class="modal-head"><div><span class="eyebrow">LOCAL WORKSPACES</span><h2 id="workspace-modal-title">本地数据页签</h2></div><button class="icon-button" data-modal-action="close" title="关闭">${icon('x', 17)}</button></div>
      <div class="modal-body">
        <p class="workspace-hint">每个页签独立保存在此浏览器本机。导出 JSON 后，可以带到另一台设备继续使用。</p>
        <div class="workspace-list">
          ${state.workspaces.map((workspace) => `<div class="workspace-option-row"><button class="workspace-option ${workspace.id === state.workspaceId ? 'is-selected' : ''}" data-workspace-id="${escapeAttr(workspace.id)}"><span class="workspace-option-icon">${icon(workspace.id === state.workspaceId ? 'check' : 'layers-2', 15)}</span><span><strong>${escapeHtml(workspace.name)}</strong><small>${workspace.prompts.length} 条提示词</small></span>${workspace.id === state.workspaceId ? `<em>当前</em>` : ''}</button>${workspace.id !== state.workspaceId && state.workspaces.length > 1 ? `<button class="workspace-delete" data-delete-workspace="${escapeAttr(workspace.id)}" title="删除 ${escapeAttr(workspace.name)}">${icon('trash-2', 14)}</button>` : ''}</div>`).join('')}
        </div>
        <label class="field-label">新建本地页签<input id="workspace-name" placeholder="例如：旅行灵感、项目 A、个人收藏" /></label>
      </div>
      <div class="modal-actions"><button class="outline-button" data-modal-action="close">关闭</button><button class="primary-button" data-modal-action="create">${icon('plus', 15)}<span>创建页签</span></button></div>
    </div>
  `;
  document.body.appendChild(modal);
  createIcons({ icons });
  modal.querySelectorAll('[data-modal-action="close"]').forEach((button) => button.addEventListener('click', () => modal.remove()));
  modal.querySelectorAll('[data-workspace-id]').forEach((button) => button.addEventListener('click', () => {
    const id = button.dataset.workspaceId;
    modal.remove();
    switchWorkspace(id);
  }));
  modal.querySelectorAll('[data-delete-workspace]').forEach((button) => button.addEventListener('click', (event) => {
    event.stopPropagation();
    const id = button.dataset.deleteWorkspace;
    const workspace = state.workspaces.find((item) => item.id === id);
    if (!workspace || !window.confirm(`确定删除本地页签「${workspace.name}」吗？`)) return;
    state.workspaces = state.workspaces.filter((item) => item.id !== id);
    persistWorkspaceCatalog();
    modal.remove();
    render();
    showToast(`已删除本地页签「${workspace.name}」`, 'trash-2');
  }));
  modal.querySelector('[data-modal-action="create"]')?.addEventListener('click', () => {
    const name = modal.querySelector('#workspace-name').value.trim();
    if (!name) return showToast('请输入本地页签名称', 'info');
    if (state.workspaces.some((workspace) => workspace.name === name)) return showToast('本地页签已存在', 'triangle-alert');
    const workspace = normalizeWorkspace({ id: `local-${Date.now()}`, name, prompts: [], folders: ['产品界面', '图片风格', '未整理'] }, state.workspaces.length);
    state.workspaces.push(workspace);
    modal.remove();
    switchWorkspace(workspace.id);
  });
  modal.querySelector('#workspace-name')?.focus();
}

function openFolderModal() {
  if (document.querySelector('.modal-backdrop')) return;
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.innerHTML = `
    <div class="prompt-modal folder-modal" role="dialog" aria-modal="true" aria-labelledby="folder-modal-title">
      <div class="modal-head"><div><span class="eyebrow">NEW FOLDER</span><h2 id="folder-modal-title">新建文件夹</h2></div><button class="icon-button" data-modal-action="close" title="关闭">${icon('x', 17)}</button></div>
      <div class="modal-body"><label class="field-label">文件夹名称<input id="folder-name" placeholder="例如：待整理灵感" /></label></div>
      <div class="modal-actions"><button class="outline-button" data-modal-action="close">取消</button><button class="primary-button" data-modal-action="save">${icon('folder-plus', 15)}<span>创建文件夹</span></button></div>
    </div>
  `;
  document.body.appendChild(modal);
  createIcons({ icons });
  modal.querySelectorAll('[data-modal-action="close"]').forEach((button) => button.addEventListener('click', () => modal.remove()));
  modal.querySelector('[data-modal-action="save"]')?.addEventListener('click', () => {
    const name = modal.querySelector('#folder-name').value.trim();
    if (!name) return showToast('请输入文件夹名称', 'info');
    if (state.folders.includes(name)) return showToast('文件夹已存在', 'triangle-alert');
    state.folders.push(name);
    persistFolders();
    modal.remove();
    render();
    showToast(`已创建文件夹「${name}」`, 'folder-plus');
  });
  modal.querySelector('#folder-name')?.focus();
}

async function copyText(value, message) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const helper = document.createElement('textarea');
    helper.value = value;
    document.body.appendChild(helper);
    helper.select();
    document.execCommand('copy');
    helper.remove();
  }
  showToast(message, 'copy');
}

function showToast(message, iconName = 'check') {
  const region = document.querySelector('.toast-region');
  if (!region) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `${icon(iconName, 16)}<span>${message}</span>`;
  region.appendChild(toast);
  createIcons({ icons });
  window.setTimeout(() => toast.classList.add('is-leaving'), 2200);
  window.setTimeout(() => toast.remove(), 2600);
}

let motionFrame = 0;

function updateMotionState() {
  const topbar = document.querySelector('.topbar');
  const progressBar = document.querySelector('.scroll-progress span');
  const root = document.documentElement;
  const scrollTop = window.scrollY || root.scrollTop || 0;
  const scrollMax = Math.max(0, root.scrollHeight - window.innerHeight);
  const progress = scrollMax ? Math.min(1, Math.max(0, scrollTop / scrollMax)) : 0;
  topbar?.classList.toggle('is-scrolled', scrollTop > 12);
  if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
}

function requestMotionStateUpdate() {
  if (motionFrame) return;
  motionFrame = window.requestAnimationFrame(() => {
    motionFrame = 0;
    updateMotionState();
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, '&#096;');
}

document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    document.querySelector('#global-search')?.focus();
  }
  if (event.key.toLowerCase() === 'n' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) openCaptureModal();
  if (event.key === 'Escape' && state.selectedPromptId) {
    state.selectedPromptId = null;
    render();
  }
});

window.addEventListener('error', (event) => {
  const image = event.target;
  if (!(image instanceof HTMLImageElement) || !image.dataset.fallbackSrc || image.dataset.fallbackApplied) return;
  image.dataset.fallbackApplied = 'true';
  image.src = image.dataset.fallbackSrc;
}, true);

window.addEventListener('scroll', requestMotionStateUpdate, { passive: true });
window.addEventListener('resize', requestMotionStateUpdate);

window.addEventListener('message', (event) => {
  if (event.source !== window || event.data?.source !== 'promptly-extension') return;
  if (event.data.type === 'queued-captures') importExtensionCaptures(event.data.captures);
});

window.addEventListener('storage', (event) => {
  if (event.key !== workspaceStorageKey || !event.newValue) return;
  if (state.drawerEditing) {
    showToast('检测到其他标签有更新，请保存当前编辑后刷新同步', 'info');
    return;
  }
  try {
    applyWorkspaceCatalogSnapshot(JSON.parse(event.newValue), { toast: true });
  } catch {
    // Ignore malformed storage updates from older local builds.
  }
});

render();
window.postMessage({ source: 'promptly-app', type: 'ready' }, window.location.origin);
if (state.incomingCapture) {
  state.incomingCapture = false;
  showToast('已从浏览器收录到收集箱', 'bookmark-check');
}
