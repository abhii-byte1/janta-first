import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useLanguage } from '../lib/LanguageContext';

// TODO: Replace these placeholder URLs with your official social media URLs
const HEADER_SOCIAL = [
  {
    name: 'Facebook',
    url: 'https://facebook.com/janta-first-placeholder',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: 'X (Twitter)',
    url: 'https://x.com/janta-first-placeholder',
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    url: 'https://instagram.com/janta-first-placeholder',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    name: 'YouTube',
    url: 'https://youtube.com/@janta-first-placeholder',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    name: 'WhatsApp',
    url: 'https://whatsapp.com/channel/janta-first-placeholder',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
      </svg>
    ),
  },
];

export default function Header({ categories: initialCategories = null }) {
  const router = useRouter();
  const { language, toggleLanguage, t } = useLanguage();
  const [categories, setCategories] = useState(initialCategories || []);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const handleLiveScroll = (e) => {
    if (router.pathname === '/') {
      e.preventDefault();
      const el = document.getElementById('live-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', '#live-section');
      }
    }
  };

  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) {
      setCategories(initialCategories);
      return;
    }

    let isMounted = true;
    const loadCategories = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setCategories(data);
        }
      } catch {
        // Silently handle
      }
    };
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, [initialCategories]);

  const topCategories = categories.filter((c) => !c.parentCategory);
  const getSubCategories = (parentId) =>
    categories.filter((c) => (c.parentCategory?._id || c.parentCategory) === parentId);

  const currentDate = new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header style={s.headerContainer}>
      {/* Top Bar: Date, Tagline, Language Toggle & Social Links */}
      <div style={s.topBar}>
        <div style={s.topBarInner}>
          <span style={s.topDate} suppressHydrationWarning>📅 {currentDate}</span>

          <div style={s.topBarRight}>
            <span style={s.topTagline}>{t('top_tagline')}</span>

            {/* Language Toggle Button */}
            <button
              onClick={toggleLanguage}
              style={s.langToggleBtn}
              title={language === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
              aria-label="Toggle language"
            >
              🌐 {language === 'hi' ? 'English' : 'हिन्दी'}
            </button>

            <div style={s.socialIcons}>
              {HEADER_SOCIAL.map((item) => (
                <a
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={s.socialIconLink}
                  title={`Follow us on ${item.name}`}
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Nav Banner */}
      <div style={s.mainNav}>
        <div style={s.inner}>
          {/* Logo & Brand */}
          <Link href="/" style={s.logoWrapper}>
            <span style={s.logoAccent}>{t('logo_brand_1')}</span>
            <span style={s.logoText}>{t('logo_brand_2')}</span>
            <span style={s.logoSub}>{t('logo_sub')}</span>
          </Link>

          {/* Navigation Links */}
          <nav style={s.nav}>
            <Link href="/" style={s.navLink}>
              {t('nav_home')}
            </Link>

            {/* Top-level Categories with Flyout/Dropdown for Subcategories */}
            {topCategories.map((cat) => {
              const subs = getSubCategories(cat._id);
              const hasSubs = subs.length > 0;
              const isOpen = openDropdownId === cat._id;

              if (!hasSubs) {
                return (
                  <Link key={cat._id} href={`/category/${cat.slug}`} style={s.navLink}>
                    {cat.name}
                  </Link>
                );
              }

              return (
                <div
                  key={cat._id}
                  className="nav-dropdown-container"
                  onMouseEnter={() => setOpenDropdownId(cat._id)}
                  onMouseLeave={() => setOpenDropdownId(null)}
                >
                  <div
                    style={s.dropdownTrigger}
                    onClick={() => setOpenDropdownId(isOpen ? null : cat._id)}
                  >
                    <Link href={`/category/${cat.slug}`} style={s.navLinkWithChevron}>
                      <span>{cat.name}</span>
                      <span style={s.chevron}>{isOpen ? '▴' : '▾'}</span>
                    </Link>
                  </div>

                  <div className={`nav-dropdown-menu ${isOpen ? 'is-open' : ''}`}>
                    <div style={s.dropdownHeader}>
                      <Link
                        href={`/category/${cat.slug}`}
                        style={s.dropdownHeaderLink}
                        onClick={() => setOpenDropdownId(null)}
                      >
                        {language === 'hi' ? `सभी ${cat.name} ख़बरें →` : `All ${cat.name} News →`}
                      </Link>
                    </div>
                    <div style={s.dropdownGrid}>
                      {subs.map((sub) => (
                        <Link
                          key={sub._id}
                          href={`/category/${sub.slug}`}
                          style={s.dropdownItem}
                          onClick={() => setOpenDropdownId(null)}
                        >
                          📍 {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Live TV & Cricket Navigation Links (smooth scroll to #live-section) */}
            <Link
              href="/#live-section"
              onClick={handleLiveScroll}
              style={s.navLink}
            >
              {t('nav_live_tv')}
            </Link>
            <Link
              href="/#live-section"
              onClick={handleLiveScroll}
              style={s.navLink}
            >
              {t('nav_cricket')}
            </Link>

            <Link href="/epaper" style={s.navLink}>
              {t('nav_epaper')}
            </Link>
            <Link href="/search" style={s.navSearchLink} title="Search news">
              {t('nav_search')}
            </Link>
            <Link href="/dashboard/login" style={s.loginLink}>
              {t('nav_portal')}
            </Link>
          </nav>
        </div>
      </div>

      {/* Saffron/Gold Accent Stripe */}
      <div style={s.accentStripe} />
    </header>
  );
}

const s = {
  headerContainer: {
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  topBar: {
    backgroundColor: '#0f172a',
    color: '#cbd5e1',
    fontSize: '0.78rem',
    padding: '0.35rem 1rem',
    borderBottom: '1px solid #1e293b',
  },
  topBarInner: {
    maxWidth: '1140px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  topDate: {
    letterSpacing: '0.02em',
  },
  topBarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  topTagline: {
    fontWeight: '500',
    color: '#f8fafc',
    letterSpacing: '0.04em',
  },
  langToggleBtn: {
    backgroundColor: '#334155',
    color: '#fef08a',
    border: '1px solid #475569',
    borderRadius: '4px',
    padding: '0.2rem 0.55rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    transition: 'background 0.15s ease',
  },
  socialIcons: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
  },
  socialIconLink: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#94a3b8',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    width: '24px',
    height: '24px',
    borderRadius: '4px',
    textDecoration: 'none',
    transition: 'color 0.15s ease, background 0.15s ease',
  },
  mainNav: {
    backgroundColor: '#b91c1c',
    color: '#ffffff',
    padding: '0.75rem 1rem',
  },
  inner: {
    maxWidth: '1140px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  logoWrapper: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.35rem',
    textDecoration: 'none',
    color: '#ffffff',
  },
  logoAccent: {
    fontSize: 'clamp(1.35rem, 4vw, 1.6rem)',
    fontWeight: '900',
    color: '#fef08a', // warm yellow
    letterSpacing: '-0.02em',
  },
  logoText: {
    fontSize: 'clamp(1.35rem, 4vw, 1.6rem)',
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: '-0.01em',
  },
  logoSub: {
    fontSize: '0.7rem',
    fontWeight: '700',
    letterSpacing: '0.12em',
    color: '#fecaca',
    marginLeft: '0.35rem',
    textTransform: 'uppercase',
    borderLeft: '1px solid rgba(255, 255, 255, 0.3)',
    paddingLeft: '0.45rem',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem 0.75rem',
    flexWrap: 'wrap',
  },
  navLink: {
    color: '#fef2f2',
    fontSize: '0.9rem',
    fontWeight: '600',
    textDecoration: 'none',
    padding: '0.35rem 0.55rem',
    borderRadius: '4px',
    transition: 'background 0.15s ease',
  },
  navSearchLink: {
    color: '#fef2f2',
    fontSize: '0.88rem',
    fontWeight: '600',
    textDecoration: 'none',
    padding: '0.35rem 0.65rem',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: '4px',
    transition: 'background 0.15s ease',
  },
  loginLink: {
    color: '#991b1b',
    backgroundColor: '#ffffff',
    textDecoration: 'none',
    fontSize: '0.82rem',
    fontWeight: '700',
    padding: '0.4rem 0.85rem',
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.15)',
    transition: 'background 0.15s ease, transform 0.1s ease',
    whiteSpace: 'nowrap',
  },
  accentStripe: {
    height: '3px',
    background: 'linear-gradient(90deg, #f59e0b 0%, #ef4444 50%, #b91c1c 100%)',
  },
  dropdownContainer: {
    position: 'relative',
    display: 'inline-block',
  },
  dropdownTrigger: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  navLinkWithChevron: {
    color: '#fef2f2',
    fontSize: '0.92rem',
    fontWeight: '600',
    textDecoration: 'none',
    padding: '0.35rem 0.6rem',
    borderRadius: '4px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  chevron: {
    fontSize: '0.75rem',
    opacity: 0.9,
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    minWidth: '220px',
    maxWidth: '340px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.15)',
    border: '1px solid #e2e8f0',
    padding: '0.5rem',
    zIndex: 100,
    marginTop: '0.25rem',
  },
  dropdownHeader: {
    padding: '0.35rem 0.5rem 0.45rem',
    borderBottom: '1px solid #f1f5f9',
    marginBottom: '0.35rem',
  },
  dropdownHeaderLink: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#b91c1c',
    textDecoration: 'none',
    display: 'block',
  },
  dropdownGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
    gap: '0.25rem',
    maxHeight: '280px',
    overflowY: 'auto',
  },
  dropdownItem: {
    display: 'block',
    padding: '0.35rem 0.5rem',
    color: '#1e293b',
    fontSize: '0.84rem',
    fontWeight: '600',
    borderRadius: '4px',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    transition: 'background-color 0.12s, color 0.12s',
  },
};
