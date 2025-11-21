import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../config/api';
import { 
  Typography, 
  Box, 
  IconButton, 
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Campaign as CampaignIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [deletingBanner, setDeletingBanner] = useState(null);
  const [formData, setFormData] = useState({
    text: '',
    startTime: new Date(),
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // Default to 24 hours from now
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt');
      const res = await axios.get(`${API_URL}/api/banners`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBanners(res.data);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error('Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBanner = async () => {
    // Validation
    if (!formData.text.trim()) {
      toast.error('Banner text is required');
      return;
    }

    if (new Date(formData.endTime) <= new Date(formData.startTime)) {
      toast.error('End time must be after start time');
      return;
    }

    try {
      const token = localStorage.getItem('jwt');
      await axios.post(`${API_URL}/api/banners`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Banner created successfully');
      setShowCreateDialog(false);
      setFormData({
        text: '',
        startTime: new Date(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
      fetchBanners();
      
      // Dispatch event to update active banners
      window.dispatchEvent(new Event('bannerUpdated'));
    } catch (error) {
      console.error('Error creating banner:', error);
      toast.error(error.response?.data?.error || 'Failed to create banner');
    }
  };

  const handleDeleteBanner = async (bannerId) => {
    try {
      setDeletingBanner(bannerId);
      const token = localStorage.getItem('jwt');
      await axios.delete(`${API_URL}/api/banners/${bannerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Banner deleted successfully');
      setBanners(banners.filter(b => b._id !== bannerId));
      
      // Dispatch event to update active banners
      window.dispatchEvent(new Event('bannerUpdated'));
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Failed to delete banner');
    } finally {
      setDeletingBanner(null);
    }
  };

  const isBannerActive = (banner) => {
    const now = new Date();
    return banner.isActive && 
           new Date(banner.startTime) <= now && 
           new Date(banner.endTime) >= now;
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            Banner Listings
          </Typography>

          {/* Right side - Add button */}
          <IconButton
            onClick={() => setShowCreateDialog(true)}
            sx={{
              backgroundColor: "#10b981",
              color: "#ffffff",
              "&:hover": {
                backgroundColor: "#059669",
              },
              width: 45,
              height: 45,
            }}
          >
            <AddIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* Banners Content */}
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
              Loading Banners...
            </Typography>
          </Box>
        ) : banners.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            color: '#64748b'
          }}>
            <CampaignIcon sx={{ fontSize: 60, color: '#64748b', mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 1 }}>
              No Banners Found
            </Typography>
            <Typography variant="body1">
              Create your first banner to display announcements.
            </Typography>
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
              borderRadius: 2,
              border: "1px solid rgba(0, 0, 0, 0.05)",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "#8b5cf6", fontWeight: 700, borderBottom: "2px solid rgba(238, 187, 195, 0.3)", width: '40%' }}>
                    Text
                  </TableCell>
                  <TableCell sx={{ color: "#8b5cf6", fontWeight: 700, borderBottom: "2px solid rgba(238, 187, 195, 0.3)" }}>
                    Start Time
                  </TableCell>
                  <TableCell sx={{ color: "#8b5cf6", fontWeight: 700, borderBottom: "2px solid rgba(238, 187, 195, 0.3)" }}>
                    End Time
                  </TableCell>
                  <TableCell sx={{ color: "#8b5cf6", fontWeight: 700, borderBottom: "2px solid rgba(238, 187, 195, 0.3)", textAlign: "center" }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ color: "#8b5cf6", fontWeight: 700, borderBottom: "2px solid rgba(238, 187, 195, 0.3)", textAlign: "center" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {banners.map(banner => {
                  const isActive = isBannerActive(banner);
                  return (
                    <TableRow
                      key={banner._id}
                      sx={{
                        "&:hover": {
                          backgroundColor: "rgba(238, 187, 195, 0.05)",
                        },
                      }}
                    >
                      <TableCell sx={{ color: "#1e293b", borderBottom: "1px solid rgba(0, 0, 0, 0.05)" }}>
                        <Typography sx={{ fontWeight: 600 }}>{banner.text}</Typography>
                      </TableCell>
                      <TableCell sx={{ color: "#64748b", borderBottom: "1px solid rgba(0, 0, 0, 0.05)" }}>
                        {formatDateTime(banner.startTime)}
                      </TableCell>
                      <TableCell sx={{ color: "#64748b", borderBottom: "1px solid rgba(0, 0, 0, 0.05)" }}>
                        {formatDateTime(banner.endTime)}
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.05)", textAlign: "center" }}>
                        <Chip
                          label={isActive ? "Active" : "Inactive"}
                          size="small"
                          sx={{
                            backgroundColor: isActive ? "rgba(16, 185, 129, 0.12)" : "rgba(107, 116, 128, 0.12)",
                            color: isActive ? "#10b981" : "#6b7280",
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.05)", textAlign: "center" }}>
                        <IconButton
                          onClick={() => handleDeleteBanner(banner._id)}
                          disabled={deletingBanner === banner._id}
                          sx={{
                            color: "#ef4444",
                            "&:hover": {
                              backgroundColor: "rgba(239, 68, 68, 0.1)",
                            },
                            "&:disabled": {
                              color: "#9ca3af",
                            }
                          }}
                        >
                          {deletingBanner === banner._id ? (
                            <CircularProgress size={20} sx={{ color: "#ef4444" }} />
                          ) : (
                            <DeleteIcon />
                          )}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Create Banner Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
            border: "1px solid rgba(0, 0, 0, 0.05)",
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle sx={{ 
          color: "#1e293b", 
          fontWeight: 600,
          borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#8b5cf6" }}>
            Create New Banner
          </Typography>
          <IconButton onClick={() => setShowCreateDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Text"
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              fullWidth
              multiline
              rows={3}
              placeholder="Enter your announcement text here..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#8b5cf6',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#8b5cf6',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#8b5cf6',
                },
              }}
            />
            
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="From"
                value={formData.startTime}
                onChange={(newValue) => setFormData({ ...formData, startTime: newValue })}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#8b5cf6',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#8b5cf6',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#8b5cf6',
                      },
                    }
                  }
                }}
              />
              
              <DateTimePicker
                label="To"
                value={formData.endTime}
                onChange={(newValue) => setFormData({ ...formData, endTime: newValue })}
                minDateTime={formData.startTime}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#8b5cf6',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#8b5cf6',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#8b5cf6',
                      },
                    }
                  }
                }}
              />
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: "1px solid rgba(0, 0, 0, 0.05)" }}>
          <Button 
            onClick={() => setShowCreateDialog(false)}
            sx={{
              color: "#64748b",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateBanner}
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)",
              color: "#fff",
              fontWeight: 600,
              textTransform: "none",
              px: 3,
              "&:hover": {
                background: "linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)",
              },
            }}
          >
            Create Banner
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Banners;

