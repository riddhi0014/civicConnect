const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { supabaseAdmin } = require('../config/supabase');

const router = express.Router();

// Enforce admin role on all routes
router.use(requireAuth, requireRole('admin'));

/**
 * GET /api/admin/analytics
 * Fetches all pre-computed SQL views created in Step 1
 */
router.get('/analytics', async (req, res) => {
  try {
    // 1. Overall KPIs
    const { data: kpiData, error: kpiErr } = await supabaseAdmin
      .from('view_overall_kpis')
      .select('*')
      .single();

    // 2. Complaints by Category
    const { data: byCategory, error: catErr } = await supabaseAdmin
      .from('view_complaints_by_category')
      .select('*');

    // 3. Complaints by Status
    const { data: byStatus, error: statusErr } = await supabaseAdmin
      .from('view_complaints_by_status')
      .select('*');

    // 4. Complaints per Week
    const { data: perWeek, error: weekErr } = await supabaseAdmin
      .from('view_complaints_per_week')
      .select('*');

    // 5. Complaints by Ward
    const { data: byWard, error: wardErr } = await supabaseAdmin
      .from('view_complaints_by_ward')
      .select('*');

    // 6. Officer Performance
    const { data: officerPerf, error: perfErr } = await supabaseAdmin
      .from('view_officer_performance')
      .select('*');

    if (kpiErr || catErr || statusErr || weekErr || wardErr || perfErr) {
      console.warn('Analytics views query notice:', { kpiErr, catErr, statusErr, weekErr, wardErr, perfErr });
    }

    res.json({
      kpis: kpiData || {
        total_complaints: 0,
        open_complaints: 0,
        avg_resolution_hours: 0,
        pct_within_sla: 100,
        avg_rating: 5.0
      },
      byCategory: byCategory || [],
      byStatus: byStatus || [],
      perWeek: perWeek || [],
      byWard: byWard || [],
      officerPerformance: officerPerf || []
    });
  } catch (err) {
    console.error('Admin analytics error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch analytics' });
  }
});

/**
 * GET /api/admin/officers
 * Fetch all registered officers with department & workload
 */
router.get('/officers', async (req, res) => {
  try {
    const { data: officers, error } = await supabaseAdmin
      .from('profiles')
      .select(`
        id,
        full_name,
        phone,
        ward,
        department_id,
        departments ( id, name )
      `)
      .eq('role', 'officer')
      .order('full_name');

    if (error) throw error;

    // Attach active ticket count to each officer
    const enriched = await Promise.all(
      (officers || []).map(async (off) => {
        const { count } = await supabaseAdmin
          .from('complaints')
          .select('id', { count: 'exact', head: true })
          .eq('assigned_officer_id', off.id)
          .in('status', ['assigned', 'in_progress', 'reopened']);

        return {
          ...off,
          department_name: off.departments?.name || 'General',
          activeCount: count || 0
        };
      })
    );

    res.json({ officers: enriched });
  } catch (err) {
    console.error('Fetch officers error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/admin/officers
 * Create a new officer account
 */
router.post('/officers', async (req, res) => {
  try {
    const { email, password, fullName, department_id, ward, phone } = req.body;

    if (!email || !password || !fullName || !department_id) {
      return res.status(400).json({ error: 'Missing required fields: email, password, fullName, and department_id' });
    }

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: 'officer',
        department_id,
        ward: ward || null,
        phone: phone || null
      }
    });

    if (createError) throw createError;

    // Upsert into profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: newUser.user.id,
        full_name: fullName,
        role: 'officer',
        department_id,
        ward: ward || null,
        phone: phone || null
      })
      .select(`*, departments(id, name)`)
      .single();

    if (profileError) throw profileError;

    res.status(201).json({
      message: 'Officer created successfully',
      officer: profile
    });
  } catch (err) {
    console.error('Create officer error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/complaints/escalations
 * Fetch complaints that are reopened or overdue
 */
router.get('/complaints/escalations', async (req, res) => {
  try {
    const now = new Date().toISOString();

    const { data: escalations, error } = await supabaseAdmin
      .from('complaints')
      .select(`
        *,
        category:categories(id, name, icon),
        citizen:profiles!complaints_citizen_id_fkey(id, full_name, phone, ward),
        assigned_officer:profiles!complaints_assigned_officer_id_fkey(id, full_name, phone, ward)
      `)
      .or(`status.eq.reopened,and(due_at.lt.${now},status.in.(submitted,assigned,in_progress))`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ escalations: escalations || [] });
  } catch (err) {
    console.error('Fetch escalations error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/admin/complaints/:id/reassign
 * Reassign an escalated, overdue, or reopened complaint to a different officer
 */
router.post('/complaints/:id/reassign', async (req, res) => {
  try {
    const { id } = req.params;
    const { officer_id, note } = req.body;
    const adminId = req.user.id;

    if (!officer_id) {
      return res.status(400).json({ error: 'officer_id is required for reassignment' });
    }

    // Fetch complaint
    const { data: complaint, error: fetchError } = await supabaseAdmin
      .from('complaints')
      .select('id, status, assigned_officer_id')
      .eq('id', id)
      .single();

    if (fetchError || !complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    // Fetch new officer
    const { data: officer, error: offError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', officer_id)
      .single();

    if (offError || !officer) {
      return res.status(404).json({ error: 'Target officer not found' });
    }

    const previousStatus = complaint.status;
    const newStatus = ['submitted', 'reopened'].includes(previousStatus) ? 'assigned' : previousStatus;

    // Update complaint
    const { data: updatedComplaint, error: updateError } = await supabaseAdmin
      .from('complaints')
      .update({
        assigned_officer_id: officer.id,
        status: newStatus
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Log event in complaint_events audit trail
    await supabaseAdmin
      .from('complaint_events')
      .insert({
        complaint_id: id,
        actor_id: adminId,
        from_status: previousStatus,
        to_status: newStatus,
        note: `Reassigned by Administrator to Officer ${officer.full_name}: "${note || 'Administrative reallocation'}"`
      });

    res.json({
      message: `Complaint reassigned to ${officer.full_name}`,
      complaint: updatedComplaint
    });
  } catch (err) {
    console.error('Reassign complaint error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/categories
 * List categories and subcategories
 */
router.get('/categories', async (req, res) => {
  try {
    const { data: categories, error } = await supabaseAdmin
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

    if (error) throw error;
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/admin/categories/subcategories
 * Add subcategory to category
 */
router.post('/categories/subcategories', async (req, res) => {
  try {
    const { category_id, name } = req.body;
    if (!category_id || !name) {
      return res.status(400).json({ error: 'category_id and name required' });
    }

    const { data, error } = await supabaseAdmin
      .from('subcategories')
      .insert({ category_id, name: name.trim() })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ subcategory: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
