/**
 * LiveTVWidget.js
 * 
 * Embeds a YouTube live stream or video broadcast for Janta First.
 * 
 * NOTE FOR CUSTOM STREAM / CHANNEL ID:
 * 1. For a specific YouTube video or live event:
 *    Set VIDEO_ID to the 11-character video ID from the YouTube URL (e.g. youtube.com/watch?v=VIDEO_ID).
 * 2. For an always-on 24/7 channel live stream:
 *    You can set the iframe src to:
 *    https://www.youtube.com/embed/live_stream?channel=YOUR_CHANNEL_ID
 */

export default function LiveTVWidget() {
  // TODO: Replace VIDEO_ID with your actual YouTube live stream ID or channel's live embed URL
  const VIDEO_ID = 'live_stream_placeholder';

  return (
    <section style={s.widgetSection} aria-label="Live TV">
      <div style={s.header}>
        <div style={s.titleGroup}>
          <span style={s.accentBar} />
          <h2 style={s.heading}>📺 Live TV</h2>
          <span style={s.liveBadge}>LIVE</span>
        </div>
        <span style={s.subText}>लाइव प्रसारण (24x7 Broadcast)</span>
      </div>

      <div style={s.iframeWrapper}>
        <iframe
          src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=0`}
          title="Janta First Live TV"
          style={s.iframe}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
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
    position: 'relative',
    width: '100%',
    aspectRatio: '16 / 9',
    overflow: 'hidden',
    borderRadius: '6px',
    backgroundColor: '#0f172a',
    flex: 1,
    minHeight: '200px',
  },
  iframe: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    maxWidth: '100%',
    border: 'none',
    display: 'block',
  },
};
