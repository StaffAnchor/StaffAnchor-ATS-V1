import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Paper,
  Autocomplete
} from '@mui/material';
import { useLocationDropdowns } from './useLocationDropdowns';
import API_URL from '../config/api';

const JobFilterModal = ({ open, onClose, filters, onApplyFilters, onClearFilters }) => {
  const [localFilters, setLocalFilters] = useState({ ...filters });
  const [clients, setClients] = useState([]);
  const { countries, states, cities, fetchStates, fetchCities } = useLocationDropdowns();

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

  const handleChange = (field, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCountryChange = async (value) => {
    handleChange('country', value);
    handleChange('state', '');
    handleChange('city', '');
    if (value) {
      await fetchStates(value);
    }
  };

  const handleStateChange = async (value) => {
    handleChange('state', value);
    handleChange('city', '');
    if (value && localFilters.country) {
      await fetchCities(localFilters.country, value);
    }
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleClear = () => {
    const clearedFilters = {
      jobId: '',
      title: '',
      organization: '',
      country: '',
      state: '',
      city: '',
      industry: '',
      experience: [0, 20],
      ctcLow: '',
      ctcHigh: '',
      remote: null,
      status: ''
    };
    setLocalFilters(clearedFilters);
    onClearFilters();
  };

  const statusOptions = ['New', 'In Progress', 'Halted', 'Withdrawn', 'Completed'];

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
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
        fontWeight: 700,
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        pb: 2
      }}>
        Filter Jobs
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Job ID */}
          <TextField
            fullWidth
            label="Job ID"
            value={localFilters.jobId}
            onChange={(e) => handleChange('jobId', e.target.value)}
            placeholder="e.g., JOB2411221230451AB"
            sx={{
              '& .MuiInputBase-input': { color: '#1e293b', fontFamily: 'monospace' },
              '& .MuiInputLabel-root': { color: '#64748b' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                '&:hover fieldset': { borderColor: 'rgba(37, 99, 235, 0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#2563eb' },
              }
            }}
          />

          {/* Job Title */}
          <TextField
            fullWidth
            label="Job Title"
            value={localFilters.title}
            onChange={(e) => handleChange('title', e.target.value)}
            sx={{
              '& .MuiInputBase-input': { color: '#1e293b' },
              '& .MuiInputLabel-root': { color: '#64748b' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                '&:hover fieldset': { borderColor: 'rgba(37, 99, 235, 0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#2563eb' },
              }
            }}
          />

          {/* Organization */}
          <FormControl fullWidth>
            <InputLabel sx={{ color: '#64748b' }}>Organization (Client)</InputLabel>
            <Select
              value={localFilters.organization}
              onChange={(e) => handleChange('organization', e.target.value)}
              label="Organization (Client)"
              sx={{
                color: '#1e293b',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(37, 99, 235, 0.5)' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2563eb' },
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

          {/* Location Filters */}
          <Paper sx={{ p: 2, background: 'rgba(37, 99, 235, 0.05)', border: '1px solid rgba(37, 99, 235, 0.1)' }}>
            <Typography variant="h6" sx={{ color: '#2563eb', mb: 2, fontWeight: 600 }}>
              Location
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Country */}
              <Autocomplete
                value={localFilters.country || null}
                onChange={(e, newValue) => handleCountryChange(newValue)}
                options={countries}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Country"
                    sx={{
                      '& .MuiInputBase-input': { color: '#1e293b' },
                      '& .MuiInputLabel-root': { color: '#64748b' },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                        '&:hover fieldset': { borderColor: 'rgba(37, 99, 235, 0.5)' },
                        '&.Mui-focused fieldset': { borderColor: '#2563eb' },
                      }
                    }}
                  />
                )}
              />

              {/* State */}
              <Autocomplete
                value={localFilters.state || null}
                onChange={(e, newValue) => handleStateChange(newValue)}
                options={states}
                disabled={!localFilters.country}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="State"
                    sx={{
                      '& .MuiInputBase-input': { color: '#1e293b' },
                      '& .MuiInputLabel-root': { color: '#64748b' },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                        '&:hover fieldset': { borderColor: 'rgba(37, 99, 235, 0.5)' },
                        '&.Mui-focused fieldset': { borderColor: '#2563eb' },
                      }
                    }}
                  />
                )}
              />

              {/* City */}
              <Autocomplete
                value={localFilters.city || null}
                onChange={(e, newValue) => handleChange('city', newValue)}
                options={cities}
                disabled={!localFilters.state}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="City"
                    sx={{
                      '& .MuiInputBase-input': { color: '#1e293b' },
                      '& .MuiInputLabel-root': { color: '#64748b' },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                        '&:hover fieldset': { borderColor: 'rgba(37, 99, 235, 0.5)' },
                        '&.Mui-focused fieldset': { borderColor: '#2563eb' },
                      }
                    }}
                  />
                )}
              />
            </Box>
          </Paper>

          {/* Industry */}
          <TextField
            fullWidth
            label="Industry"
            value={localFilters.industry}
            onChange={(e) => handleChange('industry', e.target.value)}
            sx={{
              '& .MuiInputBase-input': { color: '#1e293b' },
              '& .MuiInputLabel-root': { color: '#64748b' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                '&:hover fieldset': { borderColor: 'rgba(37, 99, 235, 0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#2563eb' },
              }
            }}
          />

          {/* Status */}
          <FormControl fullWidth>
            <InputLabel sx={{ color: '#64748b' }}>Status</InputLabel>
            <Select
              value={localFilters.status || ''}
              onChange={(e) => handleChange('status', e.target.value)}
              label="Status"
              sx={{
                color: '#1e293b',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(37, 99, 235, 0.5)' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2563eb' },
              }}
            >
              <MenuItem value="">All</MenuItem>
              {statusOptions.map(status => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Experience Range */}
          <Box>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
              Experience (years): {localFilters.experience[0]} - {localFilters.experience[1]}
            </Typography>
            <Slider
              value={localFilters.experience}
              onChange={(e, value) => handleChange('experience', value)}
              min={0}
              max={20}
              valueLabelDisplay="auto"
              sx={{
                color: '#2563eb',
                '& .MuiSlider-thumb': {
                  backgroundColor: '#2563eb',
                },
                '& .MuiSlider-track': {
                  backgroundColor: '#2563eb',
                },
                '& .MuiSlider-rail': {
                  backgroundColor: 'rgba(0, 0, 0, 0.08)',
                },
              }}
            />
          </Box>

          {/* CTC Range */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Min CTC (LPA)"
              type="number"
              value={localFilters.ctcLow}
              onChange={(e) => handleChange('ctcLow', e.target.value)}
              sx={{
                flex: 1,
                '& .MuiInputBase-input': { color: '#1e293b' },
                '& .MuiInputLabel-root': { color: '#64748b' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                  '&:hover fieldset': { borderColor: 'rgba(37, 99, 235, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#2563eb' },
                }
              }}
            />
            <TextField
              label="Max CTC (LPA)"
              type="number"
              value={localFilters.ctcHigh}
              onChange={(e) => handleChange('ctcHigh', e.target.value)}
              sx={{
                flex: 1,
                '& .MuiInputBase-input': { color: '#1e293b' },
                '& .MuiInputLabel-root': { color: '#64748b' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                  '&:hover fieldset': { borderColor: 'rgba(37, 99, 235, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#2563eb' },
                }
              }}
            />
          </Box>

          {/* Remote */}
          <FormControl fullWidth>
            <InputLabel sx={{ color: '#64748b' }}>Remote Work</InputLabel>
            <Select
              value={localFilters.remote === null ? '' : localFilters.remote}
              onChange={(e) => handleChange('remote', e.target.value === '' ? null : e.target.value)}
              label="Remote Work"
              sx={{
                color: '#1e293b',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(37, 99, 235, 0.5)' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2563eb' },
              }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value={true}>Yes</MenuItem>
              <MenuItem value={false}>No</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ 
        p: 3, 
        pt: 2,
        borderTop: '1px solid rgba(0, 0, 0, 0.05)',
        gap: 2
      }}>
        <Button 
          onClick={handleClear}
          variant="outlined"
          sx={{
            borderColor: '#ef4444',
            color: '#ef4444',
            '&:hover': {
              borderColor: '#dc2626',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
            },
          }}
        >
          Clear Filters
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: 'rgba(0, 0, 0, 0.08)',
            color: '#64748b',
            '&:hover': {
              borderColor: '#64748b',
            },
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleApply}
          variant="contained"
          sx={{
            backgroundColor: '#2563eb',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#1d4ed8',
            },
          }}
        >
          Apply Filters
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JobFilterModal;




