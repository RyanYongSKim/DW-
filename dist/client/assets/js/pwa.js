(() => {
  'use strict';

  const installButton = document.querySelector('#install-app');
  let installPrompt = null;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    installPrompt = event;
    if (installButton) installButton.hidden = false;
  });

  installButton?.addEventListener('click', async () => {
    if (!installPrompt) return;
    installButton.disabled = true;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    installButton.hidden = true;
    installButton.disabled = false;
  });

  window.addEventListener('appinstalled', () => {
    installPrompt = null;
    if (installButton) installButton.hidden = true;
  });

  if ('serviceWorker' in navigator && window.isSecureContext) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js').catch((error) => {
        console.warn('앱 바로가기 기능을 준비하지 못했습니다.', error);
      });
    });
  }
})();
