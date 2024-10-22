import { useState } from 'react';
import PrivateIcon from '../../static/images/privateIcon.png';
import PublicIcon from '../../static/images/publicIcon.png';
import styles from './VisibilityToggle.module.css';

interface Props {
  isPrivate: boolean;
  toggleVisibility: () => void;
}

const VisibilityToggle = ({ isPrivate, toggleVisibility }: Props) => {
  const handleToggleClick = () => {
    toggleVisibility();
  };

  const styleClass = isPrivate ? 'private' : 'public';

  return (
    <div className={styles.toggleWrapper}>
      <div
        className={`${styles.toggleContainer} ${styles[styleClass]}`}
        onClick={handleToggleClick}
      >
        <div className={styles.slider}>
          <img
            src={isPrivate ? PrivateIcon : PublicIcon}
            alt={
              isPrivate ? 'visibility private 버튼' : 'visibility public 버튼'
            }
            className={styles.icon}
            width={18}
          />
        </div>
      </div>
    </div>
  );
};

export default VisibilityToggle;
