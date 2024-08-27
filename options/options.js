document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['userInfo'], (result) => {
    const userInfoDiv = document.getElementById('user-info');
    if (result.userInfo) {
      userInfoDiv.textContent = `Logged in as: ${result.userInfo.name}`;
    } else {
      userInfoDiv.textContent = 'No user info available.';
    }
  });
});
