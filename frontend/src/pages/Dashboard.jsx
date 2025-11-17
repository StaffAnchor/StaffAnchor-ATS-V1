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

  // Accent color for active tab in dark mode
  const getTabStyle = (active) =>
    active
      ? { background: 'var(--color-accent)', color: '#232946', fontWeight: 700, border: '2px solid var(--color-accent)' }
      : { background: 'transparent', color: '#f5f7fa', border: '2px solid #444' };

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
              backgroundColor: view === 'addJob' || view === 'addCandidate' ? 'var(--color-accent)' : 'transparent',
              color: view === 'addJob' || view === 'addCandidate' ? '#232946' : '#f5f7fa',
              border: '2px solid',
              borderColor: view === 'addJob' || view === 'addCandidate' ? 'var(--color-accent)' : '#444',
              borderRadius: '4px',
              width: '40px',
              height: '40px',
              '&:hover': {
                backgroundColor: view === 'addJob' || view === 'addCandidate' ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.1)',
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
                background: 'linear-gradient(135deg, #1a1a2e 0%, #232946 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 1,
                minWidth: '200px',
                mt: 1
              }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem 
              onClick={handleAddJob}
              sx={{
                color: '#f5f7fa',
                py: 1.5,
                '&:hover': {
                  backgroundColor: 'rgba(238, 187, 195, 0.15)',
                }
              }}
            >
              <ListItemIcon>
                <WorkIcon sx={{ color: '#eebbc3' }} />
              </ListItemIcon>
              <ListItemText>Add Job</ListItemText>
            </MenuItem>
            <MenuItem 
              onClick={handleAddCandidate}
              sx={{
                color: '#f5f7fa',
                py: 1.5,
                '&:hover': {
                  backgroundColor: 'rgba(79, 140, 255, 0.15)',
                }
              }}
            >
              <ListItemIcon>
                <PersonIcon sx={{ color: '#4f8cff' }} />
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
