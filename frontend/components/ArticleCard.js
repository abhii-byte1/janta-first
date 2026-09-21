import Link from 'next/link';

// Strips HTML tags and trims to a plain-text excerpt
function excerpt(text, maxLen = 110) {
  if (!text) return '';
  const plain = text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  return plain.length > maxLen ? plain.slice(0, maxLen).trimEnd() + '…' : plain;
}

export default function ArticleCard({ article }) {
  const { title, slug, content, category, publishedAt, coverImage } = article;

  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  return (
    <article className="news-card">
      {/* Cover image thumbnail */}
      {coverImage ? (
        <Link href={`/article/${slug}`} className="card-thumb-link">
          <img src={coverImage} alt={title} className="card-thumb" loading="lazy" />
        </Link>
      ) : (
        /* Fallback decorative header when no image exists */
        <Link href={`/article/${slug}`} style={s.fallbackHeader}>
          <span style={s.fallbackIcon}>📰</span>
          <span style={s.fallbackText}>{category?.name || 'समाचार'}</span>
        </Link>
      )}

      <div style={s.body}>
        {/* Category tag & Date */}
        <div style={s.metaTop}>
          {category?.name && (
            <Link href={`/category/${category.slug}`} style={s.categoryBadge}>
              {category.name}
            </Link>
          )}
          {formattedDate && <span style={s.date}>{formattedDate}</span>}
        </div>

        {/* Title */}
        <Link href={`/article/${slug}`} style={s.titleLink}>
          <h3 className="card-title" style={s.title}>{title}</h3>
        </Link>

        {/* Excerpt */}
        <p style={s.excerpt}>{excerpt(content)}</p>
      </div>
    </article>
  );
}

const s = {
  fallbackHeader: {
    backgroundColor: '#f1f5f9',
    height: '110px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.25rem',
    textDecoration: 'none',
    borderBottom: '1px solid #e2e8f0',
  },
  fallbackIcon: {
    fontSize: '1.75rem',
  },
  fallbackText: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  body: {
    padding: '1.1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    flex: 1,
  },
  metaTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.4rem',
    marginBottom: '0.2rem',
  },
  categoryBadge: {
    fontSize: '0.72rem',
    fontWeight: '700',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '0.2rem 0.6rem',
    borderRadius: '4px',
    textDecoration: 'none',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    border: '1px solid #fecaca',
  },
  date: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: '500',
  },
  titleLink: {
    textDecoration: 'none',
  },
  title: {
    margin: '0.1rem 0 0.3rem',
    fontSize: '1.05rem',
    fontWeight: '700',
    lineHeight: '1.4',
    letterSpacing: '-0.01em',
  },
  excerpt: {
    margin: 0,
    fontSize: '0.875rem',
    color: '#475569',
    lineHeight: '1.6',
    flex: 1,
  },
};
