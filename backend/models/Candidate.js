const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  country: String,
  state: String,
  city: String
});

const CandidateSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  currentLocation: LocationSchema,
  preferredLocations: [LocationSchema],
  experience: [{ company: String, position: String, role: String, ctc: String, start: String, end: String }],
  skills: [String],
  education: [{ clg: String, course: String, start: String, end: String }],
  certifications: [{ name: String, organization: String, link: String }],
  linkedin: String,
  x: String,
  additionalLinks: [{ name: String, link: String }],
  talentPools: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TalentPool'
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
});

module.exports = mongoose.model('Candidate', CandidateSchema);
