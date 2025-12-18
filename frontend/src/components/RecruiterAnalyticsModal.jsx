import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Paper,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  Tooltip,
  LinearProgress,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import {
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Send as SendIcon,
  PersonAdd as PersonAddIcon,
  Link as LinkIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Assessment as AssessmentIcon,
  Speed as SpeedIcon,
  Insights as InsightsIcon,
  DataUsage as DataUsageIcon,
  Timeline as TimelineIcon,
  Percent as PercentIcon,
  BusinessCenter as BusinessCenterIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  FilterAlt as FilterAltIcon,
  CalendarMonth as CalendarMonthIcon,
  ArrowForward as ArrowForwardIcon,
  EmojiEvents as EmojiEventsIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Pending as PendingIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Person as PersonIcon,
  Handshake as HandshakeIcon,
  TrendingFlat as TrendingFlatIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ComposedChart,
  Scatter
} from 'recharts';
import API_URL from '../config/api';

// Color palette matching the app theme
const COLORS = {
  primary: '#8b5cf6',
  secondary: '#2563eb',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  pink: '#ec4899',
  orange: '#f97316',
  lime: '#84cc16',
  indigo: '#6366f1'
};

const CHART_COLORS = ['#8b5cf6', '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#f97316', '#84cc16', '#6366f1'];

// Stat Card Component
const StatCard = ({ title, value, subValue, icon: Icon, color = COLORS.primary, trend, small = false }) => (
  <Paper
    elevation={2}
    sx={{
      p: small ? 1.5 : 2,
      background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
      border: '1px solid rgba(0, 0, 0, 0.05)',
      borderRadius: 2,
      position: 'relative',
      overflow: 'hidden',
      height: '100%',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '4px',
        height: '100%',
        background: color,
      }
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box sx={{ ml: 1 }}>
        <Typography
          variant="caption"
          sx={{
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontSize: small ? '0.6rem' : '0.7rem',
            fontWeight: 600
          }}
        >
          {title}
        </Typography>
        <Typography
          variant={small ? 'h5' : 'h4'}
          sx={{
            color: '#1e293b',
            fontWeight: 700,
            mt: 0.5
          }}
        >
          {value}
        </Typography>
        {subValue && (
          <Typography
            variant="caption"
            sx={{
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              mt: 0.5
            }}
          >
            {trend === 'up' && <TrendingUpIcon sx={{ fontSize: 14, color: COLORS.success }} />}
            {trend === 'down' && <TrendingDownIcon sx={{ fontSize: 14, color: COLORS.danger }} />}
            {trend === 'neutral' && <TrendingFlatIcon sx={{ fontSize: 14, color: COLORS.warning }} />}
            {subValue}
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          p: small ? 0.75 : 1,
          borderRadius: 2,
          background: `${color}15`,
        }}
      >
        <Icon sx={{ color: color, fontSize: small ? 20 : 28 }} />
      </Box>
    </Box>
  </Paper>
);

// Progress Ring Component
const ProgressRing = ({ value, label, color = COLORS.primary, size = 100 }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        variant="determinate"
        value={100}
        size={size}
        thickness={4}
        sx={{ color: '#e2e8f0' }}
      />
      <CircularProgress
        variant="determinate"
        value={Math.min(parseFloat(value) || 0, 100)}
        size={size}
        thickness={4}
        sx={{
          color: color,
          position: 'absolute',
          left: 0,
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          }
        }}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="body1"
          sx={{
            color: '#1e293b',
            fontWeight: 700,
            fontSize: size > 80 ? '1rem' : '0.8rem'
          }}
        >
          {value}%
        </Typography>
      </Box>
    </Box>
    <Typography
      variant="caption"
      sx={{
        color: '#64748b',
        mt: 1,
        fontSize: '0.7rem',
        textAlign: 'center',
        fontWeight: 500
      }}
    >
      {label}
    </Typography>
  </Box>
);

// Section Header Component
const SectionHeader = ({ icon: Icon, title, subtitle, action }) => (
  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        sx={{
          p: 1,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${COLORS.primary}15, ${COLORS.secondary}15)`,
        }}
      >
        <Icon sx={{ color: COLORS.primary, fontSize: 22 }} />
      </Box>
      <Box>
        <Typography
          variant="h6"
          sx={{
            color: '#1e293b',
            fontWeight: 700,
            fontSize: '1rem'
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
    {action}
  </Box>
);

// Mini Stat for compact display
const MiniStat = ({ label, value, color }) => (
  <Box sx={{ textAlign: 'center', px: 2 }}>
    <Typography variant="h5" sx={{ color: color, fontWeight: 700 }}>{value}</Typography>
    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem' }}>{label}</Typography>
  </Box>
);

const RecruiterAnalyticsModal = ({ open, onClose, recruiter }) => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [expandedJob, setExpandedJob] = useState(null);

  useEffect(() => {
    if (open && recruiter) {
      fetchAnalytics();
    }
  }, [open, recruiter, startDate, endDate]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt');
      
      let url = `${API_URL}/api/analytics/recruiter/${recruiter._id}`;
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate.toISOString().split('T')[0]);
      if (endDate) params.append('endDate', endDate.toISOString().split('T')[0]);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAnalytics(res.data);
    } catch (error) {
      console.error('Error fetching recruiter analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatStatusForPie = (statusDistribution) => {
    return Object.entries(statusDistribution)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  };

  const getStatusColor = (status) => {
    const colors = {
      'New': '#3b82f6',
      'Pre-screening': '#a855f7',
      'Stage 2 Screening': '#06b6d4',
      'Shortlisted (Internal)': '#10b981',
      'Not Reachable': '#f59e0b',
      'Candidate Not Interested': '#f97316',
      'Rejected (Internal)': '#ef4444',
      'Submitted to Client': '#8b5cf6',
      'Interview Scheduled': '#3b82f6',
      'Interview Completed': '#6366f1',
      'Awaiting Feedback': '#f59e0b',
      'Feedback Received': '#06b6d4',
      'Shortlisted': '#10b981',
      'Rejected': '#ef4444',
      'On Hold': '#6b7280',
      'Offered': '#84cc16',
      'Offer Accepted': '#10b981',
      'Offer Declined': '#f97316',
      'Joined': '#059669',
      'No Show': '#dc2626'
    };
    return colors[status] || '#6b7280';
  };

  const getSourceLabel = (source) => {
    const labels = {
      'applied-through-link': 'Applied via Link',
      'added-by-recruiter': 'Added by Recruiter',
      'manual-link': 'Manual Link',
      'ai-suggested': 'AI Suggested'
    };
    return labels[source] || source;
  };

  if (!recruiter) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          borderRadius: 3,
          minHeight: '90vh',
        }
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          py: 2,
          px: 3
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h5" sx={{ color: '#1e293b', fontWeight: 700 }}>
              Recruiter Performance Analytics
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
              <Chip
                icon={<PersonIcon sx={{ fontSize: 16 }} />}
                label={recruiter.fullName}
                sx={{ background: `${COLORS.primary}15`, color: COLORS.primary, fontWeight: 600 }}
              />
              <Chip
                icon={<EmailIcon sx={{ fontSize: 16 }} />}
                label={recruiter.email}
                size="small"
                sx={{ background: '#f1f5f9', color: '#64748b' }}
              />
              {recruiter.phone && (
                <Chip
                  icon={<PhoneIcon sx={{ fontSize: 16 }} />}
                  label={recruiter.phone}
                  size="small"
                  sx={{ background: '#f1f5f9', color: '#64748b' }}
                />
              )}
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: '#64748b',
              '&:hover': { background: '#f1f5f9' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Date Range Filter */}
        <Paper
          elevation={0}
          sx={{
            mt: 2,
            p: 2,
            background: '#f8fafc',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterAltIcon sx={{ color: COLORS.primary, fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
              Filter by Date Range:
            </Typography>
          </Box>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              slotProps={{
                textField: {
                  size: 'small',
                  sx: {
                    width: 160,
                    '& .MuiOutlinedInput-root': {
                      background: '#fff',
                    }
                  }
                }
              }}
            />
            <ArrowForwardIcon sx={{ color: '#94a3b8' }} />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              slotProps={{
                textField: {
                  size: 'small',
                  sx: {
                    width: 160,
                    '& .MuiOutlinedInput-root': {
                      background: '#fff',
                    }
                  }
                }
              }}
            />
          </LocalizationProvider>
          {(startDate || endDate) && (
            <Chip
              label="Clear Filter"
              size="small"
              onDelete={() => { setStartDate(null); setEndDate(null); }}
              sx={{
                background: `${COLORS.warning}15`,
                color: COLORS.warning,
                '& .MuiChip-deleteIcon': { color: COLORS.warning }
              }}
            />
          )}
          {(startDate || endDate) && (
            <Typography variant="caption" sx={{ color: '#64748b', ml: 'auto' }}>
              Showing data from {startDate ? startDate.toLocaleDateString() : 'beginning'} to {endDate ? endDate.toLocaleDateString() : 'now'}
            </Typography>
          )}
        </Paper>
      </DialogTitle>

      <DialogContent sx={{ p: 3, background: '#f8fafc' }}>
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
              gap: 2
            }}
          >
            <CircularProgress size={60} sx={{ color: COLORS.primary }} />
            <Typography sx={{ color: '#64748b' }}>Loading analytics data...</Typography>
          </Box>
        ) : analytics ? (
          <Box>
            {/* Primary Stats Row */}
            <SectionHeader 
              icon={AssessmentIcon} 
              title="Core Performance Metrics" 
              subtitle="Primary indicators of recruitment activity"
            />
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Total Candidates Linked"
                  value={analytics.overallStats.totalLinked}
                  subValue={`${analytics.performanceMetrics.averageLinkedPerJob} avg per job`}
                  icon={LinkIcon}
                  color={COLORS.primary}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Applied Through Link"
                  value={analytics.overallStats.appliedThroughLink}
                  subValue={`${analytics.overallStats.totalLinked > 0 ? ((analytics.overallStats.appliedThroughLink / analytics.overallStats.totalLinked) * 100).toFixed(1) : 0}% of total`}
                  icon={PersonAddIcon}
                  color={COLORS.secondary}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Submitted to Client"
                  value={analytics.overallStats.submittedToClient}
                  subValue={`${analytics.conversionRates.linkToSubmission}% conversion rate`}
                  icon={SendIcon}
                  color={COLORS.info}
                  trend={parseFloat(analytics.conversionRates.linkToSubmission) >= 50 ? 'up' : parseFloat(analytics.conversionRates.linkToSubmission) >= 25 ? 'neutral' : 'down'}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Selected by Client"
                  value={analytics.overallStats.selectedByClient}
                  subValue={`${analytics.conversionRates.submissionToSelection}% success rate`}
                  icon={CheckCircleIcon}
                  color={COLORS.success}
                  trend={parseFloat(analytics.conversionRates.submissionToSelection) >= 30 ? 'up' : parseFloat(analytics.conversionRates.submissionToSelection) >= 15 ? 'neutral' : 'down'}
                />
              </Grid>
            </Grid>

            {/* Secondary Stats - Detailed Breakdown */}
            <SectionHeader 
              icon={DataUsageIcon} 
              title="Detailed Status Breakdown" 
              subtitle="Granular view of candidate pipeline"
            />
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                <StatCard
                  title="Jobs Worked On"
                  value={analytics.performanceMetrics.totalJobs}
                  icon={WorkIcon}
                  color={COLORS.primary}
                  small
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                <StatCard
                  title="Active Jobs"
                  value={analytics.performanceMetrics.activeJobs}
                  icon={BusinessCenterIcon}
                  color={COLORS.secondary}
                  small
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                <StatCard
                  title="Interviews Scheduled"
                  value={analytics.overallStats.interviewScheduled}
                  icon={ScheduleIcon}
                  color={COLORS.info}
                  small
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                <StatCard
                  title="Interviews Completed"
                  value={analytics.overallStats.interviewCompleted}
                  icon={PeopleIcon}
                  color={COLORS.indigo}
                  small
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                <StatCard
                  title="Offers Extended"
                  value={analytics.overallStats.offered}
                  icon={HandshakeIcon}
                  color={COLORS.lime}
                  small
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                <StatCard
                  title="Offers Accepted"
                  value={analytics.overallStats.offerAccepted}
                  icon={ThumbUpIcon}
                  color={COLORS.success}
                  small
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                <StatCard
                  title="Candidates Joined"
                  value={analytics.overallStats.joined}
                  icon={EmojiEventsIcon}
                  color="#059669"
                  small
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                <StatCard
                  title="Ongoing Process"
                  value={analytics.overallStats.ongoingProcess}
                  icon={HourglassEmptyIcon}
                  color={COLORS.warning}
                  small
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                <StatCard
                  title="Rejected by Client"
                  value={analytics.overallStats.rejectedByClient}
                  icon={ThumbDownIcon}
                  color={COLORS.danger}
                  small
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                <StatCard
                  title="Added by Recruiter"
                  value={analytics.overallStats.addedByRecruiter}
                  icon={PersonAddIcon}
                  color={COLORS.pink}
                  small
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                <StatCard
                  title="Completed Jobs"
                  value={analytics.performanceMetrics.completedJobs}
                  icon={CheckCircleIcon}
                  color={COLORS.success}
                  small
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                <StatCard
                  title="Success Rate"
                  value={`${analytics.performanceMetrics.successRate}%`}
                  icon={PercentIcon}
                  color={parseFloat(analytics.performanceMetrics.successRate) >= 10 ? COLORS.success : COLORS.warning}
                  small
                />
              </Grid>
            </Grid>

            {/* Conversion Funnel */}
            <SectionHeader 
              icon={SpeedIcon} 
              title="Conversion Funnel Analysis" 
              subtitle="Pipeline efficiency at each stage"
            />
            <Paper
              elevation={2}
              sx={{
                p: 3,
                mb: 4,
                background: '#fff',
                borderRadius: 2,
                border: '1px solid rgba(0, 0, 0, 0.05)'
              }}
            >
              <Grid container spacing={4} alignItems="center" justifyContent="center">
                <Grid size={{ xs: 6, sm: 3 }}>
                  <ProgressRing
                    value={analytics.conversionRates.linkToSubmission}
                    label="Link → Submission"
                    color={COLORS.secondary}
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <ProgressRing
                    value={analytics.conversionRates.submissionToSelection}
                    label="Submission → Selection"
                    color={COLORS.success}
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <ProgressRing
                    value={analytics.conversionRates.linkToSelection}
                    label="Overall Success Rate"
                    color={COLORS.primary}
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <ProgressRing
                    value={analytics.conversionRates.submissionToRejection}
                    label="Rejection Rate"
                    color={COLORS.danger}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Funnel Visualization */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Chip 
                  label={`${analytics.overallStats.totalLinked} Linked`} 
                  sx={{ background: `${COLORS.primary}15`, color: COLORS.primary, fontWeight: 600, minWidth: 100 }} 
                />
                <ArrowForwardIcon sx={{ color: '#cbd5e1' }} />
                <Chip 
                  label={`${analytics.overallStats.submittedToClient} Submitted`} 
                  sx={{ background: `${COLORS.info}15`, color: COLORS.info, fontWeight: 600, minWidth: 100 }} 
                />
                <ArrowForwardIcon sx={{ color: '#cbd5e1' }} />
                <Chip 
                  label={`${analytics.overallStats.interviewScheduled + analytics.overallStats.interviewCompleted} Interviewed`} 
                  sx={{ background: `${COLORS.indigo}15`, color: COLORS.indigo, fontWeight: 600, minWidth: 100 }} 
                />
                <ArrowForwardIcon sx={{ color: '#cbd5e1' }} />
                <Chip 
                  label={`${analytics.overallStats.offered} Offered`} 
                  sx={{ background: `${COLORS.lime}15`, color: COLORS.lime, fontWeight: 600, minWidth: 100 }} 
                />
                <ArrowForwardIcon sx={{ color: '#cbd5e1' }} />
                <Chip 
                  label={`${analytics.overallStats.selectedByClient} Selected`} 
                  sx={{ background: `${COLORS.success}15`, color: COLORS.success, fontWeight: 600, minWidth: 100 }} 
                />
                <ArrowForwardIcon sx={{ color: '#cbd5e1' }} />
                <Chip 
                  label={`${analytics.overallStats.joined} Joined`} 
                  sx={{ background: '#05966915', color: '#059669', fontWeight: 600, minWidth: 100 }} 
                />
              </Box>
            </Paper>

            {/* Charts Row */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {/* Activity Timeline */}
              <Grid size={{ xs: 12, lg: 8 }}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: 380, background: '#fff' }}>
                  <SectionHeader 
                    icon={TimelineIcon} 
                    title="Activity Timeline" 
                    subtitle="Daily linking and submission activity"
                  />
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={analytics.activityTimeline}>
                      <defs>
                        <linearGradient id="colorLinked" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="date"
                        stroke="#94a3b8"
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11 }} />
                      <RechartsTooltip
                        contentStyle={{
                          background: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="linked"
                        stroke={COLORS.primary}
                        strokeWidth={2}
                        fill="url(#colorLinked)"
                        name="Linked"
                      />
                      <Area
                        type="monotone"
                        dataKey="submitted"
                        stroke={COLORS.success}
                        strokeWidth={2}
                        fill="url(#colorSubmitted)"
                        name="Submitted"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              {/* Source Distribution */}
              <Grid size={{ xs: 12, lg: 4 }}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: 380, background: '#fff' }}>
                  <SectionHeader 
                    icon={PeopleIcon} 
                    title="Candidate Sources" 
                    subtitle="How candidates were added"
                  />
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Applied via Link', value: analytics.candidatesBySource['applied-through-link'] || 0 },
                          { name: 'Added by Recruiter', value: analytics.candidatesBySource['added-by-recruiter'] || 0 },
                          { name: 'Manual Link', value: analytics.candidatesBySource['manual-link'] || 0 },
                          { name: 'AI Suggested', value: analytics.candidatesBySource['ai-suggested'] || 0 }
                        ].filter(d => d.value > 0)}
                        cx="50%"
                        cy="45%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {CHART_COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        formatter={(value) => <span style={{ color: '#64748b', fontSize: '12px' }}>{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              {/* Weekly Performance */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: 350, background: '#fff' }}>
                  <SectionHeader 
                    icon={CalendarMonthIcon} 
                    title="Weekly Performance" 
                    subtitle="Last 12 weeks activity trend"
                  />
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={analytics.weeklyActivity}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="week" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11 }} />
                      <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11 }} />
                      <RechartsTooltip
                        contentStyle={{
                          background: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8
                        }}
                      />
                      <Legend />
                      <Bar dataKey="linked" name="Linked" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="submitted" name="Submitted" fill={COLORS.success} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              {/* Client Status Distribution */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: 350, background: '#fff' }}>
                  <SectionHeader 
                    icon={InsightsIcon} 
                    title="Client-Side Status Distribution" 
                    subtitle="Post-submission candidate outcomes"
                  />
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart 
                      data={formatStatusForPie(analytics.clientStatusDistribution)} 
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11 }} />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        stroke="#94a3b8" 
                        tick={{ fill: '#64748b', fontSize: 10 }}
                        width={120}
                      />
                      <RechartsTooltip />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {formatStatusForPie(analytics.clientStatusDistribution).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>

            {/* Individual Job Performance */}
            <SectionHeader 
              icon={WorkIcon} 
              title="Individual Job Performance" 
              subtitle={`Detailed analytics for each job (${analytics.totalJobs} jobs)`}
            />
            <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden', background: '#fff' }}>
              <TableContainer sx={{ maxHeight: 500 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ background: '#f8fafc', fontWeight: 700, color: '#1e293b' }}>Job ID</TableCell>
                      <TableCell sx={{ background: '#f8fafc', fontWeight: 700, color: '#1e293b' }}>Title</TableCell>
                      <TableCell sx={{ background: '#f8fafc', fontWeight: 700, color: '#1e293b' }}>Company</TableCell>
                      <TableCell align="center" sx={{ background: '#f8fafc', fontWeight: 700, color: COLORS.primary }}>Linked</TableCell>
                      <TableCell align="center" sx={{ background: '#f8fafc', fontWeight: 700, color: COLORS.secondary }}>Via Link</TableCell>
                      <TableCell align="center" sx={{ background: '#f8fafc', fontWeight: 700, color: COLORS.info }}>Submitted</TableCell>
                      <TableCell align="center" sx={{ background: '#f8fafc', fontWeight: 700, color: COLORS.success }}>Selected</TableCell>
                      <TableCell align="center" sx={{ background: '#f8fafc', fontWeight: 700, color: COLORS.danger }}>Rejected</TableCell>
                      <TableCell align="center" sx={{ background: '#f8fafc', fontWeight: 700, color: COLORS.warning }}>Ongoing</TableCell>
                      <TableCell align="center" sx={{ background: '#f8fafc', fontWeight: 700, color: '#64748b' }}>Status</TableCell>
                      <TableCell align="center" sx={{ background: '#f8fafc', fontWeight: 700 }}>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analytics.jobAnalytics.map((jobData, index) => (
                      <React.Fragment key={jobData.job._id}>
                        <TableRow
                          sx={{
                            background: index % 2 === 0 ? '#fff' : '#f8fafc',
                            '&:hover': { background: '#f1f5f9' }
                          }}
                        >
                          <TableCell sx={{ color: COLORS.secondary, fontWeight: 600, fontSize: '0.8rem' }}>
                            {jobData.job.jobId}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>{jobData.job.title}</TableCell>
                          <TableCell sx={{ color: '#64748b' }}>{jobData.job.organization}</TableCell>
                          <TableCell align="center">
                            <Chip label={jobData.stats.totalLinked} size="small" sx={{ background: `${COLORS.primary}15`, color: COLORS.primary, fontWeight: 700 }} />
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={jobData.stats.appliedThroughLink} size="small" sx={{ background: `${COLORS.secondary}15`, color: COLORS.secondary, fontWeight: 700 }} />
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={jobData.stats.submittedToClient} size="small" sx={{ background: `${COLORS.info}15`, color: COLORS.info, fontWeight: 700 }} />
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={jobData.stats.selectedByClient} size="small" sx={{ background: `${COLORS.success}15`, color: COLORS.success, fontWeight: 700 }} />
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={jobData.stats.rejectedByClient} size="small" sx={{ background: `${COLORS.danger}15`, color: COLORS.danger, fontWeight: 700 }} />
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={jobData.stats.ongoingProcess} size="small" sx={{ background: `${COLORS.warning}15`, color: COLORS.warning, fontWeight: 700 }} />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={jobData.job.status}
                              size="small"
                              sx={{
                                background: (() => {
                                  switch (jobData.job.status) {
                                    case 'New': return `${COLORS.secondary}15`;
                                    case 'In Progress': return `${COLORS.warning}15`;
                                    case 'Completed': return `${COLORS.success}15`;
                                    case 'Halted': return `${COLORS.danger}15`;
                                    default: return '#f1f5f9';
                                  }
                                })(),
                                color: (() => {
                                  switch (jobData.job.status) {
                                    case 'New': return COLORS.secondary;
                                    case 'In Progress': return COLORS.warning;
                                    case 'Completed': return COLORS.success;
                                    case 'Halted': return COLORS.danger;
                                    default: return '#64748b';
                                  }
                                })(),
                                fontWeight: 600,
                                fontSize: '0.7rem'
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => setExpandedJob(expandedJob === jobData.job._id ? null : jobData.job._id)}
                              sx={{ color: COLORS.primary }}
                            >
                              {expandedJob === jobData.job._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                          </TableCell>
                        </TableRow>

                        {/* Expanded Candidate Details */}
                        <TableRow>
                          <TableCell colSpan={11} sx={{ p: 0, border: 0 }}>
                            <Collapse in={expandedJob === jobData.job._id} timeout="auto" unmountOnExit>
                              <Box sx={{ p: 2, background: '#f1f5f9' }}>
                                <Typography variant="subtitle2" sx={{ color: '#1e293b', mb: 2, fontWeight: 600 }}>
                                  Candidates ({jobData.candidates.length})
                                </Typography>
                                <TableContainer component={Paper} elevation={0}>
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow sx={{ background: '#e2e8f0' }}>
                                        <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Name</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Email</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Source</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Internal Status</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Client Status</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Linked On</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {jobData.candidates.map((candidate) => (
                                        <TableRow key={candidate._id} sx={{ '&:hover': { background: '#f8fafc' } }}>
                                          <TableCell sx={{ fontWeight: 500 }}>{candidate.name}</TableCell>
                                          <TableCell sx={{ color: '#64748b', fontSize: '0.8rem' }}>{candidate.email}</TableCell>
                                          <TableCell>
                                            <Chip
                                              label={getSourceLabel(candidate.source)}
                                              size="small"
                                              sx={{
                                                fontSize: '0.7rem',
                                                background: candidate.source === 'applied-through-link' ? `${COLORS.secondary}15` : `${COLORS.pink}15`,
                                                color: candidate.source === 'applied-through-link' ? COLORS.secondary : COLORS.pink
                                              }}
                                            />
                                          </TableCell>
                                          <TableCell>
                                            <Chip
                                              label={candidate.status}
                                              size="small"
                                              sx={{
                                                fontSize: '0.7rem',
                                                background: `${getStatusColor(candidate.status)}15`,
                                                color: getStatusColor(candidate.status)
                                              }}
                                            />
                                          </TableCell>
                                          <TableCell>
                                            {candidate.clientSideStatus ? (
                                              <Chip
                                                label={candidate.clientSideStatus}
                                                size="small"
                                                sx={{
                                                  fontSize: '0.7rem',
                                                  background: `${getStatusColor(candidate.clientSideStatus)}15`,
                                                  color: getStatusColor(candidate.clientSideStatus)
                                                }}
                                              />
                                            ) : (
                                              <Typography sx={{ color: '#94a3b8', fontSize: '0.8rem' }}>—</Typography>
                                            )}
                                          </TableCell>
                                          <TableCell sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                                            {new Date(candidate.linkedAt).toLocaleDateString()}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Summary Footer */}
            <Paper
              elevation={0}
              sx={{
                mt: 3,
                p: 2,
                background: '#f1f5f9',
                borderRadius: 2,
                border: '1px solid #e2e8f0'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  Analytics generated on {new Date().toLocaleString()}
                </Typography>
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    <strong>Total Records:</strong> {analytics.overallStats.totalLinked}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    <strong>Jobs Analyzed:</strong> {analytics.totalJobs}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    <strong>Overall Success Rate:</strong> {analytics.performanceMetrics.successRate}%
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography sx={{ color: COLORS.danger }}>Failed to load analytics data</Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RecruiterAnalyticsModal;
