import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CatalogHeader from '../components/CatalogHeader';
import CatalogSidebar from '../components/CatalogSidebar';
import styles from './SubgroupCatalog.module.css';

const DATA_URL = '/data/catalog.json';

export default function SubgroupCatalog() {
  const { categoryId, subgroupId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTypes, setFilterTypes] = useState([]);
  const [filterMaterials, setFilterMaterials] = useState([]);
  const headerWrapRef = useRef(null);

  useEffect(() => {
    fetch(DATA_URL)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Ошибка загрузки'))))
      .then((data) => {
        setData(data);
        setLoadError(false);
      })
      .catch(() => setLoadError(true));
  }, []);

  const { category, subgroup, subgroupIndex, subgroups, categories } = useMemo(() => {
    if (!data) return {};
    const cat = data.categories.find((c) => c.id === categoryId);
    if (!cat) return {};
    const subs = cat.subgroups || [];
    const idx = subs.findIndex((s) => s.id === subgroupId);
    const sg = idx >= 0 ? subs[idx] : null;
    return {
      category: cat,
      subgroup: sg,
      subgroupIndex: idx,
      subgroups: subs,
      categories: data.categories,
    };
  }, [data, categoryId, subgroupId]);

  const items = subgroup?.items || [];
  const typesFromItems = useMemo(() => {
    const set = new Set(items.map((i) => i.type).filter(Boolean));
    return [...set];
  }, [items]);
  const materialsFromItems = useMemo(() => {
    const set = new Set(items.map((i) => i.material).filter(Boolean));
    return [...set];
  }, [items]);

  const filterSections = useMemo(() => {
    const sections = [];
    const subgroupTitles = (category?.subgroups || []).map((s) => s.title);
    const typesOptions =
      typesFromItems.length > 0 ? typesFromItems : subgroupTitles;
    const materialsOptions = materialsFromItems;
    sections.push({ title: 'Виды', options: typesOptions, key: 'types' });
    sections.push({ title: 'Материалы', options: materialsOptions, key: 'materials' });
    return sections;
  }, [category, typesFromItems, materialsFromItems]);

  const [filterBlocksCollapsed, setFilterBlocksCollapsed] = useState({});

  const isMaterialsSection = (key) => key === 'materials';

  const toggleFilter = (setter, value) => {
    setter((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const toggleBlockCollapsed = useCallback((key) => {
    setFilterBlocksCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const filterBlocks = useMemo(() => {
    return filterSections.map(({ title, options, key }) => ({
      id: key,
      label: title,
      options,
      selected: isMaterialsSection(key) ? filterMaterials : filterTypes,
      onToggle: (value) =>
        toggleFilter(
          isMaterialsSection(key) ? setFilterMaterials : setFilterTypes,
          value
        ),
      collapsed: filterBlocksCollapsed[key] ?? false,
      onCollapseToggle: () => toggleBlockCollapsed(key),
    }));
  }, [
    filterSections,
    filterTypes,
    filterMaterials,
    filterBlocksCollapsed,
    toggleBlockCollapsed,
  ]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType =
        filterTypes.length === 0 || (item.type && filterTypes.includes(item.type));
      const matchMaterial =
        filterMaterials.length === 0 ||
        (item.material && filterMaterials.includes(item.material));
      return matchSearch && matchType && matchMaterial;
    });
  }, [items, searchQuery, filterTypes, filterMaterials]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        headerWrapRef.current &&
        !headerWrapRef.current.contains(e.target)
      ) {
        if (filtersOpen) setFiltersOpen(false);
        if (searchOpen) setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filtersOpen, searchOpen]);

  const goSubgroup = (delta) => {
    if (!category || subgroups.length === 0) return;
    const next = (subgroupIndex + delta + subgroups.length) % subgroups.length;
    const nextSg = subgroups[next];
    navigate(`/catalog/${category.id}/${nextSg.id}`, { replace: false });
  };

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
        <div className={styles.loading}>Ошибка загрузки каталога.</div>
        <button type="button" className={styles.back} onClick={() => navigate('/catalog')}>
          В каталог
        </button>
      </div>
    );
  }

  if (!category || !subgroup) {
    return (
      <div className={styles.root}>
        <div className={styles.loading}>Категория или подгруппа не найдены.</div>
        <button type="button" className={styles.back} onClick={() => navigate('/catalog')}>
          В каталог
        </button>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.headerWrap} ref={headerWrapRef}>
        <CatalogHeader
          className={styles.headerSubgroup}
          titleRowClassName={styles.headerTitleRowSubgroup}
          titleClassName={styles.headerTitleSubgroup}
          title={subgroup.title}
          showArrows
          onPrev={() => goSubgroup(-1)}
          onNext={() => goSubgroup(1)}
          onSearchClick={() => {
            setFiltersOpen(false);
            setSearchOpen((v) => !v);
          }}
          isCatalogPage
          filtersOpen={filtersOpen}
          onFiltersToggle={() => {
            setSearchOpen(false);
            setFiltersOpen((v) => !v);
          }}
          filterBlocks={filterBlocks}
          searchOpen={searchOpen}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onSearchClose={() => setSearchOpen(false)}
        />
      </div>

      <div className={styles.layout}>
        <CatalogSidebar
          categories={categories}
          activeCategoryId={category.id}
          onCategorySelect={(cat, i) => navigate(i === 0 ? '/catalog' : `/catalog/${cat.id}`)}
          onBack={() => navigate('/catalog')}
          backLabel="Назад"
        />

        <main className={styles.main}>
          <div className={styles.grid}>
            {filteredItems.length === 0 ? (
              <p className={styles.empty}>Нет предметов по выбранным фильтрам.</p>
            ) : (
              filteredItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={styles.card}
                  onClick={() => navigate(`/catalog/${category.id}/${subgroup.id}/item/${item.id}`)}
                >
                  <div className={styles.cardImage}>
                    <img src={item.image} alt="" />
                  </div>
                  <div className={styles.cardName}>{item.name}</div>
                </button>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
