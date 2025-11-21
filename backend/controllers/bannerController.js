const Banner = require('../models/Banner');

// Create a new banner (Admin only)
exports.createBanner = async (req, res) => {
  try {
    const { text, startTime, endTime } = req.body;

    // Validate that end time is after start time
    if (new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    const banner = new Banner({
      text,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      createdBy: req.user._id
    });

    await banner.save();
    
    const populatedBanner = await Banner.findById(banner._id).populate('createdBy', 'fullName email');
    
    res.status(201).json(populatedBanner);
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({ error: 'Failed to create banner' });
  }
};

// Get all banners (Admin only)
exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find()
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 });
    
    res.json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
};

// Get active banners (Available to all authenticated users)
exports.getActiveBanners = async (req, res) => {
  try {
    const now = new Date();
    const banners = await Banner.find({
      isActive: true,
      startTime: { $lte: now },
      endTime: { $gte: now }
    }).sort({ createdAt: -1 });
    
    res.json(banners);
  } catch (error) {
    console.error('Error fetching active banners:', error);
    res.status(500).json({ error: 'Failed to fetch active banners' });
  }
};

// Delete a banner (Admin only)
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    
    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    await Banner.findByIdAndDelete(id);
    
    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({ error: 'Failed to delete banner' });
  }
};

// Update banner (Admin only)
exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, startTime, endTime, isActive } = req.body;

    // Validate that end time is after start time if both are provided
    if (startTime && endTime && new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    const updateData = {};
    if (text !== undefined) updateData.text = text;
    if (startTime !== undefined) updateData.startTime = new Date(startTime);
    if (endTime !== undefined) updateData.endTime = new Date(endTime);
    if (isActive !== undefined) updateData.isActive = isActive;

    const banner = await Banner.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'fullName email');

    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    res.json(banner);
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({ error: 'Failed to update banner' });
  }
};

