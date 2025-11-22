const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();

dotenv.config();
app.use(cors());
app.use(express.json());

// MongoDB connection with better error handling
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Explicitly set write concern to avoid issues
      writeConcern: { w: 1 }
    });
    
    //console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();


const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const candidateRoutes = require('./routes/candidates');
const workflowRoutes = require('./routes/workflows');
const emailRoutes = require('./routes/email');
const talentPoolRoutes = require('./routes/talentPools');
const skillRoutes = require('./routes/skills');
const candidateJobLinkRoutes = require('./routes/candidateJobLinks');
const commentRoutes = require('./routes/comments');
const bannerRoutes = require('./routes/banners');
const domainRoutes = require('./routes/domains');
const clientRoutes = require('./routes/clients');

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/talent-pools', talentPoolRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/candidate-job-links', candidateJobLinkRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/domains', domainRoutes);
app.use('/api/clients', clientRoutes);

app.get('/', (req, res) => {
  res.send('StaffAnchor ATS Backend Running');
});

// Test MongoDB connection
app.get('/test-db', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      res.json({ 
        status: 'connected', 
        message: 'MongoDB is connected successfully',
        readyState: mongoose.connection.readyState
      });
    } else {
      res.json({ 
        status: 'disconnected', 
        message: 'MongoDB is not connected',
        readyState: mongoose.connection.readyState
      });
    }
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Error checking MongoDB connection',
      error: error.message 
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  //console.log(`Backend running on port ${PORT}`);
});
