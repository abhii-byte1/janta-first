import { useEffect, useRef } from 'react';
import "@/styles/globals.css";
import "react-quill-new/dist/quill.snow.css";
import { post } from '../lib/api';
import { LanguageProvider } from '../lib/LanguageContext';

export default function App({ Component, pageProps }) {
  const initialized = useRef(false);

  useEffect(() => {
    // Only trigger once per app session / mount
    if (initialized.current) return;
    initialized.current = true;

    if (typeof window !== 'undefined') {
      if (!sessionStorage.getItem('visited_session')) {
        sessionStorage.setItem('visited_session', '1');
        post('/api/visits/increment', {}).catch(() => {});
      }
    }
  }, []);

  return (
    <LanguageProvider>
      <Component {...pageProps} />
    </LanguageProvider>
  );
}
