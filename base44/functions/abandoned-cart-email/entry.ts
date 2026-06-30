import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Verify admin
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Get all cart items older than 24h that haven't had an email sent
    const staleItems = await base44.asServiceRole.entities.CartItem.filter({
      abandoned_email_sent: { $ne: true },
      created_date: { $lt: cutoff },
    });

    if (!staleItems.length) {
      console.log('No abandoned carts found.');
      return Response.json({ sent: 0 });
    }

    // Group items by user_id
    const byUser = {};
    for (const item of staleItems) {
      if (!byUser[item.user_id]) byUser[item.user_id] = [];
      byUser[item.user_id].push(item);
    }

    let sent = 0;
    const userIds = Object.keys(byUser);

    for (const userId of userIds) {
      const items = byUser[userId];

      // Look up the user's email
      let userRecord;
      try {
        userRecord = await base44.asServiceRole.entities.User.get(userId);
      } catch (e) {
        console.warn(`Could not find user ${userId}:`, e.message);
        continue;
      }

      const email = userRecord?.email;
      if (!email) {
        console.warn(`User ${userId} has no email, skipping.`);
        continue;
      }

      const firstName = userRecord.full_name?.split(' ')[0] || 'there';
      const total = items.reduce((s, i) => s + i.price * (i.quantity || 1), 0);

      const itemList = items.map(i =>
        `• ${i.product_name}${i.size ? ` (Size ${i.size})` : ''} × ${i.quantity || 1} — $${(i.price * (i.quantity || 1)).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
      ).join('\n');

      const body = `Hi ${firstName},

You left some pieces behind in your bag at WEGOTTADO. Your selection is still reserved — but not for long.

${itemList}

Subtotal: $${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}

Complete your order before your items sell out:
https://wegottado.base44.app/checkout

— The WEGOTTADO Maison`;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: 'Your bag is waiting, ' + firstName,
        body,
      });

      // Mark all their items as emailed
      const itemIds = items.map(i => i.id);
      for (const id of itemIds) {
        await base44.asServiceRole.entities.CartItem.update(id, { abandoned_email_sent: true });
      }

      sent++;
      console.log(`Abandoned cart email sent to ${email} (${items.length} items)`);
    }

    return Response.json({ sent, users: userIds.length });
  } catch (error) {
    console.error('abandoned-cart-email error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});