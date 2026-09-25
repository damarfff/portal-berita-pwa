import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  getAllArticlesAdmin, 
  publishArticle, 
  deleteArticle 
} from '../services/adminService';
import AdminLayout from '../components/AdminLayout';

function AdminArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();

  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
      const status = filter === 'all' ? null : filter;
      const data = await getAllArticlesAdmin(status);
      setArticles(data);
    } catch (err) {
      console.error('Error loading articles:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

useEffect(() => {
  let cancelled = false;
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const status = filter === 'all' ? null : filter;
      const data = await getAllArticlesAdmin(status);
      if (!cancelled) {
        setArticles(data);
      }
    } catch (err) {
      console.error('Error loading articles:', err);
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };
  
  fetchData();
  
  return () => {
    cancelled = true;
  };
}, [filter]);

  const handlePublish = async (id) => {
    if (!confirm('Yakin ingin mempublikasikan artikel ini?')) return;
    
    setActionLoading(id);
    try {
      await publishArticle(id);
      await loadArticles();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal publish artikel');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id, judul) => {
    if (!confirm(`Yakin ingin menghapus "${judul}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    
    setActionLoading(id);
    try {
      await deleteArticle(id);
      await loadArticles();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal hapus artikel');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminLayout>
      <div className="p-12 max-w-6xl">
        <div className="flex items-start justify-between mb-10 animate-fade-in">
          <div>
            <span 
              className="text-xs uppercase tracking-[0.3em] font-medium"
              style={{ color: 'var(--accent)' }}
            >
              Manajemen Konten
            </span>
            <h1 
 className="font-bold tracking-tight text-5xl mt-3 mb-3"
              style={{ color: 'var(--text-primary)' }}
            >
              Artikel
            </h1>
            <p 
              className="text-base"
              style={{ color: 'var(--text-secondary)' }}
            >
              Buat, edit, dan kelola seluruh artikel
            </p>
          </div>
          <Link
            to="/admin/articles/new"
            className="px-5 py-2.5 rounded-md text-sm font-medium transition"
            style={{ 
              backgroundColor: 'var(--accent)',
              color: 'var(--bg-primary)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent)'}
          >
            + Tulis Baru
          </Link>
        </div>

        <div className="flex gap-2 mb-6 animate-fade-in-delay-1">
          {[
            { value: 'all', label: 'Semua' },
            { value: 'published', label: 'Published' },
            { value: 'draft', label: 'Draft' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className="px-4 py-2 rounded-md text-sm transition"
              style={{
                backgroundColor: filter === option.value ? 'var(--accent-muted)' : 'transparent',
                color: filter === option.value ? 'var(--accent)' : 'var(--text-secondary)',
                border: `1px solid ${filter === option.value ? 'var(--accent)' : 'var(--border-subtle)'}`,
                fontWeight: filter === option.value ? 500 : 400
              }}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div 
          className="rounded-lg overflow-hidden animate-fade-in-delay-2"
          style={{ 
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          {loading ? (
            <div className="p-12 text-center" style={{ color: 'var(--text-tertiary)' }}>
              Memuat...
            </div>
          ) : articles.length === 0 ? (
            <div className="p-12 text-center" style={{ color: 'var(--text-tertiary)' }}>
              Belum ada artikel di kategori ini.
            </div>
          ) : (
            <table className="w-full">
              <thead 
                style={{ 
                  backgroundColor: 'var(--bg-elevated)',
                  borderBottom: '1px solid var(--border-subtle)'
                }}
              >
                <tr>
                  <th 
                    className="text-left px-4 py-3 text-xs uppercase tracking-widest font-medium"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    Judul
                  </th>
                  <th 
                    className="text-left px-4 py-3 text-xs uppercase tracking-widest font-medium"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    Kategori
                  </th>
                  <th 
                    className="text-left px-4 py-3 text-xs uppercase tracking-widest font-medium"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    Status
                  </th>
                  <th 
                    className="text-left px-4 py-3 text-xs uppercase tracking-widest font-medium"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    Diupdate
                  </th>
                  <th 
                    className="text-right px-4 py-3 text-xs uppercase tracking-widest font-medium"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article, index) => (
                  <tr 
                    key={article.id}
                    style={{ 
                      borderBottom: index < articles.length - 1 ? '1px solid var(--border-subtle)' : 'none'
                    }}
                  >
                    <td className="px-4 py-4">
                      <p 
                        className="font-medium"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {article.judul}
                      </p>
                      <p 
                        className="text-xs mt-0.5 truncate max-w-md"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        {article.slug}
                      </p>
                    </td>
                    <td 
                      className="px-4 py-4 text-sm"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {article.category?.nama}
                    </td>
                    <td className="px-4 py-4">
                      <span 
                        className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ 
                          backgroundColor: article.status === 'published' 
                            ? 'rgba(63, 185, 80, 0.15)' 
                            : 'rgba(210, 153, 34, 0.15)',
                          color: article.status === 'published' 
                            ? 'var(--success)' 
                            : 'var(--warning)'
                        }}
                      >
                        {article.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td 
                      className="px-4 py-4 text-sm"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {new Date(article.updatedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {article.status === 'draft' && (
                          <button
                            onClick={() => handlePublish(article.id)}
                            disabled={actionLoading === article.id}
                            className="text-xs px-3 py-1.5 rounded-md transition disabled:opacity-50"
                            style={{ 
                              backgroundColor: 'rgba(63, 185, 80, 0.15)',
                              color: 'var(--success)',
                              border: '1px solid rgba(63, 185, 80, 0.3)'
                            }}
                          >
                            Publish
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/admin/articles/edit/${article.id}`)}
                          className="text-xs px-3 py-1.5 rounded-md transition"
                          style={{ 
                            backgroundColor: 'var(--bg-elevated)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-subtle)'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(article.id, article.judul)}
                          disabled={actionLoading === article.id}
                          className="text-xs px-3 py-1.5 rounded-md transition disabled:opacity-50"
                          style={{ 
                            backgroundColor: 'rgba(248, 81, 73, 0.1)',
                            color: 'var(--danger)',
                            border: '1px solid rgba(248, 81, 73, 0.3)'
                          }}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminArticlesPage;