import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getToken, isAdmin, logout } from '../../lib/auth';
import { authGet, authPut } from '../../lib/api';

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
  const [fetchError, setFetchError] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // article _id being actioned

  // ── Fetch pending articles ─────────────────────────────────────────
  const fetchPending = async () => {
    setFetchError('');
    const { data, ok } = await authGet('/api/articles/pending');
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
            <a href="/admin" style={s.backLink}>← Dashboard</a>
            <h1 style={s.heading}>Pending Articles</h1>
          </div>
          <button onClick={handleLogout} style={s.logoutBtn}>Logout</button>
        </header>

        {fetchError && <p style={s.error}>{fetchError}</p>}

        {!fetchError && articles.length === 0 && (
          <div style={s.emptyCard}>
            <p style={s.empty}>🎉 No pending articles. All caught up!</p>
          </div>
        )}

        {articles.map((article) => (
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
};
