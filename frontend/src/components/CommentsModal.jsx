import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  IconButton,
  CircularProgress,
  Paper,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

const CommentsModal = ({ open, onClose, candidateId, candidateName, currentUserId, userAccessLevel }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (open && candidateId) {
      fetchComments();
    }
  }, [open, candidateId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt');
      const response = await axios.get(`https://staffanchor-ats-v1.onrender.com/api/comments/candidate/${candidateId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('jwt');
      const response = await axios.post(
        `https://staffanchor-ats-v1.onrender.com/api/comments/candidate/${candidateId}`,
        { text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments([response.data, ...comments]);
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editText.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      const token = localStorage.getItem('jwt');
      const response = await axios.put(
        `https://staffanchor-ats-v1.onrender.com/api/comments/${commentId}`,
        { text: editText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(comments.map(c => c._id === commentId ? response.data : c));
      setEditingCommentId(null);
      setEditText('');
      toast.success('Comment updated successfully');
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const token = localStorage.getItem('jwt');
      await axios.delete(`https://staffanchor-ats-v1.onrender.com/api/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(comments.filter(c => c._id !== commentId));
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={(e, reason) => {
        if (e) e.stopPropagation();
        onClose();
      }}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #1a1a2e 0%, #232946 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle
        sx={{
          color: '#f5f7fa',
          fontWeight: 600,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #232946 0%, #1a1a2e 100%)',
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#eebbc3' }}>
            Comments
          </Typography>
          <Typography variant="body2" sx={{ color: '#b8c5d6', mt: 0.5 }}>
            {candidateName}
          </Typography>
        </Box>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          sx={{
            color: '#b8c5d6',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Add Comment Section */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={submitting}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#f5f7fa',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.4)' },
                '&.Mui-focused fieldset': { borderColor: '#eebbc3' },
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
              }
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={handleAddComment}
              disabled={submitting || !newComment.trim()}
              sx={{
                backgroundColor: '#eebbc3',
                color: '#1a1a2e',
                fontWeight: 600,
                '&:hover': { backgroundColor: '#d4a5ad' },
                '&:disabled': {
                  backgroundColor: 'rgba(238, 187, 195, 0.3)',
                  color: 'rgba(26, 26, 46, 0.5)',
                }
              }}
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', mb: 2 }} />

        {/* Comments List */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: '#eebbc3' }} />
          </Box>
        ) : comments.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" sx={{ color: '#b8c5d6' }}>
              No comments yet. Be the first to comment!
            </Typography>
          </Box>
        ) : (
          <Box sx={{ maxHeight: '50vh', overflow: 'auto' }}>
            {comments.map((comment) => (
              <Paper
                key={comment._id}
                sx={{
                  p: 2,
                  mb: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon sx={{ color: '#4f8cff', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#f5f7fa', fontWeight: 600 }}>
                        {comment.authorName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#7a8a9e' }}>
                        {formatDate(comment.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {(comment.author._id === currentUserId || userAccessLevel === 2) && (
                    <Box>
                      {comment.author._id === currentUserId && (
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditingCommentId(comment._id);
                              setEditText(comment.text);
                            }}
                            sx={{ color: '#4f8cff', mr: 0.5 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteComment(comment._id)}
                          sx={{ color: '#ff6b6b' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </Box>

                {editingCommentId === comment._id ? (
                  <Box>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      sx={{
                        mb: 1,
                        '& .MuiOutlinedInput-root': {
                          color: '#f5f7fa',
                          '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                          '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.4)' },
                          '&.Mui-focused fieldset': { borderColor: '#eebbc3' },
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        }
                      }}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleUpdateComment(comment._id)}
                        sx={{
                          backgroundColor: '#4f8cff',
                          '&:hover': { backgroundColor: '#3d7be8' }
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditText('');
                        }}
                        sx={{
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          color: '#b8c5d6'
                        }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ color: '#b8c5d6', whiteSpace: 'pre-wrap' }}>
                    {comment.text}
                  </Typography>
                )}
              </Paper>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          variant="outlined"
          sx={{
            color: '#b8c5d6',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            '&:hover': {
              borderColor: '#eebbc3',
              backgroundColor: 'rgba(238, 187, 195, 0.1)',
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CommentsModal;

