import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ArticleCard from '../components/ArticleCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SearchPage() {
  const router = useRouter();

  // Initialise query from URL param so direct links like /search?q=... work
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

    // Update URL without page reload so the link is shareable
    router.replace(`/search?q=${encodeURIComponent(q)}`, undefined, { shallow: true });

    try {
      const res = await fetch(
        `${API_URL}/api/articles?search=${encodeURIComponent(q)}&limit=20`
      );
      if (!res.ok) throw new Error('Request failed');
      const { articles, total: t } = await res.json();
      setResults(articles);
      setTotal(t);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Search — Om Darpan</title>
        <meta name="description" content="Search published articles on Om Darpan." />
      </Head>

      <div style={s.page}>
        <Header />

        <main style={s.main}>
          <div style={s.container}>
            <h1 style={s.heading}>Search Articles</h1>

            {/* Search form */}
            <form onSubmit={handleSearch} style={s.form}>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title…"
                style={s.input}
                autoFocus
              />
              <button type="submit" disabled={loading} style={s.btn}>
                {loading ? 'Searching…' : 'Search'}
              </button>
            </form>

            {/* Error */}
            {error && <p style={s.error}>{error}</p>}

            {/* Results count */}
            {total !== null && !loading && (
              <p style={s.resultCount}>
                {total === 0
                  ? `No results for "${router.query.q || query}"`
                  : `${total} result${total !== 1 ? 's' : ''} for "${router.query.q || query}"`}
              </p>
            )}

            {/* Results grid */}
            {results.length > 0 && (
              <div style={s.grid}>
                {results.map((article) => (
                  <ArticleCard key={article._id} article={article} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {total === 0 && !loading && (
              <div style={s.emptyState}>
                <p>Try a different keyword.</p>
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
  page: { display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f8fafc' },
  main: { flex: 1, padding: '2rem 1rem' },
  container: { maxWidth: '900px', margin: '0 auto' },
  heading: { margin: '0 0 1.25rem', fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' },
  form: { display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' },
  input: { flex: 1, padding: '0.6rem 0.9rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '1rem' },
  btn: { padding: '0.6rem 1.3rem', backgroundColor: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer' },
  error: { color: '#dc2626', fontSize: '0.875rem' },
  resultCount: { fontSize: '0.9rem', color: '#6b7280', marginBottom: '1.25rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' },
  emptyState: { textAlign: 'center', color: '#6b7280', padding: '3rem 0' },
};
