import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  Box,
  Typography,
  Button,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  TablePagination
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FilterList as FilterIcon,
  Visibility as VisibilityIcon,
  Clear as ClearIcon,
  Domain as DomainIcon,
  Group as GroupIcon,
  Star as StarIcon
} from '@mui/icons-material';
import API_URL from '../config/api';

const TalentPools = ({ user }) => {
  // State for domains, talent pools, and skills
  const [domains, setDomains] = useState([]);
  const [talentPools, setTalentPools] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [openDomainDialog, setOpenDomainDialog] = useState(false);
  const [openTalentPoolDialog, setOpenTalentPoolDialog] = useState(false);
  const [openSkillDialog, setOpenSkillDialog] = useState(false);
  const [openCandidatePoolDialog, setOpenCandidatePoolDialog] = useState(false);
  
  // Form states
  const [domainForm, setDomainForm] = useState({ name: '', description: '' });
  const [talentPoolForm, setTalentPoolForm] = useState({ domainId: '', name: '', description: '' });
  const [skillForm, setSkillForm] = useState({ talentPoolId: '', name: '' });
  
  // Candidate pool viewing
  const [candidatePoolForm, setCandidatePoolForm] = useState({ domainId: '', talentPoolId: '' });
  const [candidatePoolCandidates, setCandidatePoolCandidates] = useState([]);
  const [candidatePoolLoading, setCandidatePoolLoading] = useState(false);
  
  // Filtering
  const [filterDomain, setFilterDomain] = useState('');
  const [filterTalentPool, setFilterTalentPool] = useState([]); // Changed to array for multiple selection
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  
  // Deletion confirmation
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, type: '', id: '', name: '' });

  // Fetch data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('jwt');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [domainsRes, talentPoolsRes, skillsRes] = await Promise.all([
        axios.get(`${API_URL}/api/domains`, { headers }),
        axios.get(`${API_URL}/api/talent-pools`, { headers }),
        axios.get(`${API_URL}/api/skills`, { headers })
      ]);
      
      setDomains(domainsRes.data);
      setTalentPools(talentPoolsRes.data);
      setSkills(skillsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Create Domain
  const handleCreateDomain = async () => {
    if (!domainForm.name.trim()) {
      toast.error('Domain name is required');
      return;
    }
    
    try {
      const token = localStorage.getItem('jwt');
      await axios.post(`${API_URL}/api/domains`, domainForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Domain created successfully');
      setOpenDomainDialog(false);
      setDomainForm({ name: '', description: '' });
      fetchAllData();
    } catch (error) {
      console.error('Error creating domain:', error);
      toast.error(error.response?.data?.error || 'Failed to create domain');
    }
  };

  // Create Talent Pool
  const handleCreateTalentPool = async () => {
    if (!talentPoolForm.domainId) {
      toast.error('Please select a domain');
      return;
    }
    if (!talentPoolForm.name.trim()) {
      toast.error('Talent pool name is required');
      return;
    }
    
    try {
      const token = localStorage.getItem('jwt');
      await axios.post(`${API_URL}/api/talent-pools`, talentPoolForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Talent pool created successfully');
      setOpenTalentPoolDialog(false);
      setTalentPoolForm({ domainId: '', name: '', description: '' });
      fetchAllData();
    } catch (error) {
      console.error('Error creating talent pool:', error);
      toast.error(error.response?.data?.error || 'Failed to create talent pool');
    }
  };

  // Create Skill
  const handleCreateSkill = async () => {
    if (!skillForm.talentPoolId) {
      toast.error('Please select a talent pool');
      return;
    }
    if (!skillForm.name.trim()) {
      toast.error('Skill name is required');
      return;
    }
    
    try {
      const token = localStorage.getItem('jwt');
      await axios.post(`${API_URL}/api/skills`, skillForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Skill created successfully');
      setOpenSkillDialog(false);
      setSkillForm({ talentPoolId: '', name: '' });
      fetchAllData();
    } catch (error) {
      console.error('Error creating skill:', error);
      toast.error(error.response?.data?.error || 'Failed to create skill');
    }
  };

  // View Candidate Pool
  const handleViewCandidatePool = async () => {
    if (!candidatePoolForm.domainId || !candidatePoolForm.talentPoolId) {
      toast.error('Please select both domain and talent pool');
      return;
    }
    
    setCandidatePoolLoading(true);
    try {
      const token = localStorage.getItem('jwt');
      const res = await axios.get(`${API_URL}/api/candidates`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          domain: candidatePoolForm.domainId,
          talentPools: candidatePoolForm.talentPoolId
        }
      });
      setCandidatePoolCandidates(res.data);
    } catch (error) {
      console.error('Error fetching candidate pool:', error);
      toast.error('Failed to load candidates');
    } finally {
      setCandidatePoolLoading(false);
    }
  };

  // Delete handlers
  const handleDelete = async () => {
    const { type, id } = deleteConfirm;
    
    try {
      const token = localStorage.getItem('jwt');
      const headers = { Authorization: `Bearer ${token}` };
      
      if (type === 'domain') {
        await axios.delete(`${API_URL}/api/domains/${id}`, { headers });
        toast.success('Domain deleted successfully');
      } else if (type === 'talentPool') {
        await axios.delete(`${API_URL}/api/talent-pools/${id}`, { headers });
        toast.success('Talent pool deleted successfully');
      } else if (type === 'skill') {
        await axios.delete(`${API_URL}/api/skills/${id}`, { headers });
        toast.success('Skill deleted successfully');
      }
      
      setDeleteConfirm({ open: false, type: '', id: '', name: '' });
      fetchAllData();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error(error.response?.data?.error || 'Failed to delete');
    }
  };

  // Build hierarchical data for table
  const buildTableData = () => {
    const data = [];
    
    const filteredDomains = filterDomain 
      ? domains.filter(d => d._id === filterDomain)
      : domains;
    
    filteredDomains.forEach(domain => {
      // Handle both populated and unpopulated domain field
      const domainTalentPools = talentPools.filter(tp => {
        const tpDomainId = typeof tp.domain === 'object' ? tp.domain._id : tp.domain;
        return tpDomainId === domain._id;
      });
      
      const filteredTalentPools = filterTalentPool && filterTalentPool.length > 0
        ? domainTalentPools.filter(tp => filterTalentPool.includes(tp._id))
        : domainTalentPools;
      
      filteredTalentPools.forEach(talentPool => {
        // Handle both populated and unpopulated talentPool field
        const talentPoolSkills = skills.filter(skill => {
          const skillTpId = typeof skill.talentPool === 'object' ? skill.talentPool._id : skill.talentPool;
          return skillTpId === talentPool._id;
        });
        
        if (talentPoolSkills.length === 0) {
          data.push({
            domainId: domain._id,
            domainName: domain.name,
            talentPoolId: talentPool._id,
            talentPoolName: talentPool.name,
            skillId: null,
            skillName: '-'
          });
        } else {
          talentPoolSkills.forEach(skill => {
            data.push({
              domainId: domain._id,
              domainName: domain.name,
              talentPoolId: talentPool._id,
              talentPoolName: talentPool.name,
              skillId: skill._id,
              skillName: skill.name
            });
          });
        }
      });
    });
    
    return data;
  };

  const tableData = buildTableData();
  
  // Paginate the table data
  const paginatedTableData = tableData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const filteredTalentPoolsForFilter = filterDomain
    ? talentPools.filter(tp => {
        const tpDomainId = typeof tp.domain === 'object' ? tp.domain._id : tp.domain;
        return tpDomainId === filterDomain;
      })
    : [];

  return (
    <Box sx={{ p: 3, maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            color: '#1e293b', 
            fontWeight: 700, 
            mb: 1,
            background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Domain, Talent Pools & Skills
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          Manage your hierarchical expertise structure
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDomainDialog(true)}
          sx={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            color: 'white',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            '&:hover': {
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            }
          }}
        >
          Add Domain
        </Button>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenTalentPoolDialog(true)}
          sx={{
            background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
            color: 'white',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            '&:hover': {
              background: 'linear-gradient(135deg, #db2777 0%, #be185d 100%)',
            }
          }}
        >
          Add Talent Pool
        </Button>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenSkillDialog(true)}
          sx={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            '&:hover': {
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            }
          }}
        >
          Add Skill
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<VisibilityIcon />}
          onClick={() => setOpenCandidatePoolDialog(true)}
          sx={{
            borderColor: '#8b5cf6',
            color: '#8b5cf6',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            '&:hover': {
              borderColor: '#7c3aed',
              backgroundColor: 'rgba(139, 92, 246, 0.08)'
            }
          }}
        >
          See Candidate Pool
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<FilterIcon />}
          onClick={() => setShowFilterDialog(true)}
          sx={{
            borderColor: '#64748b',
            color: '#64748b',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            '&:hover': {
              borderColor: '#475569',
              backgroundColor: 'rgba(100, 116, 139, 0.08)'
            }
          }}
        >
          Filter
        </Button>
        
        {(filterDomain || filterTalentPool) && (
          <Button
            variant="text"
            startIcon={<ClearIcon />}
            onClick={() => {
              setFilterDomain('');
              setFilterTalentPool([]);
            }}
            sx={{
              color: '#ef4444',
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Clear Filters
          </Button>
        )}
      </Box>

      {/* Active Filters Display & Stats */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        {(filterDomain || (filterTalentPool && filterTalentPool.length > 0)) && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {filterDomain && (
              <Chip
                label={`Domain: ${domains.find(d => d._id === filterDomain)?.name || 'Unknown'}`}
                onDelete={() => {
                  setFilterDomain('');
                  setFilterTalentPool([]);
                  setPage(0);
                }}
                sx={{ backgroundColor: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' }}
              />
            )}
            {filterTalentPool && filterTalentPool.length > 0 && filterTalentPool.map(tpId => {
              const tp = talentPools.find(t => t._id === tpId);
              return tp ? (
                <Chip
                  key={tpId}
                  label={`Talent Pool: ${tp.name}`}
                  onDelete={() => {
                    setFilterTalentPool(filterTalentPool.filter(id => id !== tpId));
                    setPage(0);
                  }}
                  sx={{ backgroundColor: 'rgba(236, 72, 153, 0.12)', color: '#ec4899' }}
                />
              ) : null;
            })}
          </Box>
        )}
        <Chip
          label={`Total: ${tableData.length} entries`}
          sx={{ backgroundColor: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', fontWeight: 600 }}
        />
      </Box>

      {/* Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress sx={{ color: '#8b5cf6' }} />
        </Box>
      ) : (
        <TableContainer 
          component={Paper}
          sx={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ 
                background: 'rgba(139, 92, 246, 0.08)',
                borderBottom: '2px solid rgba(238, 187, 195, 0.3)'
              }}>
                <TableCell sx={{ color: '#1e293b', fontWeight: 700, fontSize: '0.95rem' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DomainIcon sx={{ fontSize: 20, color: '#8b5cf6' }} />
                    Domain
                  </Box>
                </TableCell>
                <TableCell sx={{ color: '#1e293b', fontWeight: 700, fontSize: '0.95rem' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <GroupIcon sx={{ fontSize: 20, color: '#ec4899' }} />
                    Talent Pool
                  </Box>
                </TableCell>
                <TableCell sx={{ color: '#1e293b', fontWeight: 700, fontSize: '0.95rem' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StarIcon sx={{ fontSize: 20, color: '#3b82f6' }} />
                    Skill
                  </Box>
                </TableCell>
                <TableCell sx={{ color: '#1e293b', fontWeight: 700, fontSize: '0.95rem', textAlign: 'right' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      No data found. Create a domain to get started.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTableData.map((row, index) => (
                  <TableRow 
                    key={index}
                    sx={{
                      '&:hover': { backgroundColor: 'rgba(139, 92, 246, 0.04)' },
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <TableCell sx={{ color: '#1e293b', fontWeight: 600 }}>
                      {row.domainName}
                    </TableCell>
                    <TableCell sx={{ color: '#64748b' }}>
                      {row.talentPoolName}
                    </TableCell>
                    <TableCell sx={{ color: '#64748b', textTransform: 'capitalize' }}>
                      {row.skillName}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        {row.skillId && (
                          <IconButton
                            size="small"
                            onClick={() => setDeleteConfirm({ 
                              open: true, 
                              type: 'skill', 
                              id: row.skillId, 
                              name: row.skillName 
                            })}
                            sx={{ 
                              color: '#ef4444',
                              '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.08)' }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {tableData.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[25, 50, 100, 250, 500]}
              component="div"
              count={tableData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  color: '#64748b',
                  fontWeight: 500
                }
              }}
            />
          )}
        </TableContainer>
      )}

      {/* Add Domain Dialog */}
      <Dialog 
        open={openDomainDialog} 
        onClose={() => setOpenDomainDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          color: 'white',
          fontWeight: 700
        }}>
          Add New Domain
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            fullWidth
            label="Domain Name"
            value={domainForm.name}
            onChange={(e) => setDomainForm({ ...domainForm, name: e.target.value })}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={domainForm.description}
            onChange={(e) => setDomainForm({ ...domainForm, description: e.target.value })}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenDomainDialog(false)} sx={{ color: '#64748b' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateDomain} 
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white'
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Talent Pool Dialog */}
      <Dialog 
        open={openTalentPoolDialog} 
        onClose={() => setOpenTalentPoolDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
          color: 'white',
          fontWeight: 700
        }}>
          Add Talent Pool Under Domain
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Domain</InputLabel>
            <Select
              value={talentPoolForm.domainId}
              onChange={(e) => setTalentPoolForm({ ...talentPoolForm, domainId: e.target.value })}
              label="Select Domain"
            >
              {domains.map(domain => (
                <MenuItem key={domain._id} value={domain._id}>
                  {domain.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Talent Pool Name"
            value={talentPoolForm.name}
            onChange={(e) => setTalentPoolForm({ ...talentPoolForm, name: e.target.value })}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={talentPoolForm.description}
            onChange={(e) => setTalentPoolForm({ ...talentPoolForm, description: e.target.value })}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenTalentPoolDialog(false)} sx={{ color: '#64748b' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateTalentPool} 
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
              color: 'white'
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Skill Dialog */}
      <Dialog 
        open={openSkillDialog} 
        onClose={() => setOpenSkillDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          color: 'white',
          fontWeight: 700
        }}>
          Add Skill Under Talent Pool
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Talent Pool</InputLabel>
            <Select
              value={skillForm.talentPoolId}
              onChange={(e) => setSkillForm({ ...skillForm, talentPoolId: e.target.value })}
              label="Select Talent Pool"
            >
              {talentPools.map(tp => {
                const domain = domains.find(d => d._id === tp.domain);
                return (
                  <MenuItem key={tp._id} value={tp._id}>
                    {domain ? `${domain.name} → ${tp.name}` : tp.name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Skill Name"
            value={skillForm.name}
            onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
            required
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenSkillDialog(false)} sx={{ color: '#64748b' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateSkill} 
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white'
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* See Candidate Pool Dialog */}
      <Dialog 
        open={openCandidatePoolDialog} 
        onClose={() => setOpenCandidatePoolDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: '#f8fafc',
          color: '#1e293b',
          fontWeight: 700,
          borderBottom: '1px solid #e2e8f0'
        }}>
          View Candidate Pool
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Select Domain</InputLabel>
            <Select
              value={candidatePoolForm.domainId}
              onChange={(e) => {
                setCandidatePoolForm({ domainId: e.target.value, talentPoolId: '' });
                setCandidatePoolCandidates([]);
              }}
              label="Select Domain"
              sx={{
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.12)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(139, 92, 246, 0.5)' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8b5cf6' }
              }}
            >
              {domains.map(domain => (
                <MenuItem key={domain._id} value={domain._id}>
                  {domain.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Select Talent Pool</InputLabel>
            <Select
              value={candidatePoolForm.talentPoolId}
              onChange={(e) => {
                setCandidatePoolForm({ ...candidatePoolForm, talentPoolId: e.target.value });
                setCandidatePoolCandidates([]);
              }}
              label="Select Talent Pool"
              disabled={!candidatePoolForm.domainId}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.12)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(139, 92, 246, 0.5)' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8b5cf6' }
              }}
            >
              {talentPools
                .filter(tp => {
                  const tpDomainId = typeof tp.domain === 'object' ? tp.domain._id : tp.domain;
                  return tpDomainId === candidatePoolForm.domainId;
                })
                .map(tp => (
                  <MenuItem key={tp._id} value={tp._id}>
                    {tp.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <Button
            fullWidth
            variant="contained"
            onClick={handleViewCandidatePool}
            disabled={!candidatePoolForm.domainId || !candidatePoolForm.talentPoolId || candidatePoolLoading}
            sx={{
              background: '#8b5cf6',
              color: 'white',
              mb: 3,
              py: 1.5,
              '&:hover': { background: '#7c3aed' },
              '&:disabled': { background: '#cbd5e1', color: '#94a3b8' }
            }}
          >
            {candidatePoolLoading ? 'Loading...' : 'View Candidates'}
          </Button>
          
          {candidatePoolCandidates.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, color: '#1e293b', fontWeight: 600 }}>
                Candidates ({candidatePoolCandidates.length})
              </Typography>
              <List>
                {candidatePoolCandidates.map((candidate) => (
                  <ListItem 
                    key={candidate._id}
                    sx={{
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': { backgroundColor: 'rgba(139, 92, 246, 0.04)' }
                    }}
                  >
                    <ListItemText
                      primary={candidate.name}
                      secondary={
                        <>
                          {candidate.email && <div>{candidate.email}</div>}
                          {candidate.phone && <div>{candidate.phone}</div>}
                        </>
                      }
                      primaryTypographyProps={{ fontWeight: 600, color: '#1e293b' }}
                      secondaryTypographyProps={{ color: '#64748b' }}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
          
          {candidatePoolCandidates.length === 0 && candidatePoolForm.talentPoolId && !candidatePoolLoading && (
            <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center', py: 2 }}>
              No candidates found in this talent pool.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenCandidatePoolDialog(false)} sx={{ color: '#64748b' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog 
        open={showFilterDialog} 
        onClose={() => setShowFilterDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: '#f8fafc',
          color: '#1e293b',
          fontWeight: 700,
          borderBottom: '1px solid #e2e8f0'
        }}>
          Filter by Domain & Talent Pool
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Domain</InputLabel>
            <Select
              value={filterDomain}
              onChange={(e) => {
                setFilterDomain(e.target.value);
                setFilterTalentPool([]);
              }}
              label="Domain"
              sx={{
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.12)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(139, 92, 246, 0.5)' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8b5cf6' }
              }}
            >
              <MenuItem value="">
                <em>All Domains</em>
              </MenuItem>
              {domains.map(domain => (
                <MenuItem key={domain._id} value={domain._id}>
                  {domain.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Talent Pool(s)</InputLabel>
            <Select
              multiple
              value={filterTalentPool}
              onChange={(e) => setFilterTalentPool(e.target.value)}
              label="Talent Pool(s)"
              disabled={!filterDomain}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const tp = talentPools.find(t => t._id === value);
                    return tp ? (
                      <Chip key={value} label={tp.name} size="small" sx={{ backgroundColor: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' }} />
                    ) : null;
                  })}
                </Box>
              )}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.12)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(139, 92, 246, 0.5)' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8b5cf6' }
              }}
            >
              {filteredTalentPoolsForFilter.map(tp => (
                <MenuItem key={tp._id} value={tp._id}>
                  {tp.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 2, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setShowFilterDialog(false)} sx={{ color: '#64748b' }}>
            Cancel
          </Button>
          <Button 
            onClick={() => {
              setShowFilterDialog(false);
              setPage(0);
            }} 
            variant="contained"
            sx={{
              background: '#8b5cf6',
              color: 'white',
              '&:hover': { background: '#7c3aed' }
            }}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, type: '', id: '', name: '' })}
        onConfirm={handleDelete}
        title={`Delete ${deleteConfirm.type}?`}
        message={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
      />
    </Box>
  );
};

export default TalentPools;
