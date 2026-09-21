const express = require('express');
const multer = require('multer');
const { Readable } = require('stream');
const cloudinary = require('../config/cloudinary');
const Epaper = require('../models/Epaper');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

// Memory storage for PDF uploads (supports up to 50MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

// Helper to stream upload buffer to Cloudinary as raw PDF
const uploadPdfToCloudinary = (buffer, originalname) =>
  new Promise((resolve, reject) => {
    const cleanName = (originalname || 'edition').replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const publicId = `epaper_${Date.now()}_${cleanName}.pdf`;

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'janta-first/epaper',
        resource_type: 'raw',
        public_id: publicId,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });

// ─────────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────────

// GET /api/epaper/latest — most recent edition (defined before /:id)
router.get('/latest', async (req, res) => {
  try {
    const latest = await Epaper.findOne()
      .sort({ date: -1, createdAt: -1 })
      .populate('uploadedBy', 'name');

    if (!latest) {
      return res.status(404).json({ message: 'No e-paper editions found' });
    }
    res.status(200).json(latest);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/epaper — all editions sorted by date desc
router.get('/', async (req, res) => {
  try {
    const epapers = await Epaper.find()
      .sort({ date: -1, createdAt: -1 })
      .populate('uploadedBy', 'name');
    res.status(200).json(epapers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────────
// ADMIN ROUTES
// ─────────────────────────────────────────────

// POST /api/epaper — upload new edition (admin only)
router.post('/', auth, role('admin'), upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'A PDF file is required (field name: "pdf")' });
    }

    const isPdf =
      req.file.mimetype === 'application/pdf' ||
      req.file.originalname.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      return res.status(400).json({ message: 'Only PDF files are allowed' });
    }

    const title = req.body.title?.trim() || `ई-पेपर संस्करण (${new Date().toLocaleDateString('hi-IN')})`;
    const editionDate = req.body.date ? new Date(req.body.date) : new Date();

    const uploadResult = await uploadPdfToCloudinary(req.file.buffer, req.file.originalname);

    const epaper = new Epaper({
      title,
      pdfUrl: uploadResult.secure_url,
      date: editionDate,
      uploadedBy: req.user.userId,
    });

    await epaper.save();
    res.status(201).json(epaper);
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload e-paper', error: error.message });
  }
});

// DELETE /api/epaper/:id — delete edition (admin only)
router.delete('/:id', auth, role('admin'), async (req, res) => {
  try {
    const epaper = await Epaper.findById(req.params.id);
    if (!epaper) {
      return res.status(404).json({ message: 'E-paper edition not found' });
    }

    // Attempt to remove from Cloudinary
    try {
      if (epaper.pdfUrl) {
        const parts = epaper.pdfUrl.split('/upload/');
        if (parts[1]) {
          const rawPath = parts[1].replace(/^v\d+\//, '');
          await cloudinary.uploader.destroy(rawPath, { resource_type: 'raw' });
        }
      }
    } catch (cldErr) {
      console.warn('Cloudinary delete warning:', cldErr.message);
    }

    await Epaper.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'E-paper edition deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
