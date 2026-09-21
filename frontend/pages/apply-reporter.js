import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { post } from '../lib/api';
import { useLanguage } from '../lib/LanguageContext';

export default function ApplyReporter() {
  const { language, t } = useLanguage();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.city.trim()) {
      setError(
        language === 'hi'
          ? 'कृपया सभी आवश्यक फ़ील्ड भरें (नाम, ईमेल, फ़ोन नंबर, शहर)'
          : 'Please fill in all required fields (Name, Email, Phone, City)'
      );
      return;
    }

    setLoading(true);
    const { data, ok } = await post('/api/reporter-applications', form);
    setLoading(false);

    if (!ok) {
      setError(data?.message || (language === 'hi' ? 'आवेदन जमा करने में समस्या हुई।' : 'Submission failed.'));
      return;
    }

    setSuccess(true);
    setForm({ name: '', email: '', phone: '', city: '', message: '' });
  };

  return (
    <>
      <Head>
        <title>
          {language === 'hi' ? 'संवाददाता आवेदन — जनता फर्स्ट' : 'Apply as Reporter — Janta First'}
        </title>
        <meta
          name="description"
          content="जनता फर्स्ट के साथ संवाददाता के रूप में जुड़ें। अपने शहर और जिले की ताज़ा ख़बरें सीधे प्रकाशित करें।"
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
                {language === 'hi' ? 'संवाददाता बनें' : 'Apply as Reporter'}
              </span>
            </div>

            <div style={s.cardWrapper}>
              {/* Top Banner */}
              <div style={s.headerBanner}>
                <span style={s.badge}>🎤 {language === 'hi' ? 'करियर / जुड़ें' : 'CAREERS / JOIN US'}</span>
                <h1 style={s.title}>{t('apply_reporter_title')}</h1>
                <p style={s.subtitle}>{t('apply_reporter_sub')}</p>
              </div>

              {success && (
                <div style={s.successBox}>
                  <span style={s.successIcon}>🎉</span>
                  <div>
                    <h3 style={s.successTitle}>
                      {language === 'hi'
                        ? 'आपका आवेदन मिल गया है, हम जल्द संपर्क करेंगे'
                        : 'Your application has been received, we will contact you soon.'}
                    </h3>
                    <p style={s.successText}>
                      {language === 'hi'
                        ? 'हमारी संपादकीय टीम आपके विवरण की समीक्षा करेगी और दिए गए संपर्क नंबर/ईमेल पर आपसे संपर्क करेगी।'
                        : 'Our editorial desk will review your credentials and contact you via email or phone.'}
                    </p>
                  </div>
                </div>
              )}

              {error && <div style={s.errorBox}>⚠️ {error}</div>}

              {/* Form */}
              <form onSubmit={handleSubmit} style={s.form}>
                <div style={s.formGrid}>
                  <div style={s.field}>
                    <label style={s.label}>
                      {language === 'hi' ? 'पूरा नाम *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder={language === 'hi' ? 'उदा. राहुल वर्मा' : 'e.g. Rahul Verma'}
                      required
                      style={s.input}
                    />
                  </div>

                  <div style={s.field}>
                    <label style={s.label}>
                      {language === 'hi' ? 'ईमेल पता *' : 'Email Address *'}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      required
                      style={s.input}
                    />
                  </div>

                  <div style={s.field}>
                    <label style={s.label}>
                      {language === 'hi' ? 'मोबाइल / व्हाट्सएप नंबर *' : 'Phone / WhatsApp *'}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      required
                      style={s.input}
                    />
                  </div>

                  <div style={s.field}>
                    <label style={s.label}>
                      {language === 'hi' ? 'शहर / जिला / राज्य *' : 'City / District / State *'}
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder={language === 'hi' ? 'उदा. रायपुर, छत्तीसगढ़' : 'e.g. Raipur, CG'}
                      required
                      style={s.input}
                    />
                  </div>
                </div>

                <div style={s.field}>
                  <label style={s.label}>
                    {language === 'hi'
                      ? 'पत्रकारिता अनुभव या संदेश (वैकल्पिक)'
                      : 'Journalism Experience or Message (Optional)'}
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows="4"
                    placeholder={
                      language === 'hi'
                        ? 'अपने अनुभव, कवरेज के विषय या हमारे साथ काम करने के उद्देश्य के बारे में बताएं...'
                        : 'Share brief background, beats of interest, or past published work...'
                    }
                    style={s.textarea}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={loading ? { ...s.btnSubmit, ...s.btnDisabled } : s.btnSubmit}
                >
                  {loading
                    ? (language === 'hi' ? 'आवेदन भेजा जा रहा है…' : 'Submitting…')
                    : (language === 'hi' ? '📤 आवेदन जमा करें' : '📤 Submit Application')}
                </button>
              </form>
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
  cardWrapper: { maxWidth: '720px', margin: '0 auto', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '2rem 2.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  headerBanner: { borderBottom: '2px solid #f1f5f9', paddingBottom: '1.25rem', marginBottom: '1.5rem' },
  badge: { fontSize: '0.72rem', fontWeight: '800', color: '#b91c1c', backgroundColor: '#fee2e2', padding: '0.15rem 0.5rem', borderRadius: '4px', letterSpacing: '0.04em' },
  title: { margin: '0.5rem 0 0.35rem', fontSize: '1.85rem', color: '#0f172a', fontWeight: '800', letterSpacing: '-0.01em' },
  subtitle: { margin: 0, color: '#64748b', fontSize: '0.94rem', lineHeight: '1.5' },
  successBox: { display: 'flex', alignItems: 'flex-start', gap: '0.85rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '1rem 1.25rem', marginBottom: '1.5rem' },
  successIcon: { fontSize: '1.5rem' },
  successTitle: { margin: '0 0 0.25rem', color: '#166534', fontSize: '1.05rem', fontWeight: '700' },
  successText: { margin: 0, color: '#15803d', fontSize: '0.86rem', lineHeight: '1.45' },
  errorBox: { backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.85rem 1rem', color: '#991b1b', marginBottom: '1.25rem', fontSize: '0.88rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.2rem' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.2rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  label: { fontSize: '0.86rem', fontWeight: '600', color: '#334155' },
  input: { padding: '0.65rem 0.85rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '16px', width: '100%', outline: 'none', transition: 'border-color 0.15s' },
  textarea: { padding: '0.65rem 0.85rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '16px', width: '100%', outline: 'none', fontFamily: 'inherit', resize: 'vertical' },
  btnSubmit: { alignSelf: 'flex-start', padding: '0.75rem 1.75rem', backgroundColor: '#b91c1c', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', minHeight: '44px', transition: 'background-color 0.15s' },
  btnDisabled: { backgroundColor: '#94a3b8', cursor: 'not-allowed' },
};
