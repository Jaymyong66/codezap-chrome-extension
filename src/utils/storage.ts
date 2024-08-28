export interface LocalStorage {
  sourceCodes?: string[];
}

export type LocalStorageKeys = keyof LocalStorage;

export function setStoredSourceCodes(sourceCodes: string[]): Promise<void> {
  const codes: LocalStorage = {
    sourceCodes,
  };
  return new Promise((resolve) => {
    chrome.storage.local.set(codes, () => {
      resolve();
    });
  });
}

export function getStoredSourceCodes(): Promise<string[]> {
  const keys: LocalStorageKeys[] = ['sourceCodes'];
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (res: LocalStorage) => {
      resolve(res.sourceCodes ?? []);
    });
  });
}
