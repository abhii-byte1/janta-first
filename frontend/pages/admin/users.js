import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getToken, isAdmin, getTokenPayload, logout } from '../../lib/auth';
import { authGet, authPut, authDelete } from '../../lib/api';

const ROLE_BADGE = {
  admin: { backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' },
  reporter: { backgroundColor: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe' },
};

export default function AdminUsers() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // ── Auth guard (admin only) ────────────────────────────────────────
  useEffect(() => {
    if (!getToken() || !isAdmin()) {
      router.replace('/admin/login');
    } else {
      const payload = getTokenPayload();
      setCurrentUserId(payload?.userId || null);
      setReady(true);
    }
  }, [router]);

  // ── Fetch users ────────────────────────────────────────────────────
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    const { data, ok } = await authGet('/api/users');
    setLoading(false);
    if (!ok) {
      setError(data?.message || 'Failed to load users');
      return;
    }
    setUsers(data);
  };

  useEffect(() => {
    if (ready) fetchUsers();
  }, [ready]);

  // ── Change user role ───────────────────────────────────────────────
  const handleRoleChange = async (user, newRole) => {
    if (user._id === currentUserId) {
      alert('You cannot change your own role.');
      return;
    }

    if (!confirm(`Change role of "${user.name || user.email}" to "${newRole}"?`)) {
      return;
    }

    setActionLoadingId(user._id);
    setError('');

    const { data, ok } = await authPut(`/api/users/${user._id}/role`, { role: newRole });
    setActionLoadingId(null);

    if (!ok) {
      alert(data?.message || 'Failed to update user role');
      return;
    }

    fetchUsers();
  };

  // ── Delete user ────────────────────────────────────────────────────
  const handleDelete = async (user) => {
    if (user._id === currentUserId) {
      alert('You cannot delete your own account.');
      return;
    }

    if (!confirm(`Are you sure you want to delete user "${user.name || user.email}"?`)) {
      return;
    }

    setActionLoadingId(user._id);
    setError('');

    const { data, ok } = await authDelete(`/api/users/${user._id}`);
    setActionLoadingId(null);

    if (!ok) {
      alert(data?.message || 'Failed to delete user');
      return;
    }

    fetchUsers();
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
            <h1 style={s.heading}>User Management</h1>
          </div>
          <button onClick={handleLogout} style={s.logoutBtn}>Logout</button>
        </header>

        {error && <div style={s.errorBox}><p style={s.error}>{error}</p></div>}

        <section style={s.card}>
          <div style={s.cardHeader}>
            <h2 style={s.sectionTitle}>All Users ({users.length})</h2>
            <button onClick={fetchUsers} disabled={loading} style={s.refreshBtn}>
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>

          {loading && users.length === 0 && (
            <p style={s.empty}>Loading users…</p>
          )}

          {!loading && users.length === 0 && (
            <p style={s.empty}>No users found.</p>
          )}

          {users.length > 0 && (
            <div style={s.tableResponsive}>
              <table style={s.table}>
                <thead>
                  <tr style={s.tableHeadRow}>
                    <th style={s.th}>User</th>
                    <th style={s.th}>Email</th>
                    <th style={s.th}>Role</th>
                    <th style={s.th}>Joined</th>
                    <th style={{ ...s.th, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isSelf = u._id === currentUserId;
                    const isPendingAction = actionLoadingId === u._id;

                    return (
                      <tr key={u._id} style={s.tr}>
                        <td style={s.td}>
                          <div style={s.userName}>
                            <strong>{u.name || 'Unnamed'}</strong>
                            {isSelf && <span style={s.selfBadge}>You</span>}
                          </div>
                        </td>
                        <td style={s.td}>{u.email}</td>
                        <td style={s.td}>
                          <span style={{ ...s.badge, ...(ROLE_BADGE[u.role] || {}) }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={s.td}>
                          <span style={s.date}>
                            {u.createdAt
                              ? new Date(u.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '—'}
                          </span>
                        </td>
                        <td style={{ ...s.td, textAlign: 'right' }}>
                          <div style={s.actions}>
                            {/* Role change control */}
                            <select
                              value={u.role}
                              disabled={isSelf || isPendingAction}
                              onChange={(e) => handleRoleChange(u, e.target.value)}
                              style={{
                                ...s.roleSelect,
                                ...(isSelf ? s.disabledInput : {}),
                              }}
                              title={isSelf ? 'You cannot change your own role' : 'Change role'}
                            >
                              <option value="reporter">reporter</option>
                              <option value="admin">admin</option>
                            </select>

                            {/* Delete button */}
                            <button
                              onClick={() => handleDelete(u)}
                              disabled={isSelf || isPendingAction}
                              style={{
                                ...s.btnDelete,
                                ...(isSelf ? s.btnDeleteDisabled : {}),
                              }}
                              title={isSelf ? 'You cannot delete your own account' : 'Delete user'}
                            >
                              {isPendingAction ? '…' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' },
  container: { maxWidth: '960px', margin: '0 auto', padding: '2rem 1rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' },
  breadcrumb: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  backLink: { fontSize: '0.875rem', color: '#1d4ed8', textDecoration: 'none' },
  heading: { margin: 0, fontSize: '1.5rem', color: '#111' },
  logoutBtn: { padding: '0.5rem 1rem', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem' },
  card: { backgroundColor: '#fff', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  sectionTitle: { margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#374151' },
  refreshBtn: { padding: '0.35rem 0.8rem', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', color: '#374151' },
  empty: { color: '#6b7280', fontSize: '0.9rem', margin: 0, padding: '1rem 0', textAlign: 'center' },
  errorBox: { backgroundColor: '#fee2e2', borderRadius: '6px', padding: '0.75rem 1rem', marginBottom: '1rem', border: '1px solid #fecaca' },
  error: { color: '#dc2626', fontSize: '0.875rem', margin: 0 },
  tableResponsive: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' },
  tableHeadRow: { borderBottom: '2px solid #e5e7eb' },
  th: { padding: '0.65rem 0.75rem', fontWeight: '700', color: '#4b5563', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' },
  tr: { borderBottom: '1px solid #f3f4f6' },
  td: { padding: '0.75rem', verticalAlign: 'middle' },
  userName: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  selfBadge: { fontSize: '0.7rem', fontWeight: '700', backgroundColor: '#e5e7eb', color: '#374151', padding: '0.1rem 0.4rem', borderRadius: '999px' },
  badge: { fontSize: '0.75rem', fontWeight: '700', padding: '0.15rem 0.55rem', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'inline-block' },
  date: { fontSize: '0.8rem', color: '#6b7280' },
  actions: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem' },
  roleSelect: { padding: '0.3rem 0.5rem', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '0.85rem', backgroundColor: '#fff', cursor: 'pointer' },
  disabledInput: { backgroundColor: '#f3f4f6', color: '#9ca3af', cursor: 'not-allowed', borderColor: '#e5e7eb' },
  btnDelete: { padding: '0.35rem 0.75rem', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' },
  btnDeleteDisabled: { backgroundColor: '#e5e7eb', color: '#9ca3af', cursor: 'not-allowed' },
};
