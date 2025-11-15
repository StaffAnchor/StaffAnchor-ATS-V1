const Comment = require('../models/Comment');
const Candidate = require('../models/Candidate');

// Get all comments for a candidate
exports.getCandidateComments = async (req, res) => {
  try {
    const { candidateId } = req.params;

    const comments = await Comment.find({ candidateId })
      .populate('author', 'fullName email')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

// Add a comment to a candidate
exports.addComment = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    // Verify candidate exists
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const comment = new Comment({
      candidateId,
      text: text.trim(),
      author: req.user._id,
      authorName: req.user.fullName,
      authorEmail: req.user.email
    });

    await comment.save();

    // Populate author details before returning
    await comment.populate('author', 'fullName email');

    res.status(201).json(comment);
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

// Update a comment (only by author)
exports.updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const comment = await Comment.findOne({ 
      _id: commentId, 
      author: req.user._id 
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found or access denied' });
    }

    comment.text = text.trim();
    await comment.save();

    await comment.populate('author', 'fullName email');

    res.json(comment);
  } catch (err) {
    console.error('Error updating comment:', err);
    res.status(500).json({ error: 'Failed to update comment' });
  }
};

// Delete a comment (only by author or admin)
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const query = { _id: commentId };
    
    // Only author or admin can delete
    if (req.user.accessLevel !== 2) {
      query.author = req.user._id;
    }

    const comment = await Comment.findOneAndDelete(query);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found or access denied' });
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};

