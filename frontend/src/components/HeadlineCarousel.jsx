// Carousel "Berita Terbaru". Dipakai dua ukuran di beranda:
// - besar=false : setengah lebar, mendampingi logo & tagline (pengunjung tamu)
// - besar=true  : selebar halaman sebagai headline utama (user yang sudah login)
// Struktur dan gayanya sama persis, yang berbeda hanya proporsi & skala teks.
function HeadlineCarousel({ articles, index, onIndexChange, onArticleClick, besar = false }) {
  const article = articles[index];
  if (!article) return null;

  // Di layar HP varian "besar" mengikuti ukuran varian biasa — rasio 21:9
  // terlalu pendek untuk judul panjang sehingga teksnya terpotong.
  const kelasTombol = besar ? 'w-9 h-9 md:w-11 md:h-11' : 'w-9 h-9';

  const gayaTombol = {
    // Tanpa backdrop-filter, alasannya sama seperti badge di ArticleCard.
    backgroundColor: 'rgba(0,0,0,0.6)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: 'var(--accent)'
  };

  return (
    <div className="animate-fade-in-delay-2">
      <div className="flex items-baseline gap-4 mb-6">
        <h3
          className={`font-bold tracking-tight ${besar ? 'text-xl md:text-2xl' : 'text-xl'}`}
          style={{ color: 'var(--text-primary)' }}
        >
          Berita Terbaru
        </h3>
        <div
          className="h-px flex-1"
          style={{ backgroundColor: 'var(--border-subtle)' }}
        />
      </div>

      <div
        // Rasio tetap baru diterapkan mulai layar sm. Di HP tingginya
        // ditentukan isi (dengan tinggi minimum), jadi judul sepanjang apa
        // pun tidak pernah terpotong keluar kotak.
        className={`relative rounded-xl overflow-hidden cursor-pointer group ${
          besar ? 'sm:aspect-[16/9] md:aspect-[21/9]' : 'sm:aspect-[16/9]'
        } zoom-hover`}
        onClick={() => onArticleClick(article.slug)}
      >
        {article.thumbnailUrl ? (
          <img
            src={article.thumbnailUrl}
            alt={article.judul}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          />
        )}

        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.1) 100%)'
          }}
        />

        <div
          className={`relative flex flex-col justify-end sm:h-full ${
            besar ? 'min-h-[230px] p-6 sm:p-8 md:p-12' : 'min-h-[210px] p-6 md:p-8'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            {/* Putih di atas terracotta --accent cuma ~3.9:1 (gagal WCAG AA),
                jadi labelnya memakai --on-accent — token yang memang dibuat
                untuk teks di atas latar aksen dan ikut berganti per tema. */}
            <span
              className="text-xs uppercase tracking-widest font-medium px-3 py-1 rounded-full"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--on-accent)' }}
            >
              Utama
            </span>
            <span className="text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.65)' }}>
              {article.category?.nama}
            </span>
          </div>

          <h2
            className={`font-bold leading-snug tracking-tight ${
              besar
                ? 'text-xl sm:text-2xl md:text-4xl lg:text-5xl max-w-4xl'
                : 'text-xl md:text-2xl'
            }`}
            style={{ color: '#fff' }}
          >
            {article.judul}
          </h2>
        </div>

        {articles.length > 1 && (
          <>
            {/* Panah disembunyikan di HP: dengan judul panjang, teksnya
                memenuhi kotak sehingga panah yang melayang di tengah menutupi
                awal judul. Titik indikator di bawah tetap bisa ditekan untuk
                berpindah berita. */}
            <button
              onClick={(e) => { e.stopPropagation(); onIndexChange((index - 1 + articles.length) % articles.length); }}
              aria-label="Berita sebelumnya"
              className={`absolute ${besar ? 'left-3 md:left-5' : 'left-3'} ${kelasTombol} top-1/2 -translate-y-1/2 hidden sm:flex items-center justify-center rounded-full transition-all duration-200`}
              style={gayaTombol}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.7)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.45)'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); onIndexChange((index + 1) % articles.length); }}
              aria-label="Berita berikutnya"
              className={`absolute ${besar ? 'right-3 md:right-5' : 'right-3'} ${kelasTombol} top-1/2 -translate-y-1/2 hidden sm:flex items-center justify-center rounded-full transition-all duration-200`}
              style={gayaTombol}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.7)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.45)'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            <div className={`absolute ${besar ? 'bottom-5 right-6 md:bottom-7 md:right-8' : 'bottom-5 right-6'} flex gap-2`}>
              {articles.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); onIndexChange(i); }}
                  aria-label={`Ke berita ke-${i + 1}`}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === index ? '20px' : '8px',
                    height: '8px',
                    backgroundColor: i === index ? 'var(--accent)' : 'rgba(255,255,255,0.45)'
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default HeadlineCarousel;
