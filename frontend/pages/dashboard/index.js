import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getToken, logout } from '../../lib/auth';
import { authGet, authPut } from '../../lib/api';

// Status badge colours
const STATUS_STYLE = {
  draft:     { backgroundColor: '#e5e7eb', color: '#374151' },
  pending:   { backgroundColor: '#fef3c7', color: '#92400e' },
  published: { backgroundColor: '#dcfce7', color: '#166534' },
  rejected:  { backgroundColor: '#fee2e2', color: '#991b1b' },
};

const EDITABLE_STATUSES = ['draft', 'pending'];

export default function DashboardIndex() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [submittingId, setSubmittingId] = useState(null);

  // ── Auth guard: any logged-in user ─────────────────────────────────
  useEffect(() => {
    if (!getToken()) {
      router.replace('/dashboard/login');
    } else {
      setReady(true);
    }
  }, [router]);

  // ── Fetch my articles ──────────────────────────────────────────────
  const fetchArticles = async () => {
    setLoading(true);
    const { data, ok } = await authGet('/api/articles/my');
    setLoading(false);
    if (!ok) {
      setFetchError(data?.message || 'Failed to load articles');
      return;
    }
    setArticles(data);
  };

  useEffect(() => {
    if (ready) fetchArticles();
  }, [ready]);

  // ── Submit draft article for review ────────────────────────────────
  const handleSubmitForReview = async (id) => {
    setSubmittingId(id);
    const { ok, data } = await authPut(`/api/articles/${id}/submit`, {});
    setSubmittingId(null);
    if (!ok) {
      alert(data?.message || 'Failed to submit article for review');
      return;
    }
    await fetchArticles();
  };

  const handleLogout = () => {
    logout();
    router.replace('/dashboard/login');
  };

  if (!ready) return null;

  return (
    <div style={s.page}>
      <div style={s.container}>
        {/* Header */}
        <header style={s.header}>
          <h1 style={s.heading}>My Dashboard</h1>
          <div style={s.headerActions}>
            <a href="/dashboard/new" style={s.btnNew}>+ Write New Article</a>
            <button onClick={handleLogout} style={s.logoutBtn}>Logout</button>
          </div>
        </header>

        {fetchError && <p style={s.error}>{fetchError}</p>}

        {loading && (
          <div style={s.emptyCard}>
            <p style={s.empty}>Loading your articles…</p>
          </div>
        )}

        {!loading && !fetchError && articles.length === 0 && (
          <div style={s.emptyCard}>
            <p style={s.empty}>You haven't submitted any articles yet.</p>
            <a href="/dashboard/new" style={s.btnNew}>Write your first article →</a>
          </div>
        )}

        {!loading && articles.length > 0 && (
          <div style={s.card}>
            <h2 style={s.sectionTitle}>Your Articles ({articles.length})</h2>
            <ul style={s.list}>
              {articles.map((article) => {
                const canEdit = EDITABLE_STATUSES.includes(article.status);
                return (
                  <li key={article._id} style={s.listItem}>
                    <div style={s.articleInfo}>
                      <span style={s.articleTitle}>{article.title}</span>
                      <div style={s.metaRow}>
                        <span style={{ ...s.badge, ...STATUS_STYLE[article.status] }}>
                          {article.status}
                        </span>
                        <span style={s.date}>
                          {new Date(article.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </span>
                        {article.category && (
                          <span style={s.catLabel}>{article.category.name}</span>
                        )}
                      </div>
                    </div>
                    <div style={s.actions}>
                      {article.status === 'draft' && (
                        <button
                          onClick={() => handleSubmitForReview(article._id)}
                          disabled={submittingId === article._id}
                          style={s.btnSubmitReview}
                        >
                          {submittingId === article._id ? 'Submitting…' : 'Submit for Review'}
                        </button>
                      )}
                      {canEdit ? (
                        <a href={`/dashboard/edit/${article._id}`} style={s.btnEdit}>
                          Edit
                        </a>
                      ) : (
                        <span style={s.btnEditDisabled} title={`Cannot edit: status is ${article.status}`}>
                          Edit
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' },
  container: { maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' },
  heading: { margin: 0, fontSize: '1.5rem', color: '#111' },
  headerActions: { display: 'flex', gap: '0.75rem', alignItems: 'center' },
  btnNew: { padding: '0.5rem 1rem', backgroundColor: '#1d4ed8', color: '#fff', borderRadius: '4px', textDecoration: 'none', fontWeight: '600', fontSize: '0.875rem' },
  logoutBtn: { padding: '0.5rem 1rem', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem' },
  error: { color: '#dc2626', fontSize: '0.9rem', marginBottom: '1rem' },
  emptyCard: { backgroundColor: '#fff', borderRadius: '8px', padding: '2rem', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' },
  empty: { color: '#6b7280', margin: 0 },
  card: { backgroundColor: '#fff', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  sectionTitle: { margin: '0 0 1rem', fontSize: '1rem', fontWeight: '700', color: '#374151' },
  list: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '0.75rem 1rem', gap: '0.5rem' },
  articleInfo: { flex: 1 },
  articleTitle: { fontWeight: '600', color: '#111', display: 'block', marginBottom: '0.3rem' },
  metaRow: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' },
  badge: { borderRadius: '999px', padding: '0.1rem 0.6rem', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.03em' },
  date: { fontSize: '0.8rem', color: '#6b7280' },
  catLabel: { fontSize: '0.8rem', color: '#4b5563', backgroundColor: '#f3f4f6', borderRadius: '4px', padding: '0.1rem 0.4rem' },
  actions: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
  btnSubmitReview: { padding: '0.3rem 0.75rem', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' },
  btnEdit: { padding: '0.3rem 0.75rem', backgroundColor: '#f59e0b', color: '#fff', borderRadius: '4px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600' },
  btnEditDisabled: { padding: '0.3rem 0.75rem', backgroundColor: '#e5e7eb', color: '#9ca3af', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '600', cursor: 'not-allowed' },
};
