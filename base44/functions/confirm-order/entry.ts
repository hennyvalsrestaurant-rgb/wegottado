import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { order_id } = await req.json();

    if (!order_id) {
      return Response.json({ error: 'order_id is required' }, { status: 400 });
    }

    const order = await base44.asServiceRole.entities.Order.get(order_id);
    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    // Avoid re-processing an order that's already been confirmed
    if (order.status === 'pending') {
      await base44.asServiceRole.entities.Order.update(order_id, { status: 'confirmed' });

      if (order.user_id) {
        const cartItems = await base44.asServiceRole.entities.CartItem.filter({ user_id: order.user_id });
        if (cartItems.length > 0) {
          await base44.asServiceRole.entities.CartItem.deleteMany({ user_id: order.user_id });
        }
        await base44.asServiceRole.entities.Notification.create({
          user_id: order.user_id,
          title: 'Order Confirmed',
          message: `Your order #${order_id.slice(-8).toUpperCase()} has been confirmed.`,
          type: 'order',
          order_id,
          read: false,
        });
      }
    }

    return Response.json({ success: true, orderId: order_id, status: 'confirmed' });
  } catch (error) {
    console.error('confirm-order error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});