const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { supabaseAdmin } = require('../config/supabase');

const router = express.Router();

/**
 * POST /api/auth/register
 * Registers a citizen using supabaseAdmin.auth.admin.createUser with email_confirm: true.
 * This completely bypasses email verification so dummy/test emails work instantly!
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, phone, ward } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Create user with email_confirm = true so dummy emails are confirmed immediately
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName || 'Citizen',
        phone: phone || null,
        role: 'citizen',
        ward: ward || 'Ward 1'
      }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Ensure the profile row exists in public.profiles (trigger handles this, but upsert as safety guarantee)
    await supabaseAdmin
      .from('profiles')
      .upsert({
        id: data.user.id,
        full_name: fullName || 'Citizen',
        phone: phone || null,
        role: 'citizen',
        ward: ward || 'Ward 1'
      }, { onConflict: 'id' });

    res.json({
      message: 'Citizen registered and auto-confirmed successfully!',
      user: data.user
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message || 'Server failed to register user' });
  }
});

/**
 * POST /api/auth/confirm-user
 * Helper to manually confirm any dummy email that was previously stuck in unconfirmed state
 */
router.post('/confirm-user', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    const user = users.users.find(u => u.email === email);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      email_confirm: true
    });

    if (updateError) throw updateError;

    res.json({ message: `User ${email} has been confirmed successfully!` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/auth/me
 * Returns current authenticated user and their database profile.
 */
router.get('/me', requireAuth, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
    },
    profile: req.profile
  });
});

/**
 * GET /api/auth/departments
 * Fetch list of active municipal departments
 */
router.get('/departments', async (req, res) => {
  try {
    const { data: departments, error } = await supabaseAdmin
      .from('departments')
      .select('id, name')
      .order('name');

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ departments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * RBAC Verification Test Routes
 */
router.get('/test/citizen', requireAuth, requireRole('citizen'), (req, res) => {
  res.json({
    message: 'Welcome Citizen! RBAC verification passed.',
    profile: req.profile
  });
});

router.get('/test/officer', requireAuth, requireRole('officer'), (req, res) => {
  res.json({
    message: 'Welcome Officer! RBAC verification passed.',
    profile: req.profile
  });
});

router.get('/test/admin', requireAuth, requireRole('admin'), (req, res) => {
  res.json({
    message: 'Welcome Administrator! Full privileges verified.',
    profile: req.profile
  });
});

module.exports = router;
