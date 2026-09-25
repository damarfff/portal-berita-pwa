let isSpeaking = false;
let currentUtterance = null;

export const isTTSSupported = () => {
  return 'speechSynthesis' in window;
};

export const speak = (text, options = {}) => {
  if (!isTTSSupported()) {
    console.warn('Web Speech API tidak didukung di browser ini');
    return false;
  }

  stop();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = options.lang || 'id-ID';
  utterance.rate = options.rate !== undefined ? options.rate : 1.0;
  utterance.volume = options.volume !== undefined ? options.volume : 1.0;
  utterance.pitch = options.pitch !== undefined ? options.pitch : 1.0;

  utterance.onstart = () => {
    isSpeaking = true;
    if (options.onStart) options.onStart();
  };

  utterance.onend = () => {
    isSpeaking = false;
    currentUtterance = null;
    if (options.onEnd) options.onEnd();
  };

  // Dipakai pemanggil untuk mencatat sudah sampai karakter ke berapa bacaan
  // berjalan, sebagai bekal melanjutkan di browser yang pause()-nya tidak
  // berfungsi (lihat catatan di ArticleDetailPage).
  utterance.onboundary = (event) => {
    if (options.onBoundary) options.onBoundary(event);
  };

  utterance.onerror = (event) => {
    isSpeaking = false;
    currentUtterance = null;
    console.error('TTS error:', event);
    if (options.onError) options.onError(event);
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
  return true;
};

export const stop = () => {
  // cancel() ikut memicu event "end" (dan di sebagian browser "error") pada
  // utterance yang sedang berjalan. Kalau handler-nya masih terpasang,
  // callback onEnd milik bacaan LAMA bisa menyala setelah bacaan BARU dimulai
  // dan langsung mematikan state-nya. Jadi handler dilepas dulu sebelum batal.
  if (currentUtterance) {
    currentUtterance.onstart = null;
    currentUtterance.onend = null;
    currentUtterance.onerror = null;
    currentUtterance.onboundary = null;
    currentUtterance = null;
  }

  if (isTTSSupported()) {
    window.speechSynthesis.cancel();
    // Chrome bisa menyisakan flag "paused" setelah cancel(), dan selama flag
    // itu menyala utterance berikutnya tidak pernah berbunyi. Jadi antrean
    // yang sudah kosong ini di-resume dulu supaya bersih betul.
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }
  isSpeaking = false;
};

export const pause = () => {
  if (isTTSSupported() && window.speechSynthesis.speaking) {
    window.speechSynthesis.pause();
  }
};

export const resume = () => {
  if (isTTSSupported() && window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
};

export const getIsSpeaking = () => {
  return isSpeaking;
};

export const getIsPaused = () => {
  return isTTSSupported() && window.speechSynthesis.paused;
};