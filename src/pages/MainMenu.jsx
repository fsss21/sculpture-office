import styles from './MainMenu.module.css';
import { useNavigate } from 'react-router-dom';

export default function MainMenu() {
  const navigate = useNavigate()

  const goToCatalog = () => {
    navigate('/catalog', { replace: true })
  }

  const goToSplash = () => {
    navigate('/', { replace: true })
  }


  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <h1 className={styles.title}>Кабинет скульптора</h1>
        <div className={styles.actions}>
          <button type="button" onClick={goToCatalog} className={styles.button}>
            Перейти в каталог
          </button>
          <button type="button" className={styles.button} disabled>
            Участвовать в викторине
          </button>
        </div>
      </div>
      <button type="button" onClick={goToSplash} className={styles.back} aria-label="Назад">
        Назад
      </button>
    </div>
  );
}
