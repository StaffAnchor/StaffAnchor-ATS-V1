const mongoose = require('mongoose');

const candidateStatusSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  clientSideStatus: {
    type: String,
    enum: [
      'Interview Scheduled',
      'Interview Completed',
      'Awaiting Feedback',
      'Feedback Received',
      'Shortlisted',
      'Rejected',
      'On Hold',
      'Offered',
      'Offer Accepted',
      'Offer Declined',
      'Joined',
      'No Show'
    ],
    default: 'Interview Scheduled'
  },
  notes: String,
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const phaseSchema = new mongoose.Schema({
  phaseNumber: {
    type: Number,
    required: true,
    min: 0
  },
  phaseName: {
    type: String,
    required: true,
    default: function() {
      return `Phase ${this.phaseNumber}`;
    }
  },
  candidates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  }],
  type: {
    type: String,
    required: true,
    enum: ['Video Interview', 'Call Interview', 'Onsite Interview', 'Online Test', 'Offline Test', 'Custom']
  },
  customFields: [{
    key: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    }
  }],
  status: {
    type: String,
    default: 'Active',
    enum: ['Active', 'Completed', 'On Hold', 'Cancelled']
  },
  notes: String,
  scheduledDate: Date,
  completedDate: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

const workflowSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  jobTitle: {
    type: String,
    required: true
  },
  organization: {
    type: String,
    required: true
  },
  phases: [phaseSchema],
  candidateStatuses: [candidateStatusSchema],
  status: {
    type: String,
    default: 'Active',
    enum: ['Active', 'Completed', 'On Hold', 'Cancelled']
  },
  totalCandidates: {
    type: Number,
    default: 0
  },
  activePhase: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  description: String
}, { timestamps: true });

// Index for efficient queries
workflowSchema.index({ jobId: 1, status: 1 });
workflowSchema.index({ createdBy: 1 });
workflowSchema.index({ status: 1, activePhase: 1 });

module.exports = mongoose.model('Workflow', workflowSchema);


