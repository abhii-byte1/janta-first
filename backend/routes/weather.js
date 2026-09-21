const express = require('express');

const router = express.Router();

// Simple in-memory cache: city.toLowerCase() -> { data, expiresAt }
// 30-minute cache TTL (1800000 ms)
const weatherCache = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000;

// GET /api/weather?city=<cityname>&lat=<lat>&lon=<lon> — public
router.get('/', async (req, res) => {
  try {
    const { lat, lon, city: queryCity } = req.query;

    const hasCoords =
      lat !== undefined &&
      lon !== undefined &&
      !isNaN(parseFloat(lat)) &&
      !isNaN(parseFloat(lon));

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey || apiKey === 'your_key_here') {
      return res.status(503).json({
        message: 'OpenWeatherMap API key is not configured in backend/.env',
      });
    }

    let cacheKey;
    let url;
    let fallbackCity = (queryCity || 'Raipur').trim();

    if (hasCoords) {
      // Round to 2 decimals (~1.1 km resolution) for caching efficiency
      const parsedLat = parseFloat(lat).toFixed(2);
      const parsedLon = parseFloat(lon).toFixed(2);
      cacheKey = `coord:${parsedLat},${parsedLon}`;
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(
        lat
      )}&lon=${encodeURIComponent(lon)}&appid=${apiKey}&units=metric&lang=hi`;
    } else {
      cacheKey = `city:${fallbackCity.toLowerCase()}`;
      url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        fallbackCity
      )}&appid=${apiKey}&units=metric&lang=hi`;
    }

    // 1. Check in-memory cache
    const cached = weatherCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return res.status(200).json({ ...cached.data, cached: true });
    }

    // 2. Fetch from OpenWeatherMap (metric units, Hindi description)
    const apiRes = await fetch(url);
    const data = await apiRes.json();

    if (!apiRes.ok) {
      return res.status(apiRes.status).json({
        message: data.message || 'Weather lookup failed from OpenWeatherMap',
      });
    }

    // 3. Extract simplified fields
    const weatherData = {
      city: data.name || (hasCoords ? 'User Location' : fallbackCity),
      temp: Math.round(data.main?.temp ?? 0),
      condition: data.weather?.[0]?.description || '',
      icon: data.weather?.[0]?.icon || '01d',
      humidity: data.main?.humidity ?? null,
      isUserLocation: Boolean(hasCoords),
    };

    // 4. Store in cache for 30 minutes
    weatherCache.set(cacheKey, {
      data: weatherData,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    res.status(200).json(weatherData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
