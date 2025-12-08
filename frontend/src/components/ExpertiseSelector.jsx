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
  Alert,
  Checkbox,
  ListItemText
} from '@mui/material';
import axios from 'axios';
import API_URL from '../config/api';

/**
 * Cascading selector for Domain → Talent Pools → Skills
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
const ExpertiseSelector = ({
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
      const token = localStorage.getItem('jwt');
      const response = await axios.get(`${API_URL}/api/domains`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      const token = localStorage.getItem('jwt');
      const response = await axios.get(`${API_URL}/api/domains/${domainId}/talent-pools`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      const token = localStorage.getItem('jwt');
      const response = await axios.get(`${API_URL}/api/skills`, {
        headers: { Authorization: `Bearer ${token}` },
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

  return (
    <Paper sx={{ p: 3, background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.1)' }}>
      <Typography variant="h6" sx={{ color: '#8b5cf6', mb: 0.5, fontWeight: 600 }}>
        Expertise Selection
      </Typography>
      <Typography variant="body2" sx={{ color: '#64748b', mb: 2, fontSize: '0.875rem' }}>
        You can select multiple talent pools and skills
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Domain Selection */}
        <FormControl fullWidth required={required}>
          <InputLabel>Domain</InputLabel>
          <Select
            value={selectedDomain || ''}
            onChange={handleDomainChange}
            label="Domain"
            disabled={loading}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(139, 92, 246, 0.2)' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#8b5cf6' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8b5cf6' },
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
        <Box>
          <FormControl fullWidth required={required} disabled={!selectedDomain}>
            <InputLabel>Talent Pool{multipleTalentPools ? 's' : ''}</InputLabel>
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
                        backgroundColor: 'rgba(139, 92, 246, 0.15)', 
                        color: '#8b5cf6',
                        border: '1px solid rgba(139, 92, 246, 0.3)'
                      }}
                    />
                  ))}
                </Box>
              ) : undefined}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(139, 92, 246, 0.2)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#8b5cf6' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8b5cf6' },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    maxHeight: 300,
                    '& .MuiMenuItem-root': {
                      padding: '8px 16px',
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        '&:hover': {
                          backgroundColor: 'rgba(139, 92, 246, 0.15)'
                        }
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
                    <Checkbox 
                      checked={selectedTalentPools.indexOf(pool._id) > -1} 
                      sx={{ 
                        color: '#8b5cf6',
                        '&.Mui-checked': { color: '#8b5cf6' }
                      }}
                    />
                    <ListItemText primary={pool.name} />
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
          {multipleTalentPools && selectedDomain && (
            <Typography variant="caption" sx={{ color: '#64748b', mt: 0.5, display: 'block' }}>
              Select one or more talent pools
            </Typography>
          )}
        </Box>

        {/* Skills Selection */}
        <Box>
          <FormControl fullWidth required={required} disabled={!selectedTalentPools || selectedTalentPools.length === 0}>
            <InputLabel>Skill{multipleSkills ? 's' : ''}</InputLabel>
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
                        backgroundColor: 'rgba(37, 99, 235, 0.15)', 
                        color: '#2563eb',
                        border: '1px solid rgba(37, 99, 235, 0.3)',
                        textTransform: 'capitalize'
                      }}
                    />
                  ))}
                </Box>
              ) : undefined}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(139, 92, 246, 0.2)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#8b5cf6' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8b5cf6' },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    maxHeight: 300,
                    '& .MuiMenuItem-root': {
                      padding: '8px 16px',
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        '&:hover': {
                          backgroundColor: 'rgba(37, 99, 235, 0.15)'
                        }
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
                    <Checkbox 
                      checked={selectedSkills.indexOf(skill._id) > -1} 
                      sx={{ 
                        color: '#2563eb',
                        '&.Mui-checked': { color: '#2563eb' }
                      }}
                    />
                    <ListItemText primary={skill.name} sx={{ '& .MuiTypography-root': { textTransform: 'capitalize' } }} />
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
          {multipleSkills && selectedTalentPools.length > 0 && (
            <Typography variant="caption" sx={{ color: '#64748b', mt: 0.5, display: 'block' }}>
              Select one or more skills
            </Typography>
          )}
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} sx={{ color: '#8b5cf6' }} />
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default ExpertiseSelector;

