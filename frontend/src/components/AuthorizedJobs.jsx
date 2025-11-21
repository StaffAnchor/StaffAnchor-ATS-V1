import React, { useEffect, useState } from 'react';
import axios from 'axios';
import JobDetails from './JobDetails.jsx';
import { Box, Typography } from '@mui/material';
import API_URL from '../config/api';

const AuthorizedJobs = ({ userId }) => {
  const [jobs, setJobs] = useState([]);
  const [expandedJobId, setExpandedJobId] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('jwt');
        const res = await axios.get(`${API_URL}/api/jobs`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setJobs(
          res.data.filter(
            j => Array.isArray(j.authorizedUsers) && j.authorizedUsers.map(String).includes(String(userId))
          )
        );
      } catch (error) {
        console.error('Failed to fetch authorized jobs:', error);
        setJobs([]);
      }
    };
    fetchJobs();
  }, [userId]);

  const handleExpandClick = (jobId) => {
    setExpandedJobId(prev => (prev === jobId ? null : jobId));
  };

  return (
    <Box sx={{padding: 2, background: '#ffffff', borderRadius: 2, border: '1px solid #e2e8f0', color: '#1e293b'}}>
      <Typography variant="h4" sx={{fontWeight: 700, mb: 2, color: '#90caf9'}}>Authorized Jobs</Typography>
      {jobs.map(job => (
        <JobDetails 
          key={job._id}
          job={job} 
          userId={userId} 
          accessLevel={1}
          expanded={expandedJobId === job._id}
          onExpandClick={() => handleExpandClick(job._id)}
        />
      ))}
    </Box>
  );
};

export default AuthorizedJobs;
