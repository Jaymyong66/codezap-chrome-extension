import { getStoredSourceCodes, setStoredSourceCodes } from '../utils/storage';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'pageLoaded') {
    chrome.storage.local.get('userInfo', ({ userInfo }) => {
      const { memberId, name } = userInfo;

      if (memberId && name) {
        chrome.tabs.sendMessage(sender.tab.id, {
          action: 'sendUserInfo',
          memberId,
          name,
        });
      } else {
        console.warn('memberId 또는 name이 저장되어 있지 않습니다.');
      }
    });
  }
});

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
            setStoredSourceCodes([...codes, selectedText]).then(() => {
              chrome.action.openPopup();
            });
          });
        }
      });
  }
});
