import { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useFilterWarna } from '../hooks/useFilterWarna';

function PWAUpdatePrompt() {
  // Toast ini position: fixed, jadi filternya dipasang sendiri.
  const filterWarna = useFilterWarna();
  const [showInstall, setShowInstall] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      console.log('Service Worker registered:', registration);
    },
    onRegisterError(error) {
      console.error('Service Worker registration error:', error);
    }
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted PWA install');
    }
    
    setInstallPrompt(null);
    setShowInstall(false);
  };

  const closeInstall = () => {
    setShowInstall(false);
  };

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  const closeUpdate = () => {
    setNeedRefresh(false);
  };

  if (needRefresh) {
    return (
      <div 
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md p-5 rounded-lg shadow-2xl z-50 animate-fade-in"
        style={{ 
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--accent)',
          filter: filterWarna
        }}
      >
        <div className="flex items-start gap-4">
          <div 
            className="w-1 self-stretch rounded-full flex-shrink-0"
            style={{ backgroundColor: 'var(--accent)' }}
          />
          <div className="flex-1">
            <p 
              className="font-bold tracking-tight text-lg mb-1"
              style={{ color: 'var(--text-primary)' }}
            >
              Versi Baru Tersedia
            </p>
            <p 
              className="text-sm mb-4"
              style={{ color: 'var(--text-secondary)' }}
            >
              Refresh untuk mendapatkan fitur dan perbaikan terbaru.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleUpdate}
                className="px-4 py-2 rounded-md text-sm font-medium transition"
                style={{ 
                  backgroundColor: 'var(--accent)',
                  color: 'var(--bg-primary)'
                }}
              >
                Refresh Sekarang
              </button>
              <button
                onClick={closeUpdate}
                className="text-sm transition hover:underline"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Nanti
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showInstall) {
    return (
      <div 
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md p-5 rounded-lg shadow-2xl z-50 animate-fade-in"
        style={{ 
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          filter: filterWarna
        }}
      >
        <div className="flex items-start gap-4">
          <div 
            className="w-1 self-stretch rounded-full flex-shrink-0"
            style={{ backgroundColor: 'var(--accent)' }}
          />
          <div className="flex-1">
            <span 
              className="text-xs uppercase tracking-widest font-medium"
              style={{ color: 'var(--accent)' }}
            >
              Tersedia
            </span>
            <p 
              className="font-bold tracking-tight text-lg mt-1 mb-1"
              style={{ color: 'var(--text-primary)' }}
            >
              Install Portal Berita
            </p>
            <p 
              className="text-sm mb-4"
              style={{ color: 'var(--text-secondary)' }}
            >
              Pasang aplikasi di perangkat untuk akses lebih cepat dan offline.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleInstall}
                className="px-4 py-2 rounded-md text-sm font-medium transition"
                style={{ 
                  backgroundColor: 'var(--accent)',
                  color: 'var(--bg-primary)'
                }}
              >
                Install
              </button>
              <button
                onClick={closeInstall}
                className="text-sm transition hover:underline"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Nanti
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default PWAUpdatePrompt;