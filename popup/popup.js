import config from '../config';

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['userInfo'], (result) => {
    const userInfo = result.userInfo;
    const welcomeMessage = document.getElementById('welcome-message');
    const loginForm = document.getElementById('login-form');
    const logoutButton = document.getElementById('logout-button');

    if (userInfo) {
      welcomeMessage.style.display = 'block';
      logoutButton.style.display = 'block';
    } else {
      loginForm.style.display = 'block';
    }
  });
});

document.getElementById('login-button').addEventListener('click', async () => {
  const name = document.getElementById('name').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch(`${config.API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, password }),
      credentials: 'include',
    });

    if (response.ok) {
      const userInfo = await response.json();
      chrome.storage.local.set({ userInfo });
      alert('로그인에 성공했어요!');
      document.getElementById('welcome-message').style.display = 'block';
      document.getElementById('logout-button').style.display = 'block';
      document.getElementById('login-form').style.display = 'none';
    } else {
      alert('로그인에 실패했어요. 다시 시도해주세요.');
    }
  } catch (error) {
    console.error('Login error: ', error);
    alert('잠시 후 다시 시도해주세요.');
  }
});

document.getElementById('logout-button').addEventListener('click', async () => {
  try {
    const response = await fetch(`${config.API_BASE_URL}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (response.ok) {
      chrome.storage.local.remove('userInfo', () => {
        alert('로그아웃 성공!');
        document.getElementById('welcome-message').style.display = 'none';
        document.getElementById('logout-button').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
      });
    } else {
      alert('로그아웃에 실패했어요. 잠시 후 다시 시도해주세요.');
    }
  } catch (error) {
    console.error('Logout error: ', error);
    alert('로그아웃에 실패했어요. 잠시 후 다시 시도해주세요.');
  }
});
