const express = require('express');
const Article = require('../models/Article');
const Category = require('../models/Category');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

// Inline slugify — same style as categories.js
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s]+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');

// Generate a unique slug (appends short timestamp suffix on collision)
const generateUniqueSlug = async (title) => {
  const base = slugify(title);
  const existing = await Article.findOne({ slug: base });
  if (!existing) return base;
  return `${base}-${Date.now().toString(36)}`;
};

// ─────────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────────

// GET /api/articles — public, published only
// Supports: ?category=slug  ?page=1  ?limit=10
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { status: 'published' };

    if (req.query.category) {
      // Look up category by slug
      const cat = await Category.findOne({ slug: req.query.category });
      if (!cat) return res.status(200).json({ articles: [], total: 0, page, limit });

      // Check if this category has sub-categories (is a parent category)
      const subCategories = await Category.find({ parentCategory: cat._id });
      if (subCategories.length > 0) {
        const categoryIds = [cat._id, ...subCategories.map((s) => s._id)];
        filter.category = { $in: categoryIds };
      } else {
        filter.category = cat._id;
      }
    }

    if (req.query.search) {
      // Case-insensitive title search
      filter.title = { $regex: req.query.search, $options: 'i' };
    }

    const [articles, total] = await Promise.all([
      Article.find(filter)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('category', 'name slug')
        .populate('submittedBy', 'name'),
      Article.countDocuments(filter),
    ]);

    res.status(200).json({ articles, total, page, limit });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────────
// AUTHENTICATED ROUTES — define /my and /pending
// BEFORE /:slug to prevent param conflict
// ─────────────────────────────────────────────

// GET /api/articles/my — logged-in user, own articles
router.get('/my', auth, async (req, res) => {
  try {
    const articles = await Article.find({ submittedBy: req.user.userId })
      .sort({ createdAt: -1 })
      .populate('category', 'name slug');
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/articles/pending — admin only
router.get('/pending', auth, role('admin'), async (req, res) => {
  try {
    const articles = await Article.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .populate('category', 'name slug')
      .populate('submittedBy', 'name email');
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────────
// ARTICLE CREATION
// ─────────────────────────────────────────────

// POST /api/articles — any logged-in user
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, coverImage, category, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'title and content are required' });
    }

    const slug = await generateUniqueSlug(title);

    const article = new Article({
      title,
      slug,
      content,
      coverImage,
      category,
      tags,
      status: 'pending',
      submittedBy: req.user.userId,
    });

    await article.save();
    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────────
// ADMIN APPROVE / REJECT — defined before /:id
// to avoid param conflict on two-segment paths
// ─────────────────────────────────────────────

// PUT /api/articles/:id/approve — admin only
router.put('/:id/approve', auth, role('admin'), async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { status: 'published', publishedAt: new Date(), updatedAt: new Date() },
      { new: true }
    );
    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.status(200).json(article);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/articles/:id/reject — admin only
router.put('/:id/reject', auth, role('admin'), async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', updatedAt: new Date() },
      { new: true }
    );
    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.status(200).json(article);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/articles/:id/submit — owner or admin, moves draft -> pending
router.put('/:id/submit', auth, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found' });

    const isAdmin = req.user.role === 'admin';
    const isOwner = article.submittedBy.toString() === req.user.userId;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        message: 'You can only submit your own articles',
      });
    }

    if (article.status !== 'draft') {
      return res.status(400).json({
        message: 'Only draft articles can be submitted',
      });
    }

    article.status = 'pending';
    article.updatedAt = new Date();
    await article.save();

    res.status(200).json(article);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────────
// EDIT / DELETE BY ID
// ─────────────────────────────────────────────

// PUT /api/articles/:id — owner (if draft/pending) or admin (any status)
router.put('/:id', auth, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found' });

    const isAdmin = req.user.role === 'admin';
    const isOwner = article.submittedBy.toString() === req.user.userId;
    const isEditable = ['draft', 'pending'].includes(article.status);

    if (!isAdmin && (!isOwner || !isEditable)) {
      return res.status(403).json({
        message: 'You can only edit your own articles with status draft or pending',
      });
    }

    const { title, content, coverImage, category, tags } = req.body;
    const updateData = { updatedAt: new Date() };

    if (title) {
      updateData.title = title;
      // Re-generate slug only if title changes and it's truly different
      const newSlug = await generateUniqueSlug(title);
      updateData.slug = newSlug;
    }
    if (content !== undefined) updateData.content = content;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;

    const updated = await Article.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/articles/:id — admin OR owner (if draft/pending)
router.delete('/:id', auth, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found' });

    const isAdmin = req.user.role === 'admin';
    const isOwner = article.submittedBy.toString() === req.user.userId;
    const isEditable = ['draft', 'pending'].includes(article.status);

    if (!isAdmin && (!isOwner || !isEditable)) {
      return res.status(403).json({
        message: 'You can only delete your own articles with status draft or pending',
      });
    }

    await Article.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────────
// PUBLIC SINGLE ARTICLE — must be LAST among GET routes
// ─────────────────────────────────────────────

// GET /api/articles/:slug — public, published only
router.get('/:slug', async (req, res) => {
  try {
    const article = await Article.findOne({
      slug: req.params.slug,
      status: 'published',
    })
      .populate('category', 'name slug')
      .populate('submittedBy', 'name');

    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.status(200).json(article);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
