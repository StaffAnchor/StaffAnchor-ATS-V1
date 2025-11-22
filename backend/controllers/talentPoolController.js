const TalentPool = require('../models/TalentPool');
const Candidate = require('../models/Candidate');

// Create a new talent pool
exports.createTalentPool = async (req, res) => {
  try {
    const { name, description, candidateIds, domainId } = req.body;
    
    if (!domainId) {
      return res.status(400).json({ error: 'Domain is required' });
    }
    
    // Check if talent pool with same name already exists in this domain
    const existingPool = await TalentPool.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      domain: domainId
    });
    
    if (existingPool) {
      return res.status(400).json({ error: 'Talent pool with this name already exists in this domain' });
    }

    const talentPool = new TalentPool({
      name,
      description,
      domain: domainId,
      organization: req.user.organization || 'Default',
      createdBy: req.user._id,
      candidates: candidateIds || []
    });

    await talentPool.save();

    // Update candidates to include this talent pool
    if (candidateIds && candidateIds.length > 0) {
      await Candidate.updateMany(
        { _id: { $in: candidateIds } },
        { $addToSet: { talentPools: talentPool._id } }
      );
    }

    res.status(201).json(talentPool);
  } catch (err) {
    console.error('Error creating talent pool:', err);
    res.status(500).json({ error: 'Failed to create talent pool' });
  }
};

// Get all talent pools for the organization
exports.getTalentPools = async (req, res) => {
  try {
    const { domainId } = req.query;
    
    // Build query - filter by domain if provided
    const query = {};
    
    if (domainId) {
      query.domain = domainId;
    }
    
    // If user has organization, filter by organization (case-insensitive); otherwise show all
    if (req.user.organization) {
      query.organization = { $regex: new RegExp(`^${req.user.organization}$`, 'i') };
    }
    
    const talentPools = await TalentPool.find(query)
      .populate('domain', 'name description')
      .populate('createdBy', 'fullName email')
      .populate('candidates', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(talentPools);
  } catch (err) {
    console.error('Error fetching talent pools:', err);
    res.status(500).json({ error: 'Failed to fetch talent pools' });
  }
};

// Get a specific talent pool
exports.getTalentPool = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    
    // Add organization filter if available
    if (req.user.organization) {
      query.organization = req.user.organization;
    }
    
    const talentPool = await TalentPool.findOne(query)
      .populate('domain', 'name description')
      .populate('createdBy', 'fullName email')
      .populate('candidates', 'name email phone skills experience');

    if (!talentPool) {
      return res.status(404).json({ error: 'Talent pool not found' });
    }

    res.json(talentPool);
  } catch (err) {
    console.error('Error fetching talent pool:', err);
    res.status(500).json({ error: 'Failed to fetch talent pool' });
  }
};

// Update a talent pool
exports.updateTalentPool = async (req, res) => {
  try {
    const { name, description, domainId } = req.body;
    
    const query = { 
      _id: req.params.id,
      createdBy: req.user._id
    };
    
    // Add organization filter if available
    if (req.user.organization) {
      query.organization = req.user.organization;
    }
    
    const updateData = { name, description };
    if (domainId) {
      updateData.domain = domainId;
    }
    
    const talentPool = await TalentPool.findOneAndUpdate(
      query,
      updateData,
      { new: true, runValidators: true }
    ).populate('domain', 'name description');

    if (!talentPool) {
      return res.status(404).json({ error: 'Talent pool not found or access denied' });
    }

    res.json(talentPool);
  } catch (err) {
    console.error('Error updating talent pool:', err);
    res.status(500).json({ error: 'Failed to update talent pool' });
  }
};

// Delete a talent pool
exports.deleteTalentPool = async (req, res) => {
  try {
    const query = {
      _id: req.params.id,
      createdBy: req.user._id
    };
    
    // Add organization filter if available
    if (req.user.organization) {
      query.organization = req.user.organization;
    }
    
    const talentPool = await TalentPool.findOneAndDelete(query);

    if (!talentPool) {
      return res.status(404).json({ error: 'Talent pool not found or access denied' });
    }

    // Remove talent pool reference from all candidates
    await Candidate.updateMany(
      { talentPools: req.params.id },
      { $pull: { talentPools: req.params.id } }
    );

    res.json({ message: 'Talent pool deleted successfully' });
  } catch (err) {
    console.error('Error deleting talent pool:', err);
    res.status(500).json({ error: 'Failed to delete talent pool' });
  }
};

// Add candidate to talent pool
exports.addCandidateToPool = async (req, res) => {
  try {
    const { candidateId } = req.body;
    const { id: poolId } = req.params;

    // Verify talent pool exists and user has access
    const query = { _id: poolId };
    
    // Add organization filter if available
    if (req.user.organization) {
      query.organization = req.user.organization;
    }
    
    const talentPool = await TalentPool.findOne(query);

    if (!talentPool) {
      return res.status(404).json({ error: 'Talent pool not found' });
    }

    // Verify candidate exists
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Add candidate to pool if not already added
    if (!talentPool.candidates.includes(candidateId)) {
      talentPool.candidates.push(candidateId);
      await talentPool.save();
    }

    // Add pool to candidate's talent pools if not already added
    if (!candidate.talentPools) {
      candidate.talentPools = [];
    }
    if (!candidate.talentPools.includes(poolId)) {
      candidate.talentPools.push(poolId);
      await candidate.save();
    }

    res.json({ message: 'Candidate added to talent pool successfully' });
  } catch (err) {
    console.error('Error adding candidate to pool:', err);
    res.status(500).json({ error: 'Failed to add candidate to talent pool' });
  }
};

// Remove candidate from talent pool
exports.removeCandidateFromPool = async (req, res) => {
  try {
    const { candidateId } = req.body;
    const { id: poolId } = req.params;

    // Remove from talent pool
    await TalentPool.findByIdAndUpdate(poolId, {
      $pull: { candidates: candidateId }
    });

    // Remove from candidate's talent pools
    await Candidate.findByIdAndUpdate(candidateId, {
      $pull: { talentPools: poolId }
    });

    res.json({ message: 'Candidate removed from talent pool successfully' });
  } catch (err) {
    console.error('Error removing candidate from pool:', err);
    res.status(500).json({ error: 'Failed to remove candidate from talent pool' });
  }
};
