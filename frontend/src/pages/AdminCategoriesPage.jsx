import { useState, useEffect, useCallback } from 'react';
import { getCategories } from '../services/articleService';
import { createCategory, deleteCategory } from '../services/adminService';
import AdminLayout from '../components/AdminLayout';

function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
  let cancelled = false;
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      if (!cancelled) {
        setCategories(data);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
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
}, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    if (!newCategoryName.trim()) {
      setError('Nama kategori wajib diisi');
      return;
    }

    setCreating(true);
    try {
      await createCategory(newCategoryName.trim());
      setNewCategoryName('');
      await loadCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat kategori');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id, nama) => {
    if (!confirm(`Yakin ingin menghapus kategori "${nama}"?`)) return;

    setActionLoading(id);
    try {
      await deleteCategory(id);
      await loadCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal hapus kategori');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminLayout>
      <div className="p-12 max-w-4xl">
        <div className="mb-10 animate-fade-in">
          <span 
            className="text-xs uppercase tracking-[0.3em] font-medium"
            style={{ color: 'var(--accent)' }}
          >
            Manajemen Klasifikasi
          </span>
          <h1 
 className="font-bold tracking-tight text-5xl mt-3 mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            Kategori
          </h1>
          <p 
            className="text-base"
            style={{ color: 'var(--text-secondary)' }}
          >
            Tambah atau hapus kategori untuk pengelompokan artikel
          </p>
        </div>

        <div 
          className="rounded-lg p-6 mb-6 animate-fade-in-delay-1"
          style={{ 
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <h2 
            className="font-bold tracking-tight text-lg mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            Tambah Kategori Baru
          </h2>
          
          {error && (
            <div 
              className="p-3 rounded-md mb-4 text-sm"
              style={{ 
                backgroundColor: 'rgba(248, 81, 73, 0.1)',
                border: '1px solid rgba(248, 81, 73, 0.3)',
                color: 'var(--danger)'
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="flex gap-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              style={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)'
              }}
              className="flex-1 px-4 py-2.5 rounded-md transition"
              placeholder="Contoh: Pendidikan"
              disabled={creating}
            />
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2.5 rounded-md text-sm font-medium transition disabled:opacity-50"
              style={{ 
                backgroundColor: 'var(--accent)',
                color: 'var(--bg-primary)'
              }}
              onMouseEnter={(e) => !creating && (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
              onMouseLeave={(e) => !creating && (e.currentTarget.style.backgroundColor = 'var(--accent)')}
            >
              {creating ? 'Menambah...' : '+ Tambah'}
            </button>
          </form>
        </div>

        <div 
          className="rounded-lg overflow-hidden mb-4 animate-fade-in-delay-2"
          style={{ 
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <div 
            className="px-6 py-4"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
          >
            <h2 
              className="font-bold tracking-tight text-lg"
              style={{ color: 'var(--text-primary)' }}
            >
              Daftar Kategori 
              <span 
                className="text-sm ml-2 font-body"
                style={{ color: 'var(--text-tertiary)' }}
              >
                ({categories.length})
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center" style={{ color: 'var(--text-tertiary)' }}>
              Memuat...
            </div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center" style={{ color: 'var(--text-tertiary)' }}>
              Belum ada kategori. Tambah kategori pertama di atas.
            </div>
          ) : (
            <div>
              {categories.map((cat, index) => (
                <div 
                  key={cat.id}
                  className="px-6 py-4 flex items-center justify-between"
                  style={{ 
                    borderBottom: index < categories.length - 1 ? '1px solid var(--border-subtle)' : 'none'
                  }}
                >
                  <div>
                    <p 
                      className="font-medium"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {cat.nama}
                    </p>
                    <p 
                      className="text-xs mt-0.5"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      slug: {cat.slug}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(cat.id, cat.nama)}
                    disabled={actionLoading === cat.id}
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
              ))}
            </div>
          )}
        </div>

        <div 
          className="rounded-lg p-4 text-sm flex items-start gap-3 animate-fade-in-delay-3"
          style={{ 
            backgroundColor: 'var(--accent-muted)',
            border: '1px solid var(--border-accent)'
          }}
        >
          <div 
            className="w-1 self-stretch rounded-full flex-shrink-0"
            style={{ backgroundColor: 'var(--accent)' }}
          />
          <div>
            <p 
              className="font-medium mb-1"
              style={{ color: 'var(--text-primary)' }}
            >
              Catatan
            </p>
            <p style={{ color: 'var(--text-secondary)' }}>
              Kategori yang masih dipakai oleh artikel tidak bisa dihapus. 
              Hapus atau pindahkan artikel dulu sebelum menghapus kategorinya.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminCategoriesPage;