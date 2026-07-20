/**
 * Server-side Quotation HTML/PDF layout builder
 */
export class PdfGenerator {
  static generateQuoteHtml(quote, items = [], companyInfo = {}) {
    const isApproved = quote.status === 'Approved';
    const watermarkText = quote.status === 'Draft' ? 'DRAFT' : isApproved ? 'APPROVED' : quote.status.toUpperCase();

    const itemsHtml = items.map((item, idx) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px;">${idx + 1}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px;">
          <strong>${item.productName}</strong>
          ${item.sku ? `<br/><span style="color: #64748b; font-size: 9px;">SKU: ${item.sku}</span>` : ''}
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 11px;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 11px;">$${(item.unitPrice || 0).toLocaleString()}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 11px;">$${(item.discountAmount || 0).toLocaleString()}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 11px;">$${(item.taxAmount || 0).toLocaleString()}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 11px; font-weight: bold;">$${(item.lineTotal || 0).toLocaleString()}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <title>Quotation ${quote.quoteNumber}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 24px; color: #1e293b; }
          .watermark { position: absolute; top: 40%; left: 20%; transform: rotate(-30deg); font-size: 80px; color: rgba(226, 232, 240, 0.4); font-weight: 900; letter-spacing: 10px; z-index: -1; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #6366f1; padding-bottom: 16px; }
          .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .table th { background: #f8fafc; text-align: left; padding: 8px; font-size: 10px; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #cbd5e1; }
          .totals { margin-top: 20px; margin-left: auto; width: 280px; }
          .totals-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 11px; }
          .totals-grand { font-size: 14px; font-weight: bold; border-top: 2px solid #1e293b; padding-top: 8px; color: #4338ca; }
          .footer { margin-top: 40px; display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 10px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="watermark">${watermarkText}</div>
        <div class="header">
          <div>
            <h2 style="margin: 0; color: #4338ca;">ApexCRM Enterprise</h2>
            <p style="margin: 4px 0 0 0; font-size: 10px; color: #64748b;">Official Sales Quotation</p>
          </div>
          <div style="text-align: right;">
            <h3 style="margin: 0; color: #1e293b;">${quote.quoteNumber}</h3>
            <p style="margin: 4px 0 0 0; font-size: 10px; color: #64748b;">Rev v${quote.versionNumber || 1}</p>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 20px; font-size: 11px;">
          <div>
            <strong>Prepared For:</strong><br/>
            ${quote.companyName || 'Valued Customer'}<br/>
            ${quote.contactName || ''}
          </div>
          <div style="text-align: right;">
            <strong>Issue Date:</strong> ${quote.issueDate ? new Date(quote.issueDate).toLocaleDateString() : 'N/A'}<br/>
            <strong>Valid Until:</strong> ${quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : 'N/A'}
          </div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Product Details</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Discount</th>
              <th style="text-align: right;">Tax</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-row"><span>Subtotal:</span><span>$${(quote.subtotal || 0).toLocaleString()}</span></div>
          <div class="totals-row"><span>Total Discount:</span><span>-$${(quote.discountTotal || 0).toLocaleString()}</span></div>
          <div class="totals-row"><span>Total Tax:</span><span>+$${(quote.taxTotal || 0).toLocaleString()}</span></div>
          <div class="totals-row"><span>Shipping:</span><span>+$${(quote.shipping || 0).toLocaleString()}</span></div>
          <div class="totals-row totals-grand"><span>Grand Total:</span><span>$${(quote.grandTotal || 0).toLocaleString()}</span></div>
        </div>

        <div style="margin-top: 30px; font-size: 10px;">
          <strong>Terms & Conditions:</strong>
          <p style="margin: 4px 0; color: #475569;">${quote.termsAndConditions || 'Standard payment terms apply.'}</p>
        </div>

        <div class="footer">
          <div>
            <p style="margin:0;">Prepared By: ${quote.preparedBy || 'Jane Doe'}</p>
          </div>
          <div>
            <p style="margin:0;">Authorized Signature: __________________</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
