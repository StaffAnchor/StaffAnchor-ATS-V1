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
import { Psychology as AIIcon, People as PeopleIcon } from '@mui/icons-material';

const CandidateSearchOptionsModal = ({ open, onClose, onSelectLinkedCandidates }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={false}
      onClick={(e) => e.stopPropagation()}
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          borderRadius: 2,
        }
      }}
    >
      <DialogTitle
        sx={{
          color: '#1e293b',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          pb: 2,
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
        }}
      >
        <AIIcon sx={{ fontSize: 32, color: '#2563eb' }} />
        Find Suitable Candidates
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Alert
          severity="info"
          icon={<AIIcon sx={{ fontSize: 28 }} />}
          sx={{
            mb: 3,
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            border: '1px solid rgba(37, 99, 235, 0.3)',
            '& .MuiAlert-icon': {
              color: '#2563eb'
            }
          }}
        >
          <AlertTitle sx={{ color: '#2563eb', fontWeight: 700, fontSize: '1.1rem' }}>
            AI-Powered Candidate Matching
          </AlertTitle>
        </Alert>

        <Box sx={{ mb: 2 }}>
          <Typography
            variant="body1"
            sx={{
              color: '#1e293b',
              mb: 2,
              lineHeight: 1.7,
              fontSize: '1rem'
            }}
          >
            This feature uses advanced AI technology to analyze and rank candidates based on their profiles and the job requirements.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<PeopleIcon />}
              onClick={onSelectLinkedCandidates}
              sx={{
                borderColor: 'rgba(37, 99, 235, 0.3)',
                color: '#2563eb',
                py: 2,
                px: 3,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#2563eb',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)',
                  '& .MuiSvgIcon-root': {
                    color: '#ffffff'
                  }
                }
              }}
            >
              Find suitable candidates from linked candidates
            </Button>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          pt: 2,
          borderTop: '1px solid rgba(0, 0, 0, 0.05)'
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: 'rgba(255, 255, 255, 0.3)',
            color: '#1e293b',
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
      </DialogActions>
    </Dialog>
  );
};

export default CandidateSearchOptionsModal;

