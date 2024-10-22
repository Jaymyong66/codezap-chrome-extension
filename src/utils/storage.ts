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

export const setStoredTitle = (title: string): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ title }, () => resolve());
  });
};

export const getStoredTitle = (): Promise<string> => {
  return new Promise((resolve) => {
    chrome.storage.local.get('title', (result) => resolve(result.title ?? ''));
  });
};

export const setStoredCategory = (
  categoryId: number | undefined
): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ selectedCategoryId: categoryId }, () =>
      resolve()
    );
  });
};

export const getStoredCategory = (): Promise<number | undefined> => {
  return new Promise((resolve) => {
    chrome.storage.local.get('selectedCategoryId', (result) =>
      resolve(result.selectedCategoryId ?? undefined)
    );
  });
};

export const setStoredFileNames = (fileNames: string[]): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ fileNames }, () => resolve());
  });
};

export const getStoredFileNames = (): Promise<string[]> => {
  return new Promise((resolve) => {
    chrome.storage.local.get('fileNames', (result) =>
      resolve(result.fileNames ?? [])
    );
  });
};

export const setStoredDescription = (description: string[]): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ description }, () => resolve());
  });
};

export const getStoredDescription = (): Promise<string[]> => {
  return new Promise((resolve) => {
    chrome.storage.local.get('description', (result) =>
      resolve(result.description ?? [])
    );
  });
};
