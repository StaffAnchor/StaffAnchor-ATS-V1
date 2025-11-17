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
  AlertTitle
} from '@mui/material';
import { Warning as WarningIcon, Psychology as AIIcon } from '@mui/icons-material';

const AIWarningDialog = ({ open, onClose, onProceed, featureName = "AI-Powered Matching" }) => {
  const handleProceed = () => {
    onProceed();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
      <DialogTitle
        sx={{
          color: '#f5f7fa',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          pb: 2,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <AIIcon sx={{ fontSize: 32, color: '#4f8cff' }} />
        AI-Powered Feature
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Alert
          severity="warning"
          icon={<WarningIcon sx={{ fontSize: 28 }} />}
          sx={{
            mb: 3,
            backgroundColor: 'rgba(255, 193, 7, 0.1)',
            border: '1px solid rgba(255, 193, 7, 0.3)',
            '& .MuiAlert-icon': {
              color: '#ffc107'
            }
          }}
        >
          <AlertTitle sx={{ color: '#ffc107', fontWeight: 700, fontSize: '1.1rem' }}>
            Beta Feature Notice
          </AlertTitle>
        </Alert>

        <Box sx={{ mb: 2 }}>
          <Typography
            variant="body1"
            sx={{
              color: '#f5f7fa',
              mb: 2,
              lineHeight: 1.7,
              fontSize: '1rem'
            }}
          >
            You are about to use <strong style={{ color: '#4f8cff' }}>{featureName}</strong>, 
            an AI-powered feature that leverages machine learning algorithms to analyze and match profiles.
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: '#b8c5d6',
              mb: 2,
              lineHeight: 1.6
            }}
          >
            <strong>Please note:</strong> This feature is currently in beta and under active development. 
            While our AI model strives for accuracy, results may vary and should be used as a supplementary 
            tool alongside your professional judgment.
          </Typography>

          <Box
            sx={{
              p: 2,
              background: 'rgba(79, 140, 255, 0.1)',
              borderRadius: 1,
              border: '1px solid rgba(79, 140, 255, 0.2)'
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: '#4f8cff',
                fontWeight: 600,
                mb: 1
              }}
            >
              What to expect:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#b8c5d6',
                fontSize: '0.9rem'
              }}
            >
              • AI-generated matches based on skills, experience, and requirements<br />
              • Results may not always be 100% accurate<br />
              • Continuous improvements are being made to enhance precision<br />
              • We recommend reviewing all suggestions manually
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          pt: 2,
          gap: 2,
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: 'rgba(255, 255, 255, 0.3)',
            color: '#f5f7fa',
            px: 3,
            py: 1,
            fontWeight: 600,
            '&:hover': {
              borderColor: '#ff6b6b',
              backgroundColor: 'rgba(255, 107, 107, 0.1)',
              color: '#ff6b6b'
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleProceed}
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #4f8cff 0%, #3a7bd5 100%)',
            color: '#fff',
            px: 4,
            py: 1,
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(79, 140, 255, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #3a7bd5 0%, #2d5fa8 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px rgba(79, 140, 255, 0.4)'
            }
          }}
        >
          Proceed with AI Matching
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AIWarningDialog;

