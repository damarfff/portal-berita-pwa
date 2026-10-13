import { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getArticleBySlug } from '../services/articleService';
import { speak, stop, pause, resume, getIsPaused, isTTSSupported } from '../services/ttsService';
import { useAccessibility } from '../hooks/useAccessibility';
import { useAuth } from '../hooks/useAuth';
import { useFilterWarna } from '../hooks/useFilterWarna';
import ChevronLeftIcon from '../components/ChevronLeftIcon';
import {
  getTextSizeClass,
  getLineSpacingClass
} from '../utils/accessibilityStyles';

function ArticleDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { preferences } = useAccessibility();
  const filterWarna = useFilterWarna();
  
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hoveredParagraph, setHoveredParagraph] = useState(null);
  // Indeks paragraf yang sedang dibacakan; null berarti yang dibacakan adalah
  // seluruh artikel (atau tidak ada yang dibacakan sama sekali).
  const [speakingParagraph, setSpeakingParagraph] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  // Bagian yang sedang dibacakan: -1 berarti judul, 0 ke atas berarti indeks
  // paragraf. Disimpan di ref, bukan state, karena nilainya ikut dibaca dari
  // dalam callback onEnd milik utterance yang sudah menutup nilai render lama.
  const bagianRef = useRef(null);
  // Sisa teks bagian yang sedang berjalan berikut posisi karakter terakhir
  // yang dilaporkan browser. Keduanya hanya terpakai oleh jalur jeda darurat.
  const sisaTeksRef = useRef('');
  const posisiKarakterRef = useRef(0);
  const jedaDaruratRef = useRef(false);
  const paragrafRefs = useRef([]);
  // Penanda sesi bacaan. Setiap kali bacaan baru dimulai atau dihentikan,
  // nomornya naik, sehingga timer penyambung paragraf yang terlanjur dijadwalkan
  // tahu bahwa ia sudah basi dan tidak ikut berbunyi.
  const sesiRef = useRef(0);
  const lanjutTimerRef = useRef(null);
  // Pasangan kecepatan+volume yang dipakai bacaan yang sedang berjalan.
  const pengaturanTtsRef = useRef(null);
  const bacakanBagianRef = useRef(null);

  const paragraphs = useMemo(
    () => (article ? article.isi.split('\n').filter((p) => p.trim() !== '') : []),
    [article]
  );

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    const loadArticle = async () => {
      try {
        const data = await getArticleBySlug(slug);
        setArticle(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Artikel tidak ditemukan');
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [slug, isLoggedIn, navigate]);

  useEffect(() => {
    return () => {
      stop();
      clearTimeout(lanjutTimerRef.current);
      sesiRef.current += 1;
    };
  }, []);

  // Escape menghentikan bacaan bagi pengguna keyboard / HP berkeyboard,
  // tanpa perlu mencari tombolnya dulu.
  useEffect(() => {
    if (!isSpeaking) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        stop();
        clearTimeout(lanjutTimerRef.current);
        sesiRef.current += 1;
        bagianRef.current = null;
        jedaDaruratRef.current = false;
        setIsSpeaking(false);
        setSpeakingParagraph(null);
        setIsPaused(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isSpeaking]);

  // Bawa paragraf yang sedang dibacakan ke layar, tapi hanya kalau memang
  // sudah keluar dari pandangan — supaya halaman tidak tersentak tiap kali
  // pindah paragraf padahal yang berikutnya sudah terlihat.
  const gulirKeParagraf = (index) => {
    const el = paragrafRefs.current[index];
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const margin = 96; // ruang untuk navbar sticky di atas
    const diLuarPandangan = rect.top < margin || rect.bottom > window.innerHeight - margin;
    if (!diLuarPandangan) return;

    const hematGerak = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: hematGerak ? 'auto' : 'smooth', block: 'center' });
  };

  const teksBagian = (index) => (index === -1 ? article?.judul : paragraphs[index]);

  // Membacakan satu bagian, lalu menyambung sendiri ke bagian berikutnya lewat
  // onEnd. Artikel sengaja dipecah per paragraf, bukan satu utterance panjang,
  // supaya sorotan bisa ikut berpindah dan jeda/lanjut punya titik pijak.
  const bacakanBagian = (index, teksLanjutan) => {
    const teks = teksLanjutan !== undefined ? teksLanjutan : teksBagian(index);
    if (!teks) return;

    clearTimeout(lanjutTimerRef.current);
    sesiRef.current += 1;
    const sesi = sesiRef.current;

    bagianRef.current = index;
    sisaTeksRef.current = teks;
    posisiKarakterRef.current = 0;
    jedaDaruratRef.current = false;

    setSpeakingParagraph(index === -1 ? null : index);
    setIsPaused(false);
    if (index >= 0) gulirKeParagraf(index);

    const selesaikan = () => {
      bagianRef.current = null;
      setIsSpeaking(false);
      setSpeakingParagraph(null);
      setIsPaused(false);
    };

    speak(teks, {
      rate: preferences.kecepatanTts,
      volume: preferences.volumeTts,
      onStart: () => setIsSpeaking(true),
      onBoundary: (e) => {
        posisiKarakterRef.current = e.charIndex;
      },
      onEnd: () => {
        const berikutnya = index + 1;
        if (berikutnya >= paragraphs.length) {
          selesaikan();
          return;
        }

        // Diberi jarak sedikit sebelum paragraf berikutnya: enak didengar,
        // sekaligus menghindari kebiasaan Chrome menelan utterance yang
        // di-speak() persis sesudah cancel() pada tick yang sama.
        lanjutTimerRef.current = setTimeout(() => {
          if (sesiRef.current !== sesi) return;
          bacakanBagian(berikutnya);
        }, 180);
      },
      onError: selesaikan
    });
  };

  const handleReadFullArticle = () => {
    if (!article) return;
    bacakanBagian(-1); // mulai dari judul, lalu mengalir ke paragraf pertama
  };

  const handleStopReading = () => {
    stop();
    clearTimeout(lanjutTimerRef.current);
    sesiRef.current += 1;
    bagianRef.current = null;
    jedaDaruratRef.current = false;
    setIsSpeaking(false);
    setSpeakingParagraph(null);
    setIsPaused(false);
  };

  const handlePauseResume = () => {
    if (!isPaused) {
      const bagianSaatIni = bagianRef.current;
      pause();
      setIsPaused(true);

      // Sebagian browser HP (terutama Chrome di Android) diam-diam mengabaikan
      // pause(). Kalau ternyata tidak benar-benar terjeda, bacaan dihentikan
      // saja sambil mencatat sisa teksnya; "lanjutkan" nanti memutarnya ulang
      // dari kata terakhir yang sempat dilaporkan browser.
      setTimeout(() => {
        if (getIsPaused() || bagianRef.current !== bagianSaatIni) return;

        jedaDaruratRef.current = true;
        sisaTeksRef.current = sisaTeksRef.current.slice(posisiKarakterRef.current);
        posisiKarakterRef.current = 0;
        // Jeda yang ditekan tepat di sela antar-paragraf harus ikut
        // membatalkan timer penyambungnya, kalau tidak bacaan jalan lagi.
        clearTimeout(lanjutTimerRef.current);
        sesiRef.current += 1;
        stop();
      }, 150);
      return;
    }

    if (jedaDaruratRef.current) {
      bacakanBagian(bagianRef.current, sisaTeksRef.current);
    } else {
      resume();
      setIsPaused(false);
    }
  };

  // Ketuk paragraf yang sedang dibacakan = berhenti. Dengan begitu tombol
  // "Hentikan" di atas artikel tidak lagi jadi satu-satunya cara berhenti,
  // sehingga pembaca paragraf terakhir tak perlu menggulir balik ke atas.
  const handleParagraphClick = (paragraph, index) => {
    if (speakingParagraph === index) {
      handleStopReading();
      return;
    }

    bacakanBagian(index);
  };

  // Titipan versi terbaru bacakanBagian. Tanpa ini efek di bawahnya harus
  // mencantumkan fungsi tersebut sebagai dependensi, padahal identitasnya
  // berganti tiap render sehingga efeknya ikut berjalan ulang terus.
  useEffect(() => {
    bacakanBagianRef.current = bacakanBagian;
  });

  // Kecepatan dan volume terkunci pada utterance sejak ia dibuat — Web Speech
  // API tidak punya cara mengubahnya di tengah jalan. Supaya geseran slider di
  // panel aksesibilitas tetap langsung terasa, bagian yang sedang dibaca
  // diputar ulang dari kata terakhir yang dilaporkan browser, kali ini dengan
  // pengaturan baru.
  //
  // Efek ini aman dijalankan sesering apa pun: penjaga di bawah membandingkan
  // pasangan nilainya dulu, jadi render biasa tidak menimbulkan apa-apa.
  useEffect(() => {
    const sekarang = `${preferences.kecepatanTts}|${preferences.volumeTts}`;
    const sebelumnya = pengaturanTtsRef.current;
    pengaturanTtsRef.current = sekarang;

    // Lewati pemasangan pertama, termasuk saat preferensi tiba dari server —
    // yang ditunggu hanyalah perubahan sesudah halaman berjalan.
    if (sebelumnya === null || sebelumnya === sekarang) return;

    // bagianRef berisi null hanya kalau memang tidak ada bacaan berjalan.
    if (bagianRef.current === null) return;

    const bagian = bagianRef.current;
    const sisa = sisaTeksRef.current.slice(posisiKarakterRef.current);

    if (isPaused) {
      // Sedang terjeda: jangan bersuara sekarang. Sisanya cukup dicatat, lalu
      // tombol "Lanjutkan" yang memutarnya dengan pengaturan baru — jalur yang
      // sama persis dengan jeda darurat.
      clearTimeout(lanjutTimerRef.current);
      sesiRef.current += 1;
      stop();
      jedaDaruratRef.current = true;
      sisaTeksRef.current = sisa;
      posisiKarakterRef.current = 0;
      bagianRef.current = bagian;
      return;
    }

    bacakanBagianRef.current(bagian, sisa);
  }, [preferences.kecepatanTts, preferences.volumeTts, isPaused]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16">
        <p style={{ color: 'var(--text-tertiary)' }}>Memuat artikel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div 
          className="p-6 rounded-lg mb-6"
          style={{ 
            backgroundColor: 'rgba(248, 81, 73, 0.1)',
            border: '1px solid rgba(248, 81, 73, 0.3)',
            color: 'var(--danger)'
          }}
        >
          {error}
        </div>
        <Link 
          to="/" 
          className="text-sm hover:underline inline-flex items-center gap-2"
          style={{ color: 'var(--accent)' }}
        >
          <><ChevronLeftIcon /> Kembali ke beranda</>
        </Link>
      </div>
    );
  }

  if (!article) return null;

  const textSize = getTextSizeClass(preferences.ukuranTeks);
  const lineSpacing = getLineSpacingClass(preferences.jarakBaris);

  // Sebelumnya warna-warna ini ditulis sebagai hex ternary per mode kontras,
  // sehingga mode "Tinggi" hanya berlaku di halaman ini dan di ArticlePreview
  // — navbar, kartu, dan footer tidak ikut. Sekarang semuanya membaca token
  // yang sama dengan sisa aplikasi, jadi pergantian mode berlaku menyeluruh.
  const accentColor = 'var(--accent)';
  const subtleColor = 'var(--text-secondary)';
  const tertiaryColor = 'var(--text-tertiary)';
  const hoverBg = 'var(--accent-muted)';
  const hairline = '1px solid var(--border-subtle)';

  // Dipakai di tombol kepala artikel maupun di tombol melayang.
  const ikonJeda = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
      <rect x="6" y="5" width="4" height="14"/>
      <rect x="14" y="5" width="4" height="14"/>
    </svg>
  );
  const ikonLanjut = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
      <path d="M8 5v14l11-7z"/>
    </svg>
  );
  const ikonHenti = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
      <rect x="6" y="6" width="12" height="12"/>
    </svg>
  );

  return (
    <div className="min-h-screen transition-colors animate-fade-in">
      <article className="max-w-3xl mx-auto px-6 py-12">
          <Link 
            to="/" 
            className="text-sm hover:underline inline-flex items-center gap-2 mb-10"
            style={{ color: accentColor }}
          >
            <><ChevronLeftIcon /> Kembali ke beranda</>
          </Link>

          <header className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="h-px w-12"
                style={{ backgroundColor: accentColor }}
              />
              <span 
                className="text-xs uppercase tracking-[0.25em] font-medium"
                style={{ color: accentColor }}
              >
                {article.category?.nama}
              </span>
            </div>

            <h1 
 className={`font-bold tracking-tight leading-[1.15] mb-6 ${
                preferences.ukuranTeks === 'extra-large' ? 'text-5xl' :
                preferences.ukuranTeks === 'large' ? 'text-4xl' :
                preferences.ukuranTeks === 'small' ? 'text-2xl' : 
                'text-3xl md:text-4xl'
              }`}
            >
              {article.judul}
            </h1>

            <div 
              className="flex items-center gap-3 text-sm pb-6"
              style={{ 
                color: subtleColor,
                borderBottom: hairline
              }}
            >
              <span>Oleh {article.publisherName || article.admin?.nama || 'Administrator'}</span>
              <span>·</span>
              <time>
                {new Date(article.publishedAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </time>
            </div>
          </header>

          {isTTSSupported() && (
            <div className="flex flex-wrap items-center gap-3 mb-10">
              {!isSpeaking ? (
                <button
                  onClick={handleReadFullArticle}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-md font-medium text-sm transition"
                  style={{ 
                    backgroundColor: accentColor,
                    color: 'var(--on-accent)'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Bacakan Artikel
                </button>
              ) : (
                <>
                  <button
                    onClick={handlePauseResume}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-md font-medium text-sm transition"
                    style={{
                      backgroundColor: accentColor,
                      color: 'var(--on-accent)'
                    }}
                  >
                    {isPaused ? ikonLanjut : ikonJeda}
                    {isPaused ? 'Lanjutkan' : 'Jeda'}
                  </button>
                  <button
                    onClick={handleStopReading}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-md font-medium text-sm transition"
                    style={{
                      backgroundColor: 'var(--danger)',
                      color: 'var(--on-danger)'
                    }}
                  >
                    {ikonHenti}
                    Hentikan
                  </button>
                </>
              )}
              <span 
                className="text-xs"
                style={{ color: tertiaryColor }}
              >
                · Tip: ketuk paragraf untuk mulai dari situ, ketuk lagi untuk berhenti. Bacaan lanjut sendiri ke paragraf berikutnya.
              </span>
            </div>
          )}

          {article.thumbnailUrl && (
  <img 
    src={article.thumbnailUrl} 
    alt={article.judul}
    className="w-full rounded-lg mb-10"
    style={{ border: hairline }}
  />
)}

          <div className={`${textSize} ${lineSpacing} space-y-6`}>
            {paragraphs.map((paragraph, index) => {
              const sedangDibacakan = speakingParagraph === index;
              const disorot = sedangDibacakan || hoveredParagraph === index;

              return (
                <p
                  key={index}
                  ref={(el) => {
                    paragrafRefs.current[index] = el;
                  }}
                  onMouseEnter={() => setHoveredParagraph(index)}
                  onMouseLeave={() => setHoveredParagraph(null)}
                  onClick={() => handleParagraphClick(paragraph, index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleParagraphClick(paragraph, index);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-pressed={sedangDibacakan}
                  className="cursor-pointer transition rounded-md py-2 px-3 -mx-3"
                  style={{
                    backgroundColor: disorot ? hoverBg : 'transparent',
                    borderLeft: disorot ? `2px solid ${accentColor}` : '2px solid transparent',
                    // outline dipakai untuk paragraf yang sedang dibacakan
                    // karena tidak menggeser tata letak seperti border.
                    outline: sedangDibacakan ? `2px solid ${accentColor}` : 'none',
                    outlineOffset: '2px'
                  }}
                  title={sedangDibacakan ? 'Klik lagi untuk menghentikan' : 'Klik untuk membacakan paragraf ini'}
                >
                  {paragraph}
                </p>
              );
            })}
          </div>

          <div 
            className="mt-16 pt-8 text-center"
            style={{ borderTop: hairline }}
          >
            <p 
              className="text-xs uppercase tracking-widest mb-2"
              style={{ color: tertiaryColor }}
            >
              Selesai membaca
            </p>
            <Link 
              to="/" 
              className="font-bold tracking-tight text-xl hover:underline"
              style={{ color: accentColor }}
            >
              Jelajahi artikel lainnya →
            </Link>
          </div>
      </article>

      {/* Tombol hentikan melayang: selalu terjangkau sejauh apa pun pembaca
          sudah menggulir, jadi tidak perlu balik ke tombol di kepala artikel.
          Di-portal ke <body> karena <main> memasang CSS `filter` untuk mode
          buta warna — elemen ber-filter jadi containing block baru untuk anak
          position: fixed-nya, sehingga tombol ini akan menempel ke ujung
          artikel, bukan ke layar. Filternya lalu dipasang di sini sendiri. */}
      {isSpeaking && isTTSSupported() && createPortal(
        <div
          className="fixed bottom-6 left-4 z-50 flex items-center gap-2 animate-fade-in"
          style={{ filter: filterWarna, maxWidth: 'calc(100vw - 7rem)' }}
        >
          <button
            onClick={handlePauseResume}
            className="flex items-center gap-2 px-5 py-3 rounded-full shadow-2xl font-medium text-sm transition hover:scale-105"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--on-accent)'
            }}
            aria-label={isPaused ? 'Lanjutkan pembacaan' : 'Jeda pembacaan'}
            title={isPaused ? 'Lanjutkan pembacaan' : 'Jeda pembacaan'}
          >
            {isPaused ? ikonLanjut : ikonJeda}
            <span className="truncate">{isPaused ? 'Lanjutkan' : 'Jeda'}</span>
          </button>
          <button
            onClick={handleStopReading}
            className="flex items-center justify-center p-3 rounded-full shadow-2xl transition hover:scale-105"
            style={{
              backgroundColor: 'var(--danger)',
              color: 'var(--on-danger)'
            }}
            aria-label="Hentikan pembacaan"
            title="Hentikan pembacaan"
          >
            {ikonHenti}
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}

export default ArticleDetailPage;
