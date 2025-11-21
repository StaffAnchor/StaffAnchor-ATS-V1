import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import JobList from '../components/JobList.jsx';
import CandidateList from '../components/CandidateList.jsx';
import AddJob from '../components/AddJob.jsx';
import AddCandidate from '../components/AddCandidate.jsx';
import Workflows from './Workflows.jsx';
import TalentPools from './TalentPools.jsx';
import axios from 'axios';
import API_URL from '../config/api';

const Dashboard = ({ user, setUser, onLogout, view, setView }) => {
  // View is now managed by App.jsx and passed through Header
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if there's a view state from navigation
    if (location.state?.view && setView) {
      setView(location.state.view);
    }
  }, [location.state, setView]);

  useEffect(() => {
    if (view === 'candidates') {
      const fetchCandidates = async () => {
        try {
          setLoadingCandidates(true);
          const token = localStorage.getItem('jwt');
          const res = await axios.get(`${API_URL}/api/candidates`, {
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
      if (setView) {
        setView('workflows');
      }
    };

    window.addEventListener('createWorkflowFromLinked', handleCreateWorkflowEvent);
    return () => {
      window.removeEventListener('createWorkflowFromLinked', handleCreateWorkflowEvent);
    };
  }, [setView]);

  // Listen for candidate deletion event
  useEffect(() => {
    const handleCandidateDeleted = (event) => {
      const { candidateId } = event.detail;
      setCandidates(prevCandidates => 
        prevCandidates.filter(candidate => candidate._id !== candidateId)
      );
    };

    window.addEventListener('candidateDeleted', handleCandidateDeleted);
    return () => {
      window.removeEventListener('candidateDeleted', handleCandidateDeleted);
    };
  }, []);

  // Listen for candidate addition event
  useEffect(() => {
    const handleCandidateAdded = (event) => {
      const { candidate } = event.detail;
      setCandidates(prevCandidates => [candidate, ...prevCandidates]);
    };

    window.addEventListener('candidateAdded', handleCandidateAdded);
    return () => {
      window.removeEventListener('candidateAdded', handleCandidateAdded);
    };
  }, []);

  // Listen for candidate update event (e.g., resume upload/deletion)
  useEffect(() => {
    const handleCandidateUpdated = async (event) => {
      const { candidateId } = event.detail;
      // Refetch the specific candidate to get updated data
      try {
        const token = localStorage.getItem('jwt');
        const response = await axios.get(`${API_URL}/api/candidates/${candidateId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCandidates(prevCandidates => 
          prevCandidates.map(c => c._id === candidateId ? response.data : c)
        );
      } catch (error) {
        console.error('Error fetching updated candidate:', error);
      }
    };

    window.addEventListener('candidateUpdated', handleCandidateUpdated);
    return () => {
      window.removeEventListener('candidateUpdated', handleCandidateUpdated);
    };
  }, []);

  return (
    <div className="dashboard card" style={{
      maxWidth: '100%', 
      background: 'transparent', 
      boxShadow: 'none', 
      border: 'none', 
      padding: '0 20px'
    }}>
      {/* Navigation is now in the Header component */}
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
