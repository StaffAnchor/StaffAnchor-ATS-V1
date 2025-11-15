import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Card,
  CardContent,
  Button,
  Paper
} from '@mui/material';
import {
  Group as GroupIcon,
  Code as CodeIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const OrganizationConfig = ({ user }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Talent Pool states
  const [talentPools, setTalentPools] = useState([]);
  const [newTalentPool, setNewTalentPool] = useState({ name: '', description: '' });

  // Skills states
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState({ name: '', category: 'sales-and-business-development' });
  const [skillCategories] = useState([
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
  ]);

  useEffect(() => {
    fetchTalentPools();
    fetchSkills();
  }, []);

  const fetchTalentPools = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await axios.get('https://staffanchor-ats-v1.onrender.com/api/talent-pools', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTalentPools(response.data);
    } catch (err) {
      console.error('Failed to fetch talent pools:', err);
    }
  };

  const fetchSkills = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await axios.get('https://staffanchor-ats-v1.onrender.com/api/skills', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSkills(response.data);
    } catch (err) {
      console.error('Failed to fetch skills:', err);
    }
  };

  const handleCreateTalentPool = async () => {
    if (!newTalentPool.name.trim() || !newTalentPool.description.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('jwt');
      const response = await axios.post('https://staffanchor-ats-v1.onrender.com/api/talent-pools', newTalentPool, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTalentPools([...talentPools, response.data]);
      setNewTalentPool({ name: '', description: '' });
      setSuccess('Talent pool created successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create talent pool');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSkill = async () => {
    if (!newSkill.name.trim()) {
      setError('Please enter a skill name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('jwt');
      const response = await axios.post('https://staffanchor-ats-v1.onrender.com/api/skills', newSkill, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSkills([...skills, response.data]);
      setNewSkill({ name: '', category: 'sales-and-business-development' });
      setSuccess('Skill created successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create skill');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTalentPool = async (poolId) => {
    if (!window.confirm('Are you sure you want to delete this talent pool?')) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('jwt');
      await axios.delete(`https://staffanchor-ats-v1.onrender.com/api/talent-pools/${poolId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTalentPools(talentPools.filter(pool => pool._id !== poolId));
      setSuccess('Talent pool deleted successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete talent pool');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('jwt');
      await axios.delete(`https://staffanchor-ats-v1.onrender.com/api/skills/${skillId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSkills(skills.filter(skill => skill._id !== skillId));
      setSuccess('Skill deleted successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete skill');
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = (view) => {
    if (view === 'organization-config') return; // Already on organization config page
    navigate('/dashboard', { state: { view } });
  };

  // Accent color for active tab in dark mode
  const getTabStyle = (active) =>
    active
      ? { background: 'var(--color-accent)', color: '#232946', fontWeight: 700, border: '2px solid var(--color-accent)' }
      : { background: 'transparent', color: '#f5f7fa', border: '2px solid #444' };

  const getCategoryColor = (category) => {
    const colors = {
      technical: '#4f8cff',
      soft: '#eebbc3',
      language: '#ffc107',
      certification: '#4caf50',
      other: '#9c27b0'
    };
    return colors[category] || '#666';
  };

  return (
    <div className="dashboard card" style={{
      maxWidth: '100%', 
      background: 'transparent', 
      boxShadow: 'none', 
      border: 'none', 
      padding: '0 20px'
    }}>
      {/* Dashboard Header */}
      <div style={{
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2em',
        paddingTop: '20px'
      }}>
        <h1>Dashboard</h1>
        <div style={{
          display: 'flex', 
          gap: '1em', 
          flexWrap: 'wrap'
        }}>
          {user?.accessLevel === 2 && <button className="button" style={getTabStyle(false)} onClick={() => handleViewChange('jobs')}>Jobs</button>}
          <button className="button" style={getTabStyle(false)} onClick={() => handleViewChange('candidates')}>Candidates</button>
          {user?.accessLevel === 2 && <button className="button" style={getTabStyle(false)} onClick={() => handleViewChange('addJob')}>Add Job</button>}
          {user?.accessLevel === 2 && <button className="button" style={getTabStyle(false)} onClick={() => handleViewChange('addCandidate')}>Add Candidate</button>}
          <button className="button" style={getTabStyle(false)} onClick={() => handleViewChange('workflows')}>Workflows</button>
          {user?.accessLevel === 2 && <button className="button" style={getTabStyle(false)} onClick={() => handleViewChange('subordinates')}>Subordinates</button>}
          {user?.accessLevel === 2 && <button className="button" style={getTabStyle(true)} onClick={() => handleViewChange('organization-config')}>Organization Configurations</button>}
          {user?.accessLevel === 1 && <button className="button" style={getTabStyle(false)} onClick={() => handleViewChange('authorizedJobs')}>Authorized Jobs</button>}
        </div>
      </div>

      {/* Organization Configuration Content */}
      <Box sx={{ 
        maxWidth: 1200, 
        mx: 'auto',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #232946 100%)',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4, p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <SettingsIcon sx={{ fontSize: 40, color: '#eebbc3', mr: 2 }} />
            <Typography variant="h3" sx={{ 
              fontWeight: 700, 
              color: '#f5f7fa',
              background: 'linear-gradient(135deg, #f5f7fa 0%, #eebbc3 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Organization Configurations
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: '#b8c5d6', fontSize: '1.1rem' }}>
            Manage talent pools and skills for your organization
          </Typography>
        </Box>

        <Paper elevation={0} sx={{
          background: 'transparent',
          p: 4,
          borderRadius: 3,
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.1)', mb: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{
                '& .MuiTab-root': { color: '#b8c5d6' },
                '& .Mui-selected': { color: '#eebbc3' },
                '& .MuiTabs-indicator': { backgroundColor: '#eebbc3' }
              }}
            >
              <Tab 
                icon={<GroupIcon />} 
                label="Talent Pools" 
                iconPosition="start"
              />
              <Tab 
                icon={<CodeIcon />} 
                label="Skills" 
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, backgroundColor: 'rgba(244, 67, 54, 0.1)', color: '#f44336' }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2, backgroundColor: 'rgba(76, 175, 80, 0.1)', color: '#4caf50' }}>
              {success}
            </Alert>
          )}

          {/* Talent Pools Tab */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" sx={{ color: '#eebbc3', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <GroupIcon />
                Manage Talent Pools
              </Typography>

              {/* Create New Talent Pool */}
              <Card sx={{ 
                mb: 3, 
                background: 'rgba(255, 255, 255, 0.05)', 
                border: '1px solid rgba(255, 255, 255, 0.1)' 
              }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ color: '#f5f7fa', mb: 2 }}>
                    Create New Talent Pool
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      label="Talent Pool Name"
                      value={newTalentPool.name}
                      onChange={(e) => setNewTalentPool({ ...newTalentPool, name: e.target.value })}
                      fullWidth
                      sx={{
                        '& .MuiInputBase-input': { color: '#f5f7fa' },
                        '& .MuiInputLabel-root': { color: '#b8c5d6' },
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                          '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.4)' },
                          '&.Mui-focused fieldset': { borderColor: '#eebbc3' },
                        }
                      }}
                    />
                    <TextField
                      label="Description"
                      value={newTalentPool.description}
                      onChange={(e) => setNewTalentPool({ ...newTalentPool, description: e.target.value })}
                      multiline
                      rows={3}
                      fullWidth
                      sx={{
                        '& .MuiInputBase-input': { color: '#f5f7fa' },
                        '& .MuiInputLabel-root': { color: '#b8c5d6' },
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                          '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.4)' },
                          '&.Mui-focused fieldset': { borderColor: '#eebbc3' },
                        }
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleCreateTalentPool}
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                      sx={{
                        backgroundColor: '#eebbc3',
                        color: '#1a1a2e',
                        fontWeight: 600,
                        '&:hover': { backgroundColor: '#d4a5a8' },
                        '&:disabled': { backgroundColor: 'rgba(238, 187, 195, 0.3)' }
                      }}
                    >
                      Create Talent Pool
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              {/* Existing Talent Pools */}
              <Typography variant="subtitle1" sx={{ color: '#f5f7fa', mb: 2 }}>
                Existing Talent Pools ({talentPools.length})
              </Typography>
              <List sx={{ 
                background: 'rgba(255, 255, 255, 0.05)', 
                borderRadius: 2, 
                border: '1px solid rgba(255, 255, 255, 0.1)' 
              }}>
                {talentPools.map((pool) => (
                  <ListItem key={pool._id} sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <ListItemText
                      primary={pool.name}
                      secondary={pool.description}
                      primaryTypographyProps={{ color: '#f5f7fa', fontWeight: 600 }}
                      secondaryTypographyProps={{ color: '#b8c5d6' }}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteTalentPool(pool._id)}
                        disabled={loading}
                        sx={{ color: '#f44336' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Skills Tab */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" sx={{ color: '#eebbc3', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CodeIcon />
                Manage Skills
              </Typography>

              {/* Create New Skill */}
              <Card sx={{ 
                mb: 3, 
                background: 'rgba(255, 255, 255, 0.05)', 
                border: '1px solid rgba(255, 255, 255, 0.1)' 
              }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ color: '#f5f7fa', mb: 2 }}>
                    Add New Skill
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                    <TextField
                      label="Skill Name"
                      value={newSkill.name}
                      onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                      sx={{
                        flex: 1,
                        '& .MuiInputBase-input': { color: '#f5f7fa' },
                        '& .MuiInputLabel-root': { color: '#b8c5d6' },
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                          '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.4)' },
                          '&.Mui-focused fieldset': { borderColor: '#eebbc3' },
                        }
                      }}
                    />
                    <FormControl sx={{ minWidth: 150 }}>
                      <InputLabel sx={{ color: '#b8c5d6' }}>Category</InputLabel>
                      <Select
                        value={newSkill.category}
                        onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                        sx={{
                          color: '#f5f7fa',
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(238, 187, 195, 0.4)' },
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
                    <Button
                      variant="contained"
                      onClick={handleCreateSkill}
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                      sx={{
                        backgroundColor: '#eebbc3',
                        color: '#1a1a2e',
                        fontWeight: 600,
                        '&:hover': { backgroundColor: '#d4a5a8' },
                        '&:disabled': { backgroundColor: 'rgba(238, 187, 195, 0.3)' }
                      }}
                    >
                      Add Skill
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              {/* Existing Skills */}
              <Typography variant="subtitle1" sx={{ color: '#f5f7fa', mb: 2 }}>
                Existing Skills ({skills.length})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {skills.map((skill) => (
                  <Chip
                    key={skill._id}
                    label={skill.name}
                    onDelete={() => handleDeleteSkill(skill._id)}
                    sx={{
                      backgroundColor: `${getCategoryColor(skill.category)}20`,
                      color: getCategoryColor(skill.category),
                      border: `1px solid ${getCategoryColor(skill.category)}40`,
                      '& .MuiChip-deleteIcon': { color: getCategoryColor(skill.category) }
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </div>
  );
};

export default OrganizationConfig;
