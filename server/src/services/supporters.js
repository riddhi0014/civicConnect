const { supabaseAdmin } = require('../config/supabase');

/**
 * "Me too" supporter helpers.
 * If migration 005 has not been run yet, the table is missing: counts fall back
 * to 0 so the rest of the portal keeps working.
 */
const PRIORITY_BOOST_THRESHOLD = 5;

function isMissingTable(error) {
  return error && (error.code === '42P01' || error.code === 'PGRST205');
}

/**
 * Returns { counts: { [complaintId]: number }, mine: Set<complaintId> }
 */
async function getSupportInfo(complaintIds, citizenId = null) {
  const counts = {};
  const mine = new Set();
  if (!complaintIds || complaintIds.length === 0) return { counts, mine };

  const { data, error } = await supabaseAdmin
    .from('complaint_supporters')
    .select('complaint_id, citizen_id')
    .in('complaint_id', complaintIds);

  if (error) {
    if (!isMissingTable(error)) console.error('Supporter lookup error:', error);
    return { counts, mine };
  }

  for (const row of data || []) {
    counts[row.complaint_id] = (counts[row.complaint_id] || 0) + 1;
    if (citizenId && row.citizen_id === citizenId) mine.add(row.complaint_id);
  }
  return { counts, mine };
}

/**
 * Adds supporter_count (and supported_by_me when citizenId is given) to each complaint.
 */
async function attachSupportCounts(complaints, citizenId = null) {
  const list = complaints || [];
  const { counts, mine } = await getSupportInfo(list.map(c => c.id), citizenId);
  return list.map(c => ({
    ...c,
    supporter_count: counts[c.id] || 0,
    ...(citizenId ? { supported_by_me: mine.has(c.id) } : {})
  }));
}

module.exports = {
  PRIORITY_BOOST_THRESHOLD,
  isMissingTable,
  getSupportInfo,
  attachSupportCounts
};
