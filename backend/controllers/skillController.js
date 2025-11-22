const Skill = require('../models/Skill');

// Create a new skill
exports.createSkill = async (req, res) => {
  try {
    const { name, category = 'miscellaneous', talentPoolId } = req.body;
    
    if (!talentPoolId) {
      return res.status(400).json({ error: 'Talent pool is required' });
    }
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Skill name is required' });
    }
    
    // Check if skill already exists in this talent pool (case insensitive)
    const existingSkill = await Skill.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      talentPool: talentPoolId 
    });
    
    if (existingSkill) {
      return res.status(400).json({ error: 'Skill already exists in this talent pool' });
    }

    const skill = new Skill({
      name: name.trim().toLowerCase(),
      category: category || 'miscellaneous',
      talentPool: talentPoolId,
      organization: req.user.organization,
      createdBy: req.user._id,
      isCustom: true
    });

    await skill.save();
    res.status(201).json(skill);
  } catch (err) {
    console.error('Error creating skill:', err);
    
    // Return more detailed error message
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message).join(', ');
      return res.status(400).json({ error: `Validation error: ${errors}`, details: err.errors });
    }
    
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Skill already exists' });
    }
    
    res.status(500).json({ 
      error: 'Failed to create skill',
      message: err.message,
      name: err.name
    });
  }
};

// Get all skills for the organization
exports.getSkills = async (req, res) => {
  try {
    const { category, search, talentPoolId, talentPoolIds } = req.query;
    
    // Build query - if user has organization, filter by it (case-insensitive); otherwise show all
    let query = {};
    if (req.user.organization) {
      query.organization = { $regex: new RegExp(`^${req.user.organization}$`, 'i') };
    }
    
    // Filter by talent pool(s) if provided, otherwise ensure talentPool exists
    if (talentPoolId) {
      query.talentPool = talentPoolId;
    } else if (talentPoolIds) {
      // Handle comma-separated list of talent pool IDs
      const poolIds = talentPoolIds.split(',').map(id => id.trim());
      query.talentPool = { $in: poolIds };
    } else {
      // Only return skills that have a talentPool assigned (no orphaned skills)
      query.talentPool = { $exists: true, $ne: null };
    }
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    let skills = await Skill.find(query)
      .populate('talentPool', 'name domain')
      .sort({ usageCount: -1, name: 1 });

    res.json(skills);
  } catch (err) {
    console.error('Error fetching skills:', err);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
};

// Get all skills for public access (no authentication required)
exports.getPublicSkills = async (req, res) => {
  try {
    const { category, search, talentPoolId } = req.query;
    
    let query = {};
    
    if (talentPoolId) {
      query.talentPool = talentPoolId;
    } else {
      // Only return skills that have a talentPool assigned
      query.talentPool = { $exists: true, $ne: null };
    }
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const skills = await Skill.find(query)
      .populate('talentPool', 'name')
      .sort({ usageCount: -1, name: 1 });

    res.json(skills);
  } catch (err) {
    console.error('Error fetching public skills:', err);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
};

// Get skill categories
exports.getSkillCategories = async (req, res) => {
  try {
    const categories = await Skill.distinct('category', { 
      organization: req.user.organization 
    });
    
    res.json(categories);
  } catch (err) {
    console.error('Error fetching skill categories:', err);
    res.status(500).json({ error: 'Failed to fetch skill categories' });
  }
};

// Update a skill
exports.updateSkill = async (req, res) => {
  try {
    const { name, category, talentPoolId } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name.toLowerCase();
    if (category) updateData.category = category;
    if (talentPoolId) updateData.talentPool = talentPoolId;
    
    const skill = await Skill.findOneAndUpdate(
      { 
        _id: req.params.id,
        organization: req.user.organization,
        createdBy: req.user._id
      },
      updateData,
      { new: true, runValidators: true }
    ).populate('talentPool', 'name domain');

    if (!skill) {
      return res.status(404).json({ error: 'Skill not found or access denied' });
    }

    res.json(skill);
  } catch (err) {
    console.error('Error updating skill:', err);
    res.status(500).json({ error: 'Failed to update skill' });
  }
};

// Delete a skill
exports.deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findOneAndDelete({
      _id: req.params.id,
      organization: req.user.organization,
      createdBy: req.user._id
    });

    if (!skill) {
      return res.status(404).json({ error: 'Skill not found or access denied' });
    }

    res.json({ message: 'Skill deleted successfully' });
  } catch (err) {
    console.error('Error deleting skill:', err);
    res.status(500).json({ error: 'Failed to delete skill' });
  }
};

// Increment skill usage count (called when skill is used in candidate/job)
exports.incrementSkillUsage = async (skillName, organization) => {
  try {
    await Skill.findOneAndUpdate(
      { 
        name: skillName.toLowerCase(),
        organization: organization 
      },
      { $inc: { usageCount: 1 } },
      { upsert: true, setDefaultsOnInsert: true }
    );
  } catch (err) {
    console.error('Error incrementing skill usage:', err);
  }
};

// Get popular skills
exports.getPopularSkills = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    
    const skills = await Skill.find({ 
      organization: req.user.organization,
      usageCount: { $gt: 0 }
    })
      .sort({ usageCount: -1 })
      .limit(limit);

    res.json(skills);
  } catch (err) {
    console.error('Error fetching popular skills:', err);
    res.status(500).json({ error: 'Failed to fetch popular skills' });
  }
};
