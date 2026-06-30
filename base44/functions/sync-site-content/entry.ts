import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch the 6 most recent products that have images
    const allProducts = await base44.asServiceRole.entities.Product.list('-created_date', 50);
    const withImages = allProducts.filter(p => p.image_url);

    // ── Atelier gallery (up to 6) ──────────────────────────────────────────────
    const galleryProducts = withImages.slice(0, 6);
    const atelierImages = galleryProducts.map(p => p.image_url);
    const atelierLabels = galleryProducts.map(p => p.name);

    const atelierRecords = await base44.asServiceRole.entities.SiteContent.filter({ section: 'atelier' });
    if (atelierRecords[0]) {
      await base44.asServiceRole.entities.SiteContent.update(atelierRecords[0].id, {
        images: atelierImages,
        labels: atelierLabels,
      });
      console.log(`Atelier updated: ${atelierImages.length} images`);
    } else {
      await base44.asServiceRole.entities.SiteContent.create({
        section: 'atelier',
        images: atelierImages,
        labels: atelierLabels,
      });
      console.log(`Atelier created: ${atelierImages.length} images`);
    }

    // ── Featured section (most recent product with an image, if no custom text already set) ──
    const featuredRecords = await base44.asServiceRole.entities.SiteContent.filter({ section: 'featured' });
    const featuredRecord = featuredRecords[0];
    const newestProduct = withImages[0];

    if (newestProduct) {
      const newImage = newestProduct.image_url;
      // Only auto-update the image if no admin-generated AI copy is saved,
      // or if the image has changed (new product pushed in)
      const existingImage = featuredRecord?.images?.[0];
      if (!existingImage || existingImage !== newImage) {
        if (featuredRecord) {
          // Preserve existing AI-generated labels; only swap the image
          await base44.asServiceRole.entities.SiteContent.update(featuredRecord.id, {
            images: [newImage],
          });
          console.log(`Featured image updated to: ${newestProduct.name}`);
        } else {
          await base44.asServiceRole.entities.SiteContent.create({
            section: 'featured',
            images: [newImage],
            labels: [],
          });
          console.log(`Featured created with: ${newestProduct.name}`);
        }
      } else {
        console.log('Featured image unchanged, skipping.');
      }
    }

    return Response.json({ ok: true, atelierCount: atelierImages.length });
  } catch (error) {
    console.error('sync-site-content error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});