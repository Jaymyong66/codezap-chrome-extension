import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { LogoutButton } from '../components';
import {
  loginUser,
  logoutUser,
  fetchCategories,
  Category,
  UserInfo,
} from '../utils/api';
import {
  getStoredUserInfo,
  getStoredSourceCodes,
  setStoredUserInfo,
  setStoredSourceCodes,
} from '../utils/storage';
import config from '../../config';

import styles from './popup.module.css';
import '../styles/reset.css';

const Popup = () => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: undefined,
    memberId: undefined,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [sourceCodes, setSourceCodes] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    number | undefined
  >(undefined);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const initializePopup = async () => {
      const storedUserInfo = await getStoredUserInfo();
      const storedSourceCodes = await getStoredSourceCodes();

      if (storedUserInfo && storedUserInfo.memberId) {
        setUserInfo(storedUserInfo);
        loadCategories(storedUserInfo.memberId);
      }

      if (storedSourceCodes.length > 0) {
        setSourceCodes(storedSourceCodes);
        setFileNames(storedSourceCodes.map(() => ''));
      }
    };

    initializePopup();
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

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { name, memberId } = await loginUser(username, password);
      await setStoredUserInfo({ name, memberId });
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
        setUserInfo({
          name: undefined,
          memberId: undefined,
        });
        setCategories([]);
        alert('로그아웃 성공!');
      });
    } catch (error) {
      console.error('로그아웃 에러: ', error);
      alert(error.message);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleFileNameChange = (index: number, fileName: string) => {
    const newFileNames = [...fileNames];
    newFileNames[index] = fileName;
    setFileNames(newFileNames);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = parseInt(e.target.value, 10);
    setSelectedCategoryId(categoryId);
  };

  const handleRemoveSourceCode = (index: number) => {
    const newSourceCodes = [...sourceCodes];
    const newFileNames = [...fileNames];
    newSourceCodes.splice(index, 1);
    newFileNames.splice(index, 1);
    setSourceCodes(newSourceCodes);
    setFileNames(newFileNames);
    setStoredSourceCodes(newSourceCodes);
  };

  const handleUpload = async () => {
    if (
      !title ||
      fileNames.some((fileName) => !fileName) ||
      !selectedCategoryId
    ) {
      alert('제목, 파일명 및 카테고리를 선택해주세요.');
      return;
    }

    if (sourceCodes.length === 0) {
      alert('소스코드를 추가해주세요.');
      return;
    }

    const requestBody = {
      title,
      description: '사용자가 생성한 코드 템플릿',
      sourceCodes: sourceCodes.map((code, index) => ({
        filename: fileNames[index],
        content: code,
        ordinal: index + 1,
      })),
      thumbnailOrdinal: 1,
      categoryId: selectedCategoryId,
      tags: [],
    };

    try {
      const response = await fetch(`${config.API_BASE_URL}/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        alert('소스코드가 성공적으로 업로드되었어요!');
        // chrome.notifications.create({
        //   type: 'basic',
        //   iconUrl: 'icons/icon48.png',
        //   title: '코드잽',
        //   message: '소스코드 업로드가 성공했어요!',
        // });
        setTitle('');
        setFileNames(sourceCodes.map(() => ''));
        setSelectedCategoryId(undefined);
        setSourceCodes([]);
        chrome.storage.local.remove('sourceCodes');
      } else {
        alert('소스코드 업로드에 실패했어요. 잠시 후 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('업로드 중 에러 발생:', error);
      alert('소스코드 업로드 중 에러가 발생했어요. 잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <>
      {userInfo.memberId !== undefined ? (
        <div className={styles.popupContainer}>
          <div className={styles.popupHeaderContainer}>
            <h2 className={styles.popupTitle}>코드잽 템플릿 업로드</h2>
            <LogoutButton onLogout={handleLogout} />
          </div>

          <input
            className={styles.titleInput}
            type='text'
            placeholder='템플릿 제목을 입력해주세요'
            value={title}
            onChange={handleTitleChange}
          />
          <select
            className={styles.categorySelect}
            value={selectedCategoryId || ''}
            onChange={handleCategoryChange}
          >
            <option value='' disabled>
              카테고리를 선택해주세요
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {sourceCodes.length === 0 && (
            <div>원하는 소스코드를 드래그 후 우클릭 하여 추가해보세요</div>
          )}
          {sourceCodes.map((code, index) => (
            <div key={index} className={styles.sourceCodeContainer}>
              <input
                type='text'
                placeholder='파일명을 입력해주세요'
                className={styles.fileNameInput}
                value={fileNames[index]}
                onChange={(e) => handleFileNameChange(index, e.target.value)}
              />
              <textarea
                readOnly
                value={code}
                rows={4}
                cols={35}
                className={styles.sourceCodeTextArea}
              />
              <button
                onClick={() => handleRemoveSourceCode(index)}
                className={styles.removeButton}
              >
                X
              </button>
            </div>
          ))}
          <button className={styles.uploadButton} onClick={handleUpload}>
            업로드
          </button>
        </div>
      ) : (
        <form
          className={styles.loginFormContainer}
          onSubmit={handleLoginSubmit}
        >
          <h2 className={styles.loginFormTitle}>코드잽 익스텐션</h2>
          <input
            id='name'
            type='text'
            placeholder='아이디'
            className={styles.loginFormInput}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            id='password'
            type='password'
            placeholder='비밀번호'
            className={styles.loginFormInput}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type='submit' className={styles.loginButton}>
            로그인
          </button>
        </form>
      )}
    </>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<Popup />);
}
