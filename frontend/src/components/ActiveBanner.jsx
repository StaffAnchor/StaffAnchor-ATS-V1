import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Box, Typography, IconButton, Chip } from '@mui/material';
import { Close as CloseIcon, Campaign as CampaignIcon } from '@mui/icons-material';
import API_URL from '../config/api';

const ActiveBanner = ({ onHeightChange }) => {
  const [banners, setBanners] = useState([]);
  const [dismissedBanners, setDismissedBanners] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    fetchActiveBanners();
    
    // Listen for banner updates
    const handleBannerUpdate = () => {
      fetchActiveBanners();
    };
    
    window.addEventListener('bannerUpdated', handleBannerUpdate);
    
    return () => {
      window.removeEventListener('bannerUpdated', handleBannerUpdate);
    };
  }, []);

  // Update height when banners change
  useEffect(() => {
    if (onHeightChange) {
      const height = containerRef.current ? containerRef.current.offsetHeight : 0;
      onHeightChange(height);
    }
  }, [banners, dismissedBanners, onHeightChange]);

  const fetchActiveBanners = async () => {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) return;
      
      const res = await axios.get(`${API_URL}/api/banners/active`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBanners(res.data);
    } catch (error) {
      console.error('Error fetching active banners:', error);
    }
  };

  const handleDismiss = (bannerId) => {
    setDismissedBanners([...dismissedBanners, bannerId]);
  };

  const visibleBanners = banners.filter(banner => !dismissedBanners.includes(banner._id));

  if (visibleBanners.length === 0) {
    return null;
  }

  return (
    <Box ref={containerRef} sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1300 }}>
      {visibleBanners.map((banner, index) => (
        <Box
          key={banner._id}
          sx={{
            background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 50%, #fee2e2 100%)',
            borderBottom: '2px solid #fca5a5',
            py: 2,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '56px',
            position: 'relative',
            boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.1), 0 2px 4px -1px rgba(220, 38, 38, 0.06), 0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: '0 10px 15px -3px rgba(220, 38, 38, 0.2), 0 4px 6px -2px rgba(220, 38, 38, 0.1), 0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          {/* Announcement Badge - Absolute positioned on left */}
          <Chip
            icon={<CampaignIcon sx={{ fontSize: 16 }} />}
            label="Announcement"
            sx={{
              position: 'absolute',
              left: 16,
              backgroundColor: '#dc2626',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.75rem',
              height: '28px',
              boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.4), 0 2px 4px -1px rgba(220, 38, 38, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              '& .MuiChip-icon': {
                color: '#ffffff',
                marginLeft: '8px',
              },
              '&:hover': {
                backgroundColor: '#b91c1c',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease',
            }}
          />

          {/* Banner Text - Centered on screen */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: '#7f1d1d',
                fontWeight: 600,
                fontSize: '0.95rem',
                textAlign: 'center',
                textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)',
                letterSpacing: '0.3px',
              }}
            >
              {banner.text}
            </Typography>
          </Box>

          {/* Close Button */}
          <IconButton
            size="small"
            onClick={() => handleDismiss(banner._id)}
            sx={{
              position: 'absolute',
              right: 8,
              color: '#991b1b',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              width: '28px',
              height: '28px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: '#dc2626',
                color: '#ffffff',
                transform: 'scale(1.1) rotate(90deg)',
                boxShadow: '0 4px 8px rgba(220, 38, 38, 0.3)',
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}
    </Box>
  );
};

export default ActiveBanner;

