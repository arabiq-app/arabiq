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
        await supabase.from('users')
          .update({ stripe_customer_id: stripeCustomerId })
          .eq('email', studentEmail);
      }
    }

    const intentParams = {
      amount: Math.round(amount * 100),
      currency,
      metadata: { teacherName, sessionType, studentEmail, bookingId, platform: 'arabiq' },
      description: `Arabiq ${sessionType} session with ${teacherName}`,
      receipt_email: studentEmail,
      ...(stripeCustomerId && { customer: stripeCustomerId }),
      ...(saveCard && { setup_future_usage: 'on_session' }),
    };

    // Auto-split if teacher has a connected Stripe account
    if (teacherStripeAccountId && sessionType !== "Trial") {
      intentParams.application_fee_amount = Math.round(amount * 100 * 0.30);
      intentParams.transfer_data = { destination: teacherStripeAccountId };
    }

    const paymentIntent = await stripe.paymentIntents.create(intentParams);

    // Fetch saved payment methods for this customer
    let savedCard = null;
    if (stripeCustomerId) {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: stripeCustomerId,
        type: 'card',
      });
      if (paymentMethods.data.length > 0) {
        const pm = paymentMethods.data[0];
        savedCard = {
          id: pm.id,
          brand: pm.card.brand,
          last4: pm.card.last4,
          expMonth: pm.card.exp_month,
          expYear: pm.card.exp_year,
        };
      }
    }

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      savedCard,
      customerId: stripeCustomerId,
    });

  } catch (error) {
    console.error('Stripe error:', error);
    return res.status(500).json({ error: error.message, stack: error.stack, full: JSON.stringify(error) });
  }
}
