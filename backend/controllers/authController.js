const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
  try {
    const { fullName, email, phone, password, accessLevel, organization, securityKey } = req.body;
    
    // Validate security key
    const requiredSecurityKey = process.env.ACCOUNT_CREATION_SECURITY_KEY;
    if (!requiredSecurityKey) {
      return res.status(500).json({ error: 'Server configuration error: Security key not configured' });
    }
    
    if (!securityKey || securityKey !== requiredSecurityKey) {
      return res.status(403).json({ error: 'Invalid security key' });
    }
    
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ fullName, email, phone, password: hash, accessLevel, organization });
    await user.save();
    res.json({ message: 'Signup successful' });
  } catch (err) {
    res.status(500).json({ error: 'Signup failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, accessLevel: user.accessLevel }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.cookie("authCookie", token, { maxAge: 900000, httpOnly: true })
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.listSubordinates = async (req, res) => {
  try {
    const subordinates = await User.find({ accessLevel: 1 });
    res.json(subordinates);
  } catch (err) {
    res.status(500).json({ error: 'Fetch subordinates failed' });
  }
};

exports.validateToken = async (req, res) => {
  try {
    // If we reach here, the authenticateToken middleware has already validated the token
    // and attached the user to req.user
    res.json({ 
      valid: true, 
      user: req.user 
    });
  } catch (err) {
    res.status(401).json({ error: 'Token validation failed' });
  }
};

exports.deleteSubordinate = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the requesting user is an admin (accessLevel 2)
    if (req.user.accessLevel !== 2) {
      return res.status(403).json({ error: 'Only admins can delete subordinates' });
    }

    // Find the user to delete
    const userToDelete = await User.findById(id);
    
    if (!userToDelete) {
      return res.status(404).json({ error: 'Subordinate not found' });
    }

    // Check if the user is a subordinate (accessLevel 1)
    if (userToDelete.accessLevel !== 1) {
      return res.status(400).json({ error: 'Can only delete subordinates (access level 1)' });
    }

    // Delete the user
    await User.findByIdAndDelete(id);
    
    res.json({ message: 'Subordinate deleted successfully' });
  } catch (err) {
    console.error('Error deleting subordinate:', err);
    res.status(500).json({ error: 'Failed to delete subordinate' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { fullName, email, phone, currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Check if email is being changed and if it's already taken
    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== userId.toString()) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    // Update fields
    user.fullName = fullName;
    user.email = email;
    user.phone = phone;

    // Update password if new password is provided
    if (newPassword) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({ 
          error: 'New password must be 8+ characters with uppercase, lowercase, number, and special character' 
        });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    // Return updated user (without password)
    const updatedUser = await User.findById(userId).select('-password');
    res.json({ 
      message: 'Profile updated successfully',
      user: updatedUser 
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
