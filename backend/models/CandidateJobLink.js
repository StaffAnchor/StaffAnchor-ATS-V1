const mongoose = require('mongoose');

const CandidateJobLinkSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  source: {
    type: String,
    enum: ['ai-suggested', 'applied-through-link', 'added-by-recruiter', 'manual-link'],
    required: true
  },
  linkedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: [
      'New',
      'Applied',
      'Pre screening',
      'Stage 2 screening',
      'Submitted',
      'Interview',
      'Offered',
      'Offer Rejected',
      'Offer Accepted',
      'Hired',
      'Rejected',
      'Not able to contact',
      'Candidate Not interested',
      // Legacy statuses for backward compatibility
      'active',
      'rejected',
      'shortlisted',
      'hired'
    ],
    default: 'New'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Create compound index to prevent duplicate links
CandidateJobLinkSchema.index({ candidateId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model('CandidateJobLink', CandidateJobLinkSchema);

