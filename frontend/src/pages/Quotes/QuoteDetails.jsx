import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EntityDetailsLayout from '../../components/layout/EntityDetailsLayout';
import QuoteService from '../../services/QuoteService';
import StatusBadge from '../../components/badges/StatusBadge';
import QuotePdfModal from '../../components/quotes/QuotePdfModal';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import OutlineButton from '../../components/buttons/OutlineButton';
import {
  FileText,
  Printer,
  CheckCircle,
  Clock,
  Send,
  CheckCheck,
  XCircle,
  Copy,
  DollarSign
} from 'lucide-react';

export default function QuoteDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  useEffect(() => {
    fetchQuoteDetails();
  }, [id]);

  const fetchQuoteDetails = async () => {
    try {
      setLoading(true);
      const res = await QuoteService.getById(id);
      setQuote(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus, comments = '') => {
    try {
      await QuoteService.updateStatus(id, {
        status: newStatus,
        comments,
        approvedBy: 'Jane Doe'
      });
      fetchQuoteDetails();
    } catch (err) {
      alert('Status update failed');
    }
  };

  const handleClone = async () => {
    try {
      const res = await QuoteService.clone(id);
      navigate(`/quotes/${res.data.data._id || res.data.data.id}`);
    } catch (err) {
      alert('Clone failed');
    }
  };

  if (loading || !quote) {
    return <div className="p-8 text-center text-slate-400">Loading Quotation Details...</div>;
  }

  // Quote Stages Timeline
  const stages = ['Draft', 'Pending Approval', 'Approved', 'Sent', 'Accepted'];
  const currentStageIndex = stages.indexOf(quote.status) !== -1 ? stages.indexOf(quote.status) : 0;

  const estimatedProfit = Math.round((quote.grandTotal || 0) * 0.28);
  const marginPercent = quote.grandTotal > 0 ? Math.round((estimatedProfit / quote.grandTotal) * 100) : 0;

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="space-y-6 text-xs text-slate-300">
          {/* Quote Stage Timeline Visual */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500 block mb-3">Sales Workflow Timeline</span>
            <div className="flex items-center justify-between relative">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
              {stages.map((stage, idx) => {
                const isPassed = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                return (
                  <div key={stage} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-[10px] transition-all ${
                        isCurrent
                          ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isPassed ? <CheckCircle className="h-4 w-4" /> : idx + 1}
                    </div>
                    <span className={`text-[10px] font-bold mt-2 ${isCurrent ? 'text-indigo-400' : isPassed ? 'text-slate-200' : 'text-slate-500'}`}>
                      {stage}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Financial Breakdown Summary & Margin % */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
              <h4 className="font-bold text-slate-200 text-sm">Quotation Parameters</h4>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-slate-500">Quote Number:</span><span className="font-bold text-indigo-400">{quote.quoteNumber}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Company:</span><span className="font-semibold text-slate-200">{quote.companyName || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Contact:</span><span className="font-semibold text-slate-200">{quote.contactName || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Issue Date:</span><span>{quote.issueDate ? new Date(quote.issueDate).toLocaleDateString() : 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Valid Until:</span><span>{quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : 'N/A'}</span></div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2.5">
              <h4 className="font-bold text-slate-200 text-sm">Commercial Summary</h4>
              <div className="flex justify-between text-slate-400"><span>Subtotal:</span><span className="font-semibold text-slate-200">${(quote.subtotal || 0).toLocaleString()}</span></div>
              <div className="flex justify-between text-slate-400"><span>Total Discount:</span><span className="font-semibold text-emerald-400">-${(quote.discountTotal || 0).toLocaleString()}</span></div>
              <div className="flex justify-between text-slate-400"><span>Total Tax:</span><span className="font-semibold text-slate-200">+${(quote.taxTotal || 0).toLocaleString()}</span></div>
              <div className="flex justify-between text-slate-400"><span>Shipping:</span><span className="font-semibold text-slate-200">+${(quote.shipping || 0).toLocaleString()}</span></div>
              <div className="flex justify-between text-indigo-400 font-extrabold text-base pt-2 border-t border-slate-800">
                <span>Grand Total:</span>
                <span>${(quote.grandTotal || 0).toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[10px]">
                <span className="text-slate-500">Est. Profit Margin:</span>
                <span className="font-extrabold text-emerald-400">${estimatedProfit.toLocaleString()} ({marginPercent}%)</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'approval-history',
      label: 'Approval History',
      content: (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs text-slate-300">
          <h4 className="font-bold text-slate-200 mb-3">Multi-Level Approval Audit Trail</h4>
          <div className="space-y-3">
            {quote.approvalHistory && quote.approvalHistory.length > 0 ? (
              quote.approvalHistory.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-indigo-400">{item.status}</span> - <span className="text-slate-400">{item.comments || 'No comments'}</span>
                    <p className="text-[10px] text-slate-500 mt-0.5">By {item.approvedBy || 'System User'} | Level: {item.approvalLevel || 'General'}</p>
                  </div>
                  <span className="text-[10px] text-slate-500">{new Date(item.approvedAt).toLocaleString()}</span>
                </div>
              ))
            ) : (
              <p className="text-slate-500 italic">No approval events logged</p>
            )}
          </div>
        </div>
      )
    }
  ];

  return (
    <>
      <EntityDetailsLayout
        title={`Quotation ${quote.quoteNumber}`}
        subtitle={quote.subject}
        entityType="Quote"
        tabs={tabs}
        stats={[
          { label: 'Grand Total', value: `$${(quote.grandTotal || 0).toLocaleString()}` },
          { label: 'Status', value: quote.status },
          { label: 'Prepared By', value: quote.preparedBy || 'Jane Doe' },
          { label: 'Margin %', value: `${marginPercent}%` }
        ]}
      />

      {/* Floating Action Controls */}
      <div className="fixed bottom-6 right-8 bg-slate-900/90 backdrop-blur border border-slate-800 p-3 rounded-2xl shadow-2xl flex items-center gap-2 z-40">
        <OutlineButton onClick={() => setIsPdfModalOpen(true)} className="flex items-center gap-2">
          <Printer className="h-4 w-4" /> Preview PDF
        </OutlineButton>
        <OutlineButton onClick={handleClone} className="flex items-center gap-2">
          <Copy className="h-4 w-4" /> Clone Quote
        </OutlineButton>

        {quote.status === 'Draft' && (
          <PrimaryButton onClick={() => handleStatusChange('Pending Approval', 'Submitted for manager review')} className="flex items-center gap-2">
            <Send className="h-4 w-4" /> Submit Approval
          </PrimaryButton>
        )}

        {quote.status === 'Pending Approval' && (
          <PrimaryButton onClick={() => handleStatusChange('Approved', 'Manager approval granted')} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500">
            <CheckCircle className="h-4 w-4" /> Approve Quote
          </PrimaryButton>
        )}

        {quote.status === 'Approved' && (
          <PrimaryButton onClick={() => handleStatusChange('Sent', 'Quotation emailed to customer')} className="flex items-center gap-2">
            <Send className="h-4 w-4" /> Mark Sent
          </PrimaryButton>
        )}

        {quote.status === 'Sent' && (
          <PrimaryButton onClick={() => handleStatusChange('Accepted', 'Quotation accepted by customer')} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500">
            <CheckCheck className="h-4 w-4" /> Mark Accepted
          </PrimaryButton>
        )}
      </div>

      <QuotePdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        quote={quote}
      />
    </>
  );
}
