const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const Skill = require('../models/Skill');
const CandidateJobLink = require('../models/CandidateJobLink');
const Domain = require('../models/Domain');
const TalentPool = require('../models/TalentPool');
const { uploadResume, deleteResume } = require('../config/cloudinary');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const textract = require('textract');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');

// Helper function to save skills to database
const saveSkillsToDatabase = async (skills, userId, organization) => {
  if (!skills || !Array.isArray(skills) || skills.length === 0) {
    return;
  }

  try {
    for (const skillName of skills) {
      if (!skillName || typeof skillName !== 'string') continue;

      const skillNameLower = skillName.toLowerCase().trim();
      
      // Check if skill already exists for this organization
      const existingSkill = await Skill.findOne({ 
        name: skillNameLower,
        organization: organization
      });

      if (existingSkill) {
        // Increment usage count
        await Skill.findByIdAndUpdate(existingSkill._id, {
          $inc: { usageCount: 1 }
        });
      } else {
        // Create new skill
        const newSkill = new Skill({
          name: skillNameLower,
          category: 'sales-and-business-development', // default category
          organization: organization,
          createdBy: userId,
          isCustom: true,
          usageCount: 1
        });
        await newSkill.save();
      }
    }
  } catch (err) {
    console.error('Error saving skills to database:', err);
    // Don't throw error - skills saving is secondary to candidate creation
  }
};

exports.addCandidate = async (req, res) => {
  try {
    // Check if candidate with same email already exists
    const existingCandidate = await Candidate.findOne({ 
      email: req.body.email?.toLowerCase().trim() 
    });
    
    if (existingCandidate) {
      return res.status(400).json({ 
        error: 'A candidate with this email already exists' 
      });
    }
    
    const candidate = new Candidate(req.body);
    await candidate.save();
    
    // Save skills to database if user is authenticated
    if (req.user && req.user.organization && req.body.skills) {
      await saveSkillsToDatabase(req.body.skills, req.user._id, req.user.organization);
    }
    
    res.json(candidate);
  } catch (err) {
    // Handle duplicate key error from MongoDB
    if (err.code === 11000) {
      return res.status(400).json({ 
        error: 'A candidate with this email already exists' 
      });
    }
    console.error('Error adding candidate:', err);
    res.status(500).json({ error: 'Add candidate failed' });
  }
};

// Parse resume using Google Gemini AI
exports.parseResume = async (req, res) => {
  let tempFilePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Save buffer to temporary file for textract
    const fileExt = path.extname(req.file.originalname);
    const tempFileName = `resume_${Date.now()}${fileExt}`;
    tempFilePath = path.join(os.tmpdir(), tempFileName);
    await fs.writeFile(tempFilePath, req.file.buffer);

    // Extract text from resume
    const resumeText = await new Promise((resolve, reject) => {
      textract.fromFileWithPath(tempFilePath, (error, text) => {
        if (error) reject(error);
        else resolve(text);
      });
    });

    // Fetch available domains, talent pools, and skills from database
    const [domains, talentPools, skills] = await Promise.all([
      Domain.find({}).select('_id name description'),
      TalentPool.find({}).populate('domain', 'name').select('_id name description domain'),
      Skill.find({}).populate('talentPool', 'name').select('_id name talentPool')
    ]);

    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Create structured prompt for Gemini
    const prompt = `You are an intelligent resume parser and candidate profiling system. Analyze the following resume and extract structured information. You must also intelligently match the candidate to the most appropriate domain, talent pools, and skills from the available options.

RESUME TEXT:
${resumeText}

AVAILABLE DOMAINS:
${domains.map(d => `- ID: ${d._id}, Name: ${d.name}, Description: ${d.description || 'N/A'}`).join('\n')}

AVAILABLE TALENT POOLS (with their domains):
${talentPools.map(tp => `- ID: ${tp._id}, Name: ${tp.name}, Domain: ${tp.domain?.name || 'N/A'}, Description: ${tp.description || 'N/A'}`).join('\n')}

AVAILABLE SKILLS (with their talent pools):
${skills.slice(0, 200).map(s => `- ID: ${s._id}, Name: ${s.name}, Talent Pool: ${s.talentPool?.name || 'N/A'}`).join('\n')}
${skills.length > 200 ? `\n... and ${skills.length - 200} more skills` : ''}

INSTRUCTIONS:
1. Extract basic information: name, email, phone, LinkedIn username
2. Calculate total experience in years (as a number)
3. Extract current location (city, state, country) - if not found, leave empty
4. Set preferred locations to be same as current location
5. Extract all work experience entries with company, position, role/description, start date, end date
6. Extract all education entries with institution name, degree/course, start date, end date
7. **MOST IMPORTANT**: Analyze the candidate's background and INTELLIGENTLY select:
   - ONE most appropriate domain (must be from the AVAILABLE DOMAINS list)
   - 1-3 most relevant talent pools (must be from the AVAILABLE TALENT POOLS list and should belong to the selected domain)
   - 3-10 most relevant skills (must be from the AVAILABLE SKILLS list and should belong to the selected talent pools)

Be very careful with the selections - they must match the candidate's actual experience and expertise.

Return ONLY valid JSON in this exact format (no markdown, no code blocks, just raw JSON):
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "phone number",
  "linkedin": "linkedin-username-only",
  "totalExperienceYears": 5,
  "totalExperienceMonths": 0,
  "currentLocation": {
    "country": "Country",
    "state": "State",
    "city": "City"
  },
  "preferredLocations": [
    {
      "country": "Country",
      "state": "State",
      "city": "City"
    }
  ],
  "experience": [
    {
      "company": "Company Name",
      "position": "Job Title",
      "role": "Brief description of role and responsibilities",
      "start": "Month Year or Year",
      "end": "Month Year or Year or Present",
      "ctc": ""
    }
  ],
  "education": [
    {
      "clg": "Institution Name",
      "course": "Degree/Program",
      "start": "Year",
      "end": "Year"
    }
  ],
  "selectedDomain": "domain_id_from_list",
  "selectedTalentPools": ["talent_pool_id_1", "talent_pool_id_2"],
  "selectedSkills": ["skill_id_1", "skill_id_2", "skill_id_3"]
}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse the JSON response
    let parsedData;
    try {
      // Remove markdown code blocks if present
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedData = JSON.parse(cleanedText);
    } catch (parseError) {
      throw new Error('Failed to parse AI response. Please try again.');
    }

    // Clean up temp file
    try {
      await fs.unlink(tempFilePath);
    } catch (cleanupError) {
      // Ignore cleanup errors
    }

    res.json(parsedData);

  } catch (err) {
    // Check if it's a rate limit error
    if (err.status === 429 || err.message?.includes('quota') || err.message?.includes('rate limit')) {
      return res.status(429).json({ 
        error: 'AI_RATE_LIMIT',
        message: 'The AI service is currently busy. Please try again in a minute.',
        details: 'Rate limit reached'
      });
    }
    
    // Clean up temp file if exists
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
    }
    
    res.status(500).json({ 
      error: 'Failed to parse resume',
      details: err.message 
    });
  }
};

exports.listCandidates = async (req, res) => {
  try {
    const { domain, talentPools, page = 1, limit = 20, sortBy = '_id', sortOrder = 'desc' } = req.query;
    
    // Build query based on filters
    const query = {};
    if (domain) {
      query.domain = domain;
    }
    if (talentPools) {
      // Support both single and multiple talent pools
      const talentPoolArray = Array.isArray(talentPools) ? talentPools : [talentPools];
      query.talentPools = { $in: talentPoolArray };
    }
    
    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Build sort object - use _id which contains timestamp information
    // This works for all candidates regardless of when they were created
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Get total count for pagination
    const totalCandidates = await Candidate.countDocuments(query);
    
    // Fetch candidates with pagination and sorting
    // Only return basic fields, not full nested arrays
    const candidates = await Candidate.find(query)
      .select('name email phone currentLocation domain talentPools skills resume createdAt updatedAt')
      .populate('domain', 'name')
      .populate('talentPools', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);
    
    res.json({
      candidates,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCandidates / limitNum),
        totalCandidates,
        limit: limitNum,
        hasNextPage: pageNum < Math.ceil(totalCandidates / limitNum),
        hasPrevPage: pageNum > 1
      }
    });
  } catch (err) {
    console.error('Error fetching candidates:', err);
    res.status(500).json({ error: 'Fetch candidates failed' });
  }
};

exports.candidateDetails = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .populate('domain', 'name description')
      .populate('talentPools', 'name description')
      .populate('expertiseSkills', 'name category')
      .populate('appliedJobs', 'title organization');
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ error: 'Fetch candidate failed' });
  }
};

exports.updateCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    
    // Save skills to database if user is authenticated
    if (req.user && req.user.organization && req.body.skills) {
      await saveSkillsToDatabase(req.body.skills, req.user._id, req.user.organization);
    }
    
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ error: 'Update candidate failed' });
  }
};

exports.findSuitableJobs = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const candidate = await Candidate.findById(candidateId);
    
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const jobs = await Job.find();
    const scoredJobs = [];

    // Helper function for fuzzy string matching
    const fuzzyMatch = (str1, str2, threshold = 0.6) => {
      if (!str1 || !str2) return 0;
      
      const s1 = str1.toLowerCase();
      const s2 = str2.toLowerCase();
      
      // Exact match gets highest score
      if (s1 === s2) return 1.0;
      
      // Check if one contains the other
      if (s1.includes(s2) || s2.includes(s1)) return 0.9;
      
      // Calculate similarity using Levenshtein distance
      const longer = s1.length > s2.length ? s1 : s2;
      const shorter = s1.length > s2.length ? s2 : s1;
      
      if (longer.length === 0) return 1.0;
      
      const distance = levenshteinDistance(longer, shorter);
      const similarity = (longer.length - distance) / longer.length;
      
      return similarity >= threshold ? similarity : 0;
    };

    // Levenshtein distance calculation
    const levenshteinDistance = (str1, str2) => {
      const matrix = [];
      
      for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
      }
      
      for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
      }
      
      for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
          if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
          }
        }
      }
      
      return matrix[str2.length][str1.length];
    };

    for (const job of jobs) {
      let score = 0;
      let matchDetails = [];
      let totalScore = 0;

      // 1. SKILLS MATCHING - Compare candidate skills with job required skills (25% weight)
      if (candidate.skills && candidate.skills.length > 0) {
        let skillsMatched = 0;
        let totalSkillScore = 0;
        let matchedSkillsList = [];
        
        // If job has skills array, compare directly
        if (job.skills && job.skills.length > 0) {
          candidate.skills.forEach(candidateSkill => {
            const candidateSkillLower = candidateSkill.toLowerCase().trim();
            
            // Check for exact matches in job skills
            const exactMatch = job.skills.find(jobSkill => 
              jobSkill.toLowerCase().trim() === candidateSkillLower
            );
            
            if (exactMatch) {
              totalSkillScore += 3;
              skillsMatched++;
              matchedSkillsList.push(candidateSkill);
            } else {
              // Use fuzzy matching for partial matches
              let bestFuzzyScore = 0;
              job.skills.forEach(jobSkill => {
                const fuzzyScore = fuzzyMatch(candidateSkill, jobSkill, 0.7);
                if (fuzzyScore > bestFuzzyScore) {
                  bestFuzzyScore = fuzzyScore;
                }
              });
              
              if (bestFuzzyScore > 0) {
                totalSkillScore += bestFuzzyScore * 2;
                skillsMatched++;
                matchedSkillsList.push(candidateSkill);
              }
            }
          });
          
          if (skillsMatched > 0) {
            const skillScore = Math.min(25, (totalSkillScore / candidate.skills.length) * 25);
            score += skillScore;
            totalScore += 25;
            matchDetails.push(`Skills Match: ${skillsMatched}/${candidate.skills.length} matched (${matchedSkillsList.join(', ')}) = ${skillScore.toFixed(1)}/25`);
          }
        } else if (job.description) {
          // Fallback: Match skills against job description if no skills array
          const jobDescriptionLower = job.description.toLowerCase();
          
          candidate.skills.forEach(skill => {
            const skillLower = skill.toLowerCase();
            
            if (jobDescriptionLower.includes(skillLower)) {
              totalSkillScore += 3;
              skillsMatched++;
              matchedSkillsList.push(skill);
            } else {
              const fuzzyScore = fuzzyMatch(skill, jobDescriptionLower, 0.3);
              if (fuzzyScore > 0) {
                totalSkillScore += fuzzyScore * 2;
                skillsMatched++;
                matchedSkillsList.push(skill);
              }
            }
          });

          if (skillsMatched > 0) {
            const skillScore = Math.min(25, (totalSkillScore / candidate.skills.length) * 25);
            score += skillScore;
            totalScore += 25;
            matchDetails.push(`Skills vs Description: ${skillsMatched}/${candidate.skills.length} matched = ${skillScore.toFixed(1)}/25`);
          }
        }
      }

      // 2. JOB DESCRIPTION vs EXPERIENCE TITLES MATCHING (25% weight)
      if (job.description && candidate.experience && candidate.experience.length > 0) {
        const jobDescriptionLower = job.description.toLowerCase();
        let experienceMatched = 0;
        let totalExperienceScore = 0;
        
        candidate.experience.forEach(exp => {
          if (exp.position) {
            const positionLower = exp.position.toLowerCase();
            // Check for exact matches first
            if (jobDescriptionLower.includes(positionLower)) {
              totalExperienceScore += 3;
              experienceMatched++;
            } else {
              // Use fuzzy matching for partial matches
              const fuzzyScore = fuzzyMatch(positionLower, jobDescriptionLower, 0.2);
              if (fuzzyScore > 0) {
                totalExperienceScore += fuzzyScore * 2;
                experienceMatched++;
              }
            }
          }
        });

        if (experienceMatched > 0) {
          const experienceScore = Math.min(25, (totalExperienceScore / experienceMatched) * 25);
          score += experienceScore;
          totalScore += 25;
          matchDetails.push(`Experience Titles vs Description: ${experienceMatched} roles matched = ${experienceScore.toFixed(1)}/25`);
        }
      }

      // 3. REQUIRED WORK EXPERIENCE IN YEARS (30% weight)
      if (job.experience !== undefined && candidate.experience && candidate.experience.length > 0) {
        let totalYears = 0;
        let validExperiences = 0;
        
        candidate.experience.forEach(exp => {
          if (exp.start && exp.end) {
            // Handle different date formats
            let start, end;
            
            // Try parsing as years first
            start = parseInt(exp.start);
            end = parseInt(exp.end);
            
            if (!isNaN(start) && !isNaN(end) && start > 1900 && end > 1900) {
              // Valid years
              totalYears += end - start;
              validExperiences++;
            } else {
              // Try parsing as dates
              const startDate = new Date(exp.start);
              const endDate = new Date(exp.end);
              
              if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                const yearsDiff = (endDate - startDate) / (1000 * 60 * 60 * 24 * 365.25);
                totalYears += yearsDiff;
                validExperiences++;
              }
            }
          }
        });

        if (validExperiences > 0) {
          let experienceScore = 0;
          
          if (totalYears >= job.experience) {
            experienceScore = 30; // Perfect match
            matchDetails.push(`Years Experience: ${totalYears.toFixed(1)} years (meets requirement: ${job.experience}) = 30/30`);
          } else if (totalYears >= job.experience * 0.8) {
            experienceScore = 25; // Close match
            matchDetails.push(`Years Experience: ${totalYears.toFixed(1)} years (close to requirement: ${job.experience}) = 25/30`);
          } else if (totalYears >= job.experience * 0.6) {
            experienceScore = 20; // Partial match
            matchDetails.push(`Years Experience: ${totalYears.toFixed(1)} years (partial match: ${job.experience}) = 20/30`);
          } else if (totalYears >= job.experience * 0.4) {
            experienceScore = 15; // Basic match
            matchDetails.push(`Years Experience: ${totalYears.toFixed(1)} years (basic match: ${job.experience}) = 15/30`);
          } else {
            experienceScore = 10; // Below requirement but some experience
            matchDetails.push(`Years Experience: ${totalYears.toFixed(1)} years (below requirement: ${job.experience}) = 10/30`);
          }
          
          score += experienceScore;
          totalScore += 30;
        }
      }

      // 4. LOCATION MATCHING (20% weight)
      if (job.location && candidate.preferredLocations && candidate.preferredLocations.length > 0) {
        const jobLocationLower = job.location.toLowerCase();
        let locationScore = 0;
        let bestLocationMatch = '';
        
        candidate.preferredLocations.forEach(prefLoc => {
          let currentScore = 0;
          
          // Check for exact matches first
          if (prefLoc.city && jobLocationLower.includes(prefLoc.city.toLowerCase())) {
            currentScore = 20;
            bestLocationMatch = `City: ${prefLoc.city}`;
          } else if (prefLoc.state && jobLocationLower.includes(prefLoc.state.toLowerCase())) {
            currentScore = 16;
            bestLocationMatch = `State: ${prefLoc.state}`;
          } else if (prefLoc.country && jobLocationLower.includes(prefLoc.country.toLowerCase())) {
            currentScore = 12;
            bestLocationMatch = `Country: ${prefLoc.country}`;
          }
          
          // Check for fuzzy matches
          if (currentScore === 0) {
            if (prefLoc.city) {
              const fuzzyScore = fuzzyMatch(prefLoc.city, jobLocationLower, 0.5);
              if (fuzzyScore > 0) {
                currentScore = fuzzyScore * 16;
                bestLocationMatch = `City (fuzzy): ${prefLoc.city}`;
              }
            }
            if (prefLoc.state && currentScore === 0) {
              const fuzzyScore = fuzzyMatch(prefLoc.state, jobLocationLower, 0.5);
              if (fuzzyScore > 0) {
                currentScore = fuzzyScore * 12;
                bestLocationMatch = `State (fuzzy): ${prefLoc.state}`;
              }
            }
          }
          
          locationScore = Math.max(locationScore, currentScore);
        });
        
        if (locationScore > 0) {
          score += locationScore;
          totalScore += 20;
          matchDetails.push(`Location: ${bestLocationMatch} = ${locationScore.toFixed(1)}/20`);
        }
      }

      // Only include jobs with meaningful matches
      if (score > 0) {
        // Calculate percentage score
        const percentageScore = totalScore > 0 ? (score / totalScore) * 100 : 0;
        
        scoredJobs.push({
          job,
          score: Math.round(percentageScore),
          rawScore: Math.round(score),
          totalPossible: totalScore,
          matchDetails
        });
      }
    }

    // Get limit from query parameter, default to 10
    const limit = parseInt(req.query.limit) || 10;
    
    // Sort by percentage score (highest first) and return requested number of results
    const topJobs = scoredJobs
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => ({
        _id: item.job._id,
        title: item.job.title,
        organization: item.job.organization,
        location: item.job.location,
        experience: item.job.experience,
        industry: item.job.industry,
        description: item.job.description,
        remote: item.job.remote,
        ctc: item.job.ctc,
        score: item.score,
        matchDetails: item.matchDetails
      }));

    res.json({
      candidate: {
        _id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        skills: candidate.skills,
        experience: candidate.experience,
        currentLocation: candidate.currentLocation,
        preferredLocations: candidate.preferredLocations
      },
      suitableJobs: topJobs,
      totalJobs: scoredJobs.length
    });

  } catch (err) {
    console.error('Error finding suitable jobs:', err);
    res.status(500).json({ error: 'Failed to find suitable jobs' });
  }
};

exports.deleteCandidate = async (req, res) => {
  try {
    const { candidateId } = req.params;
    
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Delete resume from Cloudinary if exists
    if (candidate.resume && candidate.resume.publicId) {
      try {
        await deleteResume(candidate.resume.publicId);
      } catch (cloudinaryError) {
        console.error('Error deleting resume from Cloudinary:', cloudinaryError);
        // Continue with candidate deletion even if Cloudinary deletion fails
      }
    }

    await Candidate.findByIdAndDelete(candidateId);
    res.json({ message: 'Candidate deleted successfully' });
  } catch (err) {
    console.error('Error deleting candidate:', err);
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
};

// Upload resume for a candidate
exports.uploadResume = async (req, res) => {
  try {
    const { candidateId } = req.params;
    
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get candidate
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Delete old resume from Cloudinary if exists
    if (candidate.resume && candidate.resume.publicId) {
      try {
        await deleteResume(candidate.resume.publicId);
      } catch (cloudinaryError) {
        console.error('Error deleting old resume:', cloudinaryError);
      }
    }

    // Upload new resume to Cloudinary
    const uploadResult = await uploadResume(
      req.file.buffer,
      req.file.originalname,
      candidate.name
    );

    // Update candidate with resume details
    candidate.resume = {
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      fileName: uploadResult.fileName,
      fileSize: uploadResult.fileSize,
      uploadedAt: new Date()
    };

    await candidate.save();

    res.json({
      message: 'Resume uploaded successfully',
      resume: candidate.resume
    });
  } catch (err) {
    console.error('Error uploading resume:', err);
    res.status(500).json({ 
      error: 'Failed to upload resume',
      details: err.message 
    });
  }
};

// Delete resume for a candidate
exports.deleteResumeOnly = async (req, res) => {
  try {
    const { candidateId } = req.params;
    
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    if (!candidate.resume || !candidate.resume.publicId) {
      return res.status(404).json({ error: 'No resume found for this candidate' });
    }

    // Delete from Cloudinary
    await deleteResume(candidate.resume.publicId);

    // Remove resume from candidate document
    candidate.resume = undefined;
    await candidate.save();

    res.json({ message: 'Resume deleted successfully' });
  } catch (err) {
    console.error('Error deleting resume:', err);
    res.status(500).json({ error: 'Failed to delete resume' });
  }
};

// Public job application submission (no auth required)
exports.submitPublicJobApplication = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Verify job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if candidate with this email already exists
    let candidate = await Candidate.findOne({ email: req.body.email });
    
    if (candidate) {
      // Candidate exists - just link to the job, don't update their data
      if (!candidate.appliedJobs.includes(jobId)) {
        candidate.appliedJobs.push(jobId);
        await candidate.save();
      }
    } else {
      // Create new candidate with applied job
      candidate = new Candidate({
        ...req.body,
        appliedJobs: [jobId]
      });
      await candidate.save();

      // Add candidate to talent pools if provided
      if (req.body.talentPools && req.body.talentPools.length > 0) {
        const TalentPool = require('../models/TalentPool');
        for (const poolId of req.body.talentPools) {
          try {
            await TalentPool.findByIdAndUpdate(
              poolId,
              { $addToSet: { candidates: candidate._id } }
            );
          } catch (poolError) {
            console.error('Error adding candidate to talent pool:', poolError);
            // Don't fail the application if pool linking fails
          }
        }
      }
    }

    // Create candidate-job link with source "applied-through-link"
    try {
      await CandidateJobLink.findOneAndUpdate(
        { candidateId: candidate._id, jobId },
        {
          candidateId: candidate._id,
          jobId,
          source: 'applied-through-link',
          status: 'Applied'
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } catch (linkError) {
      // Log error but don't fail the application
      console.error('Error creating candidate-job link:', linkError);
    }
    
    res.json({ 
      message: 'Application submitted successfully!',
      candidate: {
        _id: candidate._id,
        name: candidate.name,
        email: candidate.email
      }
    });
  } catch (err) {
    console.error('Error submitting job application:', err);
    res.status(500).json({ error: 'Failed to submit application', details: err.message });
  }
};

// Public general candidate submission (no auth required, no specific job)
exports.submitPublicCandidate = async (req, res) => {
  try {
    // Check if candidate with this email already exists
    let candidate = await Candidate.findOne({ email: req.body.email });
    
    if (candidate) {
      // Candidate exists - update their data
      Object.assign(candidate, req.body);
      await candidate.save();
    } else {
      // Create new candidate without applied jobs
      candidate = new Candidate(req.body);
      await candidate.save();

      // Add candidate to talent pools if provided
      if (req.body.talentPools && req.body.talentPools.length > 0) {
        const TalentPool = require('../models/TalentPool');
        for (const poolId of req.body.talentPools) {
          try {
            await TalentPool.findByIdAndUpdate(
              poolId,
              { $addToSet: { candidates: candidate._id } }
            );
          } catch (poolError) {
            console.error('Error adding candidate to talent pool:', poolError);
            // Don't fail the submission if pool linking fails
          }
        }
      }
    }
    
    res.json({ 
      message: 'Profile submitted successfully!',
      candidate: {
        _id: candidate._id,
        name: candidate.name,
        email: candidate.email
      }
    });
  } catch (err) {
    console.error('Error submitting candidate profile:', err);
    res.status(500).json({ error: 'Failed to submit profile', details: err.message });
  }
};

// Get candidates who applied to a specific job
exports.getCandidatesByJobApplication = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Verify job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Find all candidates who have this job in their appliedJobs array
    const candidates = await Candidate.find({ appliedJobs: jobId });
    
    res.json({
      job: {
        _id: job._id,
        title: job.title,
        organization: job.organization
      },
      candidates: candidates,
      totalCandidates: candidates.length
    });
  } catch (err) {
    console.error('Error fetching candidates by job application:', err);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
};
