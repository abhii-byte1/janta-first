import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLanguage } from '../lib/LanguageContext';

const PLACEHOLDER_TEAM = [
  {
    name: 'रमेश कुमार शर्मा',
    role: 'मुख्य संपादक (Editor-in-Chief)',
    dept: 'संपादकीय मंडल',
    bio: '25+ वर्षों का प्रिंट एवं डिजिटल पत्रकारिता में अनुभव। निष्पक्ष और निर्भीक रिपोर्टिंग के लिए समर्पित।',
    avatarColor: '#b91c1c',
    initials: 'RS',
  },
  {
    name: 'अमित पटेल',
    role: 'ब्यूरो प्रमुख — राज्य (Bureau Chief)',
    dept: 'राज्य एवं जिला कवरेज',
    bio: 'क्षेत्रीय राजनीति, ग्रामीण अर्थव्यवस्था एवं जनसरोकार से जुड़ी ग्राउंड रिपोर्टिंग में विशेषज्ञता।',
    avatarColor: '#0f172a',
    initials: 'AP',
  },
  {
    name: 'प्रिया वर्मा',
    role: 'वरिष्ठ विशेष संवाददाता (Senior Correspondent)',
    dept: 'राजनीतिक एवं सामाजिक मुद्दे',
    bio: 'नीतिगत विश्लेषण, विधानसभा कवरेज एवं महिला सशक्तिकरण से जुड़े मुद्दों की मुख्य विश्लेषक।',
    avatarColor: '#b45309',
    initials: 'PV',
  },
  {
    name: 'विकास साहू',
    role: 'डिजिटल एवं तकनीकी प्रमुख (Head of Digital & Tech)',
    dept: 'डिजिटल ऑपरेशंस',
    bio: 'न्यूज पोर्टल इन्फ्रास्ट्रक्चर, ई-पेपर वितरण एवं सोशल मीडिया प्रबंधन के रणनीतिकार।',
    avatarColor: '#1e40af',
    initials: 'VS',
  },
  {
    name: 'सुनीता चंद्राकर',
    role: 'वरिष्ठ अनुसंधानकर्ता एवं उप-संपादक (Associate Editor)',
    dept: 'फैक्ट चेक एवं संपादन',
    bio: 'सटीक तथ्यों की पड़ताल, भाषा परिष्कार एवं खोजी पत्रकारिता की प्रमुख सूत्रधार।',
    avatarColor: '#4d7c0f',
    initials: 'SC',
  },
  {
    name: 'दीपक कश्यप',
    role: 'मुख्य छायाकार एवं वीडियो पत्रकार (Lead Photojournalist)',
    dept: 'मल्टीमीडिया डेस्क',
    bio: 'ग्राउंड ब्रेकिंग वीडियो कवरेज, लाइव रिपोर्टिंग एवं जनआंदोलनों के दृश्य दस्तावेजीकरण में दक्ष।',
    avatarColor: '#6d28d9',
    initials: 'DK',
  },
];

export default function OurTeam() {
  const { language, t } = useLanguage();

  return (
    <>
      <Head>
        <title>
          {language === 'hi' ? 'हमारी टीम (Our Team) — जनता फर्स्ट' : 'Our Team — Janta First'}
        </title>
        <meta
          name="description"
          content="जनता फर्स्ट की संपादकीय, तकनीकी और रिपोर्टिंग टीम से मिलें। निष्पक्ष पत्रकारिता के स्तंभ।"
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
                {language === 'hi' ? 'हमारी टीम' : 'Our Team'}
              </span>
            </div>

            {/* Header Banner */}
            <div style={s.banner}>
              <span style={s.badge}>👥 {language === 'hi' ? 'संपादकीय परिवार' : 'EDITORIAL BOARD'}</span>
              <h1 style={s.title}>{t('our_team_title')}</h1>
              <p style={s.subtitle}>{t('our_team_sub')}</p>
            </div>

            {/* Team Grid */}
            <div style={s.teamGrid}>
              {PLACEHOLDER_TEAM.map((member, idx) => (
                <div key={idx} className="team-card" style={s.card}>
                  <div style={s.avatarWrapper}>
                    <div style={{ ...s.avatar, backgroundColor: member.avatarColor }}>
                      {member.initials}
                    </div>
                  </div>

                  <div style={s.cardBody}>
                    <span style={s.deptBadge}>{member.dept}</span>
                    <h2 style={s.name}>{member.name}</h2>
                    <p style={s.role}>{member.role}</p>
                    <p style={s.bio}>{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Join Us Callout */}
            <div style={s.joinCallout}>
              <div>
                <h3 style={s.joinTitle}>
                  {language === 'hi' ? 'क्या आप हमारी टीम का हिस्सा बनना चाहते हैं?' : 'Want to join our journalistic network?'}
                </h3>
                <p style={s.joinText}>
                  {language === 'hi'
                    ? 'हम पूरे राज्य और देश से उत्साही पत्रकारों और नागरिक रिपोर्टरों का स्वागत करते हैं।'
                    : 'We welcome reporters, analysts, and ground journalists from across the nation.'}
                </p>
              </div>
              <Link href="/apply-reporter" className="btn-primary" style={s.btnJoin}>
                {language === 'hi' ? 'संवाददाता के रूप में आवेदन करें →' : 'Apply as Reporter →'}
              </Link>
            </div>
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
  banner: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '2rem 2.25rem', marginBottom: '2.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  badge: { fontSize: '0.72rem', fontWeight: '800', color: '#b91c1c', backgroundColor: '#fee2e2', padding: '0.15rem 0.5rem', borderRadius: '4px', letterSpacing: '0.04em' },
  title: { margin: '0.6rem 0 0.4rem', fontSize: '1.85rem', color: '#0f172a', fontWeight: '800' },
  subtitle: { margin: 0, color: '#64748b', fontSize: '0.96rem', lineHeight: '1.5' },
  teamGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' },
  card: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'transform 0.15s, box-shadow 0.15s' },
  avatarWrapper: { marginBottom: '1rem' },
  avatar: { width: '76px', height: '76px', borderRadius: '50%', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: '800', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' },
  cardBody: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' },
  deptBadge: { fontSize: '0.72rem', fontWeight: '700', backgroundColor: '#f1f5f9', color: '#475569', padding: '0.15rem 0.5rem', borderRadius: '4px' },
  name: { margin: '0.35rem 0 0.1rem', fontSize: '1.2rem', color: '#0f172a', fontWeight: '700' },
  role: { margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#b91c1c', fontWeight: '600' },
  bio: { margin: 0, fontSize: '0.86rem', color: '#64748b', lineHeight: '1.5' },
  joinCallout: { backgroundColor: '#0f172a', color: '#ffffff', borderRadius: '8px', padding: '2rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' },
  joinTitle: { margin: '0 0 0.35rem', fontSize: '1.25rem', fontWeight: '700', color: '#ffffff' },
  joinText: { margin: 0, color: '#94a3b8', fontSize: '0.9rem' },
  btnJoin: { padding: '0.75rem 1.4rem', backgroundColor: '#b91c1c', color: '#ffffff', borderRadius: '6px', fontWeight: '700', fontSize: '0.9rem', textDecoration: 'none', whiteSpace: 'nowrap' },
};
