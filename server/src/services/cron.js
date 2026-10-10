const cron = require('node-cron');
const { supabaseAdmin } = require('../config/supabase');

/**
 * 72-Hour Auto-Close Job:
 * Checks for complaints with status = 'resolved' where resolved_at is older than 72 hours.
 * Automatically marks them as status = 'closed', closed_reason = 'auto_closed',
 * and records the event in complaint_events audit trail.
 */
async function runAutoCloseJob() {
  try {
    const seventyTwoHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();

    // 1. Find complaints resolved > 72 hours ago
    const { data: expiredComplaints, error: fetchError } = await supabaseAdmin
      .from('complaints')
      .select('id, title, status, resolved_at')
      .eq('status', 'resolved')
      .lte('resolved_at', seventyTwoHoursAgo);

    if (fetchError) {
      console.error('Cron: Error fetching expired complaints:', fetchError);
      return { count: 0, error: fetchError.message };
    }

    if (!expiredComplaints || expiredComplaints.length === 0) {
      return { count: 0, message: 'No complaints pending auto-close' };
    }

    console.log(`⏰ Cron: Auto-closing ${expiredComplaints.length} complaints older than 72 hours...`);

    const closedIds = [];
    const now = new Date().toISOString();

    for (const comp of expiredComplaints) {
      // Update complaint to closed
      const { error: updateError } = await supabaseAdmin
        .from('complaints')
        .update({
          status: 'closed',
          closed_at: now,
          closed_reason: 'auto_closed'
        })
        .eq('id', comp.id);

      if (!updateError) {
        // Record audit trail event
        await supabaseAdmin
          .from('complaint_events')
          .insert({
            complaint_id: comp.id,
            actor_id: null, // System event
            from_status: 'resolved',
            to_status: 'closed',
            note: 'Auto-closed after 72 hours without citizen dispute'
          });

        closedIds.push(comp.id);
      }
    }

    console.log(`✅ Cron: Successfully auto-closed ${closedIds.length} complaints.`);
    return { count: closedIds.length, closedIds };
  } catch (err) {
    console.error('Cron job unhandled error:', err);
    return { count: 0, error: err.message };
  }
}

/**
 * Starts the hourly cron worker
 */
function startCronJobs() {
  // Runs every hour on the hour: '0 * * * *'
  cron.schedule('0 * * * *', () => {
    console.log('⏰ Running hourly 72h auto-close cron worker...');
    runAutoCloseJob();
  });

  console.log('⏱️  Background cron scheduler registered (hourly auto-close worker active)');
}

module.exports = {
  startCronJobs,
  runAutoCloseJob
};
