import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.21.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    const { items, userId } = await req.json();

    if (!items || !items.length) {
      return Response.json({ error: 'No items provided' }, { status: 400 });
    }

    const origin = req.headers.get('Origin') || 'https://app.base44.com';
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: { name: item.product_name },
        unit_amount: Math.round(item.price * 100), // cents
      },
      quantity: item.quantity,
    }));

    // Add 10% tax as a line item
    const subtotalCents = items.reduce((s, i) => s + Math.round(i.price * 100) * i.quantity, 0);
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'Tax (10%)' },
        unit_amount: Math.round(subtotalCents * 0.1),
      },
      quantity: 1,
    });

    // Create pending order first
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const total = Math.round(subtotal * 1.1 * 100) / 100;

    const order = await base44.asServiceRole.entities.Order.create({
      user_id: userId || (user?.id || 'guest'),
      items: items.map(i => ({ name: i.product_name, price: i.price, qty: i.quantity })),
      total,
      status: 'pending',
      payment_method: 'stripe',
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/order-confirmed?order_id=${order.id}&provider=stripe`,
      cancel_url: `${origin}/checkout`,
      ...(user?.email ? { customer_email: user.email } : {}),
      metadata: { order_id: order.id },
    });

    return Response.json({ redirectUrl: session.url, orderId: order.id });
  } catch (error) {
    console.error('create-stripe-checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});