import { getStoredSourceCodes, setStoredSourceCodes } from '../utils/storage';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'uploadToCodeZap',
    title: '코드잽에 소스코드 업로드하기',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'uploadToCodeZap' && info.selectionText) {
    // info.selectionText를 그대로 쓰면 개행이 없음. executeScript로 getSelection() 활용
    chrome.scripting
      .executeScript({
        target: { tabId: tab.id },
        func: () => window.getSelection().toString(),
      })
      .then((selectionArray) => {
        const selectedText = selectionArray[0]?.result || '';

        if (selectedText) {
          getStoredSourceCodes().then((codes) => {
            setStoredSourceCodes([...codes, selectedText]);
          });
        }
      });
  }
});
