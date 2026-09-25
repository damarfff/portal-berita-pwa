export const getTextSizeClass = (ukuranTeks) => {
  const sizeMap = {
    'small': 'text-sm',
    'medium': 'text-base',
    'large': 'text-lg',
    'extra-large': 'text-xl'
  };
  return sizeMap[ukuranTeks] || 'text-base';
};

export const getLineSpacingClass = (jarakBaris) => {
  const spacingMap = {
    'normal': 'leading-relaxed',
    'relaxed': 'leading-loose',
    'loose': 'leading-[2.2]'
  };
  return spacingMap[jarakBaris] || 'leading-relaxed';
};

// Nilai modeKontras yang tersimpan ('normal' | 'high-contrast' | 'dark')
// dipetakan ke nama tema yang dipakai CSS. Nilai simpanannya sengaja tidak
// diubah supaya baris preferensi user lama tetap valid, sementara di CSS
// namanya dibuat eksplisit — '[data-kontras="normal"]' yang ternyata berarti
// tema terang hanya akan membingungkan saat dibaca nanti.
const THEME_MAP = {
  'normal': 'terang',
  'high-contrast': 'tinggi',
  'dark': 'gelap'
};

export const getContrastTheme = (modeKontras) => THEME_MAP[modeKontras] || 'gelap';

// Memasang tema ke <html>. Satu-satunya tempat yang boleh menulis atribut ini,
// supaya tidak ada dua pihak yang saling menimpa: AccessibilityProvider
// memanggilnya untuk tema tersimpan, dan halaman setup preferensi lewat
// pratinjau kontras milik provider yang sama.
export const terapkanTema = (modeKontras) => {
  const root = document.documentElement;
  root.dataset.kontras = getContrastTheme(modeKontras);

  // <meta name="theme-color"> ikut disamakan karena di Android bilah status
  // PWA membaca nilai itu — kalau dibiarkan tetap gelap, memilih mode terang
  // menyisakan bilah hitam di atas halaman putih. Nilainya dibaca dari token
  // yang sudah aktif supaya tidak ada daftar warna kedua yang harus dijaga.
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    const bg = getComputedStyle(root).getPropertyValue('--bg-primary').trim();
    if (bg) meta.setAttribute('content', bg);
  }
};

export const getColorBlindFilter = (modeButaWarna) => {
  const filterMap = {
    'none': 'none',
    'protanopia': 'url(#protanopia-filter)',
    'deuteranopia': 'url(#deuteranopia-filter)',
    'tritanopia': 'url(#tritanopia-filter)'
  };
  return filterMap[modeButaWarna] || 'none';
};