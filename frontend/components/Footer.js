export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={s.footer}>
      <div style={s.inner}>
        <p style={s.text}>© {year} Om Darpan. All rights reserved.</p>
      </div>
    </footer>
  );
}

const s = {
  footer: {
    backgroundColor: '#1e293b',
    color: '#94a3b8',
    marginTop: 'auto',
    padding: '1.25rem 1rem',
  },
  inner: {
    maxWidth: '1100px',
    margin: '0 auto',
    textAlign: 'center',
  },
  text: {
    margin: 0,
    fontSize: '0.875rem',
  },
};
