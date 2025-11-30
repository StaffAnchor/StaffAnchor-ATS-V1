const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  country: String,
  state: String,
  city: String
});

const CandidateSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: String,
  currentLocation: LocationSchema,
  preferredLocations: [LocationSchema],
  experience: [{ company: String, position: String, role: String, ctc: String, start: String, end: String }],
  // Legacy skills field (kept for backward compatibility)
  skills: [String],
  education: [{ clg: String, course: String, start: String, end: String }],
  certifications: [{ name: String, organization: String, link: String }],
  linkedin: String,
  x: String,
  additionalLinks: [{ name: String, link: String }],
  // New hierarchical expertise structure
  domain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domain'
  },
  talentPools: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TalentPool'
  }],
  expertiseSkills: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  }],
  appliedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  resume: {
    url: {
      type: String,
      trim: true
    },
    publicId: {
      type: String,
      trim: true
    },
    fileName: {
      type: String,
      trim: true
    },
    fileSize: {
      type: Number
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Candidate', CandidateSchema);
