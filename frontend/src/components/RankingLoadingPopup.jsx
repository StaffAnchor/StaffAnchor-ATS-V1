import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import { EmojiEvents as EmojiEventsIcon } from '@mui/icons-material';

/**
 * Advanced loading popup for candidate ranking generation.
 * Theme-consistent with app (blues/purples, gradients).
 */
const RankingLoadingPopup = ({ open }) => {
  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      PaperProps={{
        sx: {
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid #e2e8f0',
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(37, 99, 235, 0.15), 0 0 0 1px rgba(37, 99, 235, 0.05)',
          overflow: 'hidden',
          maxWidth: 420,
          mx: 2
        }
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ px: 4, py: 4, textAlign: 'center' }}>
          {/* Icon with gradient ring */}
          <Box
            sx={{
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 2,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(37, 99, 235, 0.35)',
              animation: 'pulse-ring 2s ease-in-out infinite'
            }}
          >
            <EmojiEventsIcon sx={{ fontSize: 40, color: '#fff' }} />
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5 }}>
            Generating rankings
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
            Analyzing resumes and matching to your job criteria…
          </Typography>

          {/* Progress indicator */}
          <Box sx={{ position: 'relative', mb: 2 }}>
            <LinearProgress
              variant="indeterminate"
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: 'rgba(37, 99, 235, 0.12)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #2563eb, #8b5cf6)',
                  borderRadius: 3
                }
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <CircularProgress
              size={18}
              thickness={4}
              sx={{ color: '#8b5cf6' }}
            />
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              This may take 30–60 seconds
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <style>{`
        @keyframes pulse-ring {
          0%, 100% { box-shadow: 0 8px 24px rgba(37, 99, 235, 0.35); transform: scale(1); }
          50% { box-shadow: 0 8px 32px rgba(37, 99, 235, 0.5); transform: scale(1.02); }
        }
      `}</style>
    </Dialog>
  );
};

export default RankingLoadingPopup;
