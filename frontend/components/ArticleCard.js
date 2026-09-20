import Link from 'next/link';

// Strips HTML tags and trims to a plain-text excerpt
function excerpt(text, maxLen = 100) {
  if (!text) return '';
  const plain = text.replace(/<[^>]+>/g, '');
  return plain.length > maxLen ? plain.slice(0, maxLen).trimEnd() + '…' : plain;
}

export default function ArticleCard({ article }) {
  const { title, slug, content, category, publishedAt } = article;

  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  return (
    <article style={s.card}>
      <Link href={`/article/${slug}`} style={s.titleLink}>
        <h3 style={s.title}>{title}</h3>
      </Link>
      <p style={s.excerpt}>{excerpt(content)}</p>
      <div style={s.meta}>
        {category?.name && (
          <Link href={`/category/${category.slug}`} style={s.categoryBadge}>
            {category.name}
          </Link>
        )}
        {formattedDate && <span style={s.date}>{formattedDate}</span>}
      </div>
    </article>
  );
}

const s = {
  card: {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '1.1rem 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.45rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  titleLink: {
    textDecoration: 'none',
    color: 'inherit',
  },
  title: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: '700',
    color: '#111',
    lineHeight: '1.4',
  },
  excerpt: {
    margin: 0,
    fontSize: '0.875rem',
    color: '#4b5563',
    lineHeight: '1.55',
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    marginTop: '0.25rem',
  },
  categoryBadge: {
    fontSize: '0.75rem',
    fontWeight: '600',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    padding: '0.15rem 0.55rem',
    borderRadius: '999px',
    textDecoration: 'none',
  },
  date: {
    fontSize: '0.75rem',
    color: '#9ca3af',
  },
};
