import { useState, useEffect } from 'react';
import { useLanguage } from '../lib/LanguageContext';

export default function WeatherWidget() {
  const { language } = useLanguage();
  const [weather, setWeather] = useState(null);
  const [isUserLocation, setIsUserLocation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchWeather = async (params = 'city=Raipur', isUserLoc = false) => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/weather?${params}`);
        if (!res.ok) {
          // If coordinate fetch failed, try fallback to Raipur
          if (isUserLoc) {
            return fetchWeather('city=Raipur', false);
          }
          if (isMounted) {
            setError(true);
            setLoading(false);
          }
          return;
        }
        const data = await res.json();
        if (isMounted) {
          setWeather(data);
          setIsUserLocation(Boolean(data.isUserLocation || isUserLoc));
          setLoading(false);
        }
      } catch {
        if (isUserLoc) {
          return fetchWeather('city=Raipur', false);
        }
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    // Try geolocation first
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!isMounted) return;
          const { latitude, longitude } = position.coords;
          fetchWeather(`lat=${latitude}&lon=${longitude}`, true);
        },
        () => {
          // Permission denied or error -> fallback to Raipur
          if (!isMounted) return;
          fetchWeather('city=Raipur', false);
        },
        { timeout: 7000, maximumAge: 600000 }
      );
    } else {
      // Geolocation not supported -> fallback to Raipur
      fetchWeather('city=Raipur', false);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Hide widget gracefully if loading or if error occurs
  if (loading || error || !weather) {
    return null;
  }

  const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;

  return (
    <section style={s.weatherContainer} aria-label="Local Weather Updates">
      <div style={s.header}>
        <div style={s.titleGroup}>
          <span style={s.accentBar} />
          <h3 style={s.heading}>
            ⛅ {language === 'hi' ? 'मौसम अपडेट' : 'Weather Update'}
          </h3>
          {/* Label indicating whether this is the user's location or default city */}
          <span style={isUserLocation ? s.userLocBadge : s.cityBadge}>
            {isUserLocation
              ? (language === 'hi' ? '📍 आपका स्थान' : '📍 Your Location')
              : (language === 'hi' ? `${weather.city || 'रायपुर'} (डिफ़ॉल्ट)` : `${weather.city || 'Raipur'} (Default)`)}
          </span>
        </div>
        <span style={s.subText}>
          {language === 'hi' ? 'लाइव तापमान एवं पूर्वानुमान' : 'Live Temperature & Forecast'}
        </span>
      </div>

      <div style={s.contentRow}>
        <div style={s.tempGroup}>
          <img
            src={iconUrl}
            alt={weather.condition}
            width="56"
            height="56"
            style={s.icon}
          />
          <span style={s.tempVal}>{weather.temp}°C</span>
          <div style={s.conditionCol}>
            <strong style={s.conditionText}>{weather.condition}</strong>
            <span style={s.regionText}>
              {isUserLocation
                ? (weather.city ? `${weather.city}` : (language === 'hi' ? 'आपका स्थानीय क्षेत्र' : 'Local Area'))
                : (language === 'hi' ? `${weather.city || 'रायपुर'}, छत्तीसगढ़` : `${weather.city || 'Raipur'}, Chhattisgarh`)}
            </span>
          </div>
        </div>

        <div style={s.extraGroup}>
          {weather.humidity !== null && (
            <div style={s.statBadge}>
              <span style={s.statIcon}>💧</span>
              <span>
                {language === 'hi' ? 'नमी:' : 'Humidity:'} <strong>{weather.humidity}%</strong>
              </span>
            </div>
          )}
          <span style={s.livePill}>LIVE</span>
        </div>
      </div>
    </section>
  );
}

const s = {
  weatherContainer: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '1rem 1.25rem',
    marginBottom: '1.5rem',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.65rem',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '0.45rem',
    flexWrap: 'wrap',
    gap: '0.4rem',
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  accentBar: {
    width: '4px',
    height: '1.2rem',
    backgroundColor: '#b91c1c',
    borderRadius: '2px',
  },
  heading: {
    margin: 0,
    fontSize: '1.05rem',
    fontWeight: '800',
    color: '#0f172a',
  },
  cityBadge: {
    fontSize: '0.75rem',
    fontWeight: '700',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe',
    borderRadius: '4px',
    padding: '0.1rem 0.45rem',
  },
  userLocBadge: {
    fontSize: '0.75rem',
    fontWeight: '700',
    backgroundColor: '#ecfdf5',
    color: '#047857',
    border: '1px solid #a7f3d0',
    borderRadius: '4px',
    padding: '0.1rem 0.45rem',
  },
  subText: {
    fontSize: '0.78rem',
    color: '#64748b',
    fontWeight: '500',
  },
  contentRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  tempGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  icon: {
    width: '52px',
    height: '52px',
    objectFit: 'contain',
    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
  },
  tempVal: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 1,
  },
  conditionCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
  },
  conditionText: {
    fontSize: '0.95rem',
    color: '#1e293b',
    textTransform: 'capitalize',
  },
  regionText: {
    fontSize: '0.78rem',
    color: '#64748b',
  },
  extraGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  statBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '0.3rem 0.65rem',
    fontSize: '0.82rem',
    color: '#334155',
  },
  statIcon: {
    fontSize: '0.9rem',
  },
  livePill: {
    fontSize: '0.68rem',
    fontWeight: '800',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    borderRadius: '4px',
    padding: '0.15rem 0.45rem',
    letterSpacing: '0.04em',
  },
};
