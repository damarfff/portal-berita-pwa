import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, loginUser } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

function RegisterPage() {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [konfirmPassword, setKonfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== konfirmPassword) {
      setError('Konfirmasi password tidak cocok');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    setLoading(true);

    try {
      await registerUser(email, password, nama);
      const loginResponse = await loginUser(email, password);
      login(loginResponse.user, 'user');
      navigate('/setup-preferences');
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Terjadi kesalahan saat registrasi'
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
        className="hidden lg:flex flex-col justify-between p-12"
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
            Bergabung
          </span>
        </div>

        <div className="animate-fade-in-delay-2 max-w-md">
          <div 
            className="font-bold tracking-tight text-5xl leading-tight mb-6"
            style={{ color: 'var(--text-primary)' }}
          >
            Setiap pembaca punya
            <span style={{ color: 'var(--accent)' }}> kebutuhan</span> berbeda. 
            Setiap akun punya
            <span style={{ color: 'var(--accent)' }}> pengaturan</span> sendiri.
          </div>
          <div 
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Dengan mendaftar, Anda dapat menyimpan preferensi visual seperti 
            ukuran teks, mode kontras, dan filter warna yang akan otomatis 
            diterapkan saat Anda membaca artikel.
          </div>
        </div>

        <div className="animate-fade-in-delay-3">
          <p 
            className="text-sm"
            style={{ color: 'var(--text-tertiary)' }}
          >
            AKSA · Portal Berita PWA  
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
              Daftar
            </h1>
            <p 
              className="text-base"
              style={{ color: 'var(--text-secondary)' }}
            >
              Buat akun untuk pengalaman yang dipersonalisasi
            </p>
          </div>

          {error && (
            <div 
              className="p-4 rounded-lg mb-6 text-sm"
              style={{ 
                backgroundColor: 'rgba(248, 81, 73, 0.1)',
                border: '1px solid rgba(248, 81, 73, 0.3)',
                color: 'var(--danger)'
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label 
                className="block text-xs uppercase tracking-widest font-medium mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                Nama Lengkap
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
                style={inputStyle}
                className="w-full px-4 py-3 rounded-md transition"
                placeholder="Nama lengkap Anda"
              />
            </div>

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
                className="w-full px-4 py-3 rounded-md transition"
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

            <div>
              <label 
                className="block text-xs uppercase tracking-widest font-medium mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                Konfirmasi Password
              </label>
              <input
                type="password"
                value={konfirmPassword}
                onChange={(e) => setKonfirmPassword(e.target.value)}
                required
                style={inputStyle}
                className="w-full px-4 py-3 rounded-md transition"
                placeholder="Ulangi password"
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
              {loading ? 'Mendaftar...' : 'Buat Akun'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p 
              className="text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              Sudah punya akun?{' '}
              <Link 
                to="/login" 
                className="transition hover:underline"
                style={{ color: 'var(--accent)' }}
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;