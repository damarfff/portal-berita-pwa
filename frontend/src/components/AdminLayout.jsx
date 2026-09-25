import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Overview' },
    { path: '/admin/articles', label: 'Artikel' },
    { path: '/admin/categories', label: 'Kategori' }
  ];

  const isActive = (path) => {
    if (path === '/admin/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div 
      className="min-h-screen flex"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <aside 
        className="w-64 flex flex-col"
        style={{ 
          backgroundColor: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-subtle)'
        }}
      >
        <div 
          className="px-6 py-6"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <Link 
            to="/admin/dashboard" 
 className="font-bold tracking-tight text-xl block"
            style={{ color: 'var(--text-primary)' }}
          >
            Portal<span style={{ color: 'var(--accent)' }}>.</span>Berita
          </Link>
          <span 
            className="text-xs uppercase tracking-[0.2em] font-medium mt-1 block"
            style={{ color: 'var(--accent)' }}
          >
            Admin Panel
          </span>
        </div>

        <nav className="flex-1 p-4">
          <p 
            className="text-xs uppercase tracking-widest font-medium mb-3 px-3"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Navigasi
          </p>
          {menuItems.map(item => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md mb-1 text-sm transition"
                style={{
                  backgroundColor: active ? 'var(--accent-muted)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--text-secondary)',
                  fontWeight: active ? 500 : 400,
                  borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent'
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div 
          className="p-4"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <p 
            className="text-xs uppercase tracking-widest font-medium mb-1"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Login sebagai
          </p>
          <p 
            className="text-sm font-medium mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            {user?.nama || user?.username}
          </p>
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm transition py-1"
            style={{ color: 'var(--danger)' }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            ← Keluar
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;