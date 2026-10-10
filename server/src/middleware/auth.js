const { supabaseAdmin } = require('../config/supabase');

/**
 * Middleware: Verifies the Supabase JWT Bearer token and attaches
 * the authenticated user and their profile (with role) to req.
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized: Missing or malformed Authorization header'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token with Supabase Auth
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({
        error: 'Unauthorized: Invalid or expired token'
      });
    }

    // Query user profile from profiles table to check their actual role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, phone, role, department_id, ward, created_at')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(403).json({
        error: 'Forbidden: User profile not found in database'
      });
    }

    // Attach verified user and database profile
    req.user = user;
    req.profile = profile;

    next();
  } catch (err) {
    console.error('Authentication middleware error:', err);
    return res.status(500).json({
      error: 'Internal server error during authentication'
    });
  }
}

/**
 * Middleware factory: Enforces Role-Based Access Control (RBAC).
 * Checks if req.profile.role is included in the allowedRoles list.
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.profile) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required first' });
    }

    if (!allowedRoles.includes(req.profile.role)) {
      return res.status(403).json({
        error: `Forbidden: Access restricted. Required role: [${allowedRoles.join(', ')}], your role: [${req.profile.role}]`
      });
    }

    next();
  };
}

module.exports = {
  requireAuth,
  requireRole
};
