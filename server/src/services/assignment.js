const { supabaseAdmin } = require('../config/supabase');

/**
 * Calculates due_at based on priority SLA:
 * - High: 1 day (24 hours)
 * - Medium: 3 days (72 hours)
 * - Low: 7 days (168 hours)
 */
function calculateDueAt(priority = 'medium') {
  const now = Date.now();
  let hours = 72; // default 3 days

  if (priority === 'high') {
    hours = 24; // 1 day
  } else if (priority === 'low') {
    hours = 168; // 7 days
  }

  return new Date(now + hours * 60 * 60 * 1000).toISOString();
}

/**
 * Auto-assigns complaint to the officer in the matching department and ward
 * with the fewest open complaints.
 * Updates complaint status to 'assigned' and logs an audit trail event.
 */
async function autoAssignComplaint(complaintId, departmentId, ward) {
  try {
    if (!departmentId) {
      console.log(`Complaint #${complaintId}: No department specified for auto-assignment.`);
      return { assigned: false, reason: 'No department assigned' };
    }

    // 1. Fetch officers in this department
    const { data: officers, error: officerError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, ward, department_id')
      .eq('role', 'officer')
      .eq('department_id', departmentId);

    if (officerError || !officers || officers.length === 0) {
      console.log(`Complaint #${complaintId}: No officers found in department ${departmentId}`);
      return { assigned: false, reason: 'No officer in department' };
    }

    // 2. Filter candidates: prefer officers in matching ward, else all department officers
    let candidates = officers;
    if (ward) {
      const wardMatches = officers.filter(o => o.ward && o.ward.toLowerCase() === ward.toLowerCase());
      if (wardMatches.length > 0) {
        candidates = wardMatches;
      }
    }

    // 3. For candidate officers, calculate open workload (status in assigned, in_progress, reopened)
    const officerWorkloads = await Promise.all(
      candidates.map(async (officer) => {
        const { count, error } = await supabaseAdmin
          .from('complaints')
          .select('id', { count: 'exact', head: true })
          .eq('assigned_officer_id', officer.id)
          .in('status', ['assigned', 'in_progress', 'reopened']);

        return {
          officer,
          openCount: error ? 0 : (count || 0)
        };
      })
    );

    // 4. Sort by fewest open complaints
    officerWorkloads.sort((a, b) => a.openCount - b.openCount);
    const chosen = officerWorkloads[0].officer;
    const currentLoad = officerWorkloads[0].openCount;

    // 5. Update complaint with assigned officer and status = 'assigned'
    const { error: updateError } = await supabaseAdmin
      .from('complaints')
      .update({
        assigned_officer_id: chosen.id,
        status: 'assigned'
      })
      .eq('id', complaintId);

    if (updateError) {
      console.error('Error updating complaint assignment:', updateError);
      return { assigned: false, error: updateError.message };
    }

    // 6. Write to complaint_events audit trail
    await supabaseAdmin
      .from('complaint_events')
      .insert({
        complaint_id: complaintId,
        actor_id: null, // System event
        from_status: 'submitted',
        to_status: 'assigned',
        note: `Auto-assigned to Officer ${chosen.full_name} (${chosen.ward || 'Department Area'}) with lowest queue load (${currentLoad} active tickets)`
      });

    console.log(`✅ Complaint #${complaintId} auto-assigned to ${chosen.full_name}`);
    return { assigned: true, officer: chosen };
  } catch (err) {
    console.error('Auto-assignment engine error:', err);
    return { assigned: false, error: err.message };
  }
}

module.exports = {
  calculateDueAt,
  autoAssignComplaint
};
