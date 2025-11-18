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
  Switch,
  FormControlLabel,
  Chip,
  Button,
  Divider,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';

const JobFilter = ({ filters, setFilters, onApplyFilters, onClearFilters }) => {
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
      title: '',
      organization: '',
      location: '',
      industry: '',
      experience: [0, 20],
      ctcLow: '',
      ctcHigh: '',
      remote: null,
      recruiterName: '',
      recruiterEmail: ''
    });
    onClearFilters();
  };

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
    'Retail', 'Consulting', 'Media', 'Real Estate', 'Transportation',
    'Energy', 'Government', 'Non-Profit', 'Other'
  ];

  const experienceMarks = [
    { value: 0, label: '0' },
    { value: 5, label: '5' },
    { value: 10, label: '10' },
    { value: 15, label: '15' },
    { value: 20, label: '20+' }
  ];

  return (
    <Paper elevation={3} sx={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #232946 100%)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: 2,
      p: 2,
      color: '#f5f7fa',
      maxHeight: 'calc(100vh - 180px)', // Reduced height to prevent overlap
      minHeight: '400px', // Minimum height for usability
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
            Job Filters
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
        {/* Basic Search */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <SearchIcon sx={{ color: '#eebbc3' }} />
            <Typography sx={{ color: '#f5f7fa', fontWeight: 600 }}>Basic Search</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Job Title"
              value={localFilters.title}
              onChange={(e) => handleFilterChange('title', e.target.value)}
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
              label="Organization"
              value={localFilters.organization}
              onChange={(e) => handleFilterChange('organization', e.target.value)}
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

        {/* Location & Remote */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <LocationIcon sx={{ color: '#eebbc3' }} />
            <Typography sx={{ color: '#f5f7fa', fontWeight: 600 }}>Location & Remote</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Location"
              value={localFilters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
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
              <InputLabel sx={{ color: '#b8c5d6' }}>Remote Work</InputLabel>
              <Select
                value={localFilters.remote === null ? '' : localFilters.remote}
                onChange={(e) => handleFilterChange('remote', e.target.value === '' ? null : e.target.value)}
                sx={{
                  color: '#f5f7fa',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(238, 187, 195, 0.5)' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#eebbc3' },
                  '& .MuiSvgIcon-root': { color: '#b8c5d6' },
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value={true}>Remote Only</MenuItem>
                <MenuItem value={false}>On-site Only</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Industry & Experience */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <BusinessIcon sx={{ color: '#eebbc3' }} />
            <Typography sx={{ color: '#f5f7fa', fontWeight: 600 }}>Industry & Experience</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#b8c5d6' }}>Industry</InputLabel>
              <Select
                value={localFilters.industry}
                onChange={(e) => handleFilterChange('industry', e.target.value)}
                sx={{
                  color: '#f5f7fa',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(238, 187, 195, 0.5)' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#eebbc3' },
                  '& .MuiSvgIcon-root': { color: '#b8c5d6' },
                }}
              >
                <MenuItem value="">All Industries</MenuItem>
                {industries.map((industry) => (
                  <MenuItem key={industry} value={industry}>{industry}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Box>
              <Typography sx={{ color: '#b8c5d6', mb: 1 }}>Experience Range (Years)</Typography>
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
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Compensation */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <MoneyIcon sx={{ color: '#eebbc3' }} />
            <Typography sx={{ color: '#f5f7fa', fontWeight: 600 }}>Compensation</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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

        {/* Recruiter Information */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <WorkIcon sx={{ color: '#eebbc3' }} />
            <Typography sx={{ color: '#f5f7fa', fontWeight: 600 }}>Recruiter Details</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Recruiter Name"
              value={localFilters.recruiterName}
              onChange={(e) => handleFilterChange('recruiterName', e.target.value)}
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
              label="Recruiter Email"
              value={localFilters.recruiterEmail}
              onChange={(e) => handleFilterChange('recruiterEmail', e.target.value)}
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
          !(Array.isArray(value) && value[0] === 0 && value[1] === 20)
        ) && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: '#b8c5d6', mb: 1 }}>Active Filters:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {localFilters.title && (
                <Chip 
                  label={`Title: ${localFilters.title}`} 
                  onDelete={() => handleFilterChange('title', '')}
                  sx={{ backgroundColor: 'rgba(238, 187, 195, 0.2)', color: '#eebbc3' }}
                />
              )}
              {localFilters.organization && (
                <Chip 
                  label={`Org: ${localFilters.organization}`} 
                  onDelete={() => handleFilterChange('organization', '')}
                  sx={{ backgroundColor: 'rgba(238, 187, 195, 0.2)', color: '#eebbc3' }}
                />
              )}
              {localFilters.location && (
                <Chip 
                  label={`Location: ${localFilters.location}`} 
                  onDelete={() => handleFilterChange('location', '')}
                  sx={{ backgroundColor: 'rgba(238, 187, 195, 0.2)', color: '#eebbc3' }}
                />
              )}
              {localFilters.industry && (
                <Chip 
                  label={`Industry: ${localFilters.industry}`} 
                  onDelete={() => handleFilterChange('industry', '')}
                  sx={{ backgroundColor: 'rgba(238, 187, 195, 0.2)', color: '#eebbc3' }}
                />
              )}
              {localFilters.remote !== null && (
                <Chip 
                  label={`Remote: ${localFilters.remote ? 'Yes' : 'No'}`} 
                  onDelete={() => handleFilterChange('remote', null)}
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

export default JobFilter; 