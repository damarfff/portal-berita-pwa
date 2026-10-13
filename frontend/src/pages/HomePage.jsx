import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getArticles, getCategories } from '../services/articleService';
import { getCategoryPreferences } from '../services/preferenceService';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/Logo';
import ArticleCard from '../components/ArticleCard';
import HeadlineCarousel from '../components/HeadlineCarousel';
import { scrollKeSection, SECTION_ARTIKEL } from '../utils/scroll';
import { useFilterWarna } from '../hooks/useFilterWarna';
import ChevronLeftIcon from '../components/ChevronLeftIcon';

const ARTICLES_PAGE_SIZE = 9;
const REKOMENDASI_MAX = 10;

// Fisher-Yates. Dipakai untuk isian baris rekomendasi ketika pengunjung
// belum punya kategori favorit, supaya barisnya tidak pernah kosong.
const acakArtikel = (daftar) => {
  const hasil = [...daftar];
  for (let i = hasil.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [hasil[i], hasil[j]] = [hasil[j], hasil[i]];
  }
  return hasil;
};

function HomePage() {
  const [articles, setArticles] = useState([]);
  const [shuffledArticles, setShuffledArticles] = useState([]);
  const [favoriteCategories, setFavoriteCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [showAllArticles, setShowAllArticles] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  // Beranda memasang filter buta warna per section, bukan lewat <main>,
  // karena baris rekomendasi (overflow-x) harus memfilter dirinya sendiri —
  // kalau dibungkus section ber-filter, di Chrome jadi tertumpuk dua kali.
  const filterWarna = useFilterWarna();
  const gayaFilter = { filter: filterWarna };
  const { isLoggedIn, isUser, isGuest } = useAuth();

  // Klik "Beranda" (Navbar/Footer) selalu menavigasi ke "/", dan App.jsx
  // memberi HomePage `key={location.key}` sehingga navigasi itu — bahkan
  // saat sudah di beranda — membuat komponen ini mount ulang dari nol:
  // semua state (filter kategori, mode "lihat semua", carousel, data)
  // otomatis kembali ke kondisi awal seperti baru membuka website. Di sini
  // cukup tambahkan scroll halus ke atas tiap kali itu terjadi.
  // Navbar bisa mengirim tujuan lewat state navigasi (mis. menekan
  // "Artikel" dari halaman lain). Menunggu `loading` selesai dulu karena
  // section tujuannya baru ada setelah data artikel dirender.
  const scrollTarget = location.state?.scrollTo;

  useEffect(() => {
    if (loading) return;

    if (scrollTarget) {
      requestAnimationFrame(() => scrollKeSection(scrollTarget));
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [loading, scrollTarget]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [articlesData, categoriesData] = await Promise.all([
          getArticles(),
          getCategories()
        ]);
        setArticles(articlesData);
        setShuffledArticles(acakArtikel(articlesData));
        setCategories(categoriesData);

        if (isLoggedIn && isUser) {
          try {
            setFavoriteCategories(await getCategoryPreferences());
          } catch {
            // Kategori favorit sifatnya pelengkap — kalau gagal diambil,
            // baris rekomendasi tinggal jatuh ke "Rekomendasi Populer".
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [isLoggedIn, isUser]);

  const carouselArticles = articles.slice(0, 3);

  useEffect(() => {
    if (carouselArticles.length <= 1) return;
    const timer = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % carouselArticles.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselArticles.length]);

  const filteredArticles = useMemo(() => {
    if (!activeCategoryId) return articles;
    return articles.filter(a => a.category?.id === activeCategoryId);
  }, [articles, activeCategoryId]);

  // Rekomendasi diambil dari kategori favorit yang user pilih saat setup
  // awal. Kalau belum login atau belum memilih favorit, isinya berita acak
  // dengan judul berbeda supaya barisnya tidak pernah kosong.
  const rekomendasi = useMemo(() => {
    const favoritIds = favoriteCategories.map(c => c.id);
    const personal = favoritIds.length > 0
      ? articles.filter(a => favoritIds.includes(a.category?.id))
      : [];

    return personal.length > 0
      ? { judul: 'Rekomendasi untuk Anda', daftar: personal.slice(0, REKOMENDASI_MAX) }
      : { judul: 'Rekomendasi Populer', daftar: shuffledArticles.slice(0, REKOMENDASI_MAX) };
  }, [articles, shuffledArticles, favoriteCategories]);

  const rekomendasiRowRef = useRef(null);

  const geserRekomendasi = (arah) => {
    const baris = rekomendasiRowRef.current;
    if (!baris) return;
    baris.scrollBy({ left: arah * baris.clientWidth * 0.8, behavior: 'smooth' });
  };

  const handleArticleClick = (slug) => {
    if (!isLoggedIn || (!isUser && !isGuest)) {
      navigate('/login');
      return;
    }
    navigate(`/article/${slug}`);
  };

  // Memilih kategori menyembunyikan hero & baris rekomendasi, jadi isi
  // halaman menyusut drastis. Tanpa dikembalikan ke atas, pengguna yang tadi
  // sudah menggulir akan mendarat di tengah-tengah daftar — terasa seperti
  // halaman meloncat. Kembalikan ke atas supaya seperti membuka halaman baru.
  const pilihKategori = (categoryId) => {
    setActiveCategoryId(categoryId);
    setShowAllArticles(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryClick = (categoryId) => {
    pilihKategori(activeCategoryId === categoryId ? null : categoryId);
  };

  // Tombol "Lihat Berita Lainnya" melompat ke daftar artikel — tujuan yang
  // sama dengan menu "Artikel" di navbar, jadi keduanya memakai helper ini.
  const handleLihatBeritaLainnya = () => scrollKeSection(SECTION_ARTIKEL);

  const handleShowAllArticles = () => {
    setShowAllArticles(true);
    // Hero & carousel di atas ikut hilang begitu state ini berubah, jadi
    // konten bakal "lompat" tanpa ini. Scroll santai ke atas biar
    // perubahannya terasa, bukan tiba-tiba.
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16" style={gayaFilter}>
        <p style={{ color: 'var(--text-tertiary)' }}>Memuat...</p>
      </div>
    );
  }

  // Semua artikel tetap ditampilkan di daftar bawah, termasuk 3 berita
  // terbaru yang juga muncul di carousel "Berita Terbaru" di atas.
  const restArticles = filteredArticles;

  // Saat tidak ada filter kategori dan belum ditekan "Lihat Selengkapnya",
  // batasi jadi 9 artikel saja. Begitu kategori dipilih (atau sudah pernah
  // klik "Lihat Selengkapnya"), tampilkan semua tanpa batas.
  const isBrowsingAll = !!activeCategoryId || showAllArticles;
  const visibleArticles = isBrowsingAll
    ? restArticles
    : restArticles.slice(0, ARTICLES_PAGE_SIZE);
  const canShowMoreArticles = !isBrowsingAll && restArticles.length > ARTICLES_PAGE_SIZE;

  const activeCategory = activeCategoryId
    ? categories.find(c => c.id === activeCategoryId)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {!isBrowsingAll && (
        <section className="mb-12 animate-fade-in" style={gayaFilter}>
          {/* Judul halaman untuk pembaca layar. Secara visual perannya
              diambil alih oleh logo (tamu) atau headline besar (sudah login). */}
          <h1 className="sr-only">
            Aksa Portal Berita — berita yang dapat dibaca oleh siapa saja
          </h1>

          {isLoggedIn ? (
            // Sudah login: perkenalan portal tidak lagi diperlukan, jadi
            // berita terbaru langsung tampil selebar halaman sebagai headline.
            carouselArticles.length > 0 && (
              <HeadlineCarousel
                besar
                articles={carouselArticles}
                index={carouselIndex}
                onIndexChange={setCarouselIndex}
                onArticleClick={handleArticleClick}
              />
            )
          ) : (
            /* Di desktop kolomnya sengaja tidak 50:50: teks perkenalan cuma
                selebar max-w-md, jadi kalau dibagi rata sisa ruang di
                tengahnya menganga. Kolom carousel dibuat lebih lebar supaya
                berita terbaru bergeser ke kiri, gap-nya tetap disisakan.
                Di HP tetap satu kolom seperti semula. */
            <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-10 lg:gap-10 lg:items-center">
              <div>
                <Logo className="mb-6" />

                <p
                  className="text-base md:text-lg max-w-md leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Portal berita yang dirancang dengan fitur aksesibilitas yang dapat disesuaikan
                  dengan kebutuhan visual Anda.
                </p>

                <div className="flex items-stretch sm:items-center gap-2 sm:gap-3 mt-8">
                  {/* Gaya hover-nya sengaja disamakan dengan chip kategori di
                      section "Kategori": garis tepi & teks berubah jadi warna aksen. */}
                  <button
                    type="button"
                    onClick={handleLihatBeritaLainnya}
                    className="flex-1 sm:flex-none min-w-0 px-3.5 sm:px-7 py-3 sm:py-3.5 rounded-full font-medium text-[13px] sm:text-base sm:whitespace-nowrap transition cursor-pointer"
                    style={{
                      backgroundColor: 'transparent',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)'
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
                    Lihat Berita
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="flex-1 sm:flex-none min-w-0 px-3.5 sm:px-7 py-3 sm:py-3.5 rounded-full font-semibold text-[13px] sm:text-base sm:whitespace-nowrap transition cursor-pointer"
                    style={{
                      backgroundColor: 'var(--accent)',
                      color: 'var(--bg-primary)'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent-hover)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent)'; }}
                  >
                    Masuk untuk Coba
                  </button>
                </div>
              </div>

              {carouselArticles.length > 0 && (
                <HeadlineCarousel
                  articles={carouselArticles}
                  index={carouselIndex}
                  onIndexChange={setCarouselIndex}
                  onArticleClick={handleArticleClick}
                />
              )}
            </div>
          )}
        </section>
      )}

      {/* Section rekomendasi sengaja tidak difilter di level section:
          filternya dipasang di dalam, pada lajur kartunya. Kalau section-nya
          ikut difilter, di Chrome hasilnya jadi tertumpuk dua kali. */}
      {!isBrowsingAll && rekomendasi.daftar.length > 0 && (
        <section className="mb-12 animate-fade-in-delay-2">
          <div className="flex items-center gap-4 mb-6" style={gayaFilter}>
            <h3
              className="text-xl font-bold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              {rekomendasi.judul}
            </h3>
            <div
              className="h-px flex-1"
              style={{ backgroundColor: 'var(--border-subtle)' }}
            />
            <div className="flex gap-2 flex-shrink-0">
              {[
                { arah: -1, label: 'Geser rekomendasi ke kiri', titik: '15 18 9 12 15 6' },
                { arah: 1, label: 'Geser rekomendasi ke kanan', titik: '9 18 15 12 9 6' }
              ].map(tombol => (
                <button
                  key={tombol.arah}
                  type="button"
                  onClick={() => geserRekomendasi(tombol.arah)}
                  aria-label={tombol.label}
                  className="flex items-center justify-center rounded-full transition cursor-pointer"
                  style={{
                    width: '32px',
                    height: '32px',
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points={tombol.titik} />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Sengaja tanpa scroll-snap: dengan snap aktif (mandatory maupun
              proximity), Chromium menempel ke kartu terakhir saat kartu
              dirender bertahap, sehingga baris terbuka dalam keadaan sudah
              ter-scroll habis ke kanan. */}
          <div
            ref={rekomendasiRowRef}
            className="slider-row overflow-x-auto pt-2 pb-4"
          >
            {/* Filter dipasang sekali di lajur ini, bukan pada wadah yang
                digulir (harus dihitung ulang tiap frame) dan bukan pula pada
                tiap kartu (sepuluh lapisan berfilter sekaligus).

                `will-change: transform` penting saat filter aktif: tanpa itu
                Safari membuang lalu menggambar ulang hasil filter tiap
                thumbnail yang masuk/keluar layar sehingga gambarnya berkedip
                saat digeser. Dengan ini hasil filter lajur disimpan sekali,
                dan menggeser tinggal memindahkan hasil yang sudah jadi. */}
            <div
              className="flex gap-5 w-max"
              style={{
                ...gayaFilter,
                willChange: filterWarna === 'none' ? undefined : 'transform',
                backfaceVisibility: filterWarna === 'none' ? undefined : 'hidden'
              }}
            >
              {rekomendasi.daftar.map(article => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onClick={() => handleArticleClick(article.slug)}
                  className="w-[260px] flex-shrink-0"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {categories.length > 0 && (
        <section className="mb-12 animate-fade-in-delay-3" style={gayaFilter}>
          <div className="flex items-baseline gap-4 mb-6">
            <h3 
              className="text-xl font-bold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              Kategori
            </h3>
            <div 
              className="h-px flex-1"
              style={{ backgroundColor: 'var(--border-subtle)' }}
            />
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <button
              onClick={() => pilihKategori(null)}
              className="text-sm px-4 py-1.5 rounded-full transition cursor-pointer"
              style={{
                backgroundColor: !activeCategoryId ? 'var(--accent)' : 'transparent',
                color: !activeCategoryId ? 'var(--bg-primary)' : 'var(--text-secondary)',
                border: `1px solid ${!activeCategoryId ? 'var(--accent)' : 'var(--border-subtle)'}`,
                fontWeight: !activeCategoryId ? 500 : 400
              }}
            >
              Semua
            </button>
            {categories.map(cat => {
              const isActive = activeCategoryId === cat.id;
              return (
                <button
                  key={cat.id} 
                  onClick={() => handleCategoryClick(cat.id)}
                  className="text-sm px-4 py-1.5 rounded-full transition cursor-pointer"
                  style={{ 
                    backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                    color: isActive ? 'var(--bg-primary)' : 'var(--text-secondary)',
                    border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border-subtle)'}`,
                    fontWeight: isActive ? 500 : 400
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = 'var(--accent)';
                      e.currentTarget.style.color = 'var(--accent)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  {cat.nama}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {activeCategory && (
        <section className="mb-10 animate-fade-in" style={gayaFilter}>
          <div className="flex items-baseline gap-4 mb-2">
            <span 
              className="text-xs uppercase tracking-[0.2em] font-medium"
              style={{ color: 'var(--accent)' }}
            >
              Kategori
            </span>
          </div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <h2 
              className="text-3xl md:text-4xl font-bold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              {activeCategory.nama}
            </h2>
            <span 
              className="text-sm"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {filteredArticles.length} artikel
            </span>
          </div>
        </section>
      )}

      {restArticles.length > 0 && (
        <section id={SECTION_ARTIKEL} className="animate-fade-in-delay-4 scroll-mt-24" style={gayaFilter}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleArticles.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                onClick={() => handleArticleClick(article.slug)}
              />
            ))}
          </div>

          {canShowMoreArticles && (
            <div className="mt-10 flex justify-center">
              <button
                onClick={handleShowAllArticles}
                className="text-sm font-medium px-6 py-3 rounded-full transition cursor-pointer"
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid var(--accent)',
                  color: 'var(--accent)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent-muted)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                Lihat Selengkapnya
              </button>
            </div>
          )}
        </section>
      )}

      {filteredArticles.length === 0 && activeCategoryId && (
        <div className="text-center py-16" style={gayaFilter}>
          <p style={{ color: 'var(--text-tertiary)' }}>
            Belum ada artikel di kategori "{activeCategory?.nama}"
          </p>
          <button
            onClick={() => pilihKategori(null)}
            className="mt-4 text-sm hover:underline inline-flex items-center gap-2"
            style={{ color: 'var(--accent)' }}
          >
            <><ChevronLeftIcon /> Lihat semua artikel</>
          </button>
        </div>
      )}

      {articles.length === 0 && (
        <div className="text-center py-16" style={gayaFilter}>
          <p style={{ color: 'var(--text-tertiary)' }}>
            Belum ada artikel yang dipublikasikan
          </p>
        </div>
      )}
    </div>
  );
}

export default HomePage;
