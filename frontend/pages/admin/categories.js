import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getToken, isAdmin, logout } from '../../lib/auth';
import { get, authPost, authPut, authDelete } from '../../lib/api';

export default function AdminCategories() {
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
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState('');
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  // Editing state: { id, name }
  const [editing, setEditing] = useState(null);
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // ── Fetch categories ───────────────────────────────────────────────
  const fetchCategories = async () => {
    const { data, ok } = await get('/api/categories');
    if (ok) setCategories(data);
  };

  useEffect(() => {
    if (ready) fetchCategories();
  }, [ready]);

  // ── Add category ───────────────────────────────────────────────────
  const handleAdd = async (e) => {
    e.preventDefault();
    setAddError('');
    setAddLoading(true);
    const { data, ok } = await authPost('/api/categories', { name: newName });
    setAddLoading(false);
    if (!ok) {
      setAddError(data?.message || 'Failed to add category');
      return;
    }
    setNewName('');
    fetchCategories();
  };

  // ── Edit category ──────────────────────────────────────────────────
  const handleEditSave = async (id) => {
    setEditError('');
    setEditLoading(true);
    const { data, ok } = await authPut(`/api/categories/${id}`, { name: editing.name });
    setEditLoading(false);
    if (!ok) {
      setEditError(data?.message || 'Failed to update category');
      return;
    }
    setEditing(null);
    fetchCategories();
  };

  // ── Delete category ────────────────────────────────────────────────
  const handleDelete = async (id, name) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    const { ok, data } = await authDelete(`/api/categories/${id}`);
    if (!ok) {
      alert(data?.message || 'Failed to delete category');
      return;
    }
    fetchCategories();
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
            <h1 style={s.heading}>Categories</h1>
          </div>
          <button onClick={handleLogout} style={s.logoutBtn}>Logout</button>
        </header>

        {/* Add category form */}
        <section style={s.card}>
          <h2 style={s.sectionTitle}>Add New Category</h2>
          <form onSubmit={handleAdd} style={s.addForm}>
            <input
              type="text"
              placeholder="Category name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              style={s.input}
            />
            <button type="submit" disabled={addLoading} style={s.btnPrimary}>
              {addLoading ? 'Adding…' : 'Add'}
            </button>
          </form>
          {addError && <p style={s.error}>{addError}</p>}
        </section>

        {/* Category list */}
        <section style={s.card}>
          <h2 style={s.sectionTitle}>All Categories ({categories.length})</h2>

          {categories.length === 0 && (
            <p style={s.empty}>No categories yet. Add one above.</p>
          )}

          <ul style={s.list}>
            {categories.map((cat) => (
              <li key={cat._id} style={s.listItem}>
                {editing?.id === cat._id ? (
                  // Inline edit row
                  <div style={s.editRow}>
                    <input
                      type="text"
                      value={editing.name}
                      onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                      style={{ ...s.input, flex: 1 }}
                    />
                    <button
                      onClick={() => handleEditSave(cat._id)}
                      disabled={editLoading}
                      style={s.btnSave}
                    >
                      {editLoading ? 'Saving…' : 'Save'}
                    </button>
                    <button onClick={() => setEditing(null)} style={s.btnCancel}>
                      Cancel
                    </button>
                    {editError && <span style={s.error}>{editError}</span>}
                  </div>
                ) : (
                  // Display row
                  <div style={s.displayRow}>
                    <div>
                      <strong>{cat.name}</strong>
                      <span style={s.slug}> /{cat.slug}</span>
                    </div>
                    <div style={s.actions}>
                      <button
                        onClick={() => setEditing({ id: cat._id, name: cat.name })}
                        style={s.btnEdit}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id, cat.name)}
                        style={s.btnDelete}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
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
  card: { backgroundColor: '#fff', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: '1.25rem' },
  sectionTitle: { margin: '0 0 1rem', fontSize: '1rem', fontWeight: '700', color: '#374151' },
  addForm: { display: 'flex', gap: '0.5rem' },
  input: { padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.95rem', width: '100%' },
  btnPrimary: { padding: '0.5rem 1.1rem', backgroundColor: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' },
  error: { color: '#dc2626', fontSize: '0.85rem', marginTop: '0.5rem' },
  empty: { color: '#6b7280', fontSize: '0.9rem', margin: 0 },
  list: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  listItem: { border: '1px solid #e5e7eb', borderRadius: '6px', padding: '0.75rem 1rem' },
  displayRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' },
  editRow: { display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' },
  slug: { fontSize: '0.8rem', color: '#9ca3af' },
  actions: { display: 'flex', gap: '0.5rem' },
  btnEdit: { padding: '0.3rem 0.75rem', backgroundColor: '#f59e0b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' },
  btnDelete: { padding: '0.3rem 0.75rem', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' },
  btnSave: { padding: '0.3rem 0.75rem', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' },
  btnCancel: { padding: '0.3rem 0.75rem', backgroundColor: '#6b7280', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' },
};
