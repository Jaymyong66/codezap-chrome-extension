import { useState } from 'react';

interface LoginFormProps {
  onLogin: (username: string, password: string) => void;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    onLogin(username, password);
  };

  return (
    <div id='login-form'>
      <h2>로그인</h2>
      <input
        id='name'
        type='text'
        placeholder='아이디'
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        id='password'
        type='password'
        placeholder='비밀번호'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button id='login-button' onClick={handleLogin}>
        로그인
      </button>
    </div>
  );
};

export default LoginForm;
