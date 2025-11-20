import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
} from '@mui/material';
import { InsertDriveFile as FileIcon, Close as CloseIcon } from '@mui/icons-material';
import CandidateScoreDisplay from './CandidateScoreDisplay';
import API_URL from '../config/api';

const CandidateDetailsModal = ({ open, onClose, candidate, preferences }) => {
  const [fullCandidateData, setFullCandidateData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && candidate && candidate._id) {
      // Fetch full candidate data from API to ensure we have all fields including resume
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
    }
  }, [open]);

  if (!open || !candidate) return null;

  // Use full candidate data if available, otherwise fallback to prop
  const displayCandidate = fullCandidateData || candidate;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          color: '#1e293b',
          borderRadius: 2,
        }
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
          {displayCandidate.name} - Candidate Details
        </Typography>
        <Button
          onClick={onClose}
          sx={{
            minWidth: 'auto',
            color: '#64748b',
            '&:hover': { color: '#8b5cf6' }
          }}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <CircularProgress sx={{ color: '#2563eb' }} />
          </Box>
        ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Score Display */}
          {preferences && (
            <CandidateScoreDisplay candidate={displayCandidate} preferences={preferences} />
          )}

          {/* Basic Information */}
          <TableContainer component={Paper} sx={{ background: '#ffffff', borderRadius: 2 }}>
            <Table size="small">
              <TableBody>
                <TableRow sx={{ '&:hover': { background: 'rgba(255, 255, 255, 0.05)' } }}>
                  <TableCell sx={{ fontWeight: 700, color: '#90caf9', width: 150, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>Name</TableCell>
                  <TableCell sx={{ color: '#1e293b', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>{displayCandidate.name}</TableCell>
                </TableRow>
                <TableRow sx={{ '&:hover': { background: 'rgba(255, 255, 255, 0.05)' } }}>
                  <TableCell sx={{ fontWeight: 700, color: '#90caf9', width: 150, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>Email</TableCell>
                  <TableCell sx={{ color: '#1e293b', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>{displayCandidate.email}</TableCell>
                </TableRow>
                <TableRow sx={{ '&:hover': { background: 'rgba(255, 255, 255, 0.05)' } }}>
                  <TableCell sx={{ fontWeight: 700, color: '#90caf9', width: 150, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>Phone</TableCell>
                  <TableCell sx={{ color: '#1e293b', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>{displayCandidate.phone || 'Not provided'}</TableCell>
                </TableRow>
                {displayCandidate.currentLocation && (
                  <TableRow sx={{ '&:hover': { background: 'rgba(255, 255, 255, 0.05)' } }}>
                    <TableCell sx={{ fontWeight: 700, color: '#90caf9', width: 150, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>Current Location</TableCell>
                    <TableCell sx={{ color: '#1e293b', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      {displayCandidate.currentLocation.city}, {displayCandidate.currentLocation.state}, {displayCandidate.currentLocation.country}
                    </TableCell>
                  </TableRow>
                )}
                {displayCandidate.linkedin && (
                  <TableRow sx={{ '&:hover': { background: 'rgba(255, 255, 255, 0.05)' } }}>
                    <TableCell sx={{ fontWeight: 700, color: '#90caf9', width: 150, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>LinkedIn</TableCell>
                    <TableCell sx={{ color: '#1e293b', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <Link href={`https://linkedin.com/in/${displayCandidate.linkedin}`} target="_blank" rel="noopener" sx={{ color: '#4fc3f7' }}>
                        {displayCandidate.linkedin}
                      </Link>
                    </TableCell>
                  </TableRow>
                )}
                {displayCandidate.x && (
                  <TableRow sx={{ '&:hover': { background: 'rgba(255, 255, 255, 0.05)' } }}>
                    <TableCell sx={{ fontWeight: 700, color: '#90caf9', width: 150, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>X (Twitter)</TableCell>
                    <TableCell sx={{ color: '#1e293b', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <Link href={`https://twitter.com/${displayCandidate.x}`} target="_blank" rel="noopener" sx={{ color: '#4fc3f7' }}>
                        @{displayCandidate.x}
                      </Link>
                    </TableCell>
                  </TableRow>
                )}
                <TableRow sx={{ '&:hover': { background: 'rgba(255, 255, 255, 0.05)' } }}>
                  <TableCell sx={{ fontWeight: 700, color: '#90caf9', width: 150, borderBottom: 'none' }}>Resume</TableCell>
                  <TableCell sx={{ color: '#1e293b', borderBottom: 'none' }}>
                    {displayCandidate.resume && displayCandidate.resume.url ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FileIcon sx={{ color: '#2563eb', fontSize: 20 }} />
                        <Link 
                          href={displayCandidate.resume.url} 
                          target="_blank" 
                          rel="noopener" 
                          sx={{ color: '#4fc3f7', textDecoration: 'none', '&:hover': { textDecoration: 'underline' }}}
                        >
                          {displayCandidate.resume.fileName || 'View Resume'}
                        </Link>
                        {displayCandidate.resume.fileSize && (
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            ({(displayCandidate.resume.fileSize / 1024).toFixed(2)} KB)
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        No resume uploaded
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* Skills */}
          {displayCandidate.skills && displayCandidate.skills.length > 0 && (
            <>
              <Divider sx={{ borderColor: '#e2e8f0' }} />
              <Box>
                <Typography variant="h6" sx={{ color: '#8b5cf6', mb: 1, fontWeight: 600 }}>Skills</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {displayCandidate.skills.map((skill, idx) => (
                    <Chip 
                      key={idx} 
                      label={skill} 
                      size="small"
                      sx={{ 
                        backgroundColor: 'rgba(238, 187, 195, 0.2)', 
                        color: '#8b5cf6',
                        fontSize: '0.8rem'
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </>
          )}

          {/* Experience */}
          {displayCandidate.experience && displayCandidate.experience.length > 0 && displayCandidate.experience.some(exp => exp.company || exp.position) && (
            <>
              <Divider sx={{ borderColor: '#e2e8f0' }} />
              <Box>
                <Typography variant="h6" sx={{ color: '#8b5cf6', mb: 2, fontWeight: 600 }}>Experience</Typography>
                <TableContainer component={Paper} sx={{ background: '#ffffff', borderRadius: 2 }}>
                  <Table size="small">
                    <TableBody>
                      {displayCandidate.experience.filter(exp => exp.company || exp.position).map((exp, idx) => (
                        <React.Fragment key={idx}>
                          {exp.company && (
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700, color: '#90caf9', width: 150 }}>Company</TableCell>
                              <TableCell sx={{ color: '#1e293b' }}>{exp.company}</TableCell>
                            </TableRow>
                          )}
                          {exp.position && (
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700, color: '#90caf9', width: 150 }}>Position</TableCell>
                              <TableCell sx={{ color: '#1e293b' }}>{exp.position}</TableCell>
                            </TableRow>
                          )}
                          {exp.role && (
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700, color: '#90caf9', width: 150 }}>Role</TableCell>
                              <TableCell sx={{ color: '#1e293b' }}>{exp.role}</TableCell>
                            </TableRow>
                          )}
                          {exp.ctc && (
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700, color: '#90caf9', width: 150 }}>CTC</TableCell>
                              <TableCell sx={{ color: '#1e293b' }}>₹ {exp.ctc}</TableCell>
                            </TableRow>
                          )}
                          {(exp.start || exp.end) && (
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700, color: '#90caf9', width: 150 }}>Duration</TableCell>
                              <TableCell sx={{ color: '#1e293b' }}>{exp.start} - {exp.end}</TableCell>
                            </TableRow>
                          )}
                          {idx < displayCandidate.experience.filter(exp => exp.company || exp.position).length - 1 && (
                            <TableRow><TableCell colSpan={2}><Divider sx={{ my: 1, borderColor: '#e2e8f0' }} /></TableCell></TableRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </>
          )}

          {/* Education */}
          {displayCandidate.education && displayCandidate.education.length > 0 && displayCandidate.education.some(edu => edu.clg || edu.course) && (
            <>
              <Divider sx={{ borderColor: '#e2e8f0' }} />
              <Box>
                <Typography variant="h6" sx={{ color: '#8b5cf6', mb: 2, fontWeight: 600 }}>Education</Typography>
                <TableContainer component={Paper} sx={{ background: '#ffffff', borderRadius: 2 }}>
                  <Table size="small">
                    <TableBody>
                      {displayCandidate.education.filter(edu => edu.clg || edu.course).map((edu, idx) => (
                        <React.Fragment key={idx}>
                          {edu.clg && (
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700, color: '#90caf9', width: 150 }}>College</TableCell>
                              <TableCell sx={{ color: '#1e293b' }}>{edu.clg}</TableCell>
                            </TableRow>
                          )}
                          {edu.course && (
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700, color: '#90caf9', width: 150 }}>Course</TableCell>
                              <TableCell sx={{ color: '#1e293b' }}>{edu.course}</TableCell>
                            </TableRow>
                          )}
                          {(edu.start || edu.end) && (
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700, color: '#90caf9', width: 150 }}>Duration</TableCell>
                              <TableCell sx={{ color: '#1e293b' }}>{edu.start} - {edu.end}</TableCell>
                            </TableRow>
                          )}
                          {idx < displayCandidate.education.filter(edu => edu.clg || edu.course).length - 1 && (
                            <TableRow><TableCell colSpan={2}><Divider sx={{ my: 1, borderColor: '#e2e8f0' }} /></TableCell></TableRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </>
          )}

          {/* Certifications */}
          {displayCandidate.certifications && displayCandidate.certifications.length > 0 && displayCandidate.certifications.some(cert => cert.name) && (
            <>
              <Divider sx={{ borderColor: '#e2e8f0' }} />
              <Box>
                <Typography variant="h6" sx={{ color: '#8b5cf6', mb: 2, fontWeight: 600 }}>Certifications</Typography>
                <TableContainer component={Paper} sx={{ background: '#ffffff', borderRadius: 2 }}>
                  <Table size="small">
                    <TableBody>
                      {displayCandidate.certifications.filter(cert => cert.name).map((cert, idx) => (
                        <React.Fragment key={idx}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700, color: '#90caf9', width: 150 }}>Name</TableCell>
                            <TableCell sx={{ color: '#1e293b' }}>{cert.name}</TableCell>
                          </TableRow>
                          {cert.organization && (
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700, color: '#90caf9', width: 150 }}>Organization</TableCell>
                              <TableCell sx={{ color: '#1e293b' }}>{cert.organization}</TableCell>
                            </TableRow>
                          )}
                          {cert.link && (
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700, color: '#90caf9', width: 150 }}>Link</TableCell>
                              <TableCell sx={{ color: '#1e293b' }}>
                                <Link href={cert.link} target="_blank" rel="noopener" sx={{ color: '#4fc3f7' }}>
                                  View Certificate
                                </Link>
                              </TableCell>
                            </TableRow>
                          )}
                          {idx < displayCandidate.certifications.filter(cert => cert.name).length - 1 && (
                            <TableRow><TableCell colSpan={2}><Divider sx={{ my: 1, borderColor: '#e2e8f0' }} /></TableCell></TableRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </>
          )}

          {/* Additional Links */}
          {displayCandidate.additionalLinks && displayCandidate.additionalLinks.length > 0 && displayCandidate.additionalLinks.some(link => link.link) && (
            <>
              <Divider sx={{ borderColor: '#e2e8f0' }} />
              <Box>
                <Typography variant="h6" sx={{ color: '#8b5cf6', mb: 2, fontWeight: 600 }}>Additional Links</Typography>
                <TableContainer component={Paper} sx={{ background: '#ffffff', borderRadius: 2 }}>
                  <Table size="small">
                    <TableBody>
                      {displayCandidate.additionalLinks.filter(link => link.link).map((link, idx) => (
                        <TableRow key={idx}>
                          <TableCell sx={{ fontWeight: 700, color: '#90caf9', width: 150 }}>{link.name || 'Link'}</TableCell>
                          <TableCell sx={{ color: '#1e293b' }}>
                            <Link href={link.link} target="_blank" rel="noopener" sx={{ color: '#4fc3f7' }}>
                              {link.link}
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </>
          )}
        </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.05)' }}>
        <Button 
          onClick={onClose}
          variant="contained"
          sx={{
            backgroundColor: '#2563eb',
            color: '#ffffff',
            '&:hover': { backgroundColor: '#3d7be8' }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CandidateDetailsModal;

