import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getToken, isAdmin, logout } from '../../lib/auth';
import { get, authDelete, authUploadFile } from '../../lib/api';

export default function AdminEpaper() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const fileInputRef = useRef(null);

  // ── Auth guard ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!getToken() || !isAdmin()) {
      router.replace('/admin/login');
    } else {
      setReady(true);
    }
  }, [router]);

  // ── State ──────────────────────────────────────────────────────────
  const [epapers, setEpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Form state
  const todayStr = new Date().toISOString().split('T')[0];
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayStr);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // ── Fetch e-papers ──────────────────────────────────────────────────
  const fetchEpapers = async () => {
    setLoading(true);
    setFetchError('');
    const { data, ok } = await get('/api/epaper');
    setLoading(false);
    if (!ok) {
      setFetchError(data?.message || 'Failed to load e-paper editions');
      return;
    }
    setEpapers(data);
  };

  useEffect(() => {
    if (ready) fetchEpapers();
  }, [ready]);

  // ── Upload new e-paper ──────────────────────────────────────────────
  const handleUpload = async (e) => {
    e.preventDefault();
    setUploadError('');
    setUploadSuccess('');

    if (!selectedFile) {
      setUploadError('Please select a PDF file to upload.');
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Only PDF files are allowed.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim() || `E-Paper Edition - ${date}`);
    formData.append('date', date);
    formData.append('pdf', selectedFile);

    setUploading(true);
    const { data, ok } = await authUploadFile('/api/epaper', formData);
    setUploading(false);

    if (!ok) {
      setUploadError(data?.message || 'Upload failed. Please try again.');
      return;
    }

    setUploadSuccess(`✅ "${data.title}" uploaded successfully!`);
    setTitle('');
    setDate(todayStr);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    fetchEpapers();
  };

  // ── Delete e-paper ──────────────────────────────────────────────────
  const handleDelete = async (id, editionTitle) => {
    if (!confirm(`Are you sure you want to delete "${editionTitle}"?`)) return;

    setDeletingId(id);
    const { ok, data } = await authDelete(`/api/epaper/${id}`);
    setDeletingId(null);

    if (!ok) {
      alert(data?.message || 'Failed to delete e-paper');
      return;
    }

    setEpapers((prev) => prev.filter((p) => p._id !== id));
  };

  const handleLogout = () => {
    logout();
    router.replace('/admin/login');
  };

  if (!ready) return null;

  return (
    <div style={s.page}>
      <div style={s.container}>
        {/* Header */}
        <header style={s.header}>
          <div style={s.breadcrumb}>
            <Link href="/admin" style={s.backLink}>← Dashboard</Link>
            <h1 style={s.heading}>E-Paper Management</h1>
          </div>
          <button onClick={handleLogout} style={s.logoutBtn}>Logout</button>
        </header>

        {/* Upload Form Card */}
        <div style={s.card}>
          <h2 style={s.sectionTitle}>📄 Upload Daily Newspaper PDF</h2>
          <form onSubmit={handleUpload} style={s.form}>
            <div style={s.formGrid}>
              <div style={s.formGroup}>
                <label style={s.label}>Edition Title</label>
                <input
                  type="text"
                  placeholder="e.g. 21 September 2026 Edition"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={s.input}
                />
              </div>

              <div style={s.formGroup}>
                <label style={s.label}>Publication Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  style={s.input}
                />
              </div>
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>Newspaper PDF File</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                required
                style={s.fileInput}
              />
              <span style={s.hint}>Supported format: .pdf (Max size: 50MB)</span>
            </div>

            {uploadError && <div style={s.errorBox}>⚠️ {uploadError}</div>}
            {uploadSuccess && <div style={s.successBox}>{uploadSuccess}</div>}

            <button
              type="submit"
              disabled={uploading}
              style={uploading ? { ...s.btnSubmit, ...s.btnDisabled } : s.btnSubmit}
            >
              {uploading ? '⏳ Uploading to Cloudinary…' : '📤 Upload & Publish E-Paper'}
            </button>
          </form>
        </div>

        {/* Editions List Card */}
        <div style={{ ...s.card, marginTop: '2rem' }}>
          <h2 style={s.sectionTitle}>
            Archived Editions {epapers.length > 0 && `(${epapers.length})`}
          </h2>

          {fetchError && <p style={s.errorText}>{fetchError}</p>}

          {loading && <p style={s.loadingText}>Loading e-paper editions…</p>}

          {!loading && !fetchError && epapers.length === 0 && (
            <p style={s.emptyText}>No e-paper editions uploaded yet.</p>
          )}

          {!loading && epapers.length > 0 && (
            <div style={s.list}>
              {epapers.map((ep) => (
                <div key={ep._id} style={s.listItem}>
                  <div style={s.itemInfo}>
                    <div style={s.itemTitleRow}>
                      <span style={s.itemIcon}>📰</span>
                      <strong style={s.itemTitle}>{ep.title}</strong>
                    </div>
                    <div style={s.metaRow}>
                      <span style={s.badgeDate}>
                        📅 Date:{' '}
                        {new Date(ep.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <span style={s.metaMuted}>
                        Uploaded:{' '}
                        {new Date(ep.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                      {ep.uploadedBy && (
                        <span style={s.metaMuted}>By: {ep.uploadedBy.name}</span>
                      )}
                    </div>
                  </div>

                  <div style={s.actions}>
                    <a
                      href={ep.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={s.btnView}
                    >
                      👁 View PDF
                    </a>
                    <button
                      onClick={() => handleDelete(ep._id, ep.title)}
                      disabled={deletingId === ep._id}
                      style={s.btnDelete}
                    >
                      {deletingId === ep._id ? '…' : '🗑 Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' },
  container: { maxWidth: '840px', margin: '0 auto', padding: '2rem 1rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' },
  breadcrumb: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  backLink: { fontSize: '0.875rem', color: '#1d4ed8', textDecoration: 'none' },
  heading: { margin: 0, fontSize: '1.5rem', color: '#111' },
  logoutBtn: { padding: '0.5rem 1rem', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem' },
  card: { backgroundColor: '#fff', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  sectionTitle: { margin: '0 0 1.25rem', fontSize: '1.15rem', color: '#0f172a', fontWeight: '700' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  label: { fontSize: '0.875rem', fontWeight: '600', color: '#374151' },
  input: { padding: '0.6rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem' },
  fileInput: { padding: '0.4rem 0', fontSize: '0.9rem' },
  hint: { fontSize: '0.78rem', color: '#6b7280' },
  errorBox: { padding: '0.75rem 1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#991b1b', fontSize: '0.875rem' },
  successBox: { padding: '0.75rem 1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', color: '#166534', fontSize: '0.875rem' },
  btnSubmit: { alignSelf: 'flex-start', padding: '0.65rem 1.5rem', backgroundColor: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem' },
  btnDisabled: { backgroundColor: '#94a3b8', cursor: 'not-allowed' },
  list: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '0.9rem 1rem', gap: '1rem', flexWrap: 'wrap' },
  itemInfo: { flex: 1, minWidth: '220px' },
  itemTitleRow: { display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' },
  itemIcon: { fontSize: '1.1rem' },
  itemTitle: { fontSize: '1rem', color: '#111' },
  metaRow: { display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' },
  badgeDate: { fontSize: '0.8rem', color: '#1e40af', backgroundColor: '#eff6ff', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '600' },
  metaMuted: { fontSize: '0.8rem', color: '#6b7280' },
  actions: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
  btnView: { padding: '0.4rem 0.8rem', backgroundColor: '#f3f4f6', color: '#1f2937', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.82rem', fontWeight: '600', textDecoration: 'none' },
  btnDelete: { padding: '0.4rem 0.8rem', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '4px', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer' },
  loadingText: { color: '#6b7280', margin: 0 },
  emptyText: { color: '#6b7280', margin: 0 },
  errorText: { color: '#dc2626', margin: 0 },
};
