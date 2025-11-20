const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
  try {
    const { fullName, email, phone, password, accessLevel, organization } = req.body;
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
