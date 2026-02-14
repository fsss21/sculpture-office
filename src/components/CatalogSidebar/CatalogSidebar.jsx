import styles from './CatalogSidebar.module.css';

/**
 * Универсальный сайдбар каталога: список категорий + кнопка «Назад».
 * @param {Object} props
 * @param {{ id: string, title: string }[]} props.categories — список категорий
 * @param {string} props.activeCategoryId — id текущей категории (для подсветки)
 * @param {(category: { id: string, title: string }, index: number) => void} props.onCategorySelect — клик по категории
 * @param {() => void} props.onBack — клик по «Назад»
 * @param {string} [props.backLabel='Назад'] — текст кнопки «Назад»
 */
export default function CatalogSidebar({
  categories = [],
  activeCategoryId,
  onCategorySelect,
  onBack,
  backLabel = 'Назад',
}) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarNav}>
        {categories.map((cat, i) => (
          <button
            key={cat.id}
            type="button"
            className={
              styles.sidebarBtn +
              (cat.id === activeCategoryId ? ' ' + styles.sidebarBtnActive : '')
            }
            onClick={() => onCategorySelect(cat, i)}
          >
            {cat.title}
          </button>
        ))}
      </div>
      <button type="button" className={styles.back} onClick={onBack}>
        {backLabel}
      </button>
    </aside>
  );
}
