const express = require('express');
const Category = require('../models/Category');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

// Simple slugify — no extra packages needed
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s]+/g, '-')       // spaces → hyphens
    .replace(/[^\w-]+/g, '')      // remove non-word chars
    .replace(/--+/g, '-');        // collapse multiple hyphens

// GET /api/categories — public
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/categories — admin only
router.post('/', auth, role('admin'), async (req, res) => {
  try {
    const { name, slug } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'name is required' });
    }

    const generatedSlug = slug ? slugify(slug) : slugify(name);

    const existing = await Category.findOne({ slug: generatedSlug });
    if (existing) {
      return res.status(400).json({ message: 'A category with this slug already exists' });
    }

    const category = new Category({ name, slug: generatedSlug });
    await category.save();

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/categories/:id — admin only
router.put('/:id', auth, role('admin'), async (req, res) => {
  try {
    const { name, slug } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (slug) updateData.slug = slugify(slug);
    else if (name) updateData.slug = slugify(name);

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/categories/:id — admin only
router.delete('/:id', auth, role('admin'), async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
