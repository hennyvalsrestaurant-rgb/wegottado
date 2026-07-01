import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { amount } = await req.json();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 0.5) {
      return Response.json({ error: 'Minimum top-up amount is $0.50' }, { status: 400 });
    }

    const origin = req.headers.get('Origin') || 'https://app.base44.com';

    const body = {
      cart: {
        items: [{ name: 'Wallet Top-Up', quantity: 1, price: numAmount.toFixed(2) }],
        customerInfo: {
          email: user.email,
          firstName: user.full_name?.split(' ')[0] || '',
          lastName: user.full_name?.split(' ').slice(1).join(' ') || '',
        },
      },
      callbackUrls: {
        postFlowUrl: `${origin}/profile?tab=wallet`,
        thankYouPageUrl: `${origin}/profile?tab=wallet&topup=success`,
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

    await base44.asServiceRole.entities.WalletTransaction.create({
      user_id: user.id,
      type: 'topup',
      amount: numAmount,
      status: 'pending',
      checkout_id: data.checkoutSession.id,
      description: 'Wallet top-up via Base44 Payments',
    });

    return Response.json({ redirectUrl: data.checkoutSession.redirectUrl });
  } catch (error) {
    console.error('wallet-topup error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});