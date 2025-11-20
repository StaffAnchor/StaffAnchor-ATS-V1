const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Candidate = require('./models/Candidate');

dotenv.config();

const checkDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');
    console.log(`Database: ${mongoose.connection.name}\n`);

    const userCount = await User.countDocuments();
    const candidateCount = await Candidate.countDocuments();

    console.log(`Total Users: ${userCount}`);
    console.log(`Total Candidates: ${candidateCount}\n`);

    if (userCount > 0) {
      const users = await User.find().limit(5);
      console.log('Sample Users:');
      users.forEach(user => {
        console.log(`  - ${user.name} (${user.email}) - Org: ${user.organization} - Access Level: ${user.accessLevel}`);
      });
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.connection.close();
  }
};

checkDatabase();


