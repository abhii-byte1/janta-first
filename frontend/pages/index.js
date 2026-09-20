import Header from '../components/Header';
import Footer from '../components/Footer';
import ArticleCard from '../components/ArticleCard';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getServerSideProps() {
  try {
    // Fetch categories and all published articles in parallel
    const [catRes, artRes] = await Promise.all([
      fetch(`${API_URL}/api/categories`),
      fetch(`${API_URL}/api/articles?limit=100`),
    ]);

    const categories = catRes.ok ? await catRes.json() : [];
    const { articles = [] } = artRes.ok ? await artRes.json() : {};

    return { props: { categories, articles } };
  } catch {
    return { props: { categories: [], articles: [] } };
  }
}

export default function Homepage({ categories, articles }) {
  // Group articles by category _id for fast lookup
  const byCategory = {};
  for (const article of articles) {
    const catId = article.category?._id;
    if (!catId) continue;
    if (!byCategory[catId]) byCategory[catId] = [];
    byCategory[catId].push(article);
  }

  // Uncategorised published articles
  const uncategorised = articles.filter((a) => !a.category);

  return (
    <div style={s.page}>
      <Header />

      <main style={s.main}>
        <div style={s.container}>

          {/* Category sections */}
          {categories.map((cat) => {
            const catArticles = (byCategory[cat._id] || []).slice(0, 4);
            if (catArticles.length === 0) return null; // skip empty categories

            return (
              <section key={cat._id} style={s.section}>
                <div style={s.sectionHeader}>
                  <h2 style={s.sectionTitle}>{cat.name}</h2>
                  <Link href={`/category/${cat.slug}`} style={s.viewMore}>
                    View More →
                  </Link>
                </div>
                <div style={s.grid}>
                  {catArticles.map((article) => (
                    <ArticleCard key={article._id} article={article} />
                  ))}
                </div>
              </section>
            );
          })}

          {/* Uncategorised articles section */}
          {uncategorised.length > 0 && (
            <section style={s.section}>
              <div style={s.sectionHeader}>
                <h2 style={s.sectionTitle}>Other Articles</h2>
              </div>
              <div style={s.grid}>
                {uncategorised.slice(0, 4).map((article) => (
                  <ArticleCard key={article._id} article={article} />
                ))}
              </div>
            </section>
          )}

          {/* No content at all */}
          {articles.length === 0 && (
            <div style={s.emptyState}>
              <p>No published articles yet. Check back soon.</p>
            </div>
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
  container: { maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' },
  section: {},
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem', borderBottom: '2px solid #1d4ed8', paddingBottom: '0.4rem' },
  sectionTitle: { margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#111' },
  viewMore: { fontSize: '0.85rem', color: '#1d4ed8', textDecoration: 'none', fontWeight: '600' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' },
  emptyState: { textAlign: 'center', color: '#6b7280', padding: '4rem 0' },
};
