import { useState, useEffect } from 'react';
import { AccessibilityContext } from './AccessibilityContextObject';
import { getPreferences, updatePreferences } from '../services/preferenceService';
import { useAuth } from '../hooks/useAuth';
import { terapkanTema } from '../utils/accessibilityStyles';

// Default kontras 'dark', bukan 'normal'. Sejak 'normal' berarti tema terang,
// memakainya sebagai default akan membuat halaman publik (Login, Beranda) dan
// setiap user baru terbuka dengan tampilan terang — padahal gelap yang
// dipertahankan sebagai tampilan pertama aplikasi ini. Nilai yang sama juga
// dipasang di schema.prisma dan default wizard SetupPreferencesPage.
const DEFAULT_PREFERENCES = {
  ukuranTeks: 'medium',
  modeKontras: 'dark',
  modeButaWarna: 'none',
  jarakBaris: 'normal',
  kecepatanTts: 1.0,
  volumeTts: 1.0
};

const STORAGE_KEY = 'accessibilityPreferences';
const VISITOR_STORAGE_KEY = 'visitorAccessibilityPreferences';

// localStorage di sini cuma dipakai sebagai cache SELAMA user yang
// bersangkutan masih login — supaya saat berpindah halaman (atau refresh)
// tidak sempat "kedip" ke tampilan default sebelum hasil fetch datang.
// Begitu user logout, cache ini WAJIB dihapus (lihat clearStoredPreferences)
// supaya mode buta warna/kontras milik user tersebut tidak nempel ke
// halaman publik seperti Login untuk user/pengunjung berikutnya.
const loadStoredPreferences = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
};

const loadVisitorPreferences = () => {
  try {
    const raw = sessionStorage.getItem(VISITOR_STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
};

const persistPreferences = (prefs) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // abaikan (mis. mode private/storage penuh)
  }
};

const persistVisitorPreferences = (prefs) => {
  try {
    sessionStorage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // abaikan (mis. mode private/storage penuh)
  }
};

const clearStoredPreferences = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // abaikan
  }
};

const clearVisitorPreferences = () => {
  try {
    sessionStorage.removeItem(VISITOR_STORAGE_KEY);
  } catch {
    // abaikan (mis. mode private/storage penuh)
  }
};

const normalizePreferences = (prefs) => ({
  ukuranTeks: prefs.ukuranTeks || 'medium',
  modeKontras: prefs.modeKontras || 'dark',
  modeButaWarna: prefs.modeButaWarna || 'none',
  jarakBaris: prefs.jarakBaris || 'normal',
  kecepatanTts: parseFloat(prefs.kecepatanTts) || 1.0,
  volumeTts: parseFloat(prefs.volumeTts) || 1.0
});

export const AccessibilityProvider = ({ children }) => {
  const { isLoggedIn, isUser, isGuest } = useAuth();
  // Inisialisasi berdasarkan status login SAAT MOUNT: user memakai cache
  // lokal, sedangkan pengunjung memakai cache sesi sementara.
  const [preferences, setPreferences] = useState(() =>
    isLoggedIn && isUser
      ? loadStoredPreferences()
      : isLoggedIn && isGuest
        ? loadVisitorPreferences()
        : DEFAULT_PREFERENCES
  );
  const [loading, setLoading] = useState(false);

  // Kontras yang sedang "dicoba" tapi belum disimpan. Dipakai halaman setup
  // preferensi supaya seluruh halaman — bukan cuma kotak preview-nya — ikut
  // berubah saat user menyorot pilihan. Disimpan di sini, bukan dipasang
  // sendiri oleh halaman itu, supaya atribut tema tetap punya satu pemilik:
  // kalau keduanya sama-sama menulis, hasil fetch preferensi yang datang
  // belakangan akan menimpa pilihan yang sedang dicoba user.
  const [pratinjauKontras, setPratinjauKontras] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadPreferences = async () => {
      if (isLoggedIn && isUser) {
        setLoading(true);
        try {
          const prefs = await getPreferences();
          if (!cancelled) {
            const normalized = normalizePreferences(prefs);
            setPreferences(normalized);
            persistPreferences(normalized);
          }
        } catch (error) {
          console.error('Gagal memuat preferensi:', error);
        } finally {
          if (!cancelled) setLoading(false);
        }
      } else if (isLoggedIn && isGuest) {
        setPreferences(loadVisitorPreferences());
        setLoading(false);
      } else {
        // Belum login, logout, atau login sebagai admin: kembali ke default
        // dan buang cache lokal/sementara agar preferensi tidak menempel ke
        // halaman publik atau pengunjung berikutnya.
        setPreferences(DEFAULT_PREFERENCES);
        clearStoredPreferences();
        clearVisitorPreferences();
      }
    };

    loadPreferences();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, isUser, isGuest]);

  // Tema dipasang sebagai atribut di <html>, bukan style inline di komponen:
  // token warnanya perlu terbaca juga oleh body, scrollbar, dan elemen
  // fixed/overlay yang berada di luar pembungkus React mana pun. Pratinjau
  // (kalau ada) menang atas nilai tersimpan — lihat komentar state-nya.
  useEffect(() => {
    terapkanTema(pratinjauKontras || preferences.modeKontras);
  }, [pratinjauKontras, preferences.modeKontras]);

  const updatePrefs = async (newPrefs) => {
    if (isGuest) {
      // Panel aksesibilitas mengirim perubahan satu field saja. Gabungkan
      // dulu dengan preferensi yang sedang aktif agar, misalnya, memilih
      // mode buta warna tidak mengembalikan kontras terang ke default gelap.
      const normalized = normalizePreferences({ ...preferences, ...newPrefs });
      setPreferences(normalized);
      persistVisitorPreferences(normalized);
      return normalized;
    }

    try {
      const updated = await updatePreferences(newPrefs);
      const normalized = normalizePreferences(updated);
      setPreferences(normalized);
      persistPreferences(normalized);
      return updated;
    } catch (error) {
      console.error('Gagal update preferensi:', error);
      throw error;
    }
  };

  const value = {
    preferences,
    loading,
    updatePrefs,
    setPratinjauKontras
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};
