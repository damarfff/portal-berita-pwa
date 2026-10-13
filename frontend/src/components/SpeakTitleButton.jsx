import { useEffect, useRef, useState } from 'react';
import { pause, resume, speak, subscribeSpeech } from '../services/ttsService';
import { useAccessibility } from '../hooks/useAccessibility';

export function SpeakIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Ikon mengikuti icon-park-outline_people-speak.svg. */}
      <path d="M16.5 4C16.5 4 17.625 6.25 16.5 9M20 2C20 2 22.25 6.05 20 11M9.5 10C9.95963 10 10.4148 9.90947 10.8394 9.73358C11.264 9.55769 11.6499 9.29988 11.9749 8.97487C12.2999 8.64987 12.5577 8.26403 12.7336 7.83939C12.9095 7.41475 13 6.95963 13 6.5C13 6.04037 12.9095 5.58525 12.7336 5.16061C12.5577 4.73597 12.2999 4.35013 11.9749 4.02513C11.6499 3.70012 11.264 3.44231 10.8394 3.26642C10.4148 3.09053 9.95963 3 9.5 3C8.57174 3 7.6815 3.36875 7.02513 4.02513C6.36875 4.6815 6 5.57174 6 6.5C6 7.42826 6.36875 8.3185 7.02513 8.97487C7.6815 9.63125 8.57174 10 9.5 10ZM2 20.4V21H17V20.4C17 18.16 17 17.04 16.564 16.184C16.1805 15.4314 15.5686 14.8195 14.816 14.436C13.96 14 12.84 14 10.6 14H8.4C6.16 14 5.04 14 4.184 14.436C3.43139 14.8195 2.81949 15.4314 2.436 16.184C2 17.04 2 18.16 2 20.4Z" />
    </svg>
  );
}

function SpeakTitleButton({
  title,
  className = '',
  ariaLabel = 'Bacakan judul berita',
  buttonTitle = ariaLabel,
  rate
}) {
  const { preferences } = useAccessibility();
  const sourceRef = useRef({});
  const [suaraBerjalan, setSuaraBerjalan] = useState(false);
  const [suaraTerjeda, setSuaraTerjeda] = useState(false);

  useEffect(() => subscribeSpeech((event) => {
    if (event.type === 'start') {
      setSuaraBerjalan(event.source === sourceRef.current);
      setSuaraTerjeda(false);
      return;
    }

    if (event.type === 'stop' || event.type === 'end' || event.type === 'error') {
      setSuaraBerjalan(false);
      setSuaraTerjeda(false);
    }
  }), []);

  const handleClick = (event) => {
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

    const berhasil = speak(title, {
      source: sourceRef.current,
      rate: rate ?? preferences.kecepatanTts,
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

    if (berhasil) setSuaraBerjalan(true);
  };

  const labelTombol = suaraBerjalan
    ? 'Jeda pembacaan judul berita'
    : suaraTerjeda
      ? 'Lanjutkan pembacaan judul berita'
      : ariaLabel;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={labelTombol}
      title={labelTombol === ariaLabel ? buttonTitle : labelTombol}
      className={`flex items-center justify-center w-10 h-10 rounded-full shadow-lg transition-transform hover:scale-105 ${className}`}
      style={{
        backgroundColor: 'var(--accent)',
        color: 'var(--on-accent)',
        border: '2px solid var(--bg-primary)'
      }}
    >
      {suaraBerjalan ? (
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
        <SpeakIcon />
      )}
    </button>
  );
}

export default SpeakTitleButton;

