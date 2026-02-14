import { useNavigate } from 'react-router-dom';
import styles from './Splash.module.css';

export default function Splash() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/menu', { replace: true });
  };

  return (
    <div
      className={styles.root}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      role="button"
      tabIndex={0}
      aria-label="Перейти в меню"
    >
      <div className={styles.content}>
        <h1 className={styles.title}>Кабинет скульптора</h1>
      </div>
    </div>
  );
}
