import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import JobList from '../components/JobList.jsx';
import CandidateList from '../components/CandidateList.jsx';
import AddJob from '../components/AddJob.jsx';
import AddCandidate from '../components/AddCandidate.jsx';
import AuthorizedJobs from '../components/AuthorizedJobs.jsx';
import Workflows from './Workflows.jsx';
import TalentPools from './TalentPools.jsx';
import axios from 'axios';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { Add as AddIcon, Work as WorkIcon, Person as PersonIcon } from '@mui/icons-material';

const Dashboard = ({ user, setUser, onLogout }) => {
  // Set initial view - all users see jobs by default
  const [view, setView] = useState('jobs');
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleAddJob = () => {
    setView('addJob');
    handleCloseMenu();
  };

  const handleAddCandidate = () => {
    setView('addCandidate');
    handleCloseMenu();
  };

  useEffect(() => {
    // Check if there's a view state from navigation
    if (location.state?.view) {
      setView(location.state.view);
    }
  }, [location.state]);

  useEffect(() => {
    if (view === 'candidates') {
      const fetchCandidates = async () => {
        try {
          setLoadingCandidates(true);
          const token = localStorage.getItem('jwt');
          const res = await axios.get('https://staffanchor-ats-v1.onrender.com/api/candidates', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCandidates(res.data);
        } catch (error) {
          console.error('Error fetching candidates:', error);
        } finally {
          setLoadingCandidates(false);
        }
      };
      fetchCandidates();
    }
  }, [view]);

  // Listen for workflow creation event from LinkedCandidates
  useEffect(() => {
    const handleCreateWorkflowEvent = () => {
      setView('workflows');
    };

    window.addEventListener('createWorkflowFromLinked', handleCreateWorkflowEvent);
    return () => {
      window.removeEventListener('createWorkflowFromLinked', handleCreateWorkflowEvent);
    };
  }, []);

  // Accent color for active tab in light mode
  const getTabStyle = (active) =>
    active
      ? { background: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)', color: '#ffffff', fontWeight: 700, border: '2px solid transparent', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }
      : { background: '#ffffff', color: '#475569', border: '2px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' };

  const handleSubordinatesTab = () => {
    navigate('/subordinates');
  };

  return (
    <div className="dashboard card" style={{
      maxWidth: '100%', 
      background: 'transparent', 
      boxShadow: 'none', 
      border: 'none', 
      padding: '0 20px'
    }}>
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
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <button className="button" style={getTabStyle(view==='jobs')} onClick={() => setView('jobs')}>Jobs</button>
          <button className="button" style={getTabStyle(view==='candidates')} onClick={() => setView('candidates')}>Candidates</button>
          <button className="button" style={getTabStyle(view==='workflows')} onClick={() => setView('workflows')}>Workflows</button>
          {user.accessLevel === 2 && <button className="button" style={getTabStyle(false)} onClick={handleSubordinatesTab}>Subordinates</button>}
          <button className="button" style={getTabStyle(view==='talentPools')} onClick={() => setView('talentPools')}>Talent Pools</button>
          
          {/* Add button with dropdown */}
          <IconButton
            onClick={handleOpenMenu}
            sx={{
              backgroundColor: view === 'addJob' || view === 'addCandidate' ? '#10b981' : '#ffffff',
              color: view === 'addJob' || view === 'addCandidate' ? '#ffffff' : '#475569',
              border: '2px solid',
              borderColor: view === 'addJob' || view === 'addCandidate' ? '#10b981' : '#e2e8f0',
              borderRadius: '8px',
              width: '40px',
              height: '40px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
              '&:hover': {
                backgroundColor: view === 'addJob' || view === 'addCandidate' ? '#059669' : '#f8fafc',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              }
            }}
          >
            <AddIcon />
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
            PaperProps={{
              sx: {
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 2,
                minWidth: '200px',
                mt: 1,
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
              }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem 
              onClick={handleAddJob}
              sx={{
                color: '#1e293b',
                py: 1.5,
                '&:hover': {
                  backgroundColor: 'rgba(37, 99, 235, 0.08)',
                }
              }}
            >
              <ListItemIcon>
                <WorkIcon sx={{ color: '#2563eb' }} />
              </ListItemIcon>
              <ListItemText>Add Job</ListItemText>
            </MenuItem>
            <MenuItem 
              onClick={handleAddCandidate}
              sx={{
                color: '#1e293b',
                py: 1.5,
                '&:hover': {
                  backgroundColor: 'rgba(139, 92, 246, 0.08)',
                }
              }}
            >
              <ListItemIcon>
                <PersonIcon sx={{ color: '#8b5cf6' }} />
              </ListItemIcon>
              <ListItemText>Add Candidate</ListItemText>
            </MenuItem>
          </Menu>
        </div>
      </div>
      <div>
        {view === 'jobs' && <JobList accessLevel={user.accessLevel} userId={user._id} />}
        {view === 'candidates' && <CandidateList candidates={candidates} accessLevel={user.accessLevel} loading={loadingCandidates} />}
        {view === 'addJob' && <AddJob user={user} />}
        {view === 'addCandidate' && <AddCandidate />}
        {view === 'workflows' && <Workflows user={user} />}
        {view === 'talentPools' && <TalentPools user={user} />}
        {user.accessLevel === 2 && view === 'subordinates' && <div>Subordinates View</div>}
      </div>
    </div>
  );
};

export default Dashboard;
