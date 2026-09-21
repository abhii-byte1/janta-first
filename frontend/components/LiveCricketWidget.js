/**
 * LiveCricketWidget.js
 * 
 * Free third-party embeddable live cricket score widget.
 * 
 * NOTE FOR CUSTOM EMBED CODES:
 * If you wish to customize colors, teams, or switch providers:
 * 1. Crictimes Widget Builder (No API key required): https://widget.crictimes.org/
 * 2. CricketData API & Widgets (Free sign-up): https://cricketdata.org/
 * 3. Gamezop / Criczop: https://gamezop.com/
 * 
 * Simply replace the `src` attribute below with your preferred embed URL.
 */

export default function LiveCricketWidget() {
  // Free, no-key embed widget themed to match Janta First's red & slate palette
  const WIDGET_SRC =
    'https://cwidget.crictimes.org/?v=1.1&a=b91c1c&c=ffffff&bo=e2e8f0&b=ffffff&sb=0f172a&lb=b91c1c&lc=ffffff&db=ffffff&dc=0f172a&tc=0f172a&ti=b91c1c';

  return (
    <section style={s.widgetSection} aria-label="Live Cricket Scores">
      <div style={s.header}>
        <div style={s.titleGroup}>
          <span style={s.accentBar} />
          <h2 style={s.heading}>🏏 Live Cricket</h2>
          <span style={s.liveBadge}>LIVE</span>
        </div>
        <span style={s.subText}>ताज़ा मैच स्कोर (Real-time updates)</span>
      </div>

      <div style={s.iframeWrapper}>
        <iframe
          src={WIDGET_SRC}
          title="Live Cricket Scores"
          style={s.iframe}
          loading="lazy"
          scrolling="no"
          frameBorder="0"
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
      </div>
    </section>
  );
}

const s = {
  widgetSection: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '1.25rem',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    borderBottom: '2px solid #f1f5f9',
    paddingBottom: '0.6rem',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
  },
  accentBar: {
    width: '4px',
    height: '1.3rem',
    backgroundColor: '#b91c1c',
    borderRadius: '2px',
  },
  heading: {
    margin: 0,
    fontSize: '1.2rem',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '-0.01em',
  },
  liveBadge: {
    fontSize: '0.68rem',
    fontWeight: '800',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    borderRadius: '4px',
    padding: '0.15rem 0.45rem',
    letterSpacing: '0.06em',
  },
  subText: {
    fontSize: '0.8rem',
    color: '#64748b',
    fontWeight: '500',
  },
  iframeWrapper: {
    width: '100%',
    minHeight: '190px',
    overflow: 'hidden',
    position: 'relative',
    borderRadius: '6px',
    backgroundColor: '#f8fafc',
  },
  iframe: {
    width: '100%',
    height: '210px',
    border: 'none',
    display: 'block',
  },
};
