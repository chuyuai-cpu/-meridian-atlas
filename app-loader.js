(async () => {
  'use strict';
  const parts = Array.from({ length: 8 }, (_, i) => `./app-parts/part-${String(i).padStart(2, '0')}.b64`);
  try {
    const responses = await Promise.all(parts.map((url) => fetch(url, { cache: 'force-cache' })));
    for (const response of responses) {
      if (!response.ok) throw new Error(`应用模块加载失败：${response.url} (${response.status})`);
    }
    const encoded = (await Promise.all(responses.map((response) => response.text()))).join('').replace(/\s+/g, '');
    const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
    const source = new TextDecoder('utf-8').decode(bytes);
    Function(`${source}\n//# sourceURL=meridian-atlas-app.js`)();
  } catch (error) {
    console.error(error);
    const fallback = document.querySelector('#fallback2d');
    const canvas = document.querySelector('#glCanvas');
    if (canvas) canvas.hidden = true;
    if (fallback) {
      fallback.hidden = false;
      const head = fallback.querySelector('.fallback-head');
      if (head) head.innerHTML = '<strong>应用模块加载失败</strong><span>请刷新页面或检查网络连接</span>';
    }
  }
})();
