const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const Skill = require('../models/Skill');
const CandidateJobLink = require('../models/CandidateJobLink');
const { uploadResume, deleteResume } = require('../config/cloudinary');

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
    const candidate = new Candidate(req.body);
    await candidate.save();
    
    // Save skills to database if user is authenticated
    if (req.user && req.user.organization && req.body.skills) {
      await saveSkillsToDatabase(req.body.skills, req.user._id, req.user.organization);
    }
    
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ error: 'Add candidate failed' });
  }
};

exports.listCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find();
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ error: 'Fetch candidates failed' });
  }
};

exports.candidateDetails = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id).populate('talentPools', 'name description');
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
        //console.log('Resume deleted from Cloudinary');
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
        //console.log('Old resume deleted from Cloudinary');
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
      // Update existing candidate and add job to appliedJobs if not already there
      Object.assign(candidate, req.body);
      
      if (!candidate.appliedJobs.includes(jobId)) {
        candidate.appliedJobs.push(jobId);
      }
      
      await candidate.save();
    } else {
      // Create new candidate with applied job
      candidate = new Candidate({
        ...req.body,
        appliedJobs: [jobId]
      });
      await candidate.save();
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
