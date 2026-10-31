import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'jansahayata_gov_secure_jwt_secret_key_2026_capstone_token';

/**
 * Authenticate User from JWT in Authorization header: Bearer <token>
 */
export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required. Please log in.'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Malformed authorization token.'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found or session expired.'
      });
    }

    if (user.status === 'Disabled') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated by the administrator.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth Middleware Error]', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token. Please log in again.'
    });
  }
};

/**
 * Optional Authentication (attach user if valid token present, otherwise proceed as guest)
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-passwordHash');
        if (user && user.status === 'Active') {
          req.user = user;
        }
      }
    }
  } catch {
    // Ignore error for optional auth
  }
  next();
};

/**
 * Role-Based Access Control Middleware
 * Usage: requireRole('SUPER_ADMIN') or requireRole('SUPER_ADMIN', 'EMPLOYEE')
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: You do not have permission (${allowedRoles.join(', ')} required, current role: ${req.user.role}).`
      });
    }

    next();
  };
};

/**
 * Department Authorization Middleware
 * Super Admins can access any department.
 * Employees can only access their assigned department.
 */
export const requireDepartmentAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  if (req.user.role === 'SUPER_ADMIN') {
    return next();
  }

  if (req.user.role === 'EMPLOYEE') {
    const requestedDept = req.params.deptId || req.query.deptId || req.body.departmentId || req.body.department?.id;
    
    // If no specific dept requested or if it matches employee dept, allow
    if (!requestedDept || requestedDept === req.user.department?.id || requestedDept === 'railway' && req.user.department?.id === 'railway') {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied: You only have access to grievances assigned to ${req.user.department?.name || 'your assigned department'}.`
    });
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied: Government official authorization required.'
  });
};
