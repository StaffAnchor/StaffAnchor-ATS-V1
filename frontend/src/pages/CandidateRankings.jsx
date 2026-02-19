import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert
} from '@mui/material';
import {
  EmojiEvents as EmojiEventsIcon,
  CloudUpload as CloudUploadIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';
import API_URL from '../config/api';
import RankingLoadingPopup from '../components/RankingLoadingPopup';

const MAX_RESUMES = 20;
const PDF_MIME = 'application/pdf';

export default function CandidateRankings() {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [mustHaves, setMustHaves] = useState('');
  const [goodToHave, setGoodToHave] = useState('');
  const [resumeFiles, setResumeFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rankings, setRankings] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter((f) => f.type === PDF_MIME);
    const invalidCount = files.length - valid.length;
    if (invalidCount > 0) {
      toast.warning(`Skipped ${invalidCount} non-PDF file(s). Only PDFs are allowed.`);
    }
    const combined = [...resumeFiles, ...valid].slice(0, MAX_RESUMES);
    if (combined.length > MAX_RESUMES) {
      toast.warning(`Maximum ${MAX_RESUMES} resumes allowed. Only first ${MAX_RESUMES} kept.`);
    }
    setResumeFiles(combined);
    e.target.value = '';
  };

  const removeFile = (index) => {
    setResumeFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError('');
    if (!jobTitle.trim()) {
      setError('Job Title is required.');
      return;
    }
    if (!jobDescription.trim()) {
      setError('Job Description is required.');
      return;
    }
    if (resumeFiles.length === 0) {
      setError('Please upload at least one resume (PDF).');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('jobTitle', jobTitle.trim());
      formData.append('jobDescription', jobDescription.trim());
      if (yearsOfExperience.trim()) formData.append('yearsOfExperience', yearsOfExperience.trim());
      if (mustHaves.trim()) formData.append('mustHaves', mustHaves.trim());
      if (goodToHave.trim()) formData.append('goodToHave', goodToHave.trim());
      resumeFiles.forEach((file) => formData.append('resumes', file));

      const token = localStorage.getItem('jwt');
      const response = await axios.post(
        `${API_URL}/api/candidates/rank-resumes`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          timeout: 120000
        }
      );

      if (response.data?.success && Array.isArray(response.data.rankings)) {
        setRankings(response.data.rankings);
        toast.success('Rankings generated successfully.');
      } else {
        setError(response.data?.message || 'Invalid response from server.');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to generate rankings.';
      setError(msg);
      if (err.response?.status === 429 || err.response?.data?.error === 'AI_RATE_LIMIT') {
        toast.error('AI service is busy. Please try again in a minute.', { autoClose: 6000 });
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setJobTitle('');
    setJobDescription('');
    setYearsOfExperience('');
    setMustHaves('');
    setGoodToHave('');
    setResumeFiles([]);
    setRankings(null);
    setError('');
  };

  const goBackToForm = () => {
    setRankings(null);
  };

  const showResultsScreen = rankings && rankings.length > 0;

  // Results screen (new page after rankings are generated)
  if (showResultsScreen) {
    return (
      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={goBackToForm}
            sx={{
              color: '#475569',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)', color: '#1e293b' }
            }}
          >
            Back to ranking
          </Button>
        </Box>
        <Paper
          elevation={0}
          sx={{
            border: '1px solid #e2e8f0',
            borderRadius: 2,
            overflow: 'hidden',
            background: '#fff'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderBottom: '1px solid #e2e8f0' }}>
            <EmojiEventsIcon sx={{ fontSize: 28, color: '#f59e0b' }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
              Ranking results
            </Typography>
          </Box>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 280px)', overflow: 'auto' }}>
            <Table stickyHeader size="small" sx={{ minWidth: 600 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, background: '#f8fafc', color: '#475569' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, background: '#f8fafc', color: '#475569', minWidth: { xs: 180, sm: 200 } }}>Contact details</TableCell>
                  <TableCell sx={{ fontWeight: 700, background: '#f8fafc', color: '#475569', minWidth: { xs: 200, sm: 240 } }}>Positives</TableCell>
                  <TableCell sx={{ fontWeight: 700, background: '#f8fafc', color: '#475569', minWidth: { xs: 200, sm: 240 } }}>Negatives</TableCell>
                  <TableCell sx={{ fontWeight: 700, background: '#f8fafc', color: '#475569', minWidth: { xs: 200, sm: 240 } }}>Verdict</TableCell>
                  <TableCell sx={{ fontWeight: 700, background: '#f8fafc', color: '#475569' }}>Score</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rankings.map((row, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell sx={{ color: '#1e293b', fontWeight: 500 }}>{row.name || '—'}</TableCell>
                    <TableCell sx={{ color: '#475569', whiteSpace: 'pre-wrap', wordBreak: 'break-word', minWidth: { xs: 180, sm: 200 } }}>
                      {(row.contactDetails || '').split(/\s*\|\s*/).filter(Boolean).length > 0
                        ? (row.contactDetails || '').split(/\s*\|\s*/).filter(Boolean).map((part, i) => (
                            <span key={i} style={{ display: 'block' }}>{part.trim()}</span>
                          ))
                        : '—'}
                    </TableCell>
                    <TableCell sx={{ color: '#475569', whiteSpace: 'pre-wrap', wordBreak: 'break-word', minWidth: { xs: 200, sm: 240 } }}>{row.positives || '—'}</TableCell>
                    <TableCell sx={{ color: '#475569', whiteSpace: 'pre-wrap', wordBreak: 'break-word', minWidth: { xs: 200, sm: 240 } }}>{row.negatives || '—'}</TableCell>
                    <TableCell sx={{ color: '#1e293b', whiteSpace: 'pre-wrap', wordBreak: 'break-word', minWidth: { xs: 200, sm: 240 } }}>{row.verdict || '—'}</TableCell>
                    <TableCell>
                      <Chip
                        label={`${row.relevancyScore ?? 0}/100`}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          backgroundColor: (row.relevancyScore ?? 0) >= 70 ? 'rgba(16, 185, 129, 0.15)' : (row.relevancyScore ?? 0) >= 50 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.1)',
                          color: (row.relevancyScore ?? 0) >= 70 ? '#059669' : (row.relevancyScore ?? 0) >= 50 ? '#b45309' : '#dc2626'
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        <RankingLoadingPopup open={loading} />
      </Box>
    );
  }

  // Form screen (ranking generation page)
  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <EmojiEventsIcon sx={{ fontSize: 40, color: '#f59e0b' }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
            Candidate Rankings
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Upload job details and resumes to get AI-powered relevance rankings
          </Typography>
        </Box>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          border: '1px solid #e2e8f0',
          borderRadius: 2,
          background: '#fff'
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b', mb: 2 }}>
          Job details
        </Typography>

        <TextField
          fullWidth
          required
          label="Job Title"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="e.g. Senior Software Engineer"
          sx={{ mb: 2 }}
          variant="outlined"
          size="small"
          InputProps={{ sx: { borderRadius: 1 } }}
        />

        <TextField
          fullWidth
          required
          label="Job Description"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Describe the role, responsibilities, and context..."
          multiline
          rows={4}
          sx={{ mb: 2 }}
          variant="outlined"
          size="small"
          InputProps={{ sx: { borderRadius: 1 } }}
        />

        <TextField
          fullWidth
          label="Years of experience (optional)"
          value={yearsOfExperience}
          onChange={(e) => setYearsOfExperience(e.target.value)}
          placeholder="e.g. 3-5"
          sx={{ mb: 2 }}
          variant="outlined"
          size="small"
          InputProps={{ sx: { borderRadius: 1 } }}
        />

        <TextField
          fullWidth
          label="Must haves (optional)"
          value={mustHaves}
          onChange={(e) => setMustHaves(e.target.value)}
          placeholder="e.g. React, Node.js, 5+ years"
          multiline
          rows={2}
          sx={{ mb: 2 }}
          variant="outlined"
          size="small"
          InputProps={{ sx: { borderRadius: 1 } }}
        />

        <TextField
          fullWidth
          label="Good to have (optional)"
          value={goodToHave}
          onChange={(e) => setGoodToHave(e.target.value)}
          placeholder="e.g. AWS, TypeScript"
          multiline
          rows={2}
          sx={{ mb: 3 }}
          variant="outlined"
          size="small"
          InputProps={{ sx: { borderRadius: 1 } }}
        />

        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#475569', mb: 1 }}>
          Resumes (PDF only, up to {MAX_RESUMES})
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mb: 2 }}>
          <input
            accept=".pdf,application/pdf"
            style={{ display: 'none' }}
            id="resumes-upload"
            type="file"
            multiple
            onChange={handleFileChange}
            disabled={resumeFiles.length >= MAX_RESUMES}
          />
          <label htmlFor="resumes-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUploadIcon />}
              disabled={resumeFiles.length >= MAX_RESUMES}
              sx={{
                borderColor: '#2563eb',
                color: '#2563eb',
                textTransform: 'none',
                '&:hover': { borderColor: '#1d4ed8', backgroundColor: 'rgba(37, 99, 235, 0.06)' }
              }}
            >
              Upload PDFs
            </Button>
          </label>
          {resumeFiles.map((file, idx) => (
            <Chip
              key={idx}
              label={file.name}
              onDelete={() => removeFile(idx)}
              size="small"
              sx={{
                backgroundColor: '#f1f5f9',
                color: '#475569',
                '& .MuiChip-deleteIcon': { color: '#64748b' }
              }}
            />
          ))}
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={<EmojiEventsIcon />}
            sx={{
              background: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)',
              color: '#fff',
              fontWeight: 600,
              textTransform: 'none',
              px: 3,
              '&:hover': {
                background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)'
              }
            }}
          >
            Generate rankings
          </Button>
          <Button variant="outlined" onClick={resetForm} sx={{ textTransform: 'none' }}>
            Reset
          </Button>
        </Box>
      </Paper>

      <RankingLoadingPopup open={loading} />
    </Box>
  );
}
