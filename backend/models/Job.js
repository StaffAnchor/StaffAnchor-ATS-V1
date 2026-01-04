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
  jobId: {
    type: String,
    unique: true,
    trim: true
  },
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
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  clientContact: {
    name: String,
    designation: String,
    email: String,
    phone: String
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
  ctcMin: {
    type: Number,
    min: 0
  },
  ctcMax: {
    type: Number,
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  industry: {
    type: String,
    trim: true
  },
  // New hierarchical expertise structure
  domain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domain'
  },
  talentPools: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TalentPool'
  }],
  skills: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  }],
  status: {
    type: String,
    enum: ['New', 'In Progress', 'Halted', 'Withdrawn', 'Ongoing client process', 'Completed'],
    default: 'New',
    trim: true
  },
  authorizedUsers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  clientTrackingToken: {
    type: String,
    unique: true,
    sparse: true // Allows null values, but unique for non-null
  }
}, {
  timestamps: true
});

// Function to generate a random token
function generateUniqueToken() {
  return require('crypto').randomBytes(20).toString('hex');
}

JobSchema.pre('save', function(next) {
  if (!this.clientTrackingToken) {
    this.clientTrackingToken = generateUniqueToken();
  }
  next();
});

// Helper function to generate Job ID from date
function generateJobId(date) {
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
  
  // Generate alphanumeric ID: JOB + YYMMDD + HHMMSS + random chars
  const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;
  const randomChars = Math.random().toString(36).substring(2, 5).toUpperCase();
  
  return `JOB${timestamp}${randomChars}`;
}

// Pre-save hook to generate jobId if it doesn't exist
JobSchema.pre('save', function(next) {
  if (!this.jobId) {
    this.jobId = generateJobId(this.createdAt || new Date());
  }
  next();
});

module.exports = mongoose.model('Job', JobSchema);
