import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Logo from './Logo';
import { useFilterWarna } from '../hooks/useFilterWarna';

const ICON_PROPS = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
};

// `desc` tampil menggantikan label saat kartunya ditekan.
const AKSESIBILITAS_ITEMS = [
  {
    label: 'Pembacaan suara',
    desc: 'Artikel dibacakan dengan suara. Kecepatan dan volumenya bisa Anda atur sendiri.',
    icon: (
      <svg {...ICON_PROPS} aria-hidden="true">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      </svg>
    )
  },
  {
    label: 'Mode kontras',
    desc: 'Pilih tampilan standar, kontras tinggi, atau gelap sesuai kenyamanan mata.',
    icon: (
      <svg {...ICON_PROPS} aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 18a6 6 0 0 0 0-12z" fill="currentColor" stroke="none" />
      </svg>
    )
  },
  {
    label: 'Filter buta warna',
    desc: 'Warna situs disesuaikan untuk protanopia, deuteranopia, atau tritanopia.',
    icon: (
      <svg {...ICON_PROPS} aria-hidden="true">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  },
  {
    label: 'Ukuran teks',
    desc: 'Empat pilihan ukuran huruf dan tiga tingkat kerenggangan antar baris.',
    icon: (
      <svg {...ICON_PROPS} aria-hidden="true">
        <polyline points="4 7 4 4 20 4 20 7" />
        <line x1="9" y1="20" x2="15" y2="20" />
        <line x1="12" y1="4" x2="12" y2="20" />
      </svg>
    )
  }
];

function Footer() {
  const { isLoggedIn } = useAuth();
  // Kartu fitur yang sedang menampilkan deskripsi; satu saja yang terbuka
  // supaya tinggi footer tidak melonjak.
  const [fiturTerbuka, setFiturTerbuka] = useState(null);
  const location = useLocation();
  const filterWarna = useFilterWarna();
  const year = new Date().getFullYear();

  // Klik ke "/" saat sudah berada di beranda tidak memicu navigasi apa pun
  // di react-router (route-nya sama), jadi halaman terasa "diam" walau
  // sudah di-klik. Di sini kita paksa balik ke atas seperti membuka
  // beranda baru; kalau posisinya di halaman lain, biarkan Link menavigasi
  // seperti biasa lalu ikut digulir ke atas.
  const handleBerandaClick = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer
      id="tentang"
      className="mt-24 scroll-mt-24"
      style={{ borderTop: '1px solid var(--border-subtle)', filter: filterWarna }}
    >
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-10 mb-10">
          <div>
            <Link
              to="/"
              onClick={handleBerandaClick}
              className="inline-flex mb-3"
            >
              <Logo variant="wordmark" size="sm" />
            </Link>
            <p
              className="text-sm max-w-xs leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              Portal berita yang dirancang agar dapat dibaca oleh siapa saja,
              dengan pengaturan tampilan dan suara yang dapat disesuaikan
              dengan kebutuhan visual Anda.
            </p>
          </div>

          <div>
            <h3
              className="text-xs uppercase tracking-[0.2em] font-medium mb-4"
              style={{ color: 'var(--accent)' }}
            >
              Aksesibilitas
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {AKSESIBILITAS_ITEMS.map((item) => {
                const terbuka = fiturTerbuka === item.label;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setFiturTerbuka(terbuka ? null : item.label)}
                    aria-expanded={terbuka}
                    title={terbuka ? 'Tutup keterangan' : `Lihat keterangan ${item.label}`}
                    className="kartu-fitur rounded-xl p-4 text-left transition cursor-pointer"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: `1px solid ${terbuka ? 'var(--accent)' : 'var(--border-subtle)'}`
                    }}
                    onMouseEnter={(e) => { if (!terbuka) e.currentTarget.style.borderColor = 'var(--border-emphasis)'; }}
                    onMouseLeave={(e) => { if (!terbuka) e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                  >
                    <div className="mb-2.5" style={{ color: 'var(--accent)' }}>
                      {item.icon}
                    </div>

                    {terbuka ? (
                      <p
                        className="text-xs leading-relaxed"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {item.desc}
                      </p>
                    ) : (
                      <p
                        className="text-sm font-semibold leading-snug"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {item.label}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="md:pl-8">
            <h3
              className="text-xs uppercase tracking-[0.2em] font-medium mb-4"
              style={{ color: 'var(--accent)' }}
            >
              Jelajahi
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/"
                  onClick={handleBerandaClick}
                  className="text-sm transition hover:opacity-80"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Beranda
                </Link>
              </li>
              {!isLoggedIn && (
                <>
                  <li>
                    <Link
                      to="/login"
                      className="text-sm transition hover:opacity-80"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Masuk
                    </Link>
                  </li>
                  <li className="pt-1">
                    <Link
                      to="/register"
                      className="inline-block text-sm px-4 py-1.5 rounded-md transition font-medium"
                      style={{
                        backgroundColor: 'var(--accent)',
                        color: 'var(--bg-primary)'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent-hover)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent)'; }}
                    >
                      Daftar
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div
          className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            © {year} Aksa · Portal Berita 
          </p>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Dibaca oleh mata, telinga, atau keduanya.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
