const { createTransporter } = require('../config/emailConfig');

// Email templates
const emailTemplates = {
  // Template for candidates when added to a workflow phase
  candidatePhaseNotification: (candidate, job, phase, workflow) => {
    return {
      subject: `Congratulations! Selected for ${job.title} - ${phase.phaseName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4f8cff 0%, #3d7be8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .job-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #4f8cff; }
            .detail-row { margin: 10px 0; }
            .label { font-weight: bold; color: #4f8cff; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 12px 30px; background: #4f8cff; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Congratulations, ${candidate.name}!</h1>
              <p>You've been selected for the next phase</p>
            </div>
            <div class="content">
              <p>Dear ${candidate.name},</p>
              <p>We are pleased to inform you that you have been selected for the <strong>${phase.phaseName}</strong> phase of our recruitment process.</p>
              
              <div class="job-details">
                <h2 style="color: #4f8cff; margin-top: 0;">Job Details</h2>
                <div class="detail-row"><span class="label">Position:</span> ${job.title}</div>
                <div class="detail-row"><span class="label">Company:</span> ${job.organization}</div>
                <div class="detail-row"><span class="label">Location:</span> ${job.location}${job.remote ? ' (Remote Available)' : ''}</div>
                ${job.experience ? `<div class="detail-row"><span class="label">Experience Required:</span> ${job.experience} years</div>` : ''}
                ${job.ctc ? `<div class="detail-row"><span class="label">CTC:</span> ${job.ctc}</div>` : ''}
                ${job.industry ? `<div class="detail-row"><span class="label">Industry:</span> ${job.industry}</div>` : ''}
                ${job.description ? `<div class="detail-row"><span class="label">Description:</span><br/>${job.description}</div>` : ''}
              </div>

              <div class="job-details">
                <h3 style="color: #4f8cff; margin-top: 0;">Current Phase Information</h3>
                <div class="detail-row"><span class="label">Phase:</span> ${phase.phaseName}</div>
                <div class="detail-row"><span class="label">Type:</span> ${phase.type}</div>
                <div class="detail-row"><span class="label">Status:</span> ${phase.status}</div>
                ${phase.customFields && phase.customFields.length > 0 ? `
                  <h4>Additional Information:</h4>
                  ${phase.customFields.map(field => `
                    <div class="detail-row"><span class="label">${field.key}:</span> ${field.value}</div>
                  `).join('')}
                ` : ''}
              </div>

              <p style="margin-top: 20px;">We look forward to progressing with you through this phase. If you have any questions, please don't hesitate to reach out to the recruitment team.</p>
              
              <p>Best regards,<br/>The Recruitment Team</p>
            </div>
            <div class="footer">
              <p>This is an automated notification. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  },

  // Template for recruiters when workflow phase is updated
  recruiterPhaseNotification: (job, phase, candidates, workflow) => {
    return {
      subject: `Workflow Update: ${job.title} - ${phase.phaseName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #eebbc3 0%, #d4a5ac 100%); color: #1a1a2e; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .job-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #eebbc3; }
            .detail-row { margin: 10px 0; }
            .label { font-weight: bold; color: #d4a5ac; }
            .candidate-list { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .candidate-item { padding: 10px; margin: 5px 0; background: #f9f9f9; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📋 Workflow Phase Update</h1>
              <p>${job.title} - ${phase.phaseName}</p>
            </div>
            <div class="content">
              <p>Dear Recruiter,</p>
              <p>This is to inform you about the workflow phase update for <strong>${job.title}</strong>.</p>
              
              <div class="job-details">
                <h2 style="color: #d4a5ac; margin-top: 0;">Job Information</h2>
                <div class="detail-row"><span class="label">Position:</span> ${job.title}</div>
                <div class="detail-row"><span class="label">Company:</span> ${job.organization}</div>
                <div class="detail-row"><span class="label">Location:</span> ${job.location}</div>
                ${job.experience ? `<div class="detail-row"><span class="label">Experience:</span> ${job.experience} years</div>` : ''}
                ${job.ctc ? `<div class="detail-row"><span class="label">CTC:</span> ${job.ctc}</div>` : ''}
              </div>

              <div class="job-details">
                <h3 style="color: #d4a5ac; margin-top: 0;">Phase Details</h3>
                <div class="detail-row"><span class="label">Phase:</span> ${phase.phaseName}</div>
                <div class="detail-row"><span class="label">Phase Number:</span> ${phase.phaseNumber}</div>
                <div class="detail-row"><span class="label">Type:</span> ${phase.type}</div>
                <div class="detail-row"><span class="label">Status:</span> ${phase.status}</div>
              </div>

              ${candidates && candidates.length > 0 ? `
                <div class="job-details">
                  <h3 style="color: #d4a5ac; margin-top: 0;">Candidates in This Phase (${candidates.length})</h3>
                  <div class="candidate-list">
                    ${candidates.map((candidate, index) => `
                      <div class="candidate-item">
                        <strong>${index + 1}. ${candidate.name}</strong><br/>
                        ${candidate.email ? `📧 ${candidate.email}<br/>` : ''}
                        ${candidate.phone ? `📱 ${candidate.phone}<br/>` : ''}
                        ${candidate.organization ? `🏢 ${candidate.organization}` : ''}
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              <p style="margin-top: 20px;">Please take necessary actions for this phase.</p>
              
              <p>Best regards,<br/>Recruitment Management System</p>
            </div>
            <div class="footer">
              <p>This is an automated notification from your recruitment system.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  },

  // Template for recruiters when new job is created
  recruiterJobCreation: (job, creator) => {
    return {
      subject: `New Job Assignment: ${job.title} at ${job.organization}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #51cf66 0%, #40c057 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .job-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #51cf66; }
            .detail-row { margin: 10px 0; }
            .label { font-weight: bold; color: #51cf66; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .highlight { background: #e7f5ff; padding: 15px; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎯 New Job Assignment</h1>
              <p>You've been assigned to a new recruitment position</p>
            </div>
            <div class="content">
              <p>Dear Recruiter,</p>
              <p>You have been assigned as a recruiter for a new job opening. Please review the details below and start sourcing candidates:</p>
              
              <div class="job-details">
                <h2 style="color: #51cf66; margin-top: 0;">Job Details</h2>
                <div class="detail-row"><span class="label">Position:</span> ${job.title}</div>
                <div class="detail-row"><span class="label">Company:</span> ${job.organization}</div>
                <div class="detail-row"><span class="label">Location:</span> ${job.location}${job.remote ? ' (Remote Available)' : ''}</div>
                ${job.experience ? `<div class="detail-row"><span class="label">Experience Required:</span> ${job.experience} years</div>` : ''}
                ${job.ctc ? `<div class="detail-row"><span class="label">CTC:</span> ${job.ctc}</div>` : ''}
                ${job.industry ? `<div class="detail-row"><span class="label">Industry:</span> ${job.industry}</div>` : ''}
                ${job.description ? `
                  <div class="detail-row">
                    <span class="label">Job Description:</span><br/>
                    <div style="margin-top: 10px; padding: 15px; background: #f9f9f9; border-radius: 5px;">
                      ${job.description}
                    </div>
                  </div>
                ` : ''}
              </div>

              ${job.clientContact ? `
                <div class="job-details">
                  <h3 style="color: #51cf66; margin-top: 0;">Client Contact Information</h3>
                  <div class="detail-row"><span class="label">Name:</span> ${job.clientContact.name}</div>
                  ${job.clientContact.designation ? `<div class="detail-row"><span class="label">Designation:</span> ${job.clientContact.designation}</div>` : ''}
                  ${job.clientContact.email ? `<div class="detail-row"><span class="label">Email:</span> ${job.clientContact.email}</div>` : ''}
                  ${job.clientContact.phone ? `<div class="detail-row"><span class="label">Phone:</span> ${job.clientContact.phone}</div>` : ''}
                </div>
              ` : ''}

              ${creator ? `
                <div class="highlight">
                  <strong>Created by:</strong> ${creator.fullName || creator.email || 'System Admin'}
                </div>
              ` : ''}

              <p style="margin-top: 20px;">Please start sourcing candidates for this position.</p>
              
              <p>Best regards,<br/>StaffAnchor Recruitment Team</p>
            </div>
            <div class="footer">
              <p>This is an automated notification from your recruitment system.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }
};

// Function to send email
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Recruitment System" <${process.env.EMAIL_USER}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    //console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Function to prepare email preview (without sending)
const prepareEmailPreview = (type, data) => {
  let template;
  
  switch (type) {
    case 'candidatePhase':
      template = emailTemplates.candidatePhaseNotification(
        data.candidate,
        data.job,
        data.phase,
        data.workflow
      );
      break;
    case 'recruiterPhase':
      template = emailTemplates.recruiterPhaseNotification(
        data.job,
        data.phase,
        data.candidates,
        data.workflow
      );
      break;
    case 'recruiterJobCreation':
      template = emailTemplates.recruiterJobCreation(
        data.job,
        data.creator
      );
      break;
    default:
      throw new Error('Invalid email type');
  }
  
  return template;
};

module.exports = {
  sendEmail,
  emailTemplates,
  prepareEmailPreview
};

