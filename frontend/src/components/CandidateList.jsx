// Original Code
import React, { useState, useEffect } from "react";
import CandidateDetails from "./CandidateDetails.jsx";
import CandidateFilter from "./CandidateFilter.jsx";
import ResultsLimitPopup from "./ResultsLimitPopup.jsx";
import DeleteConfirmationPopup from "./DeleteConfirmationPopup.jsx";
import TalentPoolSelectionModal from "./TalentPoolSelectionModal.jsx";
import CommentsModal from "./CommentsModal.jsx";
import { toast } from 'react-toastify';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
  Typography,
  Box,
  TextField,
  Chip,
  Button,
  Tooltip,
  Grid,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Link as LinkIcon,
  Comment as CommentIcon,
} from "@mui/icons-material";
import axios from "axios";

const CandidateList = ({ candidates, accessLevel, loading = false }) => {
  const [expandedCandidateId, setExpandedCandidateId] = useState(null);
  const [expandedJobsCandidateId, setExpandedJobsCandidateId] = useState(null);
  const [candidateJobs, setCandidateJobs] = useState({});
  const [loadingJobs, setLoadingJobs] = useState({});
  const [filter, setFilter] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [editingCandidateId, setEditingCandidateId] = useState(null);
  const [expandedSkills, setExpandedSkills] = useState({});
  const [activeFilters, setActiveFilters] = useState({
    name: "",
    email: "",
    phone: "",
    skills: [],
    experience: [0, 20],
    ctcLow: "",
    ctcHigh: "",
    education: "",
    certifications: [],
    linkedin: "",
    x: "",
    company: "",
    position: "",
    talentPools: []
  });
  const [showResultsPopup, setShowResultsPopup] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isDeleting, setIsDeleting] = useState({});
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState(null);
  const [showTalentPoolModal, setShowTalentPoolModal] = useState(false);
  const [selectedCandidateForPool, setSelectedCandidateForPool] = useState(null);
  const [talentPools, setTalentPools] = useState([]);
  
  // Multi-select and job linking state
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [showLinkJobModal, setShowLinkJobModal] = useState(false);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [linkingCandidates, setLinkingCandidates] = useState(false);

  // Comments state
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedCandidateForComments, setSelectedCandidateForComments] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Get current user info
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
    }
  }, []);

  useEffect(() => {
    const handleToggleFilters = () => {
      setShowFilters(prev => !prev);
    };

    window.addEventListener('toggleCandidateFilters', handleToggleFilters);
    
    return () => {
      window.removeEventListener('toggleCandidateFilters', handleToggleFilters);
    };
  }, []);

  // Fetch talent pools for filtering
  useEffect(() => {
    const fetchTalentPools = async () => {
      try {
        const token = localStorage.getItem('jwt');
        const response = await axios.get('https://staffanchor-ats-v1.onrender.com/api/talent-pools', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTalentPools(response.data);
      } catch (error) {
        console.error('Error fetching talent pools:', error);
      }
    };
    
    if (accessLevel === 2) {
      fetchTalentPools();
    }
  }, [accessLevel]);

  const handleFilterChange = (field, value) => {
    setActiveFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const applyFilters = (filters) => {
    setActiveFilters(filters);
  };

  const clearFilters = () => {
    setActiveFilters({
      name: "",
      email: "",
      phone: "",
      skills: [],
      experience: [0, 20],
      ctcLow: "",
      ctcHigh: "",
      education: "",
      certifications: [],
      linkedin: "",
      x: "",
      company: "",
      position: "",
      talentPools: []
    });
  };

  const getCTC = (c) => {
    if (
      !c.experience ||
      !Array.isArray(c.experience) ||
      c.experience.length === 0
    )
      return "Not Mentioned";
    const ctc = c.experience[0]?.ctc;
    return ctc ? ctc : "Not Mentioned";
  };

  const handleViewCandidate = (candidate) => {
    // Navigate to candidate details page or open modal
    //console.log('Viewing candidate:', candidate);
    // You can implement navigation or modal opening here
  };

  const handleFindSuitableJobs = (candidate) => {
    setSelectedCandidate(candidate);
    setShowResultsPopup(true);
  };

  const handleFindJobsWithLimit = async (limit) => {
    if (!selectedCandidate) return;
    
    try {
      setLoadingJobs(prev => ({ ...prev, [selectedCandidate._id]: true }));
      const token = localStorage.getItem('jwt');
      const response = await axios.get(`https://staffanchor-ats-v1.onrender.com/api/candidates/${selectedCandidate._id}/suitable-jobs?limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.suitableJobs && response.data.suitableJobs.length > 0) {
        // Limit the results to the requested number
        const limitedJobs = response.data.suitableJobs.slice(0, limit);
        // Store the jobs for this candidate
        setCandidateJobs(prev => ({
          ...prev,
          [selectedCandidate._id]: limitedJobs
        }));
        // Expand the jobs section for this candidate
        setExpandedJobsCandidateId(selectedCandidate._id);
        // Close candidate details if open
        setExpandedCandidateId(null);
      } else {
        // Show alert for no jobs found
        alert('No suitable jobs found for this candidate');
      }
    } catch (error) {
      console.error('Error finding suitable jobs:', error);
      alert('Failed to find suitable jobs');
    } finally {
      setLoadingJobs(prev => ({ ...prev, [selectedCandidate._id]: false }));
    }
  };

  const handleDeleteCandidate = (candidate) => {
    setCandidateToDelete(candidate);
    setShowDeletePopup(true);
  };

  const confirmDeleteCandidate = async () => {
    if (!candidateToDelete) return;
    
    try {
      setIsDeleting(prev => ({ ...prev, [candidateToDelete._id]: true }));
      const token = localStorage.getItem('jwt');
      await axios.delete(`https://staffanchor-ats-v1.onrender.com/api/candidates/${candidateToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Candidate deleted successfully!');
      
      // Remove the candidate from the local state instead of refreshing the page
      // This will be handled by the parent component that manages the candidates list
      setShowDeletePopup(false);
      setCandidateToDelete(null);
      
      // You can emit an event to notify parent component to refresh the list
      window.dispatchEvent(new CustomEvent('candidateDeleted', { 
        detail: { candidateId: candidateToDelete._id } 
      }));
      
    } catch (error) {
      console.error('Error deleting candidate:', error);
      toast.error('Failed to delete candidate');
    } finally {
      setIsDeleting(prev => ({ ...prev, [candidateToDelete._id]: false }));
    }
  };

  const cancelDelete = () => {
    setShowDeletePopup(false);
    setCandidateToDelete(null);
  };

  const handleEditCandidate = (candidate) => {
    // Set this candidate as the one being edited
    setEditingCandidateId(candidate._id);
    // Expand the candidate details section
    setExpandedCandidateId(candidate._id);
    // Close the jobs section if it's open
    setExpandedJobsCandidateId(null);
  };

  const handleAddToTalentPool = (candidate) => {
    setSelectedCandidateForPool(candidate);
    setShowTalentPoolModal(true);
  };

  const handleTalentPoolModalClose = (success) => {
    setShowTalentPoolModal(false);
    setSelectedCandidateForPool(null);
    // You can add logic here to refresh candidate list if needed
  };

  // Multi-select handlers
  const handleSelectCandidate = (candidateId) => {
    setSelectedCandidates(prev => {
      if (prev.includes(candidateId)) {
        return prev.filter(id => id !== candidateId);
      } else {
        return [...prev, candidateId];
      }
    });
  };

  const handleSelectAllCandidates = (event) => {
    if (event.target.checked) {
      setSelectedCandidates(filteredCandidates.map(c => c._id));
    } else {
      setSelectedCandidates([]);
    }
  };

  const handleOpenLinkJobModal = async () => {
    if (selectedCandidates.length === 0) {
      toast.warning('Please select at least one candidate');
      return;
    }

    try {
      const token = localStorage.getItem('jwt');
      const response = await axios.get('https://staffanchor-ats-v1.onrender.com/api/jobs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableJobs(response.data);
      setShowLinkJobModal(true);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to fetch jobs');
    }
  };

  const handleLinkCandidatesToJob = async () => {
    if (!selectedJob) {
      toast.warning('Please select a job');
      return;
    }

    try {
      setLinkingCandidates(true);
      const token = localStorage.getItem('jwt');
      const response = await axios.post('https://staffanchor-ats-v1.onrender.com/api/candidate-job-links/link', {
        candidateIds: selectedCandidates,
        jobId: selectedJob,
        source: 'added-by-recruiter'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(`Successfully linked ${response.data.links.length} candidate(s) to job`);
      setShowLinkJobModal(false);
      setSelectedJob(null);
      setSelectedCandidates([]);
    } catch (error) {
      console.error('Error linking candidates to job:', error);
      toast.error(error.response?.data?.error || 'Failed to link candidates to job');
    } finally {
      setLinkingCandidates(false);
    }
  };

  const getYears = (c) => {
    if (!c.experience || !Array.isArray(c.experience)) return "Not Mentioned";
    let years = 0;
    c.experience.forEach((e) => {
      const start = parseInt(e.start);
      const end = parseInt(e.end);
      if (!isNaN(start) && !isNaN(end)) {
        years += end - start;
      }
    });
    return years > 0 ? years : "Not Mentioned";
  };

  const getCurrentCompany = (c) => {
    if (
      !c.experience ||
      !Array.isArray(c.experience) ||
      c.experience.length === 0
    )
      return "Not Mentioned";
    return c.experience[0]?.company || "Not Mentioned";
  };

  const getCurrentPosition = (c) => {
    if (
      !c.experience ||
      !Array.isArray(c.experience) ||
      c.experience.length === 0
    )
      return "Not Mentioned";
    return c.experience[0]?.position || "Not Mentioned";
  };

  const filteredCandidates = candidates.filter((c) => {
    // Basic search filter
    const basicSearch = filter.toLowerCase();
    const matchesBasicSearch =
      (c.name || "").toLowerCase().includes(basicSearch) ||
      (Array.isArray(c.skills)
        ? c.skills.join(",").toLowerCase()
        : ""
      ).includes(basicSearch);

    if (!matchesBasicSearch) return false;

    // Advanced filters
    if (
      activeFilters.name &&
      !c.name.toLowerCase().includes(activeFilters.name.toLowerCase())
    ) {
      return false;
    }
    if (
      activeFilters.email &&
      !c.email.toLowerCase().includes(activeFilters.email.toLowerCase())
    ) {
      return false;
    }
    if (
      activeFilters.phone &&
      !c.phone.toLowerCase().includes(activeFilters.phone.toLowerCase())
    ) {
      return false;
    }
    if (activeFilters.skills.length > 0) {
      const candidateSkills = Array.isArray(c.skills) ? c.skills : [];
      const hasRequiredSkills = activeFilters.skills.some((skill) =>
        candidateSkills.some((candidateSkill) =>
          candidateSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      if (!hasRequiredSkills) return false;
    }
    if (
      activeFilters.company &&
      !getCurrentCompany(c)
        .toLowerCase()
        .includes(activeFilters.company.toLowerCase())
    ) {
      return false;
    }
    if (
      activeFilters.position &&
      !getCurrentPosition(c)
        .toLowerCase()
        .includes(activeFilters.position.toLowerCase())
    ) {
      return false;
    }
    if (activeFilters.experience) {
      const years = getYears(c);
      if (
        years !== "Not Mentioned" &&
        (years < activeFilters.experience[0] ||
          years > activeFilters.experience[1])
      ) {
        return false;
      }
    }
    if (activeFilters.ctcLow && getCTC(c) !== "Not Mentioned") {
      const candidateCtc = parseInt(getCTC(c).replace(/[^\d]/g, ""));
      const filterCtcLow = parseInt(activeFilters.ctcLow);
      if (
        !isNaN(candidateCtc) &&
        !isNaN(filterCtcLow) &&
        candidateCtc < filterCtcLow
      ) {
        return false;
      }
    }
    if (activeFilters.ctcHigh && getCTC(c) !== "Not Mentioned") {
      const candidateCtc = parseInt(getCTC(c).replace(/[^\d]/g, ""));
      const filterCtcHigh = parseInt(activeFilters.ctcHigh);
      if (
        !isNaN(candidateCtc) &&
        !isNaN(filterCtcHigh) &&
        candidateCtc > filterCtcHigh
      ) {
        return false;
      }
    }
    if (activeFilters.education && c.education) {
      const hasEducation = c.education.some((edu) =>
        edu.course.toLowerCase().includes(activeFilters.education.toLowerCase())
      );
      if (!hasEducation) return false;
    }
    if (
      activeFilters.linkedin &&
      !c.linkedin.toLowerCase().includes(activeFilters.linkedin.toLowerCase())
    ) {
      return false;
    }
    if (
      activeFilters.x &&
      !c.x.toLowerCase().includes(activeFilters.x.toLowerCase())
    ) {
      return false;
    }
    
    // Filter by talent pools
    if (activeFilters.talentPools && activeFilters.talentPools.length > 0) {
      const candidatePools = c.talentPools || [];
      const candidatePoolIds = candidatePools.map(pool => 
        typeof pool === 'string' ? pool : pool._id
      );
      
      // Check if candidate is in any of the selected pools
      const isInSelectedPool = activeFilters.talentPools.some(poolId =>
        candidatePoolIds.includes(poolId)
      );
      
      if (!isInSelectedPool) return false;
    }

    return true;
  });

  const handleExpandCandidate = (candidateId) => {
    if (expandedCandidateId === candidateId) {
      // Collapsing - reset edit mode
      setExpandedCandidateId(null);
      setEditingCandidateId(null);
    } else {
      // Expanding - clear edit mode to ensure it opens in view mode
      setExpandedCandidateId(candidateId);
      setEditingCandidateId(null);
      // Close jobs section when expanding candidate details
      setExpandedJobsCandidateId(null);
    }
  };

  const handleExpandJobs = (candidateId) => {
    setExpandedJobsCandidateId(expandedJobsCandidateId === candidateId ? null : candidateId);
    // Close candidate details when expanding jobs
    if (expandedJobsCandidateId !== candidateId) {
      setExpandedCandidateId(null);
    }
  };

  const hasActiveFilters = Object.values(activeFilters).some(
    (value) =>
      value !== "" &&
      value !== null &&
      !(Array.isArray(value) && value.length === 0) &&
      !(Array.isArray(value) && value[0] === 0 && value[1] === 20)
  );

  // Extract all unique skills for filter options
  const allSkills = [
    ...new Set(
      candidates.flatMap((c) => (Array.isArray(c.skills) ? c.skills : []))
    ),
  ].sort();

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Paper
        elevation={2}
        sx={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #232946 100%)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 1,
          p: 3,
          color: "#f5f7fa",
          zIndex: 10,
          position: "relative",
          width: showFilters ? "calc(100% - 400px)" : "100%",
          marginLeft: showFilters ? "400px" : 0,
          transition: "all 0.3s ease-in-out",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#f5f7fa", mb: 1 }}>
              Candidate Database
            </Typography>
            <Typography variant="body2" sx={{ color: "#b8c5d6", fontSize: "0.9rem" }}>
              Browse and manage candidate profiles
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {hasActiveFilters && (
              <Chip
                label={`${filteredCandidates.length} results`}
                sx={{
                  backgroundColor: "rgba(79, 140, 255, 0.2)",
                  color: "#4f8cff",
                  fontWeight: 600,
                  borderRadius: 1,
                }}
              />
            )}
            {selectedCandidates.length > 0 && (
              <>
                <Chip
                  label={`${selectedCandidates.length} selected`}
                  sx={{
                    backgroundColor: "rgba(238, 187, 195, 0.2)",
                    color: "#eebbc3",
                    fontWeight: 600,
                    borderRadius: 1,
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={<LinkIcon />}
                  onClick={handleOpenLinkJobModal}
                  sx={{
                    backgroundColor: "#eebbc3",
                    color: "#1a1a2e",
                    fontWeight: 600,
                    borderRadius: 1,
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "#d4a5ad",
                    },
                  }}
                >
                  Link to Job
                </Button>
              </>
            )}
          </Box>
        </Box>

        {/* Search bar container with proper width and alignment */}
        <Box
          sx={{
            width: "100%",
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search candidates by name, email, or skills..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: "#b8c5d6", mr: 1 }} />,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "rgba(255, 255, 255, 0.2)" },
                "&:hover fieldset": { borderColor: "rgba(238, 187, 195, 0.4)" },
                "&.Mui-focused fieldset": { borderColor: "#eebbc3" },
                borderRadius: 1,
              },
              "& .MuiInputLabel-root": { color: "#b8c5d6" },
              "& .MuiInputBase-input": { color: "#f5f7fa" },
            }}
          />
        </Box>
      </Paper>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Filter Sidebar - Fixed position with proper top offset */}
        <Box
          sx={{
            position: "fixed",
            left: showFilters ? 0 : -400,
            top: "200px", // Increased top offset to avoid overlap with header
            width: 400,
            height: "calc(100vh - 200px)", // Adjusted height accordingly
            background: "linear-gradient(135deg, #1a1a2e 0%, #232946 100%)",
            borderRight: "1px solid rgba(255, 255, 255, 0.08)",
            overflowY: "auto",
            p: 3,
            zIndex: 5,
            transition: "left 0.3s ease-in-out",
            boxShadow: "4px 0 20px rgba(0, 0, 0, 0.15)",
          }}
        >
          <CandidateFilter
            filters={activeFilters}
            setFilters={setActiveFilters}
            onApplyFilters={applyFilters}
            onClearFilters={clearFilters}
            allSkills={allSkills}
            talentPools={talentPools}
          />
        </Box>

        {/* Candidate List - Adjusted margin when filters are shown */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 2,
            background: "var(--color-bg-dark)",
            marginLeft: showFilters ? "400px" : 0,
            transition: "margin-left 0.3s ease-in-out",
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
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
                    borderRadius: 1,
                    "&:hover": {
                      backgroundColor: "rgba(238, 187, 195, 1)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 25px rgba(0, 0, 0, 0.35)",
                    },
                    transition: "all 0.3s ease",
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
                Loading Candidates...
              </Typography>
              <Typography variant="body2" sx={{ color: "#b8c5d6" }}>
                Please wait while we fetch the candidate data
              </Typography>
            </Box>
          ) : filteredCandidates.length === 0 ? (
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
              <Typography variant="h6" sx={{ mb: 1 }}>
                No candidates found
              </Typography>
              <Typography variant="body2">
                Try adjusting your search criteria or filters
              </Typography>
            </Box>
          ) : (
            <TableContainer
              component={Paper}
              sx={{
                background: "linear-gradient(135deg, #232946 0%, #1a1a2e 100%)",
                borderRadius: 1,
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                overflowX: "auto",
                width: "100%",
              }}
            >
              <Table sx={{ tableLayout: "auto" }}>
                <TableHead>
                  <TableRow
                    sx={{
                      background:
                        "linear-gradient(135deg, #1a1a2e 0%, #232946 100%)",
                      borderBottom: "2px solid rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    <TableCell
                      sx={{
                        color: "#4f8cff",
                        fontWeight: 700,
                        borderBottom: "2px solid rgba(255, 255, 255, 0.08)",
                        fontSize: "1rem",
                        padding: "18px 12px",
                        width: "60px",
                      }}
                    >
                      <Checkbox
                        checked={selectedCandidates.length === filteredCandidates.length && filteredCandidates.length > 0}
                        indeterminate={selectedCandidates.length > 0 && selectedCandidates.length < filteredCandidates.length}
                        onChange={handleSelectAllCandidates}
                        sx={{
                          color: "#4f8cff",
                          '&.Mui-checked': {
                            color: "#eebbc3",
                          },
                          '&.MuiCheckbox-indeterminate': {
                            color: "#eebbc3",
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#4f8cff",
                        fontWeight: 700,
                        borderBottom: "2px solid rgba(255, 255, 255, 0.08)",
                        fontSize: "1rem",
                        padding: "18px 12px",
                        width: "40px",
                      }}
                    />
                    <TableCell
                      sx={{
                        color: "#4f8cff",
                        fontWeight: 700,
                        borderBottom: "2px solid rgba(255, 255, 255, 0.08)",
                        fontSize: "1rem",
                        padding: "18px 12px",
                        minWidth: "180px",
                      }}
                    >
                      Name
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#4f8cff",
                        fontWeight: 700,
                        borderBottom: "2px solid rgba(255, 255, 255, 0.08)",
                        fontSize: "1rem",
                        padding: "18px 12px",
                        minWidth: "160px",
                      }}
                    >
                      Contact
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#4f8cff",
                        fontWeight: 700,
                        borderBottom: "2px solid rgba(255, 255, 255, 0.08)",
                        fontSize: "1rem",
                        padding: "18px 12px",
                        minWidth: "300px",
                        position: "sticky",
                        right: 0,
                        background: "linear-gradient(135deg, #1a1a2e 0%, #232946 100%)",
                        zIndex: 2,
                        boxShadow: "-4px 0 8px rgba(0, 0, 0, 0.2)",
                      }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCandidates.map((candidate, index) => [
                    <TableRow
                      key={`${candidate._id}-main`}
                      onClick={() => handleExpandCandidate(candidate._id)}
                      sx={{
                        background: "rgba(255, 255, 255, 0.02)",
                        transition: "all 0.2s ease",
                        cursor: "pointer",
                        "&:hover": {
                          background: "rgba(255, 255, 255, 0.05)",
                        },
                        "&:nth-of-type(even)": {
                          background: "rgba(255, 255, 255, 0.03)",
                          "&:hover": {
                            background: "rgba(255, 255, 255, 0.06)",
                          },
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                          padding: "16px 12px",
                          textAlign: "center",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={selectedCandidates.includes(candidate._id)}
                          onChange={() => handleSelectCandidate(candidate._id)}
                          sx={{
                            color: "#4f8cff",
                            '&.Mui-checked': {
                              color: "#eebbc3",
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                          padding: "16px 12px",
                          textAlign: "center",
                        }}
                      >
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1,
                            background: "linear-gradient(135deg, #4f8cff 0%, #3d7be8 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#ffffff",
                            fontWeight: 700,
                            fontSize: "0.875rem",
                          }}
                        >
                          {index + 1}
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{
                          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                          padding: "16px 12px",
                        }}
                      >
                        <Box>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 600,
                              color: "#f5f7fa",
                              mb: 0.5,
                            }}
                          >
                            {candidate.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#b8c5d6",
                              fontSize: "0.875rem",
                            }}
                          >
                            {candidate.organization || "Not specified"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{
                          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                          padding: "16px 12px",
                        }}
                      >
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#f5f7fa",
                              mb: 0.5,
                            }}
                          >
                            {candidate.email}
                          </Typography>
                          {candidate.phone && (
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#b8c5d6",
                                fontSize: "0.875rem",
                              }}
                            >
                              {candidate.phone}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{
                          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                          padding: "16px 12px",
                          position: "sticky",
                          right: 0,
                          background: index % 2 === 0 ? "rgba(255, 255, 255, 0.02)" : "rgba(255, 255, 255, 0.03)",
                          zIndex: 1,
                          boxShadow: "-4px 0 8px rgba(0, 0, 0, 0.2)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "nowrap", alignItems: "center" }}>
                          <Tooltip title="View Details">
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExpandCandidate(candidate._id);
                              }}
                              sx={{
                                borderColor: "rgba(255, 255, 255, 0.3)",
                                color: "#b8c5d6",
                                fontSize: "0.75rem",
                                padding: "4px 8px",
                                minWidth: "auto",
                                borderRadius: 1,
                                "&:hover": {
                                  borderColor: "#eebbc3",
                                  color: "#eebbc3",
                                },
                              }}
                            >
                              {expandedCandidateId === candidate._id ? 'Hide' : 'View'}
                            </Button>
                          </Tooltip>
                          {accessLevel === 2 && (
                            <Tooltip title="Edit Candidate">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditCandidate(candidate);
                                }}
                                sx={{
                                  color: "#eebbc3",
                                  border: "1px solid #eebbc3",
                                  padding: "4px",
                                  borderRadius: 1,
                                  "&:hover": {
                                    backgroundColor: "rgba(238, 187, 195, 0.1)",
                                  },
                                }}
                              >
                                <EditIcon sx={{ fontSize: "1rem" }} />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Find Suitable Jobs">
                            <Button
                              variant="contained"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFindSuitableJobs(candidate);
                              }}
                              disabled={loadingJobs[candidate._id]}
                              sx={{
                                backgroundColor: "#4f8cff",
                                color: "#ffffff",
                                fontSize: "0.75rem",
                                padding: "4px 8px",
                                minWidth: "auto",
                                borderRadius: 1,
                                "&:hover": {
                                  backgroundColor: "#3d7be8",
                                },
                                "&:disabled": {
                                  backgroundColor: "#666",
                                  color: "#ccc"
                                }
                              }}
                            >
                              {loadingJobs[candidate._id] ? 'Finding...' : 'Jobs'}
                            </Button>
                          </Tooltip>
                          <Tooltip title="Comments">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCandidateForComments(candidate);
                                setShowCommentsModal(true);
                              }}
                              sx={{
                                color: "#4f8cff",
                                border: "1px solid #4f8cff",
                                padding: "4px",
                                borderRadius: 1,
                                "&:hover": {
                                  backgroundColor: "rgba(79, 140, 255, 0.1)",
                                },
                              }}
                            >
                              <CommentIcon sx={{ fontSize: "1rem" }} />
                            </IconButton>
                          </Tooltip>
                          {accessLevel === 2 && (
                            <Tooltip title="Add to Talent Pool">
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToTalentPool(candidate);
                                }}
                                sx={{
                                  borderColor: "rgba(238, 187, 195, 0.5)",
                                  color: "#eebbc3",
                                  fontSize: "0.75rem",
                                  padding: "4px 8px",
                                  minWidth: "auto",
                                  borderRadius: 1,
                                  "&:hover": {
                                    borderColor: "#eebbc3",
                                    backgroundColor: "rgba(238, 187, 195, 0.1)",
                                  }
                                }}
                              >
                                Pool
                              </Button>
                            </Tooltip>
                          )}
                          {accessLevel === 2 && (
                            <Tooltip title="Delete Candidate">
                              <Button
                                variant="outlined"
                                size="small"
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCandidate(candidate);
                                }}
                                disabled={isDeleting[candidate._id]}
                                sx={{
                                  borderColor: "rgba(244, 67, 54, 0.5)",
                                  color: "#f44336",
                                  fontSize: "0.75rem",
                                  padding: "4px 8px",
                                  minWidth: "auto",
                                  borderRadius: 1,
                                  "&:hover": {
                                    borderColor: "#f44336",
                                    backgroundColor: "rgba(244, 67, 54, 0.1)",
                                  },
                                  "&:disabled": {
                                    borderColor: "rgba(244, 67, 54, 0.3)",
                                    color: "rgba(244, 67, 54, 0.5)",
                                  }
                                }}
                              >
                                {isDeleting[candidate._id] ? '...' : 'Delete'}
                              </Button>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>,
                    
                    // Expanded Candidate Details
                    expandedCandidateId === candidate._id && (
                      <TableRow key={`${candidate._id}-expanded`}>
                        <TableCell colSpan={5} sx={{ padding: 0, border: 'none' }}>
                          <CandidateDetails 
                            candidate={candidate} 
                            accessLevel={accessLevel}
                            initialEditMode={editingCandidateId === candidate._id}
                          />
                        </TableCell>
                      </TableRow>
                    ),
                    
                    // Suitable Jobs Section
                    expandedJobsCandidateId === candidate._id && (
                      <TableRow key={`${candidate._id}-jobs`}>
                        <TableCell colSpan={5} sx={{ padding: 0, border: 'none' }}>
                          <Box sx={{ 
                            p: 2, 
                            background: 'rgba(255, 255, 255, 0.02)', 
                            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                          }}>
                            <Typography variant="subtitle2" sx={{color: '#90caf9', fontWeight: 600, mb: 2}}>Suitable Jobs Found</Typography>
                            
                            {candidateJobs[candidate._id] && candidateJobs[candidate._id].length > 0 ? (
                              <Box>
                                {candidateJobs[candidate._id].map((job, idx) => (
                                  <Box key={idx} sx={{ 
                                    p: 2, 
                                    background: 'rgba(255, 255, 255, 0.03)', 
                                    borderRadius: 1,
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    mb: 2
                                  }}>
                                    {/* Job Title */}
                                    <Typography variant="subtitle2" sx={{color: '#90caf9', fontWeight: 600, mb: 1}}>Job {idx + 1}</Typography>
                                    
                                    {/* Job Title */}
                                    <Typography variant="body2" sx={{color: '#f5f7fa', mb: 1}}><strong>Job Title:</strong> {job.title}</Typography>
                                    
                                    {/* Organization */}
                                    {job.organization && (
                                      <Typography variant="body2" sx={{color: '#f5f7fa', mb: 1}}><strong>Organization:</strong> {job.organization}</Typography>
                                    )}
                                    
                                    {/* Location */}
                                    {job.location && (
                                      <Typography variant="body2" sx={{color: '#f5f7fa', mb: 1}}><strong>Location:</strong> {job.location}</Typography>
                                    )}
                                    
                                    {/* Experience */}
                                    {job.experience && (
                                      <Typography variant="body2" sx={{color: '#f5f7fa', mb: 1}}><strong>Years of Experience:</strong> {job.experience}</Typography>
                                    )}
                                    
                                    {/* Remote Work */}
                                    <Typography variant="body2" sx={{color: '#f5f7fa', mb: 1}}><strong>Remote Work:</strong> {job.remote ? 'Available' : 'Not Available'}</Typography>
                                    
                                    {/* Industry */}
                                    {job.industry && (
                                      <Typography variant="body2" sx={{color: '#f5f7fa', mb: 1}}><strong>Industry:</strong> {job.industry}</Typography>
                                    )}
                                    
                                    {/* CTC */}
                                    {job.ctc && (
                                      <Typography variant="body2" sx={{color: '#f5f7fa', mb: 1}}><strong>CTC:</strong> ₹ {job.ctc}</Typography>
                                    )}
                                    
                                    {/* Job Description */}
                                    {job.description && (
                                      <>
                                        <Typography variant="body2" sx={{color: '#f5f7fa', mb: 1}}><strong>Job Description:</strong></Typography>
                                        <Typography variant="body2" sx={{color: '#b8c5d6', fontSize: '0.875rem', pl: 2, fontStyle: 'italic'}}>{job.description}</Typography>
                                      </>
                                    )}
                                    
                                    {/* Recruiter Details */}
                                    {(job.recruiterName || job.recruiterEmail) && (
                                      <>
                                        <Typography variant="body2" sx={{color: '#f5f7fa', mb: 1, mt: 1}}><strong>Recruiter Details:</strong></Typography>
                                        {job.recruiterName && (
                                          <Typography variant="body2" sx={{color: '#b8c5d6', fontSize: '0.875rem', pl: 2, mb: 0.5}}><strong>Name:</strong> {job.recruiterName}</Typography>
                                        )}
                                        {job.recruiterEmail && (
                                          <Typography variant="body2" sx={{color: '#b8c5d6', fontSize: '0.875rem', pl: 2}}><strong>Email:</strong> {job.recruiterEmail}</Typography>
                                        )}
                                      </>
                                    )}
                                  </Box>
                                ))}
                              </Box>
                            ) : (
                              <Typography variant="body2" sx={{color: '#b8c5d6', fontStyle: 'italic'}}>No suitable jobs found for this candidate.</Typography>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    )
                  ].filter(Boolean))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>
      
      {/* Results Limit Popup */}
      <ResultsLimitPopup
        open={showResultsPopup}
        onClose={() => setShowResultsPopup(false)}
        onConfirm={handleFindJobsWithLimit}
        title="Find Suitable Jobs"
        maxResults={100}
      />
      
      {/* Delete Confirmation Popup */}
      <DeleteConfirmationPopup
        open={showDeletePopup}
        onClose={cancelDelete}
        onConfirm={confirmDeleteCandidate}
        title="Delete Candidate"
        message="Are you sure you want to delete this candidate? This action cannot be undone."
        itemName={candidateToDelete?.name}
        isDeleting={candidateToDelete ? isDeleting[candidateToDelete._id] : false}
      />

      {/* Talent Pool Selection Modal */}
      <TalentPoolSelectionModal
        open={showTalentPoolModal}
        onClose={handleTalentPoolModalClose}
        candidateId={selectedCandidateForPool?._id}
        candidateName={selectedCandidateForPool?.name}
      />

      {/* Link to Job Modal */}
      <Dialog
        open={showLinkJobModal}
        onClose={() => !linkingCandidates && setShowLinkJobModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: "linear-gradient(135deg, #1a1a2e 0%, #232946 100%)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }
        }}
      >
        <DialogTitle sx={{ color: "#f5f7fa", fontWeight: 600, borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
          Link {selectedCandidates.length} Candidate{selectedCandidates.length !== 1 ? 's' : ''} to Job
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body2" sx={{ color: "#b8c5d6", mb: 3 }}>
            Select a job to link the selected candidates:
          </Typography>
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {availableJobs.map(job => (
              <ListItem
                key={job._id}
                button
                selected={selectedJob === job._id}
                onClick={() => setSelectedJob(job._id)}
                sx={{
                  borderRadius: 1,
                  mb: 1,
                  border: selectedJob === job._id ? "2px solid #eebbc3" : "1px solid rgba(255, 255, 255, 0.1)",
                  backgroundColor: selectedJob === job._id ? "rgba(238, 187, 195, 0.1)" : "rgba(255, 255, 255, 0.02)",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                  }
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" sx={{ color: "#f5f7fa", fontWeight: 600 }}>
                      {job.title}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" sx={{ color: "#b8c5d6" }}>
                      {job.organization} • {job.location || 'Location not specified'}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
          <Button
            onClick={() => setShowLinkJobModal(false)}
            disabled={linkingCandidates}
            sx={{
              color: "#b8c5d6",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.05)",
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleLinkCandidatesToJob}
            disabled={!selectedJob || linkingCandidates}
            variant="contained"
            sx={{
              backgroundColor: "#eebbc3",
              color: "#1a1a2e",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "#d4a5ad",
              },
              "&:disabled": {
                backgroundColor: "rgba(238, 187, 195, 0.3)",
                color: "rgba(26, 26, 46, 0.5)",
              }
            }}
          >
            {linkingCandidates ? 'Linking...' : 'Link to Job'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Comments Modal */}
      {selectedCandidateForComments && currentUser && (
        <CommentsModal
          open={showCommentsModal}
          onClose={() => {
            setShowCommentsModal(false);
            setSelectedCandidateForComments(null);
          }}
          candidateId={selectedCandidateForComments._id}
          candidateName={selectedCandidateForComments.name}
          currentUserId={currentUser._id}
          userAccessLevel={accessLevel}
        />
      )}
    </Box>
  );
};

export default CandidateList;
