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
        background: 'linear-gradient(135deg, #1a1a2e 0%, #232946 100%)'
      }}>
        <CircularProgress sx={{ color: '#eebbc3' }} />
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
        background: 'linear-gradient(135deg, #1a1a2e 0%, #232946 100%)',
        color: '#f5f7fa',
        gap: 2
      }}>
        <Typography variant="h5">Job not found</Typography>
        <Typography variant="body2" sx={{ color: '#b8c5d6' }}>
          This job posting may have been removed or does not exist.
        </Typography>
      </Box>
    );
  }

  const inputStyles = {
    '& .MuiInputBase-input': { color: '#f5f7fa' },
    '& .MuiInputLabel-root': { color: '#b8c5d6' },
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
      '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.4)' },
      '&.Mui-focused fieldset': { borderColor: '#eebbc3' }
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #232946 100%)',
      py: { xs: 2, md: 4 }
    }}>
      <ToastContainer position="top-center" autoClose={3000} theme="dark" />
      
      <Container maxWidth="md">
        {/* Header with StaffAnchor Branding */}
        <Paper sx={{
          mb: 4,
          p: { xs: 3, md: 4 },
          background: 'linear-gradient(135deg, #232946 0%, #1a1a2e 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 2,
          textAlign: 'center'
        }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: 2
          }}>
            <img 
              src={staffAnchorLogo} 
              alt="StaffAnchor Logo" 
              style={{ 
                height: '60px',
                width: 'auto',
                maxWidth: '100%'
              }} 
            />
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                color: '#eebbc3',
                fontSize: { xs: '1.5rem', md: '2rem' },
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
              }}
            >
              StaffAnchor
            </Typography>
          </Box>
        </Paper>

        {/* Job Details Card */}
        <Card sx={{
          mb: 4,
          background: 'linear-gradient(135deg, #232946 0%, #1a1a2e 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 2
        }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <WorkIcon sx={{ color: '#eebbc3', fontSize: { xs: 32, md: 40 } }} />
              <Box>
                <Typography variant="h4" sx={{ 
                  fontWeight: 700, 
                  color: '#eebbc3',
                  fontSize: { xs: '1.5rem', md: '2.125rem' }
                }}>
                  {job.title}
                </Typography>
                <Typography variant="h6" sx={{ 
                  color: '#b8c5d6',
                  fontSize: { xs: '1rem', md: '1.25rem' }
                }}>
                  {job.organization}
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon sx={{ color: '#4f8cff' }} />
                  <Typography sx={{ color: '#f5f7fa' }}>{job.location}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BusinessIcon sx={{ color: '#4f8cff' }} />
                  <Typography sx={{ color: '#f5f7fa' }}>
                    {job.experience} years experience
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MoneyIcon sx={{ color: '#4f8cff' }} />
                  <Typography sx={{ color: '#f5f7fa' }}>₹ {job.ctc} LPA</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Chip 
                  label={job.remote ? 'Remote' : 'On-site'} 
                  sx={{ 
                    backgroundColor: job.remote ? 'rgba(76, 175, 80, 0.2)' : 'rgba(79, 140, 255, 0.2)',
                    color: job.remote ? '#4caf50' : '#4f8cff'
                  }} 
                />
              </Grid>
            </Grid>

            {job.description && (
              <>
                <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                <Typography variant="h6" sx={{ color: '#eebbc3', mb: 2 }}>
                  Job Description
                </Typography>
                <Typography sx={{ color: '#b8c5d6', whiteSpace: 'pre-wrap' }}>
                  {job.description}
                </Typography>
              </>
            )}
          </CardContent>
        </Card>

        {/* Application Form */}
        <Card sx={{
          background: 'linear-gradient(135deg, #232946 0%, #1a1a2e 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 2,
          mb: 4
        }}>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 700, 
              color: '#eebbc3', 
              mb: 3,
              fontSize: { xs: '1.25rem', md: '1.5rem' }
            }}>
              Apply for this Position
            </Typography>

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                {/* Basic Information */}
                <Grid container spacing={2}>
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
                  <Grid item xs={12} md={6}>
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
                  <Grid item xs={12} md={6}>
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
                  <Typography variant="subtitle2" sx={{ color: '#b8c5d6', mb: 1 }}>
                    Total Experience
                  </Typography>
                  <Grid container spacing={2}>
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
                        inputProps={{ min: 0, max: 11 }}
                        sx={inputStyles}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* CTC Information */}
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
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
                  <Grid item xs={12} md={6}>
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

                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                {/* Preferred Location */}
                <Box>
                  <Typography variant="h6" sx={{ color: '#b8c5d6', mb: 2 }}>
                    Preferred Location(s) *
                  </Typography>
                  {job && getJobLocations().length > 0 ? (
                    <FormControl fullWidth required>
                      <InputLabel sx={{ color: '#b8c5d6' }}>Select Location(s)</InputLabel>
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
                                  backgroundColor: 'rgba(79, 140, 255, 0.2)',
                                  color: '#4f8cff',
                                  '& .MuiChip-deleteIcon': { color: '#4f8cff' }
                                }}
                              />
                            ))}
                          </Box>
                        )}
                        sx={{
                          color: '#f5f7fa',
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(238, 187, 195, 0.5)' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#eebbc3' },
                          '& .MuiSvgIcon-root': { color: '#b8c5d6' }
                        }}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              backgroundColor: '#1a1a2e',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              '& .MuiMenuItem-root': {
                                color: '#f5f7fa',
                                '&:hover': {
                                  backgroundColor: 'rgba(238, 187, 195, 0.1)'
                                },
                                '&.Mui-selected': {
                                  backgroundColor: 'rgba(79, 140, 255, 0.2)',
                                  color: '#4f8cff'
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
                    <Typography variant="body2" sx={{ color: '#b8c5d6', fontStyle: 'italic' }}>
                      No locations available for this job
                    </Typography>
                  )}
                </Box>

                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                {/* Skills */}
                <Box>
                  <Typography variant="h6" sx={{ color: '#b8c5d6', mb: 2 }}>
                    Skills *
                  </Typography>
                  
                  {/* Category Selection */}
                  <Box sx={{ mb: 2 }}>
                    <FormControl fullWidth required>
                      <InputLabel sx={{ color: '#b8c5d6' }}>Category</InputLabel>
                      <Select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        label="Category"
                        sx={{
                          color: '#f5f7fa',
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(238, 187, 195, 0.5)' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#eebbc3' },
                          '& .MuiSvgIcon-root': { color: '#b8c5d6' }
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
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                              '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.5)' },
                              '&.Mui-focused fieldset': { borderColor: '#eebbc3' },
                            },
                            '& .MuiInputLabel-root': { color: '#b8c5d6' },
                            '& .MuiInputBase-input': { color: '#f5f7fa' },
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
                              backgroundColor: 'rgba(79, 140, 255, 0.2)', 
                              color: '#4f8cff',
                              textTransform: 'capitalize',
                              '& .MuiChip-deleteIcon': { color: '#4f8cff' }
                            }}
                          />
                        ))
                      }
                      sx={{
                        '& .MuiAutocomplete-popupIndicator': { color: '#b8c5d6' },
                        '& .MuiAutocomplete-clearIndicator': { color: '#b8c5d6' },
                        '& .MuiAutocomplete-listbox': {
                          backgroundColor: '#1a1a2e',
                          '& .MuiAutocomplete-option': {
                            color: '#f5f7fa',
                            '&[aria-selected="true"]': {
                            backgroundColor: 'rgba(79, 140, 255, 0.2)',
                          },
                          '&:hover': {
                            backgroundColor: 'rgba(238, 187, 195, 0.1)',
                          },
                        },
                      },
                      '& .MuiAutocomplete-paper': {
                        backgroundColor: '#1a1a2e',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  />
                  )}
                  {!selectedCategory && (
                    <Typography variant="caption" sx={{ color: '#b8c5d6', mt: 0.5, display: 'block' }}>
                      Please select a category first
                    </Typography>
                  )}
                </Box>

                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                {/* Work Experience */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: '#b8c5d6' }}>
                      Work Experience (Optional)
                    </Typography>
                    <Button 
                      startIcon={<AddIcon />}
                      onClick={addExperience}
                      sx={{ color: '#4f8cff' }}
                    >
                      Add Experience
                    </Button>
                  </Box>
                  {form.experience.map((exp, index) => (
                    <Paper key={index} sx={{ 
                      p: 2, 
                      mb: 2, 
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography sx={{ color: '#eebbc3' }}>Experience {index + 1}</Typography>
                        {form.experience.length > 1 && (
                          <IconButton onClick={() => removeExperience(index)} sx={{ color: '#f44336' }}>
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>
                      <Grid container spacing={2}>
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

                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                {/* Education */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: '#b8c5d6' }}>
                      Education (Optional)
                    </Typography>
                    <Button 
                      startIcon={<AddIcon />}
                      onClick={addEducation}
                      sx={{ color: '#4f8cff' }}
                    >
                      Add Education
                    </Button>
                  </Box>
                  {form.education.map((edu, index) => (
                    <Paper key={index} sx={{ 
                      p: 2, 
                      mb: 2, 
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography sx={{ color: '#eebbc3' }}>Education {index + 1}</Typography>
                        {form.education.length > 1 && (
                          <IconButton onClick={() => removeEducation(index)} sx={{ color: '#f44336' }}>
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>
                      <Grid container spacing={2}>
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

                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                {/* Resume Upload */}
                <Box>
                  <Typography variant="h6" sx={{ color: '#b8c5d6', mb: 2 }}>
                    Resume / CV
                  </Typography>
                  <Paper sx={{ 
                    p: 3, 
                    background: 'rgba(238, 187, 195, 0.05)',
                    border: '2px dashed rgba(238, 187, 195, 0.3)',
                    borderRadius: 2,
                    textAlign: 'center'
                  }}>
                    {!resumeFile ? (
                      <>
                        <CloudUploadIcon sx={{ fontSize: 48, color: '#eebbc3', mb: 2 }} />
                        <Typography variant="body1" sx={{ color: '#b8c5d6', mb: 2 }}>
                          Upload your resume (PDF, DOC, or DOCX) <span style={{ color: '#ff6b6b' }}>*</span>
                        </Typography>
                        <Button
                          variant="contained"
                          component="label"
                          sx={{
                            backgroundColor: '#eebbc3',
                            color: '#1a1a2e',
                            '&:hover': { backgroundColor: '#d4a5ac' }
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
                        <Typography variant="caption" sx={{ color: '#90caf9', display: 'block', mt: 2 }}>
                          Maximum file size: 5MB
                        </Typography>
                      </>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                        <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 32 }} />
                        <Box sx={{ textAlign: 'left' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FileIcon sx={{ color: '#eebbc3' }} />
                            <Typography sx={{ color: '#f5f7fa', fontWeight: 600 }}>
                              {resumeFileName}
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{ color: '#4caf50' }}>
                            Ready to upload
                          </Typography>
                        </Box>
                        <IconButton 
                          onClick={() => {
                            setResumeFile(null);
                            setResumeFileName('');
                          }}
                          sx={{ color: '#f44336' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    )}
                  </Paper>
                </Box>

                {/* Submit Button */}
                <Box sx={{ textAlign: 'center', pt: 4 }}>
                  <Paper sx={{ 
                    p: 3, 
                    background: 'rgba(238, 187, 195, 0.05)',
                    border: '1px solid rgba(238, 187, 195, 0.2)',
                    borderRadius: 2
                  }}>
                    <Typography variant="body2" sx={{ color: '#b8c5d6', mb: 3 }}>
                      By submitting this application, you agree to be contacted by StaffAnchor regarding this position.
                    </Typography>
                    <Button 
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={submitting}
                      startIcon={submitting ? <CircularProgress size={20} sx={{ color: '#999' }} /> : <CheckCircleIcon />}
                      sx={{
                        backgroundColor: '#eebbc3',
                        color: '#1a1a2e',
                        px: 8,
                        py: 2,
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(238, 187, 195, 0.4)',
                        '&:hover': { 
                          backgroundColor: '#d4a5ac',
                          boxShadow: '0 6px 16px rgba(238, 187, 195, 0.6)',
                          transform: 'translateY(-2px)',
                          transition: 'all 0.3s ease'
                        },
                        '&:disabled': { 
                          backgroundColor: '#666', 
                          color: '#999',
                          boxShadow: 'none'
                        }
                      }}
                    >
                      {submitting ? 'Submitting Your Application...' : 'Submit Application'}
                    </Button>
                  </Paper>
                </Box>
              </Stack>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <Paper sx={{
          mt: 4,
          p: 3,
          background: 'linear-gradient(135deg, #232946 0%, #1a1a2e 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 2,
          textAlign: 'center'
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#b8c5d6',
              mb: 1
            }}
          >
            © {new Date().getFullYear()} StaffAnchor. All rights reserved.
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#90caf9'
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
