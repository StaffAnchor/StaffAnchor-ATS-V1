import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  FormControlLabel,
  Collapse,
  Avatar,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  People as PeopleIcon,
  Group as GroupIcon,
  Star as StarIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

const TalentPools = ({ user }) => {
  const [talentPools, setTalentPools] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [expandedPoolId, setExpandedPoolId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    selectedCandidates: []
  });
  
  // Skills management state
  const [skills, setSkills] = useState([]);
  const [openCreateSkillDialog, setOpenCreateSkillDialog] = useState(false);
  const [openViewSkillsDialog, setOpenViewSkillsDialog] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [skillCategory, setSkillCategory] = useState('sales-and-business-development');
  const [skillLoading, setSkillLoading] = useState(false);

  // Helper function to format category label
  const formatCategoryLabel = (category) => {
    const categoryMap = {
      'sales-and-business-development': 'Sales and Business Development',
      'marketing-communications': 'Marketing & Communications',
      'technology-engineering': 'Technology and Engineering',
      'finance-accounting-audit': 'Finance, Accounting & Audit',
      'human-resources': 'Human Resources',
      'operations-supply-chain-procurement': 'Operations, Supply Chain & Procurement',
      'product-management-design': 'Product Management & Design',
      'data-analytics-insights': 'Data, Analytics and Insights',
      'customer-success-support': 'Customer Success & Support',
      'legal-risk-compliance': 'Legal Risk & Compliance',
      'manufacturing-projects-quality': 'Manufacturing, Projects & Quality',
      'general-management-strategy': 'General Management & Strategy',
      'miscellaneous': 'Miscellaneous'
    };
    return categoryMap[category] || category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Helper function to get category color
  const getCategoryColor = (category) => {
    const colors = [
      { bg: 'rgba(79, 140, 255, 0.2)', text: '#4f8cff' },
      { bg: 'rgba(238, 187, 195, 0.2)', text: '#eebbc3' },
      { bg: 'rgba(255, 193, 7, 0.2)', text: '#ffc107' },
      { bg: 'rgba(76, 175, 80, 0.2)', text: '#4caf50' },
      { bg: 'rgba(156, 39, 176, 0.2)', text: '#9c27b0' },
      { bg: 'rgba(255, 152, 0, 0.2)', text: '#ff9800' },
      { bg: 'rgba(233, 30, 99, 0.2)', text: '#e91e63' },
      { bg: 'rgba(0, 188, 212, 0.2)', text: '#00bcd4' },
      { bg: 'rgba(103, 58, 183, 0.2)', text: '#673ab7' },
      { bg: 'rgba(244, 67, 54, 0.2)', text: '#f44336' },
      { bg: 'rgba(255, 87, 34, 0.2)', text: '#ff5722' },
      { bg: 'rgba(121, 85, 72, 0.2)', text: '#795548' },
      { bg: 'rgba(158, 158, 158, 0.2)', text: '#9e9e9e' }
    ];
    // Use hash of category to consistently assign color
    const hash = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  useEffect(() => {
    fetchTalentPools();
    fetchCandidates();
    fetchSkills();
  }, []);

  const fetchTalentPools = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await axios.get('https://ats-backend-2vus.onrender.com/api/talent-pools', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTalentPools(response.data);
    } catch (error) {
      console.error('Error fetching talent pools:', error);
      toast.error('Failed to fetch talent pools');
    }
  };

  const fetchCandidates = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await axios.get('https://ats-backend-2vus.onrender.com/api/candidates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCandidates(response.data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };

  const handleCreatePool = async () => {
    if (!formData.name || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('jwt');
      await axios.post('https://ats-backend-2vus.onrender.com/api/talent-pools', {
        name: formData.name,
        description: formData.description,
        candidateIds: formData.selectedCandidates
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Talent pool created successfully!');
      setOpenCreateDialog(false);
      setFormData({ name: '', description: '', selectedCandidates: [] });
      fetchTalentPools();
    } catch (error) {
      console.error('Error creating talent pool:', error);
      toast.error(error.response?.data?.error || 'Failed to create talent pool');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePool = async (poolId) => {
    if (!window.confirm('Are you sure you want to delete this talent pool?')) {
      return;
    }

    try {
      const token = localStorage.getItem('jwt');
      await axios.delete(`https://ats-backend-2vus.onrender.com/api/talent-pools/${poolId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Talent pool deleted successfully!');
      fetchTalentPools();
    } catch (error) {
      console.error('Error deleting talent pool:', error);
      toast.error('Failed to delete talent pool');
    }
  };

  const handleRemoveCandidateFromPool = async (poolId, candidateId) => {
    try {
      const token = localStorage.getItem('jwt');
      await axios.delete(`https://ats-backend-2vus.onrender.com/api/talent-pools/${poolId}/candidates`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { candidateId }
      });
      toast.success('Candidate removed from pool successfully!');
      fetchTalentPools();
    } catch (error) {
      console.error('Error removing candidate:', error);
      toast.error('Failed to remove candidate from pool');
    }
  };

  const handleToggleCandidateSelection = (candidateId) => {
    setFormData(prev => ({
      ...prev,
      selectedCandidates: prev.selectedCandidates.includes(candidateId)
        ? prev.selectedCandidates.filter(id => id !== candidateId)
        : [...prev.selectedCandidates, candidateId]
    }));
  };

  const handleExpandPool = (poolId) => {
    setExpandedPoolId(expandedPoolId === poolId ? null : poolId);
  };

  // Skills management functions
  const fetchSkills = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await axios.get('https://ats-backend-2vus.onrender.com/api/skills', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSkills(response.data);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const handleCreateSkill = async () => {
    if (!newSkillName.trim()) {
      toast.error('Please enter a skill name');
      return;
    }

    setSkillLoading(true);
    try {
      const token = localStorage.getItem('jwt');
      await axios.post('https://ats-backend-2vus.onrender.com/api/skills', {
        name: newSkillName.trim(),
        category: skillCategory
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Skill created successfully!');
      setOpenCreateSkillDialog(false);
      setNewSkillName('');
      setSkillCategory('sales-and-business-development');
      fetchSkills();
    } catch (error) {
      console.error('Error creating skill:', error);
      toast.error(error.response?.data?.error || 'Failed to create skill');
    } finally {
      setSkillLoading(false);
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) {
      return;
    }

    try {
      const token = localStorage.getItem('jwt');
      await axios.delete(`https://ats-backend-2vus.onrender.com/api/skills/${skillId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Skill deleted successfully!');
      fetchSkills();
    } catch (error) {
      console.error('Error deleting skill:', error);
      toast.error('Failed to delete skill');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4 
      }}>
        <Box>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            color: '#f5f7fa',
            mb: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <GroupIcon sx={{ fontSize: 40, color: '#eebbc3' }} />
            Talent Pools & Skills
          </Typography>
          <Typography variant="body1" sx={{ color: '#b8c5d6' }}>
            Organize and manage your candidate talent pools and skills
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<StarIcon />}
            onClick={() => setOpenCreateSkillDialog(true)}
            sx={{
              borderColor: '#4f8cff',
              color: '#4f8cff',
              fontWeight: 600,
              px: 2,
              py: 1.5,
              '&:hover': {
                borderColor: '#3a7bd5',
                backgroundColor: 'rgba(79, 140, 255, 0.1)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            Create New Skill
          </Button>
          <Button
            variant="outlined"
            startIcon={<VisibilityIcon />}
            onClick={() => setOpenViewSkillsDialog(true)}
            sx={{
              borderColor: '#eebbc3',
              color: '#eebbc3',
              fontWeight: 600,
              px: 2,
              py: 1.5,
              '&:hover': {
                borderColor: '#d4a5ac',
                backgroundColor: 'rgba(238, 187, 195, 0.1)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            View All Skills ({skills.length})
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateDialog(true)}
              sx={{
                background: 'linear-gradient(135deg, #4f8cff 0%, #eebbc3 100%)',
                color: '#fff',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                '&:hover': {
                  background: 'linear-gradient(135deg, #3a7bd5 0%, #d4a5ac 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 16px rgba(79, 140, 255, 0.3)'
                }
              }}
            >
              Create New Pool
            </Button>
          </Box>
      </Box>

      {/* Talent Pools Grid */}
      <Grid container spacing={3}>
        {talentPools.length === 0 ? (
          <Grid item xs={12}>
            <Card sx={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #232946 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center',
              py: 8
            }}>
              <GroupIcon sx={{ fontSize: 80, color: '#b8c5d6', mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" sx={{ color: '#b8c5d6', mb: 1 }}>
                No Talent Pools Yet
              </Typography>
              <Typography variant="body2" sx={{ color: '#b8c5d6', opacity: 0.7 }}>
                Create your first talent pool to organize candidates
              </Typography>
            </Card>
          </Grid>
        ) : (
          talentPools.map((pool) => (
            <Grid item xs={12} md={6} lg={4} key={pool._id}>
              <Card sx={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #232946 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                  borderColor: '#eebbc3'
                }
              }}>
                <CardContent>
                  {/* Pool Header */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    mb: 2
                  }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ 
                        color: '#eebbc3', 
                        fontWeight: 600,
                        mb: 0.5
                      }}>
                        {pool.name}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: '#b8c5d6',
                        mb: 2
                      }}>
                        {pool.description}
                      </Typography>
                    </Box>
                    {user.accessLevel === 2 && (
                      <IconButton
                        size="small"
                        onClick={() => handleDeletePool(pool._id)}
                        sx={{
                          color: '#ff6b6b',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 107, 107, 0.1)'
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>

                  {/* Candidate Count */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    mb: 2,
                    p: 1.5,
                    background: 'rgba(79, 140, 255, 0.1)',
                    borderRadius: 1
                  }}>
                    <PeopleIcon sx={{ color: '#4f8cff' }} />
                    <Typography variant="body1" sx={{ 
                      color: '#4f8cff',
                      fontWeight: 600
                    }}>
                      {pool.candidates?.length || 0} Candidates
                    </Typography>
                  </Box>

                  {/* View Candidates Button */}
                  <Button
                    fullWidth
                    variant="outlined"
                    endIcon={expandedPoolId === pool._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    onClick={() => handleExpandPool(pool._id)}
                    sx={{
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      color: '#f5f7fa',
                      '&:hover': {
                        borderColor: '#eebbc3',
                        backgroundColor: 'rgba(238, 187, 195, 0.1)'
                      }
                    }}
                  >
                    {expandedPoolId === pool._id ? 'Hide Candidates' : 'View Candidates'}
                  </Button>

                  {/* Expanded Candidates List */}
                  <Collapse in={expandedPoolId === pool._id}>
                    <Box sx={{ mt: 2 }}>
                      {pool.candidates && pool.candidates.length > 0 ? (
                        <TableContainer component={Paper} sx={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          maxHeight: 300,
                          overflow: 'auto'
                        }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ color: '#4f8cff', fontWeight: 600 }}>
                                  Name
                                </TableCell>
                                <TableCell sx={{ color: '#4f8cff', fontWeight: 600 }}>
                                  Email
                                </TableCell>
                                {user.accessLevel === 2 && (
                                  <TableCell sx={{ color: '#4f8cff', fontWeight: 600, width: 50 }}>
                                    Action
                                  </TableCell>
                                )}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {pool.candidates.map((candidate) => (
                                <TableRow key={candidate._id}>
                                  <TableCell sx={{ color: '#f5f7fa' }}>
                                    {candidate.name}
                                  </TableCell>
                                  <TableCell sx={{ color: '#b8c5d6' }}>
                                    {candidate.email}
                                  </TableCell>
                                  {user.accessLevel === 2 && (
                                    <TableCell>
                                      <Tooltip title="Remove from pool">
                                        <IconButton
                                          size="small"
                                          onClick={() => handleRemoveCandidateFromPool(pool._id, candidate._id)}
                                          sx={{
                                            color: '#ff6b6b',
                                            '&:hover': {
                                              backgroundColor: 'rgba(255, 107, 107, 0.1)'
                                            }
                                          }}
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </TableCell>
                                  )}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Typography variant="body2" sx={{ 
                          color: '#b8c5d6', 
                          fontStyle: 'italic',
                          textAlign: 'center',
                          py: 2
                        }}>
                          No candidates in this pool
                        </Typography>
                      )}
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Create Talent Pool Dialog */}
      <Dialog 
        open={openCreateDialog} 
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1a1a2e 0%, #232946 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        <DialogTitle sx={{ color: '#eebbc3', fontWeight: 600 }}>
          Create New Talent Pool
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Pool Name */}
            <TextField
              fullWidth
              label="Pool Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#eebbc3' }
                },
                '& .MuiInputLabel-root': { color: '#b8c5d6' },
                '& .MuiInputBase-input': { color: '#f5f7fa' }
              }}
            />

            {/* Description */}
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              multiline
              rows={3}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#eebbc3' }
                },
                '& .MuiInputLabel-root': { color: '#b8c5d6' },
                '& .MuiInputBase-input': { color: '#f5f7fa' }
              }}
            />

            {/* Select Candidates */}
            <Typography variant="subtitle1" sx={{ color: '#eebbc3', mb: 2, fontWeight: 600 }}>
              Select Candidates (Optional)
            </Typography>
            <Box sx={{
              maxHeight: 300,
              overflow: 'auto',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: 1,
              p: 2
            }}>
              {candidates.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#b8c5d6', fontStyle: 'italic' }}>
                  No candidates available
                </Typography>
              ) : (
                candidates.map((candidate) => (
                  <FormControlLabel
                    key={candidate._id}
                    control={
                      <Checkbox
                        checked={formData.selectedCandidates.includes(candidate._id)}
                        onChange={() => handleToggleCandidateSelection(candidate._id)}
                        sx={{
                          color: '#b8c5d6',
                          '&.Mui-checked': { color: '#eebbc3' }
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ color: '#f5f7fa' }}>
                          {candidate.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#b8c5d6' }}>
                          {candidate.email}
                        </Typography>
                      </Box>
                    }
                    sx={{ mb: 1, display: 'flex', alignItems: 'flex-start' }}
                  />
                ))
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setOpenCreateDialog(false)}
            sx={{ color: '#b8c5d6' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreatePool}
            disabled={loading}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #4f8cff 0%, #eebbc3 100%)',
              color: '#fff',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #3a7bd5 0%, #d4a5ac 100%)'
              }
            }}
          >
            {loading ? 'Creating...' : 'Create Pool'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Skill Dialog */}
      <Dialog 
        open={openCreateSkillDialog} 
        onClose={() => setOpenCreateSkillDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1a1a2e 0%, #232946 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        <DialogTitle sx={{ color: '#4f8cff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <StarIcon />
          Create New Skill
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Skill Name"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              required
              placeholder="e.g., React, Python, Project Management"
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(79, 140, 255, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#4f8cff' }
                },
                '& .MuiInputLabel-root': { color: '#b8c5d6' },
                '& .MuiInputBase-input': { color: '#f5f7fa' }
              }}
            />
            
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#b8c5d6' }}>Category</InputLabel>
              <Select
                value={skillCategory}
                onChange={(e) => setSkillCategory(e.target.value)}
                label="Category"
                sx={{
                  color: '#f5f7fa',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(79, 140, 255, 0.5)' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4f8cff' },
                  '& .MuiSvgIcon-root': { color: '#b8c5d6' }
                }}
              >
                <MenuItem value="sales-and-business-development">Sales and Business Development</MenuItem>
                <MenuItem value="marketing-communications">Marketing & Communications</MenuItem>
                <MenuItem value="technology-engineering">Technology and Engineering</MenuItem>
                <MenuItem value="finance-accounting-audit">Finance, Accounting & Audit</MenuItem>
                <MenuItem value="human-resources">Human Resources</MenuItem>
                <MenuItem value="operations-supply-chain-procurement">Operations, Supply Chain & Procurement</MenuItem>
                <MenuItem value="product-management-design">Product Management & Design</MenuItem>
                <MenuItem value="data-analytics-insights">Data, Analytics and Insights</MenuItem>
                <MenuItem value="customer-success-support">Customer Success & Support</MenuItem>
                <MenuItem value="legal-risk-compliance">Legal Risk & Compliance</MenuItem>
                <MenuItem value="manufacturing-projects-quality">Manufacturing, Projects & Quality</MenuItem>
                <MenuItem value="general-management-strategy">General Management & Strategy</MenuItem>
                <MenuItem value="miscellaneous">Miscellaneous</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setOpenCreateSkillDialog(false)}
            sx={{ color: '#b8c5d6' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateSkill}
            disabled={skillLoading}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #4f8cff 0%, #3a7bd5 100%)',
              color: '#fff',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #3a7bd5 0%, #2a5bb5 100%)'
              }
            }}
          >
            {skillLoading ? 'Creating...' : 'Create Skill'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View All Skills Dialog */}
      <Dialog 
        open={openViewSkillsDialog} 
        onClose={() => setOpenViewSkillsDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1a1a2e 0%, #232946 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        <DialogTitle sx={{ color: '#eebbc3', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <StarIcon />
          All Skills ({skills.length})
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {skills.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <StarIcon sx={{ fontSize: 60, color: '#b8c5d6', mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" sx={{ color: '#b8c5d6', mb: 1 }}>
                  No Skills Created Yet
                </Typography>
                <Typography variant="body2" sx={{ color: '#b8c5d6', opacity: 0.7 }}>
                  Create your first skill to get started
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                maxHeight: 500
              }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ 
                        background: '#1a1a2e',
                        color: '#4f8cff', 
                        fontWeight: 600,
                        borderBottom: '2px solid rgba(79, 140, 255, 0.3)'
                      }}>
                        Skill Name
                      </TableCell>
                      <TableCell sx={{ 
                        background: '#1a1a2e',
                        color: '#4f8cff', 
                        fontWeight: 600,
                        borderBottom: '2px solid rgba(79, 140, 255, 0.3)'
                      }}>
                        Category
                      </TableCell>
                      <TableCell sx={{ 
                        background: '#1a1a2e',
                        color: '#4f8cff', 
                        fontWeight: 600,
                        borderBottom: '2px solid rgba(79, 140, 255, 0.3)'
                      }}>
                        Usage Count
                      </TableCell>
                      <TableCell sx={{ 
                        background: '#1a1a2e',
                        color: '#4f8cff', 
                        fontWeight: 600,
                        borderBottom: '2px solid rgba(79, 140, 255, 0.3)',
                        width: 100
                      }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {skills.map((skill) => (
                      <TableRow 
                        key={skill._id}
                        sx={{
                          '&:hover': {
                            background: 'rgba(255, 255, 255, 0.05)'
                          }
                        }}
                      >
                        <TableCell sx={{ color: '#f5f7fa', textTransform: 'capitalize' }}>
                          {skill.name}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={formatCategoryLabel(skill.category)}
                            size="small"
                            sx={{
                              backgroundColor: getCategoryColor(skill.category).bg,
                              color: getCategoryColor(skill.category).text
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: '#b8c5d6' }}>
                          {skill.usageCount || 0}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Delete Skill">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteSkill(skill._id)}
                              sx={{
                                color: '#ff6b6b',
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 107, 107, 0.1)'
                                }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setOpenViewSkillsDialog(false)}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #4f8cff 0%, #eebbc3 100%)',
              color: '#fff',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #3a7bd5 0%, #d4a5ac 100%)'
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TalentPools;

