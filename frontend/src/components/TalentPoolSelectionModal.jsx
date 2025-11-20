import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  CircularProgress
} from '@mui/material';
import { Group as GroupIcon } from '@mui/icons-material';

const TalentPoolSelectionModal = ({ open, onClose, candidateId, candidateName }) => {
  const [talentPools, setTalentPools] = useState([]);
  const [selectedPools, setSelectedPools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && candidateId) {
      fetchTalentPools();
    }
  }, [open, candidateId]);

  const fetchTalentPools = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('jwt');
      const [poolsResponse, candidateResponse] = await Promise.all([
        axios.get('https://staffanchor-ats-v1.onrender.com/api/talent-pools', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`https://staffanchor-ats-v1.onrender.com/api/candidates/${candidateId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setTalentPools(poolsResponse.data);
      
      // Pre-select pools that the candidate is already in
      const candidatePools = candidateResponse.data.talentPools || [];
      setSelectedPools(candidatePools.map(pool => typeof pool === 'string' ? pool : pool._id));
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load talent pools');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePool = (poolId) => {
    setSelectedPools(prev =>
      prev.includes(poolId)
        ? prev.filter(id => id !== poolId)
        : [...prev, poolId]
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('jwt');
      
      // Get current pools for the candidate
      const currentPools = talentPools
        .filter(pool => pool.candidates.some(c => (typeof c === 'string' ? c : c._id) === candidateId))
        .map(pool => pool._id);

      // Determine which pools to add and remove
      const poolsToAdd = selectedPools.filter(id => !currentPools.includes(id));
      const poolsToRemove = currentPools.filter(id => !selectedPools.includes(id));

      // Add to new pools
      for (const poolId of poolsToAdd) {
        await axios.post(`https://staffanchor-ats-v1.onrender.com/api/talent-pools/${poolId}/candidates`, {
          candidateId
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      // Remove from old pools
      for (const poolId of poolsToRemove) {
        await axios.delete(`https://staffanchor-ats-v1.onrender.com/api/talent-pools/${poolId}/candidates`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { candidateId }
        });
      }

      toast.success('Talent pool assignments updated successfully!');
      onClose(true); // Pass true to indicate success
    } catch (error) {
      console.error('Error updating talent pools:', error);
      toast.error('Failed to update talent pool assignments');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => !submitting && onClose(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
          border: '1px solid rgba(0, 0, 0, 0.05)'
        }
      }}
    >
      <DialogTitle sx={{ 
        color: '#8b5cf6', 
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <GroupIcon />
        Add to Talent Pools
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" sx={{ color: '#1e293b', mb: 2 }}>
            Select talent pools for <strong>{candidateName}</strong>
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#8b5cf6' }} />
            </Box>
          ) : talentPools.length === 0 ? (
            <Typography variant="body2" sx={{ color: '#64748b', fontStyle: 'italic', py: 2 }}>
              No talent pools available. Create a talent pool first.
            </Typography>
          ) : (
            <Box sx={{
              maxHeight: 400,
              overflow: 'auto',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: 1,
              p: 2
            }}>
              {talentPools.map((pool) => (
                <FormControlLabel
                  key={pool._id}
                  control={
                    <Checkbox
                      checked={selectedPools.includes(pool._id)}
                      onChange={() => handleTogglePool(pool._id)}
                      sx={{
                        color: '#64748b',
                        '&.Mui-checked': { color: '#8b5cf6' }
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ color: '#1e293b', fontWeight: 600 }}>
                        {pool.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {pool.description}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#2563eb', display: 'block' }}>
                        {pool.candidates?.length || 0} candidates
                      </Typography>
                    </Box>
                  }
                  sx={{ mb: 2, display: 'flex', alignItems: 'flex-start' }}
                />
              ))}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button 
          onClick={() => onClose(false)}
          disabled={submitting}
          sx={{ color: '#64748b' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting || loading}
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)',
            color: '#fff',
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(135deg, #3a7bd5 0%, #d4a5ac 100%)'
            },
            '&:disabled': {
              background: 'rgba(0, 0, 0, 0.05)',
              color: 'rgba(255, 255, 255, 0.5)'
            }
          }}
        >
          {submitting ? 'Updating...' : 'Update'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TalentPoolSelectionModal;

