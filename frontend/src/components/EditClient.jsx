import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';
import API_URL from '../config/api';

const EditClient = ({ open, onClose, client, onClientUpdated }) => {
  const [organizationName, setOrganizationName] = useState('');
  const [contacts, setContacts] = useState([{
    name: '',
    designation: '',
    email: '',
    phone: ''
  }]);
  const [loading, setLoading] = useState(false);

  // Populate form when client data changes
  useEffect(() => {
    if (client) {
      setOrganizationName(client.organizationName || '');
      setContacts(client.contacts && client.contacts.length > 0 ? client.contacts : [{
        name: '',
        designation: '',
        email: '',
        phone: ''
      }]);
    }
  }, [client]);

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
      const response = await axios.put(
        `${API_URL}/api/clients/${client._id}`,
        {
          organizationName,
          contacts: validContacts
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Client updated successfully!');
      if (onClientUpdated) onClientUpdated(response.data);
      if (onClose) onClose();
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error(error.response?.data?.error || 'Failed to update client');
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.12)' },
      '&:hover fieldset': { borderColor: 'rgba(139, 92, 246, 0.5)' },
      '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
    },
    '& .MuiInputLabel-root': { color: '#64748b' },
    '& .MuiInputBase-input': { color: '#1e293b' },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
        }
      }}
    >
      <DialogTitle sx={{
        background: '#f8fafc',
        color: '#1e293b',
        fontWeight: 700,
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <EditIcon sx={{ color: '#8b5cf6' }} />
        Edit Client
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Box component="form" onSubmit={handleSubmit} id="edit-client-form">
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
                size="small"
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
                    value={contact.designation || ''}
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
                    value={contact.phone || ''}
                    onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                    sx={inputStyles}
                  />
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          sx={{
            color: '#64748b',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'rgba(100, 116, 139, 0.08)'
            }
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="edit-client-form"
          variant="contained"
          disabled={loading}
          sx={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            color: 'white',
            textTransform: 'none',
            px: 3,
            '&:hover': {
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            },
            '&:disabled': {
              background: '#e2e8f0',
              color: '#94a3b8'
            }
          }}
        >
          {loading ? 'Updating...' : 'Update Client'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditClient;

