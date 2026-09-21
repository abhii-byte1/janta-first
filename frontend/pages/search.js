import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ArticleCard from '../components/ArticleCard';
import { useLanguage } from '../lib/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SearchPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [query, setQuery] = useState(router.query.q || '');
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(null); // null = not searched yet
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setError('');
    setResults([]);
    setTotal(null);

    router.replace(`/search?q=${encodeURIComponent(q)}`, undefined, { shallow: true });

    try {
      const res = await fetch(
        `${API_URL}/api/articles?search=${encodeURIComponent(q)}&limit=20`
      );
      if (!res.ok) throw new Error('Request failed');
      const { articles, total: tCount } = await res.json();
      setResults(articles);
      setTotal(tCount);
    } catch {
      setError(t('search_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>समाचार खोजें (Search News) — Janta First</title>
        <meta name="description" content="Search published news articles on Janta First." />
      </Head>

      <div style={s.page}>
        <Header />

        <main style={s.main}>
          <div className="site-container">
            {/* Search Header Card */}
            <div style={s.searchHero}>
              <div style={s.titleRow}>
                <span style={s.titleAccent} />
                <h1 style={s.heading}>{t('search_page_title')}</h1>
              </div>
              <p style={s.subheading}>{t('search_subheading')}</p>

              {/* Search form */}
              <form onSubmit={handleSearch} style={s.form}>
                <div style={s.inputWrapper}>
                  <span style={s.searchIcon}>🔍</span>
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('search_placeholder')}
                    required
                    style={s.input}
                    autoFocus
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary" style={s.btn}>
                  {loading ? t('searching_btn') : t('search_btn')}
                </button>
              </form>
            </div>

            {/* Error */}
            {error && (
              <div className="error-banner-box" style={s.errorBox}>
                <p style={s.error}>{error}</p>
              </div>
            )}

            {/* Loading state indicator */}
            {loading && (
              <div style={s.statusNotice}>
                <p style={s.statusText}>&ldquo;{query}&rdquo; {t('searching_for')}</p>
              </div>
            )}

            {/* Results count */}
            {total !== null && !loading && (
              <div style={s.resultHeader}>
                <span style={s.resultText}>
                  {total === 0
                    ? `"${router.query.q || query}" ${t('no_results_for')}`
                    : `"${router.query.q || query}" ${t('results_found_for')} ${total}`}
                </span>
              </div>
            )}

            {/* Results grid */}
            {results.length > 0 && (
              <div className="article-grid">
                {results.map((article) => (
                  <ArticleCard key={article._id} article={article} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {total === 0 && !loading && (
              <div className="empty-state-box" style={s.emptyState}>
                <span style={s.emptyIcon}>🔍</span>
                <p style={s.emptyTitle}>{t('no_news_found_title')}</p>
                <p style={s.emptySubtitle}>{t('no_news_found_sub')}</p>
              </div>
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
  searchHero: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    marginBottom: '0.35rem',
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
    letterSpacing: '-0.01em',
  },
  subheading: {
    color: '#64748b',
    fontSize: '0.9rem',
    margin: '0 0 1.5rem',
  },
  form: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  inputWrapper: {
    flex: 1,
    minWidth: '260px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '0.9rem',
    fontSize: '1rem',
    color: '#94a3b8',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem 0.75rem 2.6rem',
    border: '1.5px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '1rem',
    color: '#0f172a',
    outline: 'none',
    transition: 'border-color 0.15s ease',
  },
  btn: {
    padding: '0.75rem 1.6rem',
    backgroundColor: '#b91c1c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '700',
    fontSize: '0.95rem',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'background 0.15s ease',
    whiteSpace: 'nowrap',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    padding: '0.75rem 1rem',
    marginBottom: '1.5rem',
  },
  error: {
    color: '#991b1b',
    fontSize: '0.9rem',
    margin: 0,
  },
  statusNotice: {
    textAlign: 'center',
    padding: '2rem 0',
  },
  statusText: {
    color: '#64748b',
    fontSize: '1rem',
  },
  resultHeader: {
    marginBottom: '1.5rem',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '0.6rem',
  },
  resultText: {
    fontSize: '1rem',
    color: '#334155',
    fontWeight: '600',
  },
  emptyState: {
    textAlign: 'center',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '3.5rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  emptyIcon: {
    fontSize: '2.5rem',
  },
  emptyTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  emptySubtitle: {
    color: '#64748b',
    fontSize: '0.9rem',
    margin: 0,
  },
};
