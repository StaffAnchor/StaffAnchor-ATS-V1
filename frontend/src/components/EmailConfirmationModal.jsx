import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  TextField,
  IconButton,
  Collapse
} from '@mui/material';
import {
  Email as EmailIcon,
  Close as CloseIcon,
  Send as SendIcon,
  Preview as PreviewIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Person as PersonIcon
} from '@mui/icons-material';

const EmailConfirmationModal = ({ open, onClose, emailData, onConfirm }) => {
  const [selectedRecipients, setSelectedRecipients] = useState(
    emailData?.recipients || []
  );
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [additionalEmail, setAdditionalEmail] = useState('');

  // Update selected recipients when emailData changes
  React.useEffect(() => {
    if (emailData?.recipients) {
      setSelectedRecipients(emailData.recipients);
    }
  }, [emailData]);

  const handleToggleRecipient = (email) => {
    setSelectedRecipients(prev => {
      if (prev.includes(email)) {
        return prev.filter(e => e !== email);
      } else {
        return [...prev, email];
      }
    });
  };

  const handleAddEmail = () => {
    const email = additionalEmail.trim();
    if (email && !selectedRecipients.includes(email)) {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(email)) {
        setSelectedRecipients(prev => [...prev, email]);
        setAdditionalEmail('');
        setError('');
      } else {
        setError('Please enter a valid email address');
      }
    }
  };

  const handleRemoveEmail = (email) => {
    setSelectedRecipients(prev => prev.filter(e => e !== email));
  };

  const handleSend = async () => {
    if (selectedRecipients.length === 0) {
      setError('Please select at least one recipient');
      return;
    }

    setSending(true);
    setError('');

    try {
      await onConfirm(selectedRecipients);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const handleCancel = () => {
    setSelectedRecipients(emailData?.recipients || []);
    setAdditionalEmail('');
    setError('');
    setShowPreview(false);
    onClose();
  };

  if (!emailData) return null;

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #1a1a2e 0%, #232946 100%)',
          borderRadius: 2,
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }
      }}
    >
      <DialogTitle sx={{
        background: 'linear-gradient(135deg, #4f8cff 0%, #3d7be8 100%)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmailIcon />
          <Typography variant="h6">Confirm Email Notification</Typography>
        </Box>
        <IconButton onClick={handleCancel} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Email Subject */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ color: '#90caf9', fontWeight: 600, mb: 1 }}>
            Subject:
          </Typography>
          <Typography variant="body1" sx={{ color: '#f5f7fa', fontWeight: 500 }}>
            {emailData.subject}
          </Typography>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', mb: 3 }} />

        {/* Recipients Selection */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ color: '#90caf9', fontWeight: 600, mb: 2 }}>
            Recipients ({selectedRecipients.length}):
          </Typography>
          
          {/* Default Recipients */}
          {emailData.recipients && emailData.recipients.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: '#b8c5d6', mb: 1, display: 'block' }}>
                Select recipients to send email:
              </Typography>
              <Stack spacing={1}>
                {emailData.recipients.map((email) => (
                  <FormControlLabel
                    key={email}
                    control={
                      <Checkbox
                        checked={selectedRecipients.includes(email)}
                        onChange={() => handleToggleRecipient(email)}
                        sx={{
                          color: '#4f8cff',
                          '&.Mui-checked': { color: '#4f8cff' }
                        }}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon sx={{ fontSize: 16, color: '#90caf9' }} />
                        <Typography sx={{ color: '#f5f7fa' }}>{email}</Typography>
                      </Box>
                    }
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* Additional Recipients */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" sx={{ color: '#b8c5d6', mb: 1, display: 'block' }}>
              Add additional recipients:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                size="small"
                placeholder="email@example.com"
                value={additionalEmail}
                onChange={(e) => setAdditionalEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
                fullWidth
                sx={{
                  '& .MuiInputBase-input': { color: '#f5f7fa' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(79, 140, 255, 0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#4f8cff' }
                  }
                }}
              />
              <Button
                variant="outlined"
                onClick={handleAddEmail}
                sx={{
                  borderColor: '#4f8cff',
                  color: '#4f8cff',
                  '&:hover': {
                    borderColor: '#4f8cff',
                    backgroundColor: 'rgba(79, 140, 255, 0.1)'
                  }
                }}
              >
                Add
              </Button>
            </Box>

            {/* Selected Recipients Chips */}
            {selectedRecipients.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {selectedRecipients.map((email) => (
                  <Chip
                    key={email}
                    label={email}
                    onDelete={() => handleRemoveEmail(email)}
                    sx={{
                      backgroundColor: 'rgba(79, 140, 255, 0.2)',
                      color: '#4f8cff',
                      '& .MuiChip-deleteIcon': {
                        color: '#4f8cff',
                        '&:hover': { color: '#3d7be8' }
                      }
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', mb: 2 }} />

        {/* Email Preview Toggle */}
        <Box>
          <Button
            startIcon={showPreview ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setShowPreview(!showPreview)}
            sx={{
              color: '#eebbc3',
              '&:hover': { backgroundColor: 'rgba(238, 187, 195, 0.1)' }
            }}
          >
            {showPreview ? 'Hide' : 'Show'} Email Preview
          </Button>

          <Collapse in={showPreview}>
            <Box
              sx={{
                mt: 2,
                p: 2,
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 1,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                maxHeight: '400px',
                overflowY: 'auto'
              }}
            >
              <div dangerouslySetInnerHTML={{ __html: emailData.html }} />
            </Box>
          </Collapse>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={handleCancel}
          disabled={sending}
          sx={{
            color: '#b8c5d6',
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSend}
          disabled={sending || selectedRecipients.length === 0}
          startIcon={sending ? <CircularProgress size={20} /> : <SendIcon />}
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #51cf66 0%, #40c057 100%)',
            color: '#fff',
            '&:hover': {
              background: 'linear-gradient(135deg, #40c057 0%, #37b24d 100%)'
            },
            '&:disabled': {
              background: '#666',
              color: '#ccc'
            }
          }}
        >
          {sending ? 'Sending...' : `Send to ${selectedRecipients.length} recipient${selectedRecipients.length !== 1 ? 's' : ''}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmailConfirmationModal;

