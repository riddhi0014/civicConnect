const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { supabaseAdmin } = require('../config/supabase');
const { triageComplaint } = require('../services/ai');
const { calculateDueAt, autoAssignComplaint } = require('../services/assignment');
const { runAutoCloseJob } = require('../services/cron');

const router = express.Router();

/**
 * GET /api/complaints/categories
 * Returns all categories with their subcategories and mapped department
 */
router.get('/categories', async (req, res) => {
  try {
    const { data: categories, error: catError } = await supabaseAdmin
      .from('categories')
      .select(`
        id,
        name,
        icon,
        department_id,
        departments ( id, name ),
        subcategories ( id, name )
      `)
      .order('name');

    if (catError) {
      return res.status(500).json({ error: catError.message });
    }

    res.json({ categories });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

/**
 * GET /api/complaints/check-duplicate
 * Proactive live duplicate check based on plain SQL within 7 days
 */
router.get('/check-duplicate', requireAuth, async (req, res) => {
  try {
    const { category_id, ward } = req.query;

    if (!category_id) {
      return res.json({ duplicates: [] });
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    let query = supabaseAdmin
      .from('complaints')
      .select('id, title, status, ward, created_at')
      .eq('category_id', category_id)
      .gte('created_at', sevenDaysAgo)
      .neq('status', 'closed');

    if (ward) {
      query = query.ilike('ward', `%${ward}%`);
    }

    const { data: duplicates, error } = await query.limit(5);

    if (error) {
      console.error('Duplicate check query error:', error);
      return res.json({ duplicates: [] });
    }

    res.json({ duplicates: duplicates || [] });
  } catch (err) {
    console.error('Error checking duplicates:', err);
    res.json({ duplicates: [] });
  }
});

/**
 * POST /api/complaints
 * Citizen files a complaint.
 */
router.post('/', requireAuth, requireRole('citizen', 'admin'), async (req, res) => {
  try {
    const citizenId = req.user.id;
    const {
      category_id,
      subcategory_id,
      title,
      description,
      location_text,
      lat,
      lng,
      ward,
      photo_url
    } = req.body;

    if (!category_id || !title || !description || !location_text) {
      return res.status(400).json({
        error: 'Missing required fields: category_id, title, description, and location_text are required.'
      });
    }

    const citizenWard = ward || req.profile.ward || null;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: categoryData } = await supabaseAdmin
      .from('categories')
      .select('id, name, department_id')
      .eq('id', category_id)
      .single();

    let duplicateQuery = supabaseAdmin
      .from('complaints')
      .select('id, title, status, created_at, ward')
      .eq('category_id', category_id)
      .gte('created_at', sevenDaysAgo)
      .neq('status', 'closed');

    if (citizenWard) {
      duplicateQuery = duplicateQuery.ilike('ward', `%${citizenWard}%`);
    }

    const { data: potentialDuplicates } = await duplicateQuery.limit(5);
    const hasDuplicates = potentialDuplicates && potentialDuplicates.length > 0;

    const initialDueAt = calculateDueAt('medium');

    const { data: complaint, error: insertError } = await supabaseAdmin
      .from('complaints')
      .insert({
        citizen_id: citizenId,
        category_id,
        subcategory_id: subcategory_id || null,
        title: title.trim(),
        description: description.trim(),
        location_text: location_text.trim(),
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        ward: citizenWard,
        photo_url: photo_url || null,
        status: 'submitted',
        priority: 'medium',
        due_at: initialDueAt
      })
      .select(`*`)
      .single();

    if (insertError) {
      console.error('Complaint insert error:', insertError);
      return res.status(500).json({ error: insertError.message });
    }

    await supabaseAdmin
      .from('complaint_events')
      .insert({
        complaint_id: complaint.id,
        actor_id: citizenId,
        from_status: null,
        to_status: 'submitted',
        note: 'Citizen logged grievance via CivicConnect portal'
      });

    const triageResult = await triageComplaint(
      title,
      description,
      categoryData?.name || 'General'
    );

    const calculatedDueAt = calculateDueAt(triageResult.priority);

    await supabaseAdmin
      .from('complaints')
      .update({
        priority: triageResult.priority,
        ai_summary: triageResult.summary,
        ai_is_spam: triageResult.is_spam,
        due_at: calculatedDueAt
      })
      .eq('id', complaint.id);

    const departmentId = categoryData?.department_id;
    const assignmentResult = await autoAssignComplaint(
      complaint.id,
      departmentId,
      citizenWard
    );

    const { data: finalComplaint } = await supabaseAdmin
      .from('complaints')
      .select(`
        *,
        category:categories(id, name, icon),
        subcategory:subcategories(id, name),
        assigned_officer:profiles!complaints_assigned_officer_id_fkey(id, full_name, phone, department_id, ward),
        events:complaint_events(id, actor_id, from_status, to_status, note, created_at)
      `)
      .eq('id', complaint.id)
      .single();

    res.status(201).json({
      message: 'Complaint submitted and processed successfully',
      complaint: finalComplaint || complaint,
      ai_triage: triageResult,
      assignment: assignmentResult,
      potential_duplicates: hasDuplicates ? potentialDuplicates : []
    });
  } catch (err) {
    console.error('Submit complaint error:', err);
    res.status(500).json({ error: err.message || 'Server failed to submit complaint' });
  }
});

/**
 * GET /api/complaints/mine
 * Citizen views their own filed complaints along with event history and resolution info
 */
router.get('/mine', requireAuth, requireRole('citizen', 'admin'), async (req, res) => {
  try {
    const citizenId = req.user.id;

    const { data: complaints, error } = await supabaseAdmin
      .from('complaints')
      .select(`
        *,
        category:categories(id, name, icon),
        subcategory:subcategories(id, name),
        assigned_officer:profiles!complaints_assigned_officer_id_fkey(id, full_name, phone, ward),
        events:complaint_events(id, actor_id, from_status, to_status, note, created_at),
        resolution:resolutions(id, officer_id, note, after_photo_url, created_at),
        feedback:feedback(id, rating, speed_rating, communication_rating, comment, created_at)
      `)
      .eq('citizen_id', citizenId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching complaints:', error);
      return res.status(500).json({ error: error.message });
    }

    const formattedComplaints = (complaints || []).map(c => ({
      ...c,
      resolution: Array.isArray(c.resolution) ? (c.resolution[0] || null) : c.resolution,
      feedback: Array.isArray(c.feedback) ? (c.feedback[0] || null) : c.feedback
    }));

    res.json({ complaints: formattedComplaints });
  } catch (err) {
    console.error('Fetch mine complaints error:', err);
    res.status(500).json({ error: 'Failed to retrieve your complaints' });
  }
});

/**
 * POST /api/complaints/:id/confirm
 * Citizen confirms resolution ("Is it fixed? Yes / No")
 * - Yes: status=closed, closed_reason=citizen_confirmed.
 * - No: status=reopened, flagged to the admin.
 */
router.post('/:id/confirm', requireAuth, requireRole('citizen', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { is_fixed, dispute_reason } = req.body;
    const citizenId = req.user.id;

    // Fetch complaint
    const { data: complaint, error: fetchError } = await supabaseAdmin
      .from('complaints')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    // Citizen can only confirm their own complaint
    if (complaint.citizen_id !== citizenId && req.profile.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: You can only verify your own complaints' });
    }

    if (complaint.status !== 'resolved') {
      return res.status(400).json({
        error: `Cannot confirm complaint in status "${complaint.status}". It must be "resolved".`
      });
    }

    const now = new Date().toISOString();

    if (is_fixed) {
      // 1. Citizen confirms fix -> close complaint
      const { data: updatedComplaint, error: updateError } = await supabaseAdmin
        .from('complaints')
        .update({
          status: 'closed',
          closed_at: now,
          closed_reason: 'citizen_confirmed'
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Audit event
      await supabaseAdmin
        .from('complaint_events')
        .insert({
          complaint_id: id,
          actor_id: citizenId,
          from_status: 'resolved',
          to_status: 'closed',
          note: 'Citizen confirmed resolution. Grievance closed successfully.'
        });

      return res.json({
        message: 'Resolution confirmed. Ticket closed.',
        complaint: updatedComplaint
      });
    } else {
      // 2. Citizen disputes fix -> reopen complaint
      const { data: updatedComplaint, error: updateError } = await supabaseAdmin
        .from('complaints')
        .update({
          status: 'reopened'
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Audit event (flagged to admin)
      await supabaseAdmin
        .from('complaint_events')
        .insert({
          complaint_id: id,
          actor_id: citizenId,
          from_status: 'resolved',
          to_status: 'reopened',
          note: `Citizen rejected resolution: "${dispute_reason || 'Issue still persists'}". Reopened and flagged to administrator.`
        });

      return res.json({
        message: 'Complaint reopened and flagged to city administration.',
        complaint: updatedComplaint
      });
    }
  } catch (err) {
    console.error('Confirm resolution error:', err);
    res.status(500).json({ error: err.message || 'Server error confirming resolution' });
  }
});

/**
 * POST /api/complaints/:id/feedback
 * Citizen rates their experience (1-5 stars, speed, communication, comment)
 * Insertable only by the complaint's citizen and only when status is resolved or closed.
 */
router.post('/:id/feedback', requireAuth, requireRole('citizen', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, speed_rating, communication_rating, comment } = req.body;
    const citizenId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
    }

    // Fetch complaint
    const { data: complaint, error: fetchError } = await supabaseAdmin
      .from('complaints')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    if (complaint.citizen_id !== citizenId && req.profile.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: You can only rate your own complaints.' });
    }

    if (!['resolved', 'closed'].includes(complaint.status)) {
      return res.status(400).json({
        error: 'Feedback can only be submitted for complaints that are resolved or closed.'
      });
    }

    // Insert or update feedback
    const { data: feedbackRecord, error: feedbackError } = await supabaseAdmin
      .from('feedback')
      .upsert({
        complaint_id: id,
        citizen_id: citizenId,
        rating: parseInt(rating, 10),
        speed_rating: speed_rating || null,
        communication_rating: communication_rating || null,
        comment: comment ? comment.trim() : null
      }, { onConflict: 'complaint_id' })
      .select()
      .single();

    if (feedbackError) {
      console.error('Feedback insert error:', feedbackError);
      return res.status(500).json({ error: feedbackError.message });
    }

    res.status(201).json({
      message: 'Thank you! Your feedback has been recorded.',
      feedback: feedbackRecord
    });
  } catch (err) {
    console.error('Feedback error:', err);
    res.status(500).json({ error: err.message || 'Server error recording feedback' });
  }
});

/**
 * POST /api/complaints/trigger-cron
 * Manual test trigger for the 72-hour auto-close job
 */
router.post('/trigger-cron', requireAuth, async (req, res) => {
  try {
    const result = await runAutoCloseJob();
    res.json({ message: 'Auto-close job triggered', result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/complaints/:id
 * Retrieve specific complaint with full history
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.profile.role;

    const { data: complaint, error } = await supabaseAdmin
      .from('complaints')
      .select(`
        *,
        category:categories(id, name, icon),
        subcategory:subcategories(id, name),
        assigned_officer:profiles!complaints_assigned_officer_id_fkey(id, full_name, phone, ward),
        events:complaint_events(id, actor_id, from_status, to_status, note, created_at),
        resolution:resolutions(id, officer_id, note, after_photo_url, created_at),
        feedback:feedback(id, rating, speed_rating, communication_rating, comment, created_at)
      `)
      .eq('id', id)
      .single();

    if (error || !complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    if (userRole === 'citizen' && complaint.citizen_id !== userId) {
      return res.status(403).json({ error: 'Forbidden: Access denied to this complaint' });
    }
    if (userRole === 'officer' && complaint.assigned_officer_id !== userId) {
      return res.status(403).json({ error: 'Forbidden: You are not assigned to this complaint' });
    }

    const formattedComplaint = {
      ...complaint,
      resolution: Array.isArray(complaint.resolution) ? (complaint.resolution[0] || null) : complaint.resolution,
      feedback: Array.isArray(complaint.feedback) ? (complaint.feedback[0] || null) : complaint.feedback
    };

    res.json({ complaint: formattedComplaint });
  } catch (err) {
    console.error('Get complaint detail error:', err);
    res.status(500).json({ error: 'Failed to retrieve complaint details' });
  }
});

module.exports = router;
