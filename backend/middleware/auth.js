const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    //console.log('=== AUTHENTICATION DEBUG ===');
    //console.log('Auth header:', authHeader);
    //console.log('Token:', token ? 'Present' : 'Missing');

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //console.log('Decoded token:', decoded);
    
    const user = await User.findById(decoded.id).select('-password');
    //console.log('Found user:', user ? { id: user._id, email: user.email, accessLevel: user.accessLevel } : 'Not found');
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Authorization middleware for admin access
const requireAdmin = (req, res, next) => {
  if (req.user.accessLevel !== 2) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Authorization middleware for deletion permission (only admin can delete)
const requireDeletionPermission = (req, res, next) => {
  if (req.user.accessLevel !== 2) {
    return res.status(403).json({ error: 'Only administrators can delete resources' });
  }
  next();
};

// Authorization middleware for job access
const checkJobAccess = async (req, res, next) => {
  try {
    const Job = require('../models/Job');
    const jobId = req.params.id || req.params.jobId;
    
    if (!jobId) {
      return res.status(400).json({ error: 'Job ID required' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Admin has access to all jobs
    if (req.user.accessLevel === 2) {
      req.job = job;
      return next();
    }

    // Subordinate can only access jobs they are authorized for
    if (req.user.accessLevel === 1) {
      const isAuthorized = job.authorizedUsers && 
        job.authorizedUsers.some(userId => userId.toString() === req.user._id.toString());
      
      if (!isAuthorized) {
        return res.status(403).json({ error: 'Access denied: You are not authorized for this job' });
      }
    }

    req.job = job;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Error checking job access' });
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  checkJobAccess,
  requireDeletionPermission
};
