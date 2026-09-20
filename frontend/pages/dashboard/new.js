import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getToken, logout } from '../../lib/auth';
import { get, authPost } from '../../lib/api';

export default function NewArticle() {
  const router = useRouter();
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
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ── Fetch categories for dropdown ──────────────────────────────────
  useEffect(() => {
    if (!ready) return;
    const load = async () => {
      const { data, ok } = await get('/api/categories');
      if (ok) setCategories(data);
    };
    load();
  }, [ready]);

  // ── Submit ─────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    // Convert comma-separated tags to trimmed array, filter empty strings
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

    const { data, ok } = await authPost('/api/articles', body);
    setSubmitting(false);

    if (!ok) {
      setError(data?.message || 'Failed to submit article');
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
            <h1 style={s.heading}>Write New Article</h1>
          </div>
          <button onClick={handleLogout} style={s.logoutBtn}>Logout</button>
        </header>

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
              placeholder="Article headline"
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
              placeholder="Write your article content here…"
            />
          </div>

          {error && <p style={s.error}>{error}</p>}

          <div style={s.formActions}>
            <a href="/dashboard" style={s.btnCancel}>Cancel</a>
            <button type="submit" disabled={submitting} style={s.btnSubmit}>
              {submitting ? 'Submitting…' : 'Submit Article'}
            </button>
          </div>
        </form>
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
  card: { backgroundColor: '#fff', borderRadius: '8px', padding: '1.75rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '1.1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  label: { fontSize: '0.875rem', fontWeight: '600', color: '#374151' },
  input: { padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.95rem' },
  textarea: { padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.95rem', resize: 'vertical', fontFamily: 'sans-serif', lineHeight: '1.6' },
  error: { color: '#dc2626', fontSize: '0.875rem', margin: 0 },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' },
  btnCancel: { padding: '0.5rem 1.1rem', backgroundColor: '#e5e7eb', color: '#374151', borderRadius: '4px', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' },
  btnSubmit: { padding: '0.5rem 1.4rem', backgroundColor: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' },
};
