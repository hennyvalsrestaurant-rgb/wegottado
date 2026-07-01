import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { items } = await req.json();
    if (!items || !items.length) {
      return Response.json({ error: 'No items provided' }, { status: 400 });
    }

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const total = Math.round(subtotal * 1.1 * 100) / 100;

    const balance = user.wallet_balance || 0;
    if (balance < total) {
      return Response.json({ error: 'Insufficient wallet balance' }, { status: 400 });
    }

    const newBalance = Math.round((balance - total) * 100) / 100;
    await base44.auth.updateMe({ wallet_balance: newBalance });

    const order = await base44.entities.Order.create({
      user_id: user.id,
      items: items.map(i => ({ name: i.product_name, price: i.price, qty: i.quantity })),
      total,
      status: 'confirmed',
      payment_method: 'wallet',
    });

    await base44.asServiceRole.entities.WalletTransaction.create({
      user_id: user.id,
      type: 'purchase',
      amount: total,
      status: 'completed',
      description: `Order #${order.id.slice(-8).toUpperCase()} paid with wallet`,
    });

    await base44.asServiceRole.entities.Notification.create({
      user_id: user.id,
      title: 'Order Confirmed',
      message: `Your order was paid using your wallet balance. Total: $${total.toFixed(2)}`,
      type: 'order',
      read: false,
      order_id: order.id,
    });

    await base44.entities.CartItem.deleteMany({ user_id: user.id });

    return Response.json({ orderId: order.id, newBalance });
  } catch (error) {
    console.error('pay-with-wallet error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});