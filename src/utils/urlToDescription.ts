export const urlToDescription = (urls: string[]): string => {
  return urls.map((url) => `출처 : ${url}`).join('\n');
};
