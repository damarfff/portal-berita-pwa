import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginAdmin } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { buatPesanValidasi, hapusPesanValidasi } from '../utils/formValidation';
import ChevronLeftIcon from '../components/ChevronLeftIcon';

function AdminLoginPage() {
  const [username, setUsername] = useState('');
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
      const response = await loginAdmin(username, password);
      login(response.admin, 'admin');
      navigate('/admin/dashboard');
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
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md animate-fade-in">
        <div 
          className="rounded-lg p-10"
          style={{ 
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <div className="mb-8">
            <span 
              className="text-xs uppercase tracking-[0.3em] font-medium"
              style={{ color: 'var(--accent)' }}
            >
              Area Khusus
            </span>
            <h1 
 className="font-bold tracking-tight text-3xl mt-3"
              style={{ color: 'var(--text-primary)' }}
            >
              Masuk Admin
            </h1>
            <p 
              className="text-sm mt-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              Akses panel pengelolaan konten
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
                Nama Pengguna
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onInput={hapusPesanValidasi}
                onInvalid={buatPesanValidasi({ wajib: 'Isi nama pengguna admin' })}
                required
                style={inputStyle}
                className="w-full px-4 py-3 rounded-md transition"
                placeholder="admin"
              />
            </div>

            <div>
              <label 
                className="block text-xs uppercase tracking-widest font-medium mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                Kata Sandi
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onInput={hapusPesanValidasi}
                onInvalid={buatPesanValidasi({ wajib: 'Isi kata sandi admin' })}
                required
                style={inputStyle}
                className="w-full px-4 py-3 rounded-md transition"
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
              {loading ? 'Memproses...' : 'Masuk Admin'}
            </button>
          </form>

          <div 
            className="mt-8 pt-6 text-center"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <Link 
              to="/login" 
              className="text-xs uppercase tracking-widest transition hover:opacity-70 inline-flex items-center gap-2"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <><ChevronLeftIcon /> Kembali ke Login Pengguna</>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
