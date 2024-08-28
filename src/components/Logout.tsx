interface LogoutProps {
  onLogout: () => void;
}

const Logout = ({ onLogout }: LogoutProps) => {
  return (
    <div id='welcome-message'>
      <h2>코드잽 익스텐션</h2>
      <p>원하는 소스코드를 드래그 후 우클릭하여 업로드해보세요 :)</p>
      <button id='logout-button' onClick={onLogout}>
        Logout
      </button>
    </div>
  );
};

export default Logout;
