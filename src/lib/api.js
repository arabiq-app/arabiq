// ── Payment helpers ───────────────────────────────────────────

export const createPaymentIntent = async ({ amount, teacherName, sessionType, studentEmail, bookingId }) => {
  const res = await fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, teacherName, sessionType, studentEmail, bookingId }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Payment failed');
  }
  return res.json();
};

// ── Video room helpers ────────────────────────────────────────

export const createVideoRoom = async ({ bookingId, teacherName, studentName, sessionType, slot }) => {
  const res = await fetch('/api/create-room', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookingId, teacherName, studentName, sessionType, slot }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Could not create video room');
  }
  return res.json();
};

// ── Email helpers ─────────────────────────────────────────────

export const sendEmail = async (type, to, data) => {
  const res = await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, to, data }),
  });
  if (!res.ok) {
    const err = await res.json();
    console.error('Email send failed:', err);
    // Don't throw — email failures should not block the booking flow
  }
  return res.ok;
};

// ── Booking ID generator ──────────────────────────────────────

export const generateBookingId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const random = Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
  return `BK-${random}`;
};

// ── Format helpers ────────────────────────────────────────────

export const formatPrice = (amount) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
