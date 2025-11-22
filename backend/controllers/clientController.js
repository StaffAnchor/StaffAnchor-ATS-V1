const Client = require('../models/Client');

// Create a new client
exports.createClient = async (req, res) => {
  try {
    const { organizationName, contacts } = req.body;

    if (!organizationName || !organizationName.trim()) {
      return res.status(400).json({ error: 'Organization name is required' });
    }

    if (!contacts || contacts.length === 0) {
      return res.status(400).json({ error: 'At least one contact is required' });
    }

    const client = new Client({
      organizationName: organizationName.trim(),
      contacts,
      organization: req.user.organization,
      createdBy: req.user._id
    });

    await client.save();
    res.status(201).json(client);
  } catch (err) {
    console.error('Error creating client:', err);
    res.status(500).json({ error: 'Failed to create client' });
  }
};

// Get all clients
exports.getClients = async (req, res) => {
  try {
    const query = req.user.organization
      ? { organization: req.user.organization }
      : {};

    const clients = await Client.find(query)
      .populate('createdBy', 'fullName email')
      .populate('jobs', 'title status')
      .sort({ createdAt: -1 });

    res.json(clients);
  } catch (err) {
    console.error('Error fetching clients:', err);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
};

// Get a specific client
exports.getClient = async (req, res) => {
  try {
    const query = {
      _id: req.params.id,
      organization: req.user.organization
    };

    const client = await Client.findOne(query)
      .populate('createdBy', 'fullName email')
      .populate('jobs', 'title status organization location');

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json(client);
  } catch (err) {
    console.error('Error fetching client:', err);
    res.status(500).json({ error: 'Failed to fetch client' });
  }
};

// Update a client
exports.updateClient = async (req, res) => {
  try {
    const { organizationName, contacts } = req.body;

    const query = {
      _id: req.params.id,
      organization: req.user.organization
    };

    const client = await Client.findOneAndUpdate(
      query,
      { organizationName, contacts },
      { new: true, runValidators: true }
    );

    if (!client) {
      return res.status(404).json({ error: 'Client not found or access denied' });
    }

    res.json(client);
  } catch (err) {
    console.error('Error updating client:', err);
    res.status(500).json({ error: 'Failed to update client' });
  }
};

// Delete a client
exports.deleteClient = async (req, res) => {
  try {
    const query = {
      _id: req.params.id,
      organization: req.user.organization
    };

    const client = await Client.findOneAndDelete(query);

    if (!client) {
      return res.status(404).json({ error: 'Client not found or access denied' });
    }

    res.json({ message: 'Client deleted successfully' });
  } catch (err) {
    console.error('Error deleting client:', err);
    res.status(500).json({ error: 'Failed to delete client' });
  }
};

