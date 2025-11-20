import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  Stack,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Work as WorkIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Description as FileIcon
} from '@mui/icons-material';
import API_URL from '../config/api';
import staffAnchorLogo from '../assets/StaffanchorLogoFinalSVG.svg';

const PublicJobApplication = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Location state
  const [selectedPreferredLocations, setSelectedPreferredLocations] = useState([]);

  // Skills state
  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

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

  // Resume upload state
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeFileName, setResumeFileName] = useState('');

  // Form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    totalExperienceYears: '',
    totalExperienceMonths: '',
    currentCTC: '',
    expectedCTC: '',
    experience: [{ company: '', position: '', role: '', ctc: '', start: '', end: '' }],
    education: [{ clg: '', course: '', start: '', end: '' }]
  });

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  // Fetch skills when category changes
  useEffect(() => {
    const fetchSkillsByCategory = async () => {
      if (!selectedCategory) {
        setAllSkills([]);
        setSelectedSkills([]);
        return;
      }

      try {
        const res = await axios.get(`${API_URL}/api/skills/public`, {
          params: { category: selectedCategory }
        });
        setAllSkills(res.data.map(skill => skill.name));
        setSelectedSkills([]); // Clear selected skills when category changes
      } catch (error) {
        console.error('Error fetching skills:', error);
        setAllSkills([]);
      }
    };
    fetchSkillsByCategory();
  }, [selectedCategory]);


  const fetchJobDetails = async () => {
    try {
      // Public endpoint - no authentication required
      const res = await axios.get(`${API_URL}/api/jobs/public/${jobId}`);
      setJob(res.data);
    } catch (error) {
      console.error('Error fetching job:', error);
      toast.error('Job not found');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get job locations as formatted strings
  const getJobLocations = () => {
    if (!job) return [];
    
    if (job.locations && job.locations.length > 0) {
      // Job has multiple locations array
      return job.locations.map(loc => {
        const parts = [];
        if (loc.city) parts.push(loc.city);
        if (loc.state) parts.push(loc.state);
        if (loc.country) parts.push(loc.country);
        return parts.join(', ');
      });
    } else if (job.location) {
      // Legacy: single location string
      return [job.location];
    }
    
    return [];
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleExperienceChange = (index, field, value) => {
    const updatedExperience = [...form.experience];
    updatedExperience[index][field] = value;
    setForm({ ...form, experience: updatedExperience });
  };

  const addExperience = () => {
    setForm({
      ...form,
      experience: [...form.experience, { company: '', position: '', role: '', ctc: '', start: '', end: '' }]
    });
  };

  const removeExperience = (index) => {
    const updatedExperience = form.experience.filter((_, i) => i !== index);
    setForm({ ...form, experience: updatedExperience });
  };

  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...form.education];
    updatedEducation[index][field] = value;
    setForm({ ...form, education: updatedEducation });
  };

  const addEducation = () => {
    setForm({
      ...form,
      education: [...form.education, { clg: '', course: '', start: '', end: '' }]
    });
  };

  const removeEducation = (index) => {
    const updatedEducation = form.education.filter((_, i) => i !== index);
    setForm({ ...form, education: updatedEducation });
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a PDF or DOC/DOCX file');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      setResumeFile(file);
      setResumeFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.name || !form.email || !form.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!selectedCategory) {
      toast.error('Please select a skill category');
      return;
    }

    if (selectedSkills.length === 0) {
      toast.error('Please select at least one skill');
      return;
    }

    if (!resumeFile) {
      toast.error('Please upload your resume');
      return;
    }

    if (selectedPreferredLocations.length === 0) {
      toast.error('Please select at least one preferred location');
      return;
    }

    try {
      setSubmitting(true);
      
      // Build preferred locations from selected locations
      const preferredLocations = selectedPreferredLocations.map(locStr => {
        // Parse location string "City, State, Country"
        const parts = locStr.split(',').map(p => p.trim());
        return {
          country: parts[2] || '',
          state: parts[1] || '',
          city: parts[0] || ''
        };
      });

      const candidateData = {
        ...form,
        preferredLocations,
        skills: selectedSkills,
        experience: form.experience.filter(exp => exp.company || exp.position),
        education: form.education.filter(edu => edu.clg || edu.course)
      };

      const response = await axios.post(`${API_URL}/api/candidates/public/apply/${jobId}`, candidateData);
      
      // Upload resume (required)
      if (response.data.candidate) {
        try {
          const formData = new FormData();
          formData.append('resume', resumeFile);
          
          await axios.post(
            `${API_URL}/api/candidates/${response.data.candidate._id}/resume/public`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            }
          );
        } catch (resumeError) {
          console.error('Error uploading resume:', resumeError);
          // Don't fail the application if resume upload fails
        }
      }
      
      toast.success('Application submitted successfully! We will get back to you soon.');
      
      // Reset form after successful submission
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error(error.response?.data?.error || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f8fafc'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!job) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f8fafc',
        color: '#1e293b',
        gap: 2
      }}>
        <Typography variant="h5" sx={{ color: '#1e293b' }}>Job not found</Typography>
        <Typography variant="body2" sx={{ color: '#475569' }}>
          This job posting may have been removed or does not exist.
        </Typography>
      </Box>
    );
  }

  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#ffffff !important',
      borderRadius: '6px',
      '& fieldset': { 
        borderColor: '#ddd !important' 
      },
      '&:hover fieldset': { 
        borderColor: '#bbb !important' 
      },
      '&.Mui-focused fieldset': { 
        borderColor: '#1976d2 !important' 
      }
    },
    '& .MuiInputBase-input': { 
      color: '#333 !important',
      backgroundColor: '#ffffff !important'
    },
    '& .MuiInputLabel-root': { 
      color: '#777 !important',
      backgroundColor: '#ffffff !important',
      padding: '0 8px',
      '&.Mui-focused': { 
        color: '#1976d2 !important',
        backgroundColor: '#ffffff !important'
      },
      '&.MuiFormLabel-filled': {
        backgroundColor: '#ffffff !important'
      }
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: '#f8fafc',
      py: { xs: 1, sm: 2, md: 4 },
      px: { xs: 1, sm: 2 }
    }}>
      <ToastContainer position="top-center" autoClose={3000} theme="light" />
      
      <Container maxWidth="md" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        {/* Header with StaffAnchor Branding */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          mb: { xs: 1, sm: 1, md: 1 },
          py: { xs: 1, sm: 2 }
        }}>
          <img 
            src={staffAnchorLogo} 
            alt="StaffAnchor Logo" 
            style={{ 
              height: '100px',
              width: 'auto',
              maxWidth: '100%'
            }}
          />
        </Box>

        {/* Job Details Card */}
        <Card sx={{
          mb: { xs: 2, sm: 3, md: 4 },
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          boxShadow: 'none'
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: { xs: 'flex-start', sm: 'center' },
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1, sm: 2 }, 
              mb: { xs: 2, sm: 3 } 
            }}>
              <WorkIcon sx={{ 
                color: '#e74c3c', 
                fontSize: { xs: 28, sm: 32, md: 40 },
                alignSelf: { xs: 'flex-start', sm: 'center' }
              }} />
              <Box sx={{ width: '100%' }}>
                <Typography variant="h4" sx={{ 
                  fontWeight: 700, 
                  color: '#1e293b',
                  fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2.125rem' },
                  lineHeight: { xs: 1.3, sm: 1.2 },
                  wordBreak: 'break-word'
                }}>
                  {job.title}
                </Typography>
                <Typography variant="h6" sx={{ 
                  color: '#475569',
                  fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
                  mt: { xs: 0.5, sm: 0 },
                  wordBreak: 'break-word'
                }}>
                  {job.organization}
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  py: { xs: 0.5, sm: 0 }
                }}>
                  <LocationIcon sx={{ 
                    color: '#e74c3c',
                    fontSize: { xs: '1.2rem', sm: '1.5rem' }
                  }} />
                  <Typography sx={{ 
                    color: '#1e293b',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    wordBreak: 'break-word',
                    flex: 1
                  }}>{job.location}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  py: { xs: 0.5, sm: 0 }
                }}>
                  <BusinessIcon sx={{ 
                    color: '#e74c3c',
                    fontSize: { xs: '1.2rem', sm: '1.5rem' }
                  }} />
                  <Typography sx={{ 
                    color: '#1e293b',
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}>
                    {job.experience} years experience
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  py: { xs: 0.5, sm: 0 }
                }}>
                  <MoneyIcon sx={{ 
                    color: '#e74c3c',
                    fontSize: { xs: '1.2rem', sm: '1.5rem' }
                  }} />
                  <Typography sx={{ 
                    color: '#1e293b',
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}>₹ {job.ctc} LPA</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  py: { xs: 0.5, sm: 0 }
                }}>
                  <Chip 
                    label={job.remote ? 'Remote' : 'On-site'} 
                    sx={{ 
                      backgroundColor: '#ffffff',
                      border: '1px solid #ddd',
                      color: '#1e293b',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      height: { xs: '28px', sm: '32px' }
                    }} 
                  />
                </Box>
              </Grid>
            </Grid>

            {job.description && (
              <>
                <Divider sx={{ my: { xs: 2, sm: 3 }, borderColor: '#e2e8f0' }} />
                <Typography variant="h6" sx={{ 
                  color: '#1e293b', 
                  mb: { xs: 1.5, sm: 2 },
                  fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }
                }}>
                  Job Description
                </Typography>
                <Typography sx={{ 
                  color: '#475569', 
                  whiteSpace: 'pre-wrap',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  lineHeight: { xs: 1.5, sm: 1.6 },
                  wordBreak: 'break-word'
                }}>
                  {job.description}
                </Typography>
              </>
            )}
          </CardContent>
        </Card>

        {/* Application Form */}
        <Card sx={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          boxShadow: 'none',
          mb: { xs: 2, sm: 3, md: 4 }
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 700, 
              color: '#1e293b', 
              mb: { xs: 2, sm: 3 },
              fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' },
              textAlign: { xs: 'center', sm: 'left' }
            }}>
              Apply for this Position
            </Typography>

            <form onSubmit={handleSubmit}>
              <Stack spacing={{ xs: 2, sm: 3 }}>
                {/* Basic Information */}
                <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="Full Name"
                      name="name"
                      value={form.name}
                      onChange={handleInputChange}
                      sx={inputStyles}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="Email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleInputChange}
                      sx={inputStyles}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="Phone"
                      name="phone"
                      value={form.phone}
                      onChange={handleInputChange}
                      sx={inputStyles}
                    />
                  </Grid>
                </Grid>

                {/* Total Experience */}
                <Box>
                  <Typography variant="subtitle2" sx={{ 
                    color: '#475569', 
                    mb: { xs: 1, sm: 1.5 },
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}>
                    Total Experience
                  </Typography>
                  <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Years"
                        name="totalExperienceYears"
                        type="number"
                        value={form.totalExperienceYears}
                        onChange={handleInputChange}
                        inputProps={{ min: 0, max: 50 }}
                        sx={inputStyles}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Months"
                        name="totalExperienceMonths"
                        type="number"
                        value={form.totalExperienceMonths}
                        onChange={handleInputChange}
                        inputProps={{ min: 0, max: 50 }}
                        sx={inputStyles}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* CTC Information */}
                <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Current CTC (LPA)"
                      name="currentCTC"
                      value={form.currentCTC}
                      onChange={handleInputChange}
                      placeholder="e.g., 10"
                      sx={inputStyles}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Expected CTC (LPA)"
                      name="expectedCTC"
                      value={form.expectedCTC}
                      onChange={handleInputChange}
                      placeholder="e.g., 15"
                      sx={inputStyles}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.05)' }} />

                {/* Preferred Location */}
                <Box>
                  <Typography variant="h6" sx={{ 
                    color: '#475569', 
                    mb: { xs: 1.5, sm: 2 },
                    fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }
                  }}>
                    Preferred Location(s) *
                  </Typography>
                  {job && getJobLocations().length > 0 ? (
                    <FormControl fullWidth required>
                      <InputLabel sx={{ color: '#64748b' }}>Select Location(s)</InputLabel>
                      <Select
                        multiple
                        value={selectedPreferredLocations}
                        onChange={(e) => setSelectedPreferredLocations(e.target.value)}
                        label="Select Location(s)"
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                              <Chip
                                key={value}
                                label={value}
                                size="small"
                                sx={{
                                  backgroundColor: '#ffffff',
                                  border: '1px solid #ddd',
                                  color: '#1e293b'
                                }}
                              />
                            ))}
                          </Box>
                        )}
                        sx={{
                          color: '#1e293b',
                          backgroundColor: '#fff',
                          borderRadius: '6px',
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ddd' },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#bbb' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1976d2' },
                          '& .MuiSvgIcon-root': { color: '#475569' }
                        }}
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
                        {getJobLocations().map((location) => (
                          <MenuItem key={location} value={location}>
                            {location}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <Typography variant="body2" sx={{ color: '#475569', fontStyle: 'italic' }}>
                      No locations available for this job
                    </Typography>
                  )}
                </Box>

                <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.05)' }} />

                {/* Skills */}
                <Box>
                  <Typography variant="h6" sx={{ 
                    color: '#475569', 
                    mb: { xs: 1.5, sm: 2 },
                    fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }
                  }}>
                    Skills *
                  </Typography>
                  
                  {/* Category Selection */}
                  <Box sx={{ mb: 2 }}>
                    <FormControl fullWidth required>
                      <InputLabel sx={{ color: '#64748b' }}>Category</InputLabel>
                      <Select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        label="Category"
                        sx={{
                          color: '#1e293b',
                          backgroundColor: '#fff',
                          borderRadius: '6px',
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ddd' },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#bbb' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1976d2' },
                          '& .MuiSvgIcon-root': { color: '#475569' }
                        }}
                      >
                        {skillCategories.map((category) => (
                          <MenuItem key={category.value} value={category.value}>
                            {category.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Skills Selection */}
                  {selectedCategory && (
                    <Autocomplete
                      multiple
                      options={allSkills}
                      value={selectedSkills}
                      onChange={(e, newValue) => setSelectedSkills(newValue)}
                      disabled={!selectedCategory || allSkills.length === 0}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder={allSkills.length === 0 ? "No skills available for this category" : "Select skills..."}
                          required={selectedSkills.length === 0}
                          sx={{
                            backgroundColor: '#ffffff !important',
                            borderRadius: '6px',
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: '#ffffff !important',
                              '& fieldset': { borderColor: '#ddd !important' },
                              '&:hover fieldset': { borderColor: '#bbb !important' },
                              '&.Mui-focused fieldset': { borderColor: '#1976d2 !important' },
                            },
                            '& .MuiInputLabel-root': { color: '#777 !important' },
                            '& .MuiInputBase-input': { 
                              color: '#333 !important',
                              backgroundColor: 'transparent !important'
                            },
                            '& .MuiAutocomplete-input': {
                              color: '#333 !important',
                              backgroundColor: 'transparent !important'
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
                            sx={{ 
                              backgroundColor: '#ffffff !important', 
                              border: '1px solid #ddd !important',
                              color: '#333 !important',
                              textTransform: 'capitalize'
                            }}
                          />
                        ))
                      }
                      sx={{
                        backgroundColor: '#ffffff !important',
                        '& .MuiAutocomplete-popupIndicator': { color: '#666 !important' },
                        '& .MuiAutocomplete-clearIndicator': { color: '#666 !important' },
                        '& .MuiAutocomplete-inputRoot': {
                          backgroundColor: '#ffffff !important',
                          color: '#333 !important'
                        },
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#ffffff !important'
                        },
                        '& .MuiAutocomplete-listbox': {
                          backgroundColor: '#ffffff !important',
                          '& .MuiAutocomplete-option': {
                            color: '#333 !important',
                            backgroundColor: '#ffffff !important',
                            '&[aria-selected="true"]': {
                              backgroundColor: '#f5f5f5 !important',
                            },
                            '&:hover': {
                              backgroundColor: '#f5f5f5 !important',
                            },
                          },
                        },
                        '& .MuiAutocomplete-paper': {
                          backgroundColor: '#ffffff !important',
                          border: '1px solid #e5e5e5 !important',
                        },
                      }}
                    />
                  )}
                  {!selectedCategory && (
                    <Typography variant="caption" sx={{ color: '#475569', mt: 0.5, display: 'block' }}>
                      Please select a category first
                    </Typography>
                  )}
                </Box>

                <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.05)' }} />

                {/* Work Experience */}
                <Box>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1, sm: 0 },
                    mb: { xs: 1.5, sm: 2 }
                  }}>
                    <Typography variant="h6" sx={{ 
                      color: '#475569',
                      fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }
                    }}>
                      Work Experience (Optional)
                    </Typography>
                    <Button 
                      startIcon={<AddIcon />}
                      onClick={addExperience}
                      sx={{ 
                        color: '#e74c3c',
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        alignSelf: { xs: 'flex-start', sm: 'center' }
                      }}
                    >
                      Add Experience
                    </Button>
                  </Box>
                  {form.experience.map((exp, index) => (
                      <Paper key={index} sx={{ 
                      p: { xs: 1.5, sm: 2 }, 
                      mb: { xs: 1.5, sm: 2 }, 
                      background: '#ffffff',
                      border: '1px solid #e2e8f0'
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mb: { xs: 1.5, sm: 2 }
                      }}>
                        <Typography sx={{ 
                          color: '#1e293b',
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          fontWeight: 500
                        }}>Experience {index + 1}</Typography>
                        {form.experience.length > 1 && (
                          <IconButton 
                            onClick={() => removeExperience(index)} 
                            sx={{ 
                              color: '#f44336',
                              padding: { xs: '4px', sm: '8px' }
                            }}
                            size={window.innerWidth < 600 ? 'small' : 'medium'}
                          >
                            <DeleteIcon fontSize={window.innerWidth < 600 ? 'small' : 'medium'} />
                          </IconButton>
                        )}
                      </Box>
                      <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Company"
                            value={exp.company}
                            onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                            sx={inputStyles}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Position"
                            value={exp.position}
                            onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                            sx={inputStyles}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Role/Responsibilities"
                            value={exp.role}
                            onChange={(e) => handleExperienceChange(index, 'role', e.target.value)}
                            sx={inputStyles}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            label="CTC (LPA)"
                            value={exp.ctc}
                            onChange={(e) => handleExperienceChange(index, 'ctc', e.target.value)}
                            sx={inputStyles}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            label="Start Date"
                            type="month"
                            value={exp.start}
                            onChange={(e) => handleExperienceChange(index, 'start', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={inputStyles}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            label="End Date"
                            type="month"
                            value={exp.end}
                            onChange={(e) => handleExperienceChange(index, 'end', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={inputStyles}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </Box>

                <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.05)' }} />

                {/* Education */}
                <Box>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1, sm: 0 },
                    mb: { xs: 1.5, sm: 2 }
                  }}>
                    <Typography variant="h6" sx={{ 
                      color: '#475569',
                      fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }
                    }}>
                      Education (Optional)
                    </Typography>
                    <Button 
                      startIcon={<AddIcon />}
                      onClick={addEducation}
                      sx={{ 
                        color: '#e74c3c',
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        alignSelf: { xs: 'flex-start', sm: 'center' }
                      }}
                    >
                      Add Education
                    </Button>
                  </Box>
                  {form.education.map((edu, index) => (
                      <Paper key={index} sx={{ 
                      p: { xs: 1.5, sm: 2 }, 
                      mb: { xs: 1.5, sm: 2 }, 
                      background: '#ffffff',
                      border: '1px solid #e2e8f0'
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mb: { xs: 1.5, sm: 2 }
                      }}>
                        <Typography sx={{ 
                          color: '#1e293b',
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          fontWeight: 500
                        }}>Education {index + 1}</Typography>
                        {form.education.length > 1 && (
                          <IconButton 
                            onClick={() => removeEducation(index)} 
                            sx={{ 
                              color: '#f44336',
                              padding: { xs: '4px', sm: '8px' }
                            }}
                            size={window.innerWidth < 600 ? 'small' : 'medium'}
                          >
                            <DeleteIcon fontSize={window.innerWidth < 600 ? 'small' : 'medium'} />
                          </IconButton>
                        )}
                      </Box>
                      <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Institution"
                            value={edu.clg}
                            onChange={(e) => handleEducationChange(index, 'clg', e.target.value)}
                            sx={inputStyles}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Course/Degree"
                            value={edu.course}
                            onChange={(e) => handleEducationChange(index, 'course', e.target.value)}
                            sx={inputStyles}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Start Year"
                            value={edu.start}
                            onChange={(e) => handleEducationChange(index, 'start', e.target.value)}
                            sx={inputStyles}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="End Year"
                            value={edu.end}
                            onChange={(e) => handleEducationChange(index, 'end', e.target.value)}
                            sx={inputStyles}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </Box>

                <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.05)' }} />

                {/* Resume Upload */}
                <Box>
                  <Typography variant="h6" sx={{ 
                    color: '#475569', 
                    mb: { xs: 1.5, sm: 2 },
                    fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }
                  }}>
                    Resume / CV
                  </Typography>
                  <Paper sx={{ 
                    p: { xs: 2, sm: 3 }, 
                    background: '#ffffff',
                    border: '2px dashed #ddd',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    {!resumeFile ? (
                      <>
                        <CloudUploadIcon sx={{ 
                          fontSize: { xs: 36, sm: 48 }, 
                          color: '#1976d2', 
                          mb: { xs: 1.5, sm: 2 } 
                        }} />
                        <Typography variant="body1" sx={{ 
                          color: '#475569', 
                          mb: { xs: 1.5, sm: 2 },
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          px: { xs: 1, sm: 0 }
                        }}>
                          Upload your resume (PDF, DOC, or DOCX) <span style={{ color: '#e74c3c' }}>*</span>
                        </Typography>
                        <Button
                          variant="contained"
                          component="label"
                          sx={{
                            backgroundColor: '#1976d2',
                            color: '#ffffff',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            px: { xs: 3, sm: 4 },
                            py: { xs: 0.75, sm: 1 },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            '&:hover': { backgroundColor: '#1565c0' }
                          }}
                        >
                          Choose File
                          <input
                            type="file"
                            hidden
                            accept=".pdf,.doc,.docx"
                            onChange={handleResumeChange}
                          />
                        </Button>
                        <Typography variant="caption" sx={{ 
                          color: '#475569', 
                          display: 'block', 
                          mt: { xs: 1.5, sm: 2 },
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}>
                          Maximum file size: 5MB
                        </Typography>
                      </>
                    ) : (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: 1.5, sm: 2 },
                        textAlign: { xs: 'center', sm: 'left' }
                      }}>
                        <CheckCircleIcon sx={{ 
                          color: '#4caf50', 
                          fontSize: { xs: 28, sm: 32 } 
                        }} />
                        <Box sx={{ 
                          textAlign: { xs: 'center', sm: 'left' },
                          flex: 1
                        }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: { xs: 'center', sm: 'flex-start' },
                            gap: 1,
                            flexWrap: 'wrap'
                          }}>
                            <FileIcon sx={{ 
                              color: '#1976d2',
                              fontSize: { xs: '1.2rem', sm: '1.5rem' }
                            }} />
                            <Typography sx={{ 
                              color: '#1e293b', 
                              fontWeight: 600,
                              fontSize: { xs: '0.875rem', sm: '1rem' },
                              wordBreak: 'break-word'
                            }}>
                              {resumeFileName}
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{ 
                            color: '#4caf50',
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                          }}>
                            Ready to upload
                          </Typography>
                        </Box>
                        <IconButton 
                          onClick={() => {
                            setResumeFile(null);
                            setResumeFileName('');
                          }}
                          sx={{ 
                            color: '#f44336',
                            padding: { xs: '4px', sm: '8px' }
                          }}
                          size={window.innerWidth < 600 ? 'small' : 'medium'}
                        >
                          <DeleteIcon fontSize={window.innerWidth < 600 ? 'small' : 'medium'} />
                        </IconButton>
                      </Box>
                    )}
                  </Paper>
                </Box>

                {/* Submit Button */}
                <Box sx={{ textAlign: 'center', pt: { xs: 2, sm: 3, md: 4 } }}>
                  <Paper sx={{ 
                    p: { xs: 2, sm: 3 }, 
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}>
                    <Typography variant="body2" sx={{ 
                      color: '#475569', 
                      mb: { xs: 2, sm: 3 },
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      px: { xs: 1, sm: 0 },
                      lineHeight: 1.5
                    }}>
                      By submitting this application, you agree to be contacted by StaffAnchor regarding this position.
                    </Typography>
                    <Button 
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={submitting}
                      startIcon={submitting ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                      sx={{
                        backgroundColor: '#f8b2c1',
                        color: '#1e293b',
                        px: { xs: 4, sm: 6, md: 8 },
                        py: { xs: 1, sm: 1.25, md: 1.5 },
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        borderRadius: '6px',
                        boxShadow: 'none',
                        minWidth: { xs: '200px', sm: '250px' },
                        '&:hover': { 
                          backgroundColor: '#f398a8'
                        },
                        '&:disabled': { 
                          backgroundColor: '#ccc', 
                          color: '#888'
                        }
                      }}
                    >
                      {submitting ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  </Paper>
                </Box>
              </Stack>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <Paper sx={{
          mt: { xs: 2, sm: 3, md: 4 },
          p: { xs: 2, sm: 3 },
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#475569',
              mb: { xs: 0.5, sm: 1 },
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}
          >
            © {new Date().getFullYear()} StaffAnchor. All rights reserved.
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#475569',
              fontSize: { xs: '0.6875rem', sm: '0.75rem' }
            }}
          >
            Connecting Talent with Opportunity
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default PublicJobApplication;