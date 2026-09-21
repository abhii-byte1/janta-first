import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getToken, isAdmin, logout } from '../../lib/auth';

export default function AdminDashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Guard: redirect to login if no token or not admin
    if (!getToken() || !isAdmin()) {
      router.replace('/admin/login');
    } else {
      setReady(true);
    }
  }, [router]);

  const handleLogout = () => {
    logout();
    router.replace('/admin/login');
  };

  if (!ready) return null; // Prevent flash of protected content

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.heading}>Admin Dashboard</h1>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </header>

        <main>
          <p style={styles.welcome}>Welcome Admin</p>
          <p style={styles.hint}>Select a section to manage:</p>
          <div style={styles.navGrid}>
            <Link href="/admin/categories" style={styles.navCard}>
              <span style={styles.navIcon}>🗂️</span>
              <strong>Categories</strong>
              <span style={styles.navDesc}>Add, edit, or delete news categories</span>
            </Link>
            <Link href="/admin/pending" style={styles.navCard}>
              <span style={styles.navIcon}>📋</span>
              <strong>Pending Articles</strong>
              <span style={styles.navDesc}>Approve or reject submitted articles</span>
            </Link>
            <Link href="/admin/users" style={styles.navCard}>
              <span style={styles.navIcon}>👥</span>
              <strong>Users</strong>
              <span style={styles.navDesc}>Manage user roles and accounts</span>
            </Link>
            <Link href="/admin/epaper" style={styles.navCard}>
              <span style={styles.navIcon}>📰</span>
              <strong>E-Paper</strong>
              <span style={styles.navDesc}>Upload and manage daily newspaper PDFs</span>
            </Link>
            <Link href="/admin/reporter-applications" style={styles.navCard}>
              <span style={styles.navIcon}>📨</span>
              <strong>Applications</strong>
              <span style={styles.navDesc}>Review reporter joining applications</span>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    fontFamily: 'sans-serif',
  },
  container: {
    maxWidth: '960px',
    margin: '0 auto',
    padding: '2rem 1rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  heading: {
    margin: 0,
    fontSize: '1.75rem',
    color: '#111',
  },
  logoutBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#dc2626',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  main: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '2rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  welcome: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#111',
    margin: '0 0 0.5rem',
  },
  hint: {
    color: '#6b7280',
    margin: '0 0 1.5rem',
  },
  navGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
  },
  navCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    padding: '1.5rem',
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    textDecoration: 'none',
    color: '#111',
    transition: 'box-shadow 0.15s',
  },
  navIcon: {
    fontSize: '1.75rem',
  },
  navDesc: {
    fontSize: '0.8rem',
    color: '#6b7280',
    fontWeight: 'normal',
  },
};
