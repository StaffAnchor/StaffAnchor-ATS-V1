import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
} from '@mui/material';

const ResultsLimitPopup = ({ open, onClose, onConfirm, title, maxResults = 100 }) => {
  const [limit, setLimit] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    const numLimit = parseInt(limit);
    
    // Validation
    if (!limit.trim()) {
      setError('Please enter a number');
      return;
    }
    
    if (isNaN(numLimit) || numLimit <= 0) {
      setError('Please enter a valid positive number');
      return;
    }
    
    if (numLimit > maxResults) {
      setError(`Maximum allowed is ${maxResults}`);
      return;
    }
    
    onConfirm(numLimit);
    onClose();
  };

  const handleClose = () => {
    setLimit(''); // Reset to empty
    setError(''); // Clear error
    onClose();
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setLimit(value);
    // Clear error when user starts typing
    if (error) setError('');
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #1a1a2e 0%, #232946 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 2,
        }
      }}
    >
      <DialogTitle sx={{ 
        color: '#f5f7fa', 
        textAlign: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        pb: 2
      }}>
        {title}
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="body1" sx={{ color: '#b8c5d6', mb: 2 }}>
            How many results would you like to see?
          </Typography>
          
          <TextField
            type="number"
            value={limit}
            onChange={handleInputChange}
            placeholder="Enter number of results"
            error={!!error}
            helperText={error}
            inputProps={{ 
              min: 1, 
              max: maxResults,
              style: { color: '#f5f7fa' }
            }}
            sx={{
              maxWidth: 200,
              '& .MuiOutlinedInput-root': {
                '& fieldset': { 
                  borderColor: error ? '#f44336' : 'rgba(255, 255, 255, 0.3)' 
                },
                '&:hover fieldset': { 
                  borderColor: error ? '#f44336' : 'rgba(238, 187, 195, 0.5)' 
                },
                '&.Mui-focused fieldset': { 
                  borderColor: error ? '#f44336' : '#eebbc3' 
                },
                '& input': { color: '#f5f7fa' },
                '& .MuiInputLabel-root': { color: '#b8c5d6' },
                '& .MuiFormHelperText-root': { 
                  color: error ? '#f44336' : '#8b9dc3' 
                },
              },
            }}
          />
          
          <Typography variant="caption" sx={{ color: '#8b9dc3', mt: 1, display: 'block' }}>
            Maximum available: {maxResults} results
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ 
        p: 3, 
        pt: 1,
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        gap: 2
      }}>
        <Button 
          onClick={handleClose}
          variant="outlined"
          sx={{
            borderColor: 'rgba(255, 255, 255, 0.3)',
            color: '#b8c5d6',
            '&:hover': {
              borderColor: '#eebbc3',
              color: '#eebbc3',
            },
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm}
          variant="contained"
          sx={{
            backgroundColor: '#4f8cff',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#3d7be8',
            },
          }}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResultsLimitPopup;
