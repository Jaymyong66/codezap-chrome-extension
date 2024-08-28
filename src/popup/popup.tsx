import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import LoginForm from '../components/LoginForm';
import Logout from '../components/Logout';
import {
  loginUser,
  logoutUser,
  fetchCategories,
  Category,
  UserInfo,
} from '../utils/api';

const Popup = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>(undefined);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    chrome.storage.local.get(['userInfo'], (result) => {
      if (result.userInfo) {
        setUserInfo(result.userInfo);
        loadCategories(result.userInfo.memberId);
      }
    });
  }, []);

  const loadCategories = async (memberId: number) => {
    try {
      const data = await fetchCategories(memberId);
      setCategories(data.categories);
      chrome.storage.local.set({ categories: data.categories });
    } catch (error) {
      console.error('카테고리를 가져오는데 실패했어요:', error);
    }
  };

  const handleLogin = async (username: string, password: string) => {
    try {
      const { name, memberId } = await loginUser(username, password);
      chrome.storage.local.set({ userInfo: { name, memberId } });
      setUserInfo({ name, memberId });
      loadCategories(memberId);
      alert('로그인에 성공했어요!');
    } catch (error) {
      console.error('로그인 에러: ', error);
      alert(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      chrome.storage.local.remove(['userInfo', 'categories'], () => {
        setUserInfo(undefined);
        setCategories([]);
        alert('로그아웃 성공!');
      });
    } catch (error) {
      console.error('로그아웃 에러: ', error);
      alert(error.message);
    }
  };

  return (
    <div>
      {userInfo ? (
        <Logout onLogout={handleLogout} />
      ) : (
        <LoginForm onLogin={handleLogin} />
      )}
    </div>
  );
};

document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('root');

  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<Popup />);
  }
});
