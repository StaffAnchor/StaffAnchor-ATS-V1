import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ConfirmDialog from './ConfirmDialog';
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
import API_URL from '../config/api';

const CommentsModal = ({ open, onClose, candidateId, candidateName, currentUserId, userAccessLevel }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  useEffect(() => {
    if (open && candidateId) {
      fetchComments();
    }
  }, [open, candidateId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt');
      const response = await axios.get(`${API_URL}/api/comments/candidate/${candidateId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error('Please enter a review');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('jwt');
      const response = await axios.post(
        `${API_URL}/api/comments/candidate/${candidateId}`,
        { text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments([response.data, ...comments]);
      setNewComment('');
      toast.success('Review added successfully');
    } catch (error) {
      console.error('Error adding review:', error);
      toast.error('Failed to add review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editText.trim()) {
      toast.error('Review cannot be empty');
      return;
    }

    try {
      const token = localStorage.getItem('jwt');
      const response = await axios.put(
        `${API_URL}/api/comments/${commentId}`,
        { text: editText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(comments.map(c => c._id === commentId ? response.data : c));
      setEditingCommentId(null);
      setEditText('');
      toast.success('Review updated successfully');
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Failed to update review');
    }
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;

    try {
      const commentId = commentToDelete;
      const token = localStorage.getItem('jwt');
      await axios.delete(`${API_URL}/api/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(comments.filter(c => c._id !== commentId));
      toast.success('Review deleted successfully');
      setCommentToDelete(null);
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const openDeleteConfirm = (commentId) => {
    setCommentToDelete(commentId);
    setShowDeleteConfirm(true);
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
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle
        sx={{
          color: '#1e293b',
          fontWeight: 600,
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#8b5cf6' }}>
            Recruiter Review
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            {candidateName}
          </Typography>
        </Box>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          sx={{
            color: '#64748b',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Add Review Section */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Add your review..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
            disabled={submitting}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#1e293b',
                '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.4)' },
                '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
              }
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={(e) => {
                e.stopPropagation();
                handleAddComment();
              }}
              disabled={submitting || !newComment.trim()}
              sx={{
                backgroundColor: '#8b5cf6',
                color: '#f8fafc',
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

        <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.05)', mb: 2 }} />

        {/* Comments List */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: '#8b5cf6' }} />
          </Box>
        ) : comments.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" sx={{ color: '#64748b' }}>
              No reviews yet. Be the first to add a review!
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
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon sx={{ color: '#2563eb', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#1e293b', fontWeight: 600 }}>
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
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCommentId(comment._id);
                              setEditText(comment.text);
                            }}
                            sx={{ color: '#2563eb', mr: 0.5 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteConfirm(comment._id);
                          }}
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
                      onClick={(e) => e.stopPropagation()}
                      onFocus={(e) => e.stopPropagation()}
                      sx={{
                        mb: 1,
                        '& .MuiOutlinedInput-root': {
                          color: '#1e293b',
                          '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                          '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.4)' },
                          '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        }
                      }}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateComment(comment._id);
                        }}
                        sx={{
                          backgroundColor: '#2563eb',
                          '&:hover': { backgroundColor: '#3d7be8' }
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCommentId(null);
                          setEditText('');
                        }}
                        sx={{
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          color: '#64748b'
                        }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ color: '#64748b', whiteSpace: 'pre-wrap' }}>
                    {comment.text}
                  </Typography>
                )}
              </Paper>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.05)' }}>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          variant="outlined"
          sx={{
            color: '#64748b',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            '&:hover': {
              borderColor: '#8b5cf6',
              backgroundColor: 'rgba(139, 92, 246, 0.08)',
            }
          }}
        >
          Close
        </Button>
      </DialogActions>

      {/* Delete Review Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setCommentToDelete(null);
        }}
        onConfirm={handleDeleteComment}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </Dialog>
  );
};

export default CommentsModal;

