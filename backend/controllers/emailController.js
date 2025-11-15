const { sendEmail, prepareEmailPreview } = require('../services/emailService');
const Job = require('../models/Job');
const Candidate = require('../models/Candidate');
const Workflow = require('../models/Workflow');
const User = require('../models/User');

// Preview email before sending
exports.previewEmail = async (req, res) => {
  try {
    const { type, data } = req.body;

    // Fetch complete data based on IDs if needed
    let enrichedData = { ...data };

    // Enrich job data
    if (data.jobId) {
      const job = await Job.findById(data.jobId);
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }
      enrichedData.job = job;
    }

    // Enrich candidate data
    if (data.candidateId) {
      const candidate = await Candidate.findById(data.candidateId);
      if (!candidate) {
        return res.status(404).json({ message: 'Candidate not found' });
      }
      enrichedData.candidate = candidate;
    }

    // Enrich candidates list
    if (data.candidateIds && Array.isArray(data.candidateIds)) {
      const candidates = await Candidate.find({ _id: { $in: data.candidateIds } });
      enrichedData.candidates = candidates;
    }

    // Enrich workflow data
    if (data.workflowId) {
      const workflow = await Workflow.findById(data.workflowId);
      if (workflow) {
        enrichedData.workflow = workflow;
      }
    }

    // Enrich creator data
    if (data.creatorId) {
      const creator = await User.findById(data.creatorId);
      if (creator) {
        enrichedData.creator = creator;
      }
    }

    // Collect recipient emails based on type
    let recipients = [];
    
    if (type === 'candidatePhase') {
      // For candidate emails, collect all candidate emails
      if (enrichedData.candidates && enrichedData.candidates.length > 0) {
        recipients = enrichedData.candidates
          .map(c => c.email)
          .filter(Boolean);
      }
      
      // Use the first candidate for preview template
      if (enrichedData.candidates && enrichedData.candidates.length > 0) {
        enrichedData.candidate = enrichedData.candidates[0];
      }
    } else if (type === 'recruiterPhase' || type === 'recruiterJobCreation') {
      if (enrichedData.job && enrichedData.job.recruiters) {
        recipients = enrichedData.job.recruiters
          .map(r => r.email)
          .filter(Boolean);
      }
    }

    // Add manually specified recipients
    if (data.additionalRecipients && Array.isArray(data.additionalRecipients)) {
      recipients = [...recipients, ...data.additionalRecipients];
    }

    // Remove duplicates
    recipients = [...new Set(recipients)];
    
    // Generate the preview with enriched data
    const emailPreview = prepareEmailPreview(type, enrichedData);

    res.json({
      success: true,
      preview: {
        subject: emailPreview.subject,
        html: emailPreview.html,
        recipients,
        type
      }
    });
  } catch (error) {
    console.error('Error previewing email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error generating email preview', 
      error: error.message 
    });
  }
};

// Send email after confirmation
exports.sendConfirmedEmail = async (req, res) => {
  try {
    const { recipients, subject, html } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No recipients specified' 
      });
    }

    if (!subject || !html) {
      return res.status(400).json({ 
        success: false, 
        message: 'Subject and HTML content are required' 
      });
    }

    // Send email to all recipients
    const result = await sendEmail(recipients, subject, html);

    if (result.success) {
      res.json({
        success: true,
        message: 'Email sent successfully',
        messageId: result.messageId,
        sentTo: recipients
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send email',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error sending email', 
      error: error.message 
    });
  }
};

// Test email configuration
exports.testEmailConfig = async (req, res) => {
  try {
    const testEmail = req.body.email || process.env.EMAIL_USER;
    
    const result = await sendEmail(
      testEmail,
      'Test Email - Recruitment System',
      `
        <h2>Email Configuration Test</h2>
        <p>If you're reading this, your email configuration is working correctly!</p>
        <p>Test sent at: ${new Date().toLocaleString()}</p>
      `
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'Test email sent successfully',
        sentTo: testEmail
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error testing email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error testing email configuration', 
      error: error.message 
    });
  }
};

module.exports = exports;

