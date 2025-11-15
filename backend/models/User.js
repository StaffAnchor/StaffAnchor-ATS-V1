const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  accessLevel: { type: Number, enum: [1, 2], required: true },
  organization: { type: String, required: true }
});

module.exports = mongoose.model('User', UserSchema);
