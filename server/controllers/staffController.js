import { Complaint } from '../models/Complaint.js';
import { AuditLog } from '../models/AuditLog.js';
import { User } from '../models/User.js';
import { EmailChangeRequest } from '../models/EmailChangeRequest.js';
import { getDepartmentById } from '../config/departments.js';

const getFileUrl = (req, file) => {
  if (!file) return null;
  let subfolder = 'images';
  if (file.mimetype.startsWith('video/')) subfolder = 'videos';
  else if (file.mimetype.startsWith('audio/') || file.filename.endsWith('.webm') || file.filename.endsWith('.wav')) subfolder = 'audio';
  return `/uploads/${subfolder}/${file.filename}`;
};

/**
 * GET /api/staff/dashboard/stats
 * Scoped to the authenticated employee's department (or all if Super Admin)
 */
export const getStaffDashboardStats = async (req, res) => {
  try {
    const userDeptId = req.user.role === 'SUPER_ADMIN'
      ? (req.query.departmentId || 'railway')
      : (req.user.department?.id || 'railway');

    const filter = { 'department.id': userDeptId };

    const [
      total,
      submitted,
      underReview,
      accepted,
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
      Complaint.countDocuments({ ...filter, status: 'Accepted' }),
      Complaint.countDocuments({ ...filter, status: 'In Progress' }),
      Complaint.countDocuments({ ...filter, status: 'Resolved' }),
      Complaint.countDocuments({ ...filter, status: 'Disputed' }),
      Complaint.countDocuments({ ...filter, status: 'Escalated' }),
      Complaint.countDocuments({ ...filter, status: 'Closed' }),
      Complaint.countDocuments({ ...filter, urgency: { $in: ['High', 'Critical'] }, status: { $nin: ['Resolved', 'Closed'] } }),
      Complaint.find(filter).sort({ createdAt: -1 }).limit(6)
    ]);

    const categoryStats = await Complaint.aggregate([
      { $match: filter },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const deptInfo = getDepartmentById(userDeptId);

    return res.status(200).json({
      success: true,
      data: {
        department: {
          id: deptInfo.id,
          name: deptInfo.name,
          code: deptInfo.code,
          authority: deptInfo.authority
        },
        counts: {
          total,
          submitted,
          underReview,
          accepted,
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
    console.error('[getStaffDashboardStats Error]', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch department statistics.' });
  }
};

/**
 * GET /api/staff/complaints
 * Fetch complaints belonging to employee's department
 */
export const getStaffComplaints = async (req, res) => {
  try {
    const userDeptId = req.user.role === 'SUPER_ADMIN'
      ? (req.query.departmentId || null)
      : (req.user.department?.id || 'railway');

    const {
      status,
      urgency,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    if (userDeptId) {
      filter['department.id'] = userDeptId;
    }

    if (status && status !== 'All') filter.status = status;
    if (urgency && urgency !== 'All') filter.urgency = urgency;
    if (category && category !== 'All') filter.category = category;

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { complaintId: searchRegex },
        { description: searchRegex },
        { generatedProblemStatement: searchRegex },
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
    console.error('[getStaffComplaints Error]', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch department complaints.' });
  }
};

/**
 * GET /api/staff/complaints/:id
 */
export const getStaffComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = id.startsWith('JNS-') || id.startsWith('RLY-') || id.includes('-')
      ? { complaintId: id }
      : { _id: id };

    const complaint = await Complaint.findOne(query);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    // Verify employee department matches complaint department (unless Super Admin)
    if (req.user.role === 'EMPLOYEE' && complaint.department?.id !== req.user.department?.id) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Grievance belongs to ${complaint.department?.name || 'another department'}.`
      });
    }

    return res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    console.error('[getStaffComplaintById Error]', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch complaint.' });
  }
};

/**
 * PATCH /api/staff/complaints/:id/status (Update Complaint Status)
 */
export const updateStaffStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message } = req.body;

    const validTransitions = ['Submitted', 'Under Review', 'Accepted', 'In Progress', 'Resolved', 'Disputed', 'Escalated', 'Closed'];
    if (!validTransitions.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status provided.' });
    }

    const query = id.startsWith('JNS-') || id.startsWith('RLY-') || id.includes('-')
      ? { complaintId: id }
      : { _id: id };

    const complaint = await Complaint.findOne(query);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    // Department boundary check
    if (req.user.role === 'EMPLOYEE' && complaint.department?.id !== req.user.department?.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot modify complaints outside your department.'
      });
    }

    const prevStatus = complaint.status;
    complaint.status = status;

    const officerName = req.user?.name || 'Government Officer';
    const officerDept = req.user?.department?.name || complaint.department?.name || 'Department';
    const officerRole = req.user?.designation || 'Grievance Officer';

    complaint.progressUpdates.push({
      status,
      message: message || `Status updated from "${prevStatus}" to "${status}" by ${officerName}.`,
      officer: {
        name: officerName,
        department: officerDept,
        role: officerRole
      },
      timestamp: new Date()
    });

    await complaint.save();

    await AuditLog.logAction({
      action: 'STATUS_UPDATED',
      performedBy: req.user,
      targetType: 'Complaint',
      targetId: complaint.complaintId,
      details: `Officer updated ${complaint.complaintId} status to ${status}. Note: ${message || 'Standard status transition'}`,
      ipAddress: req.ip
    });

    return res.status(200).json({
      success: true,
      message: `Status updated to ${status}.`,
      data: complaint
    });
  } catch (error) {
    console.error('[updateStaffStatus Error]', error);
    return res.status(500).json({ success: false, message: 'Failed to update status.' });
  }
};

/**
 * POST /api/staff/complaints/:id/progress (Add Investigation / Progress Update with optional photo)
 */
export const addStaffProgressUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message, notes } = req.body;

    const textContent = message || notes;
    if (!textContent || !textContent.trim()) {
      return res.status(400).json({ success: false, message: 'Progress note / investigation description is required.' });
    }

    const progressMedia = req.files?.resolutionMedia?.map(f => getFileUrl(req, f)) || [];

    const query = id.startsWith('JNS-') || id.startsWith('RLY-') || id.includes('-')
      ? { complaintId: id }
      : { _id: id };

    const complaint = await Complaint.findOne(query);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    if (req.user.role === 'EMPLOYEE' && complaint.department?.id !== req.user.department?.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: Department mismatch.' });
    }

    const targetStatus = status || complaint.status;
    complaint.status = targetStatus;

    if (notes) {
      complaint.investigationNotes = complaint.investigationNotes
        ? `${complaint.investigationNotes}\n[${new Date().toLocaleDateString()}] ${notes}`
        : `[${new Date().toLocaleDateString()}] ${notes}`;
    }

    const officerName = req.user?.name || 'Department Officer';
    const officerDept = req.user?.department?.name || complaint.department?.name || 'Department';
    const officerRole = req.user?.designation || 'Field Engineer';

    complaint.progressUpdates.push({
      status: targetStatus,
      message: textContent.trim(),
      officer: {
        name: officerName,
        department: officerDept,
        role: officerRole
      },
      media: progressMedia,
      timestamp: new Date()
    });

    await complaint.save();

    await AuditLog.logAction({
      action: 'PROGRESS_UPDATE_ADDED',
      performedBy: req.user,
      targetType: 'Complaint',
      targetId: complaint.complaintId,
      details: `Officer logged progress on ${complaint.complaintId}: ${textContent.trim().substring(0, 80)}`,
      ipAddress: req.ip
    });

    return res.status(200).json({
      success: true,
      message: 'Progress update logged successfully.',
      data: complaint
    });
  } catch (error) {
    console.error('[addStaffProgressUpdate Error]', error);
    return res.status(500).json({ success: false, message: 'Failed to add progress update.' });
  }
};

/**
 * POST /api/staff/complaints/:id/resolve (Resolve Complaint with Resolution Evidence)
 */
export const resolveStaffComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionDescription } = req.body;

    if (!resolutionDescription || !resolutionDescription.trim()) {
      return res.status(400).json({ success: false, message: 'Resolution summary and work details are required.' });
    }

    const resolutionMedia = req.files?.resolutionMedia?.map(f => getFileUrl(req, f)) || [];

    const query = id.startsWith('JNS-') || id.startsWith('RLY-') || id.includes('-')
      ? { complaintId: id }
      : { _id: id };

    const complaint = await Complaint.findOne(query);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    if (req.user.role === 'EMPLOYEE' && complaint.department?.id !== req.user.department?.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: Department mismatch.' });
    }

    const officerName = req.user?.name || 'Department Officer';
    const officerDept = req.user?.department?.name || complaint.department?.name || 'Department';
    const officerRole = req.user?.designation || 'Grievance Officer';

    complaint.status = 'Resolved';
    complaint.resolution = {
      notes: resolutionDescription.trim(),
      resolvedAt: new Date(),
      officer: `${officerName} (${officerRole}, ${officerDept})`,
      media: resolutionMedia
    };

    complaint.progressUpdates.push({
      status: 'Resolved',
      message: `Resolution reported: "${resolutionDescription.trim()}". Work completed by departmental unit. Awaiting citizen confirmation.`,
      officer: {
        name: officerName,
        department: officerDept,
        role: officerRole
      },
      media: resolutionMedia,
      timestamp: new Date()
    });

    await complaint.save();

    await AuditLog.logAction({
      action: 'COMPLAINT_RESOLVED',
      performedBy: req.user,
      targetType: 'Complaint',
      targetId: complaint.complaintId,
      details: `Officer marked ${complaint.complaintId} as Resolved: "${resolutionDescription.trim().substring(0, 100)}"`,
      ipAddress: req.ip
    });

    return res.status(200).json({
      success: true,
      message: 'Complaint marked as Resolved and forwarded for citizen verification.',
      data: complaint
    });
  } catch (error) {
    console.error('[resolveStaffComplaint Error]', error);
    return res.status(500).json({ success: false, message: 'Failed to record resolution.' });
  }
};

/**
 * POST /api/staff/complaints/:id/escalate (Escalate to Senior Officer / Divisional Directorate)
 */
export const escalateStaffComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      escalationReason = 'Requires senior engineering or administrative intervention',
      escalatedTo = 'Divisional Grievance Cell / Directorate'
    } = req.body;

    const query = id.startsWith('JNS-') || id.startsWith('RLY-') || id.includes('-')
      ? { complaintId: id }
      : { _id: id };

    const complaint = await Complaint.findOne(query);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    if (req.user.role === 'EMPLOYEE' && complaint.department?.id !== req.user.department?.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: Department mismatch.' });
    }

    const previousStatus = complaint.status;
    complaint.status = 'Escalated';
    complaint.escalation = {
      isEscalated: true,
      escalatedAt: new Date(),
      escalationReason: escalationReason.trim(),
      previousStatus,
      escalatedTo: escalatedTo.trim()
    };

    const officerName = req.user?.name || 'Department Officer';
    const officerDept = req.user?.department?.name || complaint.department?.name || 'Department';

    complaint.progressUpdates.push({
      status: 'Escalated',
      message: `Grievance escalated to ${escalatedTo.trim()}. Reason: "${escalationReason.trim()}"`,
      officer: {
        name: officerName,
        department: officerDept,
        role: req.user?.designation || 'Escalation Officer'
      },
      timestamp: new Date()
    });

    await complaint.save();

    await AuditLog.logAction({
      action: 'COMPLAINT_ESCALATED',
      performedBy: req.user,
      targetType: 'Complaint',
      targetId: complaint.complaintId,
      details: `Officer escalated ${complaint.complaintId} to ${escalatedTo}: ${escalationReason}`,
      ipAddress: req.ip
    });

    return res.status(200).json({
      success: true,
      message: 'Grievance escalated successfully.',
      data: complaint
    });
  } catch (error) {
    console.error('[escalateStaffComplaint Error]', error);
    return res.status(500).json({ success: false, message: 'Failed to escalate complaint.' });
  }
};

/**
 * POST /api/staff/email-change-request
 * Submit an official email address update request for Super Admin approval
 */
export const submitEmailChangeRequest = async (req, res) => {
  try {
    const { requestedEmail, reason, contactPhone } = req.body;

    if (!requestedEmail || !requestedEmail.trim()) {
      return res.status(400).json({ success: false, message: 'New official email address is required.' });
    }

    if (!reason || !reason.trim() || reason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'A detailed official justification reason (at least 10 characters) is required.'
      });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const normalizedNewEmail = requestedEmail.trim().toLowerCase();

    if (!emailRegex.test(normalizedNewEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid official email address.' });
    }

    if (normalizedNewEmail === req.user.email.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: 'The requested new email cannot be the same as your current registered email.'
      });
    }

    // Check if new email is already taken by another registered user
    const existingUser = await User.findOne({ email: normalizedNewEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'The requested email address is already registered to another active account.'
      });
    }

    // Check if officer already has a pending request
    const existingPending = await EmailChangeRequest.findOne({
      officer: req.user._id,
      status: 'PENDING'
    });

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active email update request pending Super Admin review.',
        pendingRequest: existingPending
      });
    }

    const changeRequest = new EmailChangeRequest({
      officer: req.user._id,
      officerName: req.user.name,
      employeeId: req.user.employeeId || 'OFFICER',
      department: req.user.department || { id: '', code: '', name: 'General Directorate' },
      designation: req.user.designation || 'Grievance Redressal Officer',
      currentEmail: req.user.email,
      requestedEmail: normalizedNewEmail,
      reason: reason.trim(),
      contactPhone: contactPhone ? contactPhone.trim() : (req.user.phone || ''),
      status: 'PENDING'
    });

    const savedRequest = await changeRequest.save();

    await AuditLog.logAction({
      action: 'OFFICER_EMAIL_CHANGE_REQUESTED',
      performedBy: req.user,
      targetType: 'User',
      targetId: req.user._id,
      details: `Officer ${req.user.name} (${req.user.employeeId}) requested email update from ${req.user.email} to ${normalizedNewEmail}. Reason: ${reason.trim()}`,
      ipAddress: req.ip
    });

    return res.status(201).json({
      success: true,
      message: 'Official email change request submitted successfully. Awaiting Super Admin authorization.',
      data: savedRequest
    });
  } catch (error) {
    console.error('[submitEmailChangeRequest Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit email update request.'
    });
  }
};

/**
 * GET /api/staff/email-change-request/status
 * Get the latest / pending email change request status for the logged-in officer
 */
export const getEmailChangeRequestStatus = async (req, res) => {
  try {
    const latestRequest = await EmailChangeRequest.findOne({ officer: req.user._id })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: latestRequest || null
    });
  } catch (error) {
    console.error('[getEmailChangeRequestStatus Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve email request status.'
    });
  }
};

