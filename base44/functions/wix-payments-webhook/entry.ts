import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import * as jose from 'npm:jose@5.9.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Verify JWT signature
    const publicKeyPem = Deno.env.get('WIX_PAYMENTS_WEBHOOK_PUBLIC_KEY');
    if (!publicKeyPem) {
      console.error('Missing WIX_PAYMENTS_WEBHOOK_PUBLIC_KEY');
      return new Response('Unauthorized', { status: 401 });
    }

    const requestBody = await req.text();

    let event, eventData;
    try {
      const publicKey = await jose.importSPKI(publicKeyPem, 'RS256');
      const { payload: rawPayload } = await jose.compactVerify(requestBody, publicKey);
      const decoded = JSON.parse(new TextDecoder().decode(rawPayload));
      event = JSON.parse(decoded.data);
      eventData = JSON.parse(event.data);
    } catch (err) {
      console.error('JWT verification failed:', err.message);
      return new Response('Unauthorized', { status: 401 });
    }

    if (event.eventType === 'wix.ecom.v1.order_approved') {
      const order = eventData.actionEvent.body.order;
      const checkoutId = order.checkoutId;
      const buyerEmail = order.buyerInfo?.email;
      const contact = order.billingInfo?.contactDetails || {};
      const firstName = contact.firstName || '';
      const lastName = contact.lastName || '';
      const customerName = [firstName, lastName].filter(Boolean).join(' ') || 'Valued Customer';
      const total = order.priceSummary?.total?.amount || '0';
      const currency = order.currency || 'USD';

      const lineItems = order.lineItems || [];
      const itemsList = lineItems.map(item =>
        `• ${item.productName?.original || 'Item'} × ${item.quantity}`
      ).join('\n');

      // Check if this checkout was a wallet top-up
      try {
        const pendingTopups = await base44.asServiceRole.entities.WalletTransaction.filter({ status: 'pending', checkout_id: checkoutId });
        if (pendingTopups.length > 0) {
          const topup = pendingTopups[0];
          const walletUser = await base44.asServiceRole.entities.User.get(topup.user_id);
          const newBalance = Math.round(((walletUser.wallet_balance || 0) + topup.amount) * 100) / 100;
          await base44.asServiceRole.entities.User.update(topup.user_id, { wallet_balance: newBalance });
          await base44.asServiceRole.entities.WalletTransaction.update(topup.id, { status: 'completed' });
          await base44.asServiceRole.entities.Notification.create({
            user_id: topup.user_id,
            title: 'Wallet Topped Up',
            message: `$${topup.amount.toFixed(2)} was added to your wallet. New balance: $${newBalance.toFixed(2)}`,
            type: 'system',
            read: false,
          });
          return new Response('OK', { status: 200 });
        }
      } catch (walletErr) {
        console.error('Wallet topup handling error:', walletErr.message);
      }

      // Update our pending order to confirmed
      try {
        const orders = await base44.asServiceRole.entities.Order.filter({ status: 'pending' });
        // Find the most recent pending order for this checkout (match by checkoutId stored in tracking_number or fallback to latest)
        const matchingOrder = orders.find(o => o.tracking_number === checkoutId) || orders[0];
        if (matchingOrder) {
          await base44.asServiceRole.entities.Order.update(matchingOrder.id, {
            status: 'confirmed',
            tracking_number: checkoutId,
          });

          // Create a notification for the user
          if (matchingOrder.user_id && matchingOrder.user_id !== 'guest') {
            await base44.asServiceRole.entities.Notification.create({
              user_id: matchingOrder.user_id,
              title: 'Order Confirmed',
              message: `Your order has been confirmed. Total: ${currency} ${total}`,
              type: 'order',
              read: false,
              order_id: matchingOrder.id,
            });
          }
        }
      } catch (dbErr) {
        console.error('DB update error:', dbErr.message);
      }

      // Send confirmation email to buyer
      if (buyerEmail) {
        const emailBody = `
Dear ${customerName},

Thank you for your order at WEGOTTADO. We're thrilled to have you as our client.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
ORDER CONFIRMED
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Items ordered:
${itemsList}

Total charged: ${currency} ${total}

Your garments will be hand-wrapped and dispatched within 3–5 business days. You will receive a separate notification once your order has shipped.

If you have any questions, simply reply to this email and our team will be happy to assist.

With gratitude,
The WEGOTTADO House
        `.trim();

        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: buyerEmail,
            subject: `Order Confirmed — WEGOTTADO`,
            body: emailBody,
          });
          console.log('Confirmation email sent to:', buyerEmail);
        } catch (emailErr) {
          console.error('Email send error:', emailErr.message);
        }
      } else {
        console.warn('No buyer email found in order payload');
      }
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook handler error:', error.message);
    return new Response('Internal Server Error', { status: 500 });
  }
});