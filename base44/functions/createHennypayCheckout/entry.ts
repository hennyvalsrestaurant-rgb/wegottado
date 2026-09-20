import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { secrets } from 'base44:runtime';

const HENNYPAY_API = 'https://henny-pay-flow.base44.app/functions/hennypayApi';

async function callHennypay(secretKey, body, idempotencyKey) {
  const response = await fetch(HENNYPAY_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json();
  if (!response.ok) {
    const details = payload?.error?.message || payload?.error?.code || payload?.error;
    throw new Error(typeof details === 'string' ? details : JSON.stringify(details || payload));
  }
  return payload;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { items, shipping } = await req.json();
    if (!Array.isArray(items) || items.length === 0) {
      return Response.json({ error: 'Your bag is empty' }, { status: 400 });
    }

    const subtotal = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
    const total = Math.round(subtotal * 1.1 * 100) / 100;
    const order = await base44.asServiceRole.entities.Order.create({
      user_id: user.id,
      items: items.map((item) => ({ name: item.product_name, price: item.price, qty: item.quantity, size: item.size })),
      total,
      status: 'pending',
      shipping_address: shipping || {},
      payment_method: 'hennypay',
    });

    const secretKey = secrets.get('HENNYPAY_SECRET_KEY');
    const link = await callHennypay(secretKey, {
      operation: 'links.create',
      title: `WEGOTTADO Order ${order.id.slice(-8).toUpperCase()}`,
      amount: Math.round(total * 100),
      currency: 'USD',
      country: 'US',
    }, `${order.id}-link`);

    const linkId = link?.data?.id || link?.id;
    if (!linkId) throw new Error('Hennypay did not return a payment link ID');

    const payment = await callHennypay(secretKey, {
      operation: 'payments.create',
      link_id: linkId,
      email: user.email,
      payment_method: 'card',
    }, `${order.id}-payment`);

    const paymentId = payment?.data?.id;
    const checkoutUrl = payment?.checkout_url;
    if (!paymentId || !checkoutUrl) throw new Error('Hennypay did not return a checkout URL');

    await base44.asServiceRole.entities.Order.update(order.id, {
      payment_link_id: linkId,
      payment_id: paymentId,
      status: payment?.data?.status === 'processing' ? 'processing' : 'pending',
    });

    return Response.json({ checkoutUrl, orderId: order.id });
  } catch (error) {
    console.error('createHennypayCheckout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}