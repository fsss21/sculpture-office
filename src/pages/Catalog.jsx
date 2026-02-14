import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CatalogHeader from '../components/CatalogHeader';
import CatalogSidebar from '../components/CatalogSidebar';
import styles from './Catalog.module.css';
import placeHolderClay from '../assets/place_holder_clay_img.png';
import placeHolderStone from '../assets/place_holder_stone_img.png';
import placeHolderMeasure from '../assets/place_holder_measure_img.png';
import placeHolderHelping from '../assets/place_holder_helping_img.png';

const DATA_URL = '/data/catalog.json';

const CATEGORY_PLACEHOLDERS = {
  'clay-tools': placeHolderClay,
  'stone-tools': placeHolderStone,
  'measuring-tools': placeHolderMeasure,
  'auxiliary-tools': placeHolderHelping,
};

export default function Catalog() {
  const { categoryId: paramCategoryId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [subgroupIndex, setSubgroupIndex] = useState(0);

  useEffect(() => {
    fetch(DATA_URL)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error())))
      .then(setData)
      .catch(() => setLoadError(true));
  }, []);

  useEffect(() => {
    if (!data) return;
    if (!paramCategoryId) {
      setCategoryIndex(0);
      setSubgroupIndex(0);
      return;
    }
    const idx = data.categories.findIndex((c) => c.id === paramCategoryId);
    if (idx >= 0) {
      setCategoryIndex(idx);
      setSubgroupIndex(0);
    }
  }, [data, paramCategoryId]);

  if (!data && !loadError) {
    return (
      <div className={styles.root}>
        <div className={styles.loading}>Загрузка каталога…</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={styles.root}>
        <div className={styles.loading}>Ошибка загрузки каталога.</div>
        <button type="button" className={styles.back} onClick={() => navigate('/menu')}>
          В меню
        </button>
      </div>
    );
  }

  const categories = data.categories;
  const category = categories[categoryIndex];
  const subgroups = category.subgroups || [];
  const subgroup = subgroups[subgroupIndex];
  const hasSubgroups = subgroups.length > 0;

  return (
    <div className={styles.root}>
      <CatalogHeader title={category.title} />

      <div className={styles.layout}>
        <CatalogSidebar
          categories={categories}
          activeCategoryId={category.id}
          onCategorySelect={(cat, i) => {
            if (i === categoryIndex) return;
            navigate(i === 0 ? '/catalog' : `/catalog/${cat.id}`);
          }}
          onBack={() => navigate('/menu')}
          backLabel="Назад"
        />

        <main className={styles.main}>
          {hasSubgroups ? (
            <>
              <div className={styles.carousel}>
                <button
                  type="button"
                  className={styles.carouselArrow}
                  onClick={() => setSubgroupIndex((prev) => (prev - 1 + subgroups.length) % subgroups.length)}
                  aria-label="Предыдущая"
                >
                  <ChevronLeftIcon />
                </button>
                <div className={styles.carouselImages}>
                  <div key={subgroupIndex} className={styles.carouselImagesInner}>
                    {[-1, 0, 1].map((offset) => {
                      const idx = (subgroupIndex + offset + subgroups.length) % subgroups.length;
                      const sg = subgroups[idx];
                      const isCenter = offset === 0;
                      return (
                        <div
                          key={`${offset}-${sg.id}`}
                          className={styles.carouselFrame + (isCenter ? ' ' + styles.carouselFrameCenter : '')}
                        >
                          <img
                            src={sg.image || CATEGORY_PLACEHOLDERS[category.id]}
                            alt=""
                            className={styles.carouselImg}
                            onError={(e) => {
                              const placeholder = CATEGORY_PLACEHOLDERS[category.id];
                              if (placeholder) e.currentTarget.src = placeholder;
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.carouselArrow}
                  onClick={() => setSubgroupIndex((prev) => (prev + 1) % subgroups.length)}
                  aria-label="Следующая"
                >
                  <ChevronRightIcon />
                </button>
              </div>
              {subgroup && (
                <div className={styles.carouselActions}>
                  <h2 className={styles.subgroupTitle}>{subgroup.title}</h2>
                  <button
                    type="button"
                    className={styles.toSubgroupBtn}
                    onClick={() => navigate(`/catalog/${category.id}/${subgroup.id}`)}
                  >
                    Перейти в каталог
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className={styles.empty}>В этой категории пока нет подгрупп.</div>
          )}
        </main>
      </div>
    </div>
  );
}
