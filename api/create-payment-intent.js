import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || '').trim());
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { amount, currency = 'gbp', teacherName, sessionType, studentEmail, bookingId, teacherStripeAccountId, saveCard = false } = req.body;
  if (!amount || amount < 1) return res.status(400).json({ error: 'Invalid amount' });
  
  try {
    // Get or create Stripe Customer for this student
    let stripeCustomerId = null;
    if (studentEmail) {
      const { data: userRow } = await supabase
        .from('users')
        .select('stripe_customer_id')
        .eq('email', studentEmail)
        .maybeSingle();

      if (userRow?.stripe_customer_id) {
        stripeCustomerId = userRow.stripe_customer_id;
      } else {
        const customer = await stripe.customers.create({ email: studentEmail });
        stripeCustomerId = customer.id;
        const { error: updateErr } = await supabase.from('users')
          .update({ stripe_customer_id: stripeCustomerId })
          .eq('email', studentEmail);
        if (updateErr) console.error('Failed to save stripe_customer_id:', updateErr, 'for email:', studentEmail);
      }
    }

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
