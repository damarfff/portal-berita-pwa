import { useEffect, useRef, useState } from 'react';
import { useAccessibility } from '../hooks/useAccessibility';
import { useFilterWarna } from '../hooks/useFilterWarna';

// Jeda sebelum geseran slider benar-benar dikirim ke server. Cukup panjang
// untuk menelan satu tarikan jari, cukup pendek supaya terasa langsung.
const JEDA_SIMPAN_SLIDER = 300;

function AccessibilityPanel({ isOpen, onClose }) {
  const { preferences, updatePrefs } = useAccessibility();
  // Panel & tirainya position: fixed — lapisan sendiri, filter dipasang langsung.
  const filterWarna = useFilterWarna();

  // Slider dipegang di state lokal supaya angkanya ikut jari seketika tanpa
  // menunggu respons server. Tanpa ini tiap langkah geseran memicu request +
  // render ulang seluruh panel, yang bikin gerakannya patah-patah di HP.
  const [nilaiSlider, setNilaiSlider] = useState({
    kecepatanTts: preferences.kecepatanTts,
    volumeTts: preferences.volumeTts
  });
  const timerSimpan = useRef({});
  // Status simpan hanya diumumkan ke screen reader; dulu ini teks yang
  // muncul-hilang di atas panel, dan mount/unmount-nya menggeser seluruh isi
  // panel tiap kali preferensi berubah.
  const [statusSimpan, setStatusSimpan] = useState('');
  const timerStatus = useRef(null);
  const [menyimpan, setMenyimpan] = useState(false);

  // Nilai dari server hanya dipakai kalau tidak ada geseran yang masih
  // menunggu dikirim, supaya angkanya tidak lompat balik saat digeser.
  useEffect(() => {
    if (Object.keys(timerSimpan.current).length > 0) return;
    setNilaiSlider({
      kecepatanTts: preferences.kecepatanTts,
      volumeTts: preferences.volumeTts
    });
  }, [preferences.kecepatanTts, preferences.volumeTts]);

  useEffect(() => {
    const timer = timerStatus;
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const umumkanTersimpan = () => {
    // Dikosongkan dulu lalu diisi di tick berikutnya: kalau langsung diisi
    // teks yang sama, screen reader tidak mengumumkannya lagi.
    if (timerStatus.current) clearTimeout(timerStatus.current);
    setStatusSimpan('');
    timerStatus.current = setTimeout(() => {
      setStatusSimpan('Pengaturan tersimpan');
      timerStatus.current = setTimeout(() => setStatusSimpan(''), 2000);
    }, 50);
  };

  const simpan = async (perubahan) => {
    try {
      await updatePrefs(perubahan);
      umumkanTersimpan();
      return true;
    } catch (err) {
      console.error('Failed to update preference:', err);
      return false;
    }
  };

  const handleChange = (field, value) => simpan({ [field]: value });

  // Geseran slider disimpan setelah jeda: satu tarikan jari = satu request,
  // bukan satu request per langkah.
  const handleSlider = (field, value) => {
    setNilaiSlider(prev => ({ ...prev, [field]: value }));
    clearTimeout(timerSimpan.current[field]);
    timerSimpan.current[field] = setTimeout(() => {
      delete timerSimpan.current[field];
      handleChange(field, value);
    }, JEDA_SIMPAN_SLIDER);
  };

  // Semua pilihan sebenarnya sudah tersimpan otomatis; tombol ini menutup
  // jeda slider yang masih tertunda lalu menutup panel, supaya ada titik
  // selesai yang jelas buat pengguna yang tidak yakin perubahannya kesimpan.
  const handleSimpanPerubahan = async () => {
    const fieldTertunda = Object.keys(timerSimpan.current);
    fieldTertunda.forEach(field => {
      clearTimeout(timerSimpan.current[field]);
      delete timerSimpan.current[field];
    });

    setMenyimpan(true);
    try {
      if (fieldTertunda.length > 0) {
        const perubahan = {};
        fieldTertunda.forEach(field => { perubahan[field] = nilaiSlider[field]; });
        await simpan(perubahan);
      } else {
        umumkanTersimpan();
      }
    } finally {
      setMenyimpan(false);
    }
    onClose();
  };

  if (!isOpen) return null;

  const optionButtonStyle = (isActive) => ({
    backgroundColor: isActive ? 'var(--accent)' : 'var(--bg-elevated)',
    color: isActive ? 'var(--bg-primary)' : 'var(--text-secondary)',
    border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border-subtle)'}`,
    fontFamily: 'var(--font-body)',
    fontWeight: 500,
    transition: 'all 0.2s'
  });

  return (
    <>
      <div 
        className="fixed inset-0 z-40 transition-opacity"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', filter: filterWarna }}
        onClick={onClose}
      />

      <div
        className="fixed top-0 right-0 h-full w-full max-w-md shadow-2xl z-50 overflow-y-auto transition-colors"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border-subtle)',
          animation: 'slideInRight 0.3s ease-out',
          filter: filterWarna
        }}
      >
        <div 
          className="sticky top-0 px-6 py-4 flex items-center justify-between z-10"
          style={{ 
            backgroundColor: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <div>
            <span 
              className="text-xs uppercase tracking-[0.2em] font-medium"
              style={{ color: 'var(--accent)' }}
            >
              Pengaturan
            </span>
            <h2 
              className="font-bold tracking-tight text-xl mt-1"
              style={{ color: 'var(--text-primary)' }}
            >
              Aksesibilitas
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-2xl leading-none px-2 transition hover:opacity-70"
            style={{ color: 'var(--text-tertiary)' }}
            aria-label="Tutup panel"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="sr-only" role="status" aria-live="polite">
            {statusSimpan}
          </div>

          <div>
            <label 
              className="block text-xs uppercase tracking-widest font-medium mb-3"
              style={{ color: 'var(--text-secondary)' }}
            >
              Ukuran Teks
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 'small', label: 'Kecil' },
                { value: 'medium', label: 'Normal' },
                { value: 'large', label: 'Besar' },
                { value: 'extra-large', label: 'XL' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => handleChange('ukuranTeks', option.value)}
                  style={optionButtonStyle(preferences.ukuranTeks === option.value)}
                  className="py-2 px-2 rounded-md text-sm"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label 
              className="block text-xs uppercase tracking-widest font-medium mb-3"
              style={{ color: 'var(--text-secondary)' }}
            >
              Mode Kontras
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'dark', label: 'Gelap' },
                { value: 'normal', label: 'Terang' },
                { value: 'high-contrast', label: 'Tinggi' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => handleChange('modeKontras', option.value)}
                  style={optionButtonStyle(preferences.modeKontras === option.value)}
                  className="py-2 px-2 rounded-md text-sm"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label 
              className="block text-xs uppercase tracking-widest font-medium mb-3"
              style={{ color: 'var(--text-secondary)' }}
            >
              Mode Buta Warna
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'none', label: 'Tidak Ada' },
                { value: 'protanopia', label: 'Protanopia' },
                { value: 'deuteranopia', label: 'Deuteranopia' },
                { value: 'tritanopia', label: 'Tritanopia' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => handleChange('modeButaWarna', option.value)}
                  style={optionButtonStyle(preferences.modeButaWarna === option.value)}
                  className="py-2 px-2 rounded-md text-sm"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label 
              className="block text-xs uppercase tracking-widest font-medium mb-3"
              style={{ color: 'var(--text-secondary)' }}
            >
              Jarak Baris
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'normal', label: 'Normal' },
                { value: 'relaxed', label: 'Renggang' },
                { value: 'loose', label: 'XL' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => handleChange('jarakBaris', option.value)}
                  style={optionButtonStyle(preferences.jarakBaris === option.value)}
                  className="py-2 px-2 rounded-md text-sm"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div 
            className="pt-6"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <label 
              className="block text-xs uppercase tracking-widest font-medium mb-4"
              style={{ color: 'var(--text-secondary)' }}
            >
              Suara Pembacaan (TTS)
            </label>
            
            <div className="mb-5">
              <div className="flex justify-between text-sm mb-2">
                <span style={{ color: 'var(--text-secondary)' }}>Kecepatan</span>
                <span style={{ color: 'var(--accent)', fontWeight: 500 }}>
                  {nilaiSlider.kecepatanTts.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={nilaiSlider.kecepatanTts}
                onChange={(e) => handleSlider('kecepatanTts', parseFloat(e.target.value))}
                className="w-full"
                style={{ accentColor: 'var(--accent)' }}
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span style={{ color: 'var(--text-secondary)' }}>Volume</span>
                <span style={{ color: 'var(--accent)', fontWeight: 500 }}>
                  {Math.round(nilaiSlider.volumeTts * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={nilaiSlider.volumeTts}
                onChange={(e) => handleSlider('volumeTts', parseFloat(e.target.value))}
                className="w-full"
                style={{ accentColor: 'var(--accent)' }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSimpanPerubahan}
            disabled={menyimpan}
            className="w-full py-3 rounded-md font-semibold text-sm transition cursor-pointer disabled:cursor-wait"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--bg-primary)',
              fontFamily: 'var(--font-body)',
              opacity: menyimpan ? 0.75 : 1
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent)'; }}
          >
            {menyimpan ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </>
  );
}

export default AccessibilityPanel;