export class ProductVariantDTO {
  static transform(variant) {
    if (!variant) return null;
    const doc = variant.toObject ? variant.toObject() : variant;

    return {
      id: doc._id,
      productId: doc.productId,
      variantCode: doc.variantCode,
      sku: doc.sku || '',
      barcode: doc.barcode || '',
      name: doc.name,
      color: doc.color || '',
      size: doc.size || '',
      version: doc.version || '1.0',
      priceOverride: doc.priceOverride,
      costOverride: doc.costOverride,
      stockQuantity: doc.stockQuantity || 0,
      status: doc.status || 'Active',
      images: doc.images || [],
      documents: doc.documents || [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }

  static transformList(variants) {
    if (!Array.isArray(variants)) return [];
    return variants.map(v => ProductVariantDTO.transform(v));
  }
}
