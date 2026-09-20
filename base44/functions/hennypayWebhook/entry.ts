import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { secrets } from 'base44:runtime';

function hexToBytes(hex) {
  if (!hex || hex.length % 2 !== 0) return new Uint8Array();
  return new Uint8Array(hex.match(/.{2}/g).map((byte) => parseInt(byte, 16)));
}

function timingSafeEqual(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}

export default async function(req) {
  try {
    const rawBody = await req.text();
    const signatureHeader = req.headers.get('Hennypay-Signature') || '';
    const timestamp = req.headers.get('Hennypay-Timestamp') || signatureHeader.match(/(?:^|,)t=(\d+)/)?.[1];
    const signature = signatureHeader.match(/(?:^|,)v1=([a-fA-F0-9]+)/)?.[1];
    if (!timestamp || !signature || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) {
      return Response.json({ error: 'Invalid webhook timestamp or signature' }, { status: 401 });
    }

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secrets.get('HENNYPAY_WEBHOOK_SECRET')),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const digest = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${rawBody}`)));
    if (!timingSafeEqual(digest, hexToBytes(signature.toLowerCase()))) {
      return Response.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const payment = event?.data?.object || event?.data || event?.payment || {};
    const paymentId = payment.id || event.payment_id;
    if (!paymentId) return Response.json({ received: true, ignored: true });

    const base44 = createClientFromRequest(req);
    const orders = await base44.asServiceRole.entities.Order.filter({ payment_id: paymentId });
    const order = orders[0];
    if (!order) return Response.json({ received: true, ignored: true });

    if (event.type === 'payment.processing' && order.status === 'pending') {
      await base44.asServiceRole.entities.Order.update(order.id, { status: 'processing' });
    }

    if (event.type === 'payment.succeeded' && order.status !== 'confirmed') {
      await base44.asServiceRole.entities.Order.update(order.id, { status: 'confirmed' });
      await base44.asServiceRole.entities.CartItem.deleteMany({ user_id: order.user_id });
      await base44.asServiceRole.entities.Notification.create({
        user_id: order.user_id,
        title: 'Order Confirmed',
        message: `Your order #${order.id.slice(-8).toUpperCase()} has been confirmed.`,
        type: 'order',
        order_id: order.id,
        read: false,
      });
    }

    if ((event.type === 'payment.failed' || event.type === 'refund.succeeded') && order.status !== 'cancelled') {
      await base44.asServiceRole.entities.Order.update(order.id, { status: 'cancelled' });
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('hennypayWebhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}