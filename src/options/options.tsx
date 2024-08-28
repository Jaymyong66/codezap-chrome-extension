import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

const Options = () => {
  const [userInfo, setUserInfo] = useState<{ name: string } | null>(null);

  useEffect(() => {
    chrome.storage.local.get(['userInfo'], (result) => {
      if (result.userInfo) {
        setUserInfo(result.userInfo);
      } else {
        setUserInfo(null);
      }
    });
  }, []);

  return (
    <div>
      <h2>CodeZap Extension Options</h2>
      <div id='user-info'>
        {userInfo
          ? `Logged in as: ${userInfo.name}`
          : 'No user info available.'}
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<Options />);
}
