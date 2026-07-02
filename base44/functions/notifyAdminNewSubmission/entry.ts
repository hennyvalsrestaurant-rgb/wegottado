import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data, payload_too_large } = await req.json();

    if (!event) {
      return Response.json({ error: 'Missing event payload' }, { status: 400 });
    }

    let record = data;
    if (payload_too_large) {
      record = await base44.asServiceRole.entities[event.entity_name].get(event.entity_id);
    }

    const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
    const adminEmails = admins.map(a => a.email).filter(Boolean);

    if (!adminEmails.length) {
      console.warn('No admin users with an email found.');
      return Response.json({ skipped: true, reason: 'no admin emails' });
    }

    let subject = '';
    let body = '';

    if (event.entity_name === 'Order') {
      const itemsList = (record.items || []).map(i =>
        `• ${i.product_name || i.name || 'Item'}${i.size ? ` (Size ${i.size})` : ''} × ${i.quantity || 1}`
      ).join('\n');

      subject = `New Order Placed — #${event.entity_id.slice(-8).toUpperCase()}`;
      body = `A new order has been placed on WEGOTTADO.

Order ID: ${event.entity_id}
Total: $${record.total?.toFixed?.(2) ?? record.total}
Payment method: ${record.payment_method || 'N/A'}

Items:
${itemsList || 'N/A'}

Shipping to: ${record.shipping_address?.name || 'N/A'}

View it in the Admin panel.`;
    } else if (event.entity_name === 'Inquiry') {
      subject = `New Inquiry Received — ${record.product_name || 'Product'}`;
      body = `A new customer inquiry has been submitted on WEGOTTADO.

Product: ${record.product_name || 'N/A'}
From: ${record.name || 'N/A'} (${record.email || 'N/A'})

Message:
${record.message || 'N/A'}

View it in the Admin panel.`;
    } else {
      return Response.json({ skipped: true, reason: 'unhandled entity' });
    }

    for (const email of adminEmails) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject,
        body,
      });
    }

    return Response.json({ success: true, notified: adminEmails.length });
  } catch (error) {
    console.error('notifyAdminNewSubmission error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});