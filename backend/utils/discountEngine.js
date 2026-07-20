/**
 * Reusable Discount Engine for Line Items & Quotes/Deals
 */
export class DiscountEngine {
  /**
   * Calculates Line Item Discount
   * @param {number} unitPrice 
   * @param {number} quantity 
   * @param {number} discountPercent 
   * @param {number} discountAmount 
   */
  static calculateLineDiscount({ unitPrice = 0, quantity = 1, discountPercent = 0, discountAmount = 0 }) {
    const grossTotal = unitPrice * quantity;
    let totalDiscount = 0;

    if (discountPercent > 0) {
      totalDiscount = grossTotal * (discountPercent / 100);
    } else if (discountAmount > 0) {
      totalDiscount = Math.min(grossTotal, discountAmount);
    }

    const netAmount = Math.max(0, grossTotal - totalDiscount);

    return {
      grossTotal,
      discountPercent,
      discountAmount: totalDiscount,
      netAmount
    };
  }

  /**
   * Calculates overall Quote / Deal level discounts
   * @param {number} subtotal 
   * @param {number} quoteDiscountPercent 
   * @param {number} quoteDiscountAmount 
   * @param {string} couponCode 
   * @param {number} promotionalDiscount 
   */
  static calculateQuoteDiscount({
    subtotal = 0,
    quoteDiscountPercent = 0,
    quoteDiscountAmount = 0,
    couponCode = null,
    promotionalDiscount = 0
  }) {
    let totalDiscount = 0;

    if (quoteDiscountPercent > 0) {
      totalDiscount += subtotal * (quoteDiscountPercent / 100);
    }
    if (quoteDiscountAmount > 0) {
      totalDiscount += quoteDiscountAmount;
    }

    // Coupon Code Placeholder Logic
    if (couponCode === 'SAVE10') {
      totalDiscount += subtotal * 0.10;
    } else if (couponCode === 'SPECIAL50') {
      totalDiscount += 50;
    }

    // Promotional Discount Placeholder
    if (promotionalDiscount > 0) {
      totalDiscount += promotionalDiscount;
    }

    totalDiscount = Math.min(subtotal, totalDiscount);
    const discountedSubtotal = Math.max(0, subtotal - totalDiscount);

    return {
      subtotal,
      totalDiscount,
      discountedSubtotal,
      appliedCoupon: couponCode
    };
  }
}
