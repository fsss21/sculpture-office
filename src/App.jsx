import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Splash from './pages/Splash';
import MainMenu from './pages/MainMenu';
import Catalog from './pages/Catalog';
import SubgroupCatalog from './pages/SubgroupCatalog';
import ItemPage from './pages/ItemPage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/menu" element={<MainMenu />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/catalog/:categoryId" element={<Catalog />} />
        <Route path="/catalog/:categoryId/:subgroupId" element={<SubgroupCatalog />} />
        <Route path="/catalog/:categoryId/:subgroupId/item/:itemId" element={<ItemPage />} />
        <Route path="*" element={<Navigate to="/menu" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
