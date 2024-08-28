import config from './config';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'uploadToCodeZap',
    title: '코드잽에 소스코드 업로드하기',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'uploadToCodeZap' && info.selectionText) {
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        func: () => window.getSelection().toString(),
      },
      (selectionArray) => {
        const selectedText = selectionArray[0]?.result || '';

        if (selectedText) {
          chrome.storage.local.get(['userInfo'], (result) => {
            if (result.userInfo) {
              fetch(`${config.API_BASE_URL}/templates`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                  title: '제목없음',
                  description: '코드짱의 코드 템플릿',
                  sourceCodes: [
                    {
                      filename: 'example.java',
                      content: selectedText,
                      ordinal: 1,
                    },
                  ],
                  thumbnailOrdinal: 1,
                  categoryId: 115,
                  tags: [],
                }),
              }).then((response) => {
                console.log('response', response);
                if (response.ok) {
                  chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icons/icon48.png',
                    title: '코드잽',
                    message: '소스코드 업로드가 성공했어요!',
                  });
                } else {
                  chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icons/icon48.png',
                    title: '코드잽',
                    message:
                      '소스코드 업로드에 실패했어요. 잠시 후 다시 시도해주세요',
                  });
                }
              });
            } else {
              chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: '코드잽',
                message: '로그인을 해주세요',
              });
            }
          });
        }
      }
    );
  }
});
