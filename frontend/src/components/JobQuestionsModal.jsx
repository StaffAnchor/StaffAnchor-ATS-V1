import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Paper,
  Divider,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  QuestionAnswer as QuestionAnswerIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_URL from '../config/api';

const JobQuestionsModal = ({ open, onClose, jobId, onComplete }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    console.log('JobQuestionsModal - open:', open, 'jobId:', jobId);
    if (open && jobId) {
      fetchQuestions();
    }
  }, [open, jobId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt');
      const response = await axios.get(`${API_URL}/api/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.personalizedQuestions && response.data.personalizedQuestions.length > 0) {
        setQuestions(response.data.personalizedQuestions);
      } else {
        setQuestions([{ question: '', answerType: 'text' }]);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestions([{ question: '', answerType: 'text' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { question: '', answerType: 'text' }]);
  };

  const handleRemoveQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const handleSave = async () => {
    // Validate questions
    const validQuestions = questions.filter(q => q.question.trim() !== '');
    if (validQuestions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    // Check for empty questions
    const hasEmptyQuestion = questions.some(q => q.question.trim() === '');
    if (hasEmptyQuestion) {
      toast.error('Please fill in all questions or remove empty ones');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('jwt');
      await axios.put(
        `${API_URL}/api/jobs/${jobId}`,
        { personalizedQuestions: validQuestions },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Questions saved successfully');
      onComplete(validQuestions);
    } catch (error) {
      console.error('Error saving questions:', error);
      toast.error('Failed to save questions');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setQuestions([{ question: '', answerType: 'text' }]);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        // Only close on backdrop click or escape key, not on other events
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
          handleClose();
        }
      }}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          background: '#ffffff',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
        }
      }}
    >
      <DialogTitle sx={{
        pb: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: '#1e293b',
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <QuestionAnswerIcon sx={{ color: '#4caf50', fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Add Personalized Questions for the Job
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          sx={{
            color: '#64748b',
            '&:hover': {
              backgroundColor: '#f1f5f9'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider sx={{ borderColor: '#e2e8f0' }} />

      <DialogContent sx={{ pt: 3, pb: 2, background: '#ffffff' }} onClick={(e) => e.stopPropagation()}>
        <Typography variant="body2" sx={{ color: '#64748b', mb: 3, fontSize: '0.95rem' }}>
          Add custom questions that candidates must answer when applying for this job. These questions will appear as required fields in the application form.
        </Typography>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" sx={{ color: '#64748b' }}>Loading questions...</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {questions.map((q, index) => (
              <Paper
                key={index}
                onClick={(e) => e.stopPropagation()}
                sx={{
                  p: 2,
                  border: '1px solid #e2e8f0',
                  borderRadius: 1.5,
                  background: '#ffffff'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#1e293b', fontWeight: 600 }}>
                    Question {index + 1}
                  </Typography>
                  {questions.length > 1 && (
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveQuestion(index);
                      }}
                      size="small"
                      sx={{
                        color: '#f44336',
                        '&:hover': {
                          backgroundColor: 'rgba(244, 67, 54, 0.1)'
                        }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>

                <TextField
                  fullWidth
                  label="Question"
                  placeholder="e.g., Why are you interested in this position?"
                  value={q.question}
                  onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#ffffff',
                      '& fieldset': { borderColor: '#cbd5e1' },
                      '&:hover fieldset': { borderColor: '#94a3b8' },
                      '&.Mui-focused fieldset': { borderColor: '#4caf50' }
                    }
                  }}
                />

                <FormControl fullWidth>
                  <InputLabel>Answer Type</InputLabel>
                  <Select
                    value={q.answerType}
                    onChange={(e) => handleQuestionChange(index, 'answerType', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    label="Answer Type"
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#cbd5e1'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#94a3b8'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#4caf50'
                      }
                    }}
                    MenuProps={{
                      onClick: (e) => e.stopPropagation()
                    }}
                  >
                    <MenuItem value="text" onClick={(e) => e.stopPropagation()}>Text</MenuItem>
                    <MenuItem value="number" onClick={(e) => e.stopPropagation()}>Number</MenuItem>
                    <MenuItem value="true-false" onClick={(e) => e.stopPropagation()}>True/False</MenuItem>
                  </Select>
                </FormControl>
              </Paper>
            ))}

            <Button
              startIcon={<AddIcon />}
              onClick={(e) => {
                e.stopPropagation();
                handleAddQuestion();
              }}
              variant="outlined"
              sx={{
                borderColor: '#4caf50',
                color: '#4caf50',
                '&:hover': {
                  borderColor: '#45a049',
                  backgroundColor: 'rgba(76, 175, 80, 0.08)'
                }
              }}
            >
              Add Another Question
            </Button>
          </Box>
        )}
      </DialogContent>

      <Divider sx={{ borderColor: '#e2e8f0' }} />

      <DialogActions sx={{ p: 2.5, gap: 1.5, background: '#f8fafc' }} onClick={(e) => e.stopPropagation()}>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          variant="outlined"
          disabled={saving}
          sx={{
            borderColor: '#cbd5e1',
            color: '#64748b',
            '&:hover': {
              borderColor: '#94a3b8',
              backgroundColor: '#f1f5f9'
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleSave();
          }}
          variant="contained"
          disabled={saving}
          sx={{
            backgroundColor: '#4caf50',
            color: '#fff',
            fontWeight: 600,
            px: 3,
            textTransform: 'none',
            boxShadow: '0 2px 8px rgba(76, 175, 80, 0.25)',
            '&:hover': {
              backgroundColor: '#45a049',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.35)'
            },
            '&:disabled': {
              backgroundColor: '#ccc',
              color: '#888'
            }
          }}
        >
          {saving ? 'Saving...' : 'Save & Generate Link'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JobQuestionsModal;

