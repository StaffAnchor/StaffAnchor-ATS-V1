const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
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
    default: 'sales-and-business-development'
  },
  organization: {
    type: String,
    required: true,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// Compound index for unique skills per organization and faster searches
SkillSchema.index({ name: 1, organization: 1 }, { unique: true });

module.exports = mongoose.model('Skill', SkillSchema);
