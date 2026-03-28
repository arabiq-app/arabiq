export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { bookingId, teacherName, studentName, sessionType, slot } = req.body;

  if (!bookingId) {
    return res.status(400).json({ error: 'Booking ID required' });
  }

  try {
    // Parse the slot to get the session date
    // slot format is like "Mon 9:00 AM" or "Tue 2:00 PM"
    // We set the room to expire 24 hours after the session slot
    // Default: 30 days from now if we can't parse the slot
    let endDate;
    try {
      const days = { Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6, Sun:0 };
      const slotParts = slot ? slot.split(' ') : [];
      if (slotParts.length >= 2) {
        const dayName = slotParts[0];
        const now = new Date();
        const targetDay = days[dayName];
        const currentDay = now.getDay();
        let daysUntil = targetDay - currentDay;
        if (daysUntil <= 0) daysUntil += 7;
        const sessionDate = new Date(now);
        sessionDate.setDate(now.getDate() + daysUntil);
        // Set expiry to 24 hours after the session day
        sessionDate.setDate(sessionDate.getDate() + 1);
        endDate = sessionDate.toISOString();
      } else {
        // Fallback: 30 days from now
        endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      }
    } catch(e) {
      // Fallback: 30 days from now
      endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    }

    const response = await fetch('https://api.whereby.dev/v1/meetings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHEREBY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endDate,
        fields: ['hostRoomUrl'],
        roomNamePrefix: 'arabiq',
        roomMode: 'normal',
        startDate: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Whereby API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    return res.status(200).json({
      roomUrl: data.roomUrl,
      hostRoomUrl: data.hostRoomUrl,
      meetingId: data.meetingId,
      endDate,
    });

  } catch (error) {
    console.error('Whereby error:', error);
    return res.status(500).json({ error: error.message });
  }
}
