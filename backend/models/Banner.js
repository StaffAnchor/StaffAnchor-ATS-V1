const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Method to check if banner is currently active
bannerSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  return this.isActive && now >= this.startTime && now <= this.endTime;
};

module.exports = mongoose.model('Banner', bannerSchema);















