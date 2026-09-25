import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ColorBlindFilters from './components/ColorBlindFilters';
import PWAUpdatePrompt from './components/PWAUpdatePrompt';
import AccessibilityPanel from './components/AccessibilityPanel';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminLoginPage from './pages/AdminLoginPage';
import SetupPreferencesPage from './pages/SetupPreferencesPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminArticlesPage from './pages/AdminArticlesPage';
import AdminArticleFormPage from './pages/AdminArticleFormPage';
import AdminCategoriesPage from './pages/AdminCategoriesPage';
import OfflinePage from './pages/OfflinePage';
import { useAuth } from './hooks/useAuth';

import { useFilterWarna } from './hooks/useFilterWarna';

function NotFoundOrOffline() {
  if (!navigator.onLine) {
    return <OfflinePage />;
  }
  
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-8"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="max-w-md text-center animate-fade-in">
        <span 
          className="text-xs uppercase tracking-[0.3em] font-medium"
          style={{ color: 'var(--accent)' }}
        >
          Error 404
        </span>
        <h1 
          className="font-bold tracking-tight text-5xl mt-3 mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          Halaman Tidak Ditemukan
        </h1>
        <p 
          className="mb-8"
          style={{ color: 'var(--text-secondary)' }}
        >
          Halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <a 
          href="/" 
          className="inline-block px-5 py-3 rounded-md font-medium transition"
          style={{ 
            backgroundColor: 'var(--accent)',
            color: 'var(--bg-primary)'
          }}
        >
          Kembali ke Beranda
        </a>
      </div>
    </div>
  );
}

function AppContent() {
  const { isAdmin, isLoggedIn, isUser } = useAuth();
  const location = useLocation();
  const [a11yPanelOpen, setA11yPanelOpen] = useState(false);

  // Halaman setup-preferensi menyembunyikan panel aksesibilitas melayang
  // (wizard-nya sudah mengatur hal yang sama) dan footernya di layar kecil.
  const isSetupPreferences = location.pathname.startsWith('/setup-preferences');

  // Footer tidak ditampilkan di halaman Login/Register (layout dua kolom
  // yang sudah dirancang penuh satu layar) maupun halaman admin.
  const hideFooter = isAdmin || ['/login', '/register'].includes(location.pathname);

  const isHome = location.pathname === '/';

  // Filter buta warna dipasang per elemen (lihat useFilterWarna), bukan di
  // satu pembungkus: navbar sticky, baris yang bisa digeser, dan elemen fixed
  // punya lapisan render sendiri yang lolos dari filter induknya di Safari.
  // Karena itu <main> hanya difilter untuk halaman selain beranda — beranda
  // memasang filternya per section sendiri, sebab di dalamnya ada baris
  // rekomendasi yang harus memfilter dirinya sendiri.
  const filterWarna = useFilterWarna();

  // Warna tidak lagi disuntik sebagai nilai mati di sini: temanya dipasang
  // sebagai data-kontras di <html> (lihat AccessibilityProvider), jadi cukup
  // membaca tokennya. Menyuntik hex inline seperti sebelumnya justru akan
  // menimpa token dan membuat mode terang/tinggi tidak terlihat.
  const contentStyle = {
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)'
  };

  return (
    <>
    <div className="min-h-screen flex flex-col transition-colors" style={contentStyle}>
      <ColorBlindFilters />
      {!isAdmin && <Navbar />}

      <main className="flex-1" style={isHome ? undefined : { filter: filterWarna }}>
        <Routes>
          {/* key={location.key} memaksa HomePage mount ulang setiap kali
              dinavigasi ke "/" — termasuk saat mengklik "Beranda" ketika
              sudah berada di beranda — supaya halaman kembali ke kondisi
              seperti baru dibuka (filter/kategori/carousel/scroll ter-reset). */}
          <Route path="/" element={<HomePage key={location.key} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/offline" element={<OfflinePage />} />
          
          <Route 
            path="/article/:slug" 
            element={
              <ProtectedRoute requiredRole="user">
                <ArticleDetailPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/setup-preferences" 
            element={
              <ProtectedRoute requiredRole="user">
                <SetupPreferencesPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/articles" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminArticlesPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/articles/new" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminArticleFormPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/articles/edit/:id" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminArticleFormPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/categories" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminCategoriesPage />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<NotFoundOrOffline />} />
        </Routes>
      </main>

      {/* Di halaman preferensi, versi HP-nya adalah wizard setinggi persis
          satu layar. Footer di bawahnya akan membuat halaman itu bisa
          tergulir lagi dan merusak kesan "satu layar" tadi, jadi footer
          disembunyikan khusus di lebar HP — layar lebar tetap punya footer. */}
      {!hideFooter && (
        <div className={isSetupPreferences ? 'hidden lg:block' : undefined}>
          <Footer />
        </div>
      )}
    </div>

    {/* Dirender di luar wrapper ber-filter (di atas) supaya elemen
        position: fixed ini tetap menempel ke viewport — CSS `filter` pada
        elemen leluhur membuat leluhur itu jadi containing block baru untuk
        anak fixed-nya, jadi harus dihindari untuk tombol/panel/toast ini. */}
    {isLoggedIn && isUser && !isSetupPreferences && (
      <>
        <button
          onClick={() => setA11yPanelOpen(true)}
          className="fixed bottom-6 right-6 p-4 rounded-full shadow-lg transition z-50 hover:scale-105"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--bg-primary)',
            filter: filterWarna
          }}
          aria-label="Buka pengaturan aksesibilitas"
          title="Pengaturan Aksesibilitas"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="8" r="2"/>
            <path d="M10 22 10 16 14 16 14 22"/>
            <path d="M8 12 16 12"/>
          </svg>
        </button>

        <AccessibilityPanel
          isOpen={a11yPanelOpen}
          onClose={() => setA11yPanelOpen(false)}
        />
      </>
    )}

    <PWAUpdatePrompt />
    </>
  );
}

function App() {
  return <AppContent />;
}

export default App;