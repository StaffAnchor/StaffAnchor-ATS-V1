const Job = require('../models/Job');
const CandidateJobLink = require('../models/CandidateJobLink');
const Candidate = require('../models/Candidate');

exports.generateClientTrackingLink = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Generate token if it doesn't exist
    if (!job.clientTrackingToken) {
      const crypto = require('crypto');
      job.clientTrackingToken = crypto.randomBytes(20).toString('hex');
      await job.save();
    }

    res.json({ clientTrackingToken: job.clientTrackingToken });

  } catch (error) {
    console.error('Error generating client tracking link:', error);
    res.status(500).json({ error: 'Failed to generate client tracking link' });
  }
};

exports.getCandidatesForClientTracking = async (req, res) => {
  try {
    const { trackingToken } = req.params;

    const job = await Job.findOne({ clientTrackingToken: trackingToken });

    if (!job) {
      return res.status(404).json({ error: 'Job not found or invalid tracking token' });
    }

    // Fetch CandidateJobLink entries for this job with status 'Submitted to Client'
    const candidateJobLinks = await CandidateJobLink.find({ 
      jobId: job._id,
      status: 'Submitted to Client'
    })
    .populate('candidateId', 'name email phone resume currentLocation experience') // Populate candidate details including location and experience
    .select('candidateId clientRounds questionAnswers'); // Select only necessary fields including questionAnswers

    // Filter out links where candidateId is null (deleted candidates)
    const validLinks = candidateJobLinks.filter(link => {
      if (!link.candidateId) {
        console.log('Skipping link with null candidateId (deleted candidate):', link._id);
        return false;
      }
      return true;
    });

    const candidatesData = validLinks.map(link => {
      // Get current CTC from the most recent experience entry
      let currentCTC = 'N/A';
      if (link.candidateId && link.candidateId.experience && link.candidateId.experience.length > 0) {
        // Get the most recent experience (assuming they're ordered by date or we take the first one)
        const latestExperience = link.candidateId.experience[0];
        if (latestExperience.ctc) {
          currentCTC = latestExperience.ctc;
        }
      }

      // Format current location
      let currentLocation = 'N/A';
      if (link.candidateId && link.candidateId.currentLocation) {
        const loc = link.candidateId.currentLocation;
        const locationParts = [];
        if (loc.city) locationParts.push(loc.city);
        if (loc.state) locationParts.push(loc.state);
        if (loc.country) locationParts.push(loc.country);
        currentLocation = locationParts.length > 0 ? locationParts.join(', ') : 'N/A';
      }

      return {
        _id: link.candidateId._id,
        name: link.candidateId.name,
        email: link.candidateId.email,
        phone: link.candidateId.phone,
        resume: link.candidateId.resume,
        currentLocation: currentLocation,
        currentCTC: currentCTC,
        clientRounds: link.clientRounds,
        candidateJobLinkId: link._id, // Add the link ID for status updates
        questionAnswers: link.questionAnswers || [], // Include question answers
      };
    });

    res.json({ 
      jobTitle: job.title, 
      candidates: candidatesData,
      personalizedQuestions: job.personalizedQuestions || [] // Include job questions
    });

  } catch (error) {
    console.error('Error fetching candidates for client tracking:', error);
    res.status(500).json({ error: 'Failed to fetch candidates for client tracking' });
  }
};

exports.updateClientCandidateStatus = async (req, res) => {
  try {
    const { candidateJobLinkId } = req.params;
    const { roundIndex, status, feedback, clientRounds } = req.body;

    const candidateJobLink = await CandidateJobLink.findById(candidateJobLinkId);

    if (!candidateJobLink) {
      return res.status(404).json({ error: 'Candidate-Job link not found' });
    }

    // If clientRounds array is provided, replace the entire array (used for deletion/reordering)
    if (clientRounds && Array.isArray(clientRounds)) {
      candidateJobLink.clientRounds = clientRounds.map(round => ({
        status: round.status || 'Ongoing',
        feedback: round.feedback || '',
        updatedAt: round.updatedAt || new Date()
      }));
    } else if (roundIndex !== undefined) {
      // Update a specific round
      if (!candidateJobLink.clientRounds[roundIndex]) {
        // If the round doesn't exist, create it. This handles adding new rounds from the client side.
        candidateJobLink.clientRounds.push({ status: status || 'Ongoing', feedback: feedback || '', updatedAt: new Date() });
      } else {
        if (status !== undefined) {
          candidateJobLink.clientRounds[roundIndex].status = status;
        }
        if (feedback !== undefined) {
          candidateJobLink.clientRounds[roundIndex].feedback = feedback;
        }
        candidateJobLink.clientRounds[roundIndex].updatedAt = new Date();
      }
    }

    await candidateJobLink.save();

    res.json({ success: true, updatedLink: candidateJobLink });

  } catch (error) {
    console.error('Error updating client candidate status:', error);
    res.status(500).json({ error: 'Failed to update client candidate status' });
  }
};