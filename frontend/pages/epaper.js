import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLanguage } from '../lib/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getServerSideProps({ query }) {
  try {
    const res = await fetch(`${API_URL}/api/epaper`);
    const epapers = res.ok ? await res.json() : [];

    let currentEpaper = null;
    if (epapers.length > 0) {
      if (query.id) {
        currentEpaper = epapers.find((e) => e._id === query.id) || epapers[0];
      } else {
        currentEpaper = epapers[0]; // Latest edition by default
      }
    }

    return {
      props: {
        epapers,
        initialEpaper: currentEpaper,
        hasError: !res.ok,
      },
    };
  } catch {
    return {
      props: {
        epapers: [],
        initialEpaper: null,
        hasError: true,
      },
    };
  }
}

export default function EpaperPage({ epapers, initialEpaper, hasError }) {
  const { language } = useLanguage();
  const [selectedEpaper, setSelectedEpaper] = useState(initialEpaper);

  const formattedDate = (d) =>
    new Date(d).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  return (
    <>
      <Head>
        <title>
          {selectedEpaper
            ? `${selectedEpaper.title} — ई-पेपर | Janta First`
            : 'ई-पेपर (E-Paper) — Janta First'}
        </title>
        <meta
          name="description"
          content="जनता फर्स्ट का दैनिक डिजिटल समाचार पत्र (E-Paper)। ताज़ा संस्करण ऑनलाइन पढ़ें या डाउनलोड करें।"
        />
      </Head>

      <div style={s.page}>
        <Header />

        <main style={s.main}>
          <div className="site-container">
            {/* Breadcrumb */}
            <div style={s.breadcrumb}>
              <Link href="/" style={s.breadLink}>
                {language === 'hi' ? 'मुख्य पृष्ठ' : 'Home'}
              </Link>
              <span style={s.breadSep}>/</span>
              <span style={s.breadCurrent}>
                {language === 'hi' ? 'ई-पेपर' : 'E-Paper'}
              </span>
            </div>

            {hasError && (
              <div style={s.errorBanner}>
                ⚠️ ई-पेपर संस्करण लोड करने में असमर्थ। कृपया थोड़ी देर बाद पुनः प्रयास करें।
              </div>
            )}

            {!hasError && epapers.length === 0 && (
              <div style={s.emptyCard}>
                <span style={s.emptyIcon}>📰</span>
                <h2 style={s.emptyTitle}>
                  {language === 'hi' ? 'कोई ई-पेपर उपलब्ध नहीं है' : 'No E-Paper Available Yet'}
                </h2>
                <p style={s.emptySubtitle}>
                  {language === 'hi'
                    ? 'आज का समाचार पत्र जल्द ही यहाँ प्रकाशित किया जाएगा।'
                    : 'Today’s edition will be published shortly. Please check back soon.'}
                </p>
                <Link href="/" className="btn-primary" style={s.btnHome}>
                  ← {language === 'hi' ? 'मुख्य पृष्ठ पर लौटें' : 'Return to Home'}
                </Link>
              </div>
            )}

            {selectedEpaper && (
              <>
                {/* Active Edition Card */}
                <section style={s.viewerCard}>
                  <div style={s.viewerHeader}>
                    <div>
                      <div style={s.badgeRow}>
                        <span style={s.liveBadge}>
                          {language === 'hi' ? 'दैनिक संस्करण' : 'DAILY EDITION'}
                        </span>
                        <span style={s.editionDate}>
                          📅 {formattedDate(selectedEpaper.date)}
                        </span>
                      </div>
                      <h1 style={s.editionTitle}>{selectedEpaper.title}</h1>
                    </div>

                    <div style={s.toolbarActions}>
                      <a
                        href={selectedEpaper.pdfUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                        style={s.btnDownload}
                      >
                        ⬇️ {language === 'hi' ? 'PDF डाउनलोड करें' : 'Download PDF'}
                      </a>
                      <a
                        href={selectedEpaper.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary"
                        style={s.btnOpenTab}
                      >
                        ↗ {language === 'hi' ? 'नई विंडो में खोलें' : 'Open in New Tab'}
                      </a>
                    </div>
                  </div>

                  {/* Embedded PDF Viewer */}
                  <div style={s.iframeWrapper}>
                    <iframe
                      src={selectedEpaper.pdfUrl}
                      title={selectedEpaper.title}
                      style={s.iframe}
                    />
                  </div>

                  <p style={s.mobileHint}>
                    💡 {language === 'hi'
                      ? 'यदि आपके मोबाइल ब्राउज़र में PDF स्वतः प्रदर्शित नहीं हो रहा है, तो ऊपर दिए गए "PDF डाउनलोड करें" बटन पर क्लिक करके इसे सीधे देख सकते हैं।'
                      : 'If the PDF does not display inside your mobile browser, tap "Download PDF" above to view it directly.'}
                  </p>
                </section>

                {/* Past Editions Archive */}
                {epapers.length > 1 && (
                  <section style={s.archiveSection}>
                    <div style={s.archiveHeader}>
                      <span style={s.accentBar} />
                      <h2 style={s.archiveTitle}>
                        {language === 'hi' ? 'पिछले संस्करण (Past Editions)' : 'Past Editions'}
                      </h2>
                    </div>

                    <div style={s.archiveGrid}>
                      {epapers.map((ep) => {
                        const isCurrent = ep._id === selectedEpaper._id;
                        return (
                          <div
                            key={ep._id}
                            className="archive-card"
                            style={isCurrent ? { ...s.archiveCard, ...s.archiveCardActive } : s.archiveCard}
                          >
                            <div style={s.cardMeta}>
                              <span style={s.cardDate}>
                                📅 {new Date(ep.date).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                              {isCurrent && (
                                <span style={s.activePill}>
                                  {language === 'hi' ? 'सक्रिय' : 'Viewing'}
                                </span>
                              )}
                            </div>
                            <h3 style={s.cardTitle}>{ep.title}</h3>

                            <div style={s.cardActions}>
                              <button
                                onClick={() => {
                                  setSelectedEpaper(ep);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                style={isCurrent ? s.btnCardActive : s.btnCardView}
                              >
                                {isCurrent
                                  ? (language === 'hi' ? '✓ पढ़ रहे हैं' : '✓ Current')
                                  : (language === 'hi' ? '📖 पढ़ें' : '📖 Read')}
                              </button>
                              <a
                                href={ep.pdfUrl}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                style={s.btnCardDownload}
                              >
                                ⬇ {language === 'hi' ? 'डाउनलोड' : 'Download'}
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

const s = {
  page: { display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc' },
  main: { flex: 1, padding: '2.5rem 0 3.5rem' },
  breadcrumb: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', marginBottom: '1.5rem' },
  breadLink: { color: '#b91c1c', fontWeight: '600' },
  breadSep: { color: '#94a3b8' },
  breadCurrent: { color: '#64748b' },
  errorBanner: { padding: '1rem 1.25rem', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', marginBottom: '1.5rem', fontWeight: '500' },
  emptyCard: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '3.5rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  emptyIcon: { fontSize: '3rem' },
  emptyTitle: { margin: 0, fontSize: '1.4rem', color: '#0f172a', fontWeight: '700' },
  emptySubtitle: { margin: 0, color: '#64748b', fontSize: '0.95rem' },
  btnHome: { marginTop: '0.5rem', padding: '0.65rem 1.35rem', backgroundColor: '#b91c1c', color: '#ffffff', borderRadius: '6px', fontWeight: '700', fontSize: '0.9rem' },
  viewerCard: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '2.5rem' },
  viewerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1.25rem', marginBottom: '1.25rem' },
  badgeRow: { display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' },
  liveBadge: { fontSize: '0.7rem', fontWeight: '800', backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '4px', padding: '0.15rem 0.5rem', letterSpacing: '0.04em' },
  editionDate: { fontSize: '0.85rem', color: '#475569', fontWeight: '600' },
  editionTitle: { margin: 0, fontSize: '1.85rem', color: '#0f172a', fontWeight: '800', letterSpacing: '-0.01em' },
  toolbarActions: { display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' },
  btnDownload: { padding: '0.6rem 1.1rem', backgroundColor: '#b91c1c', color: '#ffffff', borderRadius: '6px', fontWeight: '700', fontSize: '0.875rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', transition: 'background-color 0.15s' },
  btnOpenTab: { padding: '0.6rem 1rem', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: '600', fontSize: '0.875rem', textDecoration: 'none' },
  iframeWrapper: { width: '100%', height: '800px', backgroundColor: '#334155', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' },
  iframe: { width: '100%', height: '100%', border: 'none', display: 'block' },
  mobileHint: { marginTop: '0.75rem', fontSize: '0.8rem', color: '#64748b', margin: '0.75rem 0 0' },
  archiveSection: { marginTop: '2rem' },
  archiveHeader: { display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' },
  accentBar: { width: '4px', height: '1.4rem', backgroundColor: '#b91c1c', borderRadius: '2px' },
  archiveTitle: { margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: '700' },
  archiveGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' },
  archiveCard: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'border-color 0.15s, box-shadow 0.15s' },
  archiveCardActive: { borderColor: '#b91c1c', backgroundColor: '#fffafa' },
  cardMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardDate: { fontSize: '0.8rem', color: '#64748b', fontWeight: '600' },
  activePill: { fontSize: '0.7rem', fontWeight: '700', backgroundColor: '#b91c1c', color: '#ffffff', borderRadius: '4px', padding: '0.1rem 0.4rem' },
  cardTitle: { margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: '700', flex: 1 },
  cardActions: { display: 'flex', gap: '0.5rem', marginTop: '0.25rem' },
  btnCardView: { flex: 1, padding: '0.45rem', backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '4px', fontWeight: '600', fontSize: '0.82rem', cursor: 'pointer' },
  btnCardActive: { flex: 1, padding: '0.45rem', backgroundColor: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '4px', fontWeight: '700', fontSize: '0.82rem', cursor: 'default' },
  btnCardDownload: { padding: '0.45rem 0.75rem', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: '600', fontSize: '0.82rem', textDecoration: 'none', textAlign: 'center' },
};
