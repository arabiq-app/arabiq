const FROM = process.env.RESEND_FROM_EMAIL || 'hello@arabiq.app';
const APP_URL = process.env.VITE_APP_URL || 'https://arabiq.app';
const RESEND_API_KEY = process.env.RESEND_API_KEY;

const baseStyle = `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;`;
const headerHtml = `
  <div style="background: #1A3470; padding: 36px 40px 28px; border-radius: 12px 12px 0 0; text-align: center;">
    <span style="color: #ffffff; font-size: 34px; font-weight: 800; letter-spacing: -1px; font-family: Georgia, serif;">Arabiq</span>
    <div style="margin-top: 16px; height: 2px; background: linear-gradient(90deg, transparent, #C9961A, transparent); border-radius: 2px;"></div>
  </div>
`;
const footerHtml = `<div style="background: #0D1F4A; padding: 24px 40px; border-radius: 0 0 12px 12px; text-align: center;"><p style="color: rgba(255,255,255,0.4); font-size: 12px; margin: 0;">© 2026 Arabiq. All rights reserved.<br><a href="${APP_URL}" style="color: #C9961A; text-decoration: none;">arabiq.app</a> · <a href="mailto:support@arabiq.app" style="color: #C9961A; text-decoration: none;">support@arabiq.app</a></p></div>`;
const goldBtn = (url, text) => `<a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#C9961A,#F0C842);color:#1A3470;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:800;font-size:15px;">${text}</a>`;
const navyBtn = (url, text) => `<a href="${url}" style="display:inline-block;background:#ffffff;color:#1A3470;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px;border:2px solid #1A3470;">${text}</a>`;

const welcomeEmail = (name) => ({
  subject: `Welcome to Arabiq, ${name.split(' ')[0]}!`,
  html: `<div style="${baseStyle}">${headerHtml}<div style="padding:40px;background:#FDFAF4;"><h1 style="color:#1A3470;font-size:28px;font-weight:800;margin:0 0 16px;">Welcome to Arabiq, ${name.split(' ')[0]}!</h1><p style="color:#6B7280;font-size:16px;line-height:1.7;margin:0 0 20px;">Your account is all set up. Browse our expert native Arabic teachers and book your first trial session from just £3.</p><div style="background:#EEF2FB;border-radius:12px;padding:20px 24px;margin:24px 0;"><p style="color:#374151;margin:6px 0;font-size:14px;">✓ Browse verified native Arabic teachers</p><p style="color:#374151;margin:6px 0;font-size:14px;">✓ Book a trial session from just £3</p><p style="color:#374151;margin:6px 0;font-size:14px;">✓ Join your first 1-on-1 Arabic lesson</p></div><div style="text-align:center;margin:32px 0;">${goldBtn(APP_URL, 'Find My Teacher →')}</div><p style="color:#9CA3AF;font-size:13px;text-align:center;">Questions? Contact us at support@arabiq.app</p></div>${footerHtml}</div>`,
});

const bookingConfirmationEmail = (booking) => ({
  subject: `Booking Confirmed - ${booking.sessionType} with ${booking.teacherName}`,
  html: `<div style="${baseStyle}">${headerHtml}<div style="padding:40px;background:#FDFAF4;"><div style="text-align:center;margin-bottom:28px;"><div style="font-size:52px;margin-bottom:12px;">🎉</div><h1 style="color:#1A3470;font-size:26px;font-weight:800;margin:0 0 8px;">You are all booked!</h1><p style="color:#6B7280;font-size:15px;margin:0;">Your session with ${booking.teacherName} is confirmed.</p></div><div style="background:#ffffff;border-radius:14px;padding:24px;margin-bottom:24px;border:2px solid #1A3470;"><div style="font-size:11px;font-weight:700;color:#C9961A;letter-spacing:2px;margin-bottom:10px;text-transform:uppercase;">SESSION DETAILS</div><div style="font-size:22px;font-weight:800;margin-bottom:6px;color:#1A3470;">${booking.slot}</div><div style="font-size:14px;color:#1A3470;font-weight:600;font-size:15px;">with ${booking.teacherName} &middot; ${booking.sessionType}</div></div><div style="background:#fff;border-radius:12px;border:1px solid #E8EDF8;overflow:hidden;margin-bottom:24px;"><div style="display:flex;justify-content:space-between;padding:12px 20px;border-bottom:1px solid #F3F4F6;"><span style="color:#6B7280;font-size:13px;">Booking Reference</span><span style="color:#1A3470;font-size:13px;font-weight:600;">${booking.id}</span></div><div style="display:flex;justify-content:space-between;padding:12px 20px;border-bottom:1px solid #F3F4F6;"><span style="color:#6B7280;font-size:13px;">Teacher</span><span style="color:#1A3470;font-size:13px;font-weight:600;">${booking.teacherName}</span></div><div style="display:flex;justify-content:space-between;padding:12px 20px;border-bottom:1px solid #F3F4F6;"><span style="color:#6B7280;font-size:13px;">Session</span><span style="color:#1A3470;font-size:13px;font-weight:600;">${booking.sessionType} · ${booking.sessionType === 'Trial' ? '30 mins' : '60 mins'}</span></div><div style="display:flex;justify-content:space-between;padding:12px 20px;"><span style="color:#6B7280;font-size:13px;">Amount Paid</span><span style="color:#1A3470;font-size:13px;font-weight:600;">£${Number(booking.price).toFixed(2)}</span></div></div>${booking.whereby_room_url ? `
<div style="background:linear-gradient(135deg,#C9961A,#F0C842);border-radius:14px;padding:28px;margin-bottom:24px;text-align:center;">
  <div style="font-size:11px;font-weight:700;color:#1A3470;letter-spacing:2px;margin-bottom:10px;text-transform:uppercase;">Your Private Video Classroom</div>
  <p style="color:#1A3470;font-size:15px;margin:0 0 20px;font-weight:600;line-height:1.5;">Click the button below at the time of your session to join your private Arabic lesson with ${booking.teacherName}.</p>
  <a href="${booking.whereby_room_url}" style="display:inline-block;background:#1A3470;color:#ffffff;text-decoration:none;padding:16px 36px;border-radius:12px;font-weight:800;font-size:16px;letter-spacing:0.3px;">Join My Arabic Lesson →</a>
  <p style="color:#1A3470;font-size:12px;margin:16px 0 0;opacity:0.75;">&#128274; Save this email — this link is unique to your booking</p>
</div>
` : `
<div style="background:#EEF2FB;border-radius:14px;padding:24px;margin-bottom:24px;text-align:center;border:2px solid #1A3470;">
  <div style="font-size:11px;font-weight:700;color:#C9961A;letter-spacing:2px;margin-bottom:10px;text-transform:uppercase;">Your Video Classroom</div>
  <p style="color:#1A3470;font-size:14px;margin:0 0 16px;font-weight:600;">Your unique classroom link will be available in your dashboard. Log in and go to My Bookings to access it.</p>
  <a href="${APP_URL}?bookings=1" style="display:inline-block;background:#1A3470;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:800;font-size:15px;">View My Bookings →</a>
</div>
`}<div style="background:#EEF2FB;border-radius:12px;padding:18px 22px;margin-bottom:24px;"><h3 style="color:#1A3470;font-size:14px;font-weight:700;margin:0 0 10px;">Before your session:</h3><p style="color:#374151;font-size:13px;margin:5px 0;">✓ Test your camera and microphone</p><p style="color:#374151;font-size:13px;margin:5px 0;">✓ Find a quiet space with good internet</p><p style="color:#374151;font-size:13px;margin:5px 0;">✓ Have a notebook ready for vocabulary</p><p style="color:#374151;font-size:13px;margin:5px 0;">✓ Join a few minutes early</p></div><div style="text-align:center;margin:28px 0;">${navyBtn(APP_URL + '?bookings=1', 'View My Bookings →')}</div><p style="color:#9CA3AF;font-size:13px;text-align:center;">Need to cancel? Email support@arabiq.app at least 24 hours before for a full refund.</p></div>${footerHtml}</div>`,
});

const cancellationEmail = (booking) => ({
  subject: `Booking Cancelled - ${booking.id}`,
  html: `<div style="${baseStyle}">${headerHtml}<div style="padding:40px;background:#FDFAF4;"><h1 style="color:#1A3470;font-size:24px;font-weight:800;margin:0 0 8px;">Booking Cancelled</h1><p style="color:#6B7280;font-size:15px;margin:0 0 24px;">Your booking ${booking.id} with ${booking.teacherName} has been cancelled.</p><p style="color:#374151;font-size:14px;margin:0 0 24px;">A full refund of <strong>£${Number(booking.price).toFixed(2)}</strong> will appear on your card within 3-5 business days.</p><div style="text-align:center;margin:28px 0;">${goldBtn(APP_URL, 'Book Another Session →')}</div><p style="color:#9CA3AF;font-size:13px;text-align:center;">Questions? Contact support@arabiq.app</p></div>${footerHtml}</div>`,
});

const teacherNotificationEmail = (booking) => ({
  subject: `New Booking - ${booking.sessionType} session on ${booking.slot}`,
  html: `<div style="${baseStyle}">${headerHtml}<div style="padding:40px;background:#FDFAF4;">
    <h1 style="color:#1A3470;font-size:24px;font-weight:800;margin:0 0 8px;">New session booked! 📅</h1>
    <p style="color:#6B7280;font-size:15px;margin:0 0 24px;">A student has booked a ${booking.sessionType.toLowerCase()} session with you.</p>
    <div style="background:linear-gradient(135deg,#1A3470,#2A4A9A);border-radius:14px;padding:24px;margin-bottom:24px;color:#fff;">
      <div style="font-size:11px;font-weight:700;color:#F0C842;letter-spacing:2px;margin-bottom:8px;text-transform:uppercase;">Session Details</div>
      <div style="font-size:22px;font-weight:800;margin-bottom:4px;color:#fff;">${booking.slot}</div>
      <div style="font-size:14px;color:rgba(255,255,255,0.8);">${booking.sessionType} · ${booking.sessionType === 'Trial' ? '30 mins' : '60 mins'}</div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid #E8EDF8;overflow:hidden;margin-bottom:24px;">
      <div style="display:flex;justify-content:space-between;padding:12px 20px;border-bottom:1px solid #F3F4F6;"><span style="color:#6B7280;font-size:13px;">Student Name</span><span style="color:#1A3470;font-size:13px;font-weight:600;">${booking.studentName}</span></div>
      <div style="display:flex;justify-content:space-between;padding:12px 20px;border-bottom:1px solid #F3F4F6;"><span style="color:#6B7280;font-size:13px;">Session Type</span><span style="color:#1A3470;font-size:13px;font-weight:600;">${booking.sessionType}</span></div>
      <div style="display:flex;justify-content:space-between;padding:12px 20px;border-bottom:1px solid #F3F4F6;"><span style="color:#6B7280;font-size:13px;">Topic / Goal</span><span style="color:#1A3470;font-size:13px;font-weight:600;">${booking.topic || 'General Arabic'}</span></div>
      <div style="display:flex;justify-content:space-between;padding:12px 20px;"><span style="color:#6B7280;font-size:13px;">Booking Reference</span><span style="color:#1A3470;font-size:13px;font-weight:600;">${booking.id}</span></div>
    </div>
    ${booking.hostRoomUrl ? `
    <div style="background:linear-gradient(135deg,#C9961A,#F0C842);border-radius:14px;padding:28px;margin-bottom:24px;text-align:center;">
      <div style="font-size:11px;font-weight:700;color:#1A3470;letter-spacing:2px;margin-bottom:10px;text-transform:uppercase;">Your Host Classroom Link</div>
      <p style="color:#1A3470;font-size:15px;margin:0 0 20px;font-weight:600;line-height:1.5;">Click below at the time of the session to start the lesson. Your host link gives you full control of the classroom.</p>
      <a href="${booking.hostRoomUrl}" style="display:inline-block;background:#1A3470;color:#ffffff;text-decoration:none;padding:16px 36px;border-radius:12px;font-weight:800;font-size:16px;">Start Lesson →</a>
      <p style="color:#1A3470;font-size:12px;margin:16px 0 0;opacity:0.75;">&#128274; This is your host link — do not share it with the student</p>
    </div>
    ` : ''}
    <div style="background:#EEF2FB;border-radius:12px;padding:18px 22px;margin-bottom:24px;">
      <h3 style="color:#1A3470;font-size:14px;font-weight:700;margin:0 0 10px;">Before the session:</h3>
      <p style="color:#374151;font-size:13px;margin:5px 0;">✓ Test your camera and microphone</p>
      <p style="color:#374151;font-size:13px;margin:5px 0;">✓ Prepare your lesson materials</p>
      <p style="color:#374151;font-size:13px;margin:5px 0;">✓ Join a few minutes early to welcome the student</p>
    </div>
    <p style="color:#9CA3AF;font-size:13px;text-align:center;">If the student cancels, you will be notified immediately. Questions? Contact hello@arabiq.app</p>
  </div>${footerHtml}</div>`,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, to, data } = req.body;

  if (!type || !to) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not set');
    return res.status(500).json({ error: 'Email service not configured' });
  }

  let emailContent;
  try {
    switch (type) {
      case 'welcome':
        emailContent = welcomeEmail(data.name);
        break;
      case 'booking_confirmation':
        emailContent = bookingConfirmationEmail(data);
        break;
      case 'cancellation':
        emailContent = cancellationEmail(data);
        break;
      case 'teacher_notification':
        emailContent = teacherNotificationEmail(data);
        break;
      default:
        return res.status(400).json({ error: `Unknown type: ${type}` });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Arabiq <${FROM}>`,
        to: Array.isArray(to) ? to : [to],
        subject: emailContent.subject,
        html: emailContent.html,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Resend error:', JSON.stringify(result));
      return res.status(500).json({ error: result });
    }

    return res.status(200).json({ success: true, id: result.id });

  } catch (error) {
    console.error('Handler error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
