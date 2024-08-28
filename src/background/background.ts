import { getStoredSourceCodes, setStoredSourceCodes } from '../utils/storage';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'uploadToCodeZap',
    title: '코드잽에 소스코드 업로드하기',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener((event) => {
  if (event.menuItemId === 'uploadToCodeZap' && event.selectionText) {
    getStoredSourceCodes().then((codes) => {
      setStoredSourceCodes([...codes, event.selectionText]);
    });
  }
});
