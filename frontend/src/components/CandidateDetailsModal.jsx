import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Chip,
  Link,
  Divider,
  CircularProgress,
  TextField,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { InsertDriveFile as FileIcon, Close as CloseIcon, Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import CandidateScoreDisplay from './CandidateScoreDisplay';
import ExpertiseSelector from './ExpertiseSelector';
import API_URL from '../config/api';

const CandidateDetailsModal = ({ open, onClose, candidate, preferences, accessLevel = 0 }) => {
  const [fullCandidateData, setFullCandidateData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedDetail, setExpandedDetail] = useState(null);

  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [editCandidate, setEditCandidate] = useState({});
  const [saving, setSaving] = useState(false);
  
  // Expertise hierarchy state (Domain → Talent Pools → Skills)
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedExpertiseTalentPools, setSelectedExpertiseTalentPools] = useState([]);
  const [selectedExpertiseSkills, setSelectedExpertiseSkills] = useState([]);

  const fetchFullCandidateData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('jwt');
      const response = await axios.get(`${API_URL}/api/candidates/${candidate._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Merge the fetched data with scoring information from the original candidate
      // This preserves the score, individualScores, matchDetails, and preferences
      const mergedCandidate = {
        ...response.data,
        // Preserve scoring data from the original candidate if it exists
        score: candidate.score,
        individualScores: candidate.individualScores,
        matchDetails: candidate.matchDetails,
        preferences: candidate.preferences
      };
      
      setFullCandidateData(mergedCandidate);
    } catch (error) {
      console.error('Error fetching candidate details:', error);
      // Fallback to the candidate data passed as prop
      setFullCandidateData(candidate);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && candidate && candidate._id) {
      fetchFullCandidateData();
    } else if (open && candidate) {
      // If we already have candidate data, use it
      setFullCandidateData(candidate);
    }
  }, [open, candidate]);

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      setFullCandidateData(null);
      setLoading(false);
      setEditMode(false);
      setEditCandidate({});
      setExpandedDetail(null);
    }
  }, [open]);

  // Initialize edit form when entering edit mode
  useEffect(() => {
    if (editMode && fullCandidateData) {
      setEditCandidate({ ...fullCandidateData });
      
      // Set domain (could be an object with _id or just an _id string)
      if (fullCandidateData.domain) {
        const domainId = typeof fullCandidateData.domain === 'object' ? fullCandidateData.domain._id : fullCandidateData.domain;
        setSelectedDomain(domainId || '');
      } else {
        setSelectedDomain('');
      }
      
      // Set talent pools (could be array of objects or array of IDs)
      if (fullCandidateData.talentPools && Array.isArray(fullCandidateData.talentPools)) {
        const poolIds = fullCandidateData.talentPools.map(tp => typeof tp === 'object' ? tp._id : tp);
        setSelectedExpertiseTalentPools(poolIds);
      } else {
        setSelectedExpertiseTalentPools([]);
      }
      
      // Set expertise skills (could be array of objects or array of IDs)
      if (fullCandidateData.expertiseSkills && Array.isArray(fullCandidateData.expertiseSkills)) {
        const skillIds = fullCandidateData.expertiseSkills.map(skill => typeof skill === 'object' ? skill._id : skill);
        setSelectedExpertiseSkills(skillIds);
      } else {
        setSelectedExpertiseSkills([]);
      }
    }
  }, [editMode, fullCandidateData]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditCandidate({ ...editCandidate, [name]: value });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('jwt');
      
      // Prepare the update data including expertise fields
      const updateData = {
        ...editCandidate,
        domain: selectedDomain || null,
        talentPools: selectedExpertiseTalentPools || [],
        expertiseSkills: selectedExpertiseSkills || []
      };
      
      await axios.put(`${API_URL}/api/candidates/${candidate._id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Candidate updated successfully!');
      setEditMode(false);
      
      // Refresh the candidate data
      await fetchFullCandidateData();
      
      // Dispatch event to notify parent components to refresh
      window.dispatchEvent(new CustomEvent('candidateUpdated', { 
        detail: { candidateId: candidate._id } 
      }));
    } catch (error) {
      console.error('Error updating candidate:', error);
      toast.error(error.response?.data?.error || 'Error updating candidate');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditCandidate({});
  };

  if (!open || !candidate) return null;

  // Use full candidate data if available, otherwise fallback to prop
  const displayCandidate = fullCandidateData || candidate;

  return (
    <Dialog
      open={open}
      onClose={(event) => {
        event?.stopPropagation();
        onClose();
      }}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          color: '#1e293b',
          borderRadius: 2,
        },
        onClick: (e) => e.stopPropagation()
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '2px solid rgba(238, 187, 195, 0.3)',
        pb: 2
      }}>
        <Typography variant="h5" sx={{ color: '#8b5cf6', fontWeight: 700 }}>
          {displayCandidate.name} - {editMode ? 'Edit Candidate' : 'Candidate Details'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {!editMode && (accessLevel === 1 || accessLevel === 2) && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setEditMode(true);
              }}
              variant="outlined"
              startIcon={<EditIcon />}
              sx={{
                color: '#8b5cf6',
                borderColor: 'rgba(139, 92, 246, 0.5)',
                '&:hover': { 
                  backgroundColor: 'rgba(139, 92, 246, 0.08)',
                  borderColor: '#8b5cf6',
                }
              }}
            >
              Edit
            </Button>
          )}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              if (editMode) {
                handleCancelEdit();
              } else {
                onClose();
              }
            }}
            sx={{
              minWidth: 'auto',
              color: '#64748b',
              '&:hover': { color: '#8b5cf6' }
            }}
          >
            <CloseIcon />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <CircularProgress sx={{ color: '#2563eb' }} />
          </Box>
        ) : editMode ? (
          /* Edit Mode Form */
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Stack spacing={2}>
              <TextField
                label="Name"
                name="name"
                value={editCandidate.name || ''}
                onChange={handleEditChange}
                fullWidth
                sx={{ '& .MuiInputBase-input': { color: '#1e293b' }, '& .MuiInputLabel-root': { color: '#64748b' } }}
              />
              <TextField
                label="Email"
                name="email"
                value={editCandidate.email || ''}
                onChange={handleEditChange}
                fullWidth
                sx={{ '& .MuiInputBase-input': { color: '#1e293b' }, '& .MuiInputLabel-root': { color: '#64748b' } }}
              />
              <TextField
                label="Phone"
                name="phone"
                value={editCandidate.phone || ''}
                onChange={handleEditChange}
                fullWidth
                sx={{ '& .MuiInputBase-input': { color: '#1e293b' }, '& .MuiInputLabel-root': { color: '#64748b' } }}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Current CTC (LPA)"
                  name="currentCTC"
                  value={editCandidate.currentCTC || ''}
                  onChange={handleEditChange}
                  fullWidth
                  sx={{ '& .MuiInputBase-input': { color: '#1e293b' }, '& .MuiInputLabel-root': { color: '#64748b' } }}
                />
                <TextField
                  label="Expected CTC (LPA)"
                  name="expectedCTC"
                  value={editCandidate.expectedCTC || ''}
                  onChange={handleEditChange}
                  fullWidth
                  sx={{ '& .MuiInputBase-input': { color: '#1e293b' }, '& .MuiInputLabel-root': { color: '#64748b' } }}
                />
              </Box>
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
                required={false}
              />
              <TextField
                label="LinkedIn"
                name="linkedin"
                value={editCandidate.linkedin || ''}
                onChange={handleEditChange}
                fullWidth
                sx={{ '& .MuiInputBase-input': { color: '#1e293b' }, '& .MuiInputLabel-root': { color: '#64748b' } }}
              />
              <TextField
                label="X (Twitter)"
                name="x"
                value={editCandidate.x || ''}
                onChange={handleEditChange}
                fullWidth
                sx={{ '& .MuiInputBase-input': { color: '#1e293b' }, '& .MuiInputLabel-root': { color: '#64748b' } }}
              />
            </Stack>
          </Box>
        ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {preferences && (
            <CandidateScoreDisplay candidate={displayCandidate} preferences={preferences} />
          )}

          {/* Accordion layout - one section open at a time, like job list expanded */}
          <Box sx={{ '& .MuiAccordion-root': { boxShadow: 'none', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px !important', mb: 1 }, '& .MuiAccordion-root:before': { display: 'none' } }}>
            <Accordion expanded={expandedDetail === 'name'} onChange={() => setExpandedDetail(expandedDetail === 'name' ? null : 'name')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ '& .MuiAccordionSummary-content': { my: 1.5 } }}>
                <Typography sx={{ fontWeight: 600, color: '#64748b' }}>Name</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0, color: '#1e293b' }}>{displayCandidate.name}</AccordionDetails>
            </Accordion>
            <Accordion expanded={expandedDetail === 'email'} onChange={() => setExpandedDetail(expandedDetail === 'email' ? null : 'email')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ '& .MuiAccordionSummary-content': { my: 1.5 } }}>
                <Typography sx={{ fontWeight: 600, color: '#64748b' }}>Email</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0, color: '#1e293b' }}>{displayCandidate.email}</AccordionDetails>
            </Accordion>
            <Accordion expanded={expandedDetail === 'phone'} onChange={() => setExpandedDetail(expandedDetail === 'phone' ? null : 'phone')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ '& .MuiAccordionSummary-content': { my: 1.5 } }}>
                <Typography sx={{ fontWeight: 600, color: '#64748b' }}>Phone</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0, color: '#1e293b' }}>{displayCandidate.phone || 'Not provided'}</AccordionDetails>
            </Accordion>
            <Accordion expanded={expandedDetail === 'currentCTC'} onChange={() => setExpandedDetail(expandedDetail === 'currentCTC' ? null : 'currentCTC')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ '& .MuiAccordionSummary-content': { my: 1.5 } }}>
                <Typography sx={{ fontWeight: 600, color: '#64748b' }}>Current CTC</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0, color: '#1e293b' }}>
                {displayCandidate.currentCTC ? `₹ ${displayCandidate.currentCTC} LPA` : (displayCandidate.experience && displayCandidate.experience.length > 0 && displayCandidate.experience[0].ctc) ? `₹ ${displayCandidate.experience[0].ctc} LPA (from last job)` : 'Not Mentioned'}
              </AccordionDetails>
            </Accordion>
            <Accordion expanded={expandedDetail === 'expectedCTC'} onChange={() => setExpandedDetail(expandedDetail === 'expectedCTC' ? null : 'expectedCTC')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ '& .MuiAccordionSummary-content': { my: 1.5 } }}>
                <Typography sx={{ fontWeight: 600, color: '#64748b' }}>Expected CTC</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0, color: '#1e293b' }}>{displayCandidate.expectedCTC ? `₹ ${displayCandidate.expectedCTC} LPA` : 'Not Mentioned'}</AccordionDetails>
            </Accordion>
            {displayCandidate.currentLocation && (
              <Accordion expanded={expandedDetail === 'currentLocation'} onChange={() => setExpandedDetail(expandedDetail === 'currentLocation' ? null : 'currentLocation')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ '& .MuiAccordionSummary-content': { my: 1.5 } }}>
                  <Typography sx={{ fontWeight: 600, color: '#64748b' }}>Current Location</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, color: '#1e293b' }}>{displayCandidate.currentLocation.city}, {displayCandidate.currentLocation.state}, {displayCandidate.currentLocation.country}</AccordionDetails>
              </Accordion>
            )}
            {(displayCandidate.linkedin != null && displayCandidate.linkedin !== '') && (
              <Accordion expanded={expandedDetail === 'linkedin'} onChange={() => setExpandedDetail(expandedDetail === 'linkedin' ? null : 'linkedin')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ '& .MuiAccordionSummary-content': { my: 1.5 } }}>
                  <Typography sx={{ fontWeight: 600, color: '#64748b' }}>LinkedIn</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, color: '#1e293b' }}>
                  <Link href={`https://linkedin.com/in/${displayCandidate.linkedin}`} target="_blank" rel="noopener" sx={{ color: '#4fc3f7' }}>{displayCandidate.linkedin}</Link>
                </AccordionDetails>
              </Accordion>
            )}
            {(displayCandidate.x != null && displayCandidate.x !== '') && (
              <Accordion expanded={expandedDetail === 'x'} onChange={() => setExpandedDetail(expandedDetail === 'x' ? null : 'x')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ '& .MuiAccordionSummary-content': { my: 1.5 } }}>
                  <Typography sx={{ fontWeight: 600, color: '#64748b' }}>X (Twitter)</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, color: '#1e293b' }}>
                  <Link href={`https://twitter.com/${displayCandidate.x}`} target="_blank" rel="noopener" sx={{ color: '#4fc3f7' }}>@{displayCandidate.x}</Link>
                </AccordionDetails>
              </Accordion>
            )}
            <Accordion expanded={expandedDetail === 'resume'} onChange={() => setExpandedDetail(expandedDetail === 'resume' ? null : 'resume')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ '& .MuiAccordionSummary-content': { my: 1.5 } }}>
                <Typography sx={{ fontWeight: 600, color: '#64748b' }}>Resume</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0, color: '#1e293b' }}>
                {displayCandidate.resume && displayCandidate.resume.url ? (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FileIcon sx={{ color: '#2563eb', fontSize: 20 }} />
                      <Link href={displayCandidate.resume.url} target="_blank" rel="noopener" sx={{ color: '#4fc3f7', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>View resume</Link>
                      {displayCandidate.resume.fileSize && <Typography variant="caption" sx={{ color: '#64748b' }}>({(displayCandidate.resume.fileSize / 1024).toFixed(2)} KB)</Typography>}
                    </Box>
                    {displayCandidate.resume.uploadedAt && (
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
                        Uploaded: {new Date(displayCandidate.resume.uploadedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </Typography>
                    )}
                  </Box>
                ) : <Typography variant="body2" sx={{ color: '#64748b' }}>No resume uploaded</Typography>}
              </AccordionDetails>
            </Accordion>
            {displayCandidate.preferredLocations && displayCandidate.preferredLocations.length > 0 && (
              <Accordion expanded={expandedDetail === 'preferredLocations'} onChange={() => setExpandedDetail(expandedDetail === 'preferredLocations' ? null : 'preferredLocations')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ '& .MuiAccordionSummary-content': { my: 1.5 } }}>
                  <Typography sx={{ fontWeight: 600, color: '#64748b' }}>Preferred Locations</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, color: '#1e293b' }}>
                  {displayCandidate.preferredLocations.map((loc, idx) => (
                    <Box key={idx} component="span">
                      {loc.city && loc.state && loc.country ? `${loc.city}, ${loc.state}, ${loc.country}` : loc.city || loc.state || loc.country}
                      {idx < displayCandidate.preferredLocations.length - 1 && '; '}
                    </Box>
                  ))}
                </AccordionDetails>
              </Accordion>
            )}
            {displayCandidate.domain && (
              <Accordion expanded={expandedDetail === 'domain'} onChange={() => setExpandedDetail(expandedDetail === 'domain' ? null : 'domain')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ '& .MuiAccordionSummary-content': { my: 1.5 } }}>
                  <Typography sx={{ fontWeight: 600, color: '#64748b' }}>Domain</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, color: '#1e293b' }}>{typeof displayCandidate.domain === 'object' ? displayCandidate.domain.name : displayCandidate.domain}</AccordionDetails>
              </Accordion>
            )}
            {displayCandidate.talentPools && displayCandidate.talentPools.length > 0 && (
              <Accordion expanded={expandedDetail === 'talentPools'} onChange={() => setExpandedDetail(expandedDetail === 'talentPools' ? null : 'talentPools')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ '& .MuiAccordionSummary-content': { my: 1.5 } }}>
                  <Typography sx={{ fontWeight: 600, color: '#64748b' }}>Talent Pools</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, color: '#1e293b' }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {displayCandidate.talentPools.map((pool, idx) => (
                      <Chip key={idx} label={typeof pool === 'object' ? pool.name : pool} size="small" sx={{ backgroundColor: 'rgba(37, 99, 235, 0.12)', color: '#2563eb', fontSize: '0.75rem' }} />
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}
            {displayCandidate.expertiseSkills && displayCandidate.expertiseSkills.length > 0 && (
              <Accordion expanded={expandedDetail === 'expertiseSkills'} onChange={() => setExpandedDetail(expandedDetail === 'expertiseSkills' ? null : 'expertiseSkills')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ '& .MuiAccordionSummary-content': { my: 1.5 } }}>
                  <Typography sx={{ fontWeight: 600, color: '#64748b' }}>Expertise Skills</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, color: '#1e293b' }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {displayCandidate.expertiseSkills.map((skill, idx) => (
                      <Chip key={idx} label={typeof skill === 'object' ? skill.name : skill} size="small" sx={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', fontSize: '0.75rem', textTransform: 'capitalize' }} />
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}
            {displayCandidate.skills && displayCandidate.skills.length > 0 && (
              <Accordion expanded={expandedDetail === 'skills'} onChange={() => setExpandedDetail(expandedDetail === 'skills' ? null : 'skills')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ '& .MuiAccordionSummary-content': { my: 1.5 } }}>
                  <Typography sx={{ fontWeight: 600, color: '#64748b' }}>Skills ({displayCandidate.skills.length})</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, color: '#1e293b' }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {displayCandidate.skills.map((skill, idx) => (
                      <Chip key={idx} label={skill} size="medium" sx={{ backgroundColor: 'rgba(238, 187, 195, 0.2)', color: '#8b5cf6', fontSize: '0.85rem', fontWeight: 500 }} />
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}
            {displayCandidate.experience && displayCandidate.experience.length > 0 && (
              <Accordion expanded={expandedDetail === 'experience'} onChange={() => setExpandedDetail(expandedDetail === 'experience' ? null : 'experience')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ '& .MuiAccordionSummary-content': { my: 1.5 } }}>
                  <Typography sx={{ fontWeight: 600, color: '#64748b' }}>Experience ({displayCandidate.experience.length})</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, color: '#1e293b' }}>
                  {displayCandidate.experience.map((exp, idx) => (
                    <Box key={idx} sx={{ mb: idx < displayCandidate.experience.length - 1 ? 2 : 0 }}>
                      <TableContainer component={Paper} sx={{ background: 'rgba(0,0,0,0.03)', borderRadius: 1, mb: 1 }}>
                        <Table size="small">
                          <TableBody>
                            {exp.position && <TableRow><TableCell sx={{ fontWeight: 700, color: '#64748b', width: 150 }}>Position</TableCell><TableCell sx={{ color: '#1e293b', fontWeight: 600 }}>{exp.position}</TableCell></TableRow>}
                            {exp.company && <TableRow><TableCell sx={{ fontWeight: 700, color: '#64748b', width: 150 }}>Company</TableCell><TableCell sx={{ color: '#1e293b' }}>{exp.company}</TableCell></TableRow>}
                            {exp.role && <TableRow><TableCell sx={{ fontWeight: 700, color: '#64748b', width: 150 }}>Role</TableCell><TableCell sx={{ color: '#1e293b' }}>{exp.role}</TableCell></TableRow>}
                            {exp.ctc && <TableRow><TableCell sx={{ fontWeight: 700, color: '#64748b', width: 150 }}>CTC</TableCell><TableCell sx={{ color: '#1e293b' }}>₹ {exp.ctc}</TableCell></TableRow>}
                            {(exp.start || exp.end) && <TableRow><TableCell sx={{ fontWeight: 700, color: '#64748b', width: 150 }}>Duration</TableCell><TableCell sx={{ color: '#1e293b' }}>{exp.start && exp.end ? `${exp.start} - ${exp.end}` : exp.start || exp.end}</TableCell></TableRow>}
                            {exp.description && <TableRow><TableCell sx={{ fontWeight: 700, color: '#64748b', width: 150, verticalAlign: 'top' }}>Description</TableCell><TableCell sx={{ color: '#1e293b', whiteSpace: 'pre-wrap' }}>{exp.description}</TableCell></TableRow>}
                            {!exp.position && !exp.company && !exp.role && !exp.ctc && !exp.start && !exp.end && !exp.description && <TableRow><TableCell colSpan={2} sx={{ color: '#64748b', fontStyle: 'italic' }}>No details available</TableCell></TableRow>}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  ))}
                </AccordionDetails>
              </Accordion>
            )}
            {displayCandidate.education && displayCandidate.education.length > 0 && (
              <Accordion expanded={expandedDetail === 'education'} onChange={() => setExpandedDetail(expandedDetail === 'education' ? null : 'education')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ '& .MuiAccordionSummary-content': { my: 1.5 } }}>
                  <Typography sx={{ fontWeight: 600, color: '#64748b' }}>Education ({displayCandidate.education.length})</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, color: '#1e293b' }}>
                  {displayCandidate.education.map((edu, idx) => (
                    <Box key={idx} sx={{ mb: idx < displayCandidate.education.length - 1 ? 2 : 0 }}>
                      <TableContainer component={Paper} sx={{ background: 'rgba(0,0,0,0.03)', borderRadius: 1, mb: 1 }}>
                        <Table size="small">
                          <TableBody>
                            {edu.course && <TableRow><TableCell sx={{ fontWeight: 700, color: '#64748b', width: 150 }}>Course</TableCell><TableCell sx={{ color: '#1e293b', fontWeight: 600 }}>{edu.course}</TableCell></TableRow>}
                            {edu.clg && <TableRow><TableCell sx={{ fontWeight: 700, color: '#64748b', width: 150 }}>College</TableCell><TableCell sx={{ color: '#1e293b' }}>{edu.clg}</TableCell></TableRow>}
                            {(edu.start || edu.end) && <TableRow><TableCell sx={{ fontWeight: 700, color: '#64748b', width: 150 }}>Duration</TableCell><TableCell sx={{ color: '#1e293b' }}>{edu.start && edu.end ? `${edu.start} - ${edu.end}` : edu.start || edu.end}</TableCell></TableRow>}
                            {edu.grade && <TableRow><TableCell sx={{ fontWeight: 700, color: '#64748b', width: 150 }}>Grade</TableCell><TableCell sx={{ color: '#1e293b' }}>{edu.grade}</TableCell></TableRow>}
                            {!edu.clg && !edu.course && !edu.start && !edu.end && !edu.grade && <TableRow><TableCell colSpan={2} sx={{ color: '#64748b', fontStyle: 'italic' }}>No details available</TableCell></TableRow>}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  ))}
                </AccordionDetails>
              </Accordion>
            )}
            {displayCandidate.certifications && displayCandidate.certifications.length > 0 && (
              <Accordion expanded={expandedDetail === 'certifications'} onChange={() => setExpandedDetail(expandedDetail === 'certifications' ? null : 'certifications')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ '& .MuiAccordionSummary-content': { my: 1.5 } }}>
                  <Typography sx={{ fontWeight: 600, color: '#64748b' }}>Certifications ({displayCandidate.certifications.length})</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, color: '#1e293b' }}>
                  {displayCandidate.certifications.map((cert, idx) => (
                    <Box key={idx} sx={{ mb: idx < displayCandidate.certifications.length - 1 ? 2 : 0 }}>
                      <TableContainer component={Paper} sx={{ background: 'rgba(0,0,0,0.03)', borderRadius: 1, mb: 1 }}>
                        <Table size="small">
                          <TableBody>
                            {cert.name && <TableRow><TableCell sx={{ fontWeight: 700, color: '#64748b', width: 150 }}>Name</TableCell><TableCell sx={{ color: '#1e293b', fontWeight: 600 }}>{cert.name}</TableCell></TableRow>}
                            {cert.organization && <TableRow><TableCell sx={{ fontWeight: 700, color: '#64748b', width: 150 }}>Organization</TableCell><TableCell sx={{ color: '#1e293b' }}>{cert.organization}</TableCell></TableRow>}
                            {cert.date && <TableRow><TableCell sx={{ fontWeight: 700, color: '#64748b', width: 150 }}>Date</TableCell><TableCell sx={{ color: '#1e293b' }}>{cert.date}</TableCell></TableRow>}
                            {cert.expiryDate && <TableRow><TableCell sx={{ fontWeight: 700, color: '#64748b', width: 150 }}>Expiry Date</TableCell><TableCell sx={{ color: '#1e293b' }}>{cert.expiryDate}</TableCell></TableRow>}
                            {cert.link && <TableRow><TableCell sx={{ fontWeight: 700, color: '#64748b', width: 150 }}>Link</TableCell><TableCell sx={{ color: '#1e293b' }}><Link href={cert.link} target="_blank" rel="noopener" sx={{ color: '#4fc3f7', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>View Certificate</Link></TableCell></TableRow>}
                            {!cert.name && !cert.organization && !cert.date && !cert.expiryDate && !cert.link && <TableRow><TableCell colSpan={2} sx={{ color: '#64748b', fontStyle: 'italic' }}>No details available</TableCell></TableRow>}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  ))}
                </AccordionDetails>
              </Accordion>
            )}
            {displayCandidate.additionalLinks && displayCandidate.additionalLinks.length > 0 && (
              <Accordion expanded={expandedDetail === 'additionalLinks'} onChange={() => setExpandedDetail(expandedDetail === 'additionalLinks' ? null : 'additionalLinks')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ '& .MuiAccordionSummary-content': { my: 1.5 } }}>
                  <Typography sx={{ fontWeight: 600, color: '#64748b' }}>Additional Links ({displayCandidate.additionalLinks.length})</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, color: '#1e293b' }}>
                  <TableContainer component={Paper} sx={{ background: 'rgba(0,0,0,0.03)', borderRadius: 1 }}>
                    <Table size="small">
                      <TableBody>
                        {displayCandidate.additionalLinks.map((link, idx) => (
                          <TableRow key={idx}>
                            <TableCell sx={{ fontWeight: 700, color: '#64748b', width: 150 }}>{link.name || `Link ${idx + 1}`}</TableCell>
                            <TableCell sx={{ color: '#1e293b' }}>
                              {link.link ? <Link href={link.link} target="_blank" rel="noopener" sx={{ color: '#4fc3f7', textDecoration: 'none', wordBreak: 'break-all', '&:hover': { textDecoration: 'underline' } }}>{link.link}</Link> : <Typography variant="body2" sx={{ color: '#64748b', fontStyle: 'italic' }}>No link provided</Typography>}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            )}
            {displayCandidate.appliedJobs && displayCandidate.appliedJobs.length > 0 && (
              <Accordion expanded={expandedDetail === 'appliedJobs'} onChange={() => setExpandedDetail(expandedDetail === 'appliedJobs' ? null : 'appliedJobs')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ '& .MuiAccordionSummary-content': { my: 1.5 } }}>
                  <Typography sx={{ fontWeight: 600, color: '#64748b' }}>Applied Jobs ({displayCandidate.appliedJobs.length})</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, color: '#1e293b' }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {displayCandidate.appliedJobs.map((job, idx) => (
                      <Chip key={idx} label={typeof job === 'object' ? (job.title || 'Job') : job} size="medium" sx={{ backgroundColor: 'rgba(37, 99, 235, 0.12)', color: '#2563eb', fontSize: '0.85rem', fontWeight: 500 }} />
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}
          </Box>
        </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.05)', justifyContent: editMode ? 'space-between' : 'flex-end' }}>
        {editMode ? (
          <>
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                handleCancelEdit();
              }}
              variant="outlined"
              startIcon={<CancelIcon />}
              sx={{
                color: '#64748b',
                borderColor: 'rgba(100, 116, 139, 0.3)',
                '&:hover': { 
                  backgroundColor: 'rgba(100, 116, 139, 0.08)',
                  borderColor: '#64748b',
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              variant="contained"
              startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
              disabled={saving}
              sx={{
                backgroundColor: '#4caf50',
                color: '#ffffff',
                '&:hover': { backgroundColor: '#43a047' },
                '&:disabled': { backgroundColor: 'rgba(76, 175, 80, 0.5)' }
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        ) : (
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            variant="contained"
            sx={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              '&:hover': { backgroundColor: '#3d7be8' }
            }}
          >
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CandidateDetailsModal;

