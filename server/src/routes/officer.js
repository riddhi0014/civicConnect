const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { supabaseAdmin } = require('../config/supabase');

const router = express.Router();

// Apply auth and officer role to all officer routes (Admins also permitted)
router.use(requireAuth, requireRole('officer', 'admin'));

/**
 * GET /api/officer/complaints
 * Fetches complaints assigned to the logged-in officer along with KPIs
 */
router.get('/complaints', async (req, res) => {
  try {
    const officerId = req.user.id;
    const now = new Date();

    // 1. Fetch complaints assigned to this officer
    const { data: complaints, error } = await supabaseAdmin
      .from('complaints')
      .select(`
        *,
        category:categories(id, name, icon),
        subcategory:subcategories(id, name),
        citizen:profiles!complaints_citizen_id_fkey(id, full_name, phone, ward),
        resolution:resolutions(id, officer_id, note, after_photo_url, created_at),
        feedback:feedback(id, rating, speed_rating, communication_rating, comment, created_at),
        events:complaint_events(id, actor_id, from_status, to_status, note, created_at)
      `)
      .eq('assigned_officer_id', officerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching officer complaints:', error);
      return res.status(500).json({ error: error.message });
    }

    // 2. Compute KPIs
    const activeComplaints = complaints.filter(c => ['assigned', 'in_progress', 'reopened'].includes(c.status));
    const overdueComplaints = activeComplaints.filter(c => c.due_at && new Date(c.due_at) < now);
    const resolvedComplaints = complaints.filter(c => ['resolved', 'closed'].includes(c.status));

    // Fetch average rating for this officer from feedback
    const { data: officerFeedback } = await supabaseAdmin
      .from('feedback')
      .select('rating, complaint_id, complaints!inner(assigned_officer_id)')
      .eq('complaints.assigned_officer_id', officerId);

    let avgRating = 0;
    if (officerFeedback && officerFeedback.length > 0) {
      const sum = officerFeedback.reduce((acc, f) => acc + f.rating, 0);
      avgRating = parseFloat((sum / officerFeedback.length).toFixed(1));
    }

    // Normalize resolution array into single object and attach is_overdue flag
    const enrichedComplaints = complaints.map(c => ({
      ...c,
      resolution: Array.isArray(c.resolution) ? (c.resolution[0] || null) : c.resolution,
      feedback: Array.isArray(c.feedback) ? (c.feedback[0] || null) : c.feedback,
      is_overdue: Boolean(c.due_at && new Date(c.due_at) < now && ['assigned', 'in_progress', 'reopened'].includes(c.status))
    }));

    res.json({
      complaints: enrichedComplaints,
      kpis: {
        assignedCount: activeComplaints.length,
        overdueCount: overdueComplaints.length,
        resolvedCount: resolvedComplaints.length,
        avgRating: avgRating > 0 ? avgRating : 5.0,
        totalHistoryCount: complaints.length
      }
    });
  } catch (err) {
    console.error('Officer complaints error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch officer queue' });
  }
});

/**
 * PATCH /api/officer/complaints/:id/status
 * Move status to 'in_progress'.
 */
router.patch('/complaints/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const officerId = req.user.id;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    if (status === 'closed') {
      return res.status(403).json({
        error: 'Forbidden: Officers cannot close complaints. Closing requires citizen confirmation or 72-hour auto-close timer.'
      });
    }

    if (status === 'resolved') {
      return res.status(400).json({
        error: 'Resolving a complaint requires resolution note and after-photo proof. Please submit via the resolve endpoint.'
      });
    }

    const { data: complaint, error: fetchError } = await supabaseAdmin
      .from('complaints')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    if (complaint.assigned_officer_id !== officerId && req.profile.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: You are not assigned to this complaint' });
    }

    const previousStatus = complaint.status;

    const { data: updatedComplaint, error: updateError } = await supabaseAdmin
      .from('complaints')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    await supabaseAdmin
      .from('complaint_events')
      .insert({
        complaint_id: id,
        actor_id: officerId,
        from_status: previousStatus,
        to_status: status,
        note: note || `Officer moved status from ${previousStatus} to ${status}`
      });

    res.json({
      message: `Status updated to ${status}`,
      complaint: updatedComplaint
    });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/officer/complaints/:id/resolve
 * Officer marks complaint resolved with proof.
 */
router.post('/complaints/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { note, after_photo_url } = req.body;
    const officerId = req.user.id;

    if (!note || !note.trim()) {
      return res.status(400).json({ error: 'Resolution note is required.' });
    }
    if (!after_photo_url || !after_photo_url.trim()) {
      return res.status(400).json({ error: 'After-photo proof is strictly required to resolve a complaint.' });
    }

    const { data: complaint, error: fetchError } = await supabaseAdmin
      .from('complaints')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    if (complaint.assigned_officer_id !== officerId && req.profile.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: You are not assigned to this complaint' });
    }

    const previousStatus = complaint.status;
    const resolvedTimestamp = new Date().toISOString();

    const { data: resolution, error: resError } = await supabaseAdmin
      .from('resolutions')
      .insert({
        complaint_id: id,
        officer_id: officerId,
        note: note.trim(),
        after_photo_url: after_photo_url.trim()
      })
      .select()
      .single();

    if (resError) {
      console.error('Error inserting resolution:', resError);
      return res.status(500).json({ error: resError.message });
    }

    const { data: updatedComplaint, error: updateError } = await supabaseAdmin
      .from('complaints')
      .update({
        status: 'resolved',
        resolved_at: resolvedTimestamp
      })
      .eq('id', id)
      .select(`
        *,
        category:categories(id, name, icon),
        subcategory:subcategories(id, name),
        citizen:profiles!complaints_citizen_id_fkey(id, full_name, phone, ward)
      `)
      .single();

    if (updateError) {
      console.error('Error updating complaint to resolved:', updateError);
      return res.status(500).json({ error: updateError.message });
    }

    await supabaseAdmin
      .from('complaint_events')
      .insert({
        complaint_id: id,
        actor_id: officerId,
        from_status: previousStatus,
        to_status: 'resolved',
        note: `Resolved by Officer: "${note.trim()}". After-photo proof attached. Awaiting citizen confirmation.`
      });

    res.status(200).json({
      message: 'Complaint marked as resolved with proof. Sent to citizen for confirmation.',
      complaint: updatedComplaint,
      resolution
    });
  } catch (err) {
    console.error('Resolve complaint error:', err);
    res.status(500).json({ error: err.message || 'Server failed to process resolution' });
  }
});

module.exports = router;
