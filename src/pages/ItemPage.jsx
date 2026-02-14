import { useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import styles from './ItemPage.module.css';

const DATA_URL = '/data/catalog.json';

export default function ItemPage() {
  const { categoryId, subgroupId, itemId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [textPage, setTextPage] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    fetch(DATA_URL)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error())))
      .then(setData)
      .catch(() => setLoadError(true));
  }, []);

  const { category, subgroup, item, itemIndex, items } = useMemo(() => {
    if (!data) return {};
    const cat = data.categories.find((c) => c.id === categoryId);
    if (!cat) return {};
    const sg = (cat.subgroups || []).find((s) => s.id === subgroupId);
    if (!sg) return {};
    const list = sg.items || [];
    const idx = list.findIndex((i) => i.id === itemId);
    const it = idx >= 0 ? list[idx] : null;
    return {
      category: cat,
      subgroup: sg,
      item: it,
      itemIndex: idx,
      items: list,
    };
  }, [data, categoryId, subgroupId, itemId]);

  const descriptionPoints = useMemo(() => {
    if (!item?.description) return [];
    return item.description.split(/[.;]\s+/).filter(Boolean).map((s) => s.trim());
  }, [item]);

  const featuresPoints = useMemo(() => {
    if (!item?.features) return [];
    return item.features.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
  }, [item]);

  const photos = item?.images?.length ? item.images : item?.image ? [item.image] : [];
  const textScrollRef = useRef(null);
  const [textPageCount, setTextPageCount] = useState(1);

  useLayoutEffect(() => {
    const el = textScrollRef.current;
    if (!el) return;
    const count = Math.max(1, Math.ceil(el.scrollHeight / el.clientHeight));
    setTextPageCount(count);
  }, [item?.id, descriptionPoints.length, featuresPoints.length]);

  useEffect(() => {
    const el = textScrollRef.current;
    if (!el) return;
    el.scrollTop = textPage * el.clientHeight;
  }, [textPage]);

  const goItem = (delta) => {
    if (items.length === 0) return;
    const next = (itemIndex + delta + items.length) % items.length;
    navigate(`/catalog/${category.id}/${subgroup.id}/item/${items[next].id}`, { replace: false });
    setTextPage(0);
    setPhotoIndex(0);
  };

  useEffect(() => {
    setTextPage(0);
    setPhotoIndex(0);
  }, [itemId]);

  useEffect(() => {
    setTextPage((p) => Math.min(p, textPageCount - 1));
  }, [textPageCount]);

  if (!data && !loadError) {
    return (
      <div className={styles.root}>
        <div className={styles.loading}>Загрузка…</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={styles.root}>
        <div className={styles.loading}>Ошибка загрузки.</div>
        <button type="button" className={styles.back} onClick={() => navigate('/catalog')}>
          В каталог
        </button>
      </div>
    );
  }

  if (!category || !subgroup || !item) {
    const backPath = !category ? '/catalog' : !subgroup ? `/catalog/${category.id}` : `/catalog/${category.id}/${subgroup.id}`;
    const backLabel = !category ? 'В каталог' : !subgroup ? 'В каталог категории' : 'В каталог подгруппы';
    return (
      <div className={styles.root}>
        <div className={styles.loading}>Предмет не найден.</div>
        <button
          type="button"
          className={styles.back}
          onClick={() => navigate(backPath)}
        >
          {backLabel}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <header className={`${styles.header} ${styles.headerItem}`}>
        <div className={styles.breadcrumb}>
          {category.title} → {subgroup.title}
        </div>
        <div className={styles.headerRight}>
          <button
            type="button"
            className={`${styles.iconBtn} ${styles.iconBtnMenu}`}
            aria-label="Фильтры"
          >
            <MenuIcon />
          </button>
          <button
            type="button"
            className={`${styles.iconBtn} ${styles.iconBtnSearch}`}
            aria-label="Поиск"
          >
            <SearchIcon />
          </button>
          <div className={styles.headerNavButtons}>
            <button
              type="button"
              className={`${styles.iconBtn} ${styles.iconBtnNav}`}
              onClick={() => goItem(-1)}
              aria-label="Предыдущий предмет"
            >
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              className={`${styles.iconBtn} ${styles.iconBtnNav}`}
              onClick={() => goItem(1)}
              aria-label="Следующий предмет"
            >
              <ChevronRightIcon />
            </button>
          </div>
          <button
            type="button"
            className={`${styles.iconBtn} ${styles.iconBtnViewCompact}`}
            aria-label="Компактный вид"
          >
            <ViewCompactIcon />
          </button>
          <button
            type="button"
            className={`${styles.iconBtn} ${styles.iconBtnClose}`}
            onClick={() => navigate(`/catalog/${category.id}/${subgroup.id}`)}
            aria-label="Закрыть"
          >
            <CloseIcon />
          </button>

        </div>
      </header>

      <div className={styles.content}>
        <aside className={styles.textPanel}>
          <div className={styles.textBlock}>
            <div
              ref={textScrollRef}
              className={styles.textScroll}
              role="region"
              aria-label="Текст описания"
            >
              <div className={styles.textContent}>
                {item.name && (
                  <h2 className={styles.textMainTitle}>{item.name}</h2>
                )}
                {descriptionPoints.length > 0 && (
                  <>
                    <h3 className={styles.textSectionTitle}>Описание</h3>
                    <ul className={styles.textList}>
                      {descriptionPoints.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </>
                )}
                {featuresPoints.length > 0 && (
                  <>
                    <h3 className={styles.textSectionTitle}>Особенности</h3>
                    <ul className={styles.textList}>
                      {featuresPoints.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </>
                )}
                {item.purpose && (
                  <>
                    <h3 className={styles.textSectionTitle}>Применение инструмента</h3>
                    <p className={styles.textPurpose}>{item.purpose}</p>
                  </>
                )}
                {!item.name && descriptionPoints.length === 0 && featuresPoints.length === 0 && !item.purpose && (
                  <p className={styles.noText}>Нет описания.</p>
                )}
              </div>
            </div>
            <div className={styles.textPagination}>
              <span className={styles.textPageNum}>
                {textPage + 1} / {textPageCount}
              </span>
              <div className={styles.textNavGroup}>
                <button
                  type="button"
                  className={styles.textNav}
                  disabled={textPageCount <= 1}
                  onClick={() => setTextPage((p) => Math.max(0, p - 1))}
                  aria-label="Предыдущая страница"
                >
                  <ChevronLeftIcon />
                </button>
                <button
                  type="button"
                  className={styles.textNav}
                  disabled={textPageCount <= 1}
                  onClick={() => setTextPage((p) => Math.min(textPageCount - 1, p + 1))}
                  aria-label="Следующая страница"
                >
                  <ChevronRightIcon />
                </button>
              </div>
            </div>
          </div>
        </aside>

        <section className={styles.photoPanel}>
          <div className={styles.photoBlock}>
            <div className={styles.photoWrapper}>
              {photos.length > 0 ? (
                <img
                  src={photos[photoIndex]}
                  alt=""
                  className={styles.photoImg}
                />
              ) : (
                <div className={styles.noPhoto}>Нет изображений</div>
              )}
            </div>
            {photos.length > 0 && (
              <div className={styles.photoControls}>
                <div className={styles.photoNavBlock}>

                  <div className={styles.photoNavGroup}>
                    <button
                      type="button"
                      className={styles.photoNav}
                      onClick={() =>
                        setPhotoIndex((i) => (i - 1 + photos.length) % photos.length)
                      }
                      aria-label="Предыдущее фото"
                    >
                      <ChevronLeftIcon />
                    </button>
                    <span className={styles.photoPageNum}>
                      {photoIndex + 1} / {photos.length}
                    </span>
                    <button
                      type="button"
                      className={styles.photoNav}
                      onClick={() =>
                        setPhotoIndex((i) => (i + 1) % photos.length)
                      }
                      aria-label="Следующее фото"
                    >
                      <ChevronRightIcon />
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.fullscreenBtn}
                  onClick={() => setFullscreen(true)}
                  aria-label="Полноэкранный режим"
                >
                  <FullscreenIcon />
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {fullscreen && photos.length > 0 && (
        <div
          className={styles.fullscreenOverlay}
          onClick={() => setFullscreen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Полноэкранный просмотр"
        >
          <button
            type="button"
            className={styles.fullscreenClose}
            onClick={() => setFullscreen(false)}
            aria-label="Выйти из полноэкранного режима"
          >
            <FullscreenExitIcon />
          </button>
          <img
            src={photos[photoIndex]}
            alt=""
            className={styles.fullscreenImg}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            className={styles.fsPrev}
            onClick={(e) => {
              e.stopPropagation();
              setPhotoIndex((i) => (i - 1 + photos.length) % photos.length);
            }}
            aria-label="Предыдущее"
          >
            <ChevronLeftIcon />
          </button>
          <button
            type="button"
            className={styles.fsNext}
            onClick={(e) => {
              e.stopPropagation();
              setPhotoIndex((i) => (i + 1) % photos.length);
            }}
            aria-label="Следующее"
          >
            <ChevronRightIcon />
          </button>
        </div>
      )}
    </div>
  );
}
