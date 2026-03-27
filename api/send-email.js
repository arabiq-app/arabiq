import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || 'hello@arabiq.app';
const APP_URL = process.env.VITE_APP_URL || 'https://arabiq.app';

// ── Email Templates ───────────────────────────────────────────

const baseStyle = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  max-width: 600px;
  margin: 0 auto;
  background: #ffffff;
`;

const headerHtml = `
  <div style="background: linear-gradient(135deg, #1A3470, #0D2055); padding: 32px 40px; border-radius: 12px 12px 0 0;">
    <div style="color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">
      Arabi<span style="color: #C9961A;">q</span>
    </div>
  </div>
`;

const footerHtml = `
  <div style="background: #0D1F4A; padding: 24px 40px; border-radius: 0 0 12px 12px; text-align: center;">
    <p style="color: rgba(255,255,255,0.4); font-size: 12px; margin: 0;">
      © 2026 Arabiq. All rights reserved.<br>
      <a href="${APP_URL}" style="color: #C9961A; text-decoration: none;">arabiq.app</a> · 
      <a href="mailto:support@arabiq.app" style="color: #C9961A; text-decoration: none;">support@arabiq.app</a>
    </p>
  </div>
`;

const buttonHtml = (url, text) => `
  <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #1A3470, #2A4A9A); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 15px; margin: 8px 0;">
    ${text}
  </a>
`;

const goldButtonHtml = (url, text) => `
  <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #C9961A, #F0C842); color: #1A3470; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 800; font-size: 15px; margin: 8px 0;">
    ${text}
  </a>
`;

// Welcome email
const welcomeEmail = (name) => ({
  subject: `Welcome to Arabiq, ${name.split(' ')[0]}! 🎉`,
  html: `
    <div style="${baseStyle}">
      ${headerHtml}
      <div style="padding: 40px; background: #FDFAF4;">
        <h1 style="color: #1A3470; font-size: 28px; font-weight: 800; margin: 0 0 16px;">
          Welcome to Arabiq, ${name.split(' ')[0]}!
        </h1>
        <p style="color: #6B7280; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
          Your account is all set up and ready to go. You are now part of a community of 2,400+ students learning Arabic with expert native teachers.
        </p>
        <div style="background: #EEF2FB; border-radius: 12px; padding: 20px 24px; margin: 24px 0;">
          <h3 style="color: #1A3470; margin: 0 0 12px; font-size: 16px;">What to do next:</h3>
          <p style="color: #374151; margin: 6px 0; font-size: 14px;">✅ Browse our verified native teachers</p>
          <p style="color: #374151; margin: 6px 0; font-size: 14px;">📅 Book a trial session from just $15</p>
          <p style="color: #374151; margin: 6px 0; font-size: 14px;">🎓 Join your first 1-on-1 Arabic lesson</p>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          ${goldButtonHtml(`${APP_URL}/teachers`, 'Find My Teacher →')}
        </div>
        <p style="color: #9CA3AF; font-size: 13px; text-align: center;">
          Questions? Reply to this email or contact us at support@arabiq.app
        </p>
      </div>
      ${footerHtml}
    </div>
  `,
});

// Booking confirmation email (includes video room link)
const bookingConfirmationEmail = (booking) => ({
  subject: `Booking Confirmed - ${booking.sessionType} with ${booking.teacherName}`,
  html: `
    <div style="${baseStyle}">
      ${headerHtml}
      <div style="padding: 40px; background: #FDFAF4;">
        <div style="text-align: center; margin-bottom: 28px;">
          <div style="font-size: 52px; margin-bottom: 12px;">🎉</div>
          <h1 style="color: #1A3470; font-size: 26px; font-weight: 800; margin: 0 0 8px;">
            You are all booked!
          </h1>
          <p style="color: #6B7280; font-size: 15px; margin: 0;">
            Your session with ${booking.teacherName} is confirmed.
          </p>
        </div>

        <div style="background: linear-gradient(135deg, #1A3470, #2A4A9A); border-radius: 14px; padding: 24px; margin-bottom: 24px; color: #fff;">
          <div style="font-size: 11px; font-weight: 700; color: #F0C842; letter-spacing: 1px; margin-bottom: 8px;">SESSION DETAILS</div>
          <div style="font-size: 20px; font-weight: 800; margin-bottom: 4px;">${booking.slot}</div>
          <div style="font-size: 14px; color: rgba(255,255,255,0.7);">with ${booking.teacherName} · ${booking.sessionType} session</div>
        </div>

        <div style="background: #ffffff; border-radius: 12px; border: 1px solid #E8EDF8; overflow: hidden; margin-bottom: 24px;">
          ${[
            ['Booking Reference', booking.id],
            ['Session Type', booking.sessionType],
            ['Teacher', booking.teacherName],
            ['Topic', booking.topic || 'General Arabic'],
            ['Duration', booking.sessionType === 'Trial' ? '30 minutes' : '60 minutes'],
            ['Amount Paid', `£${booking.price.toFixed(2)}`],
          ].map(([label, value]) => `
            <div style="display: flex; justify-content: space-between; padding: 12px 20px; border-bottom: 1px solid #F3F4F6;">
              <span style="color: #6B7280; font-size: 13px;">${label}</span>
              <span style="color: #1A3470; font-size: 13px; font-weight: 600;">${value}</span>
            </div>
          `).join('')}
        </div>

        ${booking.whereby_room_url ? `
        <div style="background: linear-gradient(135deg, #C9961A, #F0C842); border-radius: 14px; padding: 24px; margin-bottom: 24px; text-align: center;">
          <div style="font-size: 11px; font-weight: 700; color: #1A3470; letter-spacing: 1px; margin-bottom: 8px;">YOUR VIDEO CLASSROOM</div>
          <p style="color: #1A3470; font-size: 14px; margin: 0 0 16px; font-weight: 600;">
            Click the button below at the time of your session to join your private Arabic lesson.
          </p>
          <a href="${booking.whereby_room_url}" style="display: inline-block; background: #1A3470; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 800; font-size: 15px;">
            Join My Arabic Lesson →
          </a>
          <p style="color: #1A3470; font-size: 12px; margin: 12px 0 0; opacity: 0.7;">
            Save this email — this is your classroom link
          </p>
        </div>
        ` : `
        <div style="background: #ECFDF5; border: 1px solid #059669; border-radius: 10px; padding: 14px 18px; margin-bottom: 24px;">
          <p style="color: #059669; font-size: 13px; font-weight: 600; margin: 0;">
            Your video room link will appear in your dashboard when you log in. You can also find it in your booking confirmation.
          </p>
        </div>
        `}

        <div style="background: #EEF2FB; border-radius: 12px; padding: 18px 22px; margin-bottom: 24px;">
          <h3 style="color: #1A3470; font-size: 14px; font-weight: 700; margin: 0 0 10px;">Before your session:</h3>
          <p style="color: #374151; font-size: 13px; margin: 5px 0;">✅ Test your camera and microphone beforehand</p>
          <p style="color: #374151; font-size: 13px; margin: 5px 0;">✅ Find a quiet space with a good internet connection</p>
          <p style="color: #374151; font-size: 13px; margin: 5px 0;">✅ Have a notebook ready for vocabulary notes</p>
          <p style="color: #374151; font-size: 13px; margin: 5px 0;">✅ Join a few minutes early so you are ready to start</p>
        </div>

        <div style="text-align: center; margin: 28px 0;">
          ${buttonHtml(APP_URL, 'View My Bookings →')}
        </div>

        <p style="color: #9CA3AF; font-size: 13px; text-align: center;">
          Need to cancel? Contact support@arabiq.app at least 24 hours before your session for a full refund.
        </p>
      </div>
      ${footerHtml}
    </div>
  `,
});

// Session reminder email (30 min before)
const sessionReminderEmail = (booking) => ({
  subject: `Your Arabic lesson starts in 30 minutes — ${booking.teacherName} is ready for you`,
  html: `
    <div style="${baseStyle}">
      ${headerHtml}
      <div style="padding: 40px; background: #FDFAF4;">
        <div style="text-align: center; margin-bottom: 28px;">
          <div style="font-size: 52px; margin-bottom: 12px;">⏰</div>
          <h1 style="color: #1A3470; font-size: 24px; font-weight: 800; margin: 0 0 8px;">
            Your lesson starts in 30 minutes
          </h1>
          <p style="color: #6B7280; font-size: 15px; margin: 0;">
            ${booking.teacherName} is ready for your session
          </p>
        </div>

        <div style="background: linear-gradient(135deg, #1A3470, #2A4A9A); border-radius: 14px; padding: 24px; margin-bottom: 24px; color: #fff; text-align: center;">
          <div style="font-size: 11px; font-weight: 700; color: #F0C842; letter-spacing: 1px; margin-bottom: 8px;">SESSION TIME</div>
          <div style="font-size: 24px; font-weight: 800; margin-bottom: 4px;">${booking.slot}</div>
          <div style="font-size: 14px; color: rgba(255,255,255,0.7);">${booking.sessionType} session · ${booking.topic || 'Arabic lesson'}</div>
        </div>

        <div style="text-align: center; margin: 28px 0;">
          ${goldButtonHtml(booking.whereby_room_url || APP_URL, 'Join Your Lesson Now →')}
        </div>

        <div style="background: #EEF2FB; border-radius: 10px; padding: 16px 20px; margin-bottom: 20px;">
          <h3 style="color: #1A3470; font-size: 14px; font-weight: 700; margin: 0 0 10px;">Before you join:</h3>
          <p style="color: #374151; font-size: 13px; margin: 4px 0;">✅ Check your microphone and camera are working</p>
          <p style="color: #374151; font-size: 13px; margin: 4px 0;">✅ Find a quiet place with good internet connection</p>
          <p style="color: #374151; font-size: 13px; margin: 4px 0;">✅ Have a notebook ready for vocabulary</p>
        </div>

        <p style="color: #9CA3AF; font-size: 13px; text-align: center;">
          Having trouble joining? Contact support@arabiq.app immediately.
        </p>
      </div>
      ${footerHtml}
    </div>
  `,
});

// Payment receipt email
const paymentReceiptEmail = (booking) => ({
  subject: `Payment Receipt — Arabiq Session #${booking.id}`,
  html: `
    <div style="${baseStyle}">
      ${headerHtml}
      <div style="padding: 40px; background: #FDFAF4;">
        <h1 style="color: #1A3470; font-size: 24px; font-weight: 800; margin: 0 0 8px;">
          Payment Receipt
        </h1>
        <p style="color: #6B7280; font-size: 14px; margin: 0 0 28px;">
          Thank you for your payment. Here is your receipt.
        </p>

        <div style="background: #ffffff; border-radius: 12px; border: 1px solid #E8EDF8; overflow: hidden; margin-bottom: 24px;">
          <div style="background: #EEF2FB; padding: 14px 20px;">
            <span style="color: #1A3470; font-size: 11px; font-weight: 700; letter-spacing: 1px;">RECEIPT #${booking.id}</span>
          </div>
          ${[
            ['Date', new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })],
            ['Student', booking.studentName],
            ['Teacher', booking.teacherName],
            ['Session', `${booking.sessionType} · ${booking.slot}`],
            ['Amount', `$${booking.price.toFixed(2)}`],
            ['Payment Method', 'Card (Stripe)'],
            ['Status', '✅ Paid'],
          ].map(([label, value]) => `
            <div style="display: flex; justify-content: space-between; padding: 12px 20px; border-bottom: 1px solid #F3F4F6;">
              <span style="color: #6B7280; font-size: 13px;">${label}</span>
              <span style="color: #1A3470; font-size: 13px; font-weight: 600;">${value}</span>
            </div>
          `).join('')}
          <div style="display: flex; justify-content: space-between; padding: 16px 20px; background: #EEF2FB;">
            <span style="color: #1A3470; font-size: 15px; font-weight: 700;">Total Paid</span>
            <span style="color: #1A3470; font-size: 18px; font-weight: 800;">$${booking.price.toFixed(2)}</span>
          </div>
        </div>

        <p style="color: #9CA3AF; font-size: 12px; text-align: center;">
          This is an automatically generated receipt. Please keep it for your records.
          For refund requests contact support@arabiq.app
        </p>
      </div>
      ${footerHtml}
    </div>
  `,
});

// Teacher notification email
const teacherNotificationEmail = (booking) => ({
  subject: `New Booking — ${booking.sessionType} session on ${booking.slot}`,
  html: `
    <div style="${baseStyle}">
      ${headerHtml}
      <div style="padding: 40px; background: #FDFAF4;">
        <h1 style="color: #1A3470; font-size: 24px; font-weight: 800; margin: 0 0 8px;">
          New session booked! 📅
        </h1>
        <p style="color: #6B7280; font-size: 15px; margin: 0 0 24px;">
          A student has booked a ${booking.sessionType.toLowerCase()} session with you.
        </p>

        <div style="background: linear-gradient(135deg, #1A3470, #2A4A9A); border-radius: 14px; padding: 24px; margin-bottom: 24px; color: #fff;">
          <div style="font-size: 11px; font-weight: 700; color: #F0C842; letter-spacing: 1px; margin-bottom: 8px;">SESSION DETAILS</div>
          <div style="font-size: 20px; font-weight: 800; margin-bottom: 4px;">${booking.slot}</div>
          <div style="font-size: 14px; color: rgba(255,255,255,0.7);">${booking.sessionType} · ${booking.topic || 'General Arabic'}</div>
        </div>

        <div style="background: #ffffff; border-radius: 12px; border: 1px solid #E8EDF8; overflow: hidden; margin-bottom: 24px;">
          ${[
            ['Student Name', booking.studentName],
            ['Student Email', booking.studentEmail],
            ['Session Type', booking.sessionType],
            ['Topic / Goal', booking.topic || 'General Arabic lesson'],
            ['Booking Reference', booking.id],
          ].map(([label, value]) => `
            <div style="display: flex; justify-content: space-between; padding: 12px 20px; border-bottom: 1px solid #F3F4F6;">
              <span style="color: #6B7280; font-size: 13px;">${label}</span>
              <span style="color: #1A3470; font-size: 13px; font-weight: 600;">${value}</span>
            </div>
          `).join('')}
        </div>

        <div style="text-align: center; margin: 28px 0;">
          ${buttonHtml(APP_URL, 'View My Dashboard →')}
        </div>

        <p style="color: #9CA3AF; font-size: 13px; text-align: center;">
          Your video room link will be available in your dashboard before the session.
        </p>
      </div>
      ${footerHtml}
    </div>
  `,
});

// Cancellation email
const cancellationEmail = (booking, reason) => ({
  subject: `Booking Cancelled — ${booking.id}`,
  html: `
    <div style="${baseStyle}">
      ${headerHtml}
      <div style="padding: 40px; background: #FDFAF4;">
        <h1 style="color: #1A3470; font-size: 24px; font-weight: 800; margin: 0 0 8px;">
          Booking Cancelled
        </h1>
        <p style="color: #6B7280; font-size: 15px; margin: 0 0 24px;">
          Your booking ${booking.id} with ${booking.teacherName} has been cancelled.
        </p>
        ${reason ? `
          <div style="background: #FEF9EC; border: 1px solid #D97706; border-radius: 10px; padding: 14px 18px; margin-bottom: 24px;">
            <p style="color: #92400E; font-size: 13px; margin: 0;"><strong>Reason:</strong> ${reason}</p>
          </div>
        ` : ''}
        <p style="color: #374151; font-size: 14px; margin: 0 0 24px;">
          A full refund of <strong>$${booking.price.toFixed(2)}</strong> has been initiated and will appear on your card within 5-10 business days.
        </p>
        <div style="text-align: center; margin: 28px 0;">
          ${goldButtonHtml(`${APP_URL}/teachers`, 'Book Another Session →')}
        </div>
        <p style="color: #9CA3AF; font-size: 13px; text-align: center;">
          Questions? Contact support@arabiq.app
        </p>
      </div>
      ${footerHtml}
    </div>
  `,
});

// Password reset email
const passwordResetEmail = (resetUrl) => ({
  subject: 'Reset your Arabiq password',
  html: `
    <div style="${baseStyle}">
      ${headerHtml}
      <div style="padding: 40px; background: #FDFAF4;">
        <h1 style="color: #1A3470; font-size: 24px; font-weight: 800; margin: 0 0 8px;">
          Reset your password
        </h1>
        <p style="color: #6B7280; font-size: 15px; margin: 0 0 24px;">
          We received a request to reset your Arabiq password. Click the button below to create a new one.
        </p>
        <div style="text-align: center; margin: 28px 0;">
          ${buttonHtml(resetUrl, 'Reset Password →')}
        </div>
        <p style="color: #9CA3AF; font-size: 13px; text-align: center;">
          This link expires in 1 hour. If you did not request this, you can safely ignore this email.
        </p>
      </div>
      ${footerHtml}
    </div>
  `,
});

// ── API Handler ───────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, to, data } = req.body;

  if (!type || !to) {
    return res.status(400).json({ error: 'Missing required fields: type and to' });
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
      case 'session_reminder':
        emailContent = sessionReminderEmail(data);
        break;
      case 'payment_receipt':
        emailContent = paymentReceiptEmail(data);
        break;
      case 'teacher_notification':
        emailContent = teacherNotificationEmail(data);
        break;
      case 'cancellation':
        emailContent = cancellationEmail(data, data.reason);
        break;
      case 'password_reset':
        emailContent = passwordResetEmail(data.resetUrl);
        break;
      default:
        return res.status(400).json({ error: `Unknown email type: ${type}` });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Arabiq <${FROM}>`,
        to: Array.isArray(to) ? to : [to],
        subject: emailContent.subject,
        html: emailContent.html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Resend error: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    return res.status(200).json({ success: true, id: result.id });

  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ error: error.message });
  }
}
