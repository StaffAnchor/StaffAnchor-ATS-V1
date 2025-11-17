import React, { useState } from 'react';
import axios from 'axios';
import JobList from './JobList.jsx';
import ResultsLimitPopup from './ResultsLimitPopup.jsx';
import DeleteConfirmationPopup from './DeleteConfirmationPopup.jsx';
import AIWarningDialog from './AIWarningDialog.jsx';
import { toast } from 'react-toastify';
import { Typography, Button, Box, TextField, Stack, Divider, Link, Card, CardContent, Grid, Chip, Table, TableBody, TableCell, TableContainer, TableRow, Paper, Autocomplete, IconButton } from '@mui/material';
import { Star as StarIcon, InsertDriveFile as FileIcon, CloudUpload as CloudUploadIcon, Delete as DeleteIcon } from '@mui/icons-material';
import API_URL from '../config/api';

const CandidateDetails = ({ candidate, accessLevel, initialEditMode = false }) => {
  const [showJobs, setShowJobs] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [editMode, setEditMode] = useState(initialEditMode);
  const [editCandidate, setEditCandidate] = useState({ ...candidate });
  const [matchingResults, setMatchingResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResultsPopup, setShowResultsPopup] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [deletingResume, setDeletingResume] = useState(false);
  const [showAIWarning, setShowAIWarning] = useState(false);

  // Sync editMode with initialEditMode prop when it changes
  React.useEffect(() => {
    setEditMode(initialEditMode);
  }, [initialEditMode]);

  // Fetch available skills when component mounts or enters edit mode
  React.useEffect(() => {
    if (editMode) {
      const fetchSkills = async () => {
        try {
          const token = localStorage.getItem('jwt');
          const response = await axios.get('https://staffanchor-ats-v1.onrender.com/api/skills', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAvailableSkills(response.data.map(skill => skill.name));
        } catch (error) {
          console.error('Error fetching skills:', error);
        }
      };
      fetchSkills();
    }
  }, [editMode]);

  const findSuitableJobs = () => {
    setShowAIWarning(true);
  };

  const handleAIWarningProceed = () => {
    setShowResultsPopup(true);
  };

  const handleFindJobsWithLimit = async (limit) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('jwt');
      const res = await axios.get(`https://staffanchor-ats-v1.onrender.com/api/candidates/${candidate._id}/suitable-jobs?limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.suitableJobs && res.data.suitableJobs.length > 0) {
        // Limit the results to the requested number
        const limitedJobs = res.data.suitableJobs.slice(0, limit);
        setJobs(limitedJobs);
        setMatchingResults({
          ...res.data,
          suitableJobs: limitedJobs
        });
        setShowJobs(true);
        toast.success(`Found ${limitedJobs.length} suitable jobs!`);
      } else {
        toast.info('No suitable jobs found for this candidate.');
      }
    } catch (error) {
      console.error('Error finding suitable jobs:', error);
      toast.error('Failed to find suitable jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCandidate = () => {
    setShowDeletePopup(true);
  };

  const confirmDeleteCandidate = async () => {
    try {
      setIsDeleting(true);
      const token = localStorage.getItem('jwt');
      await axios.delete(`https://staffanchor-ats-v1.onrender.com/api/candidates/${candidate._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Candidate deleted successfully!');
      
      // Close the popup
      setShowDeletePopup(false);
      
      // Emit event to notify parent component
      window.dispatchEvent(new CustomEvent('candidateDeleted', { 
        detail: { candidateId: candidate._id } 
      }));
      
    } catch (error) {
      console.error('Error deleting candidate:', error);
      toast.error('Failed to delete candidate');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeletePopup(false);
  };

  const handleEditChange = e => {
    const { name, value } = e.target;
    setEditCandidate({ ...editCandidate, [name]: value });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('jwt');
      await axios.put(`https://staffanchor-ats-v1.onrender.com/api/candidates/${candidate._id}`, editCandidate, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Candidate updated!');
      setEditMode(false);
    } catch {
      toast.error('Error updating candidate');
    }
  };

  // Handle resume upload
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF and DOCX files are allowed');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploadingResume(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const token = localStorage.getItem('jwt');
      await axios.post(
        `${API_URL}/api/candidates/${candidate._id}/resume`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      toast.success('Resume uploaded successfully!');
      
      // Wait a moment for the success message to show, then refresh
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast.error('Failed to upload resume: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploadingResume(false);
    }
  };

  // Handle resume deletion
  const handleResumeDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this resume?')) {
      return;
    }

    setDeletingResume(true);
    try {
      const token = localStorage.getItem('jwt');
      await axios.delete(
        `${API_URL}/api/candidates/${candidate._id}/resume`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Resume deleted successfully!');
      
      // Wait a moment for the success message to show, then refresh
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast.error('Failed to delete resume: ' + (error.response?.data?.error || error.message));
    } finally {
      setDeletingResume(false);
    }
  };

  return (
    <Box sx={{p: 2, background: 'var(--color-bg-dark)', borderRadius: 2, boxShadow: 3, color: '#f5f7fa', border: '1px solid #444'}}>
      <Stack spacing={2}>
        {editMode ? (
          <>
            <Typography variant="h6" sx={{fontWeight: 600}}>Edit Candidate</Typography>
            <TextField
              label="Name"
              name="name"
              value={editCandidate.name}
              onChange={handleEditChange}
              fullWidth
              sx={{ '& .MuiInputBase-input': { color: '#f5f7fa' }, '& .MuiInputLabel-root': { color: '#b8c5d6' } }}
            />
            <TextField
              label="Email"
              name="email"
              value={editCandidate.email}
              onChange={handleEditChange}
              fullWidth
              sx={{ '& .MuiInputBase-input': { color: '#f5f7fa' }, '& .MuiInputLabel-root': { color: '#b8c5d6' } }}
            />
            <TextField
              label="Phone"
              name="phone"
              value={editCandidate.phone}
              onChange={handleEditChange}
              fullWidth
              sx={{ '& .MuiInputBase-input': { color: '#f5f7fa' }, '& .MuiInputLabel-root': { color: '#b8c5d6' } }}
            />
            <Autocomplete
              multiple
              freeSolo
              options={availableSkills}
              value={editCandidate.skills || []}
              onChange={(e, newValue) => setEditCandidate({
                ...editCandidate,
                skills: newValue
              })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Skills"
                  placeholder="Select or type skills..."
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <StarIcon sx={{ color: '#b8c5d6', mr: 1 }} />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
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
              }}
            />
            <TextField
              label="LinkedIn"
              name="linkedin"
              value={editCandidate.linkedin}
              onChange={handleEditChange}
              fullWidth
              sx={{ '& .MuiInputBase-input': { color: '#f5f7fa' }, '& .MuiInputLabel-root': { color: '#b8c5d6' } }}
            />
            <TextField
              label="X (Twitter)"
              name="x"
              value={editCandidate.x}
              onChange={handleEditChange}
              fullWidth
              sx={{ '& .MuiInputBase-input': { color: '#f5f7fa' }, '& .MuiInputLabel-root': { color: '#b8c5d6' } }}
            />
          </>
        ) : (
          <>
            <Typography variant="h6" sx={{fontWeight: 600}}>Candidate Details</Typography>
            <TableContainer component={Paper} sx={{background: '#232946', borderRadius: 2}}>
              <Table size="small">
                <TableBody>
                  <TableRow sx={{ '&:hover': { background: 'rgba(255, 255, 255, 0.05)' } }}>
                    <TableCell sx={{fontWeight: 700, color: '#90caf9', width: 120, borderBottom: '1px solid rgba(255, 255, 255, 0.08)'}}>Name</TableCell>
                    <TableCell sx={{color: '#f5f7fa', borderBottom: '1px solid rgba(255, 255, 255, 0.08)'}}>{candidate.name}</TableCell>
                  </TableRow>
                  <TableRow sx={{ '&:hover': { background: 'rgba(255, 255, 255, 0.05)' } }}>
                    <TableCell sx={{fontWeight: 700, color: '#90caf9', width: 120, borderBottom: '1px solid rgba(255, 255, 255, 0.08)'}}>Email</TableCell>
                    <TableCell sx={{color: '#f5f7fa', borderBottom: '1px solid rgba(255, 255, 255, 0.08)'}}>{candidate.email}</TableCell>
                  </TableRow>
                  <TableRow sx={{ '&:hover': { background: 'rgba(255, 255, 255, 0.05)' } }}>
                    <TableCell sx={{fontWeight: 700, color: '#90caf9', width: 120, borderBottom: '1px solid rgba(255, 255, 255, 0.08)'}}>Phone</TableCell>
                    <TableCell sx={{color: '#f5f7fa', borderBottom: '1px solid rgba(255, 255, 255, 0.08)'}}>{candidate.phone || 'Not provided'}</TableCell>
                  </TableRow>
                  <TableRow sx={{ '&:hover': { background: 'rgba(255, 255, 255, 0.05)' } }}>
                    <TableCell sx={{fontWeight: 700, color: '#90caf9', width: 120, borderBottom: '1px solid rgba(255, 255, 255, 0.08)'}}>Skills</TableCell>
                    <TableCell sx={{color: '#f5f7fa', borderBottom: '1px solid rgba(255, 255, 255, 0.08)'}}>
                      {candidate.skills && candidate.skills.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {candidate.skills.map((skill, idx) => (
                            <Chip 
                              key={idx} 
                              label={skill} 
                              size="small"
                              sx={{ 
                                backgroundColor: 'rgba(238, 187, 195, 0.2)', 
                                color: '#eebbc3',
                                fontSize: '0.8rem'
                              }}
                            />
                          ))}
                        </Box>
                      ) : (
                        'No skills listed'
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ '&:hover': { background: 'rgba(255, 255, 255, 0.05)' } }}>
                    <TableCell sx={{fontWeight: 700, color: '#90caf9', width: 120, borderBottom: '1px solid rgba(255, 255, 255, 0.08)'}}>LinkedIn</TableCell>
                    <TableCell sx={{color: '#f5f7fa', borderBottom: '1px solid rgba(255, 255, 255, 0.08)'}}>
                      {candidate.linkedin ? (
                        <Link href={`https://linkedin.com/in/${candidate.linkedin}`} target="_blank" rel="noopener" sx={{color:'#4fc3f7'}}>
                          {candidate.linkedin}
                        </Link>
                      ) : (
                        'Not provided'
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ '&:hover': { background: 'rgba(255, 255, 255, 0.05)' } }}>
                    <TableCell sx={{fontWeight: 700, color: '#90caf9', width: 120, borderBottom: '1px solid rgba(255, 255, 255, 0.08)'}}>X (Twitter)</TableCell>
                    <TableCell sx={{color: '#f5f7fa', borderBottom: '1px solid rgba(255, 255, 255, 0.08)'}}>
                      {candidate.x ? (
                        <Link href={`https://twitter.com/${candidate.x}`} target="_blank" rel="noopener" sx={{color:'#4fc3f7'}}>
                          @{candidate.x}
                        </Link>
                      ) : (
                        'Not provided'
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ '&:hover': { background: 'rgba(255, 255, 255, 0.05)' } }}>
                    <TableCell sx={{fontWeight: 700, color: '#90caf9', width: 120, borderBottom: 'none'}}>Resume</TableCell>
                    <TableCell sx={{color: '#f5f7fa', borderBottom: 'none'}}>
                      {candidate.resume && candidate.resume.url ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FileIcon sx={{ color: '#4f8cff', fontSize: 20 }} />
                            <Link 
                              href={candidate.resume.url} 
                              target="_blank" 
                              rel="noopener" 
                              sx={{color:'#4fc3f7', textDecoration: 'none', '&:hover': { textDecoration: 'underline' }}}
                            >
                              {candidate.resume.fileName || 'View Resume'}
                            </Link>
                            {candidate.resume.fileSize && (
                              <Typography variant="caption" sx={{ color: '#b8c5d6' }}>
                                ({(candidate.resume.fileSize / 1024).toFixed(2)} KB)
                              </Typography>
                            )}
                          </Box>
                          {accessLevel === 2 && (
                            <>
                              <input
                                accept=".pdf,.doc,.docx"
                                style={{ display: 'none' }}
                                id="resume-update"
                                type="file"
                                onChange={handleResumeUpload}
                              />
                              <label htmlFor="resume-update">
                                <Button
                                  component="span"
                                  size="small"
                                  variant="outlined"
                                  startIcon={<CloudUploadIcon />}
                                  disabled={uploadingResume}
                                  sx={{
                                    borderColor: '#4f8cff',
                                    color: '#4f8cff',
                                    '&:hover': { borderColor: '#3a7bd5', backgroundColor: 'rgba(79, 140, 255, 0.1)' }
                                  }}
                                >
                                  {uploadingResume ? 'Uploading...' : 'Replace'}
                                </Button>
                              </label>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={handleResumeDelete}
                                disabled={deletingResume}
                                sx={{ ml: 1 }}
                              >
                                {deletingResume ? 'Deleting...' : 'Delete'}
                              </Button>
                            </>
                          )}
                        </Box>
                      ) : (
                        <Box>
                          <Typography variant="body2" sx={{ color: '#b8c5d6', mb: 1 }}>
                            No resume uploaded
                          </Typography>
                          {accessLevel === 2 && (
                            <>
                              <input
                                accept=".pdf,.doc,.docx"
                                style={{ display: 'none' }}
                                id="resume-upload-new"
                                type="file"
                                onChange={handleResumeUpload}
                              />
                              <label htmlFor="resume-upload-new">
                                <Button
                                  component="span"
                                  size="small"
                                  variant="outlined"
                                  startIcon={<CloudUploadIcon />}
                                  disabled={uploadingResume}
                                  sx={{
                                    borderColor: '#4f8cff',
                                    color: '#4f8cff',
                                    '&:hover': { borderColor: '#3a7bd5', backgroundColor: 'rgba(79, 140, 255, 0.1)' }
                                  }}
                                >
                                  {uploadingResume ? 'Uploading...' : 'Upload Resume'}
                                </Button>
                              </label>
                            </>
                          )}
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* Experience Section */}
            {candidate.experience && candidate.experience.length > 0 && (
              <>
                <Divider sx={{my: 1, borderColor: '#444'}} />
                <Typography variant="h6" sx={{fontWeight: 600}}>Experience</Typography>
                <TableContainer component={Paper} sx={{background: '#232946', borderRadius: 2}}>
                  <Table size="small">
                    <TableBody>
                      {candidate.experience.map((exp, idx) => (
                        <React.Fragment key={idx}>
                          <TableRow>
                            <TableCell sx={{fontWeight: 700, color: '#90caf9', width: 120}}>Company</TableCell>
                            <TableCell sx={{color: '#f5f7fa'}}>{exp.company}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{fontWeight: 700, color: '#90caf9', width: 120}}>Position</TableCell>
                            <TableCell sx={{color: '#f5f7fa'}}>{exp.position}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{fontWeight: 700, color: '#90caf9', width: 120}}>Role</TableCell>
                            <TableCell sx={{color: '#f5f7fa'}}>{exp.role}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{fontWeight: 700, color: '#90caf9', width: 120}}>CTC</TableCell>
                            <TableCell sx={{color: '#f5f7fa'}}>{exp.ctc ? `₹ ${exp.ctc}` : '-'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{fontWeight: 700, color: '#90caf9', width: 120}}>Duration</TableCell>
                            <TableCell sx={{color: '#f5f7fa'}}>{exp.start} - {exp.end}</TableCell>
                          </TableRow>
                          {idx < candidate.experience.length - 1 && (
                            <TableRow><TableCell colSpan={2}><Divider sx={{my: 1, borderColor: '#444'}} /></TableCell></TableRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            {/* Education Section */}
            {candidate.education && candidate.education.length > 0 && (
              <>
                <Divider sx={{my: 1, borderColor: '#444'}} />
                <Typography variant="h6" sx={{fontWeight: 600}}>Education</Typography>
                <TableContainer component={Paper} sx={{background: '#232946', borderRadius: 2}}>
                  <Table size="small">
                    <TableBody>
                      {candidate.education.map((edu, idx) => (
                        <React.Fragment key={idx}>
                          <TableRow>
                            <TableCell sx={{fontWeight: 700, color: '#90caf9', width: 120}}>College</TableCell>
                            <TableCell sx={{color: '#f5f7fa'}}>{edu.clg}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{fontWeight: 700, color: '#90caf9', width: 120}}>Course</TableCell>
                            <TableCell sx={{color: '#f5f7fa'}}>{edu.course}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{fontWeight: 700, color: '#90caf9', width: 120}}>Duration</TableCell>
                            <TableCell sx={{color: '#f5f7fa'}}>{edu.start} - {edu.end}</TableCell>
                          </TableRow>
                          {idx < candidate.education.length - 1 && (
                            <TableRow><TableCell colSpan={2}><Divider sx={{my: 1, borderColor: '#444'}} /></TableCell></TableRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            {/* Certifications Section */}
            {candidate.certifications && candidate.certifications.length > 0 && (
              <>
                <Divider sx={{my: 1, borderColor: '#444'}} />
                <Typography variant="h6" sx={{fontWeight: 600}}>Certifications</Typography>
                <TableContainer component={Paper} sx={{background: '#232946', borderRadius: 2}}>
                  <Table size="small">
                    <TableBody>
                      {candidate.certifications.map((cert, idx) => (
                        <React.Fragment key={idx}>
                          <TableRow>
                            <TableCell sx={{fontWeight: 700, color: '#90caf9', width: 120}}>Name</TableCell>
                            <TableCell sx={{color: '#f5f7fa'}}>{cert.name}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{fontWeight: 700, color: '#90caf9', width: 120}}>Organization</TableCell>
                            <TableCell sx={{color: '#f5f7fa'}}>{cert.organization}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{fontWeight: 700, color: '#90caf9', width: 120}}>Link</TableCell>
                            <TableCell sx={{color: '#f5f7fa'}}>
                              {cert.link ? (
                                <Link href={cert.link} target="_blank" rel="noopener" sx={{color:'#4fc3f7'}}>
                                  View Certificate
                                </Link>
                              ) : (
                                'No link provided'
                              )}
                            </TableCell>
                          </TableRow>
                          {idx < candidate.certifications.length - 1 && (
                            <TableRow><TableCell colSpan={2}><Divider sx={{my: 1, borderColor: '#444'}} /></TableCell></TableRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            {/* Additional Links Section */}
            {candidate.additionalLinks && candidate.additionalLinks.length > 0 && (
              <>
                <Divider sx={{my: 1, borderColor: '#444'}} />
                <Typography variant="h6" sx={{fontWeight: 600}}>Additional Links</Typography>
                <TableContainer component={Paper} sx={{background: '#232946', borderRadius: 2}}>
                  <Table size="small">
                    <TableBody>
                      {candidate.additionalLinks.map((link, idx) => (
                        <React.Fragment key={idx}>
                          <TableRow>
                            <TableCell sx={{fontWeight: 700, color: '#90caf9', width: 120}}>{link.name || 'Link'}</TableCell>
                            <TableCell sx={{color: '#f5f7fa'}}>
                              {link.link ? (
                                <Link href={link.link} target="_blank" rel="noopener" sx={{color:'#4fc3f7'}}>
                                  {link.link}
                                </Link>
                              ) : (
                                'N/A'
                              )}
                            </TableCell>
                          </TableRow>
                          {idx < candidate.additionalLinks.length - 1 && (
                            <TableRow><TableCell colSpan={2}><Divider sx={{my: 1, borderColor: '#444'}} /></TableCell></TableRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </>
        )}
        <Divider sx={{my: 1, borderColor: '#444'}} />
        <Box>
          {editMode && accessLevel === 2 ? (
            <Button variant="contained" color="success" onClick={handleSave}>Save</Button>
          ) : null}
          {!editMode && accessLevel === 2 ? (
            <Button variant="contained" onClick={() => setEditMode(true)}>Edit</Button>
          ) : null}
          <Button 
            variant="contained" 
            sx={{ml:2}} 
            onClick={findSuitableJobs}
            disabled={isLoading}
          >
            {isLoading ? 'Finding Jobs...' : 'Find Suitable Jobs'}
          </Button>
          {accessLevel === 2 && (
            <Button 
              variant="outlined" 
              color="error"
              sx={{ml:2}}
              onClick={handleDeleteCandidate}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          )}
        </Box>
        
        {/* Show matching results summary */}
        {matchingResults && (
          <Box sx={{ p: 2, background: 'rgba(79, 140, 255, 0.1)', borderRadius: 2, border: '1px solid rgba(79, 140, 255, 0.3)' }}>
            <Typography variant="h6" sx={{ color: '#4f8cff', mb: 1 }}>
              Matching Results
            </Typography>
            <Typography variant="body2" sx={{ color: '#b8c5d6', mb: 2 }}>
              Found {matchingResults.suitableJobs.length} suitable jobs out of {matchingResults.totalJobs} total jobs.
            </Typography>
            <Typography variant="body2" sx={{ color: '#b8c5d6', fontSize: '0.9rem' }}>
              Top matches are displayed below, sorted by relevance score.
            </Typography>
          </Box>
        )}
        
        {showJobs && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, color: '#eebbc3' }}>
              Suitable Jobs (Top {jobs.length})
            </Typography>
            {jobs.map((job, index) => (
              <Box key={job._id} sx={{ 
                p: 2, 
                mb: 2, 
                background: 'rgba(255, 255, 255, 0.05)', 
                borderRadius: 2, 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                position: 'relative'
              }}>
                {/* Score badge */}
                <Box sx={{ 
                  position: 'absolute', 
                  top: 10, 
                  right: 10, 
                  background: 'linear-gradient(135deg, #4f8cff 0%, #eebbc3 100%)',
                  color: '#fff',
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}>
                  Score: {job.score}
                </Box>
                
                <Typography variant="h6" sx={{ color: '#eebbc3', mb: 1 }}>
                  {index + 1}. {job.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#b8c5d6', mb: 1 }}>
                  {job.organization}
                </Typography>
                
                {/* Match details */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: '#90caf9', mb: 0.5, fontWeight: 600 }}>
                    Match Details:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {job.matchDetails.map((detail, idx) => (
                      <Chip 
                        key={idx} 
                        label={detail} 
                        size="small"
                        sx={{ 
                          backgroundColor: 'rgba(79, 140, 255, 0.2)', 
                          color: '#4f8cff',
                          fontSize: '0.8rem'
                        }}
                      />
                    ))}
                  </Box>
                </Box>
                
                {/* Job details */}
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#90caf9', mb: 0.5, fontWeight: 600 }}>
                    Job Details:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#b8c5d6', fontSize: '0.9rem', mb: 0.5 }}>
                    Location: {job.location} {job.remote && '(Remote)'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#b8c5d6', fontSize: '0.9rem', mb: 0.5 }}>
                    Experience: {job.experience} years
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#b8c5d6', fontSize: '0.9rem', mb: 0.5 }}>
                    Industry: {job.industry}
                  </Typography>
                  {job.ctc && (
                    <Typography variant="body2" sx={{ color: '#b8c5d6', fontSize: '0.9rem', mb: 0.5 }}>
                      CTC: ₹ {job.ctc}
                    </Typography>
                  )}
                </Box>
                
                {/* Description */}
                {job.description && (
                  <Box>
                    <Typography variant="body2" sx={{ color: '#90caf9', mb: 0.5, fontWeight: 600 }}>
                      Description:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#b8c5d6', fontSize: '0.9rem' }}>
                      {job.description.length > 200 ? `${job.description.substring(0, 200)}...` : job.description}
                    </Typography>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Stack>
      
      {/* Results Limit Popup */}
      <AIWarningDialog
        open={showAIWarning}
        onClose={() => setShowAIWarning(false)}
        onProceed={handleAIWarningProceed}
        featureName="Job Matching"
      />

      <ResultsLimitPopup
        open={showResultsPopup}
        onClose={() => setShowResultsPopup(false)}
        onConfirm={handleFindJobsWithLimit}
        title="Find Suitable Jobs"
        maxResults={100}
      />
      
      {/* Delete Confirmation Popup */}
      <DeleteConfirmationPopup
        open={showDeletePopup}
        onClose={cancelDelete}
        onConfirm={confirmDeleteCandidate}
        title="Delete Candidate"
        message="Are you sure you want to delete this candidate? This action cannot be undone."
        itemName={candidate.name}
        isDeleting={isDeleting}
      />
    </Box>
  );
};

export default CandidateDetails;
