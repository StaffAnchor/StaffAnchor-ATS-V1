const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflowController');
const { authenticateToken, requireDeletionPermission } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get all workflows
router.get('/', workflowController.getWorkflows);

// Get workflow by ID
router.get('/:workflowId', workflowController.getWorkflowById);

// Check if workflow exists for a job
router.get('/check/:jobId', workflowController.checkWorkflowExists);

// Get candidates for workflow creation
router.get('/candidates/all', workflowController.getCandidatesForWorkflow);

// Create new workflow
router.post('/', workflowController.createWorkflow);

// Update workflow
router.put('/:workflowId', workflowController.updateWorkflow);

// Update workflow status (PATCH for partial update)
router.patch('/:workflowId', workflowController.updateWorkflow);

// Delete workflow
router.delete('/:workflowId', requireDeletionPermission, workflowController.deleteWorkflow);

module.exports = router;


