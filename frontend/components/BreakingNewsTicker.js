import { useEffect, useState } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function BreakingNewsTicker({ articles: initialArticles }) {
  const [articles, setArticles] = useState(initialArticles || []);

  // Fetch latest articles if not passed via props
  useEffect(() => {
    if (initialArticles && initialArticles.length > 0) {
      setArticles(initialArticles);
      return;
    }

    const fetchLatest = async () => {
      try {
        const res = await fetch(`${API_URL}/api/articles?limit=8`);
        if (res.ok) {
          const data = await res.json();
          setArticles(data.articles || []);
        }
      } catch {
        // Silently fail if ticker cannot fetch
      }
    };

    fetchLatest();
  }, [initialArticles]);

  const tickerItems = (articles || []).slice(0, 8);

  if (!tickerItems || tickerItems.length === 0) {
    return null;
  }

  // Duplicate items for continuous seamless marquee looping
  const marqueeItems = [...tickerItems, ...tickerItems];

  return (
    <div style={s.tickerContainer} aria-label="Breaking News">
      <div style={s.inner}>
        {/* Left Badge: Fixed Label */}
        <div style={s.badge}>
          <span style={s.badgeIcon}>⚡</span>
          <span style={s.badgeText}>BREAKING</span>
        </div>

        {/* Scrolling Window */}
        <div style={s.scrollWindow}>
          <div className="ticker-track">
            {marqueeItems.map((article, idx) => (
              <Link
                key={`${article._id || article.slug}-${idx}`}
                href={`/article/${article.slug}`}
                className="ticker-item-link"
              >
                <span>{article.title}</span>
                <span style={s.separator}>•</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  tickerContainer: {
    backgroundColor: '#b91c1c',
    color: '#ffffff',
    borderBottom: '1px solid #991b1b',
    overflow: 'hidden',
    position: 'relative',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
  },
  inner: {
    maxWidth: '100%',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    height: '100%',
  },
  badge: {
    backgroundColor: '#7f1d1d',
    color: '#fef08a',
    fontSize: '0.78rem',
    fontWeight: '800',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    padding: '0 1rem',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    zIndex: 10,
    flexShrink: 0,
    boxShadow: '2px 0 6px rgba(0, 0, 0, 0.2)',
  },
  badgeIcon: {
    fontSize: '0.9rem',
  },
  badgeText: {
    color: '#ffffff',
  },
  scrollWindow: {
    flex: 1,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    height: '100%',
  },
  separator: {
    color: '#fecaca',
    fontSize: '1rem',
    opacity: 0.6,
  },
};
