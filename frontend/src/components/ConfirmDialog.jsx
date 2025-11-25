import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

const ConfirmDialog = ({ 
  open, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "#ef4444"
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          borderRadius: 2,
        }
      }}
    >
      <DialogTitle sx={{ 
        color: '#1e293b', 
        fontWeight: 600,
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        pb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <WarningIcon sx={{ color: '#f59e0b', fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
            {title}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Typography variant="body1" sx={{ color: '#64748b', lineHeight: 1.6 }}>
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 2, borderTop: '1px solid rgba(0, 0, 0, 0.05)' }}>
        <Button 
          onClick={onClose}
          sx={{
            color: '#64748b',
            fontWeight: 600,
            textTransform: 'none',
            px: 3,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          variant="contained"
          sx={{
            backgroundColor: confirmColor,
            color: '#fff',
            fontWeight: 600,
            textTransform: 'none',
            px: 3,
            '&:hover': {
              backgroundColor: confirmColor === "#ef4444" ? '#dc2626' : confirmColor,
            },
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;







