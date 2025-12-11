import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Paper,
  Divider
} from '@mui/material';
import {
  Business as BusinessIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';

const CompanyNameVisibilityModal = ({ open, onClose, onConfirm, jobId, organizationName, recruiterId }) => {
  const [showCompanyName, setShowCompanyName] = useState('show');
  const [alternateName, setAlternateName] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    // Validation
    if (showCompanyName === 'hide' && !alternateName.trim()) {
      setError('Please provide an alternate company name');
      return;
    }

    // Reset error
    setError('');

    // Build the shareable URL with recruiter tracking
    const baseUrl = `${window.location.origin}/apply/${jobId}`;
    const params = new URLSearchParams();
    
    // Always add recruiter ID for tracking
    if (recruiterId) {
      params.append('ref', recruiterId);
    }
    
    if (showCompanyName === 'hide') {
      params.append('hideCompany', 'true');
      params.append('altName', alternateName.trim());
    }
    
    const queryString = params.toString();
    const shareableUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

    // Copy to clipboard
    navigator.clipboard.writeText(shareableUrl).then(() => {
      onConfirm(shareableUrl);
      handleClose();
    }).catch((err) => {
      console.error('Failed to copy link:', err);
      setError('Failed to copy link to clipboard');
    });
  };

  const handleClose = () => {
    // Reset state
    setShowCompanyName('show');
    setAlternateName('');
    setError('');
    onClose();
  };

  const handleOptionChange = (event) => {
    setShowCompanyName(event.target.value);
    setError('');
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
      maxWidth="sm"
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
        gap: 1.5,
        color: '#1e293b',
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <BusinessIcon sx={{ color: '#4caf50', fontSize: 28 }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Configure Shareable Link
        </Typography>
      </DialogTitle>

      <Divider sx={{ borderColor: '#e2e8f0' }} />

      <DialogContent sx={{ pt: 3, pb: 2, background: '#ffffff' }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 2, fontSize: '0.95rem' }}>
            Choose how the company name should appear in the public job application form:
          </Typography>

          <Paper sx={{ 
            p: 2, 
            mb: 2,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 1.5
          }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
              Current Organization
            </Typography>
            <Typography variant="body1" sx={{ 
              color: '#1e293b', 
              fontWeight: 600,
              mt: 0.5 
            }}>
              {organizationName}
            </Typography>
          </Paper>

          <RadioGroup
            value={showCompanyName}
            onChange={handleOptionChange}
          >
            <Paper 
              onClick={(e) => {
                e.stopPropagation();
                setShowCompanyName('show');
                setError('');
              }}
              sx={{ 
                p: 2, 
                mb: 2,
                background: showCompanyName === 'show' 
                  ? 'rgba(76, 175, 80, 0.08)' 
                  : '#ffffff',
                border: `2px solid ${
                  showCompanyName === 'show' 
                    ? '#4caf50' 
                    : '#e2e8f0'
                }`,
                borderRadius: 1.5,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: showCompanyName === 'show' 
                    ? 'rgba(76, 175, 80, 0.12)' 
                    : '#f8fafc',
                  borderColor: showCompanyName === 'show' 
                    ? '#4caf50' 
                    : '#cbd5e1'
                }
              }}
            >
              <FormControlLabel
                value="show"
                control={
                  <Radio 
                    sx={{ 
                      color: '#94a3b8',
                      '&.Mui-checked': { color: '#4caf50' }
                    }} 
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VisibilityIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body1" sx={{ 
                        color: '#1e293b', 
                        fontWeight: 500 
                      }}>
                        Show Company Name
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: '#64748b',
                        display: 'block',
                        mt: 0.5
                      }}>
                        Display the actual organization name in the application form
                      </Typography>
                    </Box>
                  </Box>
                }
                sx={{ m: 0, width: '100%' }}
              />
            </Paper>

            <Paper 
              onClick={(e) => {
                e.stopPropagation();
                setShowCompanyName('hide');
                setError('');
              }}
              sx={{ 
                p: 2,
                background: showCompanyName === 'hide' 
                  ? 'rgba(76, 175, 80, 0.08)' 
                  : '#ffffff',
                border: `2px solid ${
                  showCompanyName === 'hide' 
                    ? '#4caf50' 
                    : '#e2e8f0'
                }`,
                borderRadius: 1.5,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: showCompanyName === 'hide' 
                    ? 'rgba(76, 175, 80, 0.12)' 
                    : '#f8fafc',
                  borderColor: showCompanyName === 'hide' 
                    ? '#4caf50' 
                    : '#cbd5e1'
                }
              }}
            >
              <FormControlLabel
                value="hide"
                control={
                  <Radio 
                    sx={{ 
                      color: '#94a3b8',
                      '&.Mui-checked': { color: '#4caf50' }
                    }} 
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VisibilityOffIcon sx={{ color: '#ff9800', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body1" sx={{ 
                        color: '#1e293b', 
                        fontWeight: 500 
                      }}>
                        Hide Company Name
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: '#64748b',
                        display: 'block',
                        mt: 0.5
                      }}>
                        Use an alternate name to maintain confidentiality
                      </Typography>
                    </Box>
                  </Box>
                }
                sx={{ m: 0, width: '100%' }}
              />
            </Paper>
          </RadioGroup>

          {showCompanyName === 'hide' && (
            <Box sx={{ 
              mt: 3,
              animation: 'fadeIn 0.3s ease-in',
              '@keyframes fadeIn': {
                from: { opacity: 0, transform: 'translateY(-10px)' },
                to: { opacity: 1, transform: 'translateY(0)' }
              }
            }}>
              <Typography variant="body2" sx={{ 
                color: '#334155', 
                mb: 1.5,
                fontWeight: 500
              }}>
                Provide an Alternate Company Name
              </Typography>
              <TextField
                fullWidth
                placeholder="e.g., Leading EdTech Firm, Renowned Technology Company"
                value={alternateName}
                onChange={(e) => {
                  setAlternateName(e.target.value);
                  setError('');
                }}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
                error={!!error}
                helperText={error || 'This name will be displayed instead of the actual company name'}
                autoFocus
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#ffffff',
                    borderRadius: 1.5,
                    '& fieldset': { 
                      borderColor: '#cbd5e1' 
                    },
                    '&:hover fieldset': { 
                      borderColor: '#94a3b8' 
                    },
                    '&.Mui-focused fieldset': { 
                      borderColor: '#4caf50',
                      borderWidth: '2px'
                    }
                  },
                  '& .MuiInputBase-input': { 
                    color: '#1e293b' 
                  },
                  '& .MuiFormHelperText-root': { 
                    color: error ? '#ef4444' : '#64748b',
                    fontSize: '0.75rem'
                  }
                }}
              />
            </Box>
          )}
        </Box>
      </DialogContent>

      <Divider sx={{ borderColor: '#e2e8f0' }} />

      <DialogActions sx={{ p: 2.5, gap: 1.5, background: '#f8fafc' }}>
        <Button
          onClick={handleClose}
          variant="outlined"
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
          onClick={handleConfirm}
          variant="contained"
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
            }
          }}
        >
          Copy Shareable Link
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CompanyNameVisibilityModal;

