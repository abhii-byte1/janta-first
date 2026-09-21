import Head from 'next/head';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ArticleCard from '../../components/ArticleCard';
import Link from 'next/link';
import { useLanguage } from '../../lib/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const PAGE_LIMIT = 10;

export async function getServerSideProps({ params, query }) {
  const { slug } = params;
  const page = parseInt(query.page) || 1;

  try {
    const artRes = await fetch(
      `${API_URL}/api/articles?category=${slug}&page=${page}&limit=${PAGE_LIMIT}`
    );

    if (!artRes.ok) {
      return { props: { slug, categoryName: slug.replace(/-/g, ' '), articles: [], total: 0, page, hasError: true } };
    }

    const { articles, total } = await artRes.json();

    const categoryName =
      articles[0]?.category?.name ||
      slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    return { props: { slug, categoryName, articles, total, page, hasError: false } };
  } catch {
    return { props: { slug, categoryName: slug.replace(/-/g, ' '), articles: [], total: 0, page, hasError: true } };
  }
}

export default function CategoryPage({ slug, categoryName, articles, total, page, hasError }) {
  const { t } = useLanguage();
  const totalPages = Math.ceil(total / PAGE_LIMIT);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <>
      <Head>
        <title>{`${categoryName} — Janta First`}</title>
      </Head>

      <div style={s.page}>
        <Header />

      <main style={s.main}>
        <div className="site-container">
          {/* Breadcrumb */}
          <nav style={s.breadcrumb} aria-label="Breadcrumb">
            <Link href="/" style={s.breadcrumbLink}>{t('breadcrumb_home')}</Link>
            <span style={s.breadcrumbSeparator}>›</span>
            <span style={s.breadcrumbCurrent}>{categoryName}</span>
          </nav>

          {/* Category Heading & Count */}
          <div style={s.headingRow}>
            <div style={s.titleGroup}>
              <span style={s.titleAccent} />
              <h1 style={s.heading}>{categoryName}</h1>
            </div>
            <span style={s.countBadge}>
              {total} {t('articles_count_label')}
            </span>
          </div>

          {hasError ? (
            <div className="empty-state-box">
              <span style={s.stateIcon}>⚠️</span>
              <p style={{ color: '#dc2626', fontWeight: '600' }}>
                {t('category_error_text')}
              </p>
              <Link href="/" className="btn-primary" style={s.homeLink}>{t('back_to_home')}</Link>
            </div>
          ) : articles.length === 0 ? (
            <div className="empty-state-box">
              <span style={s.stateIcon}>📂</span>
              <p style={s.emptyText}>{t('category_empty_text')}</p>
              <Link href="/" className="btn-primary" style={s.homeLink}>{t('back_to_home')}</Link>
            </div>
          ) : (
            <>
              <div className="article-grid">
                {articles.map((article) => (
                  <ArticleCard key={article._id} article={article} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <nav style={s.pagination}>
                  {hasPrev ? (
                    <Link
                      href={`/category/${slug}?page=${page - 1}`}
                      className="btn-primary"
                      style={s.pageBtn}
                    >
                      {t('pagination_prev')}
                    </Link>
                  ) : (
                    <span style={s.pageBtnDisabled}>{t('pagination_prev')}</span>
                  )}

                  <span style={s.pageInfo}>
                    {t('page_label')} {page} {t('of_label')} {totalPages}
                  </span>

                  {hasNext ? (
                    <Link
                      href={`/category/${slug}?page=${page + 1}`}
                      className="btn-primary"
                      style={s.pageBtn}
                    >
                      {t('pagination_next')}
                    </Link>
                  ) : (
                    <span style={s.pageBtnDisabled}>{t('pagination_next')}</span>
                  )}
                </nav>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
    </>
  );
}

const s = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
  },
  main: {
    flex: 1,
    padding: '2.5rem 0 3.5rem',
  },
  breadcrumb: {
    fontSize: '0.85rem',
    color: '#64748b',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
  },
  breadcrumbLink: {
    color: '#b91c1c',
    textDecoration: 'none',
    fontWeight: '600',
  },
  breadcrumbSeparator: {
    color: '#94a3b8',
  },
  breadcrumbCurrent: {
    color: '#334155',
    fontWeight: '600',
  },
  headingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    borderBottom: '2px solid #e2e8f0',
    paddingBottom: '0.85rem',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
  },
  titleAccent: {
    width: '4px',
    height: '1.6rem',
    backgroundColor: '#b91c1c',
    borderRadius: '2px',
  },
  heading: {
    margin: 0,
    fontSize: '1.85rem',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '-0.02em',
  },
  countBadge: {
    fontSize: '0.82rem',
    fontWeight: '700',
    backgroundColor: '#e2e8f0',
    color: '#334155',
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
  },
  emptyState: {
    textAlign: 'center',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '4rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
  },
  stateIcon: {
    fontSize: '2.5rem',
  },
  emptyText: {
    fontSize: '1rem',
    color: '#64748b',
    margin: 0,
  },
  homeLink: {
    color: '#b91c1c',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '700',
    marginTop: '0.5rem',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '3rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid #e2e8f0',
  },
  pageBtn: {
    padding: '0.5rem 1.15rem',
    backgroundColor: '#b91c1c',
    color: '#ffffff',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: '700',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'background 0.15s ease',
  },
  pageBtnDisabled: {
    padding: '0.5rem 1.15rem',
    backgroundColor: '#f1f5f9',
    color: '#94a3b8',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'not-allowed',
  },
  pageInfo: {
    fontSize: '0.9rem',
    color: '#475569',
    fontWeight: '600',
  },
};
