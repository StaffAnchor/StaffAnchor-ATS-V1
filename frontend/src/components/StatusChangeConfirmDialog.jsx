import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Box,
  Alert
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

const StatusChangeConfirmDialog = ({ 
  open, 
  onClose, 
  onConfirm, 
  title = 'Confirm Status Change',
  currentStatus,
  newStatus,
  itemName = '',
  itemType = 'item' // 'candidate', 'job', 'client status'
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (open) {
      setConfirmText('');
      setError(false);
    }
  }, [open]);

  const handleConfirm = () => {
    if (confirmText.toLowerCase() === 'confirm') {
      onConfirm();
      setConfirmText('');
      setError(false);
    } else {
      setError(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: 3
        },
        onClick: (e) => e.stopPropagation(),
        onMouseDown: (e) => e.stopPropagation()
      }}
    >
      <DialogTitle sx={{ 
        color: '#1e293b', 
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        pb: 2
      }}>
        <WarningIcon sx={{ color: '#f59e0b', fontSize: 28 }} />
        {title}
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }} onClick={(e) => e.stopPropagation()}>
        <Typography sx={{ color: '#475569', mb: 2 }}>
          Are you sure you want to change the status of {itemType === 'candidate' ? 'this candidate' : itemType === 'job' ? 'this job' : 'this item'}?
        </Typography>
        
        {itemName && (
          <Box sx={{ 
            p: 2, 
            backgroundColor: 'rgba(139, 92, 246, 0.08)', 
            borderRadius: 2,
            mb: 2
          }}>
            <Typography sx={{ color: '#8b5cf6', fontWeight: 600 }}>
              {itemName}
            </Typography>
          </Box>
        )}

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          p: 2,
          backgroundColor: 'rgba(0, 0, 0, 0.03)',
          borderRadius: 2,
          mb: 3
        }}>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>
              Current Status
            </Typography>
            <Typography sx={{ color: '#1e293b', fontWeight: 600 }}>
              {currentStatus || 'N/A'}
            </Typography>
          </Box>
          <Typography sx={{ color: '#64748b', fontSize: '1.5rem' }}>→</Typography>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>
              New Status
            </Typography>
            <Typography sx={{ color: '#8b5cf6', fontWeight: 600 }}>
              {newStatus || 'N/A'}
            </Typography>
          </Box>
        </Box>

        <Alert 
          severity="info" 
          sx={{ 
            mb: 2,
            backgroundColor: 'rgba(37, 99, 235, 0.08)',
            '& .MuiAlert-icon': { color: '#2563eb' }
          }}
        >
          <Typography variant="body2" sx={{ color: '#1e3a5f' }}>
            The changes are being tracked in analytics.
          </Typography>
        </Alert>

        <Typography sx={{ color: '#475569', mb: 1.5, fontWeight: 500 }}>
          Type <strong>"Confirm"</strong> to proceed:
        </Typography>
        
        <TextField
          fullWidth
          value={confirmText}
          onChange={(e) => {
            setConfirmText(e.target.value);
            setError(false);
          }}
          onKeyPress={handleKeyPress}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onFocus={(e) => e.stopPropagation()}
          placeholder="Type Confirm here..."
          error={error}
          helperText={error ? 'Please type "Confirm" exactly to proceed' : ''}
          autoFocus
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: error ? '#ef4444' : 'rgba(0, 0, 0, 0.15)' },
              '&:hover fieldset': { borderColor: error ? '#ef4444' : '#8b5cf6' },
              '&.Mui-focused fieldset': { borderColor: error ? '#ef4444' : '#8b5cf6' },
            },
            '& .MuiInputBase-input': { color: '#1e293b' }
          }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2.5, borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
        <Button
          onClick={onClose}
          sx={{
            color: '#64748b',
            fontWeight: 600,
            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.05)' }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={confirmText.toLowerCase() !== 'confirm'}
          sx={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            color: '#fff',
            fontWeight: 600,
            px: 3,
            '&:hover': {
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            },
            '&:disabled': {
              background: 'rgba(0, 0, 0, 0.12)',
              color: 'rgba(0, 0, 0, 0.26)'
            }
          }}
        >
          Confirm Change
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StatusChangeConfirmDialog;

