import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Paper,
  Grid,
  Chip,
  Link,
} from '@mui/material';
import { InsertDriveFile as FileIcon } from '@mui/icons-material';

const CandidateScoreDisplay = ({ candidate, preferences }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return '#4caf50'; // Green
    if (score >= 60) return '#ff9800'; // Orange
    if (score >= 40) return '#ff5722'; // Red-orange
    return '#f44336'; // Red
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 40) return 'Below Average';
    return 'Poor';
  };

  // Use individual scores from backend if available, otherwise calculate them
  const individualScores = candidate.individualScores || {
    skills: 0,
    experience: 0,
    yearsOfExp: 0,
    location: 0,
  };

  // Calculate weighted total score
  // If candidate.score exists (from backend), use it directly to match the list display
  // Otherwise, calculate it from individual scores
  const calculateWeightedScore = () => {
    // If we have a score from the backend, use it directly to ensure consistency
    if (candidate.score !== undefined && candidate.score !== null) {
      return candidate.score;
    }

    // Calculate from individual scores using proper weighted average
    // The weights represent the relative importance of each component
    const weights = {
      skills: preferences.skillsVsDescription / 100,
      experience: preferences.experienceVsDescription / 100,
      yearsOfExp: preferences.yearsOfExperience / 100,
      location: preferences.location / 100,
    };

    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    
    if (totalWeight === 0) return candidate.score || 0;

    // Calculate weighted sum
    const weightedSum = (
      (individualScores.skills * weights.skills) +
      (individualScores.experience * weights.experience) +
      (individualScores.yearsOfExp * weights.yearsOfExp) +
      (individualScores.location * weights.location)
    );

    // If all weights are equal (e.g., all 50%), calculate as simple average
    // Check if all weights are approximately equal
    const weightValues = Object.values(weights);
    const allWeightsEqual = weightValues.every(w => Math.abs(w - weightValues[0]) < 0.01);
    
    if (allWeightsEqual) {
      // Simple average: sum of all scores / number of components
      const sumOfScores = individualScores.skills + individualScores.experience + 
                         individualScores.yearsOfExp + individualScores.location;
      return Math.round(sumOfScores / 4);
    }

    // Otherwise, use weighted average
    const weightedScore = weightedSum / totalWeight;
    return Math.round(weightedScore);
  };

  const weightedScore = calculateWeightedScore();

  return (
    <Paper sx={{ 
      p: 3, 
      background: 'rgba(255, 255, 255, 0.05)', 
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: 2,
      mb: 2
    }}>
      {/* Overall Score */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ color: '#eebbc3', fontWeight: 600 }}>
            Overall Match Score
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h4" sx={{ 
              color: getScoreColor(weightedScore),
              fontWeight: 700
            }}>
              {weightedScore}%
            </Typography>
            <Chip 
              label={getScoreLabel(weightedScore)}
              sx={{
                backgroundColor: getScoreColor(weightedScore),
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.8rem'
              }}
            />
          </Box>
        </Box>
        <LinearProgress
          variant="determinate"
          value={weightedScore}
          sx={{
            height: 12,
            borderRadius: 6,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: getScoreColor(weightedScore),
              borderRadius: 6,
            },
          }}
        />
      </Box>

      {/* Individual Scores */}
      <Typography variant="h6" sx={{ color: '#eebbc3', mb: 2, fontWeight: 600 }}>
        Detailed Breakdown
      </Typography>
      
      <Grid container spacing={2}>
        {/* Skills Score */}
        <Grid item xs={12} sm={6}>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: '#b8c5d6', fontWeight: 600 }}>
                Skills Match
              </Typography>
              <Typography variant="body2" sx={{ 
                color: getScoreColor(individualScores.skills),
                fontWeight: 600
              }}>
                {individualScores.skills}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={individualScores.skills}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getScoreColor(individualScores.skills),
                  borderRadius: 4,
                },
              }}
            />
            <Typography variant="caption" sx={{ color: '#8b9dc3', mt: 0.5, display: 'block' }}>
              Weight: {preferences.skillsVsDescription}%
            </Typography>
          </Box>
        </Grid>

        {/* Experience Score */}
        <Grid item xs={12} sm={6}>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: '#b8c5d6', fontWeight: 600 }}>
                Experience Match
              </Typography>
              <Typography variant="body2" sx={{ 
                color: getScoreColor(individualScores.experience),
                fontWeight: 600
              }}>
                {individualScores.experience}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={individualScores.experience}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getScoreColor(individualScores.experience),
                  borderRadius: 4,
                },
              }}
            />
            <Typography variant="caption" sx={{ color: '#8b9dc3', mt: 0.5, display: 'block' }}>
              Weight: {preferences.experienceVsDescription}%
            </Typography>
          </Box>
        </Grid>

        {/* Years of Experience Score */}
        <Grid item xs={12} sm={6}>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: '#b8c5d6', fontWeight: 600 }}>
                Years of Experience
              </Typography>
              <Typography variant="body2" sx={{ 
                color: getScoreColor(individualScores.yearsOfExp),
                fontWeight: 600
              }}>
                {individualScores.yearsOfExp}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={individualScores.yearsOfExp}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getScoreColor(individualScores.yearsOfExp),
                  borderRadius: 4,
                },
              }}
            />
            <Typography variant="caption" sx={{ color: '#8b9dc3', mt: 0.5, display: 'block' }}>
              Weight: {preferences.yearsOfExperience}%
            </Typography>
          </Box>
        </Grid>

        {/* Location Score */}
        <Grid item xs={12} sm={6}>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: '#b8c5d6', fontWeight: 600 }}>
                Location Match
              </Typography>
              <Typography variant="body2" sx={{ 
                color: getScoreColor(individualScores.location),
                fontWeight: 600
              }}>
                {individualScores.location}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={individualScores.location}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getScoreColor(individualScores.location),
                  borderRadius: 4,
                },
              }}
            />
            <Typography variant="caption" sx={{ color: '#8b9dc3', mt: 0.5, display: 'block' }}>
              Weight: {preferences.location}%
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Candidate Details */}
      <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Typography variant="h6" sx={{ color: '#eebbc3', mb: 2, fontWeight: 600 }}>
          Candidate Information
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" sx={{ color: '#b8c5d6', mb: 1 }}>
              <strong>Name:</strong> {candidate.name}
            </Typography>
            <Typography variant="body2" sx={{ color: '#b8c5d6', mb: 1 }}>
              <strong>Email:</strong> {candidate.email}
            </Typography>
            {candidate.phone && (
              <Typography variant="body2" sx={{ color: '#b8c5d6', mb: 1 }}>
                <strong>Phone:</strong> {candidate.phone}
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12} sm={6}>
            {candidate.currentLocation && (
              <Typography variant="body2" sx={{ color: '#b8c5d6', mb: 1 }}>
                <strong>Location:</strong> {candidate.currentLocation.city}, {candidate.currentLocation.state}
              </Typography>
            )}
            {candidate.experience && candidate.experience.length > 0 && (
              <Typography variant="body2" sx={{ color: '#b8c5d6', mb: 1 }}>
                <strong>Current Role:</strong> {candidate.experience[0].position} at {candidate.experience[0].company}
              </Typography>
            )}
          </Grid>
        </Grid>

        {/* Skills */}
        {candidate.skills && candidate.skills.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ color: '#b8c5d6', mb: 1, fontWeight: 600 }}>
              Skills:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {candidate.skills.map((skill, idx) => (
                <Chip 
                  key={idx} 
                  label={skill} 
                  size="small"
                  sx={{ 
                    backgroundColor: 'rgba(238, 187, 195, 0.2)', 
                    color: '#eebbc3',
                    fontSize: '0.8rem'
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Resume */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ color: '#b8c5d6', mb: 1, fontWeight: 600 }}>
            Resume:
          </Typography>
          {candidate.resume && candidate.resume.url ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FileIcon sx={{ color: '#4f8cff', fontSize: 20 }} />
              <Link 
                href={candidate.resume.url} 
                target="_blank" 
                rel="noopener" 
                sx={{color:'#4fc3f7', textDecoration: 'none', '&:hover': { textDecoration: 'underline' }}}
              >
                {candidate.resume.fileName || 'View Resume'}
              </Link>
              {candidate.resume.fileSize && (
                <Typography variant="caption" sx={{ color: '#b8c5d6' }}>
                  ({(candidate.resume.fileSize / 1024).toFixed(2)} KB)
                </Typography>
              )}
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: '#b8c5d6' }}>
              No resume uploaded
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default CandidateScoreDisplay;
