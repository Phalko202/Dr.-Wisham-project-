// background.js - Simple service worker for HMH Lab Extension

// Open dashboard when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({
    url: chrome.runtime.getURL('dashboard.html')
  });
});
