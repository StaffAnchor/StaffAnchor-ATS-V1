import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';

const ResumePreviewModal = ({ open, onClose, resumeUrl, candidateName, fileName }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleDownload = () => {
    if (resumeUrl) {
      const link = document.createElement('a');
      link.href = resumeUrl;
      link.download = fileName || 'resume.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpenInNewTab = () => {
    if (resumeUrl) {
      window.open(resumeUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleIframeError = () => {
    setLoading(false);
    setError(true);
  };

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (open) {
      setLoading(true);
      setError(false);
    }
  }, [open, resumeUrl]);

  if (!resumeUrl) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          background: '#ffffff',
          borderRadius: 2,
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          pb: 2,
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)'
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
            Resume Preview
          </Typography>
          {candidateName && (
            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
              {candidateName}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <IconButton
            onClick={handleDownload}
            size="small"
            sx={{
              color: '#2563eb',
              '&:hover': {
                backgroundColor: 'rgba(37, 99, 235, 0.08)',
                color: '#1d4ed8'
              }
            }}
          >
            <DownloadIcon />
          </IconButton>
          <IconButton
            onClick={handleOpenInNewTab}
            size="small"
            sx={{
              color: '#2563eb',
              '&:hover': {
                backgroundColor: 'rgba(37, 99, 235, 0.08)',
                color: '#1d4ed8'
              }
            }}
          >
            <OpenInNewIcon />
          </IconButton>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: '#64748b',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                color: '#1e293b'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, position: 'relative', minHeight: '60vh' }}>
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f8fafc',
              zIndex: 1
            }}
          >
            <CircularProgress sx={{ color: '#2563eb' }} />
          </Box>
        )}

        {error ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              Unable to preview resume. The file may not be accessible or may not be a PDF.
            </Alert>
            <Button
              variant="contained"
              onClick={handleOpenInNewTab}
              sx={{
                background: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)',
                color: '#ffffff',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
                  color: '#ffffff'
                }
              }}
            >
              Open in New Tab
            </Button>
          </Box>
        ) : (
          <Box
            component="iframe"
            src={resumeUrl}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            sx={{
              width: '100%',
              height: '70vh',
              border: 'none',
              display: loading ? 'none' : 'block'
            }}
            title="Resume Preview"
          />
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.05)' }}>
        <Button
          onClick={onClose}
          sx={{
            color: '#64748b',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              color: '#1e293b'
            }
          }}
        >
          Close
        </Button>
        <Button
          onClick={handleDownload}
          variant="contained"
          startIcon={<DownloadIcon />}
          sx={{
            background: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)',
            color: '#ffffff',
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
              color: '#ffffff'
            }
          }}
        >
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResumePreviewModal;



