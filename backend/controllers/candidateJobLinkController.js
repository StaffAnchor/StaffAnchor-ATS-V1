const CandidateJobLink = require('../models/CandidateJobLink');
const Candidate = require('../models/Candidate');
const Job = require('../models/Job');

// Link candidates to a job
exports.linkCandidatesToJob = async (req, res) => {
  try {
    const { candidateIds, jobId, source = 'manual-link', notes } = req.body;
    const linkedBy = req.user._id;

    if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      return res.status(400).json({ error: 'candidateIds must be a non-empty array' });
    }

    if (!jobId) {
      return res.status(400).json({ error: 'jobId is required' });
    }

    // Verify job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Verify all candidates exist
    const candidates = await Candidate.find({ _id: { $in: candidateIds } });
    if (candidates.length !== candidateIds.length) {
      return res.status(404).json({ error: 'One or more candidates not found' });
    }

    const links = [];
    const errors = [];

    for (const candidateId of candidateIds) {
      try {
        // Try to create link, ignore if duplicate
        const link = await CandidateJobLink.findOneAndUpdate(
          { candidateId, jobId },
          { 
            candidateId, 
            jobId, 
            source, 
            linkedBy, 
            notes,
            status: 'New'
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        links.push(link);
      } catch (error) {
        if (error.code === 11000) {
          // Duplicate key error - link already exists, fetch it
          const existingLink = await CandidateJobLink.findOne({ candidateId, jobId });
          links.push(existingLink);
        } else {
          errors.push({ candidateId, error: error.message });
        }
      }
    }

    res.json({
      success: true,
      message: `Successfully linked ${links.length} candidate(s) to job`,
      links,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error linking candidates to job:', error);
    res.status(500).json({ error: 'Failed to link candidates to job' });
  }
};

// Get all candidates linked to a job
exports.getLinkedCandidates = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({ error: 'jobId is required' });
    }

    const links = await CandidateJobLink.find({ jobId })
      .populate('candidateId')
      .populate({
        path: 'linkedBy',
        select: 'fullName email',
        strictPopulate: false
      })
      .sort({ createdAt: -1 });

    console.log(`Found ${links.length} links for job ${jobId}`);

    // Format response with candidate details and link info
    // Filter out links where candidateId is null (deleted candidates)
    const linkedCandidates = links
      .filter(link => {
        if (!link.candidateId) {
          console.log('Skipping link with null candidateId:', link._id);
          return false;
        }
        return true;
      })
      .map(link => {
        try {
          return {
            ...link.candidateId.toObject(),
            linkInfo: {
              source: link.source,
              linkedBy: link.linkedBy,
              linkedAt: link.createdAt,
              status: link.status,
              notes: link.notes,
              linkId: link._id
            }
          };
        } catch (err) {
          console.error('Error mapping link:', link._id, err);
          return null;
        }
      })
      .filter(c => c !== null);

    console.log(`Returning ${linkedCandidates.length} linked candidates`);

    res.json({
      success: true,
      count: linkedCandidates.length,
      candidates: linkedCandidates
    });
  } catch (error) {
    console.error('Error fetching linked candidates:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch linked candidates',
      details: error.message 
    });
  }
};

// Unlink candidate from job
exports.unlinkCandidateFromJob = async (req, res) => {
  try {
    const { linkId } = req.params;

    if (!linkId) {
      return res.status(400).json({ error: 'linkId is required' });
    }

    const link = await CandidateJobLink.findByIdAndDelete(linkId);

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    res.json({
      success: true,
      message: 'Candidate unlinked from job successfully'
    });
  } catch (error) {
    console.error('Error unlinking candidate from job:', error);
    res.status(500).json({ error: 'Failed to unlink candidate from job' });
  }
};

// Update link status
exports.updateLinkStatus = async (req, res) => {
  try {
    const { linkId } = req.params;
    const { status, notes } = req.body;

    if (!linkId) {
      return res.status(400).json({ error: 'linkId is required' });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const link = await CandidateJobLink.findByIdAndUpdate(
      linkId,
      updateData,
      { new: true }
    )
      .populate('candidateId')
      .populate('linkedBy', 'fullName email');

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    res.json({
      success: true,
      link
    });
  } catch (error) {
    console.error('Error updating link status:', error);
    res.status(500).json({ error: 'Failed to update link status' });
  }
};

// Get jobs linked to a candidate
exports.getLinkedJobs = async (req, res) => {
  try {
    const { candidateId } = req.params;

    if (!candidateId) {
      return res.status(400).json({ error: 'candidateId is required' });
    }

    const links = await CandidateJobLink.find({ candidateId })
      .populate('jobId')
      .populate('linkedBy', 'fullName email')
      .sort({ createdAt: -1 });

    const linkedJobs = links.map(link => ({
      ...link.jobId.toObject(),
      linkInfo: {
        source: link.source,
        linkedBy: link.linkedBy,
        linkedAt: link.createdAt,
        status: link.status,
        notes: link.notes,
        linkId: link._id
      }
    }));

    res.json({
      success: true,
      count: linkedJobs.length,
      jobs: linkedJobs
    });
  } catch (error) {
    console.error('Error fetching linked jobs:', error);
    res.status(500).json({ error: 'Failed to fetch linked jobs' });
  }
};

