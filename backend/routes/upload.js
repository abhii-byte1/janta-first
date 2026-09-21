const express = require('express');
const multer = require('multer');
const { Readable } = require('stream'); // Node built-in — no extra package
const cloudinary = require('../config/cloudinary');
const auth = require('../middleware/auth');

const router = express.Router();

// Memory storage: file lands in req.file.buffer, never touches disk
const upload = multer({ storage: multer.memoryStorage() });

// Wrap Cloudinary's upload_stream in a Promise so we can await it
const uploadBufferToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'janta-first' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    // Convert Buffer → Readable stream → pipe into Cloudinary
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });

// POST /api/upload — any logged-in user (reporter or admin)
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided (field name: "image")' });
    }

    const result = await uploadBufferToCloudinary(req.file.buffer);
    res.status(200).json({ url: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

module.exports = router;
