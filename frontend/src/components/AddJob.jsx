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
  Star as StarIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import { useLocationDropdowns } from './useLocationDropdowns';
import ExpertiseSelector from './ExpertiseSelector';
import API_URL from '../config/api';

const AddJob = ({ user }) => {
  const [form, setForm] = useState({
    title: '', 
    organization: '', 
    clientContact: '',
    location: '', 
    remote: false, 
    experienceMin: '', 
    experienceMax: '', 
    ctcMin: '', 
    ctcMax: '', 
    description: '',
  });
  const [msg, setMsg] = useState('');
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [clientContacts, setClientContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [jobLocations, setJobLocations] = useState([
    { country: '', state: '', city: '' }
  ]);
  const [locationStates, setLocationStates] = useState([[]]);
  const [locationCities, setLocationCities] = useState([[]]);
  const { countries, states, cities, fetchStates, fetchCities, loading: locationLoading } = useLocationDropdowns();
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedRecruiters, setSelectedRecruiters] = useState([]);
  
  // Expertise hierarchy state
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedTalentPools, setSelectedTalentPools] = useState([]);
  const [selectedExpertiseSkills, setSelectedExpertiseSkills] = useState([]);
  
  // Email notification hook
  const {
    emailPreview,
    showEmailModal,
    handleJobCreatedEmail,
    closeEmailModal,
    confirmAndSendEmail
  } = useEmailNotification();

  useEffect(() => {
    // Fetch all access level 1 users, clients, and skills
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('jwt');
        const [usersResponse, clientsResponse, skillsResponse] = await Promise.all([
          axios.get(`${API_URL}/api/auth/subordinates`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/api/clients`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/api/skills`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setUsers(usersResponse.data);
        setClients(clientsResponse.data);
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
    
    // When organization changes, update client contacts
    if (name === 'organization') {
      const selectedClient = clients.find(c => c._id === value);
      setClientContacts(selectedClient?.contacts || []);
      setForm(prev => ({ ...prev, clientContact: '' })); // Reset contact selection
    }
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
          const res = await axios.post(`${API_URL}/api/locations/states`, { country: value });
          updatedStates[idx] = res.data.data;
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
          const res = await axios.post(`${API_URL}/api/locations/cities`, { 
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


  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    
    // Validate required fields
    if (!form.title || !form.organization || !form.clientContact || !form.experienceMin || !form.experienceMax || !form.ctcMin || !form.ctcMax || !form.description) {
      setMsg('Please fill in all required fields');
      toast.error('Please fill in all required fields');
      setLoading(false);
      return;
    }
    
    // Validate Experience range
    const expMinVal = parseInt(form.experienceMin);
    const expMaxVal = parseInt(form.experienceMax);
    if (isNaN(expMinVal) || isNaN(expMaxVal) || expMinVal < 0 || expMaxVal < 0) {
      setMsg('Experience values must be valid positive numbers');
      toast.error('Experience values must be valid positive numbers');
      setLoading(false);
      return;
    }
    if (expMinVal > expMaxVal) {
      setMsg('Minimum Experience cannot be greater than Maximum Experience');
      toast.error('Minimum Experience cannot be greater than Maximum Experience');
      setLoading(false);
      return;
    }
    
    // Validate CTC range
    const ctcMinVal = parseFloat(form.ctcMin);
    const ctcMaxVal = parseFloat(form.ctcMax);
    if (isNaN(ctcMinVal) || isNaN(ctcMaxVal) || ctcMinVal < 0 || ctcMaxVal < 0) {
      setMsg('CTC values must be valid positive numbers');
      toast.error('CTC values must be valid positive numbers');
      setLoading(false);
      return;
    }
    if (ctcMinVal > ctcMaxVal) {
      setMsg('Minimum CTC cannot be greater than Maximum CTC');
      toast.error('Minimum CTC cannot be greater than Maximum CTC');
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
    
    try {
      // Get selected client info
      const selectedClient = clients.find(c => c._id === form.organization);
      // clientContact might be _id or index, try both
      let selectedContact = selectedClient?.contacts?.find(c => c._id === form.clientContact);
      if (!selectedContact && !isNaN(form.clientContact)) {
        selectedContact = selectedClient?.contacts?.[parseInt(form.clientContact)];
      }
      
      const jobData = {
        title: form.title,
        organization: selectedClient?.organizationName || form.organization,
        clientId: form.organization,
        clientContact: selectedContact,
        recruiters: selectedContact ? [{
          name: selectedContact.name,
          email: selectedContact.email,
          phone: selectedContact.phone
        }] : [],
        location: validLocations.length > 0 ? `${validLocations[0].city}, ${validLocations[0].state}, ${validLocations[0].country}` : '', // Keep for backward compatibility
        locations: validLocations,
        remote: form.remote,
        experienceMin: parseInt(form.experienceMin),
        experienceMax: parseInt(form.experienceMax),
        ctcMin: parseFloat(form.ctcMin),
        ctcMax: parseFloat(form.ctcMax),
        description: form.description,
        status: 'New',
        domain: selectedDomain,
        talentPools: selectedTalentPools,
        skills: selectedExpertiseSkills,
        createdBy: user?._id
      };
      
      // Admin can add authorized users, subordinate is auto-added
      if (user.accessLevel === 2 && selectedRecruiters.length > 0) {
        jobData.authorizedUsers = selectedRecruiters;
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
      
      // Check if email notification should be sent to internal recruiters
      if (newJob._emailNotificationPending && newJob.authorizedUsers && newJob.authorizedUsers.length > 0) {
        // Show email preview modal for internal StaffAnchor recruiters
        await handleJobCreatedEmail(newJob, newJob._creatorId || user?._id);
      }
      
      // Reset form
      setForm({
        title: '', 
        organization: '', 
        clientContact: '',
        location: '', 
        remote: false, 
        experienceMin: '', 
        experienceMax: '', 
        ctcMin: '', 
        ctcMax: '', 
        description: ''
      });
      setJobLocations([{ country: '', state: '', city: '' }]);
      setLocationStates([[]]);
      setLocationCities([[]]);
      setClientContacts([]);
      setSelectedSkills([]);
      setSelectedRecruiters([]);
      setSelectedDomain('');
      setSelectedTalentPools([]);
      setSelectedExpertiseSkills([]);
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
                  '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.23)' },
                  '&:hover fieldset': { borderColor: 'rgba(0, 0, 0, 0.4)' },
                  '&.Mui-focused fieldset': { borderColor: '#8b5cf6', borderWidth: '2px' },
                },
                '& .MuiInputLabel-root': { color: '#64748b' },
                '& .MuiInputBase-input': { color: '#1e293b' },
              }}
            />
          </Box>

          {/* Organization */}
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth required>
              <InputLabel sx={{ color: '#64748b' }}>Organization (Client)</InputLabel>
              <Select
                name="organization"
                value={form.organization}
                onChange={handleChange}
                startAdornment={<BusinessIcon sx={{ color: '#64748b', mr: 1 }} />}
                sx={{
                  color: '#1e293b',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.23)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.4)' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8b5cf6', borderWidth: '2px' },
                  '& .MuiSvgIcon-root': { color: '#64748b' },
                }}
              >
                <MenuItem value="">Select Client Organization</MenuItem>
                {clients.map((client) => (
                  <MenuItem key={client._id} value={client._id}>
                    {client.organizationName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Client Contact for this Job */}
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth required disabled={!form.organization}>
              <InputLabel sx={{ color: '#64748b' }}>Client Contact for this Job</InputLabel>
              <Select
                name="clientContact"
                value={form.clientContact}
                onChange={handleChange}
                startAdornment={<PersonIcon sx={{ color: '#64748b', mr: 1 }} />}
                sx={{
                  color: '#1e293b',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.23)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.4)' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8b5cf6', borderWidth: '2px' },
                  '& .MuiSvgIcon-root': { color: '#64748b' },
                }}
              >
                <MenuItem value="">Select Client Contact</MenuItem>
                {clientContacts.map((contact, idx) => (
                  <MenuItem key={contact._id || idx} value={contact._id || idx}>
                    {contact.name} - {contact.designation} ({contact.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.23)' },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.4)' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8b5cf6', borderWidth: '2px' },
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
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.23)' },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.4)' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8b5cf6', borderWidth: '2px' },
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
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.23)' },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.4)' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8b5cf6', borderWidth: '2px' },
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

          {/* Years of Experience Range */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <WorkIcon sx={{ color: '#8b5cf6', mr: 1 }} />
              <Typography variant="subtitle1" sx={{ color: '#8b5cf6', fontWeight: 600 }}>
                Years of Experience *
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="experienceMin"
                  label="Minimum Experience"
                  value={form.experienceMin}
                  onChange={handleChange}
                  required
                  fullWidth
                  type="number"
                  inputProps={{ step: "1", min: "0" }}
                  placeholder="e.g., 2"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.23)' },
                      '&:hover fieldset': { borderColor: 'rgba(0, 0, 0, 0.4)' },
                      '&.Mui-focused fieldset': { borderColor: '#8b5cf6', borderWidth: '2px' },
                    },
                    '& .MuiInputLabel-root': { color: '#64748b' },
                    '& .MuiInputBase-input': { color: '#1e293b' },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="experienceMax"
                  label="Maximum Experience"
                  value={form.experienceMax}
                  onChange={handleChange}
                  required
                  fullWidth
                  type="number"
                  inputProps={{ step: "1", min: "0" }}
                  placeholder="e.g., 5"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.23)' },
                      '&:hover fieldset': { borderColor: 'rgba(0, 0, 0, 0.4)' },
                      '&.Mui-focused fieldset': { borderColor: '#8b5cf6', borderWidth: '2px' },
                    },
                    '& .MuiInputLabel-root': { color: '#64748b' },
                    '& .MuiInputBase-input': { color: '#1e293b' },
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* CTC Range */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <MoneyIcon sx={{ color: '#8b5cf6', mr: 1 }} />
              <Typography variant="subtitle1" sx={{ color: '#8b5cf6', fontWeight: 600 }}>
                CTC Range (LPA) *
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="ctcMin"
                  label="Minimum CTC"
                  value={form.ctcMin}
                  onChange={handleChange}
                  required
                  fullWidth
                  type="number"
                  inputProps={{ step: "0.1", min: "0" }}
                  placeholder="e.g., 8.5"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.23)' },
                      '&:hover fieldset': { borderColor: 'rgba(0, 0, 0, 0.4)' },
                      '&.Mui-focused fieldset': { borderColor: '#8b5cf6', borderWidth: '2px' },
                    },
                    '& .MuiInputLabel-root': { color: '#64748b' },
                    '& .MuiInputBase-input': { color: '#1e293b' },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="ctcMax"
                  label="Maximum CTC"
                  value={form.ctcMax}
                  onChange={handleChange}
                  required
                  fullWidth
                  type="number"
                  inputProps={{ step: "0.1", min: "0" }}
                  placeholder="e.g., 12.5"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.23)' },
                      '&:hover fieldset': { borderColor: 'rgba(0, 0, 0, 0.4)' },
                      '&.Mui-focused fieldset': { borderColor: '#8b5cf6', borderWidth: '2px' },
                    },
                    '& .MuiInputLabel-root': { color: '#64748b' },
                    '& .MuiInputBase-input': { color: '#1e293b' },
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Expertise Selection (Domain → Talent Pools → Skills) */}
          <Box sx={{ mb: 3 }}>
            <ExpertiseSelector
              selectedDomain={selectedDomain}
              onDomainChange={setSelectedDomain}
              selectedTalentPools={selectedTalentPools}
              onTalentPoolsChange={setSelectedTalentPools}
              selectedSkills={selectedExpertiseSkills}
              onSkillsChange={setSelectedExpertiseSkills}
              singleDomain={true}
              multipleTalentPools={true}
              multipleSkills={true}
              required={true}
            />
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
                  '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.23)' },
                  '&:hover fieldset': { borderColor: 'rgba(0, 0, 0, 0.4)' },
                  '&.Mui-focused fieldset': { borderColor: '#8b5cf6', borderWidth: '2px' },
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

          {/* StaffAnchor Recruiters - Only show for admins */}
          {user.accessLevel === 2 && (
            <>
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <GroupIcon sx={{ color: '#8b5cf6', mr: 1 }} />
                  <Typography variant="h5" sx={{ color: '#8b5cf6', fontWeight: 600 }}>
                    StaffAnchor Recruiters
                  </Typography>
                </Box>
                
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#64748b' }}>Select Recruiters - Optional</InputLabel>
                  <Select
                    multiple
                    value={selectedRecruiters}
                    onChange={(e) => setSelectedRecruiters(e.target.value)}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const user = users.find(u => u._id === value);
                          return (
                            <Chip
                              key={value}
                              label={user?.fullName || value}
                              size="small"
                              sx={{
                                backgroundColor: '#8b5cf6',
                                color: '#ffffff',
                                '& .MuiChip-deleteIcon': {
                                  color: '#ffffff',
                                  '&:hover': {
                                    color: '#f3e8ff'
                                  }
                                }
                              }}
                            />
                          );
                        })}
                      </Box>
                    )}
                    sx={{
                      color: '#1e293b',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.23)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.4)' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8b5cf6', borderWidth: '2px' },
                      '& .MuiSvgIcon-root': { color: '#64748b' },
                    }}
                  >
                    {users.map(u => (
                      <MenuItem key={u._id} value={u._id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <PersonIcon sx={{ mr: 1, fontSize: '1.2rem', color: '#8b5cf6' }} />
                          <Box>
                            <Typography sx={{ fontWeight: 500 }}>{u.fullName}</Typography>
                            <Typography variant="caption" sx={{ color: '#64748b' }}>{u.email}</Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="caption" sx={{ color: '#64748b', mt: 0.5, display: 'block' }}>
                  Assign one or more recruiters from your team to manage this job
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
