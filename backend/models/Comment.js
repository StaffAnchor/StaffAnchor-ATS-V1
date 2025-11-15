const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true,
    index: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  authorEmail: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
CommentSchema.index({ candidateId: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', CommentSchema);

