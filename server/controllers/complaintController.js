import { Complaint } from '../models/Complaint.js';
import { aiService } from '../services/ai/aiService.js';
import { getDepartmentById } from '../config/departments.js';

// Helper to format relative upload URLs
const getFileUrl = (req, file) => {
  if (!file) return null;
  let subfolder = 'images';
  if (file.mimetype.startsWith('video/')) subfolder = 'videos';
  else if (file.mimetype.startsWith('audio/') || file.filename.endsWith('.webm') || file.filename.endsWith('.wav')) subfolder = 'audio';
  return `/uploads/${subfolder}/${file.filename}`;
};

/**
 * ==========================================
 * CITIZEN CONTROLLERS
 * ==========================================
 */

// POST /api/complaints
export const createComplaint = async (req, res) => {
  try {
    const {
      description,
      aiGeneratedDescription,
      category,
      departmentId = 'railway',
      urgency,
      locationAddress,
      latitude,
      longitude,
      citizenId = 'CITIZEN-DEMO-001'
    } = req.body;

    if (!description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Description and category are required'
      });
    }

    const dept = getDepartmentById(departmentId);
    const complaintId = await Complaint.generateComplaintId(dept.code);

    // Process file attachments
    const images = req.files?.images?.map(f => getFileUrl(req, f)) || [];
    const videos = req.files?.video?.map(f => getFileUrl(req, f)) || [];
    const audio = req.files?.audio?.map(f => getFileUrl(req, f)) || [];

    // Run AI pipeline
    const aiPipelineResult = await aiService.processGrievancePipeline({
      description,
      category,
      location: locationAddress,
      imageFilenames: images,
      audioFilename: audio[0] || null
    });

    const finalAiDescription = aiGeneratedDescription && aiGeneratedDescription.trim() !== ''
      ? aiGeneratedDescription
      : aiPipelineResult.aiGeneratedDescription;

    const finalUrgency = urgency || aiPipelineResult.suggestedUrgency || 'Medium';

    const newComplaint = new Complaint({
      complaintId,
      citizenId,
      description,
      aiGeneratedDescription: finalAiDescription,
      category,
      department: {
        id: dept.id,
        code: dept.code,
        name: dept.name
      },
      urgency: finalUrgency,
      location: {
        address: locationAddress || 'Railway Station Premises',
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null
      },
      attachments: {
        images,
        videos,
        audio
      },
      aiAnalysis: aiPipelineResult.aiAnalysis,
      status: 'Submitted',
      progressUpdates: [
        {
          status: 'Submitted',
          message: 'Complaint submitted successfully by citizen and registered in Railway Grievance System.',
          officer: {
            name: 'System Dispatcher',
            department: dept.name,
            role: 'Automated Ingestion Cell'
          },
          timestamp: new Date()
        }
      ]
    });

    const savedComplaint = await newComplaint.save();

    return res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: savedComplaint
    });
  } catch (error) {
    console.error('[createComplaint Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit complaint'
    });
  }
};

// GET /api/complaints/citizen/:citizenId
export const getComplaintsByCitizen = async (req, res) => {
  try {
    const { citizenId } = req.params;
    const complaints = await Complaint.find({ citizenId: citizenId || 'CITIZEN-DEMO-001' })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints
    });
  } catch (error) {
    console.error('[getComplaintsByCitizen Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch citizen complaints'
    });
  }
};

// GET /api/complaints/:id
export const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = id.startsWith('RLY-') || id.includes('-')
      ? { complaintId: id }
      : { _id: id };

    const complaint = await Complaint.findOne(query);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    console.error('[getComplaintById Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch complaint details'
    });
  }
};

// POST /api/complaints/:id/verify-resolution
export const verifyResolution = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback = 'Resolved satisfactorily' } = req.body;

    const query = id.startsWith('RLY-') || id.includes('-')
      ? { complaintId: id }
      : { _id: id };

    const complaint = await Complaint.findOne(query);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.status = 'Closed';
    complaint.verification = {
      isVerified: true,
      verifiedAt: new Date(),
      feedback
    };

    complaint.progressUpdates.push({
      status: 'Closed',
      message: `Resolution verified and accepted by citizen. Feedback: "${feedback}"`,
      officer: {
        name: 'Citizen Verification',
        department: complaint.department.name,
        role: 'Citizen Portal'
      },
      timestamp: new Date()
    });

    await complaint.save();

    return res.status(200).json({
      success: true,
      message: 'Resolution confirmed and complaint marked as Closed',
      data: complaint
    });
  } catch (error) {
    console.error('[verifyResolution Error]', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to verify resolution' });
  }
};

// POST /api/complaints/:id/dispute
export const disputeResolution = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Dispute reason is required' });
    }

    const disputeMedia = req.files?.disputeMedia?.map(f => getFileUrl(req, f)) || [];

    const query = id.startsWith('RLY-') || id.includes('-')
      ? { complaintId: id }
      : { _id: id };

    const complaint = await Complaint.findOne(query);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.status = 'Disputed';
    complaint.dispute = {
      isDisputed: true,
      reason: reason.trim(),
      media: disputeMedia,
      createdAt: new Date()
    };

    complaint.progressUpdates.push({
      status: 'Disputed',
      message: `Citizen rejected resolution: "${reason.trim()}". Reopened for Railway Officer investigation.`,
      officer: {
        name: 'Citizen Escalation',
        department: complaint.department.name,
        role: 'Dispute Mediation'
      },
      media: disputeMedia,
      timestamp: new Date()
    });

    await complaint.save();

    return res.status(200).json({
      success: true,
      message: 'Dispute registered. Railway Department has been alerted.',
      data: complaint
    });
  } catch (error) {
    console.error('[disputeResolution Error]', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to dispute complaint' });
  }
};

// POST /api/ai/preview-analysis
export const previewAiAnalysis = async (req, res) => {
  try {
    const { description = '', category = 'Other', location = '' } = req.body;

    const [aiDescription, cvResult, urgencyResult, deptResult] = await Promise.all([
      aiService.generateComplaint(description, category, location),
      aiService.detectObjects([], category),
      aiService.predictUrgency(description, category),
      aiService.classifyDepartment(description, category)
    ]);

    return res.status(200).json({
      success: true,
      data: {
        aiGeneratedDescription: aiDescription,
        detectedObjects: cvResult.detectedObjects,
        confidence: cvResult.confidence,
        predictedCategory: category,
        predictedUrgency: urgencyResult.predictedUrgency,
        department: deptResult.department
      }
    });
  } catch (error) {
    console.error('[previewAiAnalysis Error]', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to generate AI preview' });
  }
};

/**
 * ==========================================
 * RAILWAY DEPARTMENT CONTROLLERS
 * ==========================================
 */

// GET /api/railway/complaints
export const getRailwayComplaints = async (req, res) => {
  try {
    const {
      status,
      urgency,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { 'department.id': 'railway' };

    if (status && status !== 'All') {
      filter.status = status;
    }
    if (urgency && urgency !== 'All') {
      filter.urgency = urgency;
    }
    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { complaintId: searchRegex },
        { description: searchRegex },
        { aiGeneratedDescription: searchRegex },
        { 'location.address': searchRegex },
        { category: searchRegex }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const complaints = await Complaint.find(filter).sort(sort);

    return res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints
    });
  } catch (error) {
    console.error('[getRailwayComplaints Error]', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch railway complaints' });
  }
};

// GET /api/railway/complaints/:id
export const getRailwayComplaintById = async (req, res) => {
  return getComplaintById(req, res);
};

// PATCH /api/railway/complaints/:id/status
export const updateRailwayStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message, officerName = 'Railway Officer', officerRole = 'Station Superintendent' } = req.body;

    const validStatuses = ['Submitted', 'Under Review', 'Accepted', 'In Progress', 'Resolved', 'Disputed', 'Escalated', 'Closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status provided' });
    }

    const query = id.startsWith('RLY-') || id.includes('-') ? { complaintId: id } : { _id: id };
    const complaint = await Complaint.findOne(query);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.status = status;
    complaint.progressUpdates.push({
      status,
      message: message || `Status updated to ${status} by Railway Officer.`,
      officer: {
        name: officerName,
        department: 'Railway Department',
        role: officerRole
      },
      timestamp: new Date()
    });

    await complaint.save();

    return res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      data: complaint
    });
  } catch (error) {
    console.error('[updateRailwayStatus Error]', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to update status' });
  }
};

// POST /api/railway/complaints/:id/progress
export const addRailwayProgressUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message, officerName = 'Railway Officer', officerRole = 'Field Engineer' } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Progress message is required' });
    }

    const progressMedia = req.files?.resolutionMedia?.map(f => getFileUrl(req, f)) || [];

    const query = id.startsWith('RLY-') || id.includes('-') ? { complaintId: id } : { _id: id };
    const complaint = await Complaint.findOne(query);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const newStatus = status || complaint.status;
    complaint.status = newStatus;

    complaint.progressUpdates.push({
      status: newStatus,
      message: message.trim(),
      officer: {
        name: officerName,
        department: 'Railway Department',
        role: officerRole
      },
      media: progressMedia,
      timestamp: new Date()
    });

    await complaint.save();

    return res.status(200).json({
      success: true,
      message: 'Progress update logged successfully',
      data: complaint
    });
  } catch (error) {
    console.error('[addRailwayProgressUpdate Error]', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to add progress update' });
  }
};

// POST /api/railway/complaints/:id/resolve
export const resolveRailwayComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      resolutionDescription,
      officerName = 'Railway Officer',
      officerRole = 'Divisional Engineer'
    } = req.body;

    if (!resolutionDescription || !resolutionDescription.trim()) {
      return res.status(400).json({ success: false, message: 'Resolution description is required' });
    }

    const resolutionMedia = req.files?.resolutionMedia?.map(f => getFileUrl(req, f)) || [];

    const query = id.startsWith('RLY-') || id.includes('-') ? { complaintId: id } : { _id: id };
    const complaint = await Complaint.findOne(query);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.status = 'Resolved';
    complaint.resolution = {
      notes: resolutionDescription.trim(),
      resolvedAt: new Date(),
      officer: `${officerName} (${officerRole})`,
      media: resolutionMedia
    };

    complaint.progressUpdates.push({
      status: 'Resolved',
      message: `Work completed: "${resolutionDescription.trim()}". Awaiting citizen resolution verification.`,
      officer: {
        name: officerName,
        department: 'Railway Department',
        role: officerRole
      },
      media: resolutionMedia,
      timestamp: new Date()
    });

    await complaint.save();

    return res.status(200).json({
      success: true,
      message: 'Complaint marked as Resolved and sent for citizen verification',
      data: complaint
    });
  } catch (error) {
    console.error('[resolveRailwayComplaint Error]', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to resolve complaint' });
  }
};

// POST /api/railway/complaints/:id/escalate
export const escalateRailwayComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      escalationReason = 'Requires senior divisional engineering intervention',
      escalatedTo = 'Divisional Railway Manager (DRM) Grievance Cell',
      officerName = 'Railway Officer'
    } = req.body;

    const query = id.startsWith('RLY-') || id.includes('-') ? { complaintId: id } : { _id: id };
    const complaint = await Complaint.findOne(query);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const previousStatus = complaint.status;
    complaint.status = 'Escalated';
    complaint.escalation = {
      isEscalated: true,
      escalatedAt: new Date(),
      escalationReason,
      previousStatus,
      escalatedTo
    };

    complaint.progressUpdates.push({
      status: 'Escalated',
      message: `Complaint escalated to ${escalatedTo}. Reason: "${escalationReason}"`,
      officer: {
        name: officerName,
        department: 'Railway Department',
        role: 'Escalations Officer'
      },
      timestamp: new Date()
    });

    await complaint.save();

    return res.status(200).json({
      success: true,
      message: 'Complaint escalated successfully',
      data: complaint
    });
  } catch (error) {
    console.error('[escalateRailwayComplaint Error]', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to escalate complaint' });
  }
};

// GET /api/railway/dashboard/stats
export const getRailwayDashboardStats = async (req, res) => {
  try {
    const filter = { 'department.id': 'railway' };

    const [
      total,
      submitted,
      underReview,
      inProgress,
      resolved,
      disputed,
      escalated,
      closed,
      urgentCritical,
      recentComplaints
    ] = await Promise.all([
      Complaint.countDocuments(filter),
      Complaint.countDocuments({ ...filter, status: 'Submitted' }),
      Complaint.countDocuments({ ...filter, status: 'Under Review' }),
      Complaint.countDocuments({ ...filter, status: 'In Progress' }),
      Complaint.countDocuments({ ...filter, status: 'Resolved' }),
      Complaint.countDocuments({ ...filter, status: 'Disputed' }),
      Complaint.countDocuments({ ...filter, status: 'Escalated' }),
      Complaint.countDocuments({ ...filter, status: 'Closed' }),
      Complaint.countDocuments({ ...filter, urgency: { $in: ['High', 'Critical'] }, status: { $nin: ['Resolved', 'Closed'] } }),
      Complaint.find(filter).sort({ createdAt: -1 }).limit(6)
    ]);

    // Breakdown by category
    const categoryStats = await Complaint.aggregate([
      { $match: filter },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        counts: {
          total,
          submitted,
          underReview,
          inProgress,
          resolved,
          disputed,
          escalated,
          closed,
          urgentCritical
        },
        categoryStats,
        recentComplaints
      }
    });
  } catch (error) {
    console.error('[getRailwayDashboardStats Error]', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch dashboard stats' });
  }
};
