import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import AdminLayout from './pages/Admin/Layout'
import Dashboard from './pages/Admin/Dashboard'
import Products from './pages/Admin/Products'
import Categories from './pages/Admin/Categories'
import Vouchers from './pages/Admin/Vouchers'
import AutoDiscounts from './pages/Admin/AutoDiscounts'
import Reports from './pages/Admin/Reports'
import POS from './pages/Pos'
import Mirror from './pages/Mirror'
import ProtectedRoute from './components/Layout/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/mirror" element={<Mirror />} />
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="vouchers" element={<Vouchers />} />
        <Route path="auto-discounts" element={<AutoDiscounts />} />
        <Route path="reports" element={<Reports />} />
      </Route>
      <Route path="/pos" element={
        <ProtectedRoute allowedRoles={['admin', 'kasir']}>
          <POS />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
