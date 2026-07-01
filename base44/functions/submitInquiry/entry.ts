import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { product_id, product_name, name, email, message } = await req.json();

    if (!product_name || !name || !email || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await base44.asServiceRole.entities.Inquiry.create({
      product_id,
      product_name,
      name,
      email,
      message,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('submitInquiry error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});