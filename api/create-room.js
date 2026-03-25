export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { bookingId, teacherName, studentName, sessionType, slot } = req.body;

  if (!bookingId) {
    return res.status(400).json({ error: 'Booking ID required' });
  }

  try {
    // Create a unique room name for this booking
    const roomName = `arabiq-${bookingId}-${Date.now()}`;

    const response = await fetch('https://api.whereby.dev/v1/meetings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHEREBY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
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
    });
  } catch (error) {
    console.error('Whereby error:', error);
    return res.status(500).json({ error: error.message });
  }
}
