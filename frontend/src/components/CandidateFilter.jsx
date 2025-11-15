import React, { useState } from 'react';
import {
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
  Divider,
  Paper,
  IconButton,
  Tooltip,
  Autocomplete,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Star as StarIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Group as GroupIcon
} from '@mui/icons-material';

const CandidateFilter = ({ filters, setFilters, onApplyFilters, onClearFilters, allSkills = [], talentPools = [] }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (field, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(localFilters);
  };

  const handleClearFilters = () => {
    setLocalFilters({
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
    });
    onClearFilters();
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
    <Paper elevation={3} sx={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #232946 100%)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: 2,
      p: 2,
      color: '#f5f7fa',
      height: '100%',
      overflowY: 'auto',
      // Custom scrollbar styling
      '&::-webkit-scrollbar': {
        width: '8px',
      },
      '&::-webkit-scrollbar-track': {
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '4px',
      },
      '&::-webkit-scrollbar-thumb': {
        background: 'linear-gradient(135deg, #eebbc3 0%, #4f8cff 100%)',
        borderRadius: '4px',
        '&:hover': {
          background: 'linear-gradient(135deg, #d4a5ac 0%, #3a7bd5 100%)',
        },
      },
      '&::-webkit-scrollbar-corner': {
        background: 'transparent',
      },
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 2,
        pb: 1,
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterIcon sx={{ color: '#eebbc3' }} />
          <Typography variant="h6" sx={{ color: '#eebbc3', fontWeight: 600 }}>
            Candidate Filters
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={handleClearFilters}
          sx={{ 
            color: '#eebbc3',
            '&:hover': { backgroundColor: 'rgba(238, 187, 195, 0.1)' }
          }}
        >
          <ClearIcon />
        </IconButton>
      </Box>
      
      {/* Filter Content */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Basic Information */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <PersonIcon sx={{ color: '#eebbc3' }} />
            <Typography sx={{ color: '#f5f7fa', fontWeight: 600 }}>Basic Information</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={localFilters.name}
              onChange={(e) => handleFilterChange('name', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#eebbc3' },
                },
                '& .MuiInputLabel-root': { color: '#b8c5d6' },
                '& .MuiInputBase-input': { color: '#f5f7fa' },
              }}
            />
            <TextField
              fullWidth
              label="Email"
              value={localFilters.email}
              onChange={(e) => handleFilterChange('email', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#eebbc3' },
                },
                '& .MuiInputLabel-root': { color: '#b8c5d6' },
                '& .MuiInputBase-input': { color: '#f5f7fa' },
              }}
            />
            <TextField
              fullWidth
              label="Phone"
              value={localFilters.phone}
              onChange={(e) => handleFilterChange('phone', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#eebbc3' },
                },
                '& .MuiInputLabel-root': { color: '#b8c5d6' },
                '& .MuiInputBase-input': { color: '#f5f7fa' },
              }}
            />
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Skills */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <StarIcon sx={{ color: '#eebbc3' }} />
            <Typography sx={{ color: '#f5f7fa', fontWeight: 600 }}>Skills</Typography>
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
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#eebbc3' },
                  },
                  '& .MuiInputLabel-root': { color: '#b8c5d6' },
                  '& .MuiInputBase-input': { color: '#f5f7fa' },
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
                    backgroundColor: 'rgba(238, 187, 195, 0.2)', 
                    color: '#eebbc3',
                    '& .MuiChip-deleteIcon': { color: '#eebbc3' }
                  }}
                />
              ))
            }
            sx={{
              '& .MuiAutocomplete-popupIndicator': { color: '#b8c5d6' },
              '& .MuiAutocomplete-clearIndicator': { color: '#b8c5d6' },
            }}
          />
        </Box>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Experience */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <WorkIcon sx={{ color: '#eebbc3' }} />
            <Typography sx={{ color: '#f5f7fa', fontWeight: 600 }}>Experience</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Company"
              value={localFilters.company}
              onChange={(e) => handleFilterChange('company', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#eebbc3' },
                },
                '& .MuiInputLabel-root': { color: '#b8c5d6' },
                '& .MuiInputBase-input': { color: '#f5f7fa' },
              }}
            />
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#b8c5d6' }}>Position</InputLabel>
              <Select
                value={localFilters.position}
                onChange={(e) => handleFilterChange('position', e.target.value)}
                sx={{
                  color: '#f5f7fa',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(238, 187, 195, 0.5)' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#eebbc3' },
                  '& .MuiSvgIcon-root': { color: '#b8c5d6' },
                }}
              >
                <MenuItem value="">All Positions</MenuItem>
                {positions.map((position) => (
                  <MenuItem key={position} value={position}>{position}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Box>
              <Typography sx={{ color: '#b8c5d6', mb: 1 }}>Years of Experience</Typography>
              <Slider
                value={localFilters.experience}
                onChange={(e, newValue) => handleFilterChange('experience', newValue)}
                valueLabelDisplay="auto"
                min={0}
                max={20}
                marks={experienceMarks}
                sx={{
                  color: '#eebbc3',
                  '& .MuiSlider-thumb': { backgroundColor: '#eebbc3' },
                  '& .MuiSlider-track': { backgroundColor: '#eebbc3' },
                  '& .MuiSlider-rail': { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
                  '& .MuiSlider-mark': { backgroundColor: '#b8c5d6' },
                  '& .MuiSlider-markLabel': { color: '#b8c5d6' },
                  '& .MuiSlider-valueLabel': { backgroundColor: '#eebbc3', color: '#1a1a2e' },
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
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#eebbc3' },
                },
                '& .MuiInputLabel-root': { color: '#b8c5d6' },
                '& .MuiInputBase-input': { color: '#f5f7fa' },
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
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#eebbc3' },
                },
                '& .MuiInputLabel-root': { color: '#b8c5d6' },
                '& .MuiInputBase-input': { color: '#f5f7fa' },
              }}
            />
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Education */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <SchoolIcon sx={{ color: '#eebbc3' }} />
            <Typography sx={{ color: '#f5f7fa', fontWeight: 600 }}>Education</Typography>
          </Box>
          <FormControl fullWidth>
            <InputLabel sx={{ color: '#b8c5d6' }}>Education Level</InputLabel>
            <Select
              value={localFilters.education}
              onChange={(e) => handleFilterChange('education', e.target.value)}
              sx={{
                color: '#f5f7fa',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(238, 187, 195, 0.5)' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#eebbc3' },
                '& .MuiSvgIcon-root': { color: '#b8c5d6' },
              }}
            >
              <MenuItem value="">All Education Levels</MenuItem>
              {educationLevels.map((level) => (
                <MenuItem key={level} value={level}>{level}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Talent Pools */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <GroupIcon sx={{ color: '#eebbc3' }} />
            <Typography sx={{ color: '#f5f7fa', fontWeight: 600 }}>Talent Pools</Typography>
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
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#eebbc3' },
                  },
                  '& .MuiInputLabel-root': { color: '#b8c5d6' },
                  '& .MuiInputBase-input': { color: '#f5f7fa' },
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
                    backgroundColor: 'rgba(79, 140, 255, 0.2)', 
                    color: '#4f8cff',
                    '& .MuiChip-deleteIcon': { color: '#4f8cff' }
                  }}
                />
              ))
            }
            sx={{
              '& .MuiAutocomplete-popupIndicator': { color: '#b8c5d6' },
              '& .MuiAutocomplete-clearIndicator': { color: '#b8c5d6' },
            }}
          />
        </Box>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Social Links */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <EmailIcon sx={{ color: '#eebbc3' }} />
            <Typography sx={{ color: '#f5f7fa', fontWeight: 600 }}>Social Links</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="LinkedIn Profile"
              value={localFilters.linkedin}
              onChange={(e) => handleFilterChange('linkedin', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#eebbc3' },
                },
                '& .MuiInputLabel-root': { color: '#b8c5d6' },
                '& .MuiInputBase-input': { color: '#f5f7fa' },
              }}
            />
            <TextField
              fullWidth
              label="X (Twitter) Profile"
              value={localFilters.x}
              onChange={(e) => handleFilterChange('x', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#eebbc3' },
                },
                '& .MuiInputLabel-root': { color: '#b8c5d6' },
                '& .MuiInputBase-input': { color: '#f5f7fa' },
              }}
            />
          </Box>
        </Box>

        {/* Active Filters Display */}
        {Object.values(localFilters).some(value => 
          value !== '' && value !== null && 
          !(Array.isArray(value) && value.length === 0) &&
          !(Array.isArray(value) && value[0] === 0 && value[1] === 20)
        ) && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: '#b8c5d6', mb: 1 }}>Active Filters:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {localFilters.name && (
                <Chip 
                  label={`Name: ${localFilters.name}`} 
                  onDelete={() => handleFilterChange('name', '')}
                  sx={{ backgroundColor: 'rgba(238, 187, 195, 0.2)', color: '#eebbc3' }}
                />
              )}
              {localFilters.email && (
                <Chip 
                  label={`Email: ${localFilters.email}`} 
                  onDelete={() => handleFilterChange('email', '')}
                  sx={{ backgroundColor: 'rgba(238, 187, 195, 0.2)', color: '#eebbc3' }}
                />
              )}
              {localFilters.phone && (
                <Chip 
                  label={`Phone: ${localFilters.phone}`} 
                  onDelete={() => handleFilterChange('phone', '')}
                  sx={{ backgroundColor: 'rgba(238, 187, 195, 0.2)', color: '#eebbc3' }}
                />
              )}
              {localFilters.skills.length > 0 && (
                <Chip 
                  label={`Skills: ${localFilters.skills.length}`} 
                  onDelete={() => handleFilterChange('skills', [])}
                  sx={{ backgroundColor: 'rgba(238, 187, 195, 0.2)', color: '#eebbc3' }}
                />
              )}
              {localFilters.company && (
                <Chip 
                  label={`Company: ${localFilters.company}`} 
                  onDelete={() => handleFilterChange('company', '')}
                  sx={{ backgroundColor: 'rgba(238, 187, 195, 0.2)', color: '#eebbc3' }}
                />
              )}
              {localFilters.position && (
                <Chip 
                  label={`Position: ${localFilters.position}`} 
                  onDelete={() => handleFilterChange('position', '')}
                  sx={{ backgroundColor: 'rgba(238, 187, 195, 0.2)', color: '#eebbc3' }}
                />
              )}
              {localFilters.education && (
                <Chip 
                  label={`Education: ${localFilters.education}`} 
                  onDelete={() => handleFilterChange('education', '')}
                  sx={{ backgroundColor: 'rgba(238, 187, 195, 0.2)', color: '#eebbc3' }}
                />
              )}
              {localFilters.ctcLow && (
                <Chip 
                  label={`CTC Low: ${localFilters.ctcLow} LPA`} 
                  onDelete={() => handleFilterChange('ctcLow', '')}
                  sx={{ backgroundColor: 'rgba(238, 187, 195, 0.2)', color: '#eebbc3' }}
                />
              )}
              {localFilters.ctcHigh && (
                <Chip 
                  label={`CTC High: ${localFilters.ctcHigh} LPA`} 
                  onDelete={() => handleFilterChange('ctcHigh', '')}
                  sx={{ backgroundColor: 'rgba(238, 187, 195, 0.2)', color: '#eebbc3' }}
                />
              )}
              {localFilters.talentPools && localFilters.talentPools.length > 0 && (
                <Chip 
                  label={`Talent Pools: ${localFilters.talentPools.length}`} 
                  onDelete={() => handleFilterChange('talentPools', [])}
                  sx={{ backgroundColor: 'rgba(79, 140, 255, 0.2)', color: '#4f8cff' }}
                />
              )}
            </Box>
          </Box>
        )}

        {/* Apply Button */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleApplyFilters}
          sx={{
            background: 'linear-gradient(135deg, #4f8cff 0%, #eebbc3 100%)',
            color: '#fff',
            fontWeight: 600,
            py: 1.5,
            '&:hover': {
              background: 'linear-gradient(135deg, #3a7bd5 0%, #d4a5ac 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 16px rgba(79, 140, 255, 0.3)',
            },
          }}
        >
          Apply Filters
        </Button>
      </Box>
    </Paper>
  );
};

export default CandidateFilter; 