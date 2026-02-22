import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Splash from './pages/Splash';
import MainMenu from './pages/MainMenu';
import Catalog from './pages/Catalog';
import SubgroupCatalog from './pages/SubgroupCatalog';
import ItemPage from './pages/ItemPage';
import SculptorGameApp from './sculptorGame/App';
import './App.css';

function QuizGameWrapper() {
  const navigate = useNavigate();
  return <SculptorGameApp exitToMenu={() => navigate('/menu', { replace: true })} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/menu" element={<MainMenu />} />
        <Route path="/quiz" element={<QuizGameWrapper />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/catalog/:categoryId" element={<Catalog />} />
        <Route path="/catalog/:categoryId/:subgroupId" element={<SubgroupCatalog />} />
        <Route path="/catalog/:categoryId/:subgroupId/item/:itemId" element={<ItemPage />} />
        <Route path="*" element={<Navigate to="/menu" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
