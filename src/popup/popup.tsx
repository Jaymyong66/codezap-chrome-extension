import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { LogoutButton } from '../components';
import {
  loginUser,
  logoutUser,
  fetchCategories,
  Category,
  UserInfo,
  getLoginState,
} from '../utils/api';
import {
  getStoredUserInfo,
  getStoredSourceCodes,
  setStoredUserInfo,
  setStoredSourceCodes,
  getStoredTitle,
  getStoredCategory,
  getStoredFileNames,
  setStoredTitle,
  setStoredCategory,
  setStoredFileNames,
  getStoredDescription,
} from '../utils/storage';
import config from '../../config';

import styles from './popup.module.css';
import '../styles/reset.css';
import VisibilityToggle from '../components/VisibilityToggle/VisibilityToggle';
import { urlToDescription } from '../utils/urlToDescription';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import { getLanguageByFilename } from '../utils/getLanguageByFileName';

const Popup = () => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: undefined,
    memberId: undefined,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [sourceCodes, setSourceCodes] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    number | undefined
  >(undefined);
  const [description, setDescription] = useState<string[]>([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [attachUrl, setAttachUrl] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        getLoginState();
      } catch (error) {
        await handleLogout();
      }
    };

    checkLogin();
  }, []);

  useEffect(() => {
    const initializePopup = async () => {
      const storedUserInfo = await getStoredUserInfo();
      const storedSourceCodes = await getStoredSourceCodes();
      const storedTitle = await getStoredTitle();
      const storedCategoryId = await getStoredCategory();
      const storedFileNames = await getStoredFileNames();
      const storedDescription = await getStoredDescription();

      if (storedUserInfo && storedUserInfo.memberId) {
        setUserInfo(storedUserInfo);
        loadCategories(storedUserInfo.memberId);
      }

      if (storedSourceCodes.length > 0) {
        setSourceCodes(storedSourceCodes);
        setFileNames(
          storedFileNames.length > 0
            ? storedFileNames
            : storedSourceCodes.map(() => '')
        );
      }

      setTitle(storedTitle);
      setSelectedCategoryId(storedCategoryId);
      setDescription(storedDescription);
    };

    initializePopup();
  }, []);

  const loadCategories = async (memberId: number) => {
    try {
      const data = await fetchCategories(memberId);
      setCategories(data.categories);
      chrome.storage.local.set({ categories: data.categories });

      setSelectedCategoryId(data.categories[0].id);
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
      // 추가
      chrome.runtime.sendMessage({
        action: 'sendUserInfo',
        name,
        memberId,
      });
      // 끝
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
        resetTemplateData();
        alert('로그아웃 되었어요');
      });
    } catch (error) {
      console.error('로그아웃 에러: ', error);
      alert(error.message);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setStoredTitle(newTitle);
  };

  const handleFileNameChange = (index: number, fileName: string) => {
    const newFileNames = [...fileNames];
    newFileNames[index] = fileName;
    setFileNames(newFileNames);
    setStoredFileNames(newFileNames);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = parseInt(e.target.value, 10);
    setSelectedCategoryId(categoryId);
    setStoredCategory(categoryId);
  };

  const toggleVisibility = () => {
    setIsPrivate(!isPrivate);
  };

  const handleRemoveSourceCode = (index: number) => {
    const newSourceCodes = [...sourceCodes];
    const newFileNames = [...fileNames];
    const newDescription = [...description];
    newSourceCodes.splice(index, 1);
    newFileNames.splice(index, 1);
    newDescription.splice(index, 1);
    setSourceCodes(newSourceCodes);
    setFileNames(newFileNames);
    setStoredSourceCodes(newSourceCodes);
  };

  const resetTemplateData = () => {
    setTitle('');
    setFileNames([]);
    setSelectedCategoryId(undefined);
    setSourceCodes([]);
    setStoredTitle('');
    setStoredCategory(categories[0].id);
    setStoredFileNames([]);
    setDescription([]);
    chrome.storage.local.remove('sourceCodes');
    chrome.storage.local.remove('description');
  };

  const handleUpload = async () => {
    if (!title || fileNames.some((fileName) => !fileName)) {
      alert('제목 및 파일명을 입력해주세요.');
      return;
    }

    if (sourceCodes.length === 0) {
      alert('소스코드를 추가해주세요.');
      return;
    }

    const requestBody = {
      title,
      description: attachUrl ? urlToDescription(description) : '',
      sourceCodes: sourceCodes.map((code, index) => ({
        filename: fileNames[index],
        content: code,
        ordinal: index + 1,
      })),
      thumbnailOrdinal: 1,
      categoryId: selectedCategoryId ? selectedCategoryId : categories[0].id,
      tags: [],
      visibility: isPrivate ? 'PRIVATE' : 'PUBLIC',
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
        if (
          window.confirm(
            '소스코드가 성공적으로 업로드되었어요! 코드잽에서 확인해볼까요?'
          )
        ) {
          chrome.tabs.create({
            url: `https://www.code-zap.com/members/${userInfo.memberId}/templates`,
          });
        }

        resetTemplateData();
      } else {
        alert('소스코드 업로드에 실패했어요. 잠시 후 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('업로드 중 에러 발생:', error);
      alert('소스코드 업로드 중 에러가 발생했어요. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttachUrl(e.target.checked);
  };

  const handleAddCategory = async () => {
    let newCategoryName = prompt('새로운 카테고리명을 입력해주세요:');
    while (newCategoryName) {
      try {
        const response = await fetch(`${config.API_BASE_URL}/categories`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ name: newCategoryName }),
        });

        if (response.ok) {
          alert('카테고리가 추가되었습니다!');
          const body = await response.json();

          await loadCategories(userInfo.memberId!);
          setSelectedCategoryId(body.id);
          break;
        } else if (response.status === 409) {
          newCategoryName = prompt('중복된 카테고리입니다. 다시 입력해주세요:');
        } else {
          alert('카테고리 추가에 실패했습니다. 다시 시도해주세요.');
          break;
        }
      } catch (error) {
        console.error('카테고리 추가 중 에러 발생:', error);
        break;
      }
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
          <div className={styles.categoryVisibilityContainer}>
            <div className={styles.categoryContainer}>
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
              <button
                className={styles.addCategoryButton}
                onClick={handleAddCategory}
              >
                +
              </button>
            </div>
            <VisibilityToggle
              isPrivate={isPrivate}
              toggleVisibility={toggleVisibility}
            />
          </div>
          <div className={styles.checkboxContainer}>
            <label className={styles.checkboxLabel}>
              <input
                type='checkbox'
                className={styles.checkboxInput}
                checked={attachUrl}
                onChange={handleCheckboxChange}
              />
              <span className={styles.checkboxText}>출처 url 첨부</span>
            </label>
          </div>
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
              <div className={styles.sourceCodeWrapper}>
                <pre className={styles.pre}>
                  <code
                    className={styles.codeBlock}
                    dangerouslySetInnerHTML={{
                      __html: hljs.highlight(code, {
                        language: getLanguageByFilename(fileNames[index]),
                      }).value,
                    }}
                  />
                </pre>
              </div>
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
