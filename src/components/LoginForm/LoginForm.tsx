import { useState } from 'react';
import styles from './LoginForm.module.css';

interface Props {
  onLogin: (username: string, password: string) => void;
}

const LoginForm = ({ onLogin }: Props) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    onLogin(username, password);
  };

  return (
    <div className={styles.loginFormContainer}>
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
      <button className={styles.loginButton} onClick={handleLogin}>
        로그인
      </button>
    </div>
  );
};

export default LoginForm;
