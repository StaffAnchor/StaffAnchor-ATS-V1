import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import JobList from '../components/JobList.jsx';
import CandidateList from '../components/CandidateList.jsx';
import AddJob from '../components/AddJob.jsx';
import AddCandidate from '../components/AddCandidate.jsx';
import Workflows from './WorkflowsSimple.jsx';
import TalentPools from './TalentPools.jsx';
import axios from 'axios';
import API_URL from '../config/api';

const Dashboard = ({ user, setUser, onLogout, view, setView }) => {
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCandidates: 0,
    limit: 20,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Server-side filters for expertise
  const [serverFilters, setServerFilters] = useState({
    domain: '',
    expertiseTalentPools: [],
    expertiseSkills: []
  });
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleSortChange = (newSortOrder) => {
    setSortOrder(newSortOrder);
    setCurrentPage(1);
  };

  // Handler for applying filters - called from CandidateList
  const handleApplyServerFilters = (filters) => {
    const newServerFilters = {
      domain: filters.domain || '',
      expertiseTalentPools: filters.expertiseTalentPools || [],
      expertiseSkills: filters.expertiseSkills || []
    };
    setServerFilters(newServerFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handler for clearing filters
  const handleClearServerFilters = () => {
    setServerFilters({
      domain: '',
      expertiseTalentPools: [],
      expertiseSkills: []
    });
    setCurrentPage(1);
  };

  useEffect(() => {
    if (location.state?.view && setView) {
      setView(location.state.view);
    }
  }, [location.state, setView]);

  // Fetch candidates with server-side filters
  useEffect(() => {
    if (view === 'candidates') {
      const fetchCandidates = async () => {
        try {
          setLoadingCandidates(true);
          const token = localStorage.getItem('jwt');
          
          // Build params
          const params = {
            page: currentPage,
            limit: 20,
            sortBy: '_id',
            sortOrder: sortOrder
          };
          
          // Add expertise filters if present
          if (serverFilters.domain) {
            params.domain = serverFilters.domain;
          }
          if (serverFilters.expertiseTalentPools && serverFilters.expertiseTalentPools.length > 0) {
            params.talentPools = serverFilters.expertiseTalentPools.join(',');
          }
          if (serverFilters.expertiseSkills && serverFilters.expertiseSkills.length > 0) {
            params.expertiseSkills = serverFilters.expertiseSkills.join(',');
          }
          
          const res = await axios.get(`${API_URL}/api/candidates`, {
            headers: { Authorization: `Bearer ${token}` },
            params
          });
          setCandidates(res.data.candidates || []);
          setPagination(res.data.pagination || {});
        } catch (error) {
          console.error('Error fetching candidates:', error);
        } finally {
          setLoadingCandidates(false);
        }
      };
      fetchCandidates();
    }
  }, [view, currentPage, sortOrder, serverFilters]);

  // Listen for workflow creation event
  useEffect(() => {
    const handleCreateWorkflowEvent = () => {
      if (setView) {
        setView('workflows');
      }
    };
    window.addEventListener('createWorkflowFromLinked', handleCreateWorkflowEvent);
    return () => window.removeEventListener('createWorkflowFromLinked', handleCreateWorkflowEvent);
  }, [setView]);

  // Listen for candidate deletion event
  useEffect(() => {
    const handleCandidateDeleted = (event) => {
      const { candidateId } = event.detail;
      setCandidates(prev => prev.filter(c => c._id !== candidateId));
    };
    window.addEventListener('candidateDeleted', handleCandidateDeleted);
    return () => window.removeEventListener('candidateDeleted', handleCandidateDeleted);
  }, []);

  // Listen for candidate addition event
  useEffect(() => {
    const handleCandidateAdded = (event) => {
      const { candidate } = event.detail;
      setCandidates(prev => [candidate, ...prev]);
    };
    window.addEventListener('candidateAdded', handleCandidateAdded);
    return () => window.removeEventListener('candidateAdded', handleCandidateAdded);
  }, []);

  // Listen for candidate update event
  useEffect(() => {
    const handleCandidateUpdated = async (event) => {
      const { candidateId } = event.detail;
      try {
        const token = localStorage.getItem('jwt');
        const response = await axios.get(`${API_URL}/api/candidates/${candidateId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCandidates(prev => prev.map(c => c._id === candidateId ? response.data : c));
      } catch (error) {
        console.error('Error fetching updated candidate:', error);
      }
    };
    window.addEventListener('candidateUpdated', handleCandidateUpdated);
    return () => window.removeEventListener('candidateUpdated', handleCandidateUpdated);
  }, []);

  return (
    <div className="dashboard card" style={{
      maxWidth: '100%', 
      background: 'transparent', 
      boxShadow: 'none', 
      border: 'none', 
      padding: '0 20px'
    }}>
      <div>
        {view === 'jobs' && <JobList accessLevel={user.accessLevel} userId={user._id} />}
        {view === 'candidates' && (
          <CandidateList 
            candidates={candidates} 
            accessLevel={user.accessLevel} 
            loading={loadingCandidates}
            pagination={pagination}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            onApplyServerFilters={handleApplyServerFilters}
            onClearServerFilters={handleClearServerFilters}
            serverFilters={serverFilters}
          />
        )}
        {view === 'addJob' && <AddJob user={user} />}
        {view === 'addCandidate' && <AddCandidate key={location.state?.preSelectedJob?._id || 'default'} />}
        {view === 'workflows' && <Workflows user={user} />}
        {view === 'talentPools' && <TalentPools user={user} />}
        {user.accessLevel === 2 && view === 'subordinates' && <div>Subordinates View</div>}
      </div>
    </div>
  );
};

export default Dashboard;
