import { useLocation } from 'react-router-dom';
import { useAccessibility } from './useAccessibility';
import { useAuth } from './useAuth';
import { getColorBlindFilter } from '../utils/accessibilityStyles';

/**
 * Nilai CSS `filter` untuk mode buta warna, berikut aturan pengecualiannya.
 *
 * Filter TIDAK dipasang di satu elemen induk, melainkan pada tiap elemen yang
 * oleh WebKit/Safari dijadikan lapisan render tersendiri — navbar (sticky),
 * baris yang bisa digeser (overflow), serta elemen position: fixed — karena
 * lapisan semacam itu digambar di atas hasil filter induknya, sehingga
 * warnanya tidak ikut berubah di iPhone.
 *
 * Aturan pakai: sebuah elemen ber-filter TIDAK BOLEH berada di dalam elemen
 * ber-filter lain, karena filternya akan tertumpuk dua kali di browser yang
 * memang sudah menerapkannya dengan benar (Chrome, Firefox).
 */
export const useFilterWarna = () => {
  const { preferences } = useAccessibility();
  const { isAdmin } = useAuth();
  const { pathname } = useLocation();

  // Panel admin memakai tata warna sendiri, sedangkan halaman setup
  // preferensi punya kotak pratinjau yang sudah memfilter dirinya sendiri.
  const dikecualikan = isAdmin || pathname.startsWith('/setup-preferences');

  return dikecualikan ? 'none' : getColorBlindFilter(preferences.modeButaWarna);
};
