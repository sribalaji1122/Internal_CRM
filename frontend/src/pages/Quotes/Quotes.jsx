import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import OutlineButton from '../../components/buttons/OutlineButton';
import StatusBadge from '../../components/badges/StatusBadge';
import Pagination from '../../components/pagination/Pagination';
import Modal from '../../components/modal/Modal';
import Toast from '../../components/toast/Toast';
import QuoteService from '../../services/QuoteService';
import {
  FileText,
  Plus,
  Search,
  CheckCircle,
  Clock,
  Archive,
  Send,
  Printer
} from 'lucide-react';

export default function Quotes() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    companyName: '',
    contactName: '',
    validUntil: '',
    termsAndConditions: 'Standard 30 days payment terms apply.',
    shipping: 0
  });

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetchQuotes();
  }, [currentPage, search, selectedStatus]);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const res = await QuoteService.getAll({
        search,
        status: selectedStatus,
        page: currentPage,
        limit: 10
      });
      setQuotes(res.data.data || []);
      if (res.data.pagination) {
        setTotalPages(res.data.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(quotes.map(q => q.id || q._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleCreateQuote = async (e) => {
    e.preventDefault();
    try {
      await QuoteService.create(formData);
      setIsCreateModalOpen(false);
      setToast({ show: true, message: 'Quote created successfully', type: 'success' });
      fetchQuotes();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create quote');
    }
  };

  const handleBulkApprove = async () => {
    try {
      await QuoteService.bulkApprove(selectedIds, 'Jane Doe');
      setSelectedIds([]);
      setToast({ show: true, message: 'Selected quotes approved', type: 'success' });
      fetchQuotes();
    } catch (err) {
      alert('Bulk approval failed');
    }
  };

  return (
    <PageContainer
      title="Quotes & Commercial Proposals"
      subtitle="Manage quotations, version history, multi-level approvals, and PDF exports"
      action={
        <PrimaryButton onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Create Quote
        </PrimaryButton>
      }
    >
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}

      {/* Filter Bar */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search Quote # or Subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Approved">Approved</option>
            <option value="Sent">Sent</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
            <option value="Expired">Expired</option>
          </select>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 bg-indigo-950/60 border border-indigo-800/60 px-3 py-1.5 rounded-lg">
            <span className="text-xs text-indigo-300 font-semibold">{selectedIds.length} Selected</span>
            <button
              onClick={handleBulkApprove}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold px-2 py-1 bg-emerald-950/50 rounded flex items-center gap-1"
            >
              <CheckCircle className="h-3 w-3" /> Approve Bulk
            </button>
          </div>
        )}
      </div>

      {/* Quotes Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-[10px] uppercase tracking-wider text-slate-400">
              <th className="py-3 px-4 w-8">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedIds.length > 0 && selectedIds.length === quotes.length}
                />
              </th>
              <th className="py-3 px-4">Quote Info</th>
              <th className="py-3 px-4">Customer Details</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Grand Total</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr><td colSpan={6} className="py-8 text-center text-slate-500">Loading quotes...</td></tr>
            ) : quotes.length === 0 ? (
              <tr><td colSpan={6} className="py-8 text-center text-slate-500">No quotes found</td></tr>
            ) : (
              quotes.map((quote) => (
                <tr
                  key={quote.id || quote._id}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                  onClick={() => navigate(`/quotes/${quote.id || quote._id}`)}
                >
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(quote.id || quote._id)}
                      onChange={() => handleSelectOne(quote.id || quote._id)}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center text-indigo-400 font-bold">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-100 hover:text-indigo-400">{quote.quoteNumber}</p>
                        <p className="text-[10px] text-slate-400">{quote.subject}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    <p className="font-semibold">{quote.companyName || 'General Client'}</p>
                    <span className="text-[10px] text-slate-500">{quote.contactName || ''}</span>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={quote.status} />
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-indigo-400 text-sm">
                    ${(quote.grandTotal || 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/quotes/${quote.id || quote._id}`)}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="p-4 border-t border-slate-800">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>

      {/* Create Quote Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Quotation">
        <form onSubmit={handleCreateQuote} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Quote Subject *</label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
              placeholder="e.g. Industrial Motor Supply Proposal"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Company Name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                placeholder="Acme Corp"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Contact Person</label>
              <input
                type="text"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                placeholder="John Smith"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Valid Until Date</label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Shipping Fee ($)</label>
              <input
                type="number"
                value={formData.shipping}
                onChange={(e) => setFormData({ ...formData, shipping: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <OutlineButton type="button" onClick={() => setIsCreateModalOpen(false)}>Cancel</OutlineButton>
            <PrimaryButton type="submit">Create Draft Quote</PrimaryButton>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
}
