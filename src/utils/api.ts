import config from '../../config';

export interface UserInfo {
  name: string;
  memberId: number;
}

export interface Category {
  id: number;
  name: string;
}

export const loginUser = async (name: string, password: string) => {
  const response = await fetch(`${config.API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, password }),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('로그인에 실패했어요. 다시 시도해주세요.');
  }

  return await response.json();
};

export const logoutUser = async () => {
  const response = await fetch(`${config.API_BASE_URL}/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('로그아웃에 실패했어요. 잠시 후 다시 시도해주세요.');
  }
};

export const fetchCategories = async (memberId: number) => {
  const url = `${config.API_BASE_URL}/categories?memberId=${memberId}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('카테고리 조회에 실패했습니다.');
  }

  return await response.json();
};

export const getLoginState = async () => {
  const url = `${config.API_BASE_URL}/login/check`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('로그인을 해주세요.');
    }
    throw new Error('인증되지 않은 사용자입니다.');
  }
};
