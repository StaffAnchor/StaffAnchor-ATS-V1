const Workflow = require('../models/Workflow');
const Job = require('../models/Job');
const Candidate = require('../models/Candidate');

// Get all workflows for a user
const getWorkflows = async (req, res) => {
  try {
    // Everyone can see all workflows
    const workflows = await Workflow.find({})
      .populate('jobId', 'title organization')
      .populate('candidateStatuses.candidateId', 'name email phone')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(workflows);
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({ error: 'Failed to fetch workflows' });
  }
};

// Get workflow by ID
const getWorkflowById = async (req, res) => {
  try {
    const { workflowId } = req.params;
    
    const workflow = await Workflow.findById(workflowId)
      .populate('jobId', 'title organization description')
      .populate('phases.candidates', 'name email phone skills experience')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');
    
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    res.json(workflow);
  } catch (error) {
    console.error('Error fetching workflow:', error);
    res.status(500).json({ error: 'Failed to fetch workflow' });
  }
};

// Check if workflow exists for a job
const checkWorkflowExists = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const workflow = await Workflow.findOne({ jobId })
      .select('_id status activePhase totalCandidates')
      .populate('phases.candidates', 'name email');
    
    if (workflow) {
      res.json({
        exists: true,
        workflow: {
          id: workflow._id,
          status: workflow.status,
          activePhase: workflow.activePhase,
          totalCandidates: workflow.totalCandidates,
          candidates: workflow.phases[0]?.candidates || []
        }
      });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error('Error checking workflow:', error);
    res.status(500).json({ error: 'Failed to check workflow' });
  }
};

// Get all workflows for a specific job
const getWorkflowsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const workflows = await Workflow.find({ jobId })
      .populate('candidateStatuses.candidateId', 'name email phone')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(workflows);
  } catch (error) {
    console.error('Error fetching workflows by job:', error);
    res.status(500).json({ error: 'Failed to fetch workflows' });
  }
};

// Create new workflow or add candidates to existing workflow
const createWorkflow = async (req, res) => {
  try {
    const { jobId, phases, description, priority, userId } = req.body;
    
    // Get job details
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Check if workflow already exists
    const existingWorkflow = await Workflow.findOne({ jobId });
    
    if (existingWorkflow) {
      // Workflow exists - add new candidates to it
      const newCandidateIds = phases[0]?.candidates || [];
      
      if (newCandidateIds.length === 0) {
        return res.status(400).json({ error: 'No new candidates to add' });
      }
      
      // Get existing candidate IDs from workflow
      const existingCandidateIds = new Set(
        existingWorkflow.candidateStatuses.map(cs => cs.candidateId.toString())
      );
      
      // Filter out candidates that are already in the workflow
      const candidatesToAdd = newCandidateIds.filter(
        id => !existingCandidateIds.has(id.toString())
      );
      
      if (candidatesToAdd.length === 0) {
        return res.status(400).json({ error: 'All candidates are already in the workflow' });
      }
      
      // Add new candidates to candidateStatuses
      const newCandidateStatuses = candidatesToAdd.map(candidateId => ({
        candidateId,
        clientSideStatus: 'Interview Scheduled',
        notes: '',
        updatedAt: new Date()
      }));
      
      existingWorkflow.candidateStatuses.push(...newCandidateStatuses);
      
      // Also add to first phase candidates array
      if (existingWorkflow.phases && existingWorkflow.phases.length > 0) {
        existingWorkflow.phases[0].candidates.push(...candidatesToAdd);
      }
      
      // Update total candidates count
      existingWorkflow.totalCandidates = existingWorkflow.candidateStatuses.length;
      
      await existingWorkflow.save();
      
      const populatedWorkflow = await Workflow.findById(existingWorkflow._id)
        .populate('jobId', 'title organization description location remote experience ctc industry recruiters')
        .populate('candidateStatuses.candidateId', 'name email phone skills organization')
        .populate('createdBy', 'name email');
      
      return res.status(200).json({
        message: `Added ${candidatesToAdd.length} new candidate(s) to existing workflow`,
        workflow: populatedWorkflow,
        _emailNotificationPending: false
      });
    }
    
    // No existing workflow - create new one
    const totalCandidates = phases[0]?.candidates?.length || 0;
    
    // Initialize candidate statuses from first phase candidates
    const candidateStatuses = phases[0]?.candidates?.map(candidateId => ({
      candidateId,
      clientSideStatus: 'Interview Scheduled',
      notes: '',
      updatedAt: new Date()
    })) || [];
    
    const workflow = new Workflow({
      jobId,
      jobTitle: job.title,
      organization: job.organization,
      phases: phases.map((phase, index) => ({
        ...phase,
        phaseNumber: index,
        createdBy: userId
      })),
      candidateStatuses,
      description,
      priority,
      totalCandidates,
      createdBy: userId,
      activePhase: 0
    });
    
    await workflow.save();
    
    // Update job status to "Ongoing client process"
    await Job.findByIdAndUpdate(jobId, { status: 'Ongoing client process' });
    
    const populatedWorkflow = await Workflow.findById(workflow._id)
      .populate('jobId', 'title organization description location remote experience ctc industry recruiters')
      .populate('candidateStatuses.candidateId', 'name email phone skills organization')
      .populate('createdBy', 'name email');
    
    res.status(201).json({
      message: 'Workflow created successfully',
      workflow: populatedWorkflow,
      _emailNotificationPending: true,
      _notificationType: 'workflowCreated'
    });
  } catch (error) {
    console.error('Error creating workflow:', error);
    res.status(500).json({ error: 'Failed to create workflow' });
  }
};

// Update workflow
const updateWorkflow = async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { userId, phases, description, priority } = req.body;
    
    //console.log('Update workflow request:', { workflowId, userId, phases, description, priority });
    
    const workflow = await Workflow.findById(workflowId);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    // Prepare updates object
    const updates = {};
    if (phases && Array.isArray(phases)) {
      updates.phases = phases.map((phase, index) => ({
        ...phase,
        phaseNumber: index,
        // Ensure createdBy is preserved for each phase
        createdBy: phase.createdBy || workflow.createdBy
      }));
      updates.totalCandidates = phases[0]?.candidates?.length || 0;
    }
    if (description !== undefined) updates.description = description;
    if (priority !== undefined) updates.priority = priority;
    
    //console.log('Updates to apply:', updates);
    
    const updatedWorkflow = await Workflow.findByIdAndUpdate(
      workflowId,
      updates,
      { new: true, runValidators: true }
    ).populate('jobId', 'title organization description location remote experience ctc industry recruiters')
     .populate('phases.candidates', 'name email phone skills organization')
     .populate('createdBy', 'name email');
    
    res.json({
      message: 'Workflow updated successfully',
      workflow: updatedWorkflow,
      _emailNotificationPending: true,
      _notificationType: 'workflowUpdated'
    });
  } catch (error) {
    console.error('Error updating workflow:', error);
    console.error('Error details:', error.message);
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
    }
    res.status(500).json({ error: 'Failed to update workflow' });
  }
};

// Delete workflow
const deleteWorkflow = async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { userId } = req.body;
    
    const workflow = await Workflow.findById(workflowId);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    await Workflow.findByIdAndDelete(workflowId);
    
    // Reset job status to "In Progress" when workflow is deleted
    await Job.findByIdAndUpdate(workflow.jobId, { status: 'In Progress' });
    
    res.json({ message: 'Workflow deleted successfully' });
  } catch (error) {
    console.error('Error deleting workflow:', error);
    res.status(500).json({ error: 'Failed to delete workflow' });
  }
};

// Get all candidates for workflow creation
const getCandidatesForWorkflow = async (req, res) => {
  try {
    const candidates = await Candidate.find({})
      .select('name email phone skills experience location')
      .sort({ name: 1 });
    
    res.json(candidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
};

// Update candidate client-side status in workflow
const updateCandidateStatus = async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { candidateId, clientSideStatus, notes } = req.body;
    
    const workflow = await Workflow.findById(workflowId);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    // Find the candidate status entry
    const candidateStatus = workflow.candidateStatuses.find(
      cs => cs.candidateId.toString() === candidateId
    );
    
    if (candidateStatus) {
      // Update existing status
      candidateStatus.clientSideStatus = clientSideStatus;
      if (notes !== undefined) candidateStatus.notes = notes;
      candidateStatus.updatedAt = new Date();
    } else {
      // Add new status entry
      workflow.candidateStatuses.push({
        candidateId,
        clientSideStatus,
        notes: notes || '',
        updatedAt: new Date()
      });
    }
    
    await workflow.save();
    
    const updatedWorkflow = await Workflow.findById(workflowId)
      .populate('candidateStatuses.candidateId', 'name email phone');
    
    res.json(updatedWorkflow);
  } catch (error) {
    console.error('Error updating candidate status:', error);
    res.status(500).json({ error: 'Failed to update candidate status' });
  }
};

module.exports = {
  getWorkflows,
  getWorkflowById,
  checkWorkflowExists,
  getWorkflowsByJob,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  getCandidatesForWorkflow,
  updateCandidateStatus
};
