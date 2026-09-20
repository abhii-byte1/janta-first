import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ArticleCard from '../../components/ArticleCard';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const PAGE_LIMIT = 10;

export async function getServerSideProps({ params, query }) {
  const { slug } = params;
  const page = parseInt(query.page) || 1;

  try {
    // Fetch articles filtered by category slug + paginated
    const artRes = await fetch(
      `${API_URL}/api/articles?category=${slug}&page=${page}&limit=${PAGE_LIMIT}`
    );

    if (!artRes.ok) {
      return { props: { slug, articles: [], total: 0, page } };
    }

    const { articles, total } = await artRes.json();

    // Derive category name from the first article's populated category field,
    // or fall back to a prettified version of the slug
    const categoryName =
      articles[0]?.category?.name ||
      slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    return { props: { slug, categoryName, articles, total, page } };
  } catch {
    return { props: { slug, categoryName: slug, articles: [], total: 0, page } };
  }
}

export default function CategoryPage({ slug, categoryName, articles, total, page }) {
  const totalPages = Math.ceil(total / PAGE_LIMIT);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div style={s.page}>
      <Header />

      <main style={s.main}>
        <div style={s.container}>

          {/* Breadcrumb */}
          <p style={s.breadcrumb}>
            <Link href="/" style={s.breadcrumbLink}>Home</Link>
            {' '}/{' '}
            <span style={s.breadcrumbCurrent}>{categoryName}</span>
          </p>

          <h1 style={s.heading}>{categoryName}</h1>
          <p style={s.count}>{total} article{total !== 1 ? 's' : ''}</p>

          {articles.length === 0 ? (
            <div style={s.emptyState}>
              <p>No published articles in this category yet.</p>
              <Link href="/" style={s.homeLink}>← Back to Home</Link>
            </div>
          ) : (
            <>
              <div style={s.grid}>
                {articles.map((article) => (
                  <ArticleCard key={article._id} article={article} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav style={s.pagination}>
                  {hasPrev ? (
                    <Link
                      href={`/category/${slug}?page=${page - 1}`}
                      style={s.pageBtn}
                    >
                      ← Previous
                    </Link>
                  ) : (
                    <span style={s.pageBtnDisabled}>← Previous</span>
                  )}

                  <span style={s.pageInfo}>
                    Page {page} of {totalPages}
                  </span>

                  {hasNext ? (
                    <Link
                      href={`/category/${slug}?page=${page + 1}`}
                      style={s.pageBtn}
                    >
                      Next →
                    </Link>
                  ) : (
                    <span style={s.pageBtnDisabled}>Next →</span>
                  )}
                </nav>
              )}
            </>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}

const s = {
  page: { display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f8fafc' },
  main: { flex: 1, padding: '2rem 1rem' },
  container: { maxWidth: '1100px', margin: '0 auto' },
  breadcrumb: { fontSize: '0.85rem', color: '#6b7280', margin: '0 0 0.75rem' },
  breadcrumbLink: { color: '#1d4ed8', textDecoration: 'none' },
  breadcrumbCurrent: { color: '#374151' },
  heading: { margin: '0 0 0.25rem', fontSize: '1.75rem', fontWeight: '800', color: '#111', borderBottom: '3px solid #1d4ed8', paddingBottom: '0.5rem', display: 'inline-block' },
  count: { margin: '0.4rem 0 1.5rem', fontSize: '0.875rem', color: '#6b7280' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  emptyState: { textAlign: 'center', color: '#6b7280', padding: '4rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' },
  homeLink: { color: '#1d4ed8', textDecoration: 'none', fontSize: '0.9rem' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.25rem', padding: '1rem 0' },
  pageBtn: { padding: '0.45rem 1rem', backgroundColor: '#1d4ed8', color: '#fff', borderRadius: '4px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '600' },
  pageBtnDisabled: { padding: '0.45rem 1rem', backgroundColor: '#e5e7eb', color: '#9ca3af', borderRadius: '4px', fontSize: '0.875rem', fontWeight: '600', cursor: 'not-allowed' },
  pageInfo: { fontSize: '0.875rem', color: '#374151' },
};
