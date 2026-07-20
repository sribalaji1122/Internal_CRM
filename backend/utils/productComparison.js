/**
 * Reusable Product Comparison Helper
 */
export class ProductComparison {
  static compareProducts(products = []) {
    if (!Array.isArray(products) || products.length === 0) return [];

    const fieldsToCompare = [
      'productCode',
      'sku',
      'name',
      'unitPrice',
      'costPrice',
      'stockQuantity',
      'availableQuantity',
      'stockStatus',
      'weight',
      'dimensions',
      'warranty'
    ];

    const comparisonMatrix = fieldsToCompare.map(field => {
      const row = { feature: field };
      products.forEach((p, idx) => {
        row[`product_${idx + 1}`] = p[field] !== undefined ? p[field] : 'N/A';
      });
      return row;
    });

    return {
      productsCount: products.length,
      comparisonMatrix
    };
  }
}
