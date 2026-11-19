const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { attachSupportCounts } = require('../services/supporters');

const router = express.Router();

/**
 * Public transparency endpoints (no login).
 * Never return citizen identity, phone numbers or descriptions here.
 */

/**
 * GET /api/public/map
 * GPS-tagged complaints for the public ward map, plus city-wide status totals.
 */
router.get('/map', async (req, res) => {
  try {
    const { data: complaints, error } = await supabaseAdmin
      .from('complaints')
      .select(`
        id, title, status, priority, ward, lat, lng, created_at, resolved_at,
        category:categories(id, name, icon)
      `)
      .eq('ai_is_spam', false)
      .not('lat', 'is', null)
      .not('lng', 'is', null)
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const { data: allStatuses, error: statusError } = await supabaseAdmin
      .from('complaints')
      .select('status')
      .eq('ai_is_spam', false);

    if (statusError) {
      return res.status(500).json({ error: statusError.message });
    }

    const statuses = allStatuses || [];
    const stats = {
      total: statuses.length,
      open: statuses.filter(c => ['submitted', 'assigned', 'reopened'].includes(c.status)).length,
      inProgress: statuses.filter(c => c.status === 'in_progress').length,
      resolved: statuses.filter(c => ['resolved', 'closed'].includes(c.status)).length
    };

    res.json({ complaints: await attachSupportCounts(complaints), stats });
  } catch (err) {
    console.error('Public map error:', err);
    res.status(500).json({ error: 'Failed to load ward map' });
  }
});

/**
 * GET /api/public/gallery
 * Recently fixed complaints with the citizen's before-photo and the officer's after-photo proof.
 */
router.get('/gallery', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('complaints')
      .select(`
        id, title, ward, photo_url, created_at, resolved_at, status,
        category:categories(id, name, icon),
        resolution:resolutions!inner(note, after_photo_url, created_at)
      `)
      .in('status', ['resolved', 'closed'])
      .eq('ai_is_spam', false)
      .not('resolution.after_photo_url', 'is', null)
      .order('resolved_at', { ascending: false, nullsFirst: false })
      .limit(12);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const items = (data || []).map(c => {
      const resolution = Array.isArray(c.resolution) ? c.resolution[0] : c.resolution;
      const fixedAt = c.resolved_at || resolution?.created_at;
      const daysToFix = fixedAt
        ? Math.max(0, Math.round((new Date(fixedAt) - new Date(c.created_at)) / (24 * 60 * 60 * 1000)))
        : null;
      return {
        id: c.id,
        title: c.title,
        ward: c.ward,
        status: c.status,
        category: c.category,
        before_photo_url: c.photo_url,
        after_photo_url: resolution?.after_photo_url || null,
        resolution_note: resolution?.note || null,
        resolved_at: fixedAt,
        days_to_fix: daysToFix
      };
    });

    res.json({ items });
  } catch (err) {
    console.error('Public gallery error:', err);
    res.status(500).json({ error: 'Failed to load resolved gallery' });
  }
});

module.exports = router;
