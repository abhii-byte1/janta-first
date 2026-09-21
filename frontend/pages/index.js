import { useEffect } from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ArticleCard from '../components/ArticleCard';
import BreakingNewsTicker from '../components/BreakingNewsTicker';
import LiveCricketWidget from '../components/LiveCricketWidget';
import LiveTVWidget from '../components/LiveTVWidget';
import WeatherWidget from '../components/WeatherWidget';
import Link from 'next/link';
import { useLanguage } from '../lib/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getServerSideProps() {
  try {
    const [catRes, artRes] = await Promise.all([
      fetch(`${API_URL}/api/categories`),
      fetch(`${API_URL}/api/articles?limit=100`),
    ]);

    const categories = catRes.ok ? await catRes.json() : [];
    const { articles = [] } = artRes.ok ? await artRes.json() : {};
    const hasError = !catRes.ok || !artRes.ok;

    return { props: { categories, articles, hasError } };
  } catch {
    return { props: { categories: [], articles: [], hasError: true } };
  }
}

export default function Homepage({ categories, articles, hasError }) {
  const { language, t } = useLanguage();

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

  // Smooth scroll to #live-section if URL contains the hash
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#live-section') {
      const el = document.getElementById('live-section');
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    }
  }, []);

  return (
    <>
      <Head>
        <title>Janta First — जनता की आवाज़, निष्पक्ष पत्रकारिता</title>
        <meta name="description" content="Janta First - जनता की आवाज़, निष्पक्ष पत्रकारिता। देश और दुनिया की ताज़ा ख़बरें।" />
      </Head>

      <div style={s.page}>
        <Header categories={categories} />
        <BreakingNewsTicker articles={articles} />

        <main style={s.main}>
        <div className="site-container">
          {hasError && (
            <div style={s.errorBanner}>
              {t('home_error_banner')}
            </div>
          )}

          {/* Local Weather Widget (near top, above category sections) */}
          <WeatherWidget />

          {/* Category sections */}
          {categories.map((cat) => {
            const catArticles = (byCategory[cat._id] || []).slice(0, 4);
            if (catArticles.length === 0) return null; // skip empty categories

            return (
              <section key={cat._id} style={s.section}>
                <div style={s.sectionHeader}>
                  <div style={s.titleGroup}>
                    <span style={s.sectionAccentBar} />
                    <h2 style={s.sectionTitle}>{cat.name}</h2>
                  </div>
                  <Link href={`/category/${cat.slug}`} style={s.viewMore}>
                    {t('view_all_news')}
                  </Link>
                </div>

                <div className="article-grid">
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
                <div style={s.titleGroup}>
                  <span style={s.sectionAccentBar} />
                  <h2 style={s.sectionTitle}>{t('other_news_title')}</h2>
                </div>
              </div>

              <div className="article-grid">
                {uncategorised.slice(0, 4).map((article) => (
                  <ArticleCard key={article._id} article={article} />
                ))}
              </div>
            </section>
          )}

          {/* Live TV & Cricket Widgets Section (Placed after news content, before footer) */}
          <section id="live-section" style={s.liveSection} aria-label="Live TV and Cricket Updates">
            <div style={s.sectionHeader}>
              <div style={s.titleGroup}>
                <span style={s.sectionAccentBar} />
                <h2 style={s.sectionTitle}>
                  {language === 'hi' ? '🔴 लाइव अपडेट्स एवं प्रसारण' : '🔴 Live Updates & Broadcast'}
                </h2>
              </div>
              <span style={s.liveBadge}>LIVE 24x7</span>
            </div>
            <div className="live-widgets-grid">
              <LiveCricketWidget />
              <LiveTVWidget />
            </div>
          </section>

          {/* No content at all */}
          {articles.length === 0 && !hasError && (
            <div style={s.emptyState}>
              <span style={s.emptyIcon}>📰</span>
              <h3 style={s.emptyTitle}>{t('no_news_title')}</h3>
              <p style={s.emptySubtitle}>{t('no_news_subtitle')}</p>
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
    padding: '2.5rem 0',
  },
  liveSection: {
    marginTop: '2rem',
    marginBottom: '2rem',
    paddingTop: '1.5rem',
    borderTop: '2px solid #e2e8f0',
    scrollMarginTop: '90px',
  },
  section: {
    marginBottom: '3rem',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem',
    borderBottom: '2px solid #e2e8f0',
    paddingBottom: '0.6rem',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
  },
  sectionAccentBar: {
    width: '4px',
    height: '1.4rem',
    backgroundColor: '#b91c1c',
    borderRadius: '2px',
  },
  liveBadge: {
    fontSize: '0.72rem',
    fontWeight: '800',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    borderRadius: '4px',
    padding: '0.2rem 0.55rem',
    letterSpacing: '0.04em',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '1.35rem',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '-0.01em',
  },
  viewMore: {
    fontSize: '0.85rem',
    color: '#b91c1c',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    padding: '0.3rem 0.75rem',
    borderRadius: '4px',
    textDecoration: 'none',
    fontWeight: '700',
    transition: 'all 0.15s ease',
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '1rem',
    fontSize: '0.95rem',
    textAlign: 'center',
    marginBottom: '2rem',
    fontWeight: '500',
  },
  emptyState: {
    textAlign: 'center',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '4rem 1.5rem',
    margin: '2rem 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '0.5rem',
  },
  emptyTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  emptySubtitle: {
    color: '#64748b',
    fontSize: '0.95rem',
    margin: 0,
  },
};
