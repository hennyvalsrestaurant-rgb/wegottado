import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data, old_data, changed_fields, payload_too_large } = await req.json();

    if (!event || !changed_fields?.includes('tracking_number')) {
      return Response.json({ skipped: true, reason: 'tracking_number not changed' });
    }

    let record = data;
    if (payload_too_large) {
      record = await base44.asServiceRole.entities[event.entity_name].get(event.entity_id);
    }

    const trackingNumber = record?.tracking_number;
    const previousTracking = old_data?.tracking_number;

    if (!trackingNumber || trackingNumber === previousTracking) {
      return Response.json({ skipped: true, reason: 'no new tracking number' });
    }

    let toEmail = null;
    let customerName = 'Valued Customer';
    let productLine = '';

    if (event.entity_name === 'Order') {
      customerName = record.shipping_address?.name || customerName;
      productLine = `${(record.items || []).length} item(s) · $${record.total?.toFixed?.(2) ?? record.total}`;
      if (record.user_id) {
        try {
          const user = await base44.asServiceRole.entities.User.get(record.user_id);
          toEmail = user?.email || null;
        } catch (e) {
          console.error('Failed to load user for order:', e.message);
        }
      }
    } else if (event.entity_name === 'Inquiry') {
      toEmail = record.email || null;
      customerName = record.name || customerName;
      productLine = record.product_name || '';
    }

    if (!toEmail) {
      console.warn('No email found to send tracking update for', event.entity_name, event.entity_id);
      return Response.json({ skipped: true, reason: 'no recipient email' });
    }

    const emailBody = `
Dear ${customerName},

Great news — your order is on its way!

━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRACKING UPDATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━

${productLine}

Tracking Number: ${trackingNumber}

You can use this number with your carrier to follow your delivery's progress.

With gratitude,
The WEGOTTADO House
    `.trim();

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: toEmail,
      subject: 'Your Order Has Shipped — Tracking Number Inside',
      body: emailBody,
    });

    return Response.json({ success: true, sentTo: toEmail });
  } catch (error) {
    console.error('sendTrackingEmail error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});