import Head from 'next/head';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ArticleCard from '../../components/ArticleCard';
import { useLanguage } from '../../lib/LanguageContext';

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
  const { language, t } = useLanguage();

  const {
    title,
    content,
    category,
    publishedAt,
    tags = [],
    coverImage,
    submittedBy,
  } = article;

  const plainContent = stripHtml(content);
  const metaDescription = plainContent.slice(0, 150).trimEnd() + (plainContent.length > 150 ? '…' : '');

  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <>
      <Head>
        <title>{`${title} — Janta First`}</title>
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
            <nav style={s.breadcrumb} aria-label="Breadcrumb">
              <Link href="/" style={s.breadcrumbLink}>{t('breadcrumb_home')}</Link>
              {category && (
                <>
                  <span style={s.breadcrumbSeparator}>›</span>
                  <Link href={`/category/${category.slug}`} style={s.breadcrumbLink}>
                    {category.name}
                  </Link>
                </>
              )}
            </nav>

            <article style={s.articlePaper}>
              {/* Category tag */}
              {category && (
                <div style={s.categoryWrapper}>
                  <Link href={`/category/${category.slug}`} style={s.categoryBadge}>
                    {category.name}
                  </Link>
                </div>
              )}

              {/* Title */}
              <h1 style={s.title}>{title}</h1>

              {/* Meta row: Reporter, Date */}
              <div style={s.metaRow}>
                <div style={s.metaLeft}>
                  {submittedBy?.name && (
                    <span style={s.author}>
                      ✍️ <strong>{submittedBy.name}</strong>
                    </span>
                  )}
                  {formattedDate && (
                    <span style={s.date}>
                      📅 {formattedDate}
                    </span>
                  )}
                </div>
              </div>

              {/* Cover image */}
              {coverImage && (
                <div style={s.coverImageWrapper}>
                  <img
                    src={coverImage}
                    alt={title}
                    style={s.coverImage}
                  />
                </div>
              )}

              {/* Article Content */}
              <div
                className="article-content"
                dangerouslySetInnerHTML={{ __html: content }}
              />

              {/* Tags */}
              {tags.length > 0 && (
                <div style={s.tagsSection}>
                  <span style={s.tagsLabel}>{t('article_tags_label')}</span>
                  <div style={s.tags}>
                    {tags.map((tag) => (
                      <span key={tag} style={s.tag}>#{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* Related articles */}
            {related.length > 0 && (
              <section style={s.relatedSection}>
                <div style={s.relatedHeader}>
                  <span style={s.relatedAccent} />
                  <h2 style={s.relatedHeading}>{t('related_articles_heading')}</h2>
                </div>
                <div className="article-grid-3">
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
  page: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
  },
  main: {
    flex: 1,
    padding: '2.5rem 1rem 3.5rem',
  },
  container: {
    maxWidth: '820px',
    margin: '0 auto',
  },
  breadcrumb: {
    fontSize: '0.85rem',
    color: '#64748b',
    marginBottom: '1.25rem',
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
  articlePaper: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '2rem 2.25rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  },
  categoryWrapper: {
    marginBottom: '0.75rem',
  },
  categoryBadge: {
    fontSize: '0.78rem',
    fontWeight: '700',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '0.25rem 0.75rem',
    borderRadius: '4px',
    textDecoration: 'none',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    border: '1px solid #fecaca',
    display: 'inline-block',
  },
  title: {
    margin: '0 0 1rem',
    fontSize: 'clamp(1.6rem, 4.5vw, 2.1rem)',
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: '1.3',
    letterSpacing: '-0.02em',
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #f1f5f9',
    borderBottom: '1px solid #f1f5f9',
    padding: '0.75rem 0',
    marginBottom: '1.75rem',
    flexWrap: 'wrap',
    gap: '0.75rem',
    fontSize: '0.875rem',
    color: '#64748b',
  },
  metaLeft: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1.25rem',
  },
  author: {
    color: '#1e293b',
  },
  date: {
    color: '#64748b',
  },
  coverImageWrapper: {
    marginBottom: '2rem',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
  },
  coverImage: {
    width: '100%',
    maxHeight: '440px',
    objectFit: 'cover',
    display: 'block',
  },
  tagsSection: {
    marginTop: '2.5rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  tagsLabel: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#475569',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  tag: {
    fontSize: '0.8rem',
    fontWeight: '600',
    backgroundColor: '#f1f5f9',
    color: '#334155',
    borderRadius: '999px',
    padding: '0.2rem 0.75rem',
    border: '1px solid #e2e8f0',
  },
  relatedSection: {
    marginTop: '3.5rem',
  },
  relatedHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    marginBottom: '1.25rem',
    borderBottom: '2px solid #e2e8f0',
    paddingBottom: '0.5rem',
  },
  relatedAccent: {
    width: '4px',
    height: '1.4rem',
    backgroundColor: '#b91c1c',
    borderRadius: '2px',
  },
  relatedHeading: {
    margin: 0,
    fontSize: '1.35rem',
    fontWeight: '800',
    color: '#0f172a',
  },
};
