// Lockup logo "aksa. Portal Berita" — dibangun dari teks/CSS (bukan gambar
// raster) supaya tetap tajam di semua ukuran layar dan otomatis mengikuti
// skema warna (var(--accent), var(--text-primary), dst).
//
// variant="full"     -> kotak ikon "a" + wordmark "aksa." + subtitle "Portal Berita"
//                        (dipakai di hero HomePage)
// variant="wordmark"  -> cuma wordmark "aksa." + titik aksen, tanpa ikon/subtitle
//                        (dipakai di Navbar)
const WORDMARK_SIZE = {
  lg: 'text-3xl md:text-4xl',
  sm: 'text-2xl'
};

const DOT_SIZE = {
  lg: 'w-2 h-2 md:w-2.5 md:h-2.5 mb-1 ml-1',
  sm: 'w-1.5 h-1.5 mb-0.5 ml-0.5'
};

function Wordmark({ size }) {
  return (
    <div className="flex items-end">
      <span
        className={`font-wordmark font-extrabold tracking-tight ${WORDMARK_SIZE[size]}`}
        style={{ color: 'var(--text-primary)' }}
      >
        aksa
      </span>
      <span
        className={`flex-shrink-0 ${DOT_SIZE[size]}`}
        style={{ backgroundColor: 'var(--accent)' }}
      />
    </div>
  );
}

function Logo({ variant = 'full', size = 'lg', className = '' }) {
  if (variant === 'wordmark') {
    return (
      <div className={className}>
        <Wordmark size={size} />
      </div>
    );
  }

  const isLg = size === 'lg';

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div
        className={`flex items-center justify-center rounded-2xl flex-shrink-0 ${
          isLg ? 'w-16 h-16 md:w-20 md:h-20' : 'w-11 h-11'
        }`}
        style={{ backgroundColor: 'var(--accent)' }}
        aria-hidden="true"
      >
        <span
          className={`font-wordmark font-bold ${isLg ? 'text-4xl md:text-5xl' : 'text-2xl'}`}
          style={{ color: 'var(--bg-primary)', lineHeight: 1 }}
        >
          a
        </span>
      </div>

      <div>
        <Wordmark size={size} />
        <p
          className={`uppercase font-medium tracking-[0.3em] ${isLg ? 'text-xs mt-1' : 'text-[10px] mt-0.5'}`}
          style={{ color: 'var(--text-tertiary)' }}
        >
          Portal Berita
        </p>
      </div>
    </div>
  );
}

export default Logo;
