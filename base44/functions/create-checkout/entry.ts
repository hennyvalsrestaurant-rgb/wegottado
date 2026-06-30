import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    const { items, userId, currency, rate } = await req.json();

    if (!items || !items.length) {
      return Response.json({ error: 'No items provided' }, { status: 400 });
    }

    const origin = req.headers.get('Origin') || 'https://app.base44.com';
    const fxRate = (typeof rate === 'number' && rate > 0) ? rate : 1;

    // Validate no item falls below Wix's 0.50 minimum after conversion
    for (const item of items) {
      const converted = item.price * fxRate;
      if (converted < 0.5) {
        return Response.json({ error: `Item "${item.product_name}" price is below the minimum charge of 0.50 ${currency || 'USD'}.` }, { status: 400 });
      }
    }

    const wixItems = items.map(item => ({
      name: item.product_name,
      quantity: item.quantity,
      price: (item.price * fxRate).toFixed(2),
    }));

    const customerInfo = user ? {
      email: user.email,
      firstName: user.full_name?.split(' ')[0] || '',
      lastName: user.full_name?.split(' ').slice(1).join(' ') || '',
    } : undefined;

    const body = {
      cart: {
        items: wixItems,
        ...(customerInfo ? { customerInfo } : {}),
      },
      callbackUrls: {
        postFlowUrl: origin,
        thankYouPageUrl: `${origin}/order-confirmed`,
      },
    };

    const res = await fetch(
      'https://www.wixapis.com/payments/platform/v1/checkout-sessions/construct',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': Deno.env.get('WIX_PAYMENTS_API_KEY'),
          'wix-site-id': Deno.env.get('WIX_PAYMENTS_SITE_ID'),
        },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error('Wix Payments error:', JSON.stringify(data));
      return Response.json({ error: data.message || 'Checkout creation failed' }, { status: res.status });
    }

    // Create a pending order in our DB
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const total = Math.round(subtotal * 1.1 * 100) / 100;

    const order = await base44.asServiceRole.entities.Order.create({
      user_id: userId || (user?.id || 'guest'),
      items: items.map(i => ({ name: i.product_name, price: i.price, qty: i.quantity })),
      total,
      status: 'pending',
      payment_method: 'base44_payments',
    });

    return Response.json({
      redirectUrl: data.checkoutSession.redirectUrl,
      orderId: order.id,
    });
  } catch (error) {
    console.error('create-checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});