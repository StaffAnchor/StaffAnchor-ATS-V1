const Domain = require('../models/Domain');
const TalentPool = require('../models/TalentPool');
const Skill = require('../models/Skill');

// Get all domains
exports.getAllDomains = async (req, res) => {
  try {
    const domains = await Domain.find().sort({ name: 1 });
    res.json(domains);
  } catch (error) {
    console.error('Error fetching domains:', error);
    res.status(500).json({ error: 'Failed to fetch domains' });
  }
};

// Get domain by ID with talent pools and skills
exports.getDomainById = async (req, res) => {
  try {
    const { id } = req.params;
    const domain = await Domain.findById(id);
    
    if (!domain) {
      return res.status(404).json({ error: 'Domain not found' });
    }
    
    // Get talent pools for this domain
    const talentPools = await TalentPool.find({ domain: id }).sort({ name: 1 });
    
    // Get skills for each talent pool
    const talentPoolsWithSkills = await Promise.all(
      talentPools.map(async (tp) => {
        const skills = await Skill.find({ talentPool: tp._id }).sort({ name: 1 });
        return {
          ...tp.toObject(),
          skills
        };
      })
    );
    
    res.json({
      ...domain.toObject(),
      talentPools: talentPoolsWithSkills
    });
  } catch (error) {
    console.error('Error fetching domain:', error);
    res.status(500).json({ error: 'Failed to fetch domain' });
  }
};

// Get talent pools by domain ID
exports.getTalentPoolsByDomain = async (req, res) => {
  try {
    const { domainId } = req.params;
    const talentPools = await TalentPool.find({ domain: domainId }).sort({ name: 1 });
    res.json(talentPools);
  } catch (error) {
    console.error('Error fetching talent pools:', error);
    res.status(500).json({ error: 'Failed to fetch talent pools' });
  }
};

// Get skills by talent pool IDs
exports.getSkillsByTalentPools = async (req, res) => {
  try {
    const { talentPoolIds } = req.query;
    
    if (!talentPoolIds) {
      return res.status(400).json({ error: 'talentPoolIds query parameter is required' });
    }
    
    // Parse talent pool IDs (can be comma-separated string or array)
    const poolIds = Array.isArray(talentPoolIds) 
      ? talentPoolIds 
      : talentPoolIds.split(',');
    
    const skills = await Skill.find({ 
      talentPool: { $in: poolIds } 
    }).sort({ name: 1 });
    
    res.json(skills);
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
};

// Create new domain
exports.createDomain = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Domain name is required' });
    }
    
    // Check if domain already exists
    const existing = await Domain.findOne({ name });
    if (existing) {
      return res.status(400).json({ error: 'Domain with this name already exists' });
    }
    
    const domain = await Domain.create({
      name,
      description,
      createdBy: req.user?._id
    });
    
    res.status(201).json(domain);
  } catch (error) {
    console.error('Error creating domain:', error);
    res.status(500).json({ error: 'Failed to create domain' });
  }
};

// Update domain
exports.updateDomain = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    const domain = await Domain.findByIdAndUpdate(
      id,
      { name, description },
      { new: true, runValidators: true }
    );
    
    if (!domain) {
      return res.status(404).json({ error: 'Domain not found' });
    }
    
    res.json(domain);
  } catch (error) {
    console.error('Error updating domain:', error);
    res.status(500).json({ error: 'Failed to update domain' });
  }
};

// Delete domain
exports.deleteDomain = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if domain has any talent pools
    const talentPoolCount = await TalentPool.countDocuments({ domain: id });
    if (talentPoolCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete domain with existing talent pools. Please delete talent pools first.' 
      });
    }
    
    const domain = await Domain.findByIdAndDelete(id);
    
    if (!domain) {
      return res.status(404).json({ error: 'Domain not found' });
    }
    
    res.json({ message: 'Domain deleted successfully' });
  } catch (error) {
    console.error('Error deleting domain:', error);
    res.status(500).json({ error: 'Failed to delete domain' });
  }
};

