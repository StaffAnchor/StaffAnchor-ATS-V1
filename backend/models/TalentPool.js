const mongoose = require('mongoose');

const TalentPoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  domain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domain'
  },
  organization: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  candidates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate'
  }]
}, {
  timestamps: true
});

// Compound index to ensure unique talent pool names within a domain
TalentPoolSchema.index({ name: 1, domain: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('TalentPool', TalentPoolSchema);
