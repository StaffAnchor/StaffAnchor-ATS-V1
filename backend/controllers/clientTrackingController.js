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
    .populate('candidateId', 'name email phone resume') // Populate candidate details
    .select('candidateId clientRounds'); // Select only necessary fields

    const candidatesData = candidateJobLinks.map(link => ({
      _id: link.candidateId._id,
      name: link.candidateId.name,
      email: link.candidateId.email,
      phone: link.candidateId.phone,
      resume: link.candidateId.resume,
      clientRounds: link.clientRounds,
      candidateJobLinkId: link._id, // Add the link ID for status updates
    }));

    res.json({ jobTitle: job.title, candidates: candidatesData });

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