export interface StoredSourceCodes {
  sourceCodes?: string[];
}

export interface StoredUserInfo {
  name: string;
  memberId: number;
}

type StoredSourceCodesKeys = keyof StoredSourceCodes;

export function setStoredSourceCodes(sourceCodes: string[]): Promise<void> {
  const codes: StoredSourceCodes = {
    sourceCodes,
  };
  return new Promise((resolve) => {
    chrome.storage.local.set(codes, () => {
      resolve();
    });
  });
}

export function getStoredSourceCodes(): Promise<string[]> {
  const keys: StoredSourceCodesKeys[] = ['sourceCodes'];
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (res: StoredSourceCodes) => {
      resolve(res.sourceCodes ?? []);
    });
  });
}

export function setStoredUserInfo(userInfo: StoredUserInfo): Promise<void> {
  const storedUserInfo = {
    userInfo,
  };
  return new Promise((resolve) => {
    chrome.storage.local.set(storedUserInfo, () => {
      resolve();
    });
  });
}

export function getStoredUserInfo(): Promise<StoredUserInfo> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['userInfo'], (res) => {
      resolve(res.userInfo ?? { name: '', memberId: 0 });
    });
  });
}
