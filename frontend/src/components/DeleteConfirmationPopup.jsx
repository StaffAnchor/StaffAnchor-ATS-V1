import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

const DeleteConfirmationPopup = ({ 
  open, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  itemName,
  isDeleting = false 
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
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
        textAlign: 'center',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        pb: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1
      }}>
        <WarningIcon sx={{ color: '#f44336', fontSize: 28 }} />
        {title}
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 2,
              backgroundColor: 'rgba(255, 152, 0, 0.1)',
              border: '1px solid rgba(255, 152, 0, 0.3)',
              color: '#ff9800'
            }}
          >
            This action cannot be undone!
          </Alert>
          
          <Typography variant="body1" sx={{ color: '#64748b', mb: 2 }}>
            {message}
          </Typography>
          
          {itemName && (
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#f44336', 
                fontWeight: 600,
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                padding: 1,
                borderRadius: 1,
                border: '1px solid rgba(244, 67, 54, 0.3)'
              }}
            >
              "{itemName}"
            </Typography>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ 
        p: 3, 
        pt: 1,
        borderTop: '1px solid rgba(0, 0, 0, 0.05)',
        justifyContent: 'center',
        gap: 2
      }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          disabled={isDeleting}
          sx={{
            borderColor: 'rgba(255, 255, 255, 0.3)',
            color: '#64748b',
            '&:hover': {
              borderColor: '#8b5cf6',
              color: '#8b5cf6',
            },
            '&:disabled': {
              borderColor: 'rgba(0, 0, 0, 0.05)',
              color: 'rgba(255, 255, 255, 0.3)',
            }
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={isDeleting}
          sx={{
            backgroundColor: '#f44336',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#d32f2f',
              color: '#ffffff',
            },
            '&:disabled': {
              backgroundColor: 'rgba(244, 67, 54, 0.5)',
              color: 'rgba(255, 255, 255, 0.7)',
            },
          }}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationPopup;
