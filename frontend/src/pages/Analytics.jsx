import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Divider,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar
} from '@mui/material';
import {
  Search as SearchIcon,
  Analytics as AnalyticsIcon,
  ArrowBack as ArrowBackIcon,
  People as PeopleIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Description as DescriptionIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  Timeline as TimelineIcon,
  CalendarToday as CalendarTodayIcon,
  BarChart as BarChartIcon,
  Percent as PercentIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_URL from '../config/api';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

const Analytics = () => {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobAnalytics, setJobAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [candidateModalOpen, setCandidateModalOpen] = useState(false);
  const [candidateModalTitle, setCandidateModalTitle] = useState('');
  const [candidateModalData, setCandidateModalData] = useState([]);
  const [expandedRecruiter, setExpandedRecruiter] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt');
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCompany) params.append('company', selectedCompany);

      const response = await axios.get(
        `${API_URL}/api/analytics/jobs?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setJobs(response.data.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await axios.get(
        `${API_URL}/api/analytics/companies`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCompanies(response.data.companies || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedCompany]);

  const handleJobClick = async (job) => {
    setSelectedJob(job);
    setAnalyticsLoading(true);
    try {
      const token = localStorage.getItem('jwt');
      const response = await axios.get(
        `${API_URL}/api/analytics/job/${job._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJobAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching job analytics:', error);
      toast.error('Failed to fetch job analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleBackToList = () => {
    setSelectedJob(null);
    setJobAnalytics(null);
    setExpandedRecruiter(null);
  };

  const openCandidateModal = (title, candidates) => {
    setCandidateModalTitle(title);
    setCandidateModalData(candidates);
    setCandidateModalOpen(true);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'New': '#6366f1',
      'In Progress': '#3b82f6',
      'Halted': '#f59e0b',
      'Withdrawn': '#ef4444',
      'Ongoing client process': '#8b5cf6',
      'Completed': '#10b981'
    };
    return statusColors[status] || '#64748b';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Job List View
  const renderJobList = () => (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <AnalyticsIcon sx={{ fontSize: 40, color: '#8b5cf6' }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
            Analytics Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            View performance analytics for your jobs
          </Typography>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 2,
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
      }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              placeholder="Search by Job ID, title, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#f8fafc',
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={5}>
            <FormControl fullWidth>
              <InputLabel>Filter by Company</InputLabel>
              <Select
                value={selectedCompany}
                label="Filter by Company"
                onChange={(e) => setSelectedCompany(e.target.value)}
                sx={{ 
                  borderRadius: 2, 
                  backgroundColor: '#f8fafc',
                  minWidth: 250
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      maxHeight: 300,
                      minWidth: 300,
                      '& .MuiMenuItem-root': {
                        whiteSpace: 'normal',
                        wordBreak: 'break-word'
                      }
                    }
                  }
                }}
              >
                <MenuItem value="">All Companies</MenuItem>
                {companies.map((company) => (
                  <MenuItem key={company} value={company} sx={{ whiteSpace: 'normal' }}>{company}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                setSearchQuery('');
                setSelectedCompany('');
              }}
              sx={{ 
                height: '56px',
                borderRadius: 2,
                borderColor: '#ef4444',
                color: '#ef4444',
                '&:hover': {
                  borderColor: '#dc2626',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  color: '#dc2626'
                }
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Jobs Table */}
      <TableContainer component={Paper} sx={{ 
        borderRadius: 2,
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
      }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.8rem', py: 1.5 }}>Job ID</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.8rem', py: 1.5 }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.8rem', py: 1.5 }}>Company</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.8rem', py: 1.5 }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, color: '#475569', fontSize: '0.8rem', py: 1.5 }}>Recruiters</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, color: '#475569', fontSize: '0.8rem', py: 1.5 }}>Linked</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, color: '#475569', fontSize: '0.8rem', py: 1.5 }}>Sent</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, color: '#475569', fontSize: '0.8rem', py: 1.5 }}>Selected</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, color: '#475569', fontSize: '0.8rem', py: 1.5 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <CircularProgress sx={{ color: '#8b5cf6' }} />
                </TableCell>
              </TableRow>
            ) : jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No jobs found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow 
                  key={job._id}
                  sx={{ 
                    '&:hover': { backgroundColor: '#f8fafc' },
                    cursor: 'pointer'
                  }}
                  onClick={() => handleJobClick(job)}
                >
                  <TableCell sx={{ py: 1 }}>
                    <Typography sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#6366f1' }}>
                      {job.jobId}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1 }}>
                    <Typography sx={{ fontWeight: 500, color: '#1e293b', fontSize: '0.8rem' }}>
                      {job.title}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1 }}>
                    <Typography sx={{ color: '#475569', fontSize: '0.8rem' }}>
                      {job.organization}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1 }}>
                    <Chip 
                      label={job.status}
                      size="small"
                      sx={{ 
                        backgroundColor: `${getStatusColor(job.status)}15`,
                        color: getStatusColor(job.status),
                        fontWeight: 500,
                        fontSize: '0.7rem',
                        height: '22px'
                      }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1 }}>
                    <Typography sx={{ fontWeight: 600, color: '#8b5cf6', fontSize: '0.8rem' }}>
                      {job.recruiterCount || 0}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1 }}>
                    <Typography sx={{ fontWeight: 600, color: '#3b82f6', fontSize: '0.8rem' }}>
                      {job.analytics?.linked || 0}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1 }}>
                    <Typography sx={{ fontWeight: 600, color: '#f59e0b', fontSize: '0.8rem' }}>
                      {job.analytics?.sentToClient || 0}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1 }}>
                    <Typography sx={{ fontWeight: 600, color: '#10b981', fontSize: '0.8rem' }}>
                      {job.analytics?.selected || 0}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1 }}>
                    <IconButton
                      size="small"
                      sx={{ 
                        color: '#8b5cf6',
                        '&:hover': { backgroundColor: 'rgba(139, 92, 246, 0.1)' }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJobClick(job);
                      }}
                    >
                      <AnalyticsIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  // Job Analytics Detail View
  const renderJobAnalytics = () => {
    if (analyticsLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress sx={{ color: '#8b5cf6' }} />
        </Box>
      );
    }

    if (!jobAnalytics) return null;

    const { job, overallStats, recruitersAnalytics, activityTimeline } = jobAnalytics;

    // Prepare chart data
    const recruiterComparisonData = recruitersAnalytics.map(r => ({
      name: r.recruiterName.split(' ')[0],
      fullName: r.recruiterName,
      linked: r.stats.totalLinked,
      submitted: r.stats.totalSentToClient,
      selected: r.stats.totalSelected,
      rejected: r.stats.totalRejected
    }));

    const pieData = [
      { name: 'Selected', value: overallStats.totalSelected, color: '#10b981' },
      { name: 'Rejected', value: overallStats.totalRejected, color: '#ef4444' },
      { name: 'Ongoing', value: overallStats.totalOngoing, color: '#f59e0b' },
      { name: 'Pending', value: overallStats.totalLinked - overallStats.totalSentToClient, color: '#94a3b8' }
    ].filter(d => d.value > 0);

    return (
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <IconButton 
            onClick={handleBackToList}
            sx={{ 
              backgroundColor: '#f8fafc',
              '&:hover': { backgroundColor: '#e2e8f0' }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
              {job.title}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              {job.organization} • {job.jobId} • Created {formatDate(job.createdAt)}
            </Typography>
          </Box>
          <Chip 
            label={job.status}
            sx={{ 
              backgroundColor: `${getStatusColor(job.status)}15`,
              color: getStatusColor(job.status),
              fontWeight: 600
            }}
          />
        </Box>

        {/* Overall Stats Cards */}
        {(() => {
          const overallSubmissionRate = overallStats.totalLinked > 0 
            ? ((overallStats.totalSentToClient / overallStats.totalLinked) * 100).toFixed(0) 
            : 0;
          const overallSelectionRate = overallStats.totalSentToClient > 0 
            ? ((overallStats.totalSelected / overallStats.totalSentToClient) * 100).toFixed(0) 
            : 0;
          
          return (
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {[
                { title: 'Total Linked', count: overallStats.totalLinked, icon: <PeopleIcon />, color: '#3b82f6' },
                { title: 'Sent to Client', count: overallStats.totalSentToClient, icon: <SendIcon />, color: '#f59e0b' },
                { title: 'Selected', count: overallStats.totalSelected, icon: <CheckCircleIcon />, color: '#10b981' },
                { title: 'Rejected', count: overallStats.totalRejected, icon: <CancelIcon />, color: '#ef4444' },
                { title: 'Ongoing', count: overallStats.totalOngoing, icon: <HourglassEmptyIcon />, color: '#8b5cf6' },
                { title: 'Submission %', count: `${overallSubmissionRate}%`, icon: <PercentIcon />, color: '#06b6d4' },
                { title: 'Selection %', count: `${overallSelectionRate}%`, icon: <PercentIcon />, color: '#ec4899' }
              ].map((stat, i) => (
                <Grid item xs={6} sm={4} md={12/7} key={i} sx={{ minWidth: 0 }}>
                  <Card sx={{ 
                    borderRadius: 2, 
                    border: '1px solid #e2e8f0',
                    height: 120
                  }}>
                    <CardContent sx={{ textAlign: 'center', p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <Box sx={{ color: stat.color, mb: 1 }}>{stat.icon}</Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color, fontSize: '1.75rem' }}>
                        {stat.count}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {stat.title}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          );
        })()}

        {/* Charts Section */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          {/* Recruiter Comparison Bar Chart */}
          <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #e2e8f0', flex: '1 1 400px', minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <BarChartIcon sx={{ color: '#8b5cf6' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>
                Recruiter Performance Comparison
              </Typography>
            </Box>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={recruiterComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="linked" name="Linked" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="submitted" name="Submitted" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="selected" name="Selected" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>

          {/* Status Distribution Pie Chart */}
          <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #e2e8f0', flex: '1 1 280px', minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TrendingUpIcon sx={{ color: '#8b5cf6' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>
                Candidate Status
              </Typography>
            </Box>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>

          {/* Activity Timeline Chart */}
          {activityTimeline && activityTimeline.length > 0 && (
            <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #e2e8f0', flex: '1 1 350px', minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TimelineIcon sx={{ color: '#8b5cf6' }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>
                  Activity Timeline
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={activityTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RechartsTooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="linked" name="Linked" stroke="#3b82f6" fill="#3b82f680" />
                  <Area type="monotone" dataKey="submitted" name="Submitted" stroke="#f59e0b" fill="#f59e0b80" />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          )}
        </Box>

        {/* Per-Recruiter Analytics */}
        <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #e2e8f0', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <PersonIcon sx={{ color: '#8b5cf6' }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
              Per-Recruiter Analytics ({recruitersAnalytics.length} Recruiters)
            </Typography>
          </Box>

          {recruitersAnalytics.map((recruiter, index) => {
            const submissionRate = recruiter.stats.totalLinked > 0 
              ? ((recruiter.stats.totalSentToClient / recruiter.stats.totalLinked) * 100).toFixed(0) 
              : 0;
            const selectionRate = recruiter.stats.totalSentToClient > 0 
              ? ((recruiter.stats.totalSelected / recruiter.stats.totalSentToClient) * 100).toFixed(0) 
              : 0;

            return (
              <Accordion 
                key={recruiter.recruiterId}
                expanded={expandedRecruiter === recruiter.recruiterId}
                onChange={() => setExpandedRecruiter(
                  expandedRecruiter === recruiter.recruiterId ? null : recruiter.recruiterId
                )}
                sx={{ 
                  mb: 2, 
                  borderRadius: 2, 
                  border: '1px solid #e2e8f0',
                  '&:before': { display: 'none' },
                  boxShadow: 'none'
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', pr: 2 }}>
                    <Avatar sx={{ bgcolor: COLORS[index % COLORS.length], width: 40, height: 40 }}>
                      {recruiter.recruiterName.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: 600, color: '#1e293b' }}>
                        {recruiter.recruiterName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {recruiter.recruiterEmail}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{ fontWeight: 700, color: '#3b82f6' }}>
                          {recruiter.stats.totalLinked}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>Linked</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{ fontWeight: 700, color: '#f59e0b' }}>
                          {recruiter.stats.totalSentToClient}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>Sent</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{ fontWeight: 700, color: '#10b981' }}>
                          {recruiter.stats.totalSelected}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>Selected</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{ fontWeight: 700, color: '#ef4444' }}>
                          {recruiter.stats.totalRejected}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>Rejected</Typography>
                      </Box>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Divider sx={{ mb: 2 }} />
                  
                  {/* Activity Dates */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6} md={6}>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>First Activity</Typography>
                        <Typography sx={{ fontWeight: 500, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarTodayIcon sx={{ fontSize: 14 }} />
                          {recruiter.timeline?.[0] ? formatDate(recruiter.timeline[0].date) : 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={6}>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>Last Activity</Typography>
                        <Typography sx={{ fontWeight: 500, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarTodayIcon sx={{ fontSize: 14 }} />
                          {recruiter.timeline?.length > 0 ? formatDate(recruiter.timeline[recruiter.timeline.length - 1].date) : 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Recruiter Stats Cards */}
                  <Grid container spacing={2}>
                    {[
                      { title: 'Linked', count: recruiter.stats.totalLinked, data: recruiter.candidates.linked, color: '#3b82f6', icon: <PeopleIcon sx={{ fontSize: 18 }} /> },
                      { title: 'Sent to Client', count: recruiter.stats.totalSentToClient, data: recruiter.candidates.sentToClient, color: '#f59e0b', icon: <SendIcon sx={{ fontSize: 18 }} /> },
                      { title: 'Selected', count: recruiter.stats.totalSelected, data: recruiter.candidates.selected, color: '#10b981', icon: <CheckCircleIcon sx={{ fontSize: 18 }} /> },
                      { title: 'Rejected', count: recruiter.stats.totalRejected, data: recruiter.candidates.rejected, color: '#ef4444', icon: <CancelIcon sx={{ fontSize: 18 }} /> },
                      { title: 'Ongoing', count: recruiter.stats.totalOngoing || recruiter.candidates.ongoing?.length || 0, data: recruiter.candidates.ongoing, color: '#8b5cf6', icon: <HourglassEmptyIcon sx={{ fontSize: 18 }} /> },
                      { title: 'Submission %', count: `${submissionRate}%`, data: null, color: '#06b6d4', icon: <PercentIcon sx={{ fontSize: 18 }} /> },
                      { title: 'Selection %', count: `${selectionRate}%`, data: null, color: '#ec4899', icon: <PercentIcon sx={{ fontSize: 18 }} /> }
                    ].map((cat, i) => (
                      <Grid item xs={6} sm={4} md={12/7} key={i} sx={{ minWidth: 0 }}>
                        <Card 
                          sx={{ 
                            borderRadius: 2, 
                            border: `1px solid ${cat.color}30`,
                            cursor: cat.data && cat.data.length > 0 ? 'pointer' : 'default',
                            transition: 'all 0.2s',
                            height: 100,
                            '&:hover': cat.data && cat.data.length > 0 ? {
                              boxShadow: `0 4px 12px ${cat.color}30`
                            } : {}
                          }}
                          onClick={() => cat.data && cat.data.length > 0 && openCandidateModal(
                            `${recruiter.recruiterName} - ${cat.title}`,
                            cat.data
                          )}
                        >
                          <CardContent sx={{ textAlign: 'center', p: 1.5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Box sx={{ color: cat.color, mb: 0.5 }}>{cat.icon}</Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: cat.color }}>
                              {cat.count}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem' }}>
                              {cat.title}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Paper>

      </Box>
    );
  };

  // Candidate List Modal
  const renderCandidateModal = () => (
    <Dialog 
      open={candidateModalOpen} 
      onClose={() => setCandidateModalOpen(false)}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '80vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid #e2e8f0',
        pb: 2
      }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
            {candidateModalTitle}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            {candidateModalData.length} candidate(s)
          </Typography>
        </Box>
        <IconButton onClick={() => setCandidateModalOpen(false)}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {candidateModalData.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">No candidates found</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Linked On</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Resume</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Client Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {candidateModalData.map((candidate) => (
                  <TableRow key={candidate._id} sx={{ '&:hover': { backgroundColor: '#f8fafc' } }}>
                    <TableCell>
                      <Typography sx={{ fontWeight: 500, color: '#1e293b', fontSize: '0.85rem' }}>
                        {candidate.name || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon sx={{ fontSize: 16, color: '#64748b' }} />
                        <Typography sx={{ color: '#475569', fontSize: '0.85rem' }}>
                          {candidate.email || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon sx={{ fontSize: 16, color: '#64748b' }} />
                        <Typography sx={{ color: '#475569', fontSize: '0.85rem' }}>
                          {candidate.phone || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ color: '#475569', fontSize: '0.85rem' }}>
                        {formatDate(candidate.linkedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {candidate.resume?.url ? (
                        <Tooltip title="View Resume">
                          <IconButton
                            size="small"
                            href={candidate.resume.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ color: '#8b5cf6' }}
                          >
                            <DescriptionIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                          No resume
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {candidate.status === 'Submitted to Client' ? (
                        (() => {
                          const rounds = candidate.clientRounds || [];
                          // If no rounds exist, show Round 1: Ongoing as default
                          const displayRounds = rounds.length > 0 ? rounds : [{ status: 'Ongoing' }];
                          
                          return (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              {displayRounds.map((round, idx) => (
                                <Chip
                                  key={idx}
                                  label={`Round ${idx + 1}: ${round.status}`}
                                  size="small"
                                  sx={{
                                    fontSize: '0.7rem',
                                    height: '22px',
                                    backgroundColor: round.status === 'Accepted' 
                                      ? 'rgba(76, 175, 80, 0.15)' 
                                      : round.status === 'Rejected'
                                      ? 'rgba(244, 67, 54, 0.15)'
                                      : 'rgba(255, 152, 0, 0.15)',
                                    color: round.status === 'Accepted'
                                      ? '#4caf50'
                                      : round.status === 'Rejected'
                                      ? '#f44336'
                                      : '#ff9800',
                                    fontWeight: 600
                                  }}
                                />
                              ))}
                            </Box>
                          );
                        })()
                      ) : (
                        <Typography variant="body2" sx={{ 
                          color: '#94a3b8', 
                          fontSize: '0.8rem',
                          fontStyle: 'italic'
                        }}>
                          Not submitted to client
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
    </Dialog>
  );

  return (
    <Box sx={{ 
      minHeight: 'calc(100vh - 72px)', 
      backgroundColor: '#f8fafc' 
    }}>
      {selectedJob ? renderJobAnalytics() : renderJobList()}
      {renderCandidateModal()}
    </Box>
  );
};

export default Analytics;
