
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminLogin from './components/admin/Login';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './components/admin/Dashboard';
import Leads from './components/admin/Leads';
import Estoque from './components/admin/Estoque';
import OrdensServico from './components/admin/OrdensServico';
import Usuarios from './components/admin/Usuarios';
import PrivateRoute from './components/admin/PrivateRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/*" element={<HomePage />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/leads"
        element={
          <PrivateRoute>
            <AdminLayout>
              <Leads />
            </AdminLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/estoque"
        element={
          <PrivateRoute>
            <AdminLayout>
              <Estoque />
            </AdminLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/os"
        element={
          <PrivateRoute>
            <AdminLayout>
              <OrdensServico />
            </AdminLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/usuarios"
        element={
          <PrivateRoute>
            <AdminLayout>
              <Usuarios />
            </AdminLayout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
