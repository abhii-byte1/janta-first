import Link from 'next/link';

export default function Header() {
  return (
    <header style={s.header}>
      <div style={s.inner}>
        <Link href="/" style={s.logo}>
          Om Darpan
        </Link>
        <nav style={s.nav}>
          <Link href="/" style={s.navLink}>Home</Link>
          <Link href="/dashboard/login" style={s.loginLink}>Login</Link>
        </nav>
      </div>
    </header>
  );
}

const s = {
  header: {
    backgroundColor: '#1d4ed8',
    color: '#fff',
    padding: '0 1rem',
  },
  inner: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '56px',
  },
  logo: {
    fontSize: '1.35rem',
    fontWeight: '800',
    color: '#fff',
    textDecoration: 'none',
    letterSpacing: '-0.01em',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
  },
  navLink: {
    color: '#bfdbfe',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: '500',
  },
  loginLink: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: '0.35rem 0.85rem',
    borderRadius: '4px',
  },
};
