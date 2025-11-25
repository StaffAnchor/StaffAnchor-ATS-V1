import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_URL from '../config/api';

const useEmailNotification = () => {
  const [emailPreview, setEmailPreview] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailQueue, setEmailQueue] = useState([]);

  // Get auth token from localStorage
  const getAuthToken = () => {
    // Your app stores the token as 'jwt', not 'token'
    return localStorage.getItem('jwt');
  };

  // Preview email before sending
  const previewEmail = async (type, data) => {
    try {
      setLoading(true);
      
      //console.log('=== EMAIL PREVIEW DEBUG ===');
      //console.log('Email type:', type);
      //console.log('Email data:', data);
      
      const token = getAuthToken();
      const response = await axios.post(
        `${API_URL}/api/email/preview`,
        { type, data },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : undefined
          }
        }
      );

      //console.log('Email preview response:', response.data);

      if (response.data.success) {
        setEmailPreview(response.data.preview);
        setShowEmailModal(true);
        return response.data.preview;
      }
    } catch (error) {
      console.error('Error previewing email:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      toast.error('Failed to generate email preview: ' + (error.response?.data?.message || error.message));
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Send confirmed email
  const sendEmail = async (recipients, subject, html) => {
    try {
      setLoading(true);
      
      const token = getAuthToken();
      const response = await axios.post(
        `${API_URL}/api/email/send`,
        { recipients, subject, html },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : undefined
          }
        }
      );

      if (response.data.success) {
        toast.success(`Email sent successfully to ${recipients.length} recipient${recipients.length !== 1 ? 's' : ''}!`);
        return true;
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Handle workflow creation email notification
  const handleWorkflowCreatedEmail = async (workflow) => {
    if (!workflow || !workflow.phases || workflow.phases.length === 0) {
      //console.log('No phases in workflow, skipping email');
      return;
    }

    const firstPhase = workflow.phases[0];
    const hasCandidates = firstPhase.candidates && firstPhase.candidates.length > 0;
    const hasRecruiters = workflow.jobId?.recruiters && workflow.jobId.recruiters.length > 0;
    
    // Prepare candidate IDs
    const candidateIds = firstPhase.candidates?.map(c => c._id || c) || [];
    
    // Show email for candidates first (if any)
    if (hasCandidates) {
      await previewEmail('candidatePhase', {
        jobId: workflow.jobId?._id || workflow.jobId,
        phase: firstPhase,
        candidateIds,
        workflowId: workflow._id
      });
    }
    
    // Note: After user sends/cancels the candidate email,
    // they need to manually trigger recruiter notification
    // or we show a toast message
    if (hasRecruiters && hasCandidates) {
      // Store recruiter email data for later
      setEmailQueue([{
        type: 'recruiterPhase',
        data: {
          jobId: workflow.jobId?._id || workflow.jobId,
          phase: firstPhase,
          candidateIds,
          workflowId: workflow._id
        }
      }]);
    } else if (hasRecruiters && !hasCandidates) {
      // If no candidates, show recruiter email directly
      await previewEmail('recruiterPhase', {
        jobId: workflow.jobId?._id || workflow.jobId,
        phase: firstPhase,
        candidateIds: [],
        workflowId: workflow._id
      });
    }
  };

  // Handle workflow update email notification
  const handleWorkflowUpdatedEmail = async (workflow, updatedPhaseIndex) => {
    if (!workflow || !workflow.phases) {
      //console.log('No workflow or phases, skipping email');
      return;
    }

    const phase = updatedPhaseIndex !== undefined 
      ? workflow.phases[updatedPhaseIndex]
      : workflow.phases[workflow.phases.length - 1]; // Last phase if not specified

    if (!phase || !phase.candidates || phase.candidates.length === 0) {
      //console.log('No candidates in phase, skipping email');
      return;
    }

    // Get all unique candidate IDs
    const candidateIds = phase.candidates.map(c => c._id || c);
    
    // Preview email for candidates in the phase
    await previewEmail('candidatePhase', {
      jobId: workflow.jobId?._id || workflow.jobId,
      phase: phase,
      candidateIds,
      workflowId: workflow._id
    });

    // Preview email for recruiters
    await previewEmail('recruiterPhase', {
      jobId: workflow.jobId?._id || workflow.jobId,
      phase: phase,
      candidateIds,
      workflowId: workflow._id
    });
  };

  // Handle job creation email notification for internal recruiters
  const handleJobCreatedEmail = async (job, creatorId) => {
    if (!job || !job.authorizedUsers || job.authorizedUsers.length === 0) {
      //console.log('No authorized users (internal recruiters) in job, skipping email');
      return;
    }

    await previewEmail('recruiterJobCreation', {
      jobId: job._id,
      creatorId: creatorId
    });
  };

  // Process next email in queue
  const processNextEmail = async () => {
    if (emailQueue.length > 0) {
      const nextEmail = emailQueue[0];
      setEmailQueue(prev => prev.slice(1));
      
      // Show next email preview
      await previewEmail(nextEmail.type, nextEmail.data);
    }
  };

  // Close email modal
  const closeEmailModal = () => {
    setShowEmailModal(false);
    setEmailPreview(null);
    
    // Process next email in queue if any
    setTimeout(() => processNextEmail(), 300);
  };

  // Confirm and send email
  const confirmAndSendEmail = async (selectedRecipients) => {
    if (!emailPreview) {
      toast.error('No email preview available');
      return false;
    }

    const success = await sendEmail(
      selectedRecipients,
      emailPreview.subject,
      emailPreview.html
    );

    if (success) {
      closeEmailModal();
    }

    return success;
  };

  return {
    emailPreview,
    showEmailModal,
    loading,
    previewEmail,
    sendEmail,
    handleWorkflowCreatedEmail,
    handleWorkflowUpdatedEmail,
    handleJobCreatedEmail,
    closeEmailModal,
    confirmAndSendEmail
  };
};

export default useEmailNotification;

