const mongoose = require('mongoose');

const RecruiterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  }
}, { _id: true });

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  organization: {
    type: String,
    required: true,
    trim: true
  },
  recruiters: [RecruiterSchema],
  location: {
    type: String,
    trim: true
  },
  locations: [{
    country: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    }
  }],
  remote: {
    type: Boolean,
    default: false
  },
  experience: {
    type: Number,
    min: 0,
    validate: {
      validator: Number.isInteger,
      message: 'Experience must be a whole number'
    }
  },
  ctc: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  industry: {
    type: String,
    trim: true
  },
  authorizedUsers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Job', JobSchema);
