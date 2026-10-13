import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/authService';
import { buatPesanValidasi, hapusPesanValidasi } from '../utils/formValidation';
import ChevronLeftIcon from '../components/ChevronLeftIcon';

function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [konfirmasiPassword, setKonfirmasiPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== konfirmasiPassword) {
      setError('Konfirmasi kata sandi tidak cocok');
      return;
    }

    if (password.length < 6) {
      setError('Kata sandi minimal 6 karakter');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email, password);
      navigate('/login', {
        replace: true,
        state: { message: 'Kata sandi berhasil diatur ulang. Silakan masuk dengan kata sandi baru.' }
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Terjadi kesalahan saat mengatur ulang kata sandi'
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
            Pulihkan Akses
          </span>
        </div>

        <div className="animate-fade-in-delay-2 max-w-md">
          <div
            className="font-bold tracking-tight text-5xl leading-tight mb-6"
            style={{ color: 'var(--text-primary)' }}
          >
            Kembali membaca dengan
            <span style={{ color: 'var(--accent)' }}> nyaman</span> dan
            <span style={{ color: 'var(--accent)' }}> aman</span>.
          </div>
          <div
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Gunakan email yang terdaftar untuk membuat kata sandi baru.
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
              to="/login"
              className="text-sm transition hover:opacity-70 inline-flex items-center gap-2"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <><ChevronLeftIcon /> Kembali ke login</>
            </Link>
          </div>

          <div className="mb-10">
            <h1
              className="font-bold tracking-tight text-4xl mb-3"
              style={{ color: 'var(--text-primary)' }}
            >
              Lupa Kata Sandi?
            </h1>
            <p
              className="text-base"
              style={{ color: 'var(--text-secondary)' }}
            >
              Masukkan email dan kata sandi baru Anda.
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
                Email Terdaftar
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onInput={hapusPesanValidasi}
                onInvalid={buatPesanValidasi({
                  wajib: 'Isi email terdaftar Anda',
                  email: 'Masukkan alamat email yang valid'
                })}
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
                Kata Sandi Baru
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onInput={hapusPesanValidasi}
                onInvalid={buatPesanValidasi({
                  wajib: 'Isi kata sandi baru Anda',
                  terlaluPendek: 'Kata sandi baru minimal 6 karakter'
                })}
                minLength={6}
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
                Konfirmasi Kata Sandi Baru
              </label>
              <input
                type="password"
                value={konfirmasiPassword}
                onChange={(e) => setKonfirmasiPassword(e.target.value)}
                onInput={hapusPesanValidasi}
                onInvalid={buatPesanValidasi({
                  wajib: 'Konfirmasi kata sandi baru Anda',
                  terlaluPendek: 'Konfirmasi kata sandi minimal 6 karakter'
                })}
                minLength={6}
                required
                style={inputStyle}
                className="w-full px-4 py-3 rounded-md transition"
                placeholder="Ulangi kata sandi baru"
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
              {loading ? 'Menyimpan...' : 'Simpan Kata Sandi Baru'}
            </button>
          </form>

          <p
            className="text-xs mt-6 text-center"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Pengaturan ulang kata sandi dilakukan berdasarkan email tanpa kode OTP.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
