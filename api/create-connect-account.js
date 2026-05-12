import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { teacherEmail, teacherName } = req.body;
  if (!teacherEmail) return res.status(400).json({ error: 'Missing teacher email' });

  try {
    const account = await stripe.accounts.create({
      type: 'express',
      email: teacherEmail,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        name: teacherName,
        mcc: '8299',
      },
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.VITE_APP_URL}/admin`,
      return_url: `${process.env.VITE_APP_URL}/admin`,
      type: 'account_onboarding',
    });

    return res.status(200).json({ accountId: account.id, onboardingUrl: accountLink.url });
  } catch (error) {
    console.error('Connect account error:', error);
    return res.status(500).json({ error: error.message });
  }
}
