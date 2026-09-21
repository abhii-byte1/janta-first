import { useEffect, useState } from 'react';
import Link from 'next/link';
import { get } from '../lib/api';
import { useLanguage } from '../lib/LanguageContext';

// TODO: Replace these placeholder URLs with your official social media URLs
const SOCIAL_LINKS = [
  {
    name: 'Facebook',
    label: 'Facebook',
    url: 'https://facebook.com/janta-first-placeholder',
    // Official brand accent color
    accent: '#1877F2',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: 'Twitter / X',
    label: 'X (Twitter)',
    url: 'https://x.com/janta-first-placeholder',
    accent: '#ffffff',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    label: 'Instagram',
    url: 'https://instagram.com/janta-first-placeholder',
    accent: '#E4405F',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    name: 'YouTube',
    label: 'YouTube',
    url: 'https://youtube.com/@janta-first-placeholder',
    accent: '#FF0000',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    name: 'WhatsApp',
    label: 'WhatsApp Channel',
    url: 'https://whatsapp.com/channel/janta-first-placeholder',
    accent: '#25D366',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
      </svg>
    ),
  },
];

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();
  const [visitCount, setVisitCount] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchVisits = async () => {
      const { data, ok } = await get('/api/visits');
      if (active && ok && typeof data?.count === 'number') {
        setVisitCount(data.count);
      }
    };
    fetchVisits();
    return () => { active = false; };
  }, []);

  return (
    <footer style={s.footer}>
      <div style={s.topStripe} />
      <div style={s.container}>
        <div style={s.grid}>
          {/* Col 1: Brand & Mission */}
          <div style={s.brandCol}>
            <div style={s.brandName}>
              <span style={s.brandAccent}>{t('logo_brand_1')}</span> {t('logo_brand_2')}
            </div>
            <p style={s.brandDesc}>
              {t('brand_desc')}
            </p>
            <p style={s.edition}>{t('edition_label')}</p>
          </div>

          {/* Col 2: Navigation */}
          <div style={s.navCol}>
            <h4 style={s.colHeading}>{t('quick_links_title')}</h4>
            <ul style={s.navList}>
              <li>
                <Link href="/" style={s.footerLink}>{t('footer_home')}</Link>
              </li>
              <li>
                <Link href="/search" style={s.footerLink}>{t('footer_search')}</Link>
              </li>
              <li>
                <Link href="/apply-reporter" style={s.footerLink}>{t('footer_apply_reporter')}</Link>
              </li>
              <li>
                <Link href="/our-team" style={s.footerLink}>{t('footer_our_team')}</Link>
              </li>
              <li>
                <Link href="/dashboard/login" style={s.footerLink}>{t('footer_reporter_login')}</Link>
              </li>
              <li>
                <Link href="/admin/login" style={s.footerLink}>{t('footer_admin_login')}</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Editorial Standards */}
          <div style={s.infoCol}>
            <h4 style={s.colHeading}>{t('editorial_title')}</h4>
            <p style={s.infoText}>
              {t('editorial_text')}
            </p>
          </div>

          {/* Col 4: Follow Us (Social Links) */}
          <div style={s.socialCol}>
            <h4 style={s.colHeading}>{t('follow_us_title')}</h4>
            <p style={s.socialHint}>{t('social_hint')}</p>
            <div style={s.socialList}>
              {SOCIAL_LINKS.map((item) => (
                <a
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={s.socialBtn}
                  title={`Follow Janta First on ${item.name}`}
                >
                  <span style={{ ...s.socialIcon, color: item.accent }}>
                    {item.icon}
                  </span>
                  <span style={s.socialLabel}>{item.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <hr style={s.divider} />

        <div style={s.bottomRow}>
          <p style={s.copyright}>
            © {year} Janta First. {t('copyright_rights')}
          </p>

          <div style={s.visitorBadge} title="Total recorded site visits">
            <span style={s.visitorIcon}>👁️</span>
            <span>{t('total_visitors')} <strong style={s.visitorCount}>{visitCount !== null ? visitCount.toLocaleString('en-IN') : '…'}</strong></span>
          </div>

          <div style={s.bottomLinks}>
            <Link href="/" style={s.subLink}>{t('footer_home')}</Link>
            <span style={s.dot}>•</span>
            <Link href="/search" style={s.subLink}>{t('footer_search')}</Link>
            <span style={s.dot}>•</span>
            <Link href="/dashboard/login" style={s.subLink}>Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

const s = {
  footer: {
    backgroundColor: '#0f172a',
    color: '#94a3b8',
    marginTop: 'auto',
    borderTop: '1px solid #1e293b',
    fontFamily: 'inherit',
  },
  topStripe: {
    height: '4px',
    background: 'linear-gradient(90deg, #b91c1c 0%, #f59e0b 50%, #b91c1c 100%)',
  },
  container: {
    maxWidth: '1140px',
    margin: '0 auto',
    padding: '3rem 1rem 2rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '2rem',
    marginBottom: '2rem',
  },
  brandCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  brandName: {
    fontSize: '1.5rem',
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: '-0.01em',
  },
  brandAccent: {
    color: '#f87171',
  },
  brandDesc: {
    fontSize: '0.875rem',
    lineHeight: '1.65',
    color: '#cbd5e1',
    margin: 0,
  },
  edition: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#f59e0b',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  navCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  colHeading: {
    color: '#ffffff',
    fontSize: '0.95rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    borderBottom: '2px solid #b91c1c',
    paddingBottom: '0.35rem',
    display: 'inline-block',
  },
  navList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.55rem',
  },
  footerLink: {
    color: '#94a3b8',
    fontSize: '0.875rem',
    textDecoration: 'none',
    transition: 'color 0.15s ease',
  },
  infoCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  infoText: {
    fontSize: '0.85rem',
    lineHeight: '1.65',
    color: '#94a3b8',
    margin: 0,
  },
  socialCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  socialHint: {
    fontSize: '0.82rem',
    color: '#94a3b8',
    margin: 0,
  },
  socialList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  socialBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    padding: '0.4rem 0.65rem',
    backgroundColor: '#1e293b',
    borderRadius: '6px',
    color: '#cbd5e1',
    textDecoration: 'none',
    fontSize: '0.82rem',
    fontWeight: '600',
    border: '1px solid #334155',
    transition: 'background 0.15s ease, border-color 0.15s ease',
  },
  socialIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialLabel: {
    color: '#e2e8f0',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #1e293b',
    margin: '1.5rem 0',
  },
  bottomRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    fontSize: '0.8rem',
    color: '#64748b',
  },
  copyright: {
    margin: 0,
  },
  bottomLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
  },
  subLink: {
    color: '#94a3b8',
    textDecoration: 'none',
  },
  dot: {
    color: '#475569',
  },
  visitorBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '999px',
    padding: '0.25rem 0.75rem',
    color: '#cbd5e1',
    fontSize: '0.78rem',
  },
  visitorIcon: {
    fontSize: '0.85rem',
  },
  visitorCount: {
    color: '#f59e0b',
    fontWeight: '700',
    marginLeft: '0.2rem',
  },
};
