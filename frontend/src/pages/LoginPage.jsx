import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginUser(email, password);
      login(response.user, 'user');
      
      if (response.user.isFirstLogin) {
        navigate('/setup-preferences');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Terjadi kesalahan saat login'
      );
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-body)'
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div 
        className="hidden lg:flex flex-col justify-between p-12 relative"
        style={{ 
          backgroundColor: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-subtle)'
        }}
      >
        <div className="animate-fade-in">
          <span 
            className="text-xs uppercase tracking-[0.3em] font-medium"
            style={{ color: 'var(--accent)' }}
          >
            Selamat Datang Kembali
          </span>
        </div>

        <div className="animate-fade-in-delay-2 max-w-md">
          <div 
            className="font-bold tracking-tight text-5xl leading-tight mb-6"
            style={{ color: 'var(--text-primary)' }}
          >
            "Membaca tidak hanya tentang
            <span style={{ color: 'var(--accent)' }}> mata</span>,
            tapi tentang akses untuk
            <span style={{ color: 'var(--accent)' }}> setiap</span> orang."
          </div>
          <div 
            className="text-sm uppercase tracking-widest"
            style={{ color: 'var(--text-tertiary)' }}
          >
           
          </div>
        </div>

        <div className="animate-fade-in-delay-3">
          <p 
            className="text-sm"
            style={{ color: 'var(--text-tertiary)' }}
          >
            AKSA · Portal Berita 
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md animate-fade-in-delay-1">
          <div className="mb-10">
            <Link 
              to="/" 
              className="text-sm transition hover:opacity-70 inline-flex items-center gap-2"
              style={{ color: 'var(--text-tertiary)' }}
            >
              ← Kembali ke beranda
            </Link>
          </div>

          <div className="mb-10">
            <h1 
 className="font-bold tracking-tight text-4xl mb-3"
              style={{ color: 'var(--text-primary)' }}
            >
              Masuk
            </h1>
            <p 
              className="text-base"
              style={{ color: 'var(--text-secondary)' }}
            >
              Lanjutkan membaca dengan preferensi tersimpan
            </p>
          </div>

          {error && (
            <div 
              className="p-4 rounded-lg mb-6 text-sm flex items-start gap-3"
              style={{ 
                backgroundColor: 'rgba(248, 81, 73, 0.1)',
                border: '1px solid rgba(248, 81, 73, 0.3)',
                color: 'var(--danger)'
              }}
            >
              <span className="flex-1">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label 
                className="block text-xs uppercase tracking-widest font-medium mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
                className="w-full px-4 py-3 rounded-md transition focus:border-accent"
                placeholder="email@contoh.com"
              />
            </div>

            <div>
              <label 
                className="block text-xs uppercase tracking-widest font-medium mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={inputStyle}
                className="w-full px-4 py-3 rounded-md transition"
                placeholder="Minimal 6 karakter"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-md font-medium transition disabled:opacity-50 disabled:cursor-not-allowed mt-8"
              style={{ 
                backgroundColor: 'var(--accent)',
                color: 'var(--bg-primary)'
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = 'var(--accent)')}
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p 
              className="text-sm mb-6"
              style={{ color: 'var(--text-secondary)' }}
            >
              Belum punya akun?{' '}
              <Link 
                to="/register" 
                className="transition hover:underline"
                style={{ color: 'var(--accent)' }}
              >
                Daftar di sini
              </Link>
            </p>

            <div 
              className="pt-6"
              style={{ borderTop: '1px solid var(--border-subtle)' }}
            >
              <Link 
                to="/admin/login" 
                className="text-xs uppercase tracking-widest transition hover:opacity-70"
                style={{ color: 'var(--text-tertiary)' }}
              >
                - Masuk sebagai Admin -
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;