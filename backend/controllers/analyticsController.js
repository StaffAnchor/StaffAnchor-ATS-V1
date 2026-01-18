const CandidateJobLink = require('../models/CandidateJobLink');
const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const User = require('../models/User');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Get all jobs with analytics summary for a user
exports.getJobsWithAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const userAccessLevel = req.user.accessLevel;
    const { search, company } = req.query;

    // Build query for jobs where user is authorized or created by user
    const jobQuery = {
      $or: [
        { authorizedUsers: userId },
        { createdBy: userId }
      ]
    };

    // Add search filter for job ID or company
    if (search) {
      jobQuery.$and = [
        {
          $or: [
            { jobId: { $regex: search, $options: 'i' } },
            { organization: { $regex: search, $options: 'i' } },
            { title: { $regex: search, $options: 'i' } }
          ]
        }
      ];
    }

    if (company) {
      jobQuery.organization = { $regex: company, $options: 'i' };
    }

    const jobs = await Job.find(jobQuery)
      .select('jobId title organization status createdAt createdBy authorizedUsers')
      .sort({ createdAt: -1 });

    // Get analytics summary for each job
    const jobsWithAnalytics = await Promise.all(
      jobs.map(async (job) => {
        // Get all candidate job links for this job
        const links = await CandidateJobLink.find({ jobId: job._id });

        // Count candidates by status
        const linkedCount = links.length;
        const submittedCount = links.filter(l => 
          l.status === 'Submitted to Client' || l.status === 'Submitted'
        ).length;

        // Workflow feature removed - client-side status tracking removed
        let selectedCount = 0;
        let rejectedCount = 0;
        let ongoingCount = 0;

        // Count unique recruiters (include both linkedBy and sharedByRecruiterId)
        const recruiterIds = new Set();
        links.forEach(l => {
          if (l.linkedBy) recruiterIds.add(l.linkedBy.toString());
          if (l.sharedByRecruiterId) recruiterIds.add(l.sharedByRecruiterId.toString());
        });

        return {
          _id: job._id,
          jobId: job.jobId,
          title: job.title,
          organization: job.organization,
          status: job.status,
          createdAt: job.createdAt,
          recruiterCount: recruiterIds.size,
          analytics: {
            linked: linkedCount,
            sentToClient: submittedCount,
            selected: selectedCount,
            rejected: rejectedCount,
            ongoing: ongoingCount
          }
        };
      })
    );

    res.json({
      success: true,
      jobs: jobsWithAnalytics
    });
  } catch (error) {
    console.error('Error fetching jobs with analytics:', error);
    res.status(500).json({ error: 'Failed to fetch jobs with analytics' });
  }
};

// Get detailed analytics for a specific job - PER RECRUITER
exports.getJobAnalytics = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Get the job with all details
    const job = await Job.findById(jobId)
      .populate('clientId', 'name')
      .populate('createdBy', 'fullName email')
      .populate('authorizedUsers', 'fullName email')
      .select('jobId title organization status clientContact createdAt createdBy authorizedUsers');

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Get ALL candidate job links for this job
    const links = await CandidateJobLink.find({ jobId })
      .populate({
        path: 'candidateId',
        select: 'name email phone resume'
      })
      .populate('linkedBy', 'fullName email')
      .populate('sharedByRecruiterId', 'fullName email')
      .populate('submittedBy', 'fullName email')
      .populate('statusChangedBy', 'fullName email');

    // Filter out links with null candidates (deleted candidates)
    const validLinks = links.filter(l => l.candidateId);

    // Workflow feature removed - clientStatusMap is now empty
    const clientStatusMap = new Map();

    // Group candidates by recruiter (use linkedBy or sharedByRecruiterId for applied-through-link candidates)
    const recruiterMap = new Map();
    
    validLinks.forEach(link => {
      // For candidates who applied through a shared link, use sharedByRecruiterId
      // Otherwise, use linkedBy
      const recruiter = link.sharedByRecruiterId || link.linkedBy;
      const recruiterId = recruiter?._id?.toString() || 'unknown';
      const recruiterName = recruiter?.fullName || 'Unknown Recruiter';
      const recruiterEmail = recruiter?.email || '';
      
      if (!recruiterMap.has(recruiterId)) {
        recruiterMap.set(recruiterId, {
          recruiterId,
          recruiterName,
          recruiterEmail,
          candidates: {
            linked: [],
            sentToClient: [],
            selected: [],
            rejected: [],
            ongoing: []
          },
          timeline: [],
          stats: {
            totalLinked: 0,
            totalSentToClient: 0,
            totalSelected: 0,
            totalRejected: 0,
            totalOngoing: 0
          }
        });
      }
      
      const recruiterData = recruiterMap.get(recruiterId);
      
      // Build candidate info
      const candidateInfo = {
        _id: link.candidateId._id,
        name: link.candidateId.name,
        email: link.candidateId.email,
        phone: link.candidateId.phone,
        resume: link.candidateId.resume,
        linkStatus: link.status,
        linkedAt: link.createdAt,
        submittedAt: link.submittedAt,
        submittedBy: link.submittedBy,
        statusHistory: link.statusHistory || []
      };
      
      // Workflow feature removed - no client-side status
      
      // Categorize candidate
      recruiterData.candidates.linked.push(candidateInfo);
      recruiterData.stats.totalLinked++;
      
      // Add to timeline
      recruiterData.timeline.push({
        action: 'linked',
        candidateName: link.candidateId.name,
        date: link.createdAt
      });
      
      // Check if sent to client
      if (link.status === 'Submitted to Client' || link.status === 'Submitted') {
        recruiterData.candidates.sentToClient.push(candidateInfo);
        recruiterData.stats.totalSentToClient++;
        
        if (link.submittedAt) {
          recruiterData.timeline.push({
            action: 'submitted',
            candidateName: link.candidateId.name,
            date: link.submittedAt
          });
        }
      }
      
      // Workflow feature removed - no client-side status tracking
    });
    
    // Sort timelines by date
    recruiterMap.forEach(data => {
      data.timeline.sort((a, b) => new Date(a.date) - new Date(b.date));
    });
    
    // Convert map to array
    const recruitersAnalytics = Array.from(recruiterMap.values());
    
    // Calculate overall job stats
    const overallStats = {
      totalLinked: validLinks.length,
      totalSentToClient: validLinks.filter(l => 
        l.status === 'Submitted to Client' || l.status === 'Submitted'
      ).length,
      totalSelected: 0,
      totalRejected: 0,
      totalOngoing: 0
    };
    
    recruitersAnalytics.forEach(r => {
      overallStats.totalSelected += r.stats.totalSelected;
      overallStats.totalRejected += r.stats.totalRejected;
      overallStats.totalOngoing += r.stats.totalOngoing;
    });
    
    // Build activity timeline for graphs (group by date)
    const activityByDate = {};
    validLinks.forEach(link => {
      const dateStr = new Date(link.createdAt).toISOString().split('T')[0];
      if (!activityByDate[dateStr]) {
        activityByDate[dateStr] = { date: dateStr, linked: 0, submitted: 0 };
      }
      activityByDate[dateStr].linked++;
      
      if (link.submittedAt) {
        const submitDateStr = new Date(link.submittedAt).toISOString().split('T')[0];
        if (!activityByDate[submitDateStr]) {
          activityByDate[submitDateStr] = { date: submitDateStr, linked: 0, submitted: 0 };
        }
        activityByDate[submitDateStr].submitted++;
      }
    });
    
    const activityTimeline = Object.values(activityByDate).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    res.json({
      success: true,
      job: {
        _id: job._id,
        jobId: job.jobId,
        title: job.title,
        organization: job.organization,
        status: job.status,
        client: job.clientId?.name || job.organization,
        clientContact: job.clientContact,
        createdAt: job.createdAt,
        createdBy: job.createdBy
      },
      overallStats,
      recruitersAnalytics,
      activityTimeline,
      totalRecruiters: recruitersAnalytics.length
    });
  } catch (error) {
    console.error('Error fetching job analytics:', error);
    res.status(500).json({ error: 'Failed to fetch job analytics' });
  }
};

// Generate AI performance report for ALL recruiters
exports.generatePerformanceReport = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Get job details
    const job = await Job.findById(jobId)
      .select('jobId title organization status createdBy');

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Get all links for this job
    const links = await CandidateJobLink.find({ jobId })
      .populate('linkedBy', 'fullName email')
      .populate('sharedByRecruiterId', 'fullName email')
      .populate('candidateId', 'name');

    const validLinks = links.filter(l => l.candidateId);

    // Workflow feature removed - clientStatusMap is now empty
    const clientStatusMap = new Map();

    // Group by recruiter and calculate stats (use linkedBy or sharedByRecruiterId)
    const recruiterStats = new Map();
    
    validLinks.forEach(link => {
      // For candidates who applied through a shared link, use sharedByRecruiterId
      const recruiter = link.sharedByRecruiterId || link.linkedBy;
      const recruiterId = recruiter?._id?.toString() || 'unknown';
      const recruiterName = recruiter?.fullName || 'Unknown Recruiter';
      
      if (!recruiterStats.has(recruiterId)) {
        recruiterStats.set(recruiterId, {
          name: recruiterName,
          linked: 0,
          submitted: 0,
          selected: 0,
          rejected: 0,
          ongoing: 0,
          firstActivity: link.createdAt,
          lastActivity: link.createdAt
        });
      }
      
      const stats = recruiterStats.get(recruiterId);
      stats.linked++;
      
      // Track activity dates
      if (new Date(link.createdAt) < new Date(stats.firstActivity)) {
        stats.firstActivity = link.createdAt;
      }
      if (new Date(link.updatedAt) > new Date(stats.lastActivity)) {
        stats.lastActivity = link.updatedAt;
      }
      
      if (link.status === 'Submitted to Client' || link.status === 'Submitted') {
        stats.submitted++;
      }
      
      // Workflow feature removed - no client-side status tracking
    });

    // Build report data for each recruiter
    const recruitersData = Array.from(recruiterStats.entries()).map(([id, stats]) => {
      const submissionRate = stats.linked > 0 ? ((stats.submitted / stats.linked) * 100).toFixed(1) : 0;
      const selectionRate = stats.submitted > 0 ? ((stats.selected / stats.submitted) * 100).toFixed(1) : 0;
      const rejectionRate = stats.submitted > 0 ? ((stats.rejected / stats.submitted) * 100).toFixed(1) : 0;
      
      return {
        name: stats.name,
        linked: stats.linked,
        submitted: stats.submitted,
        selected: stats.selected,
        rejected: stats.rejected,
        ongoing: stats.ongoing,
        submissionRate,
        selectionRate,
        rejectionRate,
        firstActivity: stats.firstActivity,
        lastActivity: stats.lastActivity
      };
    });

    // Calculate overall stats
    const overallStats = {
      totalLinked: validLinks.length,
      totalSubmitted: validLinks.filter(l => 
        l.status === 'Submitted to Client' || l.status === 'Submitted'
      ).length,
      totalSelected: 0,
      totalRejected: 0,
      totalOngoing: 0
    };
    
    recruitersData.forEach(r => {
      overallStats.totalSelected += r.selected;
      overallStats.totalRejected += r.rejected;
      overallStats.totalOngoing += r.ongoing;
    });

    // Generate AI report using Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Build detailed prompt with per-recruiter data
    let recruiterDetails = recruitersData.map((r, i) => `
RECRUITER ${i + 1}: ${r.name}
- Candidates Linked: ${r.linked}
- Candidates Submitted to Client: ${r.submitted} (${r.submissionRate}% of linked)
- Candidates Selected: ${r.selected} (${r.selectionRate}% of submitted)
- Candidates Rejected: ${r.rejected} (${r.rejectionRate}% of submitted)
- Candidates in Ongoing Process: ${r.ongoing}
- First Activity: ${new Date(r.firstActivity).toLocaleDateString()}
- Last Activity: ${new Date(r.lastActivity).toLocaleDateString()}
`).join('\n');

    const prompt = `You are an HR analytics expert and recruitment performance analyst. Analyze the following recruitment performance data for a job and generate a comprehensive performance report.

JOB DETAILS:
- Job Title: ${job.title}
- Company: ${job.organization}
- Job ID: ${job.jobId}
- Current Status: ${job.status}
- Total Recruiters Working: ${recruitersData.length}

OVERALL JOB METRICS:
- Total Candidates Linked: ${overallStats.totalLinked}
- Total Submitted to Client: ${overallStats.totalSubmitted}
- Total Selected: ${overallStats.totalSelected}
- Total Rejected: ${overallStats.totalRejected}
- Total Ongoing: ${overallStats.totalOngoing}

PER-RECRUITER PERFORMANCE:
${recruiterDetails}

Please provide a detailed performance report (250-300 words) including:

1. **Overall Job Performance Summary**: How is the recruitment for this job progressing?

2. **Individual Recruiter Analysis**: Evaluate each recruiter's performance. Who is performing well? Who needs improvement?

3. **Key Metrics Comparison**: Compare submission rates, selection rates, and rejection rates across recruiters.

4. **Strengths & Weaknesses**: Identify what's working and what's not.

5. **Recommendations**: Specific, actionable recommendations for each recruiter to improve their performance.

6. **Performance Rankings**: Rank the recruiters based on overall effectiveness (considering selection rate, volume, and quality).

Keep the tone professional and constructive. Use bullet points and clear sections for readability.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const report = response.text();

    res.json({
      success: true,
      job: {
        jobId: job.jobId,
        title: job.title,
        organization: job.organization
      },
      overallStats,
      recruitersData,
      report
    });
  } catch (error) {
    console.error('Error generating performance report:', error);
    
    // Check if it's a rate limit error
    if (error.status === 429 || error.message?.includes('quota') || error.message?.includes('rate limit')) {
      return res.status(429).json({ 
        error: 'AI_RATE_LIMIT',
        message: 'The AI service is currently busy. Please try again in a minute.'
      });
    }
    
    res.status(500).json({ error: 'Failed to generate performance report' });
  }
};

// Get recruiter-specific analytics with date range filtering
exports.getRecruiterAnalytics = async (req, res) => {
  try {
    const { recruiterId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify recruiter exists
    const recruiter = await User.findById(recruiterId);
    if (!recruiter) {
      return res.status(404).json({ error: 'Recruiter not found' });
    }

    // Build date filter
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.createdAt.$lte = end;
      }
    }

    // Get all candidate job links associated with this recruiter
    const linkQuery = {
      $or: [
        { linkedBy: recruiterId },
        { sharedByRecruiterId: recruiterId }
      ],
      ...dateFilter
    };

    const links = await CandidateJobLink.find(linkQuery)
      .populate({
        path: 'candidateId',
        select: 'name email phone'
      })
      .populate({
        path: 'jobId',
        select: 'jobId title organization status createdAt'
      })
      .sort({ createdAt: -1 });

    // Filter out links with null candidates or jobs
    const validLinks = links.filter(l => l.candidateId && l.jobId);

    // Get unique jobs this recruiter has worked on
    const jobIds = [...new Set(validLinks.map(l => l.jobId._id.toString()))];
    
    // Workflow feature removed - clientStatusMap is now empty
    const clientStatusMap = new Map();

    // Calculate overall stats
    let overallStats = {
      totalLinked: 0,
      appliedThroughLink: 0,
      addedByRecruiter: 0,
      submittedToClient: 0,
      selectedByClient: 0,
      rejectedByClient: 0,
      ongoingProcess: 0,
      interviewScheduled: 0,
      interviewCompleted: 0,
      offered: 0,
      offerAccepted: 0,
      joined: 0
    };

    // Track candidates by source
    const candidatesBySource = {
      'applied-through-link': 0,
      'added-by-recruiter': 0,
      'manual-link': 0,
      'ai-suggested': 0
    };

    // Track per-job analytics
    const jobAnalyticsMap = new Map();

    validLinks.forEach(link => {
      const jobIdStr = link.jobId._id.toString();
      
      // Initialize job analytics if not exists
      if (!jobAnalyticsMap.has(jobIdStr)) {
        jobAnalyticsMap.set(jobIdStr, {
          job: {
            _id: link.jobId._id,
            jobId: link.jobId.jobId,
            title: link.jobId.title,
            organization: link.jobId.organization,
            status: link.jobId.status,
            createdAt: link.jobId.createdAt
          },
          stats: {
            totalLinked: 0,
            appliedThroughLink: 0,
            addedByRecruiter: 0,
            submittedToClient: 0,
            selectedByClient: 0,
            rejectedByClient: 0,
            ongoingProcess: 0,
            interviewScheduled: 0,
            interviewCompleted: 0,
            offered: 0
          },
          candidates: [],
          timeline: []
        });
      }

      const jobAnalytics = jobAnalyticsMap.get(jobIdStr);
      
      // Count by source
      overallStats.totalLinked++;
      jobAnalytics.stats.totalLinked++;
      
      if (link.source === 'applied-through-link') {
        overallStats.appliedThroughLink++;
        jobAnalytics.stats.appliedThroughLink++;
      } else if (link.source === 'added-by-recruiter' || link.source === 'manual-link') {
        overallStats.addedByRecruiter++;
        jobAnalytics.stats.addedByRecruiter++;
      }
      candidatesBySource[link.source] = (candidatesBySource[link.source] || 0) + 1;

      // Check if submitted to client
      if (link.status === 'Submitted to Client' || link.status === 'Submitted') {
        overallStats.submittedToClient++;
        jobAnalytics.stats.submittedToClient++;
      }

      // Check client-side status
      // Workflow feature removed - no client-side status tracking

      // Add candidate info to job analytics
      jobAnalytics.candidates.push({
        _id: link.candidateId._id,
        name: link.candidateId.name,
        email: link.candidateId.email,
        status: link.status,
        source: link.source,
        linkedAt: link.createdAt,
        clientSideStatus: null, // Workflow feature removed
        clientRounds: link.clientRounds || []
      });

      // Add to timeline
      jobAnalytics.timeline.push({
        date: link.createdAt,
        action: 'linked',
        candidateName: link.candidateId.name,
        source: link.source
      });
      
      if (link.submittedAt) {
        jobAnalytics.timeline.push({
          date: link.submittedAt,
          action: 'submitted',
          candidateName: link.candidateId.name
        });
      }
    });

    // Sort job analytics timelines
    jobAnalyticsMap.forEach(data => {
      data.timeline.sort((a, b) => new Date(a.date) - new Date(b.date));
    });

    // Convert map to array and sort by most active
    const jobAnalytics = Array.from(jobAnalyticsMap.values())
      .sort((a, b) => b.stats.totalLinked - a.stats.totalLinked);

    // Calculate conversion rates
    const conversionRates = {
      linkToSubmission: overallStats.totalLinked > 0 
        ? ((overallStats.submittedToClient / overallStats.totalLinked) * 100).toFixed(1) 
        : 0,
      submissionToSelection: overallStats.submittedToClient > 0 
        ? ((overallStats.selectedByClient / overallStats.submittedToClient) * 100).toFixed(1) 
        : 0,
      submissionToRejection: overallStats.submittedToClient > 0 
        ? ((overallStats.rejectedByClient / overallStats.submittedToClient) * 100).toFixed(1) 
        : 0,
      linkToSelection: overallStats.totalLinked > 0 
        ? ((overallStats.selectedByClient / overallStats.totalLinked) * 100).toFixed(1) 
        : 0
    };

    // Build activity timeline by date (for graphs)
    const activityByDate = {};
    validLinks.forEach(link => {
      const dateStr = new Date(link.createdAt).toISOString().split('T')[0];
      if (!activityByDate[dateStr]) {
        activityByDate[dateStr] = { 
          date: dateStr, 
          linked: 0, 
          submitted: 0, 
          appliedThroughLink: 0,
          addedByRecruiter: 0 
        };
      }
      activityByDate[dateStr].linked++;
      
      if (link.source === 'applied-through-link') {
        activityByDate[dateStr].appliedThroughLink++;
      } else {
        activityByDate[dateStr].addedByRecruiter++;
      }
      
      if (link.submittedAt) {
        const submitDateStr = new Date(link.submittedAt).toISOString().split('T')[0];
        if (!activityByDate[submitDateStr]) {
          activityByDate[submitDateStr] = { 
            date: submitDateStr, 
            linked: 0, 
            submitted: 0, 
            appliedThroughLink: 0,
            addedByRecruiter: 0 
          };
        }
        activityByDate[submitDateStr].submitted++;
      }
    });

    const activityTimeline = Object.values(activityByDate).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    // Build status distribution for pie chart
    const statusDistribution = {
      'New': 0,
      'Pre-screening': 0,
      'Stage 2 Screening': 0,
      'Shortlisted (Internal)': 0,
      'Not Reachable': 0,
      'Candidate Not Interested': 0,
      'Rejected (Internal)': 0,
      'Submitted to Client': 0
    };

    validLinks.forEach(link => {
      if (statusDistribution.hasOwnProperty(link.status)) {
        statusDistribution[link.status]++;
      } else {
        // Group legacy statuses
        if (link.status === 'Submitted') {
          statusDistribution['Submitted to Client']++;
        } else if (link.status === 'Pre screening') {
          statusDistribution['Pre-screening']++;
        } else if (link.status === 'Stage 2 screening') {
          statusDistribution['Stage 2 Screening']++;
        }
      }
    });

    // Client-side status distribution
    const clientStatusDistribution = {
      'Interview Scheduled': 0,
      'Interview Completed': 0,
      'Awaiting Feedback': 0,
      'Feedback Received': 0,
      'Shortlisted': 0,
      'Rejected': 0,
      'On Hold': 0,
      'Offered': 0,
      'Offer Accepted': 0,
      'Offer Declined': 0,
      'Joined': 0,
      'No Show': 0
    };

    validLinks.forEach(link => {
      // Workflow feature removed - no client-side status distribution
    });

    // Performance metrics
    const performanceMetrics = {
      averageLinkedPerJob: jobAnalytics.length > 0 
        ? (overallStats.totalLinked / jobAnalytics.length).toFixed(1) 
        : 0,
      averageSubmittedPerJob: jobAnalytics.length > 0 
        ? (overallStats.submittedToClient / jobAnalytics.length).toFixed(1) 
        : 0,
      successRate: overallStats.totalLinked > 0 
        ? ((overallStats.selectedByClient / overallStats.totalLinked) * 100).toFixed(2) 
        : 0,
      activeJobs: jobAnalytics.filter(j => j.job.status !== 'Completed' && j.job.status !== 'Withdrawn').length,
      completedJobs: jobAnalytics.filter(j => j.job.status === 'Completed').length,
      totalJobs: jobAnalytics.length
    };

    // Weekly activity (last 12 weeks)
    const weeklyActivity = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekLinks = validLinks.filter(l => {
        const linkDate = new Date(l.createdAt);
        return linkDate >= weekStart && linkDate <= weekEnd;
      });
      
      weeklyActivity.push({
        week: `W${12 - i}`,
        weekStart: weekStart.toISOString().split('T')[0],
        weekEnd: weekEnd.toISOString().split('T')[0],
        linked: weekLinks.length,
        submitted: weekLinks.filter(l => l.status === 'Submitted to Client' || l.status === 'Submitted').length
      });
    }

    res.json({
      success: true,
      recruiter: {
        _id: recruiter._id,
        fullName: recruiter.fullName,
        email: recruiter.email,
        phone: recruiter.phone,
        organization: recruiter.organization
      },
      dateRange: {
        startDate: startDate || null,
        endDate: endDate || null
      },
      overallStats,
      candidatesBySource,
      conversionRates,
      performanceMetrics,
      statusDistribution,
      clientStatusDistribution,
      activityTimeline,
      weeklyActivity,
      jobAnalytics,
      totalJobs: jobAnalytics.length
    });
  } catch (error) {
    console.error('Error fetching recruiter analytics:', error);
    res.status(500).json({ error: 'Failed to fetch recruiter analytics' });
  }
};

// Get list of unique companies for filtering
exports.getCompanies = async (req, res) => {
  try {
    const userId = req.user._id;

    const jobs = await Job.find({
      $or: [
        { authorizedUsers: userId },
        { createdBy: userId }
      ]
    }).distinct('organization');

    res.json({
      success: true,
      companies: jobs.sort()
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
};
