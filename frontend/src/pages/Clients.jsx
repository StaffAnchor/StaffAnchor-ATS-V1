import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Payment as PaymentIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  Construction as ConstructionIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import API_URL from '../config/api';
import ConfirmDialog from '../components/ConfirmDialog';
import EditClient from '../components/EditClient';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [showFeatureDialog, setShowFeatureDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, clientId: null, clientName: '' });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('jwt');
      const response = await axios.get(`${API_URL}/api/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (client) => {
    setSelectedClient(client);
    setOpenDetailsDialog(true);
  };

  const handleBilling = (e) => {
    e.stopPropagation(); // Prevent row click
    setShowFeatureDialog(true);
  };

  const handleEdit = () => {
    setOpenDetailsDialog(false);
    setOpenEditDialog(true);
  };

  const handleClientUpdated = (updatedClient) => {
    // Update the client in the list
    setClients(clients.map(client => 
      client._id === updatedClient._id ? updatedClient : client
    ));
    // Update selected client if it's the same one
    setSelectedClient(updatedClient);
    setOpenEditDialog(false);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('jwt');
      await axios.delete(`${API_URL}/api/clients/${deleteConfirm.clientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Client deleted successfully');
      setDeleteConfirm({ open: false, clientId: null, clientName: '' });
      fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Failed to delete client');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress sx={{ color: '#8b5cf6' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            color: '#1e293b',
            fontWeight: 700,
            mb: 1,
            background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Clients
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          Manage your client organizations and contacts
        </Typography>
      </Box>

      {/* Clients Table */}
      <TableContainer
        component={Paper}
        sx={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                background: 'rgba(139, 92, 246, 0.08)',
                borderBottom: '2px solid rgba(238, 187, 195, 0.3)'
              }}
            >
              <TableCell sx={{ color: '#1e293b', fontWeight: 700, fontSize: '0.95rem' }}>
                Organization
              </TableCell>
              <TableCell sx={{ color: '#1e293b', fontWeight: 700, fontSize: '0.95rem' }}>
                Jobs Listed
              </TableCell>
              <TableCell sx={{ color: '#1e293b', fontWeight: 700, fontSize: '0.95rem' }}>
                Details
              </TableCell>
              <TableCell sx={{ color: '#1e293b', fontWeight: 700, fontSize: '0.95rem' }}>
                Billing
              </TableCell>
              <TableCell sx={{ color: '#1e293b', fontWeight: 700, fontSize: '0.95rem' }}>
                Contact
              </TableCell>
              <TableCell sx={{ color: '#1e293b', fontWeight: 700, fontSize: '0.95rem' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    No clients found. Add a new client to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow
                  key={client._id}
                  onClick={() => handleViewDetails(client)}
                  sx={{
                    '&:hover': { backgroundColor: 'rgba(139, 92, 246, 0.04)', cursor: 'pointer' },
                    transition: 'background-color 0.2s'
                  }}
                >
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      {client.organizationName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${client.jobs?.length || 0} Jobs`}
                      size="small"
                      sx={{ backgroundColor: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(client);
                      }}
                      sx={{ color: '#8b5cf6' }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={handleBilling}
                      sx={{ color: '#10b981' }}
                    >
                      <PaymentIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      {client.contacts?.[0]?.name || 'N/A'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                      {client.contacts?.[0]?.email || ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm({
                          open: true,
                          clientId: client._id,
                          clientName: client.organizationName
                        });
                      }}
                      sx={{ color: '#ef4444' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Details Dialog */}
      <Dialog
        open={openDetailsDialog}
        onClose={() => setOpenDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{
          background: '#f8fafc',
          color: '#1e293b',
          fontWeight: 700,
          borderBottom: '1px solid #e2e8f0'
        }}>
          Client Details
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedClient && (
            <>
              <Typography variant="h6" sx={{ mb: 2, color: '#1e293b', fontWeight: 600 }}>
                {selectedClient.organizationName}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" sx={{ mb: 2, color: '#1e293b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon fontSize="small" sx={{ color: '#8b5cf6' }} />
                Contacts
              </Typography>

              <List>
                {selectedClient.contacts?.map((contact, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      borderRadius: 1,
                      mb: 1,
                      background: '#ffffff'
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                            {contact.name}
                          </Typography>
                          {contact.designation && (
                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                              {contact.designation}
                            </Typography>
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <EmailIcon fontSize="small" sx={{ color: '#64748b', fontSize: '0.875rem' }} />
                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                              {contact.email}
                            </Typography>
                          </Box>
                          {contact.phone && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PhoneIcon fontSize="small" sx={{ color: '#64748b', fontSize: '0.875rem' }} />
                              <Typography variant="body2" sx={{ color: '#64748b' }}>
                                {contact.phone}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WorkIcon fontSize="small" sx={{ color: '#8b5cf6' }} />
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  <strong>{selectedClient.jobs?.length || 0}</strong> job(s) associated
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
          <Button
            startIcon={<EditIcon />}
            onClick={handleEdit}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              }
            }}
          >
            Edit Client
          </Button>
          <Button onClick={() => setOpenDetailsDialog(false)} sx={{ color: '#64748b' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Client Dialog */}
      <EditClient
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        client={selectedClient}
        onClientUpdated={handleClientUpdated}
      />

      {/* Feature Under Development Dialog */}
      <Dialog
        open={showFeatureDialog}
        onClose={() => setShowFeatureDialog(false)}
        maxWidth="xs"
        PaperProps={{
          sx: {
            background: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }
        }}
      >
        <DialogContent sx={{ textAlign: 'center', py: 4, px: 3 }}>
          <ConstructionIcon sx={{ fontSize: 64, color: '#f59e0b', mb: 2 }} />
          <Typography variant="body1" sx={{ color: '#1e293b', fontWeight: 500 }}>
            This feature is currently under development
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            onClick={() => setShowFeatureDialog(false)}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)',
              color: '#fff',
              fontWeight: 600,
              textTransform: 'none',
              px: 3,
              '&:hover': {
                background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
              }
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, clientId: null, clientName: '' })}
        onConfirm={handleDelete}
        title="Delete Client?"
        message={`Are you sure you want to delete "${deleteConfirm.clientName}"? This action cannot be undone.`}
      />
    </Box>
  );
};

export default Clients;

