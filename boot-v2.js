(async () => {
  try {
    await import('./app-v2.js');
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
