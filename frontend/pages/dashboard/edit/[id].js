import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getToken, logout } from '../../../lib/auth';
import { get, authGet, authPut } from '../../../lib/api';

const EDITABLE_STATUSES = ['draft', 'pending'];

export default function EditArticle() {
  const router = useRouter();
  const { id } = router.query;
  const [ready, setReady] = useState(false);

  // ── Auth guard: any logged-in user ─────────────────────────────────
  useEffect(() => {
    if (!getToken()) {
      router.replace('/dashboard/login');
    } else {
      setReady(true);
    }
  }, [router]);

  // ── Form state ─────────────────────────────────────────────────────
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [categories, setCategories] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // ── Load article + categories once ready and id is available ───────
  useEffect(() => {
    if (!ready || !id) return;

    const load = async () => {
      setLoading(true);

      // Fetch categories (public) and user's articles in parallel
      const [catRes, myRes] = await Promise.all([
        get('/api/categories'),
        authGet('/api/articles/my'),
      ]);

      if (catRes.ok) setCategories(catRes.data);

      if (!myRes.ok) {
        setLoadError(myRes.data?.message || 'Failed to load articles');
        setLoading(false);
        return;
      }

      // Find the article by id client-side (no separate owner-by-id route exists)
      const article = myRes.data.find((a) => a._id === id);

      if (!article) {
        setLoadError('Article not found, or you do not have permission to edit it.');
        setLoading(false);
        return;
      }

      if (!EDITABLE_STATUSES.includes(article.status)) {
        setLoadError(
          `This article cannot be edited because its status is "${article.status}". Only draft or pending articles can be edited.`
        );
        setLoading(false);
        return;
      }

      // Pre-fill form
      setTitle(article.title);
      setContent(article.content);
      setCategoryId(article.category?._id || article.category || '');
      setTagsInput((article.tags || []).join(', '));
      setLoading(false);
    };

    load();
  }, [ready, id]);

  // ── Submit ─────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const body = {
      title,
      content,
      tags,
      ...(categoryId && { category: categoryId }),
    };

    const { data, ok } = await authPut(`/api/articles/${id}`, body);
    setSubmitting(false);

    if (!ok) {
      setSubmitError(data?.message || 'Failed to update article');
      return;
    }

    router.push('/dashboard');
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
          <div style={s.breadcrumb}>
            <a href="/dashboard" style={s.backLink}>← My Dashboard</a>
            <h1 style={s.heading}>Edit Article</h1>
          </div>
          <button onClick={handleLogout} style={s.logoutBtn}>Logout</button>
        </header>

        {/* Loading / error states */}
        {loading && <div style={s.stateBox}><p style={s.stateText}>Loading article…</p></div>}

        {!loading && loadError && (
          <div style={s.errorBox}>
            <p style={s.error}>{loadError}</p>
            <a href="/dashboard" style={s.backLink}>← Back to Dashboard</a>
          </div>
        )}

        {/* Form — only shown when article loaded successfully */}
        {!loading && !loadError && (
          <form onSubmit={handleSubmit} style={s.card}>
            {/* Title */}
            <div style={s.field}>
              <label style={s.label}>Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={s.input}
              />
            </div>

            {/* Category */}
            <div style={s.field}>
              <label style={s.label}>Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                style={s.input}
              >
                <option value="">— None —</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div style={s.field}>
              <label style={s.label}>Tags</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                style={s.input}
                placeholder="politics, india, economy  (comma-separated)"
              />
            </div>

            {/* Content */}
            <div style={s.field}>
              <label style={s.label}>Content *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={14}
                style={s.textarea}
              />
            </div>

            {submitError && <p style={s.error}>{submitError}</p>}

            <div style={s.formActions}>
              <a href="/dashboard" style={s.btnCancel}>Cancel</a>
              <button type="submit" disabled={submitting} style={s.btnSubmit}>
                {submitting ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' },
  container: { maxWidth: '760px', margin: '0 auto', padding: '2rem 1rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' },
  breadcrumb: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  backLink: { fontSize: '0.875rem', color: '#1d4ed8', textDecoration: 'none' },
  heading: { margin: 0, fontSize: '1.5rem', color: '#111' },
  logoutBtn: { padding: '0.5rem 1rem', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem' },
  stateBox: { backgroundColor: '#fff', borderRadius: '8px', padding: '2rem', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  stateText: { color: '#6b7280', margin: 0 },
  errorBox: { backgroundColor: '#fff', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  error: { color: '#dc2626', fontSize: '0.875rem', margin: 0 },
  card: { backgroundColor: '#fff', borderRadius: '8px', padding: '1.75rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '1.1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  label: { fontSize: '0.875rem', fontWeight: '600', color: '#374151' },
  input: { padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.95rem' },
  textarea: { padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.95rem', resize: 'vertical', fontFamily: 'sans-serif', lineHeight: '1.6' },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' },
  btnCancel: { padding: '0.5rem 1.1rem', backgroundColor: '#e5e7eb', color: '#374151', borderRadius: '4px', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' },
  btnSubmit: { padding: '0.5rem 1.4rem', backgroundColor: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' },
};
