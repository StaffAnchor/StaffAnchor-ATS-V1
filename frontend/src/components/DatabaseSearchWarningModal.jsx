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
import { Warning as WarningIcon } from '@mui/icons-material';

const DatabaseSearchWarningModal = ({ open, onClose, onProceed }) => {
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
        <WarningIcon sx={{ fontSize: 32, color: '#ff9800' }} />
        Search Accuracy Notice
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Alert
          severity="warning"
          icon={<WarningIcon sx={{ fontSize: 28 }} />}
          sx={{
            mb: 3,
            backgroundColor: 'rgba(255, 152, 0, 0.1)',
            border: '1px solid rgba(255, 152, 0, 0.3)',
            '& .MuiAlert-icon': {
              color: '#ff9800'
            }
          }}
        >
          <AlertTitle sx={{ color: '#ff9800', fontWeight: 700, fontSize: '1.1rem' }}>
            Important Notice
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
            The search algorithm for the entire database may not be 100% accurate. Results are based on automated matching algorithms that compare skills, experience, and other factors.
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: '#64748b',
              mb: 2,
              lineHeight: 1.6
            }}
          >
            <strong>Please note:</strong> While we strive for accuracy, the matching algorithm may not capture all nuances of candidate suitability. We recommend reviewing all suggestions manually and using your professional judgment.
          </Typography>

          <Box
            sx={{
              p: 2,
              background: 'rgba(255, 152, 0, 0.1)',
              borderRadius: 1,
              border: '1px solid rgba(255, 152, 0, 0.2)'
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: '#ff9800',
                fontWeight: 600,
                mb: 1
              }}
            >
              What to expect:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#64748b',
                fontSize: '0.9rem'
              }}
            >
              • Results based on keyword and skill matching<br />
              • May include candidates that are not perfectly suited<br />
              • May miss some suitable candidates<br />
              • Manual review is recommended for all results
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
        <Button
          onClick={handleProceed}
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
            color: '#fff',
            px: 4,
            py: 1,
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(255, 152, 0, 0.18)',
            '&:hover': {
              background: 'linear-gradient(135deg, #f57c00 0%, #e65100 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px rgba(255, 152, 0, 0.4)'
            }
          }}
        >
          Proceed Anyway
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DatabaseSearchWarningModal;

