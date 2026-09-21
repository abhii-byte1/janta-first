import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
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
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [newName, setNewName] = useState('');
  const [parentCategory, setParentCategory] = useState('');
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  // Editing state: { id, name }
  const [editing, setEditing] = useState(null);
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Top-level categories (parentCategory is null)
  const topLevelCategories = categories.filter((c) => !c.parentCategory);

  // ── Fetch categories ───────────────────────────────────────────────
  const fetchCategories = async () => {
    setListLoading(true);
    setListError('');
    const { data, ok } = await get('/api/categories');
    setListLoading(false);
    if (!ok) {
      setListError(data?.message || 'Failed to load categories');
      return;
    }
    setCategories(data);
  };

  useEffect(() => {
    if (ready) fetchCategories();
  }, [ready]);

  // ── Add category ───────────────────────────────────────────────────
  const handleAdd = async (e) => {
    e.preventDefault();
    setAddError('');

    if (!newName.trim()) {
      setAddError('Category name cannot be empty');
      return;
    }

    setAddLoading(true);
    const body = {
      name: newName.trim(),
      parentCategory: parentCategory || null,
    };
    const { data, ok } = await authPost('/api/categories', body);
    setAddLoading(false);
    if (!ok) {
      setAddError(data?.message || 'Failed to add category');
      return;
    }
    setNewName('');
    setParentCategory('');
    fetchCategories();
  };

  // ── Edit category ──────────────────────────────────────────────────
  const handleEditSave = async (id) => {
    setEditError('');

    if (!editing?.name?.trim()) {
      setEditError('Category name cannot be empty');
      return;
    }

    setEditLoading(true);
    const { data, ok } = await authPut(`/api/categories/${id}`, {
      name: editing.name.trim(),
      parentCategory: editing.parentCategory || null,
    });
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
            <Link href="/admin" style={s.backLink}>← Dashboard</Link>
            <h1 style={s.heading}>Categories & Sub-Categories</h1>
          </div>
          <button onClick={handleLogout} style={s.logoutBtn}>Logout</button>
        </header>

        {/* Add category form */}
        <section style={s.card}>
          <h2 style={s.sectionTitle}>Add New Category / District</h2>
          <form onSubmit={handleAdd} style={s.addForm}>
            <div style={s.formGrid}>
              <div style={s.formGroup}>
                <label style={s.label}>Category / District Name</label>
                <input
                  type="text"
                  placeholder="e.g. Chhattisgarh or Raipur"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  style={s.input}
                />
              </div>

              <div style={s.formGroup}>
                <label style={s.label}>Parent Category (leave blank for top-level)</label>
                <select
                  value={parentCategory}
                  onChange={(e) => setParentCategory(e.target.value)}
                  style={s.select}
                >
                  <option value="">-- None (Top-level Category) --</option>
                  {topLevelCategories.map((top) => (
                    <option key={top._id} value={top._id}>
                      📁 {top.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" disabled={addLoading} style={s.btnPrimary}>
              {addLoading ? 'Adding…' : '+ Add Category'}
            </button>
          </form>
          {addError && <p style={s.error}>{addError}</p>}
        </section>

        {/* Category list */}
        <section style={s.card}>
          <h2 style={s.sectionTitle}>All Categories ({categories.length})</h2>

          {listLoading && (
            <p style={s.empty}>Loading categories…</p>
          )}

          {listError && (
            <p style={s.error}>{listError}</p>
          )}

          {!listLoading && !listError && categories.length === 0 && (
            <p style={s.empty}>No categories yet. Add one above.</p>
          )}

          {!listLoading && (
            <div style={s.groupList}>
              {topLevelCategories.map((top) => {
                const subCategories = categories.filter(
                  (c) => (c.parentCategory?._id || c.parentCategory) === top._id
                );

                return (
                  <div key={top._id} style={s.categoryGroup}>
                    {/* Top-level Row */}
                    <div style={s.topItem}>
                      {editing?.id === top._id ? (
                        <div style={s.editRow}>
                          <input
                            type="text"
                            value={editing.name}
                            onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                            style={{ ...s.input, flex: 1 }}
                          />
                          <button
                            onClick={() => handleEditSave(top._id)}
                            disabled={editLoading}
                            style={s.btnSave}
                          >
                            {editLoading ? 'Saving…' : 'Save'}
                          </button>
                          <button onClick={() => setEditing(null)} style={s.btnCancel}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div style={s.displayRow}>
                          <div>
                            <span style={s.folderIcon}>📁</span>
                            <strong style={s.topName}>{top.name}</strong>
                            <span style={s.slug}> /{top.slug}</span>
                            {subCategories.length > 0 && (
                              <span style={s.subBadge}>
                                {subCategories.length} sub-categor{subCategories.length === 1 ? 'y' : 'ies'}
                              </span>
                            )}
                          </div>
                          <div style={s.actions}>
                            <button
                              onClick={() => setEditing({ id: top._id, name: top.name, parentCategory: '' })}
                              style={s.btnEdit}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(top._id, top.name)}
                              style={s.btnDelete}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Nested Sub-Categories */}
                    {subCategories.length > 0 && (
                      <div style={s.subList}>
                        {subCategories.map((sub) => (
                          <div key={sub._id} style={s.subItem}>
                            {editing?.id === sub._id ? (
                              <div style={s.editRow}>
                                <input
                                  type="text"
                                  value={editing.name}
                                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                                  style={{ ...s.input, flex: 1 }}
                                />
                                <button
                                  onClick={() => handleEditSave(sub._id)}
                                  disabled={editLoading}
                                  style={s.btnSave}
                                >
                                  {editLoading ? 'Saving…' : 'Save'}
                                </button>
                                <button onClick={() => setEditing(null)} style={s.btnCancel}>
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div style={s.displayRow}>
                                <div style={s.subTitleRow}>
                                  <span style={s.indentArrow}>↳</span>
                                  <span style={s.subPin}>📍</span>
                                  <span style={s.subName}>{sub.name}</span>
                                  <span style={s.slug}> /{sub.slug}</span>
                                </div>
                                <div style={s.actions}>
                                  <button
                                    onClick={() => setEditing({ id: sub._id, name: sub.name, parentCategory: top._id })}
                                    style={s.btnEdit}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(sub._id, sub.name)}
                                    style={s.btnDelete}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
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
  card: { backgroundColor: '#fff', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: '1.5rem' },
  sectionTitle: { margin: '0 0 1.25rem', fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' },
  addForm: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  label: { fontSize: '0.85rem', fontWeight: '600', color: '#374151' },
  input: { padding: '0.55rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.9rem', width: '100%' },
  select: { padding: '0.55rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.9rem', backgroundColor: '#ffffff', width: '100%' },
  btnPrimary: { alignSelf: 'flex-start', padding: '0.55rem 1.2rem', backgroundColor: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' },
  error: { color: '#dc2626', fontSize: '0.85rem', marginTop: '0.5rem' },
  empty: { color: '#6b7280', fontSize: '0.9rem', margin: 0 },
  groupList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  categoryGroup: { border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#ffffff' },
  topItem: { padding: '0.85rem 1rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
  displayRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' },
  folderIcon: { marginRight: '0.4rem', fontSize: '1.05rem' },
  topName: { fontSize: '1rem', color: '#0f172a' },
  subBadge: { marginLeft: '0.6rem', fontSize: '0.72rem', backgroundColor: '#dbeafe', color: '#1e40af', padding: '0.1rem 0.45rem', borderRadius: '4px', fontWeight: '600' },
  subList: { padding: '0.5rem 1rem 0.75rem 2.25rem', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  subItem: { padding: '0.45rem 0', borderBottom: '1px dashed #f1f5f9' },
  subTitleRow: { display: 'flex', alignItems: 'center', gap: '0.4rem' },
  indentArrow: { color: '#94a3b8', fontWeight: '700' },
  subPin: { fontSize: '0.85rem' },
  subName: { fontSize: '0.92rem', color: '#334155', fontWeight: '600' },
  editRow: { display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', width: '100%' },
  slug: { fontSize: '0.8rem', color: '#94a3b8' },
  actions: { display: 'flex', gap: '0.5rem' },
  btnEdit: { padding: '0.25rem 0.65rem', backgroundColor: '#f59e0b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' },
  btnDelete: { padding: '0.25rem 0.65rem', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' },
  btnSave: { padding: '0.25rem 0.65rem', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' },
  btnCancel: { padding: '0.25rem 0.65rem', backgroundColor: '#6b7280', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' },
};
