const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { supabaseAdmin } = require('../config/supabase');

const router = express.Router();

/**
 * GET /api/notifications
 * Recent activity relevant to the signed-in user, built from the complaint_events audit trail:
 * - citizen: updates on complaints they filed
 * - officer: updates on complaints assigned to them
 * - admin:   complaints reopened (disputed) by citizens
 * The user's own actions are excluded. Read/unread state is kept by the client.
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.profile.role;
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    let query = supabaseAdmin
      .from('complaint_events')
      .select('id, complaint_id, from_status, to_status, note, created_at, complaints!inner(title, citizen_id, assigned_officer_id)')
      .gte('created_at', since)
      .or(`actor_id.is.null,actor_id.neq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(25);

    if (role === 'citizen') {
      query = query.eq('complaints.citizen_id', userId);
    } else if (role === 'officer') {
      query = query.eq('complaints.assigned_officer_id', userId);
    } else {
      query = query.eq('to_status', 'reopened');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Notifications query error:', error);
      return res.status(500).json({ error: error.message });
    }

    const notifications = (data || []).map(({ complaints, ...e }) => ({
      ...e,
      complaint_title: complaints?.title || 'Complaint'
    }));

    res.json({ notifications });
  } catch (err) {
    console.error('Notifications error:', err);
    res.status(500).json({ error: 'Failed to load notifications' });
  }
});

module.exports = router;
