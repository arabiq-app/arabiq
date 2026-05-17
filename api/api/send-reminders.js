import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const sendEmail = async (type, to, data) => {
  await fetch(`${process.env.VITE_APP_URL}/api/send-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, to, data }),
  }).catch(() => {});
};

const getSessionDateTime = (sessionDate, slot) => {
  const parts = slot.split(' ');
  const timePart = parts.slice(1).join(' ');
  const match = timePart.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return null;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  const dt = new Date(sessionDate);
  dt.setHours(hours, minutes, 0, 0);
  return dt;
};

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end('Unauthorized');
  }

  const now = new Date();

  // Fetch all confirmed bookings
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('status', 'confirmed');

  if (error || !bookings || bookings.length === 0) {
    return res.json({ reminders24: 0, reminders1hr: 0, followups: 0 });
  }

  const results = { reminders24: 0, reminders1hr: 0, followups: 0 };

  for (const b of bookings) {
    const sessionDt = getSessionDateTime(b.session_date, b.slot);
    if (!sessionDt) continue;

    const diffMs = sessionDt - now;
    const diffHours = diffMs / (1000 * 60 * 60);
    const sessionDuration = b.session_type === 'Trial' ? 0.5 : 1;
    const sessionEndDt = new Date(sessionDt.getTime() + sessionDuration * 60 * 60 * 1000);
    const minutesSinceEnd = (now - sessionEndDt) / (1000 * 60);

    // 24-hour reminder (between 23 and 25 hours before)
    if (diffHours >= 23 && diffHours <= 25) {
      await sendEmail('reminder', b.student_email, {
        studentName: b.student_name,
        teacherName: b.teacher_name,
        slot: b.slot,
        sessionType: b.session_type,
        roomUrl: b.whereby_room_url,
      });
      if (b.teacher_email) {
        await sendEmail('teacher_reminder', b.teacher_email, {
          teacherName: b.teacher_name,
          studentName: b.student_name,
          slot: b.slot,
          sessionType: b.session_type,
          hostRoomUrl: b.whereby_host_url,
        });
      }
      results.reminders24++;
    }

    // 1-hour reminder (between 50 and 70 minutes before)
    if (diffHours >= 0.83 && diffHours <= 1.17) {
      await sendEmail('reminder_1hr', b.student_email, {
        studentName: b.student_name,
        teacherName: b.teacher_name,
        slot: b.slot,
        sessionType: b.session_type,
        roomUrl: b.whereby_room_url,
      });
      if (b.teacher_email) {
        await sendEmail('teacher_reminder_1hr', b.teacher_email, {
          teacherName: b.teacher_name,
          studentName: b.student_name,
          slot: b.slot,
          sessionType: b.session_type,
          hostRoomUrl: b.whereby_host_url,
        });
      }
      results.reminders1hr++;
    }

    // Post-session follow-up (between 25 and 35 minutes after session ends)
    if (minutesSinceEnd >= 25 && minutesSinceEnd <= 35) {
      await sendEmail('session_followup', b.student_email, {
        studentName: b.student_name,
        teacherName: b.teacher_name,
        slot: b.slot,
        sessionType: b.session_type,
      });
      // Mark booking as completed
      await supabase.from('bookings')
        .update({ status: 'completed' })
        .eq('id', b.id);
      results.followups++;
    }
  }

  return res.json({ success: true, ...results });
}
