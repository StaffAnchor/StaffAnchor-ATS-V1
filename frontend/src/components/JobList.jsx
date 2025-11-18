// Original Code
import React, { useEffect, useState } from "react";
import axios from "axios";
import JobDetails from "./JobDetails.jsx";
import JobFilter from "./JobFilter.jsx";
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
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";

const JobList = ({ accessLevel, userId }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [filter, setFilter] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [showOnlyAssigned, setShowOnlyAssigned] = useState(false); // New state for toggle
  const [activeFilters, setActiveFilters] = useState({
    title: "",
    organization: "",
    location: "",
    industry: "",
    experience: [0, 20],
    ctcLow: "",
    ctcHigh: "",
    remote: null,
    recruiterName: "",
    recruiterEmail: "",
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('jwt');
        const res = await axios.get("https://staffanchor-ats-v1.onrender.com/api/jobs", {
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
    const handleToggleFilters = () => {
      setShowFilters(prev => !prev);
    };

    const handleJobDeleted = (event) => {
      const { jobId } = event.detail;
      //console.log('Job deleted event received:', jobId);
      // Remove the deleted job from the list
      setJobs(prevJobs => prevJobs.filter(job => job._id !== jobId));
    };

    const handleJobUpdated = (event) => {
      const { jobId, updatedJob } = event.detail;
      //console.log('Job updated event received:', jobId, updatedJob);
      // Update the job in the list with fresh data from backend
      setJobs(prevJobs => prevJobs.map(job => 
        job._id === jobId ? updatedJob : job
      ));
    };

    window.addEventListener('toggleJobFilters', handleToggleFilters);
    window.addEventListener('jobDeleted', handleJobDeleted);
    window.addEventListener('jobUpdated', handleJobUpdated);
    
    return () => {
      window.removeEventListener('toggleJobFilters', handleToggleFilters);
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
      location: "",
      industry: "",
      experience: [0, 20],
      ctcLow: "",
      ctcHigh: "",
      remote: null,
      recruiterName: "",
      recruiterEmail: "",
    });
  };

  const filteredJobs = jobs.filter((job) => {
    //console.log('=== JOB FILTERING DEBUG ===');
    //console.log('Job:', job);
    //console.log('Access Level:', accessLevel);
    //console.log('User ID:', userId);
    //console.log('Show Only Assigned:', showOnlyAssigned);
    //console.log('Job authorizedUsers:', job.authorizedUsers);
    
    // Access level filter - Now both admin and subordinate can see all jobs by default
    // But subordinates can toggle to see only assigned jobs
    if (accessLevel === 1 && showOnlyAssigned) {
      // Subordinate with "Assigned Jobs Only" toggle enabled
      //console.log('Subordinate user - filtering for assigned jobs only');
      
      if (!job.authorizedUsers || job.authorizedUsers.length === 0) {
        //console.log('Job has no authorized users - filtering out');
        return false;
      }
      
      // Convert both to strings for comparison
      const authorizedUserIds = job.authorizedUsers.map(id => id.toString());
      const userIdString = userId.toString();
      
      //console.log('Authorized user IDs (strings):', authorizedUserIds);
      //console.log('Current user ID (string):', userIdString);
      //console.log('Is user authorized:', authorizedUserIds.includes(userIdString));
      
      if (!authorizedUserIds.includes(userIdString)) {
        //console.log('User not authorized for this job - filtering out');
        return false;
      }
    }

    // Basic search filter
    const basicSearch = filter.toLowerCase();
    const matchesBasicSearch =
      job.title.toLowerCase().includes(basicSearch) ||
      job.organization.toLowerCase().includes(basicSearch);

    if (!matchesBasicSearch) return false;

    // Advanced filters
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
    if (
      activeFilters.location &&
      !job.location.toLowerCase().includes(activeFilters.location.toLowerCase())
    ) {
      return false;
    }
    if (activeFilters.industry && job.industry !== activeFilters.industry) {
      return false;
    }
    if (
      activeFilters.experience &&
      (job.experience < activeFilters.experience[0] ||
        job.experience > activeFilters.experience[1])
    ) {
      return false;
    }
    if (activeFilters.ctcLow && job.ctc) {
      const jobCtc = parseInt(job.ctc.replace(/[^\d]/g, ""));
      const filterCtcLow = parseInt(activeFilters.ctcLow);
      if (!isNaN(jobCtc) && !isNaN(filterCtcLow) && jobCtc < filterCtcLow) {
        return false;
      }
    }
    if (activeFilters.ctcHigh && job.ctc) {
      const jobCtc = parseInt(job.ctc.replace(/[^\d]/g, ""));
      const filterCtcHigh = parseInt(activeFilters.ctcHigh);
      if (!isNaN(jobCtc) && !isNaN(filterCtcHigh) && jobCtc > filterCtcHigh) {
        return false;
      }
    }
    if (activeFilters.remote !== null && job.remote !== activeFilters.remote) {
      return false;
    }
    if (
      activeFilters.recruiterName &&
      !job.recruiterName
        .toLowerCase()
        .includes(activeFilters.recruiterName.toLowerCase())
    ) {
      return false;
    }
    if (
      activeFilters.recruiterEmail &&
      !job.recruiterEmail
        .toLowerCase()
        .includes(activeFilters.recruiterEmail.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  //console.log('=== FILTERING RESULTS ===');
  //console.log('Total jobs:', jobs.length);
  //console.log('Filtered jobs:', filteredJobs.length);
  //console.log('Filtered jobs data:', filteredJobs);

  const handleExpandClick = (jobId) => {
    setExpandedJobId((prev) => (prev === jobId ? null : jobId));
  };

  const hasActiveFilters = Object.values(activeFilters).some(
    (value) =>
      value !== "" &&
      value !== null &&
      !(Array.isArray(value) && value[0] === 0 && value[1] === 20)
  );

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Paper
        elevation={2}
        sx={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #232946 100%)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 0,
          p: 2,
          color: "#f5f7fa",
          zIndex: 10,
          position: "relative",
          width: showFilters ? "calc(100vw - 400px - 32px)" : "calc(100vw - 32px)",
          marginLeft: showFilters ? "400px" : 0,
          transition: "all 0.3s ease-in-out",
          boxSizing: "border-box",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#f5f7fa" }}>
            Job Listings
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {accessLevel === 1 && (
              <Button
                variant={showOnlyAssigned ? "contained" : "outlined"}
                onClick={() => setShowOnlyAssigned(!showOnlyAssigned)}
                sx={{
                  backgroundColor: showOnlyAssigned ? "rgba(238, 187, 195, 0.9)" : "transparent",
                  color: showOnlyAssigned ? "#1a1a2e" : "#eebbc3",
                  borderColor: "#eebbc3",
                  "&:hover": {
                    backgroundColor: showOnlyAssigned ? "rgba(238, 187, 195, 1)" : "rgba(238, 187, 195, 0.1)",
                    borderColor: "#eebbc3",
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
                  backgroundColor: "rgba(79, 140, 255, 0.2)",
                  color: "#4f8cff",
                }}
              />
            )}
          </Box>
        </Box>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search jobs by title or organization..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: "#b8c5d6", mr: 1 }} />,
          }}
          sx={{
            width: "100%",
            maxWidth: "100%",
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
              "&:hover fieldset": { borderColor: "rgba(238, 187, 195, 0.5)" },
              "&.Mui-focused fieldset": { borderColor: "#eebbc3" },
            },
            "& .MuiInputLabel-root": { color: "#b8c5d6" },
            "& .MuiInputBase-input": { color: "#f5f7fa" },
          }}
        />
      </Paper>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
          position: "relative",
          marginLeft: showFilters ? "400px" : 0,
          transition: "margin-left 0.3s ease-in-out",
        }}
      >
        {/* Filter Sidebar - Sliding panel from left */}
        <Box
          sx={{
            position: "fixed",
            left: showFilters ? 0 : -400,
            top: "190px", // Account for Dashboard header + JobList header
            width: 400,
            height: "90vh",
            background: "linear-gradient(135deg, #1a1a2e 0%, #232946 100%)",
            borderRight: "1px solid rgba(255, 255, 255, 0.1)",
            overflowY: "auto",
            p: 0.5,
            zIndex: 5,
            transition: "left 0.3s ease-in-out",
          }}
        >
          <JobFilter
            filters={activeFilters}
            setFilters={setActiveFilters}
            onApplyFilters={applyFilters}
            onClearFilters={clearFilters}
          />
        </Box>

        {/* Job List - Adjusted margin when filters are shown */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 2,
            background: "var(--color-bg-dark)",
            width: "100%",
            maxWidth: "100vw",
            boxSizing: "border-box",
          }}
        >
          {/* Floating Filter Button - Shows when filters are collapsed */}
          {!showFilters && (
            <Box
              sx={{
                position: "fixed",
                left: 20,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
              }}
            >
              <Tooltip title="Show Filters" placement="right">
                <IconButton
                  onClick={() => setShowFilters(true)}
                  sx={{
                    backgroundColor: "rgba(238, 187, 195, 0.9)",
                    color: "#1a1a2e",
                    width: 48,
                    height: 48,
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                    "&:hover": {
                      backgroundColor: "rgba(238, 187, 195, 1)",
                      transform: "scale(1.1)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <FilterIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}

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
                color: "#b8c5d6",
              }}
            >
              <CircularProgress
                size={60}
                sx={{
                  color: "#eebbc3",
                  mb: 3,
                }}
              />
              <Typography variant="h6" sx={{ mb: 1, color: "#f5f7fa" }}>
                Loading Jobs...
              </Typography>
              <Typography variant="body2" sx={{ color: "#b8c5d6" }}>
                Please wait while we fetch the job listings
              </Typography>
            </Box>
          ) : filteredJobs.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "#b8c5d6",
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                No jobs found
              </Typography>
              <Typography variant="body2" sx={{ textAlign: "center" }}>
                Try adjusting your search criteria or filters
              </Typography>
            </Box>
          ) : (
            <TableContainer
              component={Paper}
              sx={{
                background: "linear-gradient(135deg, #1a1a2e 0%, #232946 100%)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: 3,
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
              }}
            >
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      background: "rgba(238, 187, 195, 0.1)",
                      borderBottom: "2px solid rgba(238, 187, 195, 0.3)",
                    }}
                  >
                    <TableCell
                      sx={{
                        color: "#eebbc3",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        py: 2,
                      }}
                    >
                      Job Title
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#eebbc3",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                      }}
                    >
                      Company
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#eebbc3",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                      }}
                    >
                      Location
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        color: "#eebbc3",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                      }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredJobs.map((job) => (
                    <React.Fragment key={job._id}>
                      <TableRow
                        onClick={() => handleExpandClick(job._id)}
                        sx={{
                          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                          transition: "all 0.3s ease",
                          cursor: "pointer",
                          "&:hover": {
                            background: "rgba(238, 187, 195, 0.05)",
                          },
                        }}
                      >
                        <TableCell sx={{ py: 2 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              color: "#f5f7fa",
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
                              color: "#b8c5d6",
                            }}
                          >
                            {job.organization}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#b8c5d6",
                            }}
                          >
                            {job.location}
                          </Typography>
                        </TableCell>
                        <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                          <Tooltip title={expandedJobId === job._id ? "Hide Details" : "View Details"}>
                            <IconButton
                              onClick={() => handleExpandClick(job._id)}
                              sx={{
                                color: "#4f8cff",
                                backgroundColor: "rgba(79, 140, 255, 0.1)",
                                "&:hover": {
                                  backgroundColor: "rgba(79, 140, 255, 0.2)",
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
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          sx={{
                            py: 0,
                            borderBottom:
                              expandedJobId === job._id
                                ? "1px solid rgba(255, 255, 255, 0.1)"
                                : "none",
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
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default JobList;
