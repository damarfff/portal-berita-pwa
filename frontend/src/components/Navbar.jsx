import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAccessibility } from '../hooks/useAccessibility';
import { useFilterWarna } from '../hooks/useFilterWarna';
import Logo from './Logo';
import { scrollKeSection, SECTION_ARTIKEL, SECTION_TENTANG } from '../utils/scroll';

const ICON_PROPS = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
};

const MENU = [
  {
    id: SECTION_TENTANG,
    label: 'Tentang',
    icon: (
      <svg {...ICON_PROPS} aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="11" />
        <line x1="12" y1="7.5" x2="12.01" y2="7.5" />
      </svg>
    )
  },
  {
    id: 'beranda',
    label: 'Beranda',
    icon: (
      <svg {...ICON_PROPS} aria-hidden="true">
        <path d="M3 9.5 12 3l9 6.5V20a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 20z" />
        <path d="M9.5 21.5V13h5v8.5" />
      </svg>
    )
  },
  {
    id: SECTION_ARTIKEL,
    label: 'Artikel',
    icon: (
      <svg {...ICON_PROPS} aria-hidden="true">
        <path d="M5 4h13a1 1 0 0 1 1 1v14a2 2 0 0 0 2 2H4a2 2 0 0 1-2-2V8h3" />
        <path d="M8 8h7" />
        <path d="M8 12h7" />
        <path d="M8 16h4" />
      </svg>
    )
  }
];

function Navbar() {
  const { isLoggedIn, isAdmin, isUser, isGuest, user, logout } = useAuth();
  const { preferences } = useAccessibility();
  const filterWarna = useFilterWarna();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Blur latar dimatikan saat filter buta warna aktif: menumpuk
  // backdrop-filter di dalam elemen yang sudah difilter membuat WebKit gagal
  // merender filternya. Latar solid dipakai sebagai penggantinya.
  const filterWarnaAktif = preferences.modeButaWarna !== 'none';

  const [seksiAktif, setSeksiAktif] = useState('beranda');
  const [terscroll, setTerscroll] = useState(false);

  // Penanda menu aktif mengikuti posisi gulir, bukan hanya klik — jadi saat
  // pengguna menggulir sendiri sampai footer, penandanya ikut pindah ke
  // "Tentang". Perhitungan dibungkus requestAnimationFrame supaya tidak
  // dijalankan berkali-kali pada tiap event scroll.
  useEffect(() => {
    let frame = 0;

    const hitung = () => {
      setTerscroll(window.scrollY > 8);

      const artikel = document.getElementById(SECTION_ARTIKEL);
      const tentang = document.getElementById(SECTION_TENTANG);

      // "Artikel" aktif begitu daftar artikel melewati garis navbar,
      // sedangkan "Tentang" cukup footernya masuk ke bagian bawah layar —
      // footer tidak akan pernah bisa digulir sampai menyentuh navbar.
      const garisNavbar = window.scrollY + 140;
      const garisBawah = window.scrollY + window.innerHeight * 0.8;
      const posisiAtas = (el) => el.getBoundingClientRect().top + window.scrollY;

      let aktif = pathname === '/' ? 'beranda' : null;
      if (artikel && posisiAtas(artikel) <= garisNavbar) aktif = SECTION_ARTIKEL;
      if (tentang && posisiAtas(tentang) <= garisBawah) aktif = SECTION_TENTANG;

      setSeksiAktif(aktif);
    };

    const jadwalkan = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(hitung);
    };

    jadwalkan();
    window.addEventListener('scroll', jadwalkan, { passive: true });
    window.addEventListener('resize', jadwalkan);

    // Tinggi halaman berubah bukan hanya karena resize: data artikel selesai
    // dimuat, filter kategori ditekan, "Lihat Selengkapnya" diklik. Tanpa
    // ini, posisi footer yang terhitung saat halaman masih pendek (masih
    // "Memuat...") akan menempel dan penandanya salah.
    const pemantauTinggi = new ResizeObserver(jadwalkan);
    pemantauTinggi.observe(document.body);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', jadwalkan);
      window.removeEventListener('resize', jadwalkan);
      pemantauTinggi.disconnect();
    };
  }, [pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleMenu = (id) => {
    if (id === 'beranda') {
      navigate('/');
      return;
    }

    // Section tujuan tidak selalu ada di halaman yang sedang dibuka (mis.
    // "Artikel" saat berada di halaman login), jadi pindah ke beranda dulu
    // sambil menitipkan tujuannya lewat state navigasi.
    if (!scrollKeSection(id)) {
      navigate('/', { state: { scrollTo: id } });
    }
  };

  const daftarMenu = (
    // Di layar sempit hanya ikonnya yang tampil supaya semuanya tetap muat
    // satu baris bersama logo dan tombol. Labelnya tidak dihapus, melainkan
    // disembunyikan secara visual (sr-only) agar tetap terbaca pembaca layar.
    //
    // Padding tombol dibuat simetris (py, bukan hanya pb): ruang bawah untuk
    // garis penanda membuat teksnya terdorong ke atas dan tampak tidak
    // sejajar dengan logo maupun tombol Masuk/Daftar.
    <div className="flex items-center gap-4 md:gap-7">
      {MENU.map(item => {
        const aktif = seksiAktif === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleMenu(item.id)}
            aria-current={aktif ? 'true' : undefined}
            className="relative flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] py-1.5 transition cursor-pointer"
            style={{ color: aktif ? 'var(--accent)' : 'var(--text-secondary)' }}
            onMouseEnter={(e) => { if (!aktif) e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { if (!aktif) e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            {item.icon}
            <span className="sr-only md:not-sr-only">{item.label}</span>
            <span
              className="absolute left-0 right-0 bottom-0 h-0.5 rounded-full transition-all duration-300"
              style={{
                backgroundColor: 'var(--accent)',
                opacity: aktif ? 1 : 0,
                transform: aktif ? 'scaleX(1)' : 'scaleX(0.4)'
              }}
            />
          </button>
        );
      })}
    </div>
  );

  return (
    // Tanpa garis pembatas bawah, dan latarnya baru muncul setelah halaman
    // digulir — saat di puncak halaman navbar menyatu dengan konten.
    <nav
      className="sticky top-0 z-30 transition-colors duration-300"
      style={{
        backgroundColor: terscroll
          ? (filterWarnaAktif ? 'rgb(13, 17, 23)' : 'rgba(13, 17, 23, 0.85)')
          : 'transparent',
        backdropFilter: terscroll && !filterWarnaAktif ? 'blur(12px)' : 'none',
        // Navbar sticky = lapisan render sendiri, jadi filternya dipasang di
        // sini; kalau mengandalkan filter induk, warnanya tidak ikut berubah.
        filter: filterWarna
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-4">
        <Link to="/" className="inline-flex">
          <Logo variant="wordmark" size="sm" />
        </Link>

        <div className="justify-self-center">{daftarMenu}</div>

        <div className="flex items-center gap-2.5 sm:gap-4 justify-self-end">
          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className="text-sm transition hover:opacity-80"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Dashboard Admin
                </Link>
              )}

              {/* Nama akun jadi pintu masuk ke halaman preferensi supaya
                  kategori favorit bisa diubah kapan saja, tidak hanya saat
                  setup awal. Admin tidak diberi tautan karena halaman itu
                  khusus peran user. */}
              {isUser || isGuest ? (
                <Link
                  to="/setup-preferences"
                  className="text-sm transition inline-flex items-center"
                  style={{ color: 'var(--text-tertiary)' }}
                  title={isGuest ? 'Coba fitur aksesibilitas' : 'Atur preferensi & kategori favorit'}
                  aria-label={isGuest
                    ? 'Coba fitur aksesibilitas'
                    : `Preferensi akun ${user?.nama || user?.username || ''}`}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; }}
                >
                  {/* Di layar sempit namanya diganti ikon akun: nama panjang
                      membuat navbar tidak muat satu baris, sedangkan aksesnya
                      ke halaman preferensi tetap harus ada di HP. */}
                  <svg {...ICON_PROPS} className="sm:hidden" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="10" r="3" />
                    <path d="M6.5 19.6a6 6 0 0 1 11 0" />
                  </svg>
                  <span className="hidden sm:inline">{user?.nama || user?.username}</span>
                </Link>
              ) : (
                <span
                  className="text-sm hidden sm:inline"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {user?.nama || user?.username}
                </span>
              )}

              <button
                onClick={handleLogout}
                className="text-sm px-4 py-1.5 rounded-md transition"
                style={{
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.color = 'var(--accent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm transition hover:opacity-80"
                style={{ color: 'var(--text-secondary)' }}
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="text-sm px-4 py-1.5 rounded-md transition font-medium"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--bg-primary)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent)'}
              >
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
