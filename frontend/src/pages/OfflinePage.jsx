import { Link } from 'react-router-dom';

function OfflinePage() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-8"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="max-w-md text-center animate-fade-in">
        <div className="mb-8">
          <div 
            className="inline-block p-5 rounded-full"
            style={{ 
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <svg 
              className="w-12 h-12" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              style={{ color: 'var(--accent)' }}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="1.5" 
                d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
        </div>
        
        <span 
          className="text-xs uppercase tracking-[0.3em] font-medium"
          style={{ color: 'var(--accent)' }}
        >
          Mode Offline
        </span>
        
        <h1 
          className="font-bold tracking-tight text-4xl mt-3 mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          Anda Sedang Offline
        </h1>
        
        <p 
          className="mb-8 leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          Periksa koneksi internet Anda. Halaman yang sudah pernah dibuka 
          masih bisa diakses meski tanpa koneksi.
        </p>
        
        <div className="space-y-3">
          <Link 
            to="/" 
            className="block px-5 py-3 rounded-md font-medium transition"
            style={{ 
              backgroundColor: 'var(--accent)',
              color: 'var(--bg-primary)'
            }}
          >
            Coba Buka Beranda
          </Link>
          <button 
            onClick={() => window.location.reload()}
            className="block w-full text-sm transition hover:underline"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Muat Ulang Halaman
          </button>
        </div>
      </div>
    </div>
  );
}

export default OfflinePage;