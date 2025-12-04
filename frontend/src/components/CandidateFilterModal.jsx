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
  Autocomplete,
  Divider,
  Paper,
  CircularProgress
} from '@mui/material';
import {
  Clear as ClearIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Psychology as PsychologyIcon,
  Build as BuildIcon
} from '@mui/icons-material';
import axios from 'axios';
import API_URL from '../config/api';

const CandidateFilterModal = ({ open, onClose, filters, onApplyFilters, onClearFilters, allSkills = [] }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  
  // Expertise filter state
  const [domains, setDomains] = useState([]);
  const [expertiseTalentPools, setExpertiseTalentPools] = useState([]);
  const [expertiseSkillsList, setExpertiseSkillsList] = useState([]);
  const [loadingDomains, setLoadingDomains] = useState(false);
  const [loadingPools, setLoadingPools] = useState(false);
  const [loadingSkills, setLoadingSkills] = useState(false);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, open]);

  // Fetch domains when modal opens
  useEffect(() => {
    if (open) {
      fetchDomains();
    }
  }, [open]);

  // Fetch talent pools when domain changes
  useEffect(() => {
    if (localFilters.domain) {
      fetchTalentPools(localFilters.domain);
    } else {
      setExpertiseTalentPools([]);
      setExpertiseSkillsList([]);
    }
  }, [localFilters.domain]);

  // Fetch skills when talent pools change
  useEffect(() => {
    const pools = localFilters.expertiseTalentPools;
    if (pools && pools.length > 0) {
      fetchSkills(pools);
    } else {
      setExpertiseSkillsList([]);
    }
  }, [localFilters.expertiseTalentPools?.join(',')]);

  const fetchDomains = async () => {
    try {
      setLoadingDomains(true);
      const token = localStorage.getItem('jwt');
      const response = await axios.get(`${API_URL}/api/domains`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDomains(response.data);
    } catch (err) {
      console.error('Error fetching domains:', err);
    } finally {
      setLoadingDomains(false);
    }
  };

  const fetchTalentPools = async (domainId) => {
    try {
      setLoadingPools(true);
      const token = localStorage.getItem('jwt');
      const response = await axios.get(`${API_URL}/api/domains/${domainId}/talent-pools`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExpertiseTalentPools(response.data);
    } catch (err) {
      console.error('Error fetching talent pools:', err);
    } finally {
      setLoadingPools(false);
    }
  };

  const fetchSkills = async (poolIds) => {
    try {
      setLoadingSkills(true);
      const token = localStorage.getItem('jwt');
      const response = await axios.get(`${API_URL}/api/skills`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { talentPoolIds: poolIds.join(',') }
      });
      setExpertiseSkillsList(response.data);
    } catch (err) {
      console.error('Error fetching skills:', err);
    } finally {
      setLoadingSkills(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setLocalFilters(prev => {
      const newFilters = { ...prev, [field]: value };
      
      // Clear dependent fields when parent changes
      if (field === 'domain') {
        newFilters.expertiseTalentPools = [];
        newFilters.expertiseSkills = [];
      } else if (field === 'expertiseTalentPools') {
        newFilters.expertiseSkills = [];
      }
      
      return newFilters;
    });
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
      domain: '',
      expertiseTalentPools: [],
      expertiseSkills: []
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

  const getTalentPoolName = (id) => {
    const pool = expertiseTalentPools.find(tp => tp._id === id);
    return pool ? pool.name : 'Loading...';
  };

  const getSkillName = (id) => {
    const skill = expertiseSkillsList.find(s => s._id === id);
    return skill ? skill.name : 'Loading...';
  };

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
        pb: 2,
        fontWeight: 700,
        color: '#8b5cf6'
      }}>
        Candidate Filters
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
                value={localFilters.name || ''}
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
                value={localFilters.email || ''}
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
                value={localFilters.phone || ''}
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

          <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.08)' }} />

          {/* Expertise Filter */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <PsychologyIcon sx={{ color: '#8b5cf6' }} />
              <Typography variant="h6" sx={{ color: '#8b5cf6', fontWeight: 600 }}>Expertise Filter</Typography>
            </Box>
            <Paper sx={{ p: 3, background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.1)' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Domain Selection */}
                <FormControl fullWidth>
                  <InputLabel>Domain</InputLabel>
                  <Select
                    value={localFilters.domain || ''}
                    onChange={(e) => handleFilterChange('domain', e.target.value)}
                    label="Domain"
                    disabled={loadingDomains}
                  >
                    <MenuItem value="">
                      <em>Select Domain</em>
                    </MenuItem>
                    {domains.map((domain) => (
                      <MenuItem key={domain._id} value={domain._id}>
                        {domain.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Talent Pool Selection */}
                <FormControl fullWidth disabled={!localFilters.domain}>
                  <InputLabel>Talent Pools</InputLabel>
                  <Select
                    multiple
                    value={localFilters.expertiseTalentPools || []}
                    onChange={(e) => handleFilterChange('expertiseTalentPools', e.target.value)}
                    label="Talent Pools"
                    disabled={loadingPools || !localFilters.domain}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip 
                            key={value} 
                            label={getTalentPoolName(value)} 
                            size="small"
                            sx={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {expertiseTalentPools.length === 0 ? (
                      <MenuItem disabled>
                        {localFilters.domain ? 'No talent pools available' : 'Select a domain first'}
                      </MenuItem>
                    ) : (
                      expertiseTalentPools.map((pool) => (
                        <MenuItem key={pool._id} value={pool._id}>
                          {pool.name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>

                {/* Skills Selection */}
                <FormControl fullWidth disabled={!localFilters.expertiseTalentPools || localFilters.expertiseTalentPools.length === 0}>
                  <InputLabel>Skills</InputLabel>
                  <Select
                    multiple
                    value={localFilters.expertiseSkills || []}
                    onChange={(e) => handleFilterChange('expertiseSkills', e.target.value)}
                    label="Skills"
                    disabled={loadingSkills || !localFilters.expertiseTalentPools || localFilters.expertiseTalentPools.length === 0}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip 
                            key={value} 
                            label={getSkillName(value)} 
                            size="small"
                            sx={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }}
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {expertiseSkillsList.length === 0 ? (
                      <MenuItem disabled>
                        {localFilters.expertiseTalentPools?.length > 0 ? 'No skills available' : 'Select talent pool(s) first'}
                      </MenuItem>
                    ) : (
                      expertiseSkillsList.map((skill) => (
                        <MenuItem key={skill._id} value={skill._id}>
                          {skill.name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>

                {(loadingDomains || loadingPools || loadingSkills) && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                    <CircularProgress size={20} sx={{ color: '#8b5cf6' }} />
                  </Box>
                )}
              </Box>
            </Paper>
          </Box>

          <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.08)' }} />

          {/* Miscellaneous Skills */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <BuildIcon sx={{ color: '#8b5cf6' }} />
              <Typography variant="h6" sx={{ color: '#8b5cf6', fontWeight: 600 }}>Miscellaneous Skills</Typography>
            </Box>
            <Autocomplete
              multiple
              options={allSkills}
              value={localFilters.skills || []}
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
                    sx={{ backgroundColor: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' }}
                  />
                ))
              }
            />
          </Box>

          <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.08)' }} />

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
                value={localFilters.company || ''}
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
                  value={localFilters.position || ''}
                  onChange={(e) => handleFilterChange('position', e.target.value)}
                  label="Position"
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
                  value={localFilters.experience || [0, 20]}
                  onChange={(e, newValue) => handleFilterChange('experience', newValue)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={20}
                  marks={experienceMarks}
                  sx={{ color: '#8b5cf6' }}
                />
              </Box>
              <TextField
                fullWidth
                label="Lowest CTC (LPA)"
                value={localFilters.ctcLow || ''}
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
                value={localFilters.ctcHigh || ''}
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

          <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.08)' }} />

          {/* Education */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <SchoolIcon sx={{ color: '#8b5cf6' }} />
              <Typography variant="h6" sx={{ color: '#8b5cf6', fontWeight: 600 }}>Education</Typography>
            </Box>
            <FormControl fullWidth>
              <InputLabel>Education Level</InputLabel>
              <Select
                value={localFilters.education || ''}
                onChange={(e) => handleFilterChange('education', e.target.value)}
                label="Education Level"
              >
                <MenuItem value="">All Education Levels</MenuItem>
                {educationLevels.map((level) => (
                  <MenuItem key={level} value={level}>{level}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(0, 0, 0, 0.05)' }}>
        <Button 
          onClick={handleClear}
          sx={{ color: '#64748b', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
        >
          Clear All
        </Button>
        <Button 
          onClick={onClose}
          sx={{ color: '#64748b', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
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
            '&:hover': { background: 'linear-gradient(135deg, #3a7bd5 0%, #7c3aed 100%)' }
          }}
        >
          Apply Filters
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CandidateFilterModal;
