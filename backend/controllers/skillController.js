const Skill = require('../models/Skill');

// Create a new skill
exports.createSkill = async (req, res) => {
  try {
    const { name, category = 'sales-and-business-development' } = req.body;
    
    console.log('Creating skill:', { name, category, organization: req.user.organization, createdBy: req.user._id });
    
    // Validate category
    const validCategories = [
      'sales-and-business-development',
      'marketing-communications',
      'technology-engineering',
      'finance-accounting-audit',
      'human-resources',
      'operations-supply-chain-procurement',
      'product-management-design',
      'data-analytics-insights',
      'customer-success-support',
      'legal-risk-compliance',
      'manufacturing-projects-quality',
      'general-management-strategy',
      'miscellaneous'
    ];
    
    if (category && !validCategories.includes(category)) {
      return res.status(400).json({ error: `Invalid category. Must be one of: ${validCategories.join(', ')}` });
    }
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Skill name is required' });
    }
    
    // Check if skill already exists (case insensitive)
    const existingSkill = await Skill.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      organization: req.user.organization 
    });
    
    if (existingSkill) {
      return res.status(400).json({ error: 'Skill already exists' });
    }

    const skill = new Skill({
      name: name.trim().toLowerCase(),
      category: category || 'sales-and-business-development',
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
    const { category, search } = req.query;
    
    console.log('=== GET SKILLS ===');
    console.log('User:', req.user);
    console.log('Category:', category);
    console.log('Organization:', req.user?.organization);
    
    // Build query - if user has organization, filter by it (case-insensitive); otherwise show all
    let query = {};
    if (req.user.organization) {
      query.organization = { $regex: new RegExp(`^${req.user.organization}$`, 'i') };
    }
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    let skills = await Skill.find(query)
      .sort({ usageCount: -1, name: 1 })
      .limit(100); // Limit to prevent large responses

    console.log('Skills found:', skills.length);

    // If no skills found for organization but category specified,
    // try to find skills from other organizations with same category
    if (skills.length === 0 && category && req.user.organization) {
      console.log('No skills found for organization, fetching from all organizations');
      const fallbackQuery = { category };
      if (search) {
        fallbackQuery.name = { $regex: search, $options: 'i' };
      }
      skills = await Skill.find(fallbackQuery)
        .sort({ usageCount: -1, name: 1 })
        .limit(100);
      console.log('Fallback skills found:', skills.length);
    }
    
    // Additional debugging if no skills found
    if (skills.length === 0 && req.user.organization) {
      const allSkills = await Skill.find({});
      console.log('Total skills in database:', allSkills.length);
      console.log('Sample skill organizations:', allSkills.slice(0, 5).map(s => ({ name: s.name, org: s.organization })));
    }

    res.json(skills);
  } catch (err) {
    console.error('Error fetching skills:', err);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
};

// Get all skills for public access (no authentication required)
exports.getPublicSkills = async (req, res) => {
  try {
    const { category, search } = req.query;
    
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const skills = await Skill.find(query)
      .sort({ usageCount: -1, name: 1 })
      .limit(100); // Limit to prevent large responses

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
    const { name, category } = req.body;
    
    const skill = await Skill.findOneAndUpdate(
      { 
        _id: req.params.id,
        organization: req.user.organization,
        createdBy: req.user._id
      },
      { name: name?.toLowerCase(), category },
      { new: true, runValidators: true }
    );

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
