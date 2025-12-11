// Original Code
import React, { useEffect, useState } from "react";
import axios from "axios";
import JobDetails from "./JobDetails.jsx";
import JobFilterModal from "./JobFilterModal.jsx";
import { toast } from 'react-toastify';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Collapse,
  TextField,
  Box,
  Grid,
  Paper,
  Chip,
  Button,
  Tooltip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Menu,
  MenuItem,
  Select,
  FormControl,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Description as DescriptionIcon,
  Construction as ConstructionIcon,
  Sort as SortIcon,
} from "@mui/icons-material";
import API_URL from '../config/api';
import StatusChangeConfirmDialog from './StatusChangeConfirmDialog';

const JobList = ({ accessLevel, userId }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showOnlyAssigned, setShowOnlyAssigned] = useState(false);
  const [statusFilterAnchor, setStatusFilterAnchor] = useState(null);
  const [showFeatureDialog, setShowFeatureDialog] = useState(false);
  const [subordinates, setSubordinates] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc');
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [statusChangeConfirm, setStatusChangeConfirm] = useState({
    open: false,
    jobId: null,
    jobTitle: '',
    currentStatus: '',
    newStatus: ''
  });
  const [activeFilters, setActiveFilters] = useState({
    jobId: "",
    title: "",
    organization: "",
    country: "",
    state: "",
    city: "",
    industry: "",
    experience: [0, 20],
    ctcLow: "",
    ctcHigh: "",
    remote: null,
    status: "",
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('jwt');
        const res = await axios.get(`${API_URL}/api/jobs`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        //console.log('=== FETCHED JOBS ===');
        //console.log('Jobs from API:', res.data);
        setJobs(res.data);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    const fetchSubordinates = async () => {
      try {
        const token = localStorage.getItem('jwt');
        const res = await axios.get(`${API_URL}/api/auth/subordinates`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSubordinates(res.data);
      } catch (error) {
        console.error('Failed to fetch subordinates:', error);
      }
    };
    fetchSubordinates();
  }, []);

  useEffect(() => {
    const handleJobDeleted = (event) => {
      const { jobId } = event.detail;
      setJobs(prevJobs => prevJobs.filter(job => job._id !== jobId));
    };

    const handleJobUpdated = (event) => {
      const { jobId, updatedJob } = event.detail;
      setJobs(prevJobs => prevJobs.map(job => 
        job._id === jobId ? updatedJob : job
      ));
    };

    window.addEventListener('jobDeleted', handleJobDeleted);
    window.addEventListener('jobUpdated', handleJobUpdated);
    
    return () => {
      window.removeEventListener('jobDeleted', handleJobDeleted);
      window.removeEventListener('jobUpdated', handleJobUpdated);
    };
  }, []);

  const applyFilters = (filters) => {
    setActiveFilters(filters);
  };

  const clearFilters = () => {
    setActiveFilters({
      title: "",
      organization: "",
      country: "",
      state: "",
      city: "",
      industry: "",
      experience: [0, 20],
      ctcLow: "",
      ctcHigh: "",
      remote: null,
      status: "",
    });
  };

  const filteredJobs = jobs.filter((job) => {
    // Access level filter
    if (accessLevel === 1 && showOnlyAssigned) {
      if (!job.authorizedUsers || job.authorizedUsers.length === 0) {
        return false;
      }
      
      // Handle both populated objects and plain IDs
      const authorizedUserIds = job.authorizedUsers.map(user => {
        const id = typeof user === 'object' ? user._id : user;
        return id.toString();
      });
      const userIdString = userId.toString();
      
      if (!authorizedUserIds.includes(userIdString)) {
        return false;
      }
    }

    // Advanced filters
    if (
      activeFilters.jobId &&
      !job.jobId?.toLowerCase().includes(activeFilters.jobId.toLowerCase())
    ) {
      return false;
    }
    if (
      activeFilters.title &&
      !job.title.toLowerCase().includes(activeFilters.title.toLowerCase())
    ) {
      return false;
    }
    if (
      activeFilters.organization &&
      !job.organization
        .toLowerCase()
        .includes(activeFilters.organization.toLowerCase())
    ) {
      return false;
    }
    
    // Location filter - check if job has locations array with country/state/city
    if (activeFilters.country || activeFilters.state || activeFilters.city) {
      if (!job.locations || job.locations.length === 0) {
        // If no locations array, check legacy location field
        if (job.location) {
          const locationString = job.location.toLowerCase();
          if (activeFilters.country && !locationString.includes(activeFilters.country.toLowerCase())) return false;
          if (activeFilters.state && !locationString.includes(activeFilters.state.toLowerCase())) return false;
          if (activeFilters.city && !locationString.includes(activeFilters.city.toLowerCase())) return false;
        } else {
          return false;
        }
      } else {
        // Check if any location matches the filter
        const hasMatchingLocation = job.locations.some(loc => {
          if (activeFilters.country && loc.country?.toLowerCase() !== activeFilters.country.toLowerCase()) return false;
          if (activeFilters.state && loc.state?.toLowerCase() !== activeFilters.state.toLowerCase()) return false;
          if (activeFilters.city && loc.city?.toLowerCase() !== activeFilters.city.toLowerCase()) return false;
          return true;
        });
        if (!hasMatchingLocation) return false;
      }
    }
    
    if (activeFilters.industry && job.industry !== activeFilters.industry) {
      return false;
    }
    
    if (activeFilters.status && job.status !== activeFilters.status) {
      return false;
    }
    
    if (
      activeFilters.experience &&
      (job.experience < activeFilters.experience[0] ||
        job.experience > activeFilters.experience[1])
    ) {
      return false;
    }
    if (activeFilters.ctcLow && (job.ctcMin !== undefined || job.ctcMax !== undefined)) {
      const jobCtcMax = job.ctcMax ?? job.ctcMin;
      const filterCtcLow = parseFloat(activeFilters.ctcLow);
      if (!isNaN(jobCtcMax) && !isNaN(filterCtcLow) && jobCtcMax < filterCtcLow) {
        return false;
      }
    }
    if (activeFilters.ctcHigh && (job.ctcMin !== undefined || job.ctcMax !== undefined)) {
      const jobCtcMin = job.ctcMin ?? job.ctcMax;
      const filterCtcHigh = parseFloat(activeFilters.ctcHigh);
      if (!isNaN(jobCtcMin) && !isNaN(filterCtcHigh) && jobCtcMin > filterCtcHigh) {
        return false;
      }
    }
    if (activeFilters.remote !== null && job.remote !== activeFilters.remote) {
      return false;
    }

    return true;
  });

  //console.log('=== FILTERING RESULTS ===');
  //console.log('Total jobs:', jobs.length);
  //console.log('Filtered jobs:', filteredJobs.length);
  //console.log('Filtered jobs data:', filteredJobs);

  // Sort filtered jobs by date created
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0);
    const dateB = new Date(b.createdAt || 0);
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  const handleSortChange = (newSortOrder) => {
    setSortOrder(newSortOrder);
    setSortAnchorEl(null);
  };

  const handleExpandClick = (jobId) => {
    setExpandedJobId((prev) => (prev === jobId ? null : jobId));
  };

  const hasActiveFilters = Object.values(activeFilters).some(
    (value) =>
      value !== "" &&
      value !== null &&
      !(Array.isArray(value) && value[0] === 0 && value[1] === 20)
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return '#3b82f6';
      case 'In Progress': return '#f59e0b';
      case 'Halted': return '#ef4444';
      case 'Withdrawn': return '#6b7280';
      case 'Ongoing client process': return '#8b5cf6';
      case 'Completed': return '#10b981';
      default: return '#64748b';
    }
  };

  const getStatusBackgroundColor = (status) => {
    switch (status) {
      case 'New': return 'rgba(59, 130, 246, 0.12)';
      case 'In Progress': return 'rgba(245, 158, 11, 0.12)';
      case 'Halted': return 'rgba(239, 68, 68, 0.12)';
      case 'Withdrawn': return 'rgba(107, 116, 128, 0.12)';
      case 'Ongoing client process': return 'rgba(139, 92, 246, 0.12)';
      case 'Completed': return 'rgba(16, 185, 129, 0.12)';
      default: return 'transparent';
    }
  };

  const getAssignees = (authorizedUsers) => {
    if (!authorizedUsers || authorizedUsers.length === 0) {
      return [];
    }
    // Handle both populated objects and plain IDs
    const authorizedUserIds = authorizedUsers.map(user => {
      const id = typeof user === 'object' ? user._id : user;
      return id.toString();
    });
    return subordinates.filter(sub => authorizedUserIds.includes(sub._id.toString()));
  };

  const handleStatusChangeRequest = (jobId, newStatus, jobTitle, currentStatus) => {
    setStatusChangeConfirm({
      open: true,
      jobId,
      jobTitle,
      currentStatus,
      newStatus
    });
  };

  const handleStatusChangeConfirm = async () => {
    const { jobId, newStatus } = statusChangeConfirm;
    setStatusChangeConfirm({ open: false, jobId: null, jobTitle: '', currentStatus: '', newStatus: '' });
    
    try {
      const token = localStorage.getItem('jwt');
      
      // Check if job has an active workflow
      const workflowResponse = await axios.get(`${API_URL}/api/workflows/job/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const activeWorkflow = workflowResponse.data.find(w => w.status === 'Active');
      
      // If workflow exists, only allow "Ongoing client process" or "Completed"
      if (activeWorkflow) {
        const allowedStatuses = ['Ongoing client process', 'Completed'];
        if (!allowedStatuses.includes(newStatus)) {
          toast.error('Client side process already started');
          return;
        }
      }
      
      const response = await axios.put(
        `${API_URL}/api/jobs/${jobId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state with the response data from backend
      setJobs(prevJobs => prevJobs.map(job => 
        job._id === jobId ? { ...job, ...response.data } : job
      ));
      
      // Emit event for job details component
      window.dispatchEvent(new CustomEvent('jobUpdated', { 
        detail: { jobId, updatedJob: response.data } 
      }));
      
      toast.success('Status updated successfully!');
    } catch (error) {
      console.error('Error updating job status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleStatusFilterClick = (event) => {
    setStatusFilterAnchor(event.currentTarget);
  };

  const handleStatusFilterClose = () => {
    setStatusFilterAnchor(null);
  };

  const handleStatusFilterSelect = (status) => {
    setActiveFilters(prev => ({ ...prev, status }));
    handleStatusFilterClose();
  };

  return (
    <Box sx={{ height: "calc(100vh - 72px)", display: "flex", flexDirection: "column" }}>
      {/* Fixed Header */}
      <Paper
        elevation={3}
        sx={{
          position: "sticky",
          top: "72px",
          zIndex: 100,
          background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
          border: "1px solid rgba(0, 0, 0, 0.05)",
          borderRadius: 0,
          p: 3,
          color: "#1e293b",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Left side - Title */}
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b" }}>
            Job Listings
          </Typography>
          
          {/* Right side - Filter icon and other controls */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {accessLevel === 1 && (
              <Button
                variant={showOnlyAssigned ? "contained" : "outlined"}
                onClick={() => setShowOnlyAssigned(!showOnlyAssigned)}
                sx={{
                  backgroundColor: showOnlyAssigned ? "#8b5cf6" : "transparent",
                  color: showOnlyAssigned ? "#f8fafc" : "#8b5cf6",
                  borderColor: "#8b5cf6",
                  "&:hover": {
                    backgroundColor: showOnlyAssigned ? "#7c3aed" : "rgba(139, 92, 246, 0.08)",
                    borderColor: "#7c3aed",
                  },
                  fontWeight: 600,
                  textTransform: "none",
                }}
              >
                View assigned jobs
              </Button>
            )}
            {hasActiveFilters && (
              <Chip
                label={`${filteredJobs.length} results`}
                sx={{
                  backgroundColor: "rgba(37, 99, 235, 0.12)",
                  color: "#2563eb",
                  fontWeight: 600,
                }}
              />
            )}
            <Tooltip title="Filter Jobs">
              <IconButton
                onClick={() => setShowFilterModal(true)}
                sx={{
                  backgroundColor: hasActiveFilters ? "rgba(37, 99, 235, 0.15)" : "rgba(139, 92, 246, 0.12)",
                  color: hasActiveFilters ? "#2563eb" : "#8b5cf6",
                  border: hasActiveFilters ? "2px solid rgba(37, 99, 235, 0.3)" : "2px solid rgba(139, 92, 246, 0.3)",
                  padding: "10px",
                  "&:hover": {
                    backgroundColor: hasActiveFilters ? "rgba(37, 99, 235, 0.25)" : "rgba(139, 92, 246, 0.2)",
                    border: hasActiveFilters ? "2px solid rgba(37, 99, 235, 0.5)" : "2px solid rgba(139, 92, 246, 0.5)",
                    transform: "scale(1.05)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <FilterIcon sx={{ fontSize: 28 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Job List */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          background: "var(--color-bg-dark)",
          p: 2,
        }}
      >

          {/* Loading Screen */}
          {loading ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                minHeight: "400px",
                color: "#64748b",
              }}
            >
              <CircularProgress
                size={60}
                sx={{
                  color: "#8b5cf6",
                  mb: 3,
                }}
              />
              <Typography variant="h6" sx={{ mb: 1, color: "#1e293b" }}>
                Loading Jobs...
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                Please wait while we fetch the job listings
              </Typography>
            </Box>
          ) : (
            <TableContainer
              component={Paper}
              sx={{
                background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
                border: "1px solid rgba(0, 0, 0, 0.05)",
                borderRadius: 3,
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
              }}
            >
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      background: "rgba(139, 92, 246, 0.08)",
                      borderBottom: "2px solid rgba(238, 187, 195, 0.3)",
                    }}
                  >
                    <TableCell
                      sx={{
                        color: "#8b5cf6",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        py: 2,
                      }}
                    >
                      Job ID
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#8b5cf6",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        py: 2,
                      }}
                    >
                      Job Title
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#8b5cf6",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                      }}
                    >
                      Company
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#8b5cf6",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                      }}
                    >
                      Assignee
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        color: "#8b5cf6",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        cursor: "pointer",
                        userSelect: "none",
                        '&:hover': {
                          backgroundColor: "rgba(139, 92, 246, 0.08)",
                        }
                      }}
                      onClick={handleStatusFilterClick}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        Status
                        <ArrowDropDownIcon sx={{ fontSize: 20 }} />
                        {activeFilters.status && (
                          <Chip
                            label="filtered"
                            size="small"
                            sx={{
                              height: 16,
                              fontSize: '0.65rem',
                              backgroundColor: 'rgba(37, 99, 235, 0.2)',
                              color: '#2563eb',
                              ml: 0.5
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        color: "#8b5cf6",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                      }}
                    >
                      Internal Notes
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        color: "#8b5cf6",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <span>Actions</span>
                        <Tooltip title={`Sort by Date Created (${sortOrder === 'desc' ? 'Newest First' : 'Oldest First'})`}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSortAnchorEl(e.currentTarget);
                            }}
                            sx={{
                              background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                              color: '#ffffff',
                              padding: '6px',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
                                transform: 'scale(1.05)',
                              },
                              transition: 'all 0.2s ease',
                              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
                            }}
                          >
                            <SortIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedJobs.length === 0 ? (
                    <TableRow>
                      <TableCell 
                        colSpan={7} 
                        sx={{ 
                          textAlign: 'center', 
                          py: 6,
                          color: '#64748b'
                        }}
                      >
                        <Typography variant="h6" sx={{ mb: 1, color: '#1e293b' }}>
                          No jobs found
                        </Typography>
                        <Typography variant="body2">
                          Try adjusting your filters or search criteria
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedJobs.map((job) => (
                    <React.Fragment key={job._id}>
                      <TableRow
                        onClick={() => handleExpandClick(job._id)}
                        sx={{
                          borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
                          transition: "all 0.3s ease",
                          cursor: "pointer",
                          backgroundColor: getStatusBackgroundColor(job.status || 'New'),
                          "&:hover": {
                            background: "rgba(238, 187, 195, 0.12)",
                          },
                        }}
                      >
                        <TableCell sx={{ py: 2 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#8b5cf6",
                              fontWeight: 600,
                              fontSize: "0.85rem",
                              fontFamily: "monospace",
                            }}
                          >
                            {job.jobId || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              color: "#1e293b",
                              fontWeight: 600,
                              fontSize: "1rem",
                            }}
                          >
                            {job.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#64748b",
                            }}
                          >
                            {job.organization}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const assignees = getAssignees(job.authorizedUsers);
                            if (assignees.length === 0) {
                              return (
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: "#94a3b8",
                                    fontStyle: "italic",
                                  }}
                                >
                                  No assignee
                                </Typography>
                              );
                            }
                            return (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {assignees.map((assignee) => (
                                  <Tooltip
                                    key={assignee._id}
                                    title={
                                      <Box sx={{ p: 0.5 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                          {assignee.fullName}
                                        </Typography>
                                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                                          {assignee.email}
                                        </Typography>
                                        <Typography variant="caption" sx={{ display: 'block' }}>
                                          {assignee.phone}
                                        </Typography>
                                      </Box>
                                    }
                                    arrow
                                    placement="top"
                                  >
                                    <Chip
                                      label={assignee.fullName}
                                      size="small"
                                      sx={{
                                        backgroundColor: 'rgba(139, 92, 246, 0.12)',
                                        color: '#8b5cf6',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        '&:hover': {
                                          backgroundColor: 'rgba(139, 92, 246, 0.2)',
                                        }
                                      }}
                                    />
                                  </Tooltip>
                                ))}
                              </Box>
                            );
                          })()}
                        </TableCell>
                        <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                          <FormControl size="small" sx={{ minWidth: 140 }}>
                            <Select
                              value={job.status || 'New'}
                              onChange={(e) => handleStatusChangeRequest(job._id, e.target.value, job.title, job.status || 'New')}
                              sx={{
                                backgroundColor: `${getStatusColor(job.status || 'New')}20`,
                                color: getStatusColor(job.status || 'New'),
                                fontWeight: 600,
                                borderRadius: '6px',
                                border: 'none',
                                '& .MuiOutlinedInput-notchedOutline': {
                                  border: 'none',
                                },
                                '&:hover': {
                                  backgroundColor: `${getStatusColor(job.status || 'New')}30`,
                                },
                                '& .MuiSelect-select': {
                                  padding: '4px 8px',
                                  fontSize: '0.875rem',
                                }
                              }}
                            >
                              <MenuItem value="New" disabled={job.status === 'Ongoing client process'}>New</MenuItem>
                              <MenuItem value="In Progress" disabled={job.status === 'Ongoing client process'}>In Progress</MenuItem>
                              <MenuItem value="Halted" disabled={job.status === 'Ongoing client process'}>Halted</MenuItem>
                              <MenuItem value="Withdrawn" disabled={job.status === 'Ongoing client process'}>Withdrawn</MenuItem>
                              <MenuItem value="Ongoing client process">Ongoing client process</MenuItem>
                              <MenuItem value="Completed">Completed</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                          <Tooltip title="View Internal Notes">
                            <IconButton
                              onClick={() => setShowFeatureDialog(true)}
                              sx={{
                                color: "#8b5cf6",
                                backgroundColor: "rgba(139, 92, 246, 0.1)",
                                "&:hover": {
                                  backgroundColor: "rgba(139, 92, 246, 0.2)",
                                  transform: "scale(1.1)",
                                },
                              }}
                            >
                              <DescriptionIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                          <Tooltip title={expandedJobId === job._id ? "Hide Details" : "View Details"}>
                            <IconButton
                              onClick={() => handleExpandClick(job._id)}
                              sx={{
                                color: "#2563eb",
                                backgroundColor: "rgba(79, 140, 255, 0.1)",
                                "&:hover": {
                                  backgroundColor: "rgba(37, 99, 235, 0.12)",
                                  transform: "scale(1.1)",
                                },
                              }}
                            >
                              {expandedJobId === job._id ? (
                                <ExpandLessIcon />
                              ) : (
                                <ExpandMoreIcon />
                              )}
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Job Details Row */}
                      {expandedJobId === job._id && (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            sx={{
                              py: 0,
                              px: 0,
                              borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
                              backgroundColor: "rgba(248, 250, 252, 0.5)",
                            }}
                          >
                            <Collapse
                              in={expandedJobId === job._id}
                              timeout="auto"
                              unmountOnExit
                            >
                              <Box sx={{ p: 3, background: "rgba(255, 255, 255, 0.02)" }}>
                                <JobDetails
                                  job={job}
                                  expanded={expandedJobId === job._id}
                                  onExpandClick={() => handleExpandClick(job._id)}
                                  accessLevel={accessLevel}
                                  userId={userId}
                                />
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  )))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {/* Filter Modal */}
        <JobFilterModal
          open={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          filters={activeFilters}
          onApplyFilters={applyFilters}
          onClearFilters={clearFilters}
        />

        {/* Sort Menu */}
        <Menu
          anchorEl={sortAnchorEl}
          open={Boolean(sortAnchorEl)}
          onClose={() => setSortAnchorEl(null)}
          PaperProps={{
            sx: {
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
            }
          }}
        >
          <MenuItem
            onClick={() => handleSortChange('desc')}
            selected={sortOrder === 'desc'}
            sx={{
              color: '#1e293b',
              '&.Mui-selected': {
                backgroundColor: 'rgba(139, 92, 246, 0.08)',
              }
            }}
          >
            Newest First
          </MenuItem>
          <MenuItem
            onClick={() => handleSortChange('asc')}
            selected={sortOrder === 'asc'}
            sx={{
              color: '#1e293b',
              '&.Mui-selected': {
                backgroundColor: 'rgba(139, 92, 246, 0.08)',
              }
            }}
          >
            Oldest First
          </MenuItem>
        </Menu>

        {/* Status Filter Menu */}
        <Menu
          anchorEl={statusFilterAnchor}
          open={Boolean(statusFilterAnchor)}
          onClose={handleStatusFilterClose}
          PaperProps={{
            sx: {
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 2,
              minWidth: '180px',
              mt: 1,
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
            }
          }}
        >
          <MenuItem 
            onClick={() => handleStatusFilterSelect('')}
            sx={{
              color: '#1e293b',
              fontWeight: activeFilters.status === '' ? 700 : 400,
              backgroundColor: activeFilters.status === '' ? 'rgba(139, 92, 246, 0.08)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(139, 92, 246, 0.12)',
              }
            }}
          >
            All Statuses
          </MenuItem>
          <MenuItem 
            onClick={() => handleStatusFilterSelect('New')}
            sx={{
              color: '#3b82f6',
              fontWeight: activeFilters.status === 'New' ? 700 : 400,
              backgroundColor: activeFilters.status === 'New' ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
              }
            }}
          >
            New
          </MenuItem>
          <MenuItem 
            onClick={() => handleStatusFilterSelect('In Progress')}
            sx={{
              color: '#f59e0b',
              fontWeight: activeFilters.status === 'In Progress' ? 700 : 400,
              backgroundColor: activeFilters.status === 'In Progress' ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
              }
            }}
          >
            In Progress
          </MenuItem>
          <MenuItem 
            onClick={() => handleStatusFilterSelect('Halted')}
            sx={{
              color: '#ef4444',
              fontWeight: activeFilters.status === 'Halted' ? 700 : 400,
              backgroundColor: activeFilters.status === 'Halted' ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
              }
            }}
          >
            Halted
          </MenuItem>
          <MenuItem 
            onClick={() => handleStatusFilterSelect('Withdrawn')}
            sx={{
              color: '#6b7280',
              fontWeight: activeFilters.status === 'Withdrawn' ? 700 : 400,
              backgroundColor: activeFilters.status === 'Withdrawn' ? 'rgba(107, 116, 128, 0.08)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(107, 116, 128, 0.12)',
              }
            }}
          >
            Withdrawn
          </MenuItem>
          <MenuItem 
            onClick={() => handleStatusFilterSelect('Completed')}
            sx={{
              color: '#10b981',
              fontWeight: activeFilters.status === 'Completed' ? 700 : 400,
              backgroundColor: activeFilters.status === 'Completed' ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
              }
            }}
          >
            Completed
          </MenuItem>
        </Menu>

        {/* Feature Under Development Dialog */}
        <Dialog
          open={showFeatureDialog}
          onClose={() => setShowFeatureDialog(false)}
          maxWidth="xs"
          PaperProps={{
            sx: {
              background: '#ffffff',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
            }
          }}
        >
          <DialogContent sx={{ textAlign: 'center', py: 4, px: 3 }}>
            <ConstructionIcon sx={{ fontSize: 64, color: '#f59e0b', mb: 2 }} />
            <Typography variant="body1" sx={{ color: '#1e293b', fontWeight: 500 }}>
              This feature is currently under development
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button
              onClick={() => setShowFeatureDialog(false)}
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)',
                color: '#fff',
                fontWeight: 600,
                textTransform: 'none',
                px: 3,
                '&:hover': {
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
                }
              }}
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>

        {/* Status Change Confirmation Dialog */}
        <StatusChangeConfirmDialog
          open={statusChangeConfirm.open}
          onClose={() => setStatusChangeConfirm({ open: false, jobId: null, jobTitle: '', currentStatus: '', newStatus: '' })}
          onConfirm={handleStatusChangeConfirm}
          title="Confirm Job Status Change"
          currentStatus={statusChangeConfirm.currentStatus}
          newStatus={statusChangeConfirm.newStatus}
          itemName={statusChangeConfirm.jobTitle}
          itemType="job"
        />
      </Box>
  );
};

export default JobList;
