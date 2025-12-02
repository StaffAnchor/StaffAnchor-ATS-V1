
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  Paper, 
  Typography, 
  Box, 
  Button, 
  TextField, 
  Stack,
  Grid,
  Divider,
  Card,
  CardContent,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Star as StarIcon,
  LinkedIn as LinkedInIcon,
  Link as LinkIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Group as GroupIcon,
  CloudUpload as CloudUploadIcon,
  InsertDriveFile as FileIcon,
  CheckCircle as CheckCircleIcon,
  WarningAmber as WarningAmberIcon
} from '@mui/icons-material';
import { useLocationDropdowns } from './useLocationDropdowns';
import ExpertiseSelector from './ExpertiseSelector';
import API_URL from '../config/api';

const AddCandidate = () => {
  const location = useLocation();
  const [form, setForm] = useState({
    name: '', 
    email: '', 
    phone: '', 
    linkedin: '',
    totalExperienceYears: '',
    totalExperienceMonths: '',
    currentCTC: '',
    expectedCTC: ''
  });
  const [experience, setExperience] = useState([
    { company: '', position: '', role: '', ctc: '', start: '', end: '' }
  ]);
  const [education, setEducation] = useState([
    { clg: '', course: '', start: '', end: '' }
  ]);
  const [certifications, setCertifications] = useState([
    { name: '', organization: '', link: '' }
  ]);
  const [additionalLinks, setAdditionalLinks] = useState([
    { name: '', link: '' }
  ]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({ country: '', state: '', city: '' });
  const [preferredLocations, setPreferredLocations] = useState([
    { country: '', state: '', city: '' }
  ]);
  const [preferredLocationStates, setPreferredLocationStates] = useState([[]]);
  const [preferredLocationCities, setPreferredLocationCities] = useState([[]]);
  const { countries, states, cities, fetchStates, fetchCities, loading: locationLoading } = useLocationDropdowns();
  const [talentPools, setTalentPools] = useState([]);
  const [selectedTalentPools, setSelectedTalentPools] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Expertise hierarchy state
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedExpertiseTalentPools, setSelectedExpertiseTalentPools] = useState([]);
  const [selectedExpertiseSkills, setSelectedExpertiseSkills] = useState([]);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeFileName, setResumeFileName] = useState('');
  const [uploadingResume, setUploadingResume] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [fromResumeParsing, setFromResumeParsing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const skillCategories = [
    { value: 'sales-and-business-development', label: 'Sales and Business Development' },
    { value: 'marketing-communications', label: 'Marketing & Communications' },
    { value: 'technology-engineering', label: 'Technology and Engineering' },
    { value: 'finance-accounting-audit', label: 'Finance, Accounting & Audit' },
    { value: 'human-resources', label: 'Human Resources' },
    { value: 'operations-supply-chain-procurement', label: 'Operations, Supply Chain & Procurement' },
    { value: 'product-management-design', label: 'Product Management & Design' },
    { value: 'data-analytics-insights', label: 'Data, Analytics and Insights' },
    { value: 'customer-success-support', label: 'Customer Success & Support' },
    { value: 'legal-risk-compliance', label: 'Legal Risk & Compliance' },
    { value: 'manufacturing-projects-quality', label: 'Manufacturing, Projects & Quality' },
    { value: 'general-management-strategy', label: 'General Management & Strategy' },
    { value: 'miscellaneous', label: 'Miscellaneous' }
  ];

  // Fetch talent pools and jobs on component mount
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('jwt');
        const [poolsResponse, jobsResponse] = await Promise.all([
          axios.get(`${API_URL}/api/talent-pools`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/api/jobs`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setTalentPools(poolsResponse.data);
        setJobs(jobsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Check for pre-selected job from navigation state
  React.useEffect(() => {
    if (location.state?.preSelectedJob && jobs.length > 0) {
      const preSelectedJobId = location.state.preSelectedJob._id;
      // Check if job exists in jobs list
      const jobExists = jobs.find(job => job._id === preSelectedJobId);
      if (jobExists) {
        setSelectedJobs([preSelectedJobId]);
        toast.info(`Auto-selected job: ${location.state.preSelectedJob.title}`, {
          autoClose: 3000
        });
      }
    }
  }, [location.state, jobs]);

  // Handle resume parsing data
  React.useEffect(() => {
    if (location.state?.fromResumeParsing && location.state?.parsedData) {
      const data = location.state.parsedData;

      // Set basic form fields
      setForm(prev => ({
        ...prev,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        linkedin: data.linkedin ? `https://linkedin.com/in/${data.linkedin}` : '',
        totalExperienceYears: data.totalExperienceYears || '',
        totalExperienceMonths: data.totalExperienceMonths || ''
      }));

      // Set experience
      if (data.experience && data.experience.length > 0) {
        setExperience(data.experience);
      }

      // Set education
      if (data.education && data.education.length > 0) {
        setEducation(data.education);
      }

      // Set current location
      if (data.currentLocation) {
        setCurrentLocation(data.currentLocation);
      }

      // Set preferred locations
      if (data.preferredLocations && data.preferredLocations.length > 0) {
        setPreferredLocations(data.preferredLocations);
      }

      // Set domain first (important: must be set before talent pools and skills)
      if (data.selectedDomain) {
        setSelectedDomain(data.selectedDomain);
      }

      // Use setTimeout to ensure domain is set and talent pools are fetched before setting selections
      // This gives the ExpertiseSelector time to load talent pools for the selected domain
      setTimeout(() => {
        // Set talent pools
        if (data.selectedTalentPools && data.selectedTalentPools.length > 0) {
          setSelectedExpertiseTalentPools(data.selectedTalentPools);
          
          // Set skills after another delay to ensure talent pools are set first
          setTimeout(() => {
            if (data.selectedSkills && data.selectedSkills.length > 0) {
              setSelectedExpertiseSkills(data.selectedSkills);
            }
          }, 300);
        }
      }, 800); // Wait 800ms for ExpertiseSelector to fetch and load talent pool options

      // Set resume file
      if (location.state?.resumeFile) {
        setResumeFile(location.state.resumeFile);
        setResumeFileName(location.state.resumeFile.name);
      }

      // Mark as from resume parsing
      setFromResumeParsing(true);

      // Show success message
      toast.success('Resume parsed successfully! Please review the auto-filled information.', {
        autoClose: 5000
      });
    }
  }, [location.state]);

  // Fetch skills when category changes
  React.useEffect(() => {
    const fetchSkillsByCategory = async () => {
      if (!selectedCategory) {
        setAvailableSkills([]);
        setSelectedSkills([]);
        return;
      }

      try {
        const token = localStorage.getItem('jwt');
        const skillsResponse = await axios.get(`${API_URL}/api/skills`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { category: selectedCategory }
        });
        setAvailableSkills(skillsResponse.data.map(skill => skill.name));
        setSelectedSkills([]); // Clear selected skills when category changes
      } catch (error) {
        console.error('Error fetching skills:', error);
        setAvailableSkills([]);
      }
    };
    fetchSkillsByCategory();
  }, [selectedCategory]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleExpChange = (idx, e) => {
    const newExp = [...experience];
    newExp[idx][e.target.name] = e.target.value;
    setExperience(newExp);
  };
  
  const addExp = () => setExperience([...experience, { company: '', position: '', role: '', ctc: '', start: '', end: '' }]);
  
  const removeExp = (idx) => {
    if (experience.length > 1) {
      setExperience(experience.filter((_, i) => i !== idx));
    }
  };

  const handleEduChange = (idx, e) => {
    const newEdu = [...education];
    newEdu[idx][e.target.name] = e.target.value;
    setEducation(newEdu);
  };
  
  const addEdu = () => setEducation([...education, { clg: '', course: '', start: '', end: '' }]);
  
  const removeEdu = (idx) => {
    if (education.length > 1) {
      setEducation(education.filter((_, i) => i !== idx));
    }
  };

  const handleCertChange = (idx, e) => {
    const newCert = [...certifications];
    newCert[idx][e.target.name] = e.target.value;
    setCertifications(newCert);
  };
  
  const addCert = () => setCertifications([...certifications, { name: '', organization: '', link: '' }]);
  
  const removeCert = (idx) => {
    if (certifications.length > 1) {
      setCertifications(certifications.filter((_, i) => i !== idx));
    }
  };

  const handleLinkChange = (idx, e) => {
    const newLinks = [...additionalLinks];
    newLinks[idx][e.target.name] = e.target.value;
    setAdditionalLinks(newLinks);
  };
  
  const addLink = () => setAdditionalLinks([...additionalLinks, { name: '', link: '' }]);
  
  const removeLink = (idx) => {
    if (additionalLinks.length > 1) {
      setAdditionalLinks(additionalLinks.filter((_, i) => i !== idx));
    }
  };

  // Handlers for current location
  const handleCountryChange = (e) => {
    const country = e.target.value;
    setCurrentLocation({ country, state: '', city: '' });
    fetchStates(country);
  };
  const handleStateChange = (e) => {
    const state = e.target.value;
    setCurrentLocation((loc) => ({ ...loc, state, city: '' }));
    fetchCities(currentLocation.country, state);
  };
  const handleCityChange = (e) => {
    const city = e.target.value;
    setCurrentLocation((loc) => ({ ...loc, city }));
  };

  // Handlers for preferred locations
  const handlePreferredChange = async (idx, field, value) => {
    const updated = [...preferredLocations];
    updated[idx][field] = value;
    
    // Reset dependent fields
    if (field === 'country') {
      updated[idx].state = '';
      updated[idx].city = '';
      // Fetch states for this preferred location
      try {
        const res = await axios.post(`${API_URL}/api/locations/states`, { country: value });
        const newStates = res.data.data;
        const updatedStates = [...preferredLocationStates];
        updatedStates[idx] = newStates;
        setPreferredLocationStates(updatedStates);
      } catch (error) {
        console.error('Error fetching states:', error);
      }
    } else if (field === 'state') {
      updated[idx].city = '';
      // Fetch cities for this preferred location
      try {
        const res = await axios.post(`${API_URL}/api/locations/cities`, { 
          country: updated[idx].country, 
          state: value 
        });
        const newCities = res.data.data;
        const updatedCities = [...preferredLocationCities];
        updatedCities[idx] = newCities;
        setPreferredLocationCities(updatedCities);
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    }
    
    setPreferredLocations(updated);
  };

  const addPreferredLocation = () => {
    if (preferredLocations.length < 3) {
      setPreferredLocations([...preferredLocations, { country: '', state: '', city: '' }]);
      setPreferredLocationStates([...preferredLocationStates, []]);
      setPreferredLocationCities([...preferredLocationCities, []]);
    }
  };

  const removePreferredLocation = (idx) => {
    if (preferredLocations.length > 1) {
      setPreferredLocations(preferredLocations.filter((_, i) => i !== idx));
      setPreferredLocationStates(preferredLocationStates.filter((_, i) => i !== idx));
      setPreferredLocationCities(preferredLocationCities.filter((_, i) => i !== idx));
    }
  };

  // Handle resume file selection
  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PDF and DOC/DOCX files are allowed');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      setResumeFile(file);
      setResumeFileName(file.name);
    }
  };

  // Upload resume after candidate creation
  const uploadResumeForCandidate = async (candidateId) => {
    if (!resumeFile) return;
    
    setUploadingResume(true);
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      
      const token = localStorage.getItem('jwt');
      await axios.post(
        `${API_URL}/api/candidates/${candidateId}/resume`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      toast.success('Resume uploaded successfully!');
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast.error('Failed to upload resume: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    // Validation
    if (!selectedDomain) {
      toast.error('Please select a domain');
      setLoading(false);
      return;
    }
    
    if (selectedExpertiseTalentPools.length === 0) {
      toast.error('Please select at least one talent pool');
      setLoading(false);
      return;
    }
    
    if (selectedExpertiseSkills.length === 0) {
      toast.error('Please select at least one skill');
      setLoading(false);
      return;
    }

    // If data is from resume parsing, show confirmation dialog
    if (fromResumeParsing) {
      setShowConfirmDialog(true);
      return;
    }

    // Otherwise proceed with submission
    await submitCandidate();
  };

  const submitCandidate = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('jwt');
      const response = await axios.post(`${API_URL}/api/candidates`, {
        ...form,
        skills: selectedSkills, // Legacy field
        domain: selectedDomain,
        talentPools: selectedExpertiseTalentPools,
        expertiseSkills: selectedExpertiseSkills,
        experience,
        education,
        certifications,
        additionalLinks,
        currentLocation,
        preferredLocations
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Add candidate to selected talent pools
      const candidateId = response.data._id;
      for (const poolId of selectedExpertiseTalentPools) {
        try {
          await axios.post(`${API_URL}/api/talent-pools/${poolId}/candidates`, {
            candidateId
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (error) {
          console.error('Error adding candidate to talent pool:', error);
        }
      }

      // Upload resume (required)
      if (!resumeFile) {
        toast.error('Please upload a resume');
        setLoading(false);
        return;
      }
      
      await uploadResumeForCandidate(candidateId);

      // Link candidate to selected jobs
      if (selectedJobs.length > 0) {
        try {
          await axios.post(`${API_URL}/api/candidate-job-links/link`, {
            candidateIds: [candidateId],
            jobId: selectedJobs[0], // We'll handle multiple jobs in a loop
            source: 'added-by-recruiter'
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });

          // Link to remaining jobs if multiple selected
          for (let i = 1; i < selectedJobs.length; i++) {
            await axios.post(`${API_URL}/api/candidate-job-links/link`, {
              candidateIds: [candidateId],
              jobId: selectedJobs[i],
              source: 'added-by-recruiter'
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
          }
          toast.success(`Candidate linked to ${selectedJobs.length} job(s)`);
        } catch (error) {
          console.error('Error linking candidate to jobs:', error);
          toast.warning('Candidate added but some job links failed');
        }
      }

      setMsg('Candidate added successfully!');
      toast.success('Candidate added successfully!');
      
      // Dispatch event to notify parent component
      window.dispatchEvent(new CustomEvent('candidateAdded', { 
        detail: { candidate: response.data } 
      }));
      
      // Reset form
      setForm({ name: '', email: '', phone: '', linkedin: '', totalExperienceYears: '', totalExperienceMonths: '', currentCTC: '', expectedCTC: '' });
      setResumeFile(null);
      setResumeFileName('');
      setSelectedCategory('');
      setSelectedSkills([]);
      setAvailableSkills([]);
      setExperience([{ company: '', position: '', role: '', ctc: '', start: '', end: '' }]);
      setEducation([{ clg: '', course: '', start: '', end: '' }]);
      setCertifications([{ name: '', organization: '', link: '' }]);
      setAdditionalLinks([{ name: '', link: '' }]);
      setCurrentLocation({ country: '', state: '', city: '' });
      setPreferredLocations([{ country: '', state: '', city: '' }]);
      setSelectedTalentPools([]);
      setResumeFile(null);
      setResumeFileName('');
      setSelectedJobs([]);
    } catch (error) {
      console.error('Error adding candidate:', error);
      const errorMessage = error.response?.data?.error || 'Error adding candidate';
      setMsg(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      maxWidth: 900, 
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
          <PersonIcon sx={{ fontSize: 40, color: '#8b5cf6', mr: 2 }} />
          <Typography variant="h3" sx={{ 
            fontWeight: 700, 
            color: '#1e293b'
          }}>
            Add New Candidate
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#64748b', fontSize: '1.1rem' }}>
          Create a comprehensive candidate profile with detailed information
        </Typography>
      </Box>

      <Paper elevation={0} sx={{
        background: 'transparent',
        p: 4,
        borderRadius: 3,
        border: '1px solid rgba(0, 0, 0, 0.05)'
      }}>
        <Box component="form" onSubmit={handleSubmit}>
          {/* Basic Information Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PersonIcon sx={{ color: '#8b5cf6', mr: 1 }} />
              <Typography variant="h5" sx={{ color: '#8b5cf6', fontWeight: 600 }}>
                Basic Information
              </Typography>
            </Box>
            
            {/* Full Name */}
            <Box sx={{ mb: 3 }}>
              <TextField
                name="name"
                label="Full Name"
                value={form.name}
                onChange={handleChange}
                required
                fullWidth
                InputProps={{
                  startAdornment: <PersonIcon sx={{ color: '#64748b', mr: 1 }} />,
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
            
            {/* Email Address */}
            <Box sx={{ mb: 3 }}>
              <TextField
                name="email"
                label="Email Address"
                value={form.email}
                onChange={handleChange}
                required
                fullWidth
                type="email"
                InputProps={{
                  startAdornment: <EmailIcon sx={{ color: '#64748b', mr: 1 }} />,
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
            
            {/* Phone Number */}
            <Box sx={{ mb: 3 }}>
              <TextField
                name="phone"
                label="Phone Number"
                value={form.phone}
                onChange={handleChange}
                required
                fullWidth
                InputProps={{
                  startAdornment: <PhoneIcon sx={{ color: '#64748b', mr: 1 }} />,
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

            {/* Total Experience */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>
                Total Experience
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  name="totalExperienceYears"
                  label="Years"
                  type="number"
                  value={form.totalExperienceYears}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ min: 0, max: 50 }}
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
                  name="totalExperienceMonths"
                  label="Months"
                  type="number"
                  value={form.totalExperienceMonths}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ min: 0, max: 11 }}
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

            {/* Current CTC */}
            <Box sx={{ mb: 3 }}>
              <TextField
                name="currentCTC"
                label="Current CTC"
                value={form.currentCTC}
                onChange={handleChange}
                fullWidth
                placeholder="e.g., 10 LPA"
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

            {/* Expected CTC */}
            <Box sx={{ mb: 3 }}>
              <TextField
                name="expectedCTC"
                label="Expected CTC"
                value={form.expectedCTC}
                onChange={handleChange}
                fullWidth
                placeholder="e.g., 15 LPA"
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

            {/* Expertise Selection (Domain → Talent Pools → Skills) */}
            <Box sx={{ mb: 3 }}>
              <ExpertiseSelector
                selectedDomain={selectedDomain}
                onDomainChange={setSelectedDomain}
                selectedTalentPools={selectedExpertiseTalentPools}
                onTalentPoolsChange={setSelectedExpertiseTalentPools}
                selectedSkills={selectedExpertiseSkills}
                onSkillsChange={setSelectedExpertiseSkills}
                singleDomain={true}
                multipleTalentPools={true}
                multipleSkills={true}
                required={true}
              />
            </Box>

            {/* LinkedIn Username */}
            <Box sx={{ mb: 3 }}>
              <TextField
                name="linkedin"
                label="LinkedIn Username"
                value={form.linkedin}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  startAdornment: <LinkedInIcon sx={{ color: '#64748b', mr: 1 }} />,
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

            {/* Resume Upload */}
            <Box sx={{ mb: 3 }}>
              <input
                accept=".pdf,.doc,.docx"
                style={{ display: 'none' }}
                id="resume-upload"
                type="file"
                onChange={handleResumeChange}
              />
              <label htmlFor="resume-upload">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  startIcon={resumeFile ? <CheckCircleIcon /> : <CloudUploadIcon />}
                  sx={{
                    borderColor: resumeFile ? '#51cf66' : 'rgba(255, 255, 255, 0.3)',
                    color: resumeFile ? '#51cf66' : '#b8c5d6',
                    py: 1.5,
                    '&:hover': {
                      borderColor: resumeFile ? '#51cf66' : 'rgba(238, 187, 195, 0.5)',
                      backgroundColor: resumeFile ? 'rgba(81, 207, 102, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    },
                  }}
                >
                  {resumeFile ? 'Resume Selected' : 'Upload Resume (Required)'}
                </Button>
              </label>
              {resumeFileName && (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FileIcon sx={{ color: '#2563eb', fontSize: 20 }} />
                  <Typography variant="caption" sx={{ color: '#2563eb' }}>
                    {resumeFileName}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setResumeFile(null);
                      setResumeFileName('');
                    }}
                    sx={{ color: '#ff6b6b', ml: 'auto' }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
              <Typography variant="caption" sx={{ color: '#64748b', mt: 0.5, display: 'block' }}>
                Accepted formats: PDF, DOC, DOCX (Max 5MB) <span style={{ color: '#ff6b6b' }}>* Required</span>
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 4, borderColor: 'rgba(0, 0, 0, 0.08)' }} />

          {/* Current Location Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <LocationIcon sx={{ color: '#8b5cf6', mr: 1 }} />
              <Typography variant="h5" sx={{ color: '#8b5cf6', fontWeight: 600 }}>
                Current Location
              </Typography>
            </Box>
            
            {/* Country */}
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth required>
                <InputLabel sx={{ color: '#64748b' }}>Country</InputLabel>
                <Select 
                  value={currentLocation.country} 
                  onChange={handleCountryChange} 
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
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth required>
                <InputLabel sx={{ color: '#64748b' }}>State</InputLabel>
                <Select 
                  value={currentLocation.state} 
                  onChange={handleStateChange} 
                  label="State" 
                  disabled={!currentLocation.country}
                  sx={{
                    color: '#1e293b',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(238, 187, 195, 0.5)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8b5cf6' },
                    '& .MuiSvgIcon-root': { color: '#64748b' },
                  }}
                >
                  <MenuItem value="">Select State</MenuItem>
                  {states.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            
            {/* City */}
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth required>
                <InputLabel sx={{ color: '#64748b' }}>City</InputLabel>
                <Select 
                  value={currentLocation.city} 
                  onChange={handleCityChange} 
                  label="City" 
                  disabled={!currentLocation.state}
                  sx={{
                    color: '#1e293b',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(238, 187, 195, 0.5)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8b5cf6' },
                    '& .MuiSvgIcon-root': { color: '#64748b' },
                  }}
                >
                  <MenuItem value="">Select City</MenuItem>
                  {cities.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Divider sx={{ my: 4, borderColor: 'rgba(0, 0, 0, 0.08)' }} />

          {/* Preferred Locations Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationIcon sx={{ color: '#8b5cf6', mr: 1 }} />
                <Typography variant="h5" sx={{ color: '#8b5cf6', fontWeight: 600 }}>
                  Preferred Locations (up to 3)
                </Typography>
              </Box>
              <Button
                startIcon={<AddIcon />}
                onClick={addPreferredLocation}
                variant="outlined"
                sx={{
                  borderColor: '#8b5cf6',
                  color: '#8b5cf6',
                  '&:hover': { borderColor: '#2563eb', color: '#2563eb' }
                }}
              >
                Add Preferred Location
              </Button>
            </Box>
            
            <Stack spacing={3}>
              {preferredLocations.map((loc, idx) => (
                <Card key={idx} sx={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  borderRadius: 2
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ color: '#8b5cf6', fontWeight: 600 }}>
                        Preferred Location #{idx + 1}
                      </Typography>
                      <Box>
                        {preferredLocations.length > 1 && (
                          <IconButton 
                            onClick={() => removePreferredLocation(idx)}
                            sx={{ color: '#ff6b6b', mr: 1, '&:hover': { backgroundColor: 'rgba(255, 107, 107, 0.1)' } }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                        {idx === preferredLocations.length - 1 && preferredLocations.length < 3 && (
                          <IconButton 
                            onClick={addPreferredLocation}
                            sx={{ color: '#51cf66', '&:hover': { backgroundColor: 'rgba(81, 207, 102, 0.1)' } }}
                          >
                            <AddIcon />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                    
                    {/* Country */}
                    <Box sx={{ mb: 3 }}>
                      <FormControl fullWidth required>
                        <InputLabel sx={{ color: '#64748b' }}>Country</InputLabel>
                        <Select 
                          value={loc.country} 
                          onChange={e => handlePreferredChange(idx, 'country', e.target.value)} 
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
                    <Box sx={{ mb: 3 }}>
                      <FormControl fullWidth required>
                        <InputLabel sx={{ color: '#64748b' }}>State</InputLabel>
                        <Select 
                          value={loc.state} 
                          onChange={e => handlePreferredChange(idx, 'state', e.target.value)} 
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
                          {loc.country && preferredLocationStates[idx]?.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Box>
                    
                    {/* City */}
                    <Box sx={{ mb: 3 }}>
                      <FormControl fullWidth required>
                        <InputLabel sx={{ color: '#64748b' }}>City</InputLabel>
                        <Select 
                          value={loc.city} 
                          onChange={e => handlePreferredChange(idx, 'city', e.target.value)} 
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
                          {loc.state && preferredLocationCities[idx]?.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>

          <Divider sx={{ my: 4, borderColor: 'rgba(0, 0, 0, 0.08)' }} />

          {/* Experience Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WorkIcon sx={{ color: '#8b5cf6', mr: 1 }} />
                <Typography variant="h5" sx={{ color: '#8b5cf6', fontWeight: 600 }}>
                  Work Experience
                </Typography>
              </Box>
              <Button
                startIcon={<AddIcon />}
                onClick={addExp}
                variant="outlined"
                sx={{
                  borderColor: '#8b5cf6',
                  color: '#8b5cf6',
                  '&:hover': { borderColor: '#2563eb', color: '#2563eb' }
                }}
              >
                Add Experience
              </Button>
            </Box>
            
            <Stack spacing={3}>
              {experience.map((exp, idx) => (
                <Card key={idx} sx={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  borderRadius: 2
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ color: '#8b5cf6', fontWeight: 600 }}>
                        Experience #{idx + 1}
                      </Typography>
                      {experience.length > 1 && (
                        <IconButton 
                          onClick={() => removeExp(idx)}
                          sx={{ color: '#ff6b6b' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                    
                    {/* Company */}
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        name="company"
                        label="Company"
                        value={exp.company}
                        onChange={e => handleExpChange(idx, e)}
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
                    
                    {/* Position */}
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        name="position"
                        label="Position"
                        value={exp.position}
                        onChange={e => handleExpChange(idx, e)}
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
                    
                    {/* CTC */}
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        name="ctc"
                        label="CTC (LPA)"
                        value={exp.ctc}
                        onChange={e => handleExpChange(idx, e)}
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
                    
                    {/* Role Description */}
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        name="role"
                        label="Role Description"
                        value={exp.role}
                        onChange={e => handleExpChange(idx, e)}
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
                    
                    {/* Start Year */}
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        name="start"
                        label="Start Year"
                        value={exp.start}
                        onChange={e => handleExpChange(idx, e)}
                        fullWidth
                        type="number"
                        InputProps={{
                          startAdornment: <CalendarIcon sx={{ color: '#64748b', mr: 1 }} />,
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
                    
                    {/* End Year */}
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        name="end"
                        label="End Year"
                        value={exp.end}
                        onChange={e => handleExpChange(idx, e)}
                        fullWidth
                        type="number"
                        InputProps={{
                          startAdornment: <CalendarIcon sx={{ color: '#64748b', mr: 1 }} />,
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
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>

          <Divider sx={{ my: 4, borderColor: 'rgba(0, 0, 0, 0.08)' }} />

          {/* Education Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SchoolIcon sx={{ color: '#8b5cf6', mr: 1 }} />
                <Typography variant="h5" sx={{ color: '#8b5cf6', fontWeight: 600 }}>
                  Education
                </Typography>
              </Box>
              <Button
                startIcon={<AddIcon />}
                onClick={addEdu}
                variant="outlined"
                sx={{
                  borderColor: '#8b5cf6',
                  color: '#8b5cf6',
                  '&:hover': { borderColor: '#2563eb', color: '#2563eb' }
                }}
              >
                Add Education
              </Button>
            </Box>
            
            <Stack spacing={3}>
              {education.map((edu, idx) => (
                <Card key={idx} sx={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  borderRadius: 2
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ color: '#8b5cf6', fontWeight: 600 }}>
                        Education #{idx + 1}
                      </Typography>
                      {education.length > 1 && (
                        <IconButton 
                          onClick={() => removeEdu(idx)}
                          sx={{ color: '#ff6b6b' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                    
                    {/* College/University */}
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        name="clg"
                        label="College/University"
                        value={edu.clg}
                        onChange={e => handleEduChange(idx, e)}
                        fullWidth
                        InputProps={{
                          startAdornment: <SchoolIcon sx={{ color: '#64748b', mr: 1 }} />,
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
                    
                    {/* Course/Degree */}
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        name="course"
                        label="Course/Degree"
                        value={edu.course}
                        onChange={e => handleEduChange(idx, e)}
                        fullWidth
                        InputProps={{
                          startAdornment: <SchoolIcon sx={{ color: '#64748b', mr: 1 }} />,
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
                    
                    {/* Start Year */}
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        name="start"
                        label="Start Year"
                        value={edu.start}
                        onChange={e => handleEduChange(idx, e)}
                        fullWidth
                        type="number"
                        InputProps={{
                          startAdornment: <CalendarIcon sx={{ color: '#64748b', mr: 1 }} />,
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
                    
                    {/* End Year */}
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        name="end"
                        label="End Year"
                        value={edu.end}
                        onChange={e => handleEduChange(idx, e)}
                        fullWidth
                        type="number"
                        InputProps={{
                          startAdornment: <CalendarIcon sx={{ color: '#64748b', mr: 1 }} />,
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
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>

          <Divider sx={{ my: 4, borderColor: 'rgba(0, 0, 0, 0.08)' }} />

          {/* Certifications Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <StarIcon sx={{ color: '#8b5cf6', mr: 1 }} />
                <Typography variant="h5" sx={{ color: '#8b5cf6', fontWeight: 600 }}>
                  Certifications
                </Typography>
              </Box>
              <Button
                startIcon={<AddIcon />}
                onClick={addCert}
                variant="outlined"
                sx={{
                  borderColor: '#8b5cf6',
                  color: '#8b5cf6',
                  '&:hover': { borderColor: '#2563eb', color: '#2563eb' }
                }}
              >
                Add Certification
              </Button>
            </Box>
            
            <Stack spacing={3}>
              {certifications.map((cert, idx) => (
                <Card key={idx} sx={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  borderRadius: 2
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ color: '#8b5cf6', fontWeight: 600 }}>
                        Certification #{idx + 1}
                      </Typography>
                      {certifications.length > 1 && (
                        <IconButton 
                          onClick={() => removeCert(idx)}
                          sx={{ color: '#ff6b6b' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                    
                    {/* Certification Name */}
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        name="name"
                        label="Certification Name"
                        value={cert.name}
                        onChange={e => handleCertChange(idx, e)}
                        fullWidth
                        InputProps={{
                          startAdornment: <StarIcon sx={{ color: '#64748b', mr: 1 }} />,
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
                    
                    {/* Issuing Organization */}
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        name="organization"
                        label="Issuing Organization"
                        value={cert.organization}
                        onChange={e => handleCertChange(idx, e)}
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
                    
                    {/* Certification Link */}
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        name="link"
                        label="Certification Link"
                        value={cert.link}
                        onChange={e => handleCertChange(idx, e)}
                        fullWidth
                        InputProps={{
                          startAdornment: <LinkIcon sx={{ color: '#64748b', mr: 1 }} />,
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
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>

          <Divider sx={{ my: 4, borderColor: 'rgba(0, 0, 0, 0.08)' }} />

          {/* Additional Links Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LinkIcon sx={{ color: '#8b5cf6', mr: 1 }} />
                <Typography variant="h5" sx={{ color: '#8b5cf6', fontWeight: 600 }}>
                  Additional Links
                </Typography>
              </Box>
              <Button
                startIcon={<AddIcon />}
                onClick={addLink}
                variant="outlined"
                sx={{
                  borderColor: '#8b5cf6',
                  color: '#8b5cf6',
                  '&:hover': { borderColor: '#2563eb', color: '#2563eb' }
                }}
              >
                Add Link
              </Button>
            </Box>
            
            <Stack spacing={3}>
              {additionalLinks.map((link, idx) => (
                <Card key={idx} sx={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  borderRadius: 2
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ color: '#8b5cf6', fontWeight: 600 }}>
                        Link #{idx + 1}
                      </Typography>
                      {additionalLinks.length > 1 && (
                        <IconButton 
                          onClick={() => removeLink(idx)}
                          sx={{ color: '#ff6b6b' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                    
                    {/* Link Name */}
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        name="name"
                        label="Link Name"
                        value={link.name}
                        onChange={e => handleLinkChange(idx, e)}
                        fullWidth
                        InputProps={{
                          startAdornment: <LinkIcon sx={{ color: '#64748b', mr: 1 }} />,
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
                    
                    {/* URL */}
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        name="link"
                        label="URL"
                        value={link.link}
                        onChange={e => handleLinkChange(idx, e)}
                        fullWidth
                        InputProps={{
                          startAdornment: <LinkIcon sx={{ color: '#64748b', mr: 1 }} />,
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
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>

          <Divider sx={{ my: 4, borderColor: 'rgba(0, 0, 0, 0.08)' }} />

          {/* Talent Pools Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <GroupIcon sx={{ color: '#8b5cf6', mr: 1 }} />
              <Typography variant="h5" sx={{ color: '#8b5cf6', fontWeight: 600 }}>
                Talent Pools (Optional)
              </Typography>
            </Box>
            
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
              Select talent pools to add this candidate to
            </Typography>

            {talentPools.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#64748b', fontStyle: 'italic' }}>
                No talent pools available. Create a talent pool first.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {talentPools.map((pool) => (
                  <Chip
                    key={pool._id}
                    label={pool.name}
                    onClick={() => {
                      setSelectedTalentPools(prev =>
                        prev.includes(pool._id)
                          ? prev.filter(id => id !== pool._id)
                          : [...prev, pool._id]
                      );
                    }}
                    sx={{
                      backgroundColor: selectedTalentPools.includes(pool._id)
                        ? 'rgba(37, 99, 235, 0.18)'
                        : 'rgba(0, 0, 0, 0.05)',
                      color: selectedTalentPools.includes(pool._id) ? '#2563eb' : '#b8c5d6',
                      border: selectedTalentPools.includes(pool._id)
                        ? '2px solid #2563eb'
                        : '2px solid rgba(0, 0, 0, 0.08)',
                      fontWeight: selectedTalentPools.includes(pool._id) ? 600 : 400,
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: selectedTalentPools.includes(pool._id)
                          ? 'rgba(79, 140, 255, 0.4)'
                          : 'rgba(255, 255, 255, 0.15)',
                      }
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 4, borderColor: 'rgba(0, 0, 0, 0.08)' }} />

          {/* Link to Jobs Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <WorkIcon sx={{ color: '#8b5cf6', mr: 1 }} />
              <Typography variant="h5" sx={{ color: '#8b5cf6', fontWeight: 600 }}>
                Link to Jobs (Optional)
              </Typography>
            </Box>
            
            {location.state?.preSelectedJob && (
              <Box sx={{ 
                mb: 2, 
                p: 2, 
                background: 'rgba(37, 99, 235, 0.1)', 
                borderRadius: 2,
                border: '1px solid rgba(37, 99, 235, 0.2)'
              }}>
                <Typography variant="body2" sx={{ color: '#2563eb', fontWeight: 600 }}>
                  ℹ️ Job Pre-selected: {location.state.preSelectedJob.title} - {location.state.preSelectedJob.organization}
                </Typography>
              </Box>
            )}
            
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
              Select one or more jobs to link this candidate to
            </Typography>

            {jobs.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#64748b', fontStyle: 'italic' }}>
                No jobs available. Create a job first.
              </Typography>
            ) : (
              <Autocomplete
                multiple
                options={jobs}
                value={jobs.filter(job => selectedJobs.includes(job._id))}
                onChange={(e, newValue) => {
                  setSelectedJobs(newValue.map(job => job._id));
                }}
                getOptionLabel={(option) => `${option.title} - ${option.organization}`}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select jobs to link..."
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <WorkIcon sx={{ color: '#64748b', mr: 1, ml: 1 }} />
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
                      key={option._id}
                      label={option.title}
                      sx={{
                        backgroundColor: 'rgba(37, 99, 235, 0.12)',
                        color: '#2563eb',
                        fontWeight: 600,
                        '& .MuiChip-deleteIcon': { 
                          color: '#2563eb',
                          '&:hover': { color: '#3d7be8' }
                        }
                      }}
                    />
                  ))
                }
                renderOption={(props, option) => (
                  <Box component="li" {...props} sx={{ 
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    py: 1.5
                  }}>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                        {option.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {option.organization} {option.location && `• ${option.location}`}
                      </Typography>
                      {option.industry && (
                        <Chip
                          label={option.industry}
                          size="small"
                          sx={{
                            ml: 1,
                            backgroundColor: 'rgba(238, 187, 195, 0.2)',
                            color: '#8b5cf6',
                            fontSize: '0.7rem',
                            height: 20,
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                )}
                sx={{
                  '& .MuiAutocomplete-popupIndicator': { color: '#64748b' },
                  '& .MuiAutocomplete-clearIndicator': { color: '#64748b' },
                  '& .MuiAutocomplete-tag': {
                    backgroundColor: 'rgba(37, 99, 235, 0.12)',
                    color: '#2563eb',
                  }
                }}
                ChipProps={{
                  sx: {
                    backgroundColor: 'rgba(37, 99, 235, 0.12)',
                    color: '#2563eb',
                  }
                }}
                ListboxProps={{
                  sx: {
                    backgroundColor: '#f8fafc',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    '& .MuiAutocomplete-option': {
                      color: '#1e293b',
                      '&:hover': {
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                      },
                      '&[aria-selected="true"]': {
                        backgroundColor: 'rgba(37, 99, 235, 0.12)',
                        '&:hover': {
                          backgroundColor: 'rgba(79, 140, 255, 0.25)',
                        }
                      }
                    }
                  }
                }}
              />
            )}
            
            {selectedJobs.length > 0 && (
              <Typography variant="caption" sx={{ color: '#2563eb', mt: 1, display: 'block', fontWeight: 600 }}>
                {selectedJobs.length} job{selectedJobs.length !== 1 ? 's' : ''} selected
              </Typography>
            )}
          </Box>

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
              {loading ? (uploadingResume ? 'Uploading Resume...' : 'Adding Candidate...') : 'Add Candidate'}
            </Button>
            
            {msg && (
              <Typography sx={{ mt: 2, color: msg.includes('Error') ? '#ff6b6b' : '#51cf66', fontWeight: 600 }}>
                {msg}
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Confirmation Dialog for Resume-Parsed Data */}
      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          fontWeight: 600
        }}>
          <WarningAmberIcon />
          Verify AI-Extracted Information
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Typography variant="body1" sx={{ color: '#1e293b', mb: 2, lineHeight: 1.6 }}>
            The candidate information has been automatically extracted and matched using AI. Please verify that all data is accurate and appropriate before proceeding.
          </Typography>
          <Box sx={{ 
            backgroundColor: 'rgba(245, 158, 11, 0.1)', 
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 1,
            p: 2,
            mt: 2
          }}>
            <Typography variant="body2" sx={{ color: '#92400e', fontWeight: 500, mb: 1 }}>
              ⚠️ Please verify the following:
            </Typography>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '24px', color: '#92400e' }}>
              <li>Name, email, and phone number are correct</li>
              <li>Total experience calculation is accurate</li>
              <li>Domain selection matches candidate's expertise</li>
              <li>Talent pools are appropriate for the candidate</li>
              <li>Selected skills match the candidate's profile</li>
              <li>Work experience and education details are complete</li>
              <li>Location information is accurate</li>
            </ul>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setShowConfirmDialog(false)}
            sx={{
              color: '#64748b',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
              }
            }}
          >
            Review Again
          </Button>
          <Button
            onClick={async () => {
              setShowConfirmDialog(false);
              setFromResumeParsing(false); // Prevent showing dialog again
              await submitCandidate();
            }}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)',
              color: '#fff',
              fontWeight: 600,
              textTransform: 'none',
              px: 3,
              '&:hover': {
                background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
              }
            }}
          >
            Yes, I have verified
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddCandidate;
