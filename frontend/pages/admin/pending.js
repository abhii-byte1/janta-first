import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getToken, isAdmin, logout } from '../../lib/auth';
import { authGet, authPut, authPost } from '../../lib/api';

export default function AdminPending() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  // ── Auth guard (same pattern as index.js) ──────────────────────────
  useEffect(() => {
    if (!getToken() || !isAdmin()) {
      router.replace('/admin/login');
    } else {
      setReady(true);
    }
  }, [router]);

  // ── State ──────────────────────────────────────────────────────────
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // article _id being actioned

  // ── Import state ───────────────────────────────────────────────────
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState('');

  // ── Fetch pending articles ─────────────────────────────────────────
  const fetchPending = async () => {
    setLoading(true);
    setFetchError('');
    const { data, ok } = await authGet('/api/articles/pending');
    setLoading(false);
    if (!ok) {
      setFetchError(data?.message || 'Failed to load pending articles');
      return;
    }
    setArticles(data);
  };

  useEffect(() => {
    if (ready) fetchPending();
  }, [ready]);

  // ── Approve / Reject ───────────────────────────────────────────────
  const handleAction = async (id, action) => {
    setActionLoading(id);
    const { ok, data } = await authPut(`/api/articles/${id}/${action}`, {});
    setActionLoading(null);
    if (!ok) {
      alert(data?.message || `Failed to ${action} article`);
      return;
    }
    // Remove from list immediately without a full refetch
    setArticles((prev) => prev.filter((a) => a._id !== id));
  };

  // ── Import 10 Latest News from NewsData.io ─────────────────────────
  const handleImportNews = async () => {
    setImporting(true);
    setImportResult(null);
    setImportError('');
    const { data, ok } = await authPost('/api/import/newsdata', {});
    setImporting(false);
    if (!ok) {
      setImportError(data?.message || 'Failed to import news from NewsData.io');
      return;
    }
    setImportResult(data);
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
            <h1 style={s.heading}>Pending Articles</h1>
          </div>
          <button onClick={handleLogout} style={s.logoutBtn}>Logout</button>
        </header>

        {/* Import News Section */}
        <section style={s.importCard}>
          <div style={s.importTop}>
            <div>
              <h2 style={s.importTitle}>NewsData.io Auto-Import</h2>
              <p style={s.importDesc}>
                Pull latest Hindi news from NewsData.io API directly into your database.
              </p>
            </div>
            <button
              onClick={handleImportNews}
              disabled={importing}
              style={importing ? { ...s.btnImport, ...s.btnImportDisabled } : s.btnImport}
            >
              {importing ? '⏳ Importing News…' : '📥 Import 10 Latest News'}
            </button>
          </div>

          <p style={s.importNotice}>
            ℹ️ <strong>Note:</strong> Imported articles are saved with <code>draft</code> status and have no category assigned. Review, categorize, and submit them for publishing in your <Link href="/dashboard" style={s.linkText}>Articles Dashboard</Link>.
          </p>

          {importResult && (
            <div style={s.importResultBox}>
              <p style={s.importSuccessTitle}>
                ✅ <strong>Import complete!</strong>
              </p>
              <ul style={s.importResultList}>
                <li><strong>{importResult.imported}</strong> new article{importResult.imported === 1 ? '' : 's'} imported as Drafts.</li>
                <li><strong>{importResult.skipped}</strong> duplicate article{importResult.skipped === 1 ? '' : 's'} skipped.</li>
                <li><strong>{importResult.total_fetched}</strong> articles fetched in total.</li>
              </ul>
            </div>
          )}

          {importError && (
            <div style={s.importErrorBox}>
              ⚠️ <strong>Import Error:</strong> {importError}
            </div>
          )}
        </section>

        {fetchError && <p style={s.error}>{fetchError}</p>}

        {loading && (
          <div style={s.emptyCard}>
            <p style={s.empty}>Loading pending articles…</p>
          </div>
        )}

        {!loading && !fetchError && articles.length === 0 && (
          <div style={s.emptyCard}>
            <p style={s.empty}>🎉 No pending articles. All caught up!</p>
          </div>
        )}

        {!loading && articles.map((article) => (
          <div key={article._id} style={s.articleCard}>
            <div style={s.articleMeta}>
              <h2 style={s.articleTitle}>{article.title}</h2>
              <div style={s.metaRow}>
                <span style={s.metaItem}>
                  <strong>By:</strong>{' '}
                  {article.submittedBy?.name || '—'}{' '}
                  <span style={s.email}>({article.submittedBy?.email || '—'})</span>
                </span>
                {article.category && (
                  <span style={s.metaItem}>
                    <strong>Category:</strong> {article.category.name}
                  </span>
                )}
                <span style={s.metaItem}>
                  <strong>Submitted:</strong>{' '}
                  {new Date(article.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </span>
              </div>
              {article.tags?.length > 0 && (
                <div style={s.tags}>
                  {article.tags.map((tag) => (
                    <span key={tag} style={s.tag}>{tag}</span>
                  ))}
                </div>
              )}
            </div>

            <div style={s.actions}>
              <button
                onClick={() => handleAction(article._id, 'approve')}
                disabled={actionLoading === article._id}
                style={s.btnApprove}
              >
                {actionLoading === article._id ? '…' : '✓ Approve'}
              </button>
              <button
                onClick={() => handleAction(article._id, 'reject')}
                disabled={actionLoading === article._id}
                style={s.btnReject}
              >
                {actionLoading === article._id ? '…' : '✕ Reject'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' },
  container: { maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' },
  breadcrumb: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  backLink: { fontSize: '0.875rem', color: '#1d4ed8', textDecoration: 'none' },
  heading: { margin: 0, fontSize: '1.5rem', color: '#111' },
  logoutBtn: { padding: '0.5rem 1rem', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem' },
  error: { color: '#dc2626', fontSize: '0.9rem', margin: '0 0 1rem' },
  emptyCard: { backgroundColor: '#fff', borderRadius: '8px', padding: '2rem', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  empty: { color: '#6b7280', margin: 0 },
  articleCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '1.25rem 1.5rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    marginBottom: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  articleMeta: { flex: 1 },
  articleTitle: { margin: '0 0 0.5rem', fontSize: '1.05rem', color: '#111', fontWeight: '700' },
  metaRow: { display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.5rem' },
  metaItem: { fontSize: '0.85rem', color: '#374151' },
  email: { color: '#6b7280' },
  tags: { display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.35rem' },
  tag: { backgroundColor: '#e0e7ff', color: '#3730a3', borderRadius: '999px', padding: '0.1rem 0.6rem', fontSize: '0.75rem' },
  actions: { display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '110px' },
  btnApprove: { padding: '0.5rem 0.9rem', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '700', cursor: 'pointer', fontSize: '0.875rem' },
  btnReject: { padding: '0.5rem 0.9rem', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '700', cursor: 'pointer', fontSize: '0.875rem' },
  importCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '1.25rem 1.5rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    marginBottom: '1.5rem',
    border: '1px solid #e2e8f0',
  },
  importTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
    marginBottom: '0.75rem',
  },
  importTitle: {
    margin: 0,
    fontSize: '1.15rem',
    color: '#0f172a',
    fontWeight: '700',
  },
  importDesc: {
    margin: '0.25rem 0 0',
    fontSize: '0.875rem',
    color: '#64748b',
  },
  btnImport: {
    padding: '0.6rem 1.2rem',
    backgroundColor: '#1d4ed8',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '0.875rem',
    whiteSpace: 'nowrap',
    transition: 'background-color 0.15s ease',
  },
  btnImportDisabled: {
    backgroundColor: '#94a3b8',
    cursor: 'not-allowed',
  },
  importNotice: {
    margin: '0.5rem 0 0',
    fontSize: '0.8rem',
    color: '#475569',
    backgroundColor: '#f8fafc',
    padding: '0.5rem 0.75rem',
    borderRadius: '4px',
    border: '1px solid #e2e8f0',
  },
  linkText: {
    color: '#1d4ed8',
    textDecoration: 'underline',
  },
  importResultBox: {
    marginTop: '1rem',
    padding: '0.75rem 1rem',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '6px',
    color: '#166534',
  },
  importSuccessTitle: {
    margin: '0 0 0.4rem',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  importResultList: {
    margin: 0,
    paddingLeft: '1.25rem',
    fontSize: '0.85rem',
  },
  importErrorBox: {
    marginTop: '1rem',
    padding: '0.75rem 1rem',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    color: '#991b1b',
    fontSize: '0.85rem',
  },
};
