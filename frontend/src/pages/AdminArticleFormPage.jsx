import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  createArticle, 
  updateArticle, 
  getArticleById 
} from '../services/adminService';
import { getCategories } from '../services/articleService';
import AdminLayout from '../components/AdminLayout';

function AdminArticleFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    judul: '',
    isi: '',
    categoryId: '',
    thumbnailUrl: '',
    publisherName: ''
  });
  const [originalStatus, setOriginalStatus] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [thumbnailMode, setThumbnailMode] = useState('file');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const cats = await getCategories();
        setCategories(cats);

        if (isEditMode) {
          const article = await getArticleById(id);
          if (article) {
            setFormData({
              judul: article.judul,
              isi: article.isi,
              categoryId: article.categoryId.toString(),
              thumbnailUrl: '',
              publisherName: article.publisherName || ''
            });
            setOriginalStatus(article.status);
            
            if (article.thumbnailUrl) {
              setExistingThumbnailUrl(article.thumbnailUrl);
              if (article.thumbnailUrl.startsWith('/uploads/')) {
                setThumbnailMode('file');
              } else {
                setThumbnailMode('url');
                setFormData(prev => ({ ...prev, thumbnailUrl: article.thumbnailUrl }));
              }
            }
          } else {
            setError('Artikel tidak ditemukan');
          }
        }
      } catch (err) {
        setError('Gagal memuat data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEditMode]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('File harus berupa gambar (JPG, PNG, WEBP, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5MB');
      return;
    }

    setError('');
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveExistingThumbnail = () => {
    setExistingThumbnailUrl('');
    setFormData(prev => ({ ...prev, thumbnailUrl: '' }));
  };

  const validate = () => {
    if (!formData.judul.trim()) {
      setError('Judul wajib diisi');
      return false;
    }
    if (!formData.isi.trim()) {
      setError('Isi artikel wajib diisi');
      return false;
    }
    if (!formData.categoryId) {
      setError('Pilih kategori');
      return false;
    }
    return true;
  };

  const handleSave = async (publishStatus) => {
    setError('');
    if (!validate()) return;

    setSaving(true);
    try {
      const data = new FormData();
      data.append('judul', formData.judul.trim());
      data.append('isi', formData.isi.trim());
      data.append('categoryId', formData.categoryId);
      data.append('publisherName', formData.publisherName.trim());
      
      if (!isEditMode) {
        data.append('status', publishStatus);
      }
      
      if (thumbnailMode === 'file' && selectedFile) {
        data.append('thumbnailFile', selectedFile);
      } else if (thumbnailMode === 'url' && formData.thumbnailUrl.trim()) {
        data.append('thumbnailUrl', formData.thumbnailUrl.trim());
      } else if (isEditMode && !existingThumbnailUrl) {
        data.append('thumbnailUrl', '');
      }

      if (isEditMode) {
        await updateArticle(id, data);
        if (publishStatus === 'published' && originalStatus === 'draft') {
          const { publishArticle } = await import('../services/adminService');
          await publishArticle(id);
        }
      } else {
        await createArticle(data);
      }

      navigate('/admin/articles');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan artikel');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-body)'
  };

  const labelStyle = {
    color: 'var(--text-secondary)'
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-12">
          <p style={{ color: 'var(--text-tertiary)' }}>Memuat...</p>
        </div>
      </AdminLayout>
    );
  }

  const fullThumbnailUrl = existingThumbnailUrl;

  return (
    <AdminLayout>
      <div className="p-12 max-w-4xl">
        <div className="mb-10 animate-fade-in">
          <Link 
            to="/admin/articles" 
            className="text-sm transition hover:underline mb-4 inline-block"
            style={{ color: 'var(--accent)' }}
          >
            ← Kembali ke Daftar Artikel
          </Link>
          <h1 
 className="font-bold tracking-tight text-4xl"
            style={{ color: 'var(--text-primary)' }}
          >
            {isEditMode ? 'Edit Artikel' : 'Tulis Artikel Baru'}
          </h1>
          {isEditMode && originalStatus && (
            <span 
              className="inline-block mt-3 text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ 
                backgroundColor: originalStatus === 'published' 
                  ? 'rgba(63, 185, 80, 0.15)' 
                  : 'rgba(210, 153, 34, 0.15)',
                color: originalStatus === 'published' 
                  ? 'var(--success)' 
                  : 'var(--warning)'
              }}
            >
              Status: {originalStatus === 'published' ? 'Published' : 'Draft'}
            </span>
          )}
        </div>

        {error && (
          <div 
            className="p-4 rounded-lg mb-6 text-sm"
            style={{ 
              backgroundColor: 'rgba(248, 81, 73, 0.1)',
              border: '1px solid rgba(248, 81, 73, 0.3)',
              color: 'var(--danger)'
            }}
          >
            {error}
          </div>
        )}

        <div 
          className="rounded-lg p-8 space-y-6 animate-fade-in-delay-1"
          style={{ 
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <div>
            <label 
              className="block text-xs uppercase tracking-widest font-medium mb-2"
              style={labelStyle}
            >
              Judul Artikel <span style={{ color: 'var(--accent)' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.judul}
              onChange={(e) => handleChange('judul', e.target.value)}
              style={inputStyle}
              className="w-full px-4 py-3 rounded-md transition"
              placeholder="Contoh: Kemajuan Teknologi AI di Indonesia"
            />
          </div>

          <div>
            <label 
              className="block text-xs uppercase tracking-widest font-medium mb-2"
              style={labelStyle}
            >
              Kategori <span style={{ color: 'var(--accent)' }}>*</span>
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => handleChange('categoryId', e.target.value)}
              style={inputStyle}
              className="w-full px-4 py-3 rounded-md transition"
            >
              <option value="">— Pilih kategori —</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label 
              className="block text-xs uppercase tracking-widest font-medium mb-2"
              style={labelStyle}
            >
              Nama Publisher
            </label>
            <input
              type="text"
              value={formData.publisherName}
              onChange={(e) => handleChange('publisherName', e.target.value)}
              style={inputStyle}
              className="w-full px-4 py-3 rounded-md transition"
              placeholder="Kosongkan untuk menggunakan nama Administrator"
            />
            <p 
              className="text-xs mt-2"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Nama yang akan tampil sebagai penulis artikel. Jika kosong, akan menggunakan nama admin yang login.
            </p>
          </div>

          <div>
            <label 
              className="block text-xs uppercase tracking-widest font-medium mb-3"
              style={labelStyle}
            >
              Gambar Thumbnail
            </label>

            {existingThumbnailUrl && !filePreview && (
              <div className="mb-4">
                <p 
                  className="text-xs mb-2"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Thumbnail saat ini:
                </p>
                <div 
                  className="rounded-md overflow-hidden mb-2"
                  style={{ border: '1px solid var(--border-subtle)' }}
                >
                  <img 
                    src={fullThumbnailUrl} 
                    alt="Existing thumbnail"
                    className="w-full max-h-48 object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveExistingThumbnail}
                  className="text-xs px-3 py-1.5 rounded-md transition"
                  style={{ 
                    backgroundColor: 'rgba(248, 81, 73, 0.1)',
                    color: 'var(--danger)',
                    border: '1px solid rgba(248, 81, 73, 0.3)'
                  }}
                >
                  Hapus thumbnail
                </button>
              </div>
            )}

            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setThumbnailMode('file')}
                className="px-4 py-2 rounded-md text-sm transition"
                style={{
                  backgroundColor: thumbnailMode === 'file' ? 'var(--accent-muted)' : 'transparent',
                  color: thumbnailMode === 'file' ? 'var(--accent)' : 'var(--text-secondary)',
                  border: `1px solid ${thumbnailMode === 'file' ? 'var(--accent)' : 'var(--border-subtle)'}`,
                  fontWeight: thumbnailMode === 'file' ? 500 : 400
                }}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setThumbnailMode('url')}
                className="px-4 py-2 rounded-md text-sm transition"
                style={{
                  backgroundColor: thumbnailMode === 'url' ? 'var(--accent-muted)' : 'transparent',
                  color: thumbnailMode === 'url' ? 'var(--accent)' : 'var(--text-secondary)',
                  border: `1px solid ${thumbnailMode === 'url' ? 'var(--accent)' : 'var(--border-subtle)'}`,
                  fontWeight: thumbnailMode === 'url' ? 500 : 400
                }}
              >
                URL Link
              </button>
            </div>

            {thumbnailMode === 'file' && (
              <div>
                {!filePreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-md cursor-pointer transition p-8 text-center"
                    style={{ 
                      border: '2px dashed var(--border-subtle)',
                      backgroundColor: 'var(--bg-primary)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                  >
                    <svg 
                      width="40" 
                      height="40" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="1.5"
                      className="mx-auto mb-3"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <p 
                      className="font-medium mb-1"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Klik untuk pilih gambar
                    </p>
                    <p 
                      className="text-xs"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      JPG, PNG, WEBP, GIF · Maksimal 5MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <div 
                      className="rounded-md overflow-hidden mb-3"
                      style={{ border: '1px solid var(--border-subtle)' }}
                    >
                      <img 
                        src={filePreview} 
                        alt="Preview"
                        className="w-full max-h-64 object-cover"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <span 
                        className="text-sm flex-1 truncate"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {selectedFile?.name}
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="text-xs px-3 py-1.5 rounded-md transition"
                        style={{ 
                          backgroundColor: 'rgba(248, 81, 73, 0.1)',
                          color: 'var(--danger)',
                          border: '1px solid rgba(248, 81, 73, 0.3)'
                        }}
                      >
                        Ganti file
                      </button>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            )}

            {thumbnailMode === 'url' && (
              <div>
                <input
                  type="url"
                  value={formData.thumbnailUrl}
                  onChange={(e) => handleChange('thumbnailUrl', e.target.value)}
                  style={inputStyle}
                  className="w-full px-4 py-3 rounded-md transition"
                  placeholder="https://contoh.com/gambar.jpg"
                />
                <p 
                  className="text-xs mt-2"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Tempel link gambar dari internet
                </p>
              </div>
            )}
          </div>

          <div>
            <label 
              className="block text-xs uppercase tracking-widest font-medium mb-2"
              style={labelStyle}
            >
              Isi Artikel <span style={{ color: 'var(--accent)' }}>*</span>
            </label>
            <textarea
              value={formData.isi}
              onChange={(e) => handleChange('isi', e.target.value)}
              rows={15}
              style={{ ...inputStyle, fontFamily: 'var(--font-body)' }}
              className="w-full px-4 py-3 rounded-md transition leading-relaxed"
              placeholder="Tulis artikel di sini. Pisahkan paragraf dengan baris kosong (tekan Enter dua kali)."
            />
            <p 
              className="text-xs mt-2"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Pisahkan paragraf dengan baris kosong
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-between items-center animate-fade-in-delay-2">
          <Link 
            to="/admin/articles" 
            className="text-sm transition hover:underline"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Batal
          </Link>
          
          <div className="flex gap-3">
            <button
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="px-5 py-2.5 rounded-md text-sm transition disabled:opacity-50"
              style={{ 
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              {saving ? 'Menyimpan...' : 'Simpan Draft'}
            </button>
            <button
              onClick={() => handleSave('published')}
              disabled={saving}
              className="px-5 py-2.5 rounded-md text-sm font-medium transition disabled:opacity-50"
              style={{ 
                backgroundColor: 'var(--accent)',
                color: 'var(--bg-primary)'
              }}
              onMouseEnter={(e) => !saving && (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
              onMouseLeave={(e) => !saving && (e.currentTarget.style.backgroundColor = 'var(--accent)')}
            >
              {saving ? 'Menyimpan...' : (isEditMode ? 'Simpan & Publish' : 'Publish Sekarang')}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminArticleFormPage;