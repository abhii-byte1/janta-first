import { useState } from 'react';
import { useRouter } from 'next/router';
import { post } from '../../lib/api';
import { saveToken } from '../../lib/auth';

export default function DashboardLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, ok } = await post('/api/auth/login', { email, password });

    setLoading(false);

    if (!ok) {
      setError(data?.message || 'Login failed. Please try again.');
      return;
    }

    // Any valid user (reporter or admin) is allowed here
    saveToken(data.token);
    router.push('/dashboard');
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.heading}>Reporter Login</h1>
        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label htmlFor="email" style={s.label}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={s.input}
              placeholder="you@example.com"
            />
          </div>
          <div style={s.field}>
            <label htmlFor="password" style={s.label}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={s.input}
              placeholder="••••••••"
            />
          </div>
          {error && <p style={s.error}>{error}</p>}
          <button type="submit" disabled={loading} style={s.button}>
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' },
  card: { backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', width: '100%', maxWidth: '380px' },
  heading: { margin: '0 0 1.5rem', fontSize: '1.5rem', textAlign: 'center', color: '#111' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  label: { fontSize: '0.875rem', fontWeight: '600', color: '#374151' },
  input: { padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '1rem' },
  error: { color: '#dc2626', fontSize: '0.875rem', margin: 0 },
  button: { padding: '0.625rem', backgroundColor: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', marginTop: '0.5rem' },
};
