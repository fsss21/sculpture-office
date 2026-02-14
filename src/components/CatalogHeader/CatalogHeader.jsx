import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import styles from './CatalogHeader.module.css';

/**
 * @typedef {Object} FilterBlock
 * @property {string} id
 * @property {string} label
 * @property {string[]} options
 * @property {string[]} selected
 * @property {(value: string) => void} onToggle
 * @property {boolean} collapsed
 * @property {() => void} onCollapseToggle
 */

/**
 * Универсальный заголовок для страниц каталога и каталога подгруппы.
 * @param {Object} props
 * @param {string} props.title — заголовок (название категории или подгруппы)
 * @param {boolean} [props.showArrows=false] — показывать стрелки переключения слева/справа от заголовка
 * @param {() => void} [props.onPrev] — клик по стрелке «назад» (при showArrows)
 * @param {() => void} [props.onNext] — клик по стрелке «вперёд» (при showArrows)
 * @param {() => void} [props.onMenuClick] — клик по иконке меню (на странице подгруппы открывает фильтры)
 * @param {() => void} [props.onSearchClick] — клик по иконке поиска
 * @param {boolean} [props.isCatalogPage=false] — страница каталога подгруппы (/catalog/:categoryId/:subgroupId): показывать кнопку и dropdown фильтров
 * @param {boolean} [props.filtersOpen=false] — открыт ли dropdown фильтров
 * @param {() => void} [props.onFiltersToggle] — переключить dropdown фильтров
 * @param {FilterBlock[]} [props.filterBlocks=[]] — блоки фильтров (Виды, Материалы и т.д.)
 * @param {boolean} [props.searchOpen=false] — открыт ли выпадающий поиск (при isCatalogPage)
 * @param {string} [props.searchQuery=''] — значение поля поиска
 * @param {(value: string) => void} [props.onSearchQueryChange] — изменение значения поиска
 * @param {() => void} [props.onSearchClose] — закрыть выпадающий поиск
 * @param {string} [props.className] — дополнительный класс для позиционирования на странице
 * @param {string} [props.titleClassName] — дополнительный класс для заголовка (h1)
 * @param {string} [props.titleRowClassName] — дополнительный класс для строки с заголовком (headerTitleRow)
 */
export default function CatalogHeader({
  title = '',
  showArrows = false,
  onPrev,
  onNext,
  onMenuClick,
  onSearchClick,
  isCatalogPage = false,
  filtersOpen = false,
  onFiltersToggle,
  filterBlocks = [],
  searchOpen = false,
  searchQuery = '',
  onSearchQueryChange,
  onSearchClose,
  className = '',
  titleClassName = '',
  titleRowClassName = '',
}) {
  return (
    <header className={`${styles.header} ${className}`.trim()}>
      <div className={styles.headerTop}>
        <div className={styles.headerIcons}>
          {isCatalogPage && (
            <div className={styles.headerDropdownWrap}>
              <button
                type="button"
                className={styles.headerBtnFilters}
                onClick={onFiltersToggle}
                aria-expanded={filtersOpen}
                aria-haspopup="true"
                aria-label="Открыть фильтры"
              >
                <MenuIcon fontSize="large" />
              </button>
              {filtersOpen && (
                <div
                  className={styles.headerDropdown}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={styles.headerDropdownHeader}>
                    <h3 className={styles.headerDropdownTitle}>Фильтры</h3>
                    <button
                      type="button"
                      className={styles.headerDropdownClose}
                      onClick={() => onFiltersToggle?.()}
                      aria-label="Закрыть фильтры"
                    >
                      <CloseIcon />
                    </button>
                  </div>
                  {filterBlocks.map((block) => (
                    <div key={block.id} className={styles.headerFilterBlock}>
                      <div className={styles.headerFilterLabelWrap}>
                        <span className={styles.headerFilterLabel}>{block.label}</span>
                        <button
                          type="button"
                          className={styles.headerResetBtn}
                          onClick={block.onCollapseToggle}
                        >
                          {block.collapsed ? 'Развернуть' : 'Свернуть'}
                          {block.collapsed ? (
                            <ExpandLessIcon className={styles.headerResetBtnIcon} />
                          ) : (
                            <ExpandMoreIcon className={styles.headerResetBtnIcon} />
                          )}
                        </button>
                      </div>
                      {!block.collapsed && (
                        <div className={styles.headerFilterOptions}>
                          {block.options.map((opt) => (
                            <label key={opt} className={styles.headerFilterCheck}>
                              <input
                                type="checkbox"
                                checked={block.selected.includes(opt)}
                                onChange={() => block.onToggle(opt)}
                              />
                              {opt}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className={styles.headerFilterFooter}>
                    <button
                      type="button"
                      className={styles.headerFilterShowBtn}
                      onClick={() => onFiltersToggle?.()}
                    >
                      Показать
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {!isCatalogPage && (
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => onMenuClick?.()}
              aria-label="Меню"
            >
              <MenuIcon />
            </button>
          )}
          <div className={styles.headerSearchWrap}>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => onSearchClick?.()}
              aria-label="Поиск"
              aria-expanded={isCatalogPage ? searchOpen : undefined}
            >
              <SearchIcon />
            </button>
            {isCatalogPage && searchOpen && (
              <div
                className={styles.headerSearchDropdown}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.headerSearchDropdownBar}>
                  <button
                    type="button"
                    className={styles.headerSearchDropdownSearchBtn}
                    onClick={onSearchClose}
                    aria-label="Поиск"
                  >
                    <SearchIcon />
                  </button>
                  <input
                    type="text"
                    className={styles.headerSearchDropdownInput}
                    placeholder="Поиск по названию"
                    value={searchQuery}
                    onChange={(e) => onSearchQueryChange?.(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onSearchClose?.()}
                  />
                  <button
                    type="button"
                    className={styles.headerSearchDropdownClose}
                    onClick={onSearchClose}
                    aria-label="Закрыть"
                  >
                    <CloseIcon />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={`${styles.headerTitleRow} ${titleRowClassName}`.trim()}>
        {showArrows && (
          <button
            type="button"
            className={styles.headerArrow}
            onClick={onPrev}
            aria-label="Предыдущая"
          >
            <ChevronLeftIcon />
          </button>
        )}
        <h1 className={`${styles.headerTitle} ${titleClassName}`.trim()}>{title}</h1>
        {showArrows && (
          <button
            type="button"
            className={styles.headerArrow}
            onClick={onNext}
            aria-label="Следующая"
          >
            <ChevronRightIcon />
          </button>
        )}
      </div>
    </header>
  );
}
