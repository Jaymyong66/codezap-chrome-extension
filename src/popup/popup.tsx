import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import config from '../../config';

const Popup = () => {
  const [userInfo, setUserInfo] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    chrome.storage.local.get(['userInfo'], (result) => {
      if (result.userInfo) {
        setUserInfo(result.userInfo);
      }
    });
  }, []);

  const handleLogin = async () => {
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
        setUserInfo(userInfo);
        alert('로그인에 성공했어요!');
      } else {
        alert('로그인에 실패했어요. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('Login error: ', error);
      alert('잠시 후 다시 시도해주세요.');
    }
  };

  const handleLogout = async () => {
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
          setUserInfo(null);
          alert('로그아웃 성공!');
        });
      } else {
        alert('로그아웃에 실패했어요. 잠시 후 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('Logout error: ', error);
      alert('로그아웃에 실패했어요. 잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <div>
      {userInfo ? (
        <div id='welcome-message'>
          <h2>코드잽 익스텐션</h2>
          <p>원하는 소스코드를 드래그 후 우클릭하여 업로드해보세요 :)</p>
          <button id='logout-button' onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : (
        <div id='login-form'>
          <h2>로그인</h2>
          <input
            id='name'
            type='text'
            placeholder='아이디'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            id='password'
            type='password'
            placeholder='비밀번호'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button id='login-button' onClick={handleLogin}>
            로그인
          </button>
        </div>
      )}
    </div>
  );
};

document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('root');
  console.log('here2', rootElement);

  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<Popup />);
  }
});
