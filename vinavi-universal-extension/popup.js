function openExtPage(relPath) {
  const url = chrome.runtime.getURL(relPath);
  chrome.tabs.create({ url });
  window.close();
}

document.getElementById('openQuick')?.addEventListener('click', () => {
  openExtPage('quicktext/dashboard_new.html');
});

document.getElementById('openLab')?.addEventListener('click', () => {
  openExtPage('lab/dashboard.html');
});

document.getElementById('openSave')?.addEventListener('click', () => {
  openExtPage('save.html');
});
