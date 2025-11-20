import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Slider,
  Grid,
  Paper,
} from '@mui/material';

const PreferenceSelectionModal = ({ open, onClose, onConfirm, title }) => {
  const [preferences, setPreferences] = useState({
    skillsVsDescription: 50,
    experienceVsDescription: 50,
    yearsOfExperience: 50,
    location: 50,
  });

  const handleSliderChange = (preference, value) => {
    setPreferences(prev => ({
      ...prev,
      [preference]: value
    }));
  };

  const handleConfirm = () => {
    onConfirm(preferences);
    onClose();
  };

  const handleClose = () => {
    // Reset to default values
    setPreferences({
      skillsVsDescription: 50,
      experienceVsDescription: 50,
      yearsOfExperience: 50,
      location: 50,
    });
    onClose();
  };

  const getSliderColor = (value) => {
    if (value < 30) return '#f44336'; // Red for low preference
    if (value < 70) return '#ff9800'; // Orange for medium preference
    return '#4caf50'; // Green for high preference
  };

  const getPreferenceLabel = (value) => {
    if (value < 20) return 'Very Low';
    if (value < 40) return 'Low';
    if (value < 60) return 'Medium';
    if (value < 80) return 'High';
    return 'Very High';
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
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
        pb: 2
      }}>
        {title}
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ color: '#64748b', mb: 3, textAlign: 'center' }}>
            Adjust the sliders to set your preference levels for different matching criteria. 
            Higher values mean more importance in the candidate matching process.
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Skills vs Description */}
            <Paper sx={{ 
              p: 3, 
              background: 'rgba(255, 255, 255, 0.03)', 
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box sx={{ minWidth: '200px', flexShrink: 0 }}>
                  <Typography variant="h6" sx={{ color: '#8b5cf6', mb: 1 }}>
                    Skills vs Description
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    How much should candidate skills match the job description?
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, px: 2 }}>
                  <Slider
                    value={preferences.skillsVsDescription}
                    onChange={(e, value) => handleSliderChange('skillsVsDescription', value)}
                    min={0}
                    max={100}
                    step={5}
                    sx={{
                      color: getSliderColor(preferences.skillsVsDescription),
                      '& .MuiSlider-thumb': {
                        backgroundColor: getSliderColor(preferences.skillsVsDescription),
                        border: '2px solid #fff',
                        width: 20,
                        height: 20,
                      },
                      '& .MuiSlider-track': {
                        backgroundColor: getSliderColor(preferences.skillsVsDescription),
                        height: 6,
                      },
                      '& .MuiSlider-rail': {
                        backgroundColor: 'rgba(0, 0, 0, 0.08)',
                        height: 6,
                      },
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption" sx={{ color: '#8b9dc3' }}>0%</Typography>
                    <Typography variant="body2" sx={{ 
                      color: getSliderColor(preferences.skillsVsDescription),
                      fontWeight: 600
                    }}>
                      {preferences.skillsVsDescription}% - {getPreferenceLabel(preferences.skillsVsDescription)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#8b9dc3' }}>100%</Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* Experience vs Description */}
            <Paper sx={{ 
              p: 3, 
              background: 'rgba(255, 255, 255, 0.03)', 
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box sx={{ minWidth: '200px', flexShrink: 0 }}>
                  <Typography variant="h6" sx={{ color: '#8b5cf6', mb: 1 }}>
                    Experience vs Description
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    How much should work experience match the job description?
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, px: 2 }}>
                  <Slider
                    value={preferences.experienceVsDescription}
                    onChange={(e, value) => handleSliderChange('experienceVsDescription', value)}
                    min={0}
                    max={100}
                    step={5}
                    sx={{
                      color: getSliderColor(preferences.experienceVsDescription),
                      '& .MuiSlider-thumb': {
                        backgroundColor: getSliderColor(preferences.experienceVsDescription),
                        border: '2px solid #fff',
                        width: 20,
                        height: 20,
                      },
                      '& .MuiSlider-track': {
                        backgroundColor: getSliderColor(preferences.experienceVsDescription),
                        height: 6,
                      },
                      '& .MuiSlider-rail': {
                        backgroundColor: 'rgba(0, 0, 0, 0.08)',
                        height: 6,
                      },
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption" sx={{ color: '#8b9dc3' }}>0%</Typography>
                    <Typography variant="body2" sx={{ 
                      color: getSliderColor(preferences.experienceVsDescription),
                      fontWeight: 600
                    }}>
                      {preferences.experienceVsDescription}% - {getPreferenceLabel(preferences.experienceVsDescription)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#8b9dc3' }}>100%</Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* Years of Experience */}
            <Paper sx={{ 
              p: 3, 
              background: 'rgba(255, 255, 255, 0.03)', 
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box sx={{ minWidth: '200px', flexShrink: 0 }}>
                  <Typography variant="h6" sx={{ color: '#8b5cf6', mb: 1 }}>
                    Years of Experience
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    How important is the exact years of experience match?
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, px: 2 }}>
                  <Slider
                    value={preferences.yearsOfExperience}
                    onChange={(e, value) => handleSliderChange('yearsOfExperience', value)}
                    min={0}
                    max={100}
                    step={5}
                    sx={{
                      color: getSliderColor(preferences.yearsOfExperience),
                      '& .MuiSlider-thumb': {
                        backgroundColor: getSliderColor(preferences.yearsOfExperience),
                        border: '2px solid #fff',
                        width: 20,
                        height: 20,
                      },
                      '& .MuiSlider-track': {
                        backgroundColor: getSliderColor(preferences.yearsOfExperience),
                        height: 6,
                      },
                      '& .MuiSlider-rail': {
                        backgroundColor: 'rgba(0, 0, 0, 0.08)',
                        height: 6,
                      },
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption" sx={{ color: '#8b9dc3' }}>0%</Typography>
                    <Typography variant="body2" sx={{ 
                      color: getSliderColor(preferences.yearsOfExperience),
                      fontWeight: 600
                    }}>
                      {preferences.yearsOfExperience}% - {getPreferenceLabel(preferences.yearsOfExperience)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#8b9dc3' }}>100%</Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* Location */}
            <Paper sx={{ 
              p: 3, 
              background: 'rgba(255, 255, 255, 0.03)', 
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box sx={{ minWidth: '200px', flexShrink: 0 }}>
                  <Typography variant="h6" sx={{ color: '#8b5cf6', mb: 1 }}>
                    Location Match
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    How important is location compatibility?
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, px: 2 }}>
                  <Slider
                    value={preferences.location}
                    onChange={(e, value) => handleSliderChange('location', value)}
                    min={0}
                    max={100}
                    step={5}
                    sx={{
                      color: getSliderColor(preferences.location),
                      '& .MuiSlider-thumb': {
                        backgroundColor: getSliderColor(preferences.location),
                        border: '2px solid #fff',
                        width: 20,
                        height: 20,
                      },
                      '& .MuiSlider-track': {
                        backgroundColor: getSliderColor(preferences.location),
                        height: 6,
                      },
                      '& .MuiSlider-rail': {
                        backgroundColor: 'rgba(0, 0, 0, 0.08)',
                        height: 6,
                      },
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption" sx={{ color: '#8b9dc3' }}>0%</Typography>
                    <Typography variant="body2" sx={{ 
                      color: getSliderColor(preferences.location),
                      fontWeight: 600
                    }}>
                      {preferences.location}% - {getPreferenceLabel(preferences.location)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#8b9dc3' }}>100%</Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Box>
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
          onClick={handleClose}
          variant="outlined"
          sx={{
            borderColor: 'rgba(255, 255, 255, 0.3)',
            color: '#64748b',
            '&:hover': {
              borderColor: '#8b5cf6',
              color: '#8b5cf6',
            },
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm}
          variant="contained"
          sx={{
            backgroundColor: '#2563eb',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#3d7be8',
            },
          }}
        >
          Find Candidates
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PreferenceSelectionModal;
