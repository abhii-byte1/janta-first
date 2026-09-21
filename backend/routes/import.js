const express = require('express');
const Article = require('../models/Article');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

// Generate unique slug (handles non-latin characters like Hindi)
const generateUniqueSlug = async (title) => {
  let base = title
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // If title was entirely non-ASCII or became empty after stripping
  if (!base) {
    base = `article-${Date.now().toString(36)}`;
  }

  const existing = await Article.findOne({ slug: base });
  if (!existing) return base;
  return `${base}-${Date.now().toString(36)}`;
};

// POST /api/import/newsdata -> fetch from NewsData.io and save drafts (admin only)
router.post('/newsdata', auth, role('admin'), async (req, res) => {
  try {
    const apiKey = process.env.NEWSDATA_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'NEWSDATA_API_KEY is not configured in server environment.' });
    }

    const country = req.query.country || 'in';
    const language = req.query.language || 'hi';
    const size = parseInt(req.query.size, 10) || 10;

    const url = `https://newsdata.io/api/1/news?apikey=${apiKey}&country=${country}&language=${language}`;

    const apiRes = await fetch(url);
    const data = await apiRes.json();

    if (data.status !== 'success') {
      return res.status(502).json({
        message: 'NewsData.io API returned an error',
        details: data.results?.message || data.error || data,
      });
    }

    const fetchedArticles = data.results || [];
    let importedCount = 0;
    let skippedCount = 0;
    const importedList = [];

    for (const item of fetchedArticles.slice(0, size)) {
      const title = item.title?.trim();
      if (!title) {
        skippedCount++;
        continue;
      }

      // Check if article with identical title already exists
      const existing = await Article.findOne({ title });
      if (existing) {
        skippedCount++;
        continue;
      }

      // Format content: item.content or item.description, wrapped in <p> tag
      let bodyText = item.content || item.description || '';
      if (!bodyText.startsWith('<') && bodyText.length > 0) {
        bodyText = `<p>${bodyText}</p>`;
      }

      const slug = await generateUniqueSlug(title);

      const newArticle = new Article({
        title,
        slug,
        content: bodyText || `<p>${title}</p>`,
        coverImage: item.image_url || undefined,
        tags: Array.isArray(item.keywords) ? item.keywords : [],
        status: 'draft',
        submittedBy: req.user.userId,
      });

      await newArticle.save();
      importedCount++;
      importedList.push({ id: newArticle._id, title: newArticle.title, slug: newArticle.slug });
    }

    res.status(200).json({
      imported: importedCount,
      skipped: skippedCount,
      total_fetched: fetchedArticles.length,
      articles: importedList,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to import articles', error: error.message });
  }
});

module.exports = router;
