const statusEl = document.getElementById('status');
const setStatus = (m) => (statusEl.textContent = `Status: ${m}`);

document.getElementById('open').addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error('No active tab');
    await chrome.sidePanel.open({ tabId: tab.id });
    setStatus('Side panel opened.');
  } catch (e) {
    setStatus(e?.message || String(e));
  }
});

document.getElementById('options').addEventListener('click', async () => {
  await chrome.runtime.openOptionsPage();
});
