import { useState } from 'react';
import {
  getTextSizeClass,
  getLineSpacingClass,
  getContrastTheme,
  getColorBlindFilter
} from '../utils/accessibilityStyles';

// Foto contoh (server/ruang data dengan lampu indikator merah-hijau-biru) —
// mirip gambar sampul artikel sungguhan, sekaligus tetap kaya warna agar
// efek filter buta warna terlihat jelas.
const SAMPLE_IMAGE_URL =
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=70';

// variant "ringkas" dipakai wizard di layar HP: sampul dipendekkan, baris
// penulis/tanggal dilepas, dan badannya satu paragraf saja — semata supaya
// preview muat satu layar bersama kartu pengaturannya. Ukuran teks, jarak
// baris, kontras, dan filter warnanya tetap apa adanya, sebab justru itu yang
// sedang dinilai. Satu paragraf masih cukup panjang (empat baris pada ukuran
// normal) untuk memperlihatkan efek jarak baris.
function ArticlePreview({ preferences, variant = 'full' }) {
  const [imageError, setImageError] = useState(false);
  const ringkas = variant === 'ringkas';

  const textSize = getTextSizeClass(preferences.ukuranTeks);
  const lineSpacing = getLineSpacingClass(preferences.jarakBaris);
  const colorBlindFilter = getColorBlindFilter(preferences.modeButaWarna);

  // data-kontras dipasang di elemen ini, bukan cuma di <html>: preview harus
  // menampilkan pilihan yang BELUM disimpan, sementara <html> masih memakai
  // tema tersimpan. Karena blok [data-kontras=...] di index.css mendefinisi
  // ulang custom property-nya, seluruh isi preview otomatis ikut temanya
  // lewat var(--...) biasa — tanpa satu pun warna ditulis mati di sini.
  const tema = getContrastTheme(preferences.modeKontras);

  const judulClass = ringkas
    ? (preferences.ukuranTeks === 'extra-large' ? 'text-2xl' :
       preferences.ukuranTeks === 'large' ? 'text-xl' :
       preferences.ukuranTeks === 'small' ? 'text-base' :
       'text-lg')
    : (preferences.ukuranTeks === 'extra-large' ? 'text-4xl' :
       preferences.ukuranTeks === 'large' ? 'text-3xl' :
       preferences.ukuranTeks === 'small' ? 'text-xl' :
       'text-2xl');

  return (
    <div
      data-kontras={tema}
      className={`transition-all ${ringkas ? 'p-4' : 'rounded-lg p-8'}`}
      style={{
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        filter: colorBlindFilter,
        // Versi ringkas dipasang di dalam satu bingkai bersama kartu
        // pengaturannya, jadi bingkai dan sudut membulatnya diserahkan ke
        // pembungkus itu supaya keduanya terbaca sebagai satu komponen.
        ...(ringkas ? {} : { border: '1px solid var(--border-subtle)' })
      }}
    >
      {/* Gambar sampul contoh (foto asli) seperti thumbnail artikel sungguhan.
          Badge merah/hijau di atasnya membantu memperlihatkan efek filter
          buta warna dengan jelas. */}
      <div
        className={`relative w-full rounded-md overflow-hidden ${ringkas ? 'h-24 sm:h-32 mb-3' : 'aspect-video mb-5'}`}
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        {!imageError && (
          <img
            src={SAMPLE_IMAGE_URL}
            alt="Ilustrasi teknologi AI"
            loading="lazy"
            onError={() => setImageError(true)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div
          className="absolute inset-0"
          style={{ background: 'var(--image-scrim)' }}
        />
        <span
          className={`absolute rounded text-[10px] font-bold uppercase tracking-wider text-white ${ringkas ? 'top-2 left-2 px-2 py-0.5' : 'top-3 left-3 px-2.5 py-1'}`}
          style={{ backgroundColor: '#e5484d' }}
        >
          ● Live
        </span>
        <span
          className={`absolute rounded text-[10px] font-bold uppercase tracking-wider text-white ${ringkas ? 'top-2 right-2 px-2 py-0.5' : 'top-3 right-3 px-2.5 py-1'}`}
          style={{ backgroundColor: '#27ae60' }}
        >
          ✓ Terverifikasi
        </span>
      </div>

      <span
        className={`inline-block text-xs font-semibold uppercase tracking-widest ${ringkas ? 'mb-1.5' : 'mb-3'}`}
        style={{ color: 'var(--accent)' }}
      >
        Teknologi
      </span>

      <h2 className={`font-bold tracking-tight leading-tight ${judulClass} ${ringkas ? 'mb-2' : 'mb-4'}`}>
        Kemajuan Teknologi AI di Indonesia
      </h2>

      {!ringkas && (
        <div
          className="text-sm mb-5 flex items-center gap-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          <span>Oleh Administrator</span>
          <span>·</span>
          <span>25 April 2026</span>
        </div>
      )}

      <div className={`${textSize} ${lineSpacing} space-y-3`}>
        <p>
          Artikel ini membahas perkembangan kecerdasan buatan di Indonesia. 
          Berbagai startup lokal mulai mengembangkan solusi berbasis AI untuk 
          mengatasi masalah nyata di masyarakat.
        </p>

        {!ringkas && (
          <>
            <p>
              Dari aplikasi pertanian pintar hingga sistem diagnosa medis, AI
              telah menjadi bagian penting dari ekosistem digital Indonesia.
              Para ahli memprediksi tren ini akan terus berkembang.
            </p>

            <p>
              Pemerintah juga menunjukkan dukungan terhadap perkembangan AI
              melalui berbagai inisiatif dan program pendanaan.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default ArticlePreview;
