const QUEUED_CAPTURES_KEY = 'promptly-queued-captures-v1';
const EXTENSION_SOURCE = 'promptly-extension';
const APP_SOURCE = 'promptly-app';

function getQueue(callback) {
  chrome.storage.local.get(QUEUED_CAPTURES_KEY, (result) => {
    const queue = result?.[QUEUED_CAPTURES_KEY];
    callback(Array.isArray(queue) ? queue : []);
  });
}

function setQueue(queue) {
  chrome.storage.local.set({ [QUEUED_CAPTURES_KEY]: queue });
}

function flushQueue() {
  getQueue((queue) => {
    if (!queue.length) return;
    window.postMessage({
      source: EXTENSION_SOURCE,
      type: 'queued-captures',
      captures: queue,
    }, window.location.origin);
  });
}

function removeImportedCaptures(ids = []) {
  const importedIds = new Set(ids.map(String));
  if (!importedIds.size) return;
  getQueue((queue) => {
    setQueue(queue.filter((capture) => !importedIds.has(String(capture.id))));
  });
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'promptly-flush-queue') return false;
  flushQueue();
  sendResponse({ ok: true });
  return false;
});

window.addEventListener('message', (event) => {
  if (event.source !== window || event.data?.source !== APP_SOURCE) return;
  if (event.data.type === 'ready') flushQueue();
  if (event.data.type === 'captures-imported') removeImportedCaptures(event.data.ids);
});

window.setTimeout(flushQueue, 300);
window.setTimeout(flushQueue, 1200);
window.setTimeout(flushQueue, 2600);
