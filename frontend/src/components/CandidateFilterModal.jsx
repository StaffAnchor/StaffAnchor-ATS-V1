import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Chip,
  Button,
  IconButton,
  Autocomplete
} from '@mui/material';
import {
  Clear as ClearIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Star as StarIcon,
  Group as GroupIcon
} from '@mui/icons-material';

const CandidateFilterModal = ({ open, onClose, filters, onApplyFilters, onClearFilters, allSkills = [], talentPools = [] }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, open]);

  const handleFilterChange = (field, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleClear = () => {
    const clearedFilters = {
      name: '',
      email: '',
      phone: '',
      skills: [],
      experience: [0, 20],
      ctcLow: '',
      ctcHigh: '',
      education: '',
      certifications: [],
      linkedin: '',
      x: '',
      company: '',
      position: '',
      talentPools: []
    };
    setLocalFilters(clearedFilters);
    onClearFilters();
    onClose();
  };

  const experienceMarks = [
    { value: 0, label: '0' },
    { value: 5, label: '5' },
    { value: 10, label: '10' },
    { value: 15, label: '15' },
    { value: 20, label: '20+' }
  ];

  const educationLevels = [
    'High School', 'Associate Degree', 'Bachelor\'s Degree', 
    'Master\'s Degree', 'PhD', 'Diploma', 'Certificate'
  ];

  const positions = [
    'Software Engineer', 'Senior Software Engineer', 'Lead Developer',
    'Project Manager', 'Product Manager', 'Data Scientist', 'DevOps Engineer',
    'UI/UX Designer', 'QA Engineer', 'System Administrator', 'Business Analyst',
    'Marketing Manager', 'Sales Representative', 'HR Manager', 'Finance Analyst'
  ];

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        pb: 2
      }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#8b5cf6' }}>
          Candidate Filters
        </Typography>
        <IconButton onClick={onClose} size="small">
          <ClearIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Basic Information */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <PersonIcon sx={{ color: '#8b5cf6' }} />
              <Typography variant="h6" sx={{ color: '#8b5cf6', fontWeight: 600 }}>Basic Information</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Name"
                value={localFilters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                    '&:hover fieldset': { borderColor: 'rgba(139, 92, 246, 0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                  }
                }}
              />
              <TextField
                fullWidth
                label="Email"
                value={localFilters.email}
                onChange={(e) => handleFilterChange('email', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                    '&:hover fieldset': { borderColor: 'rgba(139, 92, 246, 0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                  }
                }}
              />
              <TextField
                fullWidth
                label="Phone"
                value={localFilters.phone}
                onChange={(e) => handleFilterChange('phone', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                    '&:hover fieldset': { borderColor: 'rgba(139, 92, 246, 0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                  }
                }}
              />
            </Box>
          </Box>

          {/* Skills */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <StarIcon sx={{ color: '#8b5cf6' }} />
              <Typography variant="h6" sx={{ color: '#8b5cf6', fontWeight: 600 }}>Skills</Typography>
            </Box>
            <Autocomplete
              multiple
              options={allSkills}
              value={localFilters.skills}
              onChange={(e, newValue) => handleFilterChange('skills', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Skills"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                      '&:hover fieldset': { borderColor: 'rgba(139, 92, 246, 0.4)' },
                      '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                    }
                  }}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option}
                    label={option}
                    sx={{ 
                      backgroundColor: 'rgba(139, 92, 246, 0.12)', 
                      color: '#8b5cf6'
                    }}
                  />
                ))
              }
            />
          </Box>

          {/* Experience */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <WorkIcon sx={{ color: '#8b5cf6' }} />
              <Typography variant="h6" sx={{ color: '#8b5cf6', fontWeight: 600 }}>Experience</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Company"
                value={localFilters.company}
                onChange={(e) => handleFilterChange('company', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                    '&:hover fieldset': { borderColor: 'rgba(139, 92, 246, 0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                  }
                }}
              />
              <FormControl fullWidth>
                <InputLabel>Position</InputLabel>
                <Select
                  value={localFilters.position}
                  onChange={(e) => handleFilterChange('position', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(139, 92, 246, 0.4)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8b5cf6' },
                  }}
                >
                  <MenuItem value="">All Positions</MenuItem>
                  {positions.map((position) => (
                    <MenuItem key={position} value={position}>{position}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box>
                <Typography sx={{ color: '#64748b', mb: 2 }}>Years of Experience</Typography>
                <Slider
                  value={localFilters.experience}
                  onChange={(e, newValue) => handleFilterChange('experience', newValue)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={20}
                  marks={experienceMarks}
                  sx={{
                    color: '#8b5cf6',
                    '& .MuiSlider-thumb': { backgroundColor: '#8b5cf6' },
                    '& .MuiSlider-track': { backgroundColor: '#8b5cf6' },
                    '& .MuiSlider-rail': { backgroundColor: 'rgba(0, 0, 0, 0.08)' },
                  }}
                />
              </Box>
              <TextField
                fullWidth
                label="Lowest CTC (LPA)"
                value={localFilters.ctcLow}
                onChange={(e) => handleFilterChange('ctcLow', e.target.value)}
                placeholder="e.g., 10"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                    '&:hover fieldset': { borderColor: 'rgba(139, 92, 246, 0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                  }
                }}
              />
              <TextField
                fullWidth
                label="Highest CTC (LPA)"
                value={localFilters.ctcHigh}
                onChange={(e) => handleFilterChange('ctcHigh', e.target.value)}
                placeholder="e.g., 25"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                    '&:hover fieldset': { borderColor: 'rgba(139, 92, 246, 0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                  }
                }}
              />
            </Box>
          </Box>

          {/* Education */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <SchoolIcon sx={{ color: '#8b5cf6' }} />
              <Typography variant="h6" sx={{ color: '#8b5cf6', fontWeight: 600 }}>Education</Typography>
            </Box>
            <FormControl fullWidth>
              <InputLabel>Education Level</InputLabel>
              <Select
                value={localFilters.education}
                onChange={(e) => handleFilterChange('education', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(139, 92, 246, 0.4)' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8b5cf6' },
                }}
              >
                <MenuItem value="">All Education Levels</MenuItem>
                {educationLevels.map((level) => (
                  <MenuItem key={level} value={level}>{level}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Talent Pools */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <GroupIcon sx={{ color: '#8b5cf6' }} />
              <Typography variant="h6" sx={{ color: '#8b5cf6', fontWeight: 600 }}>Talent Pools</Typography>
            </Box>
            <Autocomplete
              multiple
              options={talentPools}
              getOptionLabel={(option) => option.name}
              value={talentPools.filter(pool => localFilters.talentPools?.includes(pool._id))}
              onChange={(e, newValue) => handleFilterChange('talentPools', newValue.map(pool => pool._id))}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Talent Pools"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                      '&:hover fieldset': { borderColor: 'rgba(139, 92, 246, 0.4)' },
                      '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                    }
                  }}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option._id}
                    label={option.name}
                    sx={{ 
                      backgroundColor: 'rgba(37, 99, 235, 0.12)', 
                      color: '#2563eb'
                    }}
                  />
                ))
              }
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(0, 0, 0, 0.05)' }}>
        <Button 
          onClick={handleClear}
          sx={{ 
            color: '#64748b',
            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
          }}
        >
          Clear All
        </Button>
        <Button 
          onClick={onClose}
          sx={{ 
            color: '#64748b',
            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleApply}
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)',
            color: '#fff',
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(135deg, #3a7bd5 0%, #7c3aed 100%)',
            }
          }}
        >
          Apply Filters
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CandidateFilterModal;

