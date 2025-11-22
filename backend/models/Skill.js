const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  talentPool: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TalentPool'
  },
  // Legacy field - kept for backward compatibility
  category: {
    type: String,
    enum: [
      'sales-and-business-development',
      'marketing-communications',
      'technology-engineering',
      'finance-accounting-audit',
      'human-resources',
      'operations-supply-chain-procurement',
      'product-management-design',
      'data-analytics-insights',
      'customer-success-support',
      'legal-risk-compliance',
      'manufacturing-projects-quality',
      'general-management-strategy',
      'miscellaneous'
    ],
    default: 'miscellaneous'
  },
  organization: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isCustom: {
    type: Boolean,
    default: false
  },
  usageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for unique skills per talent pool
SkillSchema.index({ name: 1, talentPool: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Skill', SkillSchema);
