export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { paymentIntentId } = req.body;
  if (!paymentIntentId) return res.status(400).json({ error: "Missing paymentIntentId" });

  try {
    const stripe = (await import("stripe")).default(process.env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const chargeId = paymentIntent.latest_charge;
    if (!chargeId) return res.status(400).json({ error: "No charge found" });
    const refund = await stripe.refunds.create({ charge: chargeId });
    return res.status(200).json({ success: true, refund });
  } catch (e) {
    console.error("Refund error:", e);
    return res.status(500).json({ error: e.message });
  }
}
