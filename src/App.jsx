import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import HomePage              from './pages/HomePage.jsx';
import CategoryPage          from './pages/CategoryPage.jsx';
import ShopDetailPage        from './pages/ShopDetailPage.jsx';
import AddShopPage           from './pages/AddShopPage.jsx';
import MyShopsPage           from './pages/MyShopsPage.jsx';
import EditShopPage          from './pages/EditShopPage.jsx';
import ManageInventoryPage   from './pages/ManageInventoryPage.jsx';

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/"                                 element={<HomePage />} />
        <Route path="/add-shop"                         element={<AddShopPage />} />
        <Route path="/my-shops"                         element={<MyShopsPage />} />
        <Route path="/edit-shop/:shopId"                element={<EditShopPage />} />
        <Route path="/inventory/:shopId"                element={<ManageInventoryPage />} />
        <Route path="/:cityName/:category"              element={<CategoryPage />} />
        <Route path="/:cityName/:category/shop/:shopId" element={<ShopDetailPage />} />
        <Route path="/:cityName/shop/:shopId"           element={<ShopDetailPage />} />
        <Route path="*"                                 element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
