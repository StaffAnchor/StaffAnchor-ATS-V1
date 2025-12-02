import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import axios from 'axios';
import API_URL from '../config/api';

/**
 * Public Cascading selector for Domain → Talent Pools → Skills (no authentication required)
 * @param {Object} props
 * @param {string} props.selectedDomain - Selected domain ID
 * @param {function} props.onDomainChange - Callback when domain changes
 * @param {Array} props.selectedTalentPools - Array of selected talent pool IDs
 * @param {function} props.onTalentPoolsChange - Callback when talent pools change
 * @param {Array} props.selectedSkills - Array of selected skill IDs
 * @param {function} props.onSkillsChange - Callback when skills change
 * @param {boolean} props.singleDomain - If true, only one domain can be selected (default true)
 * @param {boolean} props.multipleTalentPools - If true, multiple talent pools can be selected
 * @param {boolean} props.multipleSkills - If true, multiple skills can be selected
 * @param {boolean} props.required - If true, all fields are required
 */
const PublicExpertiseSelector = ({
  selectedDomain,
  onDomainChange,
  selectedTalentPools = [],
  onTalentPoolsChange,
  selectedSkills = [],
  onSkillsChange,
  singleDomain = true,
  multipleTalentPools = true,
  multipleSkills = true,
  required = false
}) => {
  const [domains, setDomains] = useState([]);
  const [talentPools, setTalentPools] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch domains on mount
  useEffect(() => {
    fetchDomains();
  }, []);

  // Fetch talent pools when domain changes
  useEffect(() => {
    if (selectedDomain) {
      fetchTalentPools(selectedDomain);
    } else {
      setTalentPools([]);
      setSkills([]);
      onTalentPoolsChange([]);
      onSkillsChange([]);
    }
  }, [selectedDomain]);

  // Fetch skills when talent pools change
  useEffect(() => {
    if (selectedTalentPools && selectedTalentPools.length > 0) {
      fetchSkills(selectedTalentPools);
    } else {
      setSkills([]);
      onSkillsChange([]);
    }
  }, [selectedTalentPools.join(',')]); // Use join to create dependency

  // Validate selected skills against loaded skills and remove invalid IDs
  useEffect(() => {
    if (skills.length > 0 && selectedSkills.length > 0) {
      const validSkillIds = skills.map(s => s._id);
      const validatedSkills = selectedSkills.filter(id => validSkillIds.includes(id));
      
      // If some skills were invalid, update the selection
      if (validatedSkills.length !== selectedSkills.length) {
        const invalidIds = selectedSkills.filter(id => !validSkillIds.includes(id));
        console.warn('Removed invalid skill IDs:', invalidIds);
        onSkillsChange(validatedSkills);
      }
    }
  }, [skills]);

  // Validate selected talent pools against loaded talent pools and remove invalid IDs
  useEffect(() => {
    if (talentPools.length > 0 && selectedTalentPools.length > 0) {
      const validPoolIds = talentPools.map(tp => tp._id);
      const validatedPools = selectedTalentPools.filter(id => validPoolIds.includes(id));
      
      // If some pools were invalid, update the selection
      if (validatedPools.length !== selectedTalentPools.length) {
        const invalidIds = selectedTalentPools.filter(id => !validPoolIds.includes(id));
        console.warn('Removed invalid talent pool IDs:', invalidIds);
        onTalentPoolsChange(validatedPools);
      }
    }
  }, [talentPools]);

  const fetchDomains = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/domains/public`);
      setDomains(response.data);
    } catch (err) {
      console.error('Error fetching domains:', err);
      setError('Failed to load domains');
    } finally {
      setLoading(false);
    }
  };

  const fetchTalentPools = async (domainId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/domains/public/${domainId}/talent-pools`);
      setTalentPools(response.data);
    } catch (err) {
      console.error('Error fetching talent pools:', err);
      setError('Failed to load talent pools');
    } finally {
      setLoading(false);
    }
  };

  const fetchSkills = async (talentPoolIds) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/domains/public/skills/by-talent-pools`, {
        params: { talentPoolIds: talentPoolIds.join(',') }
      });
      setSkills(response.data);
    } catch (err) {
      console.error('Error fetching skills:', err);
      setError('Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const handleDomainChange = (event) => {
    const value = event.target.value;
    onDomainChange(value);
  };

  const handleTalentPoolsChange = (event) => {
    const value = event.target.value;
    onTalentPoolsChange(typeof value === 'string' ? value.split(',') : value);
  };

  const handleSkillsChange = (event) => {
    const value = event.target.value;
    onSkillsChange(typeof value === 'string' ? value.split(',') : value);
  };

  const getTalentPoolName = (id) => {
    const pool = talentPools.find(tp => tp._id === id);
    return pool ? pool.name : 'Loading...';
  };

  const getSkillName = (id) => {
    const skill = skills.find(s => s._id === id);
    return skill ? skill.name : 'Loading...';
  };

  // Input styles matching the PublicJobApplication theme
  const selectStyles = {
    color: '#1e293b',
    backgroundColor: '#fff',
    borderRadius: '6px',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ddd' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#bbb' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1976d2' },
    '& .MuiSvgIcon-root': { color: '#475569' }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ 
        color: '#475569', 
        mb: { xs: 1.5, sm: 2 },
        fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }
      }}>
        Expertise *
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
        {/* Domain Selection */}
        <FormControl fullWidth required={required}>
          <InputLabel sx={{ color: '#64748b' }}>Domain</InputLabel>
          <Select
            value={selectedDomain || ''}
            onChange={handleDomainChange}
            label="Domain"
            disabled={loading}
            sx={selectStyles}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  '& .MuiMenuItem-root': {
                    color: '#1e293b',
                    '&:hover': {
                      backgroundColor: '#f5f5f5'
                    },
                    '&.Mui-selected': {
                      backgroundColor: '#f0f0f0',
                      color: '#1e293b'
                    }
                  }
                }
              }
            }}
          >
            {domains.map((domain) => (
              <MenuItem key={domain._id} value={domain._id}>
                {domain.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Talent Pool Selection */}
        <FormControl fullWidth required={required} disabled={!selectedDomain}>
          <InputLabel sx={{ color: '#64748b' }}>Talent Pool{multipleTalentPools ? 's' : ''}</InputLabel>
          <Select
            multiple={multipleTalentPools}
            value={multipleTalentPools ? selectedTalentPools : (selectedTalentPools[0] || '')}
            onChange={handleTalentPoolsChange}
            label={`Talent Pool${multipleTalentPools ? 's' : ''}`}
            disabled={loading || !selectedDomain}
            renderValue={multipleTalentPools ? (selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip 
                    key={value} 
                    label={getTalentPoolName(value)} 
                    size="small"
                    sx={{ 
                      backgroundColor: '#ffffff',
                      border: '1px solid #ddd',
                      color: '#1e293b'
                    }}
                  />
                ))}
              </Box>
            ) : undefined}
            sx={selectStyles}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  '& .MuiMenuItem-root': {
                    color: '#1e293b',
                    '&:hover': {
                      backgroundColor: '#f5f5f5'
                    },
                    '&.Mui-selected': {
                      backgroundColor: '#f0f0f0',
                      color: '#1e293b'
                    }
                  }
                }
              }
            }}
          >
            {talentPools.length === 0 ? (
              <MenuItem disabled>
                {selectedDomain ? 'No talent pools available' : 'Select a domain first'}
              </MenuItem>
            ) : (
              talentPools.map((pool) => (
                <MenuItem key={pool._id} value={pool._id}>
                  {pool.name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        {/* Skills Selection */}
        <FormControl fullWidth required={required} disabled={!selectedTalentPools || selectedTalentPools.length === 0}>
          <InputLabel sx={{ color: '#64748b' }}>Skill{multipleSkills ? 's' : ''}</InputLabel>
          <Select
            multiple={multipleSkills}
            value={multipleSkills ? selectedSkills : (selectedSkills[0] || '')}
            onChange={handleSkillsChange}
            label={`Skill${multipleSkills ? 's' : ''}`}
            disabled={loading || !selectedTalentPools || selectedTalentPools.length === 0}
            renderValue={multipleSkills ? (selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip 
                    key={value} 
                    label={getSkillName(value)} 
                    size="small"
                    sx={{ 
                      backgroundColor: '#ffffff',
                      border: '1px solid #ddd',
                      color: '#1e293b',
                      textTransform: 'capitalize'
                    }}
                  />
                ))}
              </Box>
            ) : undefined}
            sx={selectStyles}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  '& .MuiMenuItem-root': {
                    color: '#1e293b',
                    '&:hover': {
                      backgroundColor: '#f5f5f5'
                    },
                    '&.Mui-selected': {
                      backgroundColor: '#f0f0f0',
                      color: '#1e293b'
                    }
                  }
                }
              }
            }}
          >
            {skills.length === 0 ? (
              <MenuItem disabled>
                {selectedTalentPools.length > 0 ? 'No skills available' : 'Select talent pool(s) first'}
              </MenuItem>
            ) : (
              skills.map((skill) => (
                <MenuItem key={skill._id} value={skill._id}>
                  {skill.name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
            <CircularProgress size={20} sx={{ color: '#1976d2' }} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PublicExpertiseSelector;




