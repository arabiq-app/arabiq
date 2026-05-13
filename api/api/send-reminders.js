import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end('Unauthorized');
  }

  // Get tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('status', 'confirmed')
    .eq('session_date', tomorrowStr);

  if (error || !bookings || bookings.length === 0) {
    return res.json({ sent: 0 });
  }

  let sent = 0;
  for (const b of bookings) {
    // Remind student
    await fetch(`${process.env.VITE_APP_URL}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'reminder',
        to: b.student_email,
        data: {
          studentName: b.student_name,
          teacherName: b.teacher_name,
          slot: b.slot,
          sessionType: b.session_type,
          roomUrl: b.whereby_room_url,
        }
      })
    }).catch(() => {});

    // Remind teacher
    if (b.teacher_email) {
      await fetch(`${process.env.VITE_APP_URL}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'teacher_reminder',
          to: b.teacher_email,
          data: {
            teacherName: b.teacher_name,
            studentName: b.student_name,
            slot: b.slot,
            sessionType: b.session_type,
            hostRoomUrl: b.whereby_host_url,
          }
        })
      }).catch(() => {});
    }
    sent++;
  }

  return res.json({ sent });
}
