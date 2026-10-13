import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '../services/articleService';
import { getCategoryPreferences, updateCategoryPreferences } from '../services/preferenceService';
import { setFirstLoginDone, setVisitorSetupDone } from '../services/authService';
import { speak, stop } from '../services/ttsService';
import { useAccessibility } from '../hooks/useAccessibility';
import { useAuth } from '../hooks/useAuth';
import ArticlePreview from '../components/ArticlePreview';
import { getColorBlindFilter } from '../utils/accessibilityStyles';

const OPSI_UKURAN_TEKS = [
  { value: 'small', label: 'Kecil' },
  { value: 'medium', label: 'Normal' },
  { value: 'large', label: 'Besar' },
  { value: 'extra-large', label: 'XL' }
];

// Urutan sengaja diawali "Gelap" karena itu tampilan default aplikasi.
// Label 'normal' dulu "Standar" — menyesatkan sejak nilai itu berarti tema
// terang sementara defaultnya gelap. Nilai simpanannya tidak diubah supaya
// preferensi user lama tetap valid.
const OPSI_KONTRAS = [
  { value: 'dark', label: 'Gelap' },
  { value: 'normal', label: 'Terang' },
  { value: 'high-contrast', label: 'Tinggi' }
];

const OPSI_BUTA_WARNA = [
  { value: 'none', label: 'Tidak Ada' },
  { value: 'protanopia', label: 'Protanopia' },
  { value: 'deuteranopia', label: 'Deuteranopia' },
  { value: 'tritanopia', label: 'Tritanopia' }
];

const OPSI_JARAK_BARIS = [
  { value: 'normal', label: 'Normal' },
  { value: 'relaxed', label: 'Renggang' },
  { value: 'loose', label: 'Sangat Renggang' }
];

function SectionLabel({ children, description }) {
  return (
    <div className="mb-4">
      <h3
        className="text-xs uppercase tracking-[0.2em] font-medium mb-1"
        style={{ color: 'var(--accent)' }}
      >
        {children}
      </h3>
      {description && (
        <p
          className="text-sm"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {description}
        </p>
      )}
    </div>
  );
}

// Kontrol-kontrol di bawah ini dipakai dua kali dengan susunan berbeda: satu
// per kartu di kolom kanan (layar lebar), dan satu per langkah wizard (HP).
// Dijadikan komponen supaya kedua susunan itu tidak pernah berbeda isinya.
function PilihanOpsi({ options, value, onChange, cols, tombolStyle }) {
  return (
    <div className={`grid ${cols} gap-2`}>
      {options.map(option => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          style={tombolStyle(value === option.value)}
          className="py-2.5 px-3 rounded-md text-sm"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function PilihanKategori({ categories, selectedIds, onToggle, tombolStyle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onToggle(cat.id)}
          style={tombolStyle(selectedIds.includes(cat.id))}
          className="px-4 py-1.5 rounded-full text-sm"
        >
          {cat.nama}
        </button>
      ))}
    </div>
  );
}

function PengaturanTts({ preferences, onChange, isPlaying, onPreview, onStop }) {
  return (
    <>
      <div className="mb-5">
        <div className="flex justify-between text-sm mb-2">
          <span style={{ color: 'var(--text-secondary)' }}>Kecepatan</span>
          <span style={{ color: 'var(--accent)', fontWeight: 500 }}>
            {preferences.kecepatanTts.toFixed(1)}x
          </span>
        </div>
        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          value={preferences.kecepatanTts}
          onChange={(e) => onChange('kecepatanTts', parseFloat(e.target.value))}
          className="w-full"
          style={{ accentColor: 'var(--accent)' }}
        />
      </div>

      <div className="mb-5">
        <div className="flex justify-between text-sm mb-2">
          <span style={{ color: 'var(--text-secondary)' }}>Volume</span>
          <span style={{ color: 'var(--accent)', fontWeight: 500 }}>
            {Math.round(preferences.volumeTts * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={preferences.volumeTts}
          onChange={(e) => onChange('volumeTts', parseFloat(e.target.value))}
          className="w-full"
          style={{ accentColor: 'var(--accent)' }}
        />
      </div>

      <div
        className="pt-4"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        <p
          className="text-xs mb-3"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Klik tombol di bawah untuk mendengar contoh suara dengan pengaturan saat ini.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPreview}
            disabled={isPlaying}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition disabled:opacity-50"
            style={{
              backgroundColor: isPlaying ? 'var(--bg-elevated)' : 'var(--accent)',
              color: isPlaying ? 'var(--text-secondary)' : 'var(--bg-primary)',
              border: `1px solid ${isPlaying ? 'var(--border-subtle)' : 'var(--accent)'}`
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            {isPlaying ? 'Sedang memutar...' : 'Coba Suara'}
          </button>
          {isPlaying && (
            <button
              type="button"
              onClick={onStop}
              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--danger)',
                border: '1px solid rgba(248, 81, 73, 0.3)'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12"/>
              </svg>
              Hentikan
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function KotakError({ pesan }) {
  if (!pesan) return null;
  return (
    <div
      className="p-4 rounded-lg text-sm"
      style={{
        backgroundColor: 'rgba(248, 81, 73, 0.1)',
        border: '1px solid rgba(248, 81, 73, 0.3)',
        color: 'var(--danger)'
      }}
    >
      {pesan}
    </div>
  );
}

function SetupPreferencesPage() {
  const navigate = useNavigate();
  const { preferences: savedPreferences, updatePrefs, setPratinjauKontras } = useAccessibility();
  const { user, isUser, isGuest, login } = useAuth();

  // Halaman ini dipakai dua kali: sebagai setup awal sesudah mendaftar, dan
  // sebagai halaman ubah preferensi lewat nama akun di navbar.
  const isSetupAwal = user?.isFirstLogin !== false;

  const [preferences, setPreferences] = useState(() => {
    const awal = savedPreferences || {
      ukuranTeks: 'medium',
      modeKontras: 'dark',
      modeButaWarna: 'none',
      jarakBaris: 'normal',
      kecepatanTts: 1.0,
      volumeTts: 1.0
    };
    // Setup awal selalu dimulai dari tampilan gelap, apa pun yang tersimpan.
    // Akun lama bisa menyimpan 'normal' peninggalan masa ketika nilai itu
    // masih berarti gelap; sekarang artinya terang, jadi tanpa baris ini
    // halaman setup mereka terbuka sudah terang sebelum memilih apa pun.
    return isSetupAwal ? { ...awal, modeKontras: 'dark' } : awal;
  });

  const [categories, setCategories] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [indeksLangkah, setIndeksLangkah] = useState(0);
  const isFirstRender = useRef(true);

  // Halaman ini tempat user MEMILIH tampilannya, jadi seluruh halaman ikut
  // berubah begitu pilihan disorot — bukan cuma kotak preview-nya. Diserahkan
  // ke provider lewat pratinjau supaya tidak berebut atribut tema dengannya.
  useEffect(() => {
    setPratinjauKontras(preferences.modeKontras);
  }, [preferences.modeKontras, setPratinjauKontras]);

  // Saat halaman ditinggalkan, pratinjau dilepas supaya tampilan kembali ke
  // preferensi tersimpan. Kalau user menyimpan, nilai tersimpan itu memang
  // sudah jadi pilihan barunya; kalau batal, tampilannya kembali seperti
  // semula tanpa meninggalkan tema yang tidak pernah ia simpan.
  useEffect(() => {
    return () => setPratinjauKontras(null);
  }, [setPratinjauKontras]);
  const restartTimeoutRef = useRef(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        // Kategori favorit yang sudah tersimpan ikut diambil dan langsung
        // ditandai terpilih. Tanpa ini, user yang membuka halaman ini untuk
        // mengubah favoritnya akan melihat pilihan kosong — dan menyimpan
        // akan menghapus seluruh favorit lamanya.
        const favoritPromise = isUser
          ? getCategoryPreferences().catch(() => [])
          : Promise.resolve([]);
        const [cats, favorit] = await Promise.all([
          getCategories(),
          favoritPromise
        ]);
        setCategories(cats);
        setSelectedCategoryIds(favorit.map(c => c.id));
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };
    loadCategories();
  }, [isUser]);

  useEffect(() => {
    return () => {
      stop();
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
    };
  }, []);

  // Web Speech API tidak mendukung perubahan rate/volume pada suara yang
  // sedang berjalan, jadi saat slider digeser ketika preview sedang
  // diputar, kita ulangi pemutaran dengan pengaturan terbaru (di-debounce
  // agar tidak restart berkali-kali saat slider masih digeser).
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!isPreviewPlaying) return;

    if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
    restartTimeoutRef.current = setTimeout(() => {
      handlePreviewTts();
    }, 300);

    return () => {
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferences.kecepatanTts, preferences.volumeTts]);

  const handleChange = (field, value) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const toggleCategory = (categoryId) => {
    setSelectedCategoryIds(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  function handlePreviewTts() {
    const sampleText = 'Selamat datang di Portal Berita. Ini adalah contoh suara dengan kecepatan dan volume yang Anda atur saat ini. Anda dapat menyesuaikan pengaturan ini sesuai dengan preferensi Anda.';

    speak(sampleText, {
      rate: preferences.kecepatanTts,
      volume: preferences.volumeTts,
      onStart: () => setIsPreviewPlaying(true),
      onEnd: () => setIsPreviewPlaying(false),
      onError: () => setIsPreviewPlaying(false)
    });
  }

  const handleStopPreview = () => {
    stop();
    setIsPreviewPlaying(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      stop();
      setIsPreviewPlaying(false);
      await updatePrefs(preferences);
      if (!isGuest) {
        await updateCategoryPreferences(selectedCategoryIds);
      }

      if (isSetupAwal) {
        if (isUser) {
          const updated = setFirstLoginDone();
          if (updated) login(updated, 'user');
        } else if (isGuest) {
          const updated = setVisitorSetupDone();
          if (updated) login(updated, 'visitor');
        }
      }

      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan preferensi');
    } finally {
      setSaving(false);
    }
  };

  const optionButtonStyle = (isActive) => ({
    backgroundColor: isActive ? 'var(--accent)' : 'var(--bg-secondary)',
    color: isActive ? 'var(--bg-primary)' : 'var(--text-secondary)',
    border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border-subtle)'}`,
    fontFamily: 'var(--font-body)',
    fontWeight: 500,
    transition: 'all 0.2s'
  });

  // Di wizard, kartu pertanyaannya sendiri sudah memakai --bg-secondary, jadi
  // tombol yang tidak aktif perlu latar satu tingkat lebih terang supaya tidak
  // lebur dengan kartunya.
  const optionButtonStyleWizard = (isActive) => ({
    ...optionButtonStyle(isActive),
    backgroundColor: isActive ? 'var(--accent)' : 'var(--bg-elevated)'
  });

  const cardStyle = {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)'
  };

  const grupUkuranTeks = (tombolStyle) => (
    <PilihanOpsi
      options={OPSI_UKURAN_TEKS}
      value={preferences.ukuranTeks}
      onChange={(v) => handleChange('ukuranTeks', v)}
      cols="grid-cols-4"
      tombolStyle={tombolStyle}
    />
  );

  const grupKontras = (tombolStyle) => (
    <PilihanOpsi
      options={OPSI_KONTRAS}
      value={preferences.modeKontras}
      onChange={(v) => handleChange('modeKontras', v)}
      cols="grid-cols-3"
      tombolStyle={tombolStyle}
    />
  );

  const grupButaWarna = (tombolStyle) => (
    <PilihanOpsi
      options={OPSI_BUTA_WARNA}
      value={preferences.modeButaWarna}
      onChange={(v) => handleChange('modeButaWarna', v)}
      cols="grid-cols-2"
      tombolStyle={tombolStyle}
    />
  );

  const grupJarakBaris = (tombolStyle) => (
    <PilihanOpsi
      options={OPSI_JARAK_BARIS}
      value={preferences.jarakBaris}
      onChange={(v) => handleChange('jarakBaris', v)}
      cols="grid-cols-3"
      tombolStyle={tombolStyle}
    />
  );

  const grupKategori = (tombolStyle) => (
    <PilihanKategori
      categories={categories}
      selectedIds={selectedCategoryIds}
      onToggle={toggleCategory}
      tombolStyle={tombolStyle}
    />
  );

  const grupTts = (
    <PengaturanTts
      preferences={preferences}
      onChange={handleChange}
      isPlaying={isPreviewPlaying}
      onPreview={handlePreviewTts}
      onStop={handleStopPreview}
    />
  );

  // Urutan langkah wizard di HP. Sengaja dimulai dari ukuran teks karena
  // efeknya pada preview paling kentara, jadi sejak langkah pertama user
  // langsung paham bahwa artikel di atas memang ikut berubah mengikuti
  // jawabannya.
  const langkah = [
    { id: 'ukuranTeks', judul: 'Ukuran Teks', deskripsi: 'Pilih ukuran teks yang nyaman dibaca', isi: grupUkuranTeks(optionButtonStyleWizard) },
    { id: 'modeKontras', judul: 'Mode Kontras', deskripsi: 'Pilih kontras yang sesuai untuk mata', isi: grupKontras(optionButtonStyleWizard) },
    { id: 'modeButaWarna', judul: 'Mode Buta Warna', deskripsi: 'Pilih kondisi Anda — warna yang sulit dibedakan akan disesuaikan', isi: grupButaWarna(optionButtonStyleWizard) },
    { id: 'jarakBaris', judul: 'Jarak Baris', deskripsi: 'Atur kerenggangan antar baris', isi: grupJarakBaris(optionButtonStyleWizard) },
    { id: 'kategori', judul: 'Kategori Favorit', deskripsi: 'Pilih kategori berita yang Anda minati', isi: grupKategori(optionButtonStyleWizard) },
    { id: 'tts', judul: 'Pengaturan Suara (TTS)', deskripsi: 'Atur kecepatan dan volume pembacaan suara', isi: grupTts }
  ];

  const langkahAktif = langkah[indeksLangkah];
  const diLangkahTerakhir = indeksLangkah === langkah.length - 1;

  // Suara contoh dihentikan setiap kali pindah langkah — kalau dibiarkan, TTS
  // terus berbunyi di langkah lain yang tidak ada hubungannya dengan suara.
  const keLangkah = (index) => {
    stop();
    setIsPreviewPlaying(false);
    setIndeksLangkah(index);
  };

  const labelTombolSimpan = saving
    ? 'Menyimpan...'
    : isSetupAwal ? 'Simpan dan Mulai Membaca' : 'Simpan Perubahan';
  const filterWarnaPratinjau = getColorBlindFilter(preferences.modeButaWarna);

  return (
    <>
      {/* ——— Layar HP: satu pengaturan per langkah ———
          Preview dan kartu pengaturannya duduk di dalam satu bingkai, bukan dua
          seksi terpisah: tingginya murni mengikuti isinya, jadi saat ukuran teks
          diperbesar blok ini ikut memanjang dan saat diperkecil ikut memendek.
          Sengaja tidak ada tinggi yang dipatok maupun area gulir di dalamnya —
          justru itu yang dulu menyisakan ruang kosong di bawah layar, karena
          100dvh tidak pernah sama dengan min-h-screen milik pembungkus aplikasi
          selama bilah alamat browser HP masih tampil. */}
      <div className="lg:hidden px-5 pt-4 pb-6">
        <div className="flex items-baseline justify-between gap-3">
          <span
            className="text-[11px] uppercase tracking-[0.2em] font-medium"
            style={{ color: 'var(--accent)' }}
          >
            {isSetupAwal ? 'Personalisasi Awal' : 'Preferensi Akun'}
          </span>
          <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
            Langkah {indeksLangkah + 1} dari {langkah.length}
          </span>
        </div>

        {/* Segmen progres sekaligus jadi jalan pintas: user yang ingin mengubah
            jawaban sebelumnya tidak harus menekan panah kiri berkali-kali. */}
        <div
          className="flex gap-1.5 mt-2.5 mb-4"
          style={{ filter: filterWarnaPratinjau }}
        >
          {langkah.map((l, i) => (
            <button
              key={l.id}
              type="button"
              onClick={() => keLangkah(i)}
              aria-label={`Ke langkah ${i + 1}: ${l.judul}`}
              aria-current={i === indeksLangkah ? 'step' : undefined}
              className="flex-1 h-1.5 rounded-full transition-colors"
              style={{
                backgroundColor: i <= indeksLangkah ? 'var(--accent)' : 'var(--border-subtle)'
              }}
            />
          ))}
        </div>

        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid var(--border-subtle)' }}
        >
          <ArticlePreview preferences={preferences} variant="ringkas" />

          <div
            className="p-5"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderTop: '1px solid var(--border-subtle)',
              filter: filterWarnaPratinjau
            }}
          >
            <SectionLabel description={langkahAktif.deskripsi}>
              {langkahAktif.judul}
            </SectionLabel>

            {langkahAktif.isi}

            {error && (
              <div className="mt-4">
                <KotakError pesan={error} />
              </div>
            )}

            <div className="flex items-center justify-between gap-3 mt-5">
              <button
                type="button"
                onClick={() => keLangkah(indeksLangkah - 1)}
                disabled={indeksLangkah === 0 || saving}
                aria-label="Kembali ke pengaturan sebelumnya"
                className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center transition disabled:opacity-40"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              {/* Di mode ubah preferensi, Simpan selalu tersedia: user yang cuma
                  ingin mengganti satu pengaturan tidak perlu menyelesaikan
                  seluruh langkah dulu. */}
              {!isSetupAwal && !diLangkahTerakhir && (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-3 rounded-md text-sm font-medium transition disabled:opacity-50"
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--accent)',
                    border: '1px solid var(--accent)'
                  }}
                >
                  Simpan
                </button>
              )}

              {/* Menyimpan adalah aksi yang menutup seluruh alur, jadi di langkah
                  terakhir panah kanan diganti tombol bertulisan — panah telanjang
                  tidak cukup memberi tahu bahwa pilihannya akan dikunci. */}
              {diLangkahTerakhir ? (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3.5 rounded-md font-medium transition disabled:opacity-50 text-sm"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: 'var(--bg-primary)'
                  }}
                >
                  {labelTombolSimpan}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => keLangkah(indeksLangkah + 1)}
                  disabled={saving}
                  aria-label="Lanjut ke pengaturan berikutnya"
                  className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center transition disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: 'var(--bg-primary)'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="text-[11px] mt-3" style={{ color: 'var(--text-tertiary)' }}>
          Preview di atas ikut berubah seketika mengikuti pilihan Anda.
        </p>
      </div>

      {/* ——— Layar lebar: dua kolom seperti semula ——— */}
      <div className="hidden lg:block max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10 animate-fade-in">
          <span
            className="text-xs uppercase tracking-[0.3em] font-medium"
            style={{ color: 'var(--accent)' }}
          >
            {isSetupAwal ? 'Personalisasi Awal' : 'Preferensi Akun'}
          </span>
          <h1
            className="font-bold tracking-tight text-4xl md:text-5xl mt-3 mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            Atur Pengalaman <span style={{ color: 'var(--accent)' }}>Membaca</span> Anda
          </h1>
          <p
            className="text-base max-w-2xl"
            style={{ color: 'var(--text-secondary)' }}
          >
            {isSetupAwal
              ? 'Sesuaikan tampilan portal sesuai kebutuhan visual Anda. Lihat preview di kiri untuk melihat hasil pengaturan secara langsung.'
              : 'Ubah pengaturan tampilan maupun kategori favorit Anda kapan saja. Lihat preview di kiri untuk melihat hasilnya secara langsung.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="lg:sticky lg:top-24 lg:self-start lg:order-1 animate-fade-in-delay-1">
            <div className="mb-3">
              <span
                className="inline-block text-xs uppercase tracking-widest font-medium px-3 py-1 rounded-full"
                style={{
                  backgroundColor: 'var(--accent-muted)',
                  color: 'var(--accent)'
                }}
              >
                ◉ Artikel Akan Terlihat Seperti Ini
              </span>
            </div>
            <ArticlePreview preferences={preferences} />
            <p
              className="text-xs mt-3"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Tampilan akan berubah secara langsung sesuai pengaturan Anda.
            </p>
          </div>

          <div
            className="space-y-6 lg:order-2 animate-fade-in-delay-2"
            style={{ filter: filterWarnaPratinjau }}
          >
            <div className="rounded-lg p-6" style={cardStyle}>
              <SectionLabel description="Pilih ukuran teks yang nyaman dibaca">
                Ukuran Teks
              </SectionLabel>
              {grupUkuranTeks(optionButtonStyle)}
            </div>

            <div className="rounded-lg p-6" style={cardStyle}>
              <SectionLabel description="Pilih kontras yang sesuai untuk mata">
                Mode Kontras
              </SectionLabel>
              {grupKontras(optionButtonStyle)}
            </div>

            <div className="rounded-lg p-6" style={cardStyle}>
              <SectionLabel description="Pilih kondisi Anda — warna yang sulit dibedakan akan disesuaikan">
                Mode Buta Warna
              </SectionLabel>
              {grupButaWarna(optionButtonStyle)}
            </div>

            <div className="rounded-lg p-6" style={cardStyle}>
              <SectionLabel description="Atur kerenggangan antar baris">
                Jarak Baris
              </SectionLabel>
              {grupJarakBaris(optionButtonStyle)}
            </div>

            <div className="rounded-lg p-6" style={cardStyle}>
              <SectionLabel description="Pilih kategori berita yang Anda minati">
                Kategori Favorit
              </SectionLabel>
              {grupKategori(optionButtonStyle)}
            </div>

            <div className="rounded-lg p-6" style={cardStyle}>
              <SectionLabel description="Atur kecepatan dan volume pembacaan suara">
                Pengaturan Suara (TTS)
              </SectionLabel>
              {grupTts}
            </div>

            <KotakError pesan={error} />

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-4 rounded-md font-medium transition disabled:opacity-50 disabled:cursor-not-allowed text-base"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--bg-primary)'
              }}
              onMouseEnter={(e) => !saving && (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
              onMouseLeave={(e) => !saving && (e.currentTarget.style.backgroundColor = 'var(--accent)')}
            >
              {labelTombolSimpan}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default SetupPreferencesPage;
