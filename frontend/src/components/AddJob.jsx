import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import useEmailNotification from '../hooks/useEmailNotification';
import EmailConfirmationModal from './EmailConfirmationModal';
import { 
  TextField, 
  Switch, 
  FormControlLabel, 
  Button, 
  Box, 
  MenuItem, 
  Typography,
  Paper,
  Grid,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  IconButton,
  Autocomplete,
  Card,
  CardContent
} from '@mui/material';
import {
  Work as WorkIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Description as DescriptionIcon,
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useLocationDropdowns } from './useLocationDropdowns';
import API_URL from '../config/api';

const AddJob = ({ user }) => {
  const [form, setForm] = useState({
    title: '', 
    organization: '', 
    recruiterName: '', 
    recruiterEmail: '', 
    recruiterPhone: '', 
    location: '', 
    remote: false, 
    experience: '', 
    ctc: '', 
    description: '', 
    industry: '', 
    authorizedUser: '',
    status: 'New'
  });
  const [msg, setMsg] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [jobLocations, setJobLocations] = useState([
    { country: '', state: '', city: '' }
  ]);
  const [locationStates, setLocationStates] = useState([[]]);
  const [locationCities, setLocationCities] = useState([[]]);
  const { countries, states, cities, fetchStates, fetchCities, loading: locationLoading } = useLocationDropdowns();
  const [recruiters, setRecruiters] = useState([
    { name: '', email: '', phone: '' }
  ]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  
  // Email notification hook
  const {
    emailPreview,
    showEmailModal,
    handleJobCreatedEmail,
    closeEmailModal,
    confirmAndSendEmail
  } = useEmailNotification();

  useEffect(() => {
    // Fetch all access level 1 users and skills
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('jwt');
        const [usersResponse, skillsResponse] = await Promise.all([
          axios.get(`${API_URL}/api/auth/subordinates`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/api/skills`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setUsers(usersResponse.data);
        // Store full skill objects for industry filtering
        setAvailableSkills(skillsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSwitch = e => {
    setForm({ ...form, remote: e.target.checked });
  };

  // Location handlers for multiple locations
  const handleLocationChange = async (idx, field, value) => {
    const updated = [...jobLocations];
    updated[idx][field] = value;
    
    if (field === 'country') {
      updated[idx].state = '';
      updated[idx].city = '';
      const updatedStates = [...locationStates];
      const updatedCities = [...locationCities];
      
      if (value) {
        try {
          const res = await axios.post('https://countriesnow.space/api/v0.1/countries/states', { country: value });
          updatedStates[idx] = res.data.data.states.map(s => s.name);
        } catch (error) {
          console.error('Error fetching states:', error);
          updatedStates[idx] = [];
        }
      } else {
        updatedStates[idx] = [];
      }
      updatedCities[idx] = [];
      setLocationStates(updatedStates);
      setLocationCities(updatedCities);
    } else if (field === 'state') {
      updated[idx].city = '';
      const updatedCities = [...locationCities];
      
      if (value && updated[idx].country) {
        try {
          const res = await axios.post('https://countriesnow.space/api/v0.1/countries/state/cities', { 
            country: updated[idx].country, 
            state: value 
          });
          updatedCities[idx] = res.data.data;
        } catch (error) {
          console.error('Error fetching cities:', error);
          updatedCities[idx] = [];
        }
      } else {
        updatedCities[idx] = [];
      }
      setLocationCities(updatedCities);
    }
    
    setJobLocations(updated);
  };

  const addLocation = () => {
    setJobLocations([...jobLocations, { country: '', state: '', city: '' }]);
    setLocationStates([...locationStates, []]);
    setLocationCities([...locationCities, []]);
  };

  const removeLocation = (idx) => {
    if (jobLocations.length > 1) {
      setJobLocations(jobLocations.filter((_, i) => i !== idx));
      setLocationStates(locationStates.filter((_, i) => i !== idx));
      setLocationCities(locationCities.filter((_, i) => i !== idx));
    }
  };

  // Recruiter handlers
  const handleRecruiterChange = (idx, field, value) => {
    const updated = [...recruiters];
    updated[idx][field] = value;
    setRecruiters(updated);
  };
  const addRecruiter = () => {
    setRecruiters([...recruiters, { name: '', email: '', phone: '' }]);
  };
  const removeRecruiter = (idx) => {
    if (recruiters.length > 1) {
      setRecruiters(recruiters.filter((_, i) => i !== idx));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    
    // Validate required fields
    if (!form.title || !form.organization || !form.experience || !form.ctc || !form.description || !form.industry) {
      setMsg('Please fill in all required fields');
      toast.error('Please fill in all required fields');
      setLoading(false);
      return;
    }
    
    // Validate locations
    const validLocations = jobLocations.filter(loc => loc.country && loc.state && loc.city);
    if (validLocations.length === 0) {
      setMsg('Please add at least one complete location (Country, State, City)');
      toast.error('Please add at least one complete location (Country, State, City)');
      setLoading(false);
      return;
    }
    
    // Validate recruiters
    const validRecruiters = recruiters.filter(rec => rec.name && rec.email && rec.phone);
    if (validRecruiters.length === 0) {
      setMsg('Please add at least one recruiter with complete information');
      toast.error('Please add at least one recruiter with complete information');
      setLoading(false);
      return;
    }
    
    try {
      const jobData = {
        title: form.title,
        organization: form.organization,
        recruiters: validRecruiters,
        location: validLocations.length > 0 ? `${validLocations[0].city}, ${validLocations[0].state}, ${validLocations[0].country}` : '', // Keep for backward compatibility
        locations: validLocations,
        remote: form.remote,
        experience: parseInt(form.experience),
        ctc: form.ctc,
        description: form.description,
        industry: form.industry,
        status: form.status || 'New',
        skills: selectedSkills,
        createdBy: user?._id
      };
      
      // Admin can add authorized users, subordinate is auto-added
      if (user.accessLevel === 2 && form.authorizedUser) {
        jobData.authorizedUsers = [form.authorizedUser];
      } else if (user.accessLevel === 1) {
        // Subordinate creating job - auto-add themselves as authorized user
        jobData.authorizedUsers = [user._id];
      }
      
      const token = localStorage.getItem('jwt');
      const response = await axios.post(`${API_URL}/api/jobs`, jobData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const newJob = response.data;
      
      setMsg('Job added successfully!');
      toast.success('Job added successfully!');
      
      // Check if email notification should be sent
      if (newJob._emailNotificationPending && validRecruiters.length > 0) {
        // Show email preview modal for recruiters
        await handleJobCreatedEmail(newJob, newJob._creatorId || user?._id);
      }
      
      // Reset form
      setForm({
        title: '', 
        organization: '', 
        recruiterName: '', 
        recruiterEmail: '', 
        recruiterPhone: '', 
        location: '', 
        remote: false, 
        experience: '', 
        ctc: '', 
        description: '', 
        industry: '', 
        authorizedUser: ''
      });
      setJobLocations([{ country: '', state: '', city: '' }]);
      setLocationStates([[]]);
      setLocationCities([[]]);
      setRecruiters([{ name: '', email: '', phone: '' }]);
      setSelectedSkills([]);
    } catch (error) {
      console.error('Error adding job:', error);
      setMsg('Error adding job: ' + (error.response?.data?.error || error.message));
      toast.error('Error adding job: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
    'Retail', 'Consulting', 'Media', 'Real Estate', 'Transportation',
    'Energy', 'Government', 'Non-Profit', 'Other'
  ];

  // Map industries to skill categories
  const getIndustryCategoryMapping = (industry) => {
    const mapping = {
      'Technology': 'technology-engineering',
      'Healthcare': 'customer-success-support',
      'Finance': 'finance-accounting-audit',
      'Education': 'human-resources',
      'Manufacturing': 'manufacturing-projects-quality',
      'Retail': 'sales-and-business-development',
      'Consulting': 'general-management-strategy',
      'Media': 'marketing-communications',
      'Real Estate': 'sales-and-business-development',
      'Transportation': 'operations-supply-chain-procurement',
      'Energy': 'operations-supply-chain-procurement',
      'Government': 'legal-risk-compliance',
      'Non-Profit': 'general-management-strategy',
      'Other': 'miscellaneous'
    };
    return mapping[industry] || 'miscellaneous';
  };

  return (
    <Box sx={{ 
      maxWidth: 800, 
      mx: 'auto', 
      p: 3,
      background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
      borderRadius: 3,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(0, 0, 0, 0.05)'
    }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <WorkIcon sx={{ fontSize: 40, color: '#8b5cf6', mr: 2 }} />
          <Typography variant="h3" sx={{ 
            fontWeight: 700, 
            color: '#1e293b'
          }}>
            Add New Job
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#64748b', fontSize: '1.1rem' }}>
          Create a new job posting with detailed information
        </Typography>
      </Box>

      <Paper elevation={0} sx={{
        background: 'transparent',
        p: 4,
        borderRadius: 3,
        border: '1px solid rgba(0, 0, 0, 0.05)'
      }}>
        <Box component="form" onSubmit={handleSubmit}>
          {/* Job Title */}
          <Box sx={{ mb: 3 }}>
            <TextField
              name="title"
              label="Job Title"
              value={form.title}
              onChange={handleChange}
              required
              fullWidth
              InputProps={{
                startAdornment: <WorkIcon sx={{ color: '#64748b', mr: 1 }} />,
              }}
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

          {/* Organization */}
          <Box sx={{ mb: 3 }}>
            <TextField
              name="organization"
              label="Organization"
              value={form.organization}
              onChange={handleChange}
              required
              fullWidth
              InputProps={{
                startAdornment: <BusinessIcon sx={{ color: '#64748b', mr: 1 }} />,
              }}
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

          {/* Job Locations */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationIcon sx={{ color: '#8b5cf6', mr: 1 }} />
                <Typography variant="h6" sx={{ color: '#8b5cf6', fontWeight: 600 }}>
                  Job Locations *
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={addLocation}
                startIcon={<AddIcon />}
                sx={{
                  borderColor: '#8b5cf6',
                  color: '#8b5cf6',
                  '&:hover': {
                    borderColor: '#d4a5ac',
                    backgroundColor: 'rgba(139, 92, 246, 0.08)'
                  }
                }}
              >
                Add Location
              </Button>
            </Box>

            {jobLocations.map((loc, idx) => (
              <Card key={idx} sx={{
                mb: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                borderRadius: 2
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: '#8b5cf6', fontWeight: 600 }}>
                      Location #{idx + 1}
                    </Typography>
                    <Box>
                      {jobLocations.length > 1 && (
                        <IconButton
                          size="small"
                          onClick={() => removeLocation(idx)}
                          sx={{ color: '#ff6b6b', mr: 1, '&:hover': { backgroundColor: 'rgba(255, 107, 107, 0.1)' } }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                      {idx === jobLocations.length - 1 && jobLocations.length < 5 && (
                        <IconButton
                          size="small"
                          onClick={addLocation}
                          sx={{ color: '#51cf66', '&:hover': { backgroundColor: 'rgba(81, 207, 102, 0.1)' } }}
                        >
                          <AddIcon />
                        </IconButton>
                      )}
                    </Box>
                  </Box>

                  {/* Country */}
                  <Box sx={{ mb: 2 }}>
                    <FormControl fullWidth required>
                      <InputLabel sx={{ color: '#64748b' }}>Country</InputLabel>
                      <Select 
                        value={loc.country} 
                        onChange={(e) => handleLocationChange(idx, 'country', e.target.value)} 
                        label="Country"
                        sx={{
                          color: '#1e293b',
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(238, 187, 195, 0.5)' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8b5cf6' },
                          '& .MuiSvgIcon-root': { color: '#64748b' },
                        }}
                      >
                        <MenuItem value="">Select Country</MenuItem>
                        {countries.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Box>

                  {/* State */}
                  <Box sx={{ mb: 2 }}>
                    <FormControl fullWidth required>
                      <InputLabel sx={{ color: '#64748b' }}>State</InputLabel>
                      <Select 
                        value={loc.state} 
                        onChange={(e) => handleLocationChange(idx, 'state', e.target.value)} 
                        label="State" 
                        disabled={!loc.country}
                        sx={{
                          color: '#1e293b',
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(238, 187, 195, 0.5)' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8b5cf6' },
                          '& .MuiSvgIcon-root': { color: '#64748b' },
                        }}
                      >
                        <MenuItem value="">Select State</MenuItem>
                        {locationStates[idx]?.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Box>

                  {/* City */}
                  <Box sx={{ mb: 2 }}>
                    <FormControl fullWidth required>
                      <InputLabel sx={{ color: '#64748b' }}>City</InputLabel>
                      <Select 
                        value={loc.city} 
                        onChange={(e) => handleLocationChange(idx, 'city', e.target.value)} 
                        label="City" 
                        disabled={!loc.state}
                        sx={{
                          color: '#1e293b',
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(238, 187, 195, 0.5)' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8b5cf6' },
                          '& .MuiSvgIcon-root': { color: '#64748b' },
                        }}
                      >
                        <MenuItem value="">Select City</MenuItem>
                        {locationCities[idx]?.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Years of Experience */}
          <Box sx={{ mb: 3 }}>
            <TextField
              name="experience"
              label="Years of Experience"
              value={form.experience}
              onChange={handleChange}
              required
              fullWidth
              type="number"
              InputProps={{
                startAdornment: <WorkIcon sx={{ color: '#64748b', mr: 1 }} />,
              }}
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

          {/* CTC */}
          <Box sx={{ mb: 3 }}>
            <TextField
              name="ctc"
              label="CTC (LPA)"
              value={form.ctc}
              onChange={handleChange}
              required
              fullWidth
              InputProps={{
                startAdornment: <MoneyIcon sx={{ color: '#64748b', mr: 1 }} />,
              }}
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

          {/* Industry */}
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#64748b' }}>Industry</InputLabel>
              <Select
                name="industry"
                value={form.industry}
                onChange={handleChange}
                required
                sx={{
                  color: '#1e293b',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(238, 187, 195, 0.5)' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8b5cf6' },
                  '& .MuiSvgIcon-root': { color: '#64748b' },
                }}
              >
                {industries.map((industry) => (
                  <MenuItem key={industry} value={industry}>{industry}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Status */}
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#64748b' }}>Status</InputLabel>
              <Select
                name="status"
                value={form.status}
                onChange={handleChange}
                required
                sx={{
                  color: '#1e293b',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(238, 187, 195, 0.5)' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8b5cf6' },
                  '& .MuiSvgIcon-root': { color: '#64748b' },
                }}
              >
                <MenuItem value="New">New</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Halted">Halted</MenuItem>
                <MenuItem value="Withdrawn">Withdrawn</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Required Skills */}
          <Box sx={{ mb: 3 }}>
            <Autocomplete
              multiple
              freeSolo
              options={availableSkills.map(skill => skill.name)}
              value={selectedSkills}
              onChange={(e, newValue) => setSelectedSkills(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Required Skills"
                  placeholder="Select or type skills..."
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <StarIcon sx={{ color: '#64748b', mr: 1 }} />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
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
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option}
                    label={option}
                    sx={{ 
                      backgroundColor: 'rgba(37, 99, 235, 0.12)', 
                      color: '#2563eb',
                      textTransform: 'capitalize',
                      '& .MuiChip-deleteIcon': { color: '#2563eb' }
                    }}
                  />
                ))
              }
              sx={{
                '& .MuiAutocomplete-popupIndicator': { color: '#64748b' },
                '& .MuiAutocomplete-clearIndicator': { color: '#64748b' },
              }}
            />
            <Typography variant="caption" sx={{ color: '#64748b', mt: 0.5, display: 'block' }}>
              {form.industry 
                ? "Select from industry-relevant skills or type to add custom skills" 
                : "Skills will be filtered based on selected industry"}
            </Typography>
          </Box>

          {/* Job Description */}
          <Box sx={{ mb: 3 }}>
            <TextField
              name="description"
              label="Job Description"
              value={form.description}
              onChange={handleChange}
              required
              fullWidth
              multiline
              rows={4}
              InputProps={{
                startAdornment: <DescriptionIcon sx={{ color: '#64748b', mr: 1, alignSelf: 'flex-start', mt: 1 }} />,
              }}
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

          {/* Remote Work Toggle */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2, background: 'rgba(255, 255, 255, 0.05)' }}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={form.remote} 
                    onChange={handleSwitch}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#8b5cf6',
                        '&:hover': { backgroundColor: 'rgba(139, 92, 246, 0.08)' },
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#8b5cf6',
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{ color: '#1e293b', fontWeight: 600 }}>
                    Remote Work Available
                  </Typography>
                }
              />
              {form.remote && (
                <Chip 
                  label="🌐 Remote Position" 
                  sx={{ 
                    backgroundColor: 'rgba(37, 99, 235, 0.12)', 
                    color: '#2563eb',
                    fontWeight: 600
                  }} 
                />
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 4, borderColor: 'rgba(0, 0, 0, 0.08)' }} />

          {/* Recruiter Details Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PersonIcon sx={{ color: '#8b5cf6', mr: 1 }} />
              <Typography variant="h5" sx={{ color: '#8b5cf6', fontWeight: 600 }}>
                Recruiter Details
              </Typography>
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ color: '#8b5cf6', mb: 2 }}>Recruiters</Typography>
              {recruiters.map((rec, idx) => (
                <Grid container spacing={2} key={idx} alignItems="center" sx={{ mb: 2 }}>
                  <Grid item xs={12}>
                    <TextField 
                      label="Name" 
                      value={rec.name} 
                      onChange={e => handleRecruiterChange(idx, 'name', e.target.value)} 
                      fullWidth 
                      required
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
                  </Grid>
                  <Grid item xs={12}>
                    <TextField 
                      label="Email" 
                      value={rec.email} 
                      onChange={e => handleRecruiterChange(idx, 'email', e.target.value)} 
                      fullWidth 
                      required
                      type="email"
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
                  </Grid>
                  <Grid item xs={12}>
                    <TextField 
                      label="Phone" 
                      value={rec.phone} 
                      onChange={e => handleRecruiterChange(idx, 'phone', e.target.value)} 
                      fullWidth 
                      required
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
                  </Grid>
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <IconButton 
                      onClick={() => removeRecruiter(idx)} 
                      disabled={recruiters.length === 1}
                      sx={{ 
                        color: '#ff6b6b', 
                        '&:hover': { backgroundColor: 'rgba(255, 107, 107, 0.1)' },
                        '&.Mui-disabled': { color: '#475569' }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                    {idx === recruiters.length - 1 && (
                      <IconButton 
                        onClick={addRecruiter}
                        sx={{ 
                          color: '#51cf66', 
                          '&:hover': { backgroundColor: 'rgba(81, 207, 102, 0.1)' } 
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                    )}
                  </Grid>
                </Grid>
              ))}
            </Box>
          </Box>

          <Divider sx={{ my: 4, borderColor: 'rgba(0, 0, 0, 0.08)' }} />

          {/* Authorization Section - Only show for admins */}
          {user.accessLevel === 2 && (
            <>
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <SecurityIcon sx={{ color: '#8b5cf6', mr: 1 }} />
                  <Typography variant="h5" sx={{ color: '#8b5cf6', fontWeight: 600 }}>
                    Authorization
                  </Typography>
                </Box>
                
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#64748b' }}>Authorized User (Level 1) - Optional</InputLabel>
                  <Select
                    name="authorizedUser"
                    value={form.authorizedUser}
                    onChange={handleChange}
                    startAdornment={<SecurityIcon sx={{ color: '#64748b', mr: 1 }} />}
                    sx={{
                      color: '#1e293b',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(238, 187, 195, 0.5)' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8b5cf6' },
                      '& .MuiSvgIcon-root': { color: '#64748b' },
                    }}
                  >
                    <MenuItem value="">Select Authorized User (Level 1)</MenuItem>
                    {users.map(u => (
                      <MenuItem key={u._id} value={u._id}>
                        {u.fullName} ({u.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="caption" sx={{ color: '#64748b', mt: 0.5, display: 'block' }}>
                  Select a Level 1 user to grant them access to this job, or leave empty for no specific authorization
                </Typography>
              </Box>
              <Divider sx={{ my: 4, borderColor: 'rgba(0, 0, 0, 0.08)' }} />
            </>
          )}

          {/* Submit Button */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)',
                color: '#fff',
                fontWeight: 600,
                py: 2,
                px: 6,
                fontSize: '1.1rem',
                borderRadius: 3,
                '&:hover': {
                  background: 'linear-gradient(135deg, #3a7bd5 0%, #d4a5ac 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 16px rgba(37, 99, 235, 0.18)',
                },
                '&:disabled': {
                  background: 'rgba(0, 0, 0, 0.05)',
                  color: 'rgba(255, 255, 255, 0.5)',
                }
              }}
            >
              {loading ? 'Adding Job...' : 'Add Job'}
            </Button>
            
            {msg && (
              <Typography sx={{ mt: 2, color: msg.includes('Error') ? '#ff6b6b' : '#51cf66', fontWeight: 600 }}>
                {msg}
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Email Confirmation Modal */}
      <EmailConfirmationModal
        open={showEmailModal}
        onClose={closeEmailModal}
        emailData={emailPreview}
        onConfirm={confirmAndSendEmail}
      />
    </Box>
  );
};

export default AddJob;
