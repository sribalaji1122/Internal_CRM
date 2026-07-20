import React, { useRef } from 'react';
import Modal from '../modal/Modal';
import PrimaryButton from '../buttons/PrimaryButton';
import OutlineButton from '../buttons/OutlineButton';
import { Printer, Download, CheckCircle, FileText } from 'lucide-react';

export default function QuotePdfModal({ isOpen, onClose, quote }) {
  const printRef = useRef(null);

  if (!quote) return null;

  const handlePrint = () => {
    const printContent = printRef.current;
    const win = window.open('', '', 'width=900,height=700');
    win.document.write(`
      <html>
        <head>
          <title>Quote ${quote.quoteNumber}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 24px; color: #1e293b; }
            .watermark { position: absolute; top: 35%; left: 15%; transform: rotate(-30deg); font-size: 90px; color: rgba(203, 213, 225, 0.3); font-weight: 900; z-index: -1; }
            .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .table th, .table td { padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
            .table th { background: #f8fafc; text-align: left; text-transform: uppercase; color: #64748b; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  const isApproved = quote.status === 'Approved';
  const watermarkText = quote.status === 'Draft' ? 'DRAFT' : isApproved ? 'APPROVED' : (quote.status || 'QUOTE').toUpperCase();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Quote PDF Document - ${quote.quoteNumber}`}
      maxWidth="max-w-4xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-slate-500 font-semibold">Printable Enterprise PDF Format</span>
          <div className="flex items-center gap-2">
            <OutlineButton onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="h-4 w-4" /> Print Quotation
            </OutlineButton>
            <PrimaryButton onClick={handlePrint} className="flex items-center gap-2">
              <Download className="h-4 w-4" /> Download PDF
            </PrimaryButton>
          </div>
        </div>
      }
    >
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 relative overflow-hidden text-xs" ref={printRef}>
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 opacity-10">
          <span className="text-8xl font-black rotate-[-30deg] tracking-widest text-indigo-400 uppercase">
            {watermarkText}
          </span>
        </div>

        {/* Header */}
        <div className="relative z-10 flex items-start justify-between border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center font-extrabold text-white">C</div>
              <h2 className="text-xl font-black tracking-tight text-white">ApexCRM Enterprise</h2>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-semibold">Official Commercial Quotation</p>
          </div>
          <div className="text-right">
            <h3 className="text-lg font-extrabold text-indigo-400">{quote.quoteNumber}</h3>
            <p className="text-[10px] text-slate-400">Revision: v{quote.versionNumber || 1}</p>
          </div>
        </div>

        {/* Customer & Company Details */}
        <div className="relative z-10 grid grid-cols-2 gap-4 py-5 border-b border-slate-800">
          <div>
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">Prepared For</span>
            <p className="font-bold text-slate-200 text-sm mt-0.5">{quote.companyName || 'Valued Customer'}</p>
            <p className="text-slate-400 text-[10px]">{quote.contactName || 'Primary Contact'}</p>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">Quotation Dates</span>
            <p className="text-slate-300 mt-0.5"><span className="text-slate-500">Issue Date:</span> {quote.issueDate ? new Date(quote.issueDate).toLocaleDateString() : 'N/A'}</p>
            <p className="text-slate-300"><span className="text-slate-500">Valid Until:</span> {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="relative z-10 my-5 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[9px] uppercase tracking-wider text-slate-400 bg-slate-800/40">
                <th className="py-2 px-3">#</th>
                <th className="py-2 px-3">Product Description</th>
                <th className="py-2 px-3 text-center">Qty</th>
                <th className="py-2 px-3 text-right">Unit Price</th>
                <th className="py-2 px-3 text-right">Discount</th>
                <th className="py-2 px-3 text-right">Tax</th>
                <th className="py-2 px-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {quote.items && quote.items.length > 0 ? (
                quote.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-3 text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-3">
                      <p className="font-bold text-slate-200">{item.productName}</p>
                      {item.sku && <span className="text-[9px] text-slate-500">SKU: {item.sku}</span>}
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-300 font-semibold">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right text-slate-300">${(item.unitPrice || 0).toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-slate-400">-${(item.discountAmount || 0).toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-slate-400">+${(item.taxAmount || 0).toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-slate-100">${(item.lineTotal || 0).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-slate-500 italic">No line items attached</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Financial Breakdown Summary */}
        <div className="relative z-10 flex justify-between items-start border-t border-slate-800 pt-4">
          <div className="max-w-md">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">Terms & Conditions</span>
            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
              {quote.termsAndConditions || 'Standard 30 days payment terms apply. Prices subject to change after expiration.'}
            </p>
          </div>
          <div className="w-64 space-y-1.5 text-right">
            <div className="flex justify-between text-slate-400 text-[10px]">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-200">${(quote.subtotal || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-400 text-[10px]">
              <span>Discount Total:</span>
              <span className="font-semibold text-emerald-400">-${(quote.discountTotal || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-400 text-[10px]">
              <span>Tax Total:</span>
              <span className="font-semibold text-slate-200">+${(quote.taxTotal || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-400 text-[10px]">
              <span>Shipping:</span>
              <span className="font-semibold text-slate-200">+${(quote.shipping || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-indigo-400 font-extrabold text-sm pt-2 border-t border-slate-800">
              <span>Grand Total:</span>
              <span>${(quote.grandTotal || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer & Signatures */}
        <div className="relative z-10 grid grid-cols-2 gap-4 mt-8 pt-4 border-t border-slate-800/80 text-[10px]">
          <div>
            <p className="text-slate-400">Prepared By: <span className="font-bold text-slate-200">{quote.preparedBy || 'Jane Doe'}</span></p>
            <p className="text-slate-500 text-[9px] mt-0.5">Approved By: {quote.approvedBy || 'Pending Approval'}</p>
          </div>
          <div className="text-right">
            <div className="inline-block border-t border-slate-600 pt-1 text-slate-400 px-6">
              Customer Acceptance Signature
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
