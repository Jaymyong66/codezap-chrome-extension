import styles from './LogoutButton.module.css';

interface Props {
  onLogout: () => void;
}

const LogoutButton = ({ onLogout }: Props) => {
  return (
    <button className={styles.logoutButton} onClick={onLogout}>
      로그아웃
    </button>
  );
};

export default LogoutButton;
