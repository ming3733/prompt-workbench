const APP_URL = 'https://ming3733.github.io/prompt-workbench/';
const PENDING_CAPTURE_KEY = 'promptly-pending-capture-v1';
const QUEUED_CAPTURES_KEY = 'promptly-queued-captures-v1';
const POPUP_WINDOW = { width: 380, height: 640 };
const WORKBENCH_MATCHES = [
  'http://localhost:5197/*',
  'http://127.0.0.1:5197/*',
  'https://ming3733.github.io/prompt-workbench*',
];

function createMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'promptly-root',
      title: '小明提示词收录',
      contexts: ['selection', 'image', 'page'],
    });
    chrome.contextMenus.create({
      id: 'promptly-selection',
      parentId: 'promptly-root',
      title: '编辑并收录选中文字',
      contexts: ['selection'],
    });
    chrome.contextMenus.create({
      id: 'promptly-image',
      parentId: 'promptly-root',
      title: '编辑并收录这张图片',
      contexts: ['image'],
    });
    chrome.contextMenus.create({
      id: 'promptly-page',
      parentId: 'promptly-root',
      title: '编辑并收录当前网页',
      contexts: ['page'],
    });
  });
}

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

async function getSelection(tabId) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => window.getSelection()?.toString().trim() || '',
    });
    return results?.[0]?.result || '';
  } catch {
    return '';
  }
}

function compactTitle(value, fallback = '网页收录') {
  const firstLine = String(value || '')
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/\s+/g, ' '))
    .find(Boolean);
  const text = firstLine || fallback;
  return text.length > 24 ? `${text.slice(0, 24)}…` : text;
}

function captureFromTab(tab, content, overrides = {}) {
  const captureTitle = overrides.title || (content ? compactTitle(content) : compactTitle(tab.title, '网页收录'));
  return {
    id: `browser-${Date.now()}`,
    kind: 'text',
    type: 'UI提示词',
    title: compactTitle(captureTitle),
    content,
    sourceTitle: tab.title || '浏览器收录',
    sourceUrl: tab.url || '',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

async function openCapturePopup(capture) {
  await chrome.storage.local.set({
    [PENDING_CAPTURE_KEY]: {
      ...capture,
      pendingAt: Date.now(),
    },
  });
  return chrome.windows.create({
    url: chrome.runtime.getURL('popup.html?capture=context-menu'),
    type: 'popup',
    focused: true,
    ...POPUP_WINDOW,
  });
}

function getStored(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (result) => resolve(result?.[key]));
  });
}

function setStored(value) {
  return new Promise((resolve) => {
    chrome.storage.local.set(value, resolve);
  });
}

async function queueCapture(capture) {
  const queue = await getStored(QUEUED_CAPTURES_KEY);
  const captures = Array.isArray(queue) ? queue : [];
  await setStored({ [QUEUED_CAPTURES_KEY]: [...captures, capture] });
}

function queryWorkbenchTabs() {
  return new Promise((resolve) => {
    chrome.tabs.query({ url: WORKBENCH_MATCHES }, (tabs) => resolve(Array.isArray(tabs) ? tabs : []));
  });
}

function sendFlushMessage(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, { type: 'promptly-flush-queue' }, () => {
      if (!chrome.runtime.lastError) return resolve(true);
      chrome.scripting.executeScript({ target: { tabId }, files: ['content-script.js'] }, () => {
        if (chrome.runtime.lastError) return resolve(false);
        chrome.tabs.sendMessage(tabId, { type: 'promptly-flush-queue' }, () => resolve(!chrome.runtime.lastError));
      });
    });
  });
}

async function notifyWorkbenchTabs() {
  const tabs = await queryWorkbenchTabs();
  const results = await Promise.all(tabs.filter((tab) => tab.id).map((tab) => sendFlushMessage(tab.id)));
  return results.some(Boolean);
}

async function openWorkbenchIfNeeded() {
  const tabs = await queryWorkbenchTabs();
  const existingTab = tabs.find((tab) => tab.id);
  if (existingTab) {
    await chrome.tabs.update(existingTab.id, { active: true });
    if (existingTab.windowId) await chrome.windows.update(existingTab.windowId, { focused: true });
    return tabs;
  }
  const tab = await chrome.tabs.create({ url: APP_URL, active: true });
  return tab ? [tab] : [];
}

async function deliverCaptureQueue() {
  const delivered = await notifyWorkbenchTabs();
  if (!delivered) await openWorkbenchIfNeeded();
}

async function collectCurrentTab(customCapture = null) {
  const tab = await getActiveTab();
  if (customCapture) {
    const sourceTab = {
      title: customCapture.sourceTitle || tab?.title || '浏览器收录',
      url: customCapture.sourceUrl || tab?.url || '',
    };
    const capture = captureFromTab(sourceTab, customCapture.content || '', {
      ...customCapture,
      id: customCapture.id || `browser-${Date.now()}`,
      title: customCapture.title || compactTitle(customCapture.content || sourceTab.title, '网页收录'),
      sourceTitle: sourceTab.title || '浏览器收录',
      sourceUrl: sourceTab.url || '',
    });
    await queueCapture(capture);
    await deliverCaptureQueue();
    return { ok: true, capture, queued: true };
  }
  if (!tab?.id) return { ok: false, message: '没有找到当前网页' };
  const selection = await getSelection(tab.id);
  const capture = captureFromTab(tab, selection, selection ? {} : {
    content: `网页标题：${tab.title || '未命名网页'}\n网页地址：${tab.url || ''}`,
    title: compactTitle(tab.title, '网页收录'),
  });
  await openCapturePopup(capture);
  return { ok: true, capture };
}

async function handleContextClick(info, tab) {
  if (!tab) return;
  if (info.menuItemId === 'promptly-selection') {
    await openCapturePopup(captureFromTab(tab, info.selectionText?.trim() || ''));
    return;
  }
  if (info.menuItemId === 'promptly-image') {
    await openCapturePopup(captureFromTab(tab, `图片来源：${info.srcUrl || ''}`, {
      kind: 'image',
      type: '图片提示词',
      title: '网页参考图片',
      preview: info.srcUrl || '',
    }));
    return;
  }
  if (info.menuItemId === 'promptly-page') {
    await openCapturePopup(captureFromTab(tab, `网页标题：${tab.title || '未命名网页'}\n网页地址：${tab.url || ''}`, {
      title: compactTitle(tab.title, '网页收录'),
    }));
  }
}

chrome.runtime.onInstalled.addListener(createMenus);
chrome.runtime.onStartup.addListener(createMenus);
chrome.contextMenus.onClicked.addListener((info, tab) => {
  handleContextClick(info, tab).catch(() => {});
});
chrome.commands.onCommand.addListener((command) => {
  if (command === 'collect-selection') collectCurrentTab().catch(() => {});
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'active-context') {
    getActiveTab().then(async (tab) => {
      if (!tab?.id) return sendResponse({ ok: false });
      const selection = await getSelection(tab.id);
      sendResponse({ ok: true, title: tab.title || '', url: tab.url || '', selection });
    }).catch(() => sendResponse({ ok: false }));
    return true;
  }
  if (message?.type === 'collect-current') {
    collectCurrentTab(message.capture || null).then(sendResponse).catch(() => sendResponse({ ok: false, message: '收录失败' }));
    return true;
  }
  if (message?.type === 'open-workbench') {
    openWorkbenchIfNeeded().then(() => sendResponse({ ok: true })).catch(() => sendResponse({ ok: false }));
    return true;
  }
  return false;
});
