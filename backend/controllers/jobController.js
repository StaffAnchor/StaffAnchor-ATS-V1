const Job = require('../models/Job');
const Candidate = require('../models/Candidate');
const Client = require('../models/Client');

exports.addJob = async (req, res) => {
  try {
    const job = new Job(req.body);
    await job.save();
    
    // If clientId is provided, add this job to the client's jobs array
    if (req.body.clientId) {
      await Client.findByIdAndUpdate(
        req.body.clientId,
        { $addToSet: { jobs: job._id } }
      );
    }
    
    // Return job with a flag to trigger email notification in frontend
    res.json({ 
      ...job.toObject(),
      _emailNotificationPending: true,
      _creatorId: req.user?.id || req.body.createdBy
    });
  } catch (err) {
    console.error('Add job error:', err);
    res.status(500).json({ error: 'Add job failed' });
  }
};

exports.listJobs = async (req, res) => {
  try {
    const jobs = await Job.find();
    // Ensure all jobs have a status field (with default if missing)
    const jobsWithStatus = jobs.map(job => {
      const jobObj = job.toObject();
      if (!jobObj.status) {
        jobObj.status = 'New';
      }
      return jobObj;
    });
    res.json(jobsWithStatus);
  } catch (err) {
    res.status(500).json({ error: 'Fetch jobs failed' });
  }
};

exports.jobDetails = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    // Ensure job has a status field (with default if missing)
    const jobObj = job.toObject();
    if (!jobObj.status) {
      jobObj.status = 'New';
    }
    res.json(jobObj);
  } catch (err) {
    res.status(500).json({ error: 'Fetch job failed' });
  }
};

exports.testEndpoint = async (req, res) => {
  res.json({ message: 'Job controller is working', timestamp: new Date().toISOString() });
};

exports.updateJob = async (req, res) => {
  try {
    //console.log('=== UPDATE JOB REQUEST ===');
    //console.log('Job ID:', req.params.id);
    //console.log('Request body:', JSON.stringify(req.body, null, 2));

    // Validate the job ID
    if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      //console.log('Invalid job ID format:', req.params.id);
      return res.status(400).json({ error: 'Invalid job ID format' });
    }

    // Check if job exists first
    const existingJob = await Job.findById(req.params.id);
    if (!existingJob) {
      //console.log('Job not found with ID:', req.params.id);
      return res.status(404).json({ error: 'Job not found' });
    }

    //console.log('Existing job found:', existingJob);

    // Clean the update data - remove undefined and null values
    const cleanUpdateData = {};
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined && req.body[key] !== null && req.body[key] !== '') {
        cleanUpdateData[key] = req.body[key];
      }
    });

    // If status is not in the update but the job doesn't have a status, set default
    if (!cleanUpdateData.status && !existingJob.status) {
      cleanUpdateData.status = 'New';
    }

    //console.log('Cleaned update data:', JSON.stringify(cleanUpdateData, null, 2));

    // Use findOneAndUpdate instead of findByIdAndUpdate to avoid write concern issues
    const updatedJob = await Job.findOneAndUpdate(
      { _id: req.params.id }, 
      cleanUpdateData, 
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!updatedJob) {
      //console.log('Job not found after update');
      return res.status(404).json({ error: 'Job not found after update' });
    }

    // Ensure status is always present in response (with default if missing)
    const responseJob = updatedJob.toObject();
    if (!responseJob.status) {
      responseJob.status = 'New';
    }

    //console.log('Job updated successfully:', responseJob);
    res.json(responseJob);
  } catch (err) {
    console.error('=== ERROR UPDATING JOB ===');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    
    // Provide more specific error messages
    if (err.name === 'ValidationError') {
      const validationErrors = Object.keys(err.errors).map(key => err.errors[key].message);
      console.error('Validation errors:', validationErrors);
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }
    
    if (err.name === 'CastError') {
      console.error('Cast error details:', err);
      return res.status(400).json({ error: 'Invalid data format' });
    }
    
    res.status(500).json({ 
      error: 'Update job failed', 
      details: err.message 
    });
  }
};

exports.findSuitableCandidates = async (req, res) => {
  try {
    const { jobId } = req.params;
    const preferences = req.body.preferences || {
      skillsVsDescription: 50,
      experienceVsDescription: 50,
      yearsOfExperience: 50,
      location: 50
    };
    
    const job = await Job.findById(jobId).populate('skills', 'name').lean();
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const candidates = await Candidate.find().populate('skills', 'name').lean();
    const scoredCandidates = [];

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

    for (const candidate of candidates) {
      let score = 0;
      let matchDetails = [];
      let totalScore = 0;
      let individualScores = {
        skills: 0,
        experience: 0,
        yearsOfExp: 0,
        location: 0
      };

      // 1. SKILLS MATCHING - Compare candidate skills with job required skills
      if (candidate.skills && candidate.skills.length > 0) {
        let skillsMatched = 0;
        let totalSkillScore = 0;
        let matchedSkillsList = [];
        
        // If job has skills array, compare directly
        if (job.skills && job.skills.length > 0) {
          candidate.skills.forEach(candidateSkill => {
            // Extract skill name from populated object or use as string
            const candidateSkillName = candidateSkill?.name || candidateSkill;
            const candidateSkillLower = candidateSkillName.toLowerCase().trim();
            
            // Check for exact matches in job skills
            const exactMatch = job.skills.find(jobSkill => {
              const jobSkillName = jobSkill?.name || jobSkill;
              return jobSkillName.toLowerCase().trim() === candidateSkillLower;
            });
            
            if (exactMatch) {
              totalSkillScore += 3;
              skillsMatched++;
              matchedSkillsList.push(candidateSkillName);
            } else {
              // Use fuzzy matching for partial matches
              let bestFuzzyScore = 0;
              job.skills.forEach(jobSkill => {
                const jobSkillName = jobSkill?.name || jobSkill;
                const fuzzyScore = fuzzyMatch(candidateSkillName, jobSkillName, 0.7);
                if (fuzzyScore > bestFuzzyScore) {
                  bestFuzzyScore = fuzzyScore;
                }
              });
              
              if (bestFuzzyScore > 0) {
                totalSkillScore += bestFuzzyScore * 2;
                skillsMatched++;
                matchedSkillsList.push(candidateSkillName);
              }
            }
          });
          
          if (skillsMatched > 0) {
            const skillScore = Math.min(100, (totalSkillScore / candidate.skills.length) * 100);
            individualScores.skills = skillScore;
            const weightedScore = (skillScore / 100) * (preferences.skillsVsDescription / 100) * 100;
            score += weightedScore;
            totalScore += (preferences.skillsVsDescription / 100) * 100;
            matchDetails.push(`Skills Match: ${skillsMatched}/${candidate.skills.length} matched (${matchedSkillsList.join(', ')}) = ${skillScore.toFixed(1)}%`);
          }
        } else if (job.description) {
          // Fallback: Match skills against job description if no skills array
          const jobDescriptionLower = job.description.toLowerCase();
          
          candidate.skills.forEach(skill => {
            // Extract skill name from populated object or use as string
            const skillName = skill?.name || skill;
            const skillLower = skillName.toLowerCase();
            
            if (jobDescriptionLower.includes(skillLower)) {
              totalSkillScore += 3;
              skillsMatched++;
              matchedSkillsList.push(skillName);
            } else {
              const fuzzyScore = fuzzyMatch(skillName, jobDescriptionLower, 0.3);
              if (fuzzyScore > 0) {
                totalSkillScore += fuzzyScore * 2;
                skillsMatched++;
                matchedSkillsList.push(skillName);
              }
            }
          });

          if (skillsMatched > 0) {
            const skillScore = Math.min(100, (totalSkillScore / candidate.skills.length) * 100);
            individualScores.skills = skillScore;
            const weightedScore = (skillScore / 100) * (preferences.skillsVsDescription / 100) * 100;
            score += weightedScore;
            totalScore += (preferences.skillsVsDescription / 100) * 100;
            matchDetails.push(`Skills vs Description: ${skillsMatched}/${candidate.skills.length} matched = ${skillScore.toFixed(1)}%`);
          }
        }
      }

      // 2. JOB DESCRIPTION vs EXPERIENCE TITLES MATCHING
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
          const experienceScore = Math.min(100, (totalExperienceScore / experienceMatched) * 100);
          individualScores.experience = experienceScore;
          const weightedScore = (experienceScore / 100) * (preferences.experienceVsDescription / 100) * 100;
          score += weightedScore;
          totalScore += (preferences.experienceVsDescription / 100) * 100;
          matchDetails.push(`Experience Titles vs Description: ${experienceMatched} roles matched = ${experienceScore.toFixed(1)}%`);
        }
      }

      // 3. REQUIRED WORK EXPERIENCE IN YEARS
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
            experienceScore = 100; // Perfect match
            matchDetails.push(`Years Experience: ${totalYears.toFixed(1)} years (meets requirement: ${job.experience}) = 100%`);
          } else if (totalYears >= job.experience * 0.8) {
            experienceScore = 85; // Close match
            matchDetails.push(`Years Experience: ${totalYears.toFixed(1)} years (close to requirement: ${job.experience}) = 85%`);
          } else if (totalYears >= job.experience * 0.6) {
            experienceScore = 70; // Partial match
            matchDetails.push(`Years Experience: ${totalYears.toFixed(1)} years (partial match: ${job.experience}) = 70%`);
          } else if (totalYears >= job.experience * 0.4) {
            experienceScore = 55; // Basic match
            matchDetails.push(`Years Experience: ${totalYears.toFixed(1)} years (basic match: ${job.experience}) = 55%`);
          } else {
            experienceScore = 40; // Below requirement but some experience
            matchDetails.push(`Years Experience: ${totalYears.toFixed(1)} years (below requirement: ${job.experience}) = 40%`);
          }
          
          individualScores.yearsOfExp = experienceScore;
          const weightedScore = (experienceScore / 100) * (preferences.yearsOfExperience / 100) * 100;
          score += weightedScore;
          totalScore += (preferences.yearsOfExperience / 100) * 100;
        }
      }

      // 4. LOCATION MATCHING
      if (job.location && candidate.preferredLocations && candidate.preferredLocations.length > 0) {
        const jobLocationLower = job.location.toLowerCase();
        let locationScore = 0;
        let bestLocationMatch = '';
        
        candidate.preferredLocations.forEach(prefLoc => {
          let currentScore = 0;
          
          // Check for exact matches first
          if (prefLoc.city && jobLocationLower.includes(prefLoc.city.toLowerCase())) {
            currentScore = 100;
            bestLocationMatch = `City: ${prefLoc.city}`;
          } else if (prefLoc.state && jobLocationLower.includes(prefLoc.state.toLowerCase())) {
            currentScore = 80;
            bestLocationMatch = `State: ${prefLoc.state}`;
          } else if (prefLoc.country && jobLocationLower.includes(prefLoc.country.toLowerCase())) {
            currentScore = 60;
            bestLocationMatch = `Country: ${prefLoc.country}`;
          }
          
          // Check for fuzzy matches
          if (currentScore === 0) {
            if (prefLoc.city) {
              const fuzzyScore = fuzzyMatch(prefLoc.city, jobLocationLower, 0.5);
              if (fuzzyScore > 0) {
                currentScore = fuzzyScore * 80;
                bestLocationMatch = `City (fuzzy): ${prefLoc.city}`;
              }
            }
            if (prefLoc.state && currentScore === 0) {
              const fuzzyScore = fuzzyMatch(prefLoc.state, jobLocationLower, 0.5);
              if (fuzzyScore > 0) {
                currentScore = fuzzyScore * 60;
                bestLocationMatch = `State (fuzzy): ${prefLoc.state}`;
              }
            }
          }
          
          locationScore = Math.max(locationScore, currentScore);
        });
        
        if (locationScore > 0) {
          individualScores.location = locationScore;
          const weightedScore = (locationScore / 100) * (preferences.location / 100) * 100;
          score += weightedScore;
          totalScore += (preferences.location / 100) * 100;
          matchDetails.push(`Location: ${bestLocationMatch} = ${locationScore.toFixed(1)}%`);
        }
      }

      // Always include all 4 components in the total score calculation
      // This ensures that when all weights are equal, we get a simple average
      const allComponentsTotalWeight = (
        (preferences.skillsVsDescription / 100) +
        (preferences.experienceVsDescription / 100) +
        (preferences.yearsOfExperience / 100) +
        (preferences.location / 100)
      ) * 100; // Convert back to percentage scale
      
      // If totalScore is less than allComponentsTotalWeight, it means some components didn't match
      // In that case, we should still calculate based on all components
      const effectiveTotalScore = Math.max(totalScore, allComponentsTotalWeight);
      
      // Only include candidates with meaningful matches
      if (score > 0 || allComponentsTotalWeight > 0) {
        // Calculate percentage score
        // If all weights are equal, this becomes a simple average of individual scores
        const percentageScore = effectiveTotalScore > 0 ? (score / effectiveTotalScore) * 100 : 0;
        
        // Alternative calculation: if all weights are equal, use simple average
        const weightValues = [
          preferences.skillsVsDescription,
          preferences.experienceVsDescription,
          preferences.yearsOfExperience,
          preferences.location
        ];
        const allWeightsEqual = weightValues.every(w => Math.abs(w - weightValues[0]) < 0.01);
        
        let finalScore = percentageScore;
        if (allWeightsEqual && effectiveTotalScore > 0) {
          // Simple average: sum of all individual scores / 4
          const sumOfScores = (individualScores.skills || 0) + 
                             (individualScores.experience || 0) + 
                             (individualScores.yearsOfExp || 0) + 
                             (individualScores.location || 0);
          finalScore = sumOfScores / 4;
        }
        
        scoredCandidates.push({
          candidate,
          score: Math.round(finalScore),
          rawScore: Math.round(score),
          totalPossible: effectiveTotalScore,
          matchDetails,
          individualScores,
          preferences
        });
      }
    }

    // Get limit from query parameter, default to 10
    const limit = parseInt(req.query.limit) || 10;
    
    // Sort by percentage score (highest first) and return requested number of results
    const topCandidates = scoredCandidates
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => {
        // Since we used .lean(), candidate is already a plain object
        const candidate = item.candidate;
        
        // Build candidate data object
        const candidateData = {
          _id: candidate._id,
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          score: item.score,
          matchDetails: item.matchDetails,
          skills: candidate.skills,
          experience: candidate.experience,
          currentLocation: candidate.currentLocation,
          preferredLocations: candidate.preferredLocations,
          individualScores: item.individualScores,
          preferences: item.preferences
        };
        
        // Explicitly include resume field - check if it exists and has a URL
        if (candidate.resume && candidate.resume.url) {
          candidateData.resume = {
            url: candidate.resume.url,
            publicId: candidate.resume.publicId,
            fileName: candidate.resume.fileName,
            fileSize: candidate.resume.fileSize,
            uploadedAt: candidate.resume.uploadedAt
          };
        } else {
          candidateData.resume = null;
        }
        
        // Include all other candidate fields that might be needed
        if (candidate.education) candidateData.education = candidate.education;
        if (candidate.certifications) candidateData.certifications = candidate.certifications;
        if (candidate.linkedin) candidateData.linkedin = candidate.linkedin;
        if (candidate.x) candidateData.x = candidate.x;
        if (candidate.additionalLinks) candidateData.additionalLinks = candidate.additionalLinks;
        
        return candidateData;
      });

    res.json({
      job: {
        _id: job._id,
        title: job.title,
        organization: job.organization,
        location: job.location,
        experience: job.experience,
        industry: job.industry,
        description: job.description
      },
      suitableCandidates: topCandidates,
      totalCandidates: scoredCandidates.length
    });

  } catch (err) {
    console.error('Error finding suitable candidates:', err);
    res.status(500).json({ error: 'Failed to find suitable candidates' });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    await Job.findByIdAndDelete(jobId);
    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    console.error('Error deleting job:', err);
    res.status(500).json({ error: 'Failed to delete job' });
  }
};
