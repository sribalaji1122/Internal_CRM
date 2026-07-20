/**
 * Reusable Enterprise Pricing Engine
 */
export class PricingEngine {
  static CURRENCY_RATES = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    INR: 83.5
  };

  /**
   * Calculate effective unit price based on Volume & Tier rules
   * @param {number} basePrice 
   * @param {number} quantity 
   * @param {string} customerTier 
   * @param {number} contractPriceOverride 
   */
  static calculateEffectivePrice({
    basePrice = 0,
    quantity = 1,
    customerTier = 'Standard',
    contractPriceOverride = null
  }) {
    if (contractPriceOverride !== null && contractPriceOverride !== undefined) {
      return { effectiveUnitPrice: contractPriceOverride, priceRule: 'Contract Price' };
    }

    let discountPct = 0;

    // Customer Tier Rules
    if (customerTier === 'Gold') discountPct += 5;
    if (customerTier === 'Platinum') discountPct += 10;

    // Volume Tier Rules
    if (quantity >= 50) discountPct += 12;
    else if (quantity >= 20) discountPct += 8;
    else if (quantity >= 10) discountPct += 5;

    discountPct = Math.min(50, discountPct);
    const effectiveUnitPrice = Math.max(0, basePrice * (1 - discountPct / 100));

    return {
      basePrice,
      quantity,
      customerTier,
      appliedDiscountPercent: discountPct,
      effectiveUnitPrice,
      priceRule: discountPct > 0 ? `Tier/Volume (${discountPct}% off)` : 'Base Price'
    };
  }

  /**
   * Currency Conversion Helper Placeholder
   */
  static convertCurrency(amount, fromCurrency = 'USD', toCurrency = 'USD') {
    const fromRate = PricingEngine.CURRENCY_RATES[fromCurrency] || 1.0;
    const toRate = PricingEngine.CURRENCY_RATES[toCurrency] || 1.0;
    const amountInUSD = amount / fromRate;
    return Math.round(amountInUSD * toRate * 100) / 100;
  }
}
