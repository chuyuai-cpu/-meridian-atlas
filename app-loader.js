(() => {
  'use strict';

  const showLoadError = (error) => {
    console.error(error);
    const canvas = document.querySelector('#glCanvas');
    const fallback = document.querySelector('#fallback2d');
    if (canvas) canvas.hidden = true;
    if (fallback) {
      fallback.hidden = false;
      const head = fallback.querySelector('.fallback-head');
      if (head) {
        head.innerHTML = '<strong>应用模块加载失败</strong><span>请刷新页面或检查网络连接</span>';
      }
    }
  };

  const loadScript = (src) => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`无法加载 ${src}`));
    document.head.appendChild(script);
  });

  loadScript('./data.js')
    .then(() => loadScript('./app.js'))
    .catch(showLoadError);
})();
