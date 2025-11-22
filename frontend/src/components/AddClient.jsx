import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Paper,
  Divider
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';
import API_URL from '../config/api';

const AddClient = ({ onClose, onClientAdded }) => {
  const [organizationName, setOrganizationName] = useState('');
  const [contacts, setContacts] = useState([{
    name: '',
    designation: '',
    email: '',
    phone: ''
  }]);
  const [loading, setLoading] = useState(false);

  const handleAddContact = () => {
    setContacts([...contacts, { name: '', designation: '', email: '', phone: '' }]);
  };

  const handleRemoveContact = (index) => {
    if (contacts.length > 1) {
      const newContacts = contacts.filter((_, i) => i !== index);
      setContacts(newContacts);
    }
  };

  const handleContactChange = (index, field, value) => {
    const newContacts = [...contacts];
    newContacts[index][field] = value;
    setContacts(newContacts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!organizationName.trim()) {
      toast.error('Organization name is required');
      return;
    }

    const validContacts = contacts.filter(c => c.name.trim() && c.email.trim());
    if (validContacts.length === 0) {
      toast.error('At least one contact with name and email is required');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('jwt');
      const response = await axios.post(
        `${API_URL}/api/clients`,
        {
          organizationName,
          contacts: validContacts
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Client added successfully!');
      if (onClientAdded) onClientAdded(response.data);
      if (onClose) onClose();
    } catch (error) {
      console.error('Error adding client:', error);
      toast.error(error.response?.data?.error || 'Failed to add client');
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
      '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.5)' },
      '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
    },
    '& .MuiInputLabel-root': { color: '#64748b' },
    '& .MuiInputBase-input': { color: '#1e293b' },
  };

  return (
    <Box
      sx={{
        p: 3,
        maxWidth: '800px',
        margin: '0 auto',
        background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
      }}
    >
      <Typography
        variant="h5"
        sx={{
          mb: 3,
          fontWeight: 700,
          color: '#1e293b',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        Add New Client
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        {/* Organization Name */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Organization Name"
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            required
            sx={inputStyles}
          />
        </Box>

        <Divider sx={{ my: 3, borderColor: 'rgba(0, 0, 0, 0.08)' }} />

        {/* Contacts */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 600 }}>
              Contacts
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddContact}
              sx={{
                color: '#8b5cf6',
                textTransform: 'none',
                '&:hover': { backgroundColor: 'rgba(139, 92, 246, 0.08)' }
              }}
            >
              Add Contact
            </Button>
          </Box>

          {contacts.map((contact, index) => (
            <Paper
              key={index}
              sx={{
                p: 2,
                mb: 2,
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: 1,
                background: '#ffffff'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Contact {index + 1}
                </Typography>
                {contacts.length > 1 && (
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveContact(index)}
                    sx={{ color: '#ef4444' }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  label="Name"
                  value={contact.name}
                  onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                  required
                  sx={inputStyles}
                />
                <TextField
                  label="Designation"
                  value={contact.designation}
                  onChange={(e) => handleContactChange(index, 'designation', e.target.value)}
                  sx={inputStyles}
                />
                <TextField
                  label="Email"
                  type="email"
                  value={contact.email}
                  onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                  required
                  sx={inputStyles}
                />
                <TextField
                  label="Phone"
                  value={contact.phone}
                  onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                  sx={inputStyles}
                />
              </Box>
            </Paper>
          ))}
        </Box>

        {/* Submit Button */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          {onClose && (
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{
                borderColor: '#64748b',
                color: '#64748b',
                '&:hover': {
                  borderColor: '#475569',
                  backgroundColor: 'rgba(100, 116, 139, 0.08)'
                }
              }}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
              px: 4,
              '&:hover': {
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              }
            }}
          >
            {loading ? 'Adding...' : 'Add Client'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AddClient;

