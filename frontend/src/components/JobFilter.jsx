import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  AttachMoney as MoneyIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import ExpertiseSelector from './ExpertiseSelector';
import API_URL from '../config/api';

const JobFilter = ({ filters, setFilters, onApplyFilters, onClearFilters }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem('jwt');
        const response = await axios.get(`${API_URL}/api/clients`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClients(response.data);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };
    fetchClients();
  }, []);

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
      jobId: '',
      title: '',
      organization: '',
      location: '',
      industry: '',
      experience: [0, 20],
      ctcLow: '',
      ctcHigh: '',
      remote: null,
      recruiterName: '',
      recruiterEmail: '',
      domain: '',
      talentPools: [],
      skills: []
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
      background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
      border: '1px solid rgba(0, 0, 0, 0.05)',
      borderRadius: 2,
      p: 2,
      color: '#1e293b',
      height: '100%',
      overflowY: 'auto',
      // Custom scrollbar styling
      '&::-webkit-scrollbar': {
        width: '8px',
      },
      '&::-webkit-scrollbar-track': {
        background: 'rgba(0, 0, 0, 0.05)',
        borderRadius: '4px',
      },
      '&::-webkit-scrollbar-thumb': {
        background: 'linear-gradient(135deg, #8b5cf6 0%, #2563eb 100%)',
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
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterIcon sx={{ color: '#8b5cf6' }} />
          <Typography variant="h6" sx={{ color: '#8b5cf6', fontWeight: 600 }}>
            Job Filters
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={handleClearFilters}
          sx={{ 
            color: '#8b5cf6',
            '&:hover': { backgroundColor: 'rgba(139, 92, 246, 0.08)' }
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
            <SearchIcon sx={{ color: '#8b5cf6' }} />
            <Typography sx={{ color: '#1e293b', fontWeight: 600 }}>Basic Search</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Job ID"
              value={localFilters.jobId}
              onChange={(e) => handleFilterChange('jobId', e.target.value)}
              placeholder="e.g., JOB2411221230451AB"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                },
                '& .MuiInputLabel-root': { color: '#64748b' },
                '& .MuiInputBase-input': { color: '#1e293b', fontFamily: 'monospace' },
              }}
            />
            <TextField
              fullWidth
              label="Job Title"
              value={localFilters.title}
              onChange={(e) => handleFilterChange('title', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                },
                '& .MuiInputLabel-root': { color: '#64748b' },
                '& .MuiInputBase-input': { color: '#1e293b' },
              }}
            />
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#64748b' }}>Organization (Client)</InputLabel>
              <Select
                value={localFilters.organization}
                onChange={(e) => handleFilterChange('organization', e.target.value)}
                label="Organization (Client)"
                sx={{
                  color: '#1e293b',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(238, 187, 195, 0.5)' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8b5cf6' },
                  '& .MuiSvgIcon-root': { color: '#64748b' },
                }}
              >
                <MenuItem value="">All Organizations</MenuItem>
                {clients.map((client) => (
                  <MenuItem key={client._id} value={client.organizationName}>
                    {client.organizationName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.05)' }} />

        {/* Location & Remote */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <LocationIcon sx={{ color: '#8b5cf6' }} />
            <Typography sx={{ color: '#1e293b', fontWeight: 600 }}>Location & Remote</Typography>
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
                  '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                },
                '& .MuiInputLabel-root': { color: '#64748b' },
                '& .MuiInputBase-input': { color: '#1e293b' },
              }}
            />
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#64748b' }}>Remote Work</InputLabel>
              <Select
                value={localFilters.remote === null ? '' : localFilters.remote}
                onChange={(e) => handleFilterChange('remote', e.target.value === '' ? null : e.target.value)}
                sx={{
                  color: '#1e293b',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(238, 187, 195, 0.5)' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8b5cf6' },
                  '& .MuiSvgIcon-root': { color: '#64748b' },
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value={true}>Remote Only</MenuItem>
                <MenuItem value={false}>On-site Only</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.05)' }} />

        {/* Industry & Experience */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <BusinessIcon sx={{ color: '#8b5cf6' }} />
            <Typography sx={{ color: '#1e293b', fontWeight: 600 }}>Industry & Experience</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#64748b' }}>Industry</InputLabel>
              <Select
                value={localFilters.industry}
                onChange={(e) => handleFilterChange('industry', e.target.value)}
                sx={{
                  color: '#1e293b',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(238, 187, 195, 0.5)' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8b5cf6' },
                  '& .MuiSvgIcon-root': { color: '#64748b' },
                }}
              >
                <MenuItem value="">All Industries</MenuItem>
                {industries.map((industry) => (
                  <MenuItem key={industry} value={industry}>{industry}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Box>
              <Typography sx={{ color: '#64748b', mb: 1 }}>Experience Range (Years)</Typography>
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
                  '& .MuiSlider-mark': { backgroundColor: '#b8c5d6' },
                  '& .MuiSlider-markLabel': { color: '#64748b' },
                  '& .MuiSlider-valueLabel': { backgroundColor: '#8b5cf6', color: '#f8fafc' },
                }}
              />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.05)' }} />

        {/* Compensation */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <MoneyIcon sx={{ color: '#8b5cf6' }} />
            <Typography sx={{ color: '#1e293b', fontWeight: 600 }}>Compensation</Typography>
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
                  '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                },
                '& .MuiInputLabel-root': { color: '#64748b' },
                '& .MuiInputBase-input': { color: '#1e293b' },
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
                  '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                },
                '& .MuiInputLabel-root': { color: '#64748b' },
                '& .MuiInputBase-input': { color: '#1e293b' },
              }}
            />
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.05)' }} />

        {/* Recruiter Information */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <WorkIcon sx={{ color: '#8b5cf6' }} />
            <Typography sx={{ color: '#1e293b', fontWeight: 600 }}>Recruiter Details</Typography>
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
                  '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                },
                '& .MuiInputLabel-root': { color: '#64748b' },
                '& .MuiInputBase-input': { color: '#1e293b' },
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
                  '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                },
                '& .MuiInputLabel-root': { color: '#64748b' },
                '& .MuiInputBase-input': { color: '#1e293b' },
              }}
            />
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.05)' }} />

        {/* Expertise Filtration */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <SchoolIcon sx={{ color: '#8b5cf6' }} />
            <Typography sx={{ color: '#1e293b', fontWeight: 600 }}>Expertise Filtration</Typography>
          </Box>
          <ExpertiseSelector
            selectedDomain={localFilters.domain || ''}
            onDomainChange={(value) => handleFilterChange('domain', value)}
            selectedTalentPools={localFilters.talentPools || []}
            onTalentPoolsChange={(value) => handleFilterChange('talentPools', value)}
            selectedSkills={localFilters.skills || []}
            onSkillsChange={(value) => handleFilterChange('skills', value)}
            singleDomain={true}
            multipleTalentPools={true}
            multipleSkills={true}
            required={false}
          />
        </Box>

        {/* Active Filters Display */}
        {Object.values(localFilters).some(value => 
          value !== '' && value !== null && 
          !(Array.isArray(value) && value[0] === 0 && value[1] === 20)
        ) && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>Active Filters:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {localFilters.jobId && (
                <Chip 
                  label={`Job ID: ${localFilters.jobId}`} 
                  onDelete={() => handleFilterChange('jobId', '')}
                  sx={{ backgroundColor: 'rgba(238, 187, 195, 0.2)', color: '#8b5cf6' }}
                />
              )}
              {localFilters.title && (
                <Chip 
                  label={`Title: ${localFilters.title}`} 
                  onDelete={() => handleFilterChange('title', '')}
                  sx={{ backgroundColor: 'rgba(238, 187, 195, 0.2)', color: '#8b5cf6' }}
                />
              )}
              {localFilters.organization && (
                <Chip 
                  label={`Org: ${localFilters.organization}`} 
                  onDelete={() => handleFilterChange('organization', '')}
                  sx={{ backgroundColor: 'rgba(238, 187, 195, 0.2)', color: '#8b5cf6' }}
                />
              )}
              {localFilters.location && (
                <Chip 
                  label={`Location: ${localFilters.location}`} 
                  onDelete={() => handleFilterChange('location', '')}
                  sx={{ backgroundColor: 'rgba(238, 187, 195, 0.2)', color: '#8b5cf6' }}
                />
              )}
              {localFilters.industry && (
                <Chip 
                  label={`Industry: ${localFilters.industry}`} 
                  onDelete={() => handleFilterChange('industry', '')}
                  sx={{ backgroundColor: 'rgba(238, 187, 195, 0.2)', color: '#8b5cf6' }}
                />
              )}
              {localFilters.remote !== null && (
                <Chip 
                  label={`Remote: ${localFilters.remote ? 'Yes' : 'No'}`} 
                  onDelete={() => handleFilterChange('remote', null)}
                  sx={{ backgroundColor: 'rgba(238, 187, 195, 0.2)', color: '#8b5cf6' }}
                />
              )}
              {localFilters.ctcLow && (
                <Chip 
                  label={`CTC Low: ${localFilters.ctcLow} LPA`} 
                  onDelete={() => handleFilterChange('ctcLow', '')}
                  sx={{ backgroundColor: 'rgba(238, 187, 195, 0.2)', color: '#8b5cf6' }}
                />
              )}
              {localFilters.ctcHigh && (
                <Chip 
                  label={`CTC High: ${localFilters.ctcHigh} LPA`} 
                  onDelete={() => handleFilterChange('ctcHigh', '')}
                  sx={{ backgroundColor: 'rgba(238, 187, 195, 0.2)', color: '#8b5cf6' }}
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
            background: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)',
            color: '#fff',
            fontWeight: 600,
            py: 1.5,
            '&:hover': {
              background: 'linear-gradient(135deg, #3a7bd5 0%, #d4a5ac 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 16px rgba(37, 99, 235, 0.18)',
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