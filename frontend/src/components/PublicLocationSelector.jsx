import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Typography,
  IconButton,
  Grid,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import API_URL from '../config/api';

const PublicLocationSelector = ({ selectedLocations, onLocationsChange, multiple = true, required = false }) => {
  const [locations, setLocations] = useState([{ country: '', state: '', city: '' }]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([[]]);
  const [cities, setCities] = useState([[]]);
  const [loading, setLoading] = useState(false);

  // Fetch countries on mount
  useEffect(() => {
    fetchCountries();
  }, []);

  // Sync internal state with external state
  useEffect(() => {
    if (selectedLocations && selectedLocations.length > 0) {
      // Parse locations from strings to objects
      const parsedLocations = selectedLocations.map(locStr => {
        const parts = locStr.split(',').map(p => p.trim());
        return {
          country: parts[2] || '',
          state: parts[1] || '',
          city: parts[0] || ''
        };
      });
      setLocations(parsedLocations);
    }
  }, []);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/locations/countries`);
      setCountries(res.data.data || []);
    } catch (error) {
      console.error('Error fetching countries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatesForLocation = async (idx, country) => {
    try {
      const res = await axios.post(`${API_URL}/api/locations/states`, { country });
      const newStates = [...states];
      newStates[idx] = res.data.data || [];
      setStates(newStates);
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  const fetchCitiesForLocation = async (idx, country, state) => {
    try {
      const res = await axios.post(`${API_URL}/api/locations/cities`, { country, state });
      const newCities = [...cities];
      newCities[idx] = res.data.data || [];
      setCities(newCities);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const handleLocationChange = async (idx, field, value) => {
    const updated = [...locations];
    updated[idx][field] = value;

    // Reset dependent fields
    if (field === 'country') {
      updated[idx].state = '';
      updated[idx].city = '';
      await fetchStatesForLocation(idx, value);
      const newCities = [...cities];
      newCities[idx] = [];
      setCities(newCities);
    } else if (field === 'state') {
      updated[idx].city = '';
      await fetchCitiesForLocation(idx, updated[idx].country, value);
    }

    setLocations(updated);
    notifyParent(updated);
  };

  const addLocation = () => {
    if (multiple) {
      setLocations([...locations, { country: '', state: '', city: '' }]);
      setStates([...states, []]);
      setCities([...cities, []]);
    }
  };

  const removeLocation = (idx) => {
    if (locations.length > 1) {
      setLocations(locations.filter((_, i) => i !== idx));
      setStates(states.filter((_, i) => i !== idx));
      setCities(cities.filter((_, i) => i !== idx));
      notifyParent(locations.filter((_, i) => i !== idx));
    }
  };

  const notifyParent = (locs) => {
    // Convert location objects to strings for parent component
    const locationStrings = locs
      .filter(loc => loc.city && loc.state && loc.country)
      .map(loc => `${loc.city}, ${loc.state}, ${loc.country}`);
    onLocationsChange(locationStrings);
  };

  const selectStyles = {
    color: '#1e293b',
    backgroundColor: '#fff',
    borderRadius: '6px',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ddd' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#bbb' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1976d2' },
    '& .MuiSvgIcon-root': { color: '#475569' }
  };

  const menuProps = {
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
  };

  return (
    <Box>
      {locations.map((loc, idx) => (
        <Card key={idx} sx={{
          mb: 2,
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px'
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: 2
            }}>
              <Typography sx={{ 
                color: '#1e293b',
                fontWeight: 500,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}>
                Location {idx + 1}
              </Typography>
              <Box>
                {locations.length > 1 && (
                  <IconButton 
                    onClick={() => removeLocation(idx)}
                    sx={{ 
                      color: '#f44336',
                      padding: { xs: '4px', sm: '8px' }
                    }}
                    size={window.innerWidth < 600 ? 'small' : 'medium'}
                  >
                    <DeleteIcon fontSize={window.innerWidth < 600 ? 'small' : 'medium'} />
                  </IconButton>
                )}
                {multiple && idx === locations.length - 1 && (
                  <IconButton 
                    onClick={addLocation}
                    sx={{ 
                      color: '#1976d2',
                      padding: { xs: '4px', sm: '8px' }
                    }}
                    size={window.innerWidth < 600 ? 'small' : 'medium'}
                  >
                    <AddIcon fontSize={window.innerWidth < 600 ? 'small' : 'medium'} />
                  </IconButton>
                )}
              </Box>
            </Box>

            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
              {/* Country */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel 
                    sx={{ 
                      color: '#64748b',
                      '&.MuiInputLabel-shrink': {
                        transform: 'translate(14px, -9px) scale(0.75)'
                      }
                    }}
                  >
                    Country
                  </InputLabel>
                  <Select
                    value={loc.country}
                    onChange={(e) => handleLocationChange(idx, 'country', e.target.value)}
                    label="Country"
                    disabled={loading}
                    displayEmpty
                    sx={selectStyles}
                    MenuProps={menuProps}
                    renderValue={(selected) => {
                      if (!selected) {
                        return <em style={{ color: '#9ca3af', fontStyle: 'normal' }}>Country</em>;
                      }
                      return selected;
                    }}
                  >
                    <MenuItem value="">
                      <em>Select Country</em>
                    </MenuItem>
                    {countries.map((country) => (
                      <MenuItem key={country} value={country}>
                        {country}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* State */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth disabled={!loc.country}>
                  <InputLabel 
                    sx={{ 
                      color: '#64748b',
                      '&.MuiInputLabel-shrink': {
                        transform: 'translate(14px, -9px) scale(0.75)'
                      }
                    }}
                  >
                    State
                  </InputLabel>
                  <Select
                    value={loc.state}
                    onChange={(e) => handleLocationChange(idx, 'state', e.target.value)}
                    label="State"
                    displayEmpty
                    sx={selectStyles}
                    MenuProps={menuProps}
                    renderValue={(selected) => {
                      if (!selected) {
                        return <em style={{ color: '#9ca3af', fontStyle: 'normal' }}>State</em>;
                      }
                      return selected;
                    }}
                  >
                    <MenuItem value="">
                      <em>Select State</em>
                    </MenuItem>
                    {(states[idx] || []).map((state) => (
                      <MenuItem key={state} value={state}>
                        {state}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* City */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth disabled={!loc.state}>
                  <InputLabel 
                    sx={{ 
                      color: '#64748b',
                      '&.MuiInputLabel-shrink': {
                        transform: 'translate(14px, -9px) scale(0.75)'
                      }
                    }}
                  >
                    City
                  </InputLabel>
                  <Select
                    value={loc.city}
                    onChange={(e) => handleLocationChange(idx, 'city', e.target.value)}
                    label="City"
                    displayEmpty
                    sx={selectStyles}
                    MenuProps={menuProps}
                    renderValue={(selected) => {
                      if (!selected) {
                        return <em style={{ color: '#9ca3af', fontStyle: 'normal' }}>City</em>;
                      }
                      return selected;
                    }}
                  >
                    <MenuItem value="">
                      <em>Select City</em>
                    </MenuItem>
                    {(cities[idx] || []).map((city) => (
                      <MenuItem key={city} value={city}>
                        {city}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
    </Box>
  );
};

export default PublicLocationSelector;

