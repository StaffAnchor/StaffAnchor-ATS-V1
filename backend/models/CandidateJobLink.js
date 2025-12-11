const mongoose = require('mongoose');

// Schema for tracking status change history
const StatusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  changedAt: {
    type: Date,
    default: Date.now
  },
  notes: String
}, { _id: false });

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
      'Pre-screening',
      'Stage 2 Screening',
      'Shortlisted (Internal)',
      'Not Reachable',
      'Candidate Not Interested',
      'Rejected (Internal)',
      'Submitted to Client',
      // Legacy statuses for backward compatibility
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
      'active',
      'rejected',
      'shortlisted',
      'hired'
    ],
    default: 'New'
  },
  // Track who last changed the status
  statusChangedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  statusChangedAt: {
    type: Date
  },
  // Track who submitted to client
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  submittedAt: {
    type: Date
  },
  // Track which recruiter shared the application link (for applied-through-link source)
  sharedByRecruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Status change history for audit trail
  statusHistory: [StatusHistorySchema],
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

