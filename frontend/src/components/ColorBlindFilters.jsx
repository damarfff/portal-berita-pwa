/**
 * Filter koreksi warna (daltonisasi) untuk pengguna dengan gangguan penglihatan
 * warna.
 *
 * PENTING — ini BUKAN filter simulasi. Matriks simulasi meniru apa yang dilihat
 * penyandang buta warna; berguna untuk developer bermata normal, tapi bagi
 * penggunanya sendiri justru meruntuhkan warna yang sudah sulit ia bedakan.
 * Yang dipasang di sini kebalikannya: selisih warna yang jatuh di sumbu yang
 * tidak terlihat digeser ke sumbu yang masih utuh, supaya pasangan warna yang
 * tadinya tertukar jadi bisa dipisahkan.
 *
 * Tiap matriks disusun dari D = I + S(I − M), lalu diproyeksikan agar memenuhi
 * dua kendala:
 *
 *   M = simulasi dikromasi Machado dkk. (2009) keparahan 1.0
 *   S = redistribusi galat ke kanal yang masih terlihat (bobot 0,7)
 *
 *   1. Tiap baris berjumlah 1,0 → hitam, abu-abu, dan putih tidak bergeser
 *      sedikit pun. Latar dan teks badan aman.
 *   2. wᵀD = wᵀ dengan w = luminansi relatif WCAG (0.2126, 0.7152, 0.0722) →
 *      luminansi tiap warna tidak berubah, sehingga SELURUH rasio kontras
 *      WCAG tetap persis sama seperti sebelum difilter. Tanpa kendala ini,
 *      kontras --accent di tema terang anjlok dari 5,39 ke 2,95.
 *
 * JANGAN menambahkan color-interpolation-filters="sRGB" di sini. Matriks ini
 * diturunkan di ruang linear-RGB, dan linearRGB memang default SVG — mengubahnya
 * ke sRGB akan membuat hasilnya salah.
 */
function ColorBlindFilters() {
  return (
    <svg 
      style={{ position: 'absolute', width: 0, height: 0 }} 
      aria-hidden="true"
    >
      <defs>
        {/* Kerucut L (merah) tidak berfungsi. Selisih merah–hijau didorong ke
            kanal biru. Merah/danger bergeser ke magenta, hijau/sukses ke
            hijau-kekuningan. */}
        <filter id="protanopia-filter" colorInterpolationFilters="linearRGB">
          <feColorMatrix
            type="matrix"
            values=" 0.8541  0.1604 -0.0145 0 0
                    -0.0119  1.0164 -0.0044 0 0
                     0.5477 -0.6342  1.0865 0 0
                     0       0       0      1 0"
          />
        </filter>

        {/* Kerucut M (hijau) tidak berfungsi. Sumbu kebingungannya bertetangga
            dengan protanopia, jadi hasilnya memang mirip — itu memang sifat
            kondisinya, bukan tanda filter tidak bekerja. */}
        <filter id="deuteranopia-filter" colorInterpolationFilters="linearRGB">
          <feColorMatrix
            type="matrix"
            values=" 0.9435  0.0920 -0.0356 0 0
                    -0.0272  1.0346 -0.0075 0 0
                     0.4355 -0.6141  1.1786 0 0
                     0       0       0      1 0"
          />
        </filter>

        {/* Kerucut S (biru) tidak berfungsi. Sumbu yang bermasalah biru–kuning,
            bukan merah–hijau, jadi galat digeser ke kanal merah dan hijau. */}
        <filter id="tritanopia-filter" colorInterpolationFilters="linearRGB">
          <feColorMatrix
            type="matrix"
            values=" 0.7417 -0.2622  0.5206 0 0
                     0.0768  1.0730 -0.1498 0 0
                     0.0002  0.0492  0.9506 0 0
                     0       0       0      1 0"
          />
        </filter>
      </defs>
    </svg>
  );
}

export default ColorBlindFilters;
