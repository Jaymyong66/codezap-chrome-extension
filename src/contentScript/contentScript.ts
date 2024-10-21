// 익스텐션과 로그인 동기화
chrome.runtime.sendMessage({ action: 'pageLoaded' });
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'sendUserInfo') {
    const { memberId, name } = message;
    localStorage.setItem('memberId', memberId);
    localStorage.setItem('name', name);
  }
});
