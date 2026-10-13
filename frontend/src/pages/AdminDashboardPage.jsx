import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllArticlesAdmin } from '../services/adminService';
import { getCategories } from '../services/articleService';
import AdminLayout from '../components/AdminLayout';

function StatCard({ label, value, accent }) {
  return (
    <div 
      className="rounded-lg p-6 transition"
      style={{ 
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)'
      }}
    >
      <p 
        className="text-xs uppercase tracking-widest font-medium mb-2"
        style={{ color: 'var(--text-tertiary)' }}
      >
        {label}
      </p>
      <p 
        className="font-bold tracking-tight text-4xl"
        style={{ color: accent ? 'var(--accent)' : 'var(--text-primary)' }}
      >
        {value}
      </p>
    </div>
  );
}

function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalCategories: 0
  });
  const [recentArticles, setRecentArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [allArticles, categories] = await Promise.all([
          getAllArticlesAdmin(),
          getCategories()
        ]);

        const published = allArticles.filter(a => a.status === 'published');
        const drafts = allArticles.filter(a => a.status === 'draft');

        setStats({
          totalArticles: allArticles.length,
          publishedArticles: published.length,
          draftArticles: drafts.length,
          totalCategories: categories.length
        });

        setRecentArticles(allArticles.slice(0, 5));
      } catch (err) {
        console.error('Error loading stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-12">
          <p style={{ color: 'var(--text-tertiary)' }}>Memuat...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-12 max-w-6xl">
        <div className="mb-10 animate-fade-in">
          <span 
            className="text-xs uppercase tracking-[0.3em] font-medium"
            style={{ color: 'var(--accent)' }}
          >
              Sorotan Editorial
          </span>
          <h1 
 className="font-bold tracking-tight text-5xl mt-3 mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            Ringkasan
          </h1>
          <p 
            className="text-base"
            style={{ color: 'var(--text-secondary)' }}
          >
            Ringkasan statistik portal berita
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 animate-fade-in-delay-1">
          <StatCard label="Total Artikel" value={stats.totalArticles} />
          <StatCard label="Diterbitkan" value={stats.publishedArticles} accent />
          <StatCard label="Draf" value={stats.draftArticles} />
          <StatCard label="Kategori" value={stats.totalCategories} />
        </div>

        <div 
          className="rounded-lg overflow-hidden mb-8 animate-fade-in-delay-2"
          style={{ 
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <div 
            className="px-6 py-4 flex items-center justify-between"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
          >
            <div>
              <h2 
                className="font-bold tracking-tight text-lg"
                style={{ color: 'var(--text-primary)' }}
              >
                Aktivitas Terbaru
              </h2>
              <p 
                className="text-xs mt-0.5"
                style={{ color: 'var(--text-tertiary)' }}
              >
                5 artikel terakhir diupdate
              </p>
            </div>
            <Link 
              to="/admin/articles" 
              className="text-sm transition hover:underline"
              style={{ color: 'var(--accent)' }}
            >
              Lihat Semua →
            </Link>
          </div>
          
          {recentArticles.length === 0 ? (
            <div className="p-8 text-center">
              <p 
                className="mb-3"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Belum ada artikel
              </p>
              <Link 
                to="/admin/articles/new" 
                className="text-sm transition hover:underline"
                style={{ color: 'var(--accent)' }}
              >
                Buat artikel pertama →
              </Link>
            </div>
          ) : (
            <div>
              {recentArticles.map((article, index) => (
                <div 
                  key={article.id} 
                  className="px-6 py-4 flex items-center justify-between"
                  style={{ 
                    borderBottom: index < recentArticles.length - 1 ? '1px solid var(--border-subtle)' : 'none'
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p 
                      className="font-medium truncate"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {article.judul}
                    </p>
                    <div 
                      className="flex items-center gap-2 text-xs mt-1"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      <span>{article.category?.nama}</span>
                      <span>·</span>
                      <span>
                        {new Date(article.updatedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  <span 
                    className="text-xs font-medium px-2.5 py-1 rounded-full ml-3"
                    style={{ 
                      backgroundColor: article.status === 'published' 
                        ? 'rgba(63, 185, 80, 0.15)' 
                        : 'rgba(210, 153, 34, 0.15)',
                      color: article.status === 'published' 
                        ? 'var(--success)' 
                        : 'var(--warning)'
                    }}
                  >
                    {article.status === 'published' ? 'Diterbitkan' : 'Draf'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-delay-3">
          <Link 
            to="/admin/articles/new"
            className="rounded-lg p-6 transition group"
            style={{ 
              backgroundColor: 'var(--accent)',
              color: 'var(--bg-primary)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent)'}
          >
            <p className="font-bold tracking-tight text-xl mb-2">
              Tulis Artikel Baru
            </p>
            <p className="text-sm opacity-90">
              Buat artikel baru, simpan sebagai draft atau langsung publish
            </p>
          </Link>
          <Link 
            to="/admin/categories"
            className="rounded-lg p-6 transition"
            style={{ 
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
          >
            <p 
              className="font-bold tracking-tight text-xl mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              Kelola Kategori
            </p>
            <p 
              className="text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              Tambah atau hapus kategori untuk artikel
            </p>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboardPage;
