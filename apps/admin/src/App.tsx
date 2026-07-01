import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './layouts/AdminLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { PostsPage } from './pages/posts/PostsPage';
import { PostFormPage } from './pages/posts/PostFormPage';
import { SolutionsPage } from './pages/solutions/SolutionsPage';
import { SolutionFormPage } from './pages/solutions/SolutionFormPage';
import { ProductsPage } from './pages/products/ProductsPage';
import { ProductFormPage } from './pages/products/ProductFormPage';
import { DownloadsPage } from './pages/downloads/DownloadsPage';
import { MediaPage } from './pages/media/MediaPage';
import { InquiriesPage } from './pages/inquiries/InquiriesPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { SiteDisplayPage } from './pages/settings/SiteDisplayPage';
import { UsersPage } from './pages/users/UsersPage';

export default function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#3b82f6',
          borderRadius: 8,
        },
      }}
    >
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="posts" element={<PostsPage />} />
                <Route path="posts/:id" element={<PostFormPage />} />
                <Route path="solutions" element={<SolutionsPage />} />
                <Route path="solutions/:id" element={<SolutionFormPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="products/:id" element={<ProductFormPage />} />
                <Route path="downloads" element={<DownloadsPage />} />
                <Route path="media" element={<MediaPage />} />
                <Route path="inquiries" element={<InquiriesPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="site-display" element={<SiteDisplayPage />} />
                <Route path="users" element={<UsersPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}
