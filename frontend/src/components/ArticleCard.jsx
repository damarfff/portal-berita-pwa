// Kartu berita yang dipakai bersama oleh grid "Kategori" dan baris geser
// "Rekomendasi" di beranda. `className` untuk penyesuaian per tempat,
// misalnya lebar tetap saat dipakai di dalam baris geser.
//
// Kartu tidak pernah memasang filter buta warna sendiri — selalu mewarisi
// dari section (grid) atau dari lajur kartu (baris geser).
function ArticleCard({ article, onClick, className = '' }) {
  return (
    <article
      onClick={onClick}
      className={`article-card zoom-hover cursor-pointer group flex flex-col rounded-xl overflow-hidden ${className}`}
    >
      <div
        className="relative aspect-[16/10] overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-elevated)' }}
      >
        {article.thumbnailUrl ? (
          <img
            src={article.thumbnailUrl}
            alt={article.judul}
            className="w-full h-full object-cover transition-transform duration-500"
          />
        ) : (
          <div
            className="text-5xl font-bold"
            style={{ color: 'var(--border-subtle)' }}
          >
            {article.category?.nama?.charAt(0) || '·'}
          </div>
        )}

        <span
          className="absolute top-3 left-3 text-[10px] uppercase tracking-widest font-medium px-2.5 py-1 rounded-full"
          // Sengaja tanpa backdrop-filter: menumpuk filter di dalam elemen
          // yang sudah kena filter buta warna membuat Safari/WebKit gagal
          // memfilter kartunya. Latar dibuat lebih pekat sebagai gantinya.
          style={{
            backgroundColor: 'rgba(13, 17, 23, 0.82)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            color: '#ffffff'
          }}
        >
          {article.category?.nama}
        </span>
      </div>

      <div className="flex flex-col flex-1 p-5">
        <h4
          className="text-lg font-bold leading-snug tracking-tight mb-3"
          style={{ color: 'var(--text-primary)' }}
        >
          <span
            className="group-hover:underline decoration-1 underline-offset-4"
            style={{ textDecorationColor: 'var(--accent)' }}
          >
            {article.judul}
          </span>
        </h4>

        <time
          className="text-sm mt-auto"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {new Date(article.publishedAt).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </time>
      </div>
    </article>
  );
}

export default ArticleCard;
