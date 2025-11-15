const Workflow = require('../models/Workflow');
const Job = require('../models/Job');
const Candidate = require('../models/Candidate');

// Get all workflows for a user
const getWorkflows = async (req, res) => {
  try {
    // Everyone can see all workflows
    const workflows = await Workflow.find({})
      .populate('jobId', 'title organization')
      .populate('phases.candidates', 'name email phone skills')
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

// Create new workflow
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
      return res.status(400).json({ error: 'Workflow already exists for this job' });
    }
    
    // Calculate total candidates from first phase
    const totalCandidates = phases[0]?.candidates?.length || 0;
    
    const workflow = new Workflow({
      jobId,
      jobTitle: job.title,
      organization: job.organization,
      phases: phases.map((phase, index) => ({
        ...phase,
        phaseNumber: index,
        createdBy: userId
      })),
      description,
      priority,
      totalCandidates,
      createdBy: userId,
      activePhase: 0
    });
    
    await workflow.save();
    
    const populatedWorkflow = await Workflow.findById(workflow._id)
      .populate('jobId', 'title organization description location remote experience ctc industry recruiters')
      .populate('phases.candidates', 'name email phone skills organization')
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

module.exports = {
  getWorkflows,
  getWorkflowById,
  checkWorkflowExists,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  getCandidatesForWorkflow
};
