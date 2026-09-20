import Head from 'next/head';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ArticleCard from '../../components/ArticleCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Strip HTML tags for plain-text uses (meta description, excerpt)
function stripHtml(html = '') {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

export async function getServerSideProps({ params }) {
  const { slug } = params;

  try {
    const res = await fetch(`${API_URL}/api/articles/${slug}`);

    if (res.status === 404) return { notFound: true };
    if (!res.ok) return { notFound: true };

    const article = await res.json();

    // Fetch up to 4 related articles from the same category, exclude current
    let related = [];
    if (article.category?.slug) {
      const relRes = await fetch(
        `${API_URL}/api/articles?category=${article.category.slug}&limit=4`
      );
      if (relRes.ok) {
        const { articles } = await relRes.json();
        related = articles.filter((a) => a._id !== article._id).slice(0, 3);
      }
    }

    return { props: { article, related } };
  } catch {
    return { notFound: true };
  }
}

export default function ArticlePage({ article, related }) {
  const {
    title,
    content,
    category,
    publishedAt,
    tags = [],
    coverImage,
  } = article;

  const plainContent = stripHtml(content);
  const metaDescription = plainContent.slice(0, 150).trimEnd() + (plainContent.length > 150 ? '…' : '');

  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <>
      <Head>
        <title>{title} — Om Darpan</title>
        <meta name="description" content={metaDescription} />
        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={metaDescription} />
        {coverImage && <meta property="og:image" content={coverImage} />}
      </Head>

      <div style={s.page}>
        <Header />

        <main style={s.main}>
          <div style={s.container}>

            {/* Breadcrumb */}
            <p style={s.breadcrumb}>
              <Link href="/" style={s.breadcrumbLink}>Home</Link>
              {category && (
                <>
                  {' / '}
                  <Link href={`/category/${category.slug}`} style={s.breadcrumbLink}>
                    {category.name}
                  </Link>
                </>
              )}
            </p>

            <article>
              {/* Cover image */}
              {coverImage && (
                <img
                  src={coverImage}
                  alt={title}
                  style={s.coverImage}
                />
              )}

              {/* Title */}
              <h1 style={s.title}>{title}</h1>

              {/* Meta row */}
              <div style={s.metaRow}>
                {category && (
                  <Link href={`/category/${category.slug}`} style={s.categoryBadge}>
                    {category.name}
                  </Link>
                )}
                {formattedDate && <span style={s.date}>{formattedDate}</span>}
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div style={s.tags}>
                  {tags.map((tag) => (
                    <span key={tag} style={s.tag}>{tag}</span>
                  ))}
                </div>
              )}

              <hr style={s.divider} />

              {/* Full content — stored as HTML */}
              <div
                style={s.content}
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </article>

            {/* Related articles */}
            {related.length > 0 && (
              <section style={s.relatedSection}>
                <h2 style={s.relatedHeading}>Related Articles</h2>
                <div style={s.relatedGrid}>
                  {related.map((a) => (
                    <ArticleCard key={a._id} article={a} />
                  ))}
                </div>
              </section>
            )}

          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

const s = {
  page: { display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f8fafc' },
  main: { flex: 1, padding: '2rem 1rem' },
  container: { maxWidth: '780px', margin: '0 auto' },
  breadcrumb: { fontSize: '0.85rem', color: '#6b7280', marginBottom: '1.25rem' },
  breadcrumbLink: { color: '#1d4ed8', textDecoration: 'none' },
  coverImage: { width: '100%', maxHeight: '420px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1.5rem', display: 'block' },
  title: { margin: '0 0 0.75rem', fontSize: '2rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.25' },
  metaRow: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' },
  categoryBadge: { fontSize: '0.8rem', fontWeight: '700', backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '0.2rem 0.7rem', borderRadius: '999px', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.04em' },
  date: { fontSize: '0.85rem', color: '#6b7280' },
  tags: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' },
  tag: { fontSize: '0.75rem', backgroundColor: '#e0e7ff', color: '#3730a3', borderRadius: '999px', padding: '0.15rem 0.6rem' },
  divider: { border: 'none', borderTop: '1px solid #e2e8f0', margin: '1.25rem 0' },
  content: { fontSize: '1.05rem', lineHeight: '1.85', color: '#1e293b' },
  relatedSection: { marginTop: '3rem', paddingTop: '2rem', borderTop: '2px solid #e2e8f0' },
  relatedHeading: { margin: '0 0 1rem', fontSize: '1.15rem', fontWeight: '700', color: '#111' },
  relatedGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' },
};
