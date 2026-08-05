(() => {
  const baseUrl = new URL('./', document.currentScript?.src || location.href);
  (async () => {
    try {
      const partUrls = Array.from({ length: 8 }, (_, index) => new URL(`app-v2.parts/part-${String(index).padStart(2, '0')}.txt`, baseUrl));
      const responses = await Promise.all(partUrls.map((url) => fetch(url, { cache: 'force-cache' })));
      const failed = responses.find((response) => !response.ok);
      if (failed) throw new Error(`渲染模块下载失败：${failed.status}`);
      let source = (await Promise.all(responses.map((response) => response.text()))).join('');
      const dataUrl = new URL('data-v2.js', baseUrl).href;
      source = source.replace("from './data-v2.js';", `from '${dataUrl}';`);
      const moduleUrl = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
      try {
        await import(moduleUrl);
      } finally {
        URL.revokeObjectURL(moduleUrl);
      }
    } catch (error) {
      console.error('Meridian Atlas V2 failed to start:', error);
      const canvas = document.querySelector('#glCanvas');
      const fallback = document.querySelector('#fallback2d');
      if (canvas) canvas.hidden = true;
      if (fallback) fallback.hidden = false;
      const message = document.querySelector('#fallbackMessage');
      if (message) message.textContent = `3D 模块加载失败：${error?.message || '未知错误'}。可检查浏览器硬件加速或网络后刷新。`;
    }
  })();
})();
