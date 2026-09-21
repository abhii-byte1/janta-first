import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getToken, isAdmin, logout } from '../../lib/auth';
import { authGet, authPut, authDelete } from '../../lib/api';

const STATUS_BADGES = {
  new: { backgroundColor: '#dbeafe', color: '#1e40af', label: 'NEW' },
  reviewed: { backgroundColor: '#fef3c7', color: '#92400e', label: 'REVIEWED' },
  contacted: { backgroundColor: '#dcfce7', color: '#166534', label: 'CONTACTED' },
};

export default function AdminReporterApplications() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  // ── Auth guard ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!getToken() || !isAdmin()) {
      router.replace('/admin/login');
    } else {
      setReady(true);
    }
  }, [router]);

  // ── State ──────────────────────────────────────────────────────────
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  // ── Fetch applications ──────────────────────────────────────────────
  const fetchApplications = async () => {
    setLoading(true);
    setFetchError('');
    const { data, ok } = await authGet('/api/reporter-applications');
    setLoading(false);
    if (!ok) {
      setFetchError(data?.message || 'Failed to load applications');
      return;
    }
    setApplications(data);
  };

  useEffect(() => {
    if (ready) fetchApplications();
  }, [ready]);

  // ── Update status ──────────────────────────────────────────────────
  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    const { ok, data } = await authPut(`/api/reporter-applications/${id}/status`, {
      status: newStatus,
    });
    setUpdatingId(null);

    if (!ok) {
      alert(data?.message || 'Failed to update status');
      return;
    }

    setApplications((prev) =>
      prev.map((app) => (app._id === id ? { ...app, status: newStatus } : app))
    );
  };

  // ── Delete application ──────────────────────────────────────────────
  const handleDelete = async (id, name) => {
    if (!confirm(`Delete application from "${name}"?`)) return;

    const { ok, data } = await authDelete(`/api/reporter-applications/${id}`);
    if (!ok) {
      alert(data?.message || 'Failed to delete application');
      return;
    }

    setApplications((prev) => prev.filter((app) => app._id !== id));
  };

  const handleLogout = () => {
    logout();
    router.replace('/admin/login');
  };

  if (!ready) return null;

  const filteredApps =
    statusFilter === 'all'
      ? applications
      : applications.filter((app) => app.status === statusFilter);

  return (
    <div style={s.page}>
      <div style={s.container}>
        {/* Header */}
        <header style={s.header}>
          <div style={s.breadcrumb}>
            <Link href="/admin" style={s.backLink}>← Dashboard</Link>
            <h1 style={s.heading}>Reporter Applications</h1>
          </div>
          <button onClick={handleLogout} style={s.logoutBtn}>Logout</button>
        </header>

        {/* Filter Controls */}
        <div style={s.filterBar}>
          <span style={s.filterLabel}>Filter by status:</span>
          <div style={s.filterButtons}>
            {['all', 'new', 'reviewed', 'contacted'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={statusFilter === st ? { ...s.btnFilter, ...s.btnFilterActive } : s.btnFilter}
              >
                {st === 'all' ? `All (${applications.length})` : `${st.toUpperCase()} (${applications.filter(a => a.status === st).length})`}
              </button>
            ))}
          </div>
        </div>

        {fetchError && <p style={s.error}>{fetchError}</p>}

        {loading && (
          <div style={s.card}>
            <p style={s.empty}>Loading reporter applications…</p>
          </div>
        )}

        {!loading && !fetchError && filteredApps.length === 0 && (
          <div style={s.card}>
            <p style={s.empty}>No applications found{statusFilter !== 'all' ? ` with status "${statusFilter}"` : ''}.</p>
          </div>
        )}

        {!loading && filteredApps.map((app) => {
          const badge = STATUS_BADGES[app.status] || STATUS_BADGES.new;

          return (
            <div key={app._id} style={s.appCard}>
              <div style={s.appMain}>
                <div style={s.nameRow}>
                  <strong style={s.appName}>{app.name}</strong>
                  <span style={{ ...s.statusBadge, ...badge }}>{badge.label}</span>
                  <span style={s.date}>
                    {new Date(app.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div style={s.metaGrid}>
                  <div style={s.metaItem}>
                    <span style={s.metaKey}>📧 Email:</span>
                    <a href={`mailto:${app.email}`} style={s.linkText}>{app.email}</a>
                  </div>
                  <div style={s.metaItem}>
                    <span style={s.metaKey}>📞 Phone:</span>
                    <a href={`tel:${app.phone}`} style={s.linkText}>{app.phone}</a>
                  </div>
                  <div style={s.metaItem}>
                    <span style={s.metaKey}>📍 City/District:</span>
                    <span style={s.metaVal}>{app.city}</span>
                  </div>
                </div>

                {app.message && (
                  <div style={s.messageBox}>
                    <span style={s.messageLabel}>Message / Experience:</span>
                    <p style={s.messageText}>{app.message}</p>
                  </div>
                )}
              </div>

              {/* Status Selector & Actions */}
              <div style={s.appActions}>
                <label style={s.actionLabel}>Status:</label>
                <select
                  value={app.status}
                  disabled={updatingId === app._id}
                  onChange={(e) => handleStatusChange(app._id, e.target.value)}
                  style={s.selectStatus}
                >
                  <option value="new">New</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="contacted">Contacted</option>
                </select>

                <button
                  onClick={() => handleDelete(app._id, app.name)}
                  style={s.btnDelete}
                  title="Delete Application"
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' },
  container: { maxWidth: '860px', margin: '0 auto', padding: '2rem 1rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' },
  breadcrumb: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  backLink: { fontSize: '0.875rem', color: '#1d4ed8', textDecoration: 'none' },
  heading: { margin: 0, fontSize: '1.5rem', color: '#111' },
  logoutBtn: { padding: '0.5rem 1rem', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem' },
  filterBar: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  filterLabel: { fontSize: '0.85rem', color: '#475569', fontWeight: '600' },
  filterButtons: { display: 'flex', gap: '0.4rem', flexWrap: 'wrap' },
  btnFilter: { padding: '0.35rem 0.75rem', backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '600', color: '#475569', cursor: 'pointer' },
  btnFilterActive: { backgroundColor: '#1d4ed8', color: '#ffffff', borderColor: '#1d4ed8' },
  error: { color: '#dc2626', fontSize: '0.9rem', marginBottom: '1rem' },
  card: { backgroundColor: '#fff', borderRadius: '8px', padding: '2rem', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  empty: { color: '#6b7280', margin: 0 },
  appCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '1.25rem 1.5rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    marginBottom: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1.5rem',
    flexWrap: 'wrap',
    border: '1px solid #e5e7eb',
  },
  appMain: { flex: 1, minWidth: '260px' },
  nameRow: { display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.65rem' },
  appName: { fontSize: '1.1rem', color: '#0f172a' },
  statusBadge: { fontSize: '0.7rem', fontWeight: '800', borderRadius: '4px', padding: '0.15rem 0.5rem', letterSpacing: '0.04em' },
  date: { fontSize: '0.8rem', color: '#94a3b8' },
  metaGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem', marginBottom: '0.75rem' },
  metaItem: { fontSize: '0.85rem', display: 'flex', gap: '0.35rem', alignItems: 'center' },
  metaKey: { color: '#64748b' },
  metaVal: { color: '#1e293b', fontWeight: '600' },
  linkText: { color: '#1d4ed8', fontWeight: '600', textDecoration: 'none' },
  messageBox: { marginTop: '0.75rem', backgroundColor: '#f8fafc', borderLeft: '3px solid #cbd5e1', padding: '0.6rem 0.85rem', borderRadius: '0 4px 4px 0' },
  messageLabel: { display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginBottom: '0.2rem' },
  messageText: { margin: 0, fontSize: '0.86rem', color: '#334155', lineHeight: '1.4' },
  appActions: { display: 'flex', flexDirection: 'column', gap: '0.6rem', minWidth: '130px', alignItems: 'flex-start' },
  actionLabel: { fontSize: '0.78rem', color: '#64748b', fontWeight: '600' },
  selectStatus: { width: '100%', padding: '0.45rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.85rem', backgroundColor: '#fff', fontWeight: '600', cursor: 'pointer' },
  btnDelete: { width: '100%', padding: '0.4rem 0.6rem', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' },
};
