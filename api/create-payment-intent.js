import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { amount, currency = 'gbp', teacherName, sessionType, studentEmail, bookingId, teacherStripeAccountId } = req.body;

  if (!amount || amount < 1) return res.status(400).json({ error: 'Invalid amount' });

  try {
    const intentParams = {
      amount: Math.round(amount * 100),
      currency,
      metadata: { teacherName, sessionType, studentEmail, bookingId, platform: 'arabiq' },
      description: `Arabiq ${sessionType} session with ${teacherName}`,
      receipt_email: studentEmail,
    };

    // Auto-split if teacher has a connected Stripe account
    if (teacherStripeAccountId && sessionType !== "Trial") {
      intentParams.application_fee_amount = Math.round(amount * 100 * 0.30);
      intentParams.transfer_data = { destination: teacherStripeAccountId };
    }

    const paymentIntent = await stripe.paymentIntents.create(intentParams);

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Stripe error:', error);
    return res.status(500).json({ error: error.message });
  }
}
