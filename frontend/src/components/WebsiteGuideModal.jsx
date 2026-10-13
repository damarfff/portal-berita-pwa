import { useCallback, useEffect, useState } from 'react';
import { useFilterWarna } from '../hooks/useFilterWarna';
import { useAccessibility } from '../hooks/useAccessibility';
import { pause, resume, speak, stop } from '../services/ttsService';
import { SpeakIcon } from './SpeakTitleButton';

const TEKS_PANDUAN = 'Selamat datang di Aksa. Portal berita yang dirancang agar dapat dibaca oleh siapa saja, dengan pengaturan tampilan dan suara yang dapat disesuaikan dengan kebutuhan visual Anda. Untuk mencoba fitur aksesibilitas harap masuk terlebih dahulu.';

function WebsiteGuideModal({ onClose }) {
  const filterWarna = useFilterWarna();
  const { preferences } = useAccessibility();
  const [suaraBerjalan, setSuaraBerjalan] = useState(true);
  const [suaraTerjeda, setSuaraTerjeda] = useState(false);

  const mulaiBaca = useCallback(() => {
    const berhasil = speak(TEKS_PANDUAN, {
      rate: 1.3,
      volume: preferences.volumeTts,
      onStart: () => {
        setSuaraBerjalan(true);
        setSuaraTerjeda(false);
      },
      onEnd: () => {
        setSuaraBerjalan(false);
        setSuaraTerjeda(false);
      },
      onError: () => {
        setSuaraBerjalan(false);
        setSuaraTerjeda(false);
      }
    });

    if (!berhasil) {
      setSuaraBerjalan(false);
      setSuaraTerjeda(false);
    }
  }, [preferences.volumeTts]);

  useEffect(() => {
    let sudahMulai = false;
    let timer;

    const mulaiSetelahVoiceSiap = () => {
      if (sudahMulai) return;
      sudahMulai = true;
      window.speechSynthesis?.removeEventListener('voiceschanged', mulaiSetelahVoiceSiap);
      mulaiBaca();
    };

    const voiceSudahSiap = 'speechSynthesis' in window
      && window.speechSynthesis.getVoices().length > 0;

    if (!voiceSudahSiap && 'speechSynthesis' in window) {
      window.speechSynthesis.addEventListener('voiceschanged', mulaiSetelahVoiceSiap);
    }

    // Beri waktu browser menyiapkan voice sebelum pemanggilan pertama.
    timer = window.setTimeout(mulaiSetelahVoiceSiap, voiceSudahSiap ? 250 : 1000);

    return () => {
      window.clearTimeout(timer);
      window.speechSynthesis?.removeEventListener('voiceschanged', mulaiSetelahVoiceSiap);
      stop();
    };
  }, [mulaiBaca]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };

    const overflowSebelumnya = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = overflowSebelumnya;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const togglePembacaan = (event) => {
    event.stopPropagation();

    if (suaraBerjalan) {
      pause();
      setSuaraBerjalan(false);
      setSuaraTerjeda(true);
      return;
    }

    if (suaraTerjeda) {
      resume();
      setSuaraBerjalan(true);
      setSuaraTerjeda(false);
      return;
    }

    mulaiBaca();
  };

  const pembacaanAktif = suaraBerjalan;
  const labelTombolSuara = pembacaanAktif
    ? 'Jeda pembacaan panduan'
    : suaraTerjeda
      ? 'Lanjutkan pembacaan panduan'
      : 'Bacakan isi panduan website';

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="panduan-website-title"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)' }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
        style={{
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-emphasis)',
          filter: filterWarna
        }}
      >
        <div className="flex items-start justify-between gap-4 p-6 pb-4 sm:p-8 sm:pb-5">
          <div>
            <p
              className="text-xs uppercase tracking-[0.2em] font-medium mb-2"
              style={{ color: 'var(--accent)' }}
            >
              Panduan singkat
            </p>
            <h2 id="panduan-website-title" className="text-2xl sm:text-3xl font-bold tracking-tight">
              Selamat datang di Aksa
            </h2>
          </div>
          <div className="shrink-0">
            <button
              type="button"
              onClick={onClose}
              autoFocus
              className="w-10 h-10 rounded-full flex items-center justify-center transition hover:opacity-80"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)'
              }}
              aria-label="Tutup panduan"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 pb-6 sm:px-8 sm:pb-8">
          <div className="flex items-start gap-4">
            <p
              className="flex-1 leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              Portal berita yang dirancang agar dapat dibaca oleh siapa saja,
              dengan pengaturan tampilan dan suara yang dapat disesuaikan dengan
              kebutuhan visual Anda.
            </p>
          </div>

          <div
            className="mt-6 rounded-xl p-4 text-sm leading-relaxed"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderLeft: '3px solid var(--accent)',
              color: 'var(--text-secondary)'
            }}
          >
            Untuk mencoba fitur aksesibilitas harap masuk terlebih dahulu.
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={togglePembacaan}
                className="flex items-center justify-center w-10 h-10 rounded-full shadow-lg transition-transform hover:scale-105 shrink-0"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--on-accent)',
                  border: '2px solid var(--bg-primary)'
                }}
                aria-label={labelTombolSuara}
                title={labelTombolSuara}
              >
                {pembacaanAktif ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M7 5h3v14H7zM14 5h3v14h-3z" />
                  </svg>
                ) : (
                  <SpeakIcon size={20} />
                )}
              </button>
              <span className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {pembacaanAktif
                  ? 'Pembacaan suara sedang aktif'
                  : suaraTerjeda
                    ? 'Klik untuk melanjutkan pembacaan suara'
                    : 'Klik untuk coba pembacaan suara'}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="self-end sm:self-auto rounded-lg px-4 py-2 text-sm font-semibold transition hover:opacity-90"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}
            >
              Mengerti
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WebsiteGuideModal;
