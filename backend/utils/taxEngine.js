/**
 * Reusable Tax Engine supporting multi-country & multi-tax structures
 */
export class TaxEngine {
  static TAX_RATES = {
    GST: 18,
    VAT: 10,
    SALES_TAX: 8,
    SERVICE_TAX: 5,
    CUSTOM_TAX: 0
  };

  /**
   * Calculate line item tax
   * @param {number} amountAfterDiscount 
   * @param {number} taxPercent 
   * @param {string} taxType 
   */
  static calculateLineTax({ amountAfterDiscount = 0, taxPercent = null, taxType = 'GST' }) {
    const rate = taxPercent !== null && taxPercent !== undefined
      ? taxPercent
      : (TaxEngine.TAX_RATES[taxType] || 0);

    const taxAmount = amountAfterDiscount * (rate / 100);
    const lineTotal = amountAfterDiscount + taxAmount;

    return {
      taxType,
      taxPercent: rate,
      taxAmount,
      lineTotal
    };
  }

  /**
   * Calculate full quote tax breakdown & grand total
   * @param {number} discountedSubtotal 
   * @param {Array} lineItems 
   * @param {number} shipping 
   * @param {string} defaultTaxType 
   */
  static calculateQuoteSummary({
    discountedSubtotal = 0,
    lineItems = [],
    shipping = 0,
    defaultTaxType = 'GST'
  }) {
    let totalLineTax = 0;
    const taxSummaryMap = {};

    lineItems.forEach(item => {
      const taxType = item.taxType || defaultTaxType;
      const rate = item.taxPercent !== undefined ? item.taxPercent : (TaxEngine.TAX_RATES[taxType] || 0);
      const itemNet = (item.unitPrice * item.quantity) - (item.discountAmount || 0);
      const taxAmt = itemNet * (rate / 100);

      totalLineTax += taxAmt;

      if (!taxSummaryMap[taxType]) {
        taxSummaryMap[taxType] = { taxType, rate, totalTaxable: 0, totalTaxAmount: 0 };
      }
      taxSummaryMap[taxType].totalTaxable += itemNet;
      taxSummaryMap[taxType].totalTaxAmount += taxAmt;
    });

    const grandTotal = discountedSubtotal + totalLineTax + shipping;

    return {
      subtotal: discountedSubtotal,
      totalTax: totalLineTax,
      shipping,
      grandTotal,
      taxSummary: Object.values(taxSummaryMap)
    };
  }
}
