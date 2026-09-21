const express = require('express');
const ReporterApplication = require('../models/ReporterApplication');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

// POST /api/reporter-applications — public, submit application
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, city, message } = req.body;

    if (!name || !email || !phone || !city) {
      return res.status(400).json({
        message: 'Name, email, phone number, and city are required fields.',
      });
    }

    const application = new ReporterApplication({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      city: city.trim(),
      message: message ? message.trim() : '',
      status: 'new',
    });

    await application.save();

    res.status(201).json({
      message: 'Application submitted successfully',
      application,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/reporter-applications — admin only, list applications
router.get('/', auth, role('admin'), async (req, res) => {
  try {
    const filter = {};
    if (req.query.status && ['new', 'reviewed', 'contacted'].includes(req.query.status)) {
      filter.status = req.query.status;
    }

    const applications = await ReporterApplication.find(filter).sort({ createdAt: -1 });
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/reporter-applications/:id/status — admin only, update status
router.put('/:id/status', auth, role('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['new', 'reviewed', 'contacted'];

    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${allowed.join(', ')}`,
      });
    }

    const application = await ReporterApplication.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.status(200).json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/reporter-applications/:id — admin only, delete application
router.delete('/:id', auth, role('admin'), async (req, res) => {
  try {
    const application = await ReporterApplication.findByIdAndDelete(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.status(200).json({ message: 'Application deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
