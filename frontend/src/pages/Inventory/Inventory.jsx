import React, { useState, useEffect } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import OutlineButton from '../../components/buttons/OutlineButton';
import StatusBadge from '../../components/badges/StatusBadge';
import Modal from '../../components/modal/Modal';
import Toast from '../../components/toast/Toast';
import InventoryService from '../../services/InventoryService';
import ProductService from '../../services/ProductService';
import {
  Layers,
  AlertTriangle,
  PackageX,
  Lock,
  ArrowUpRight,
  TrendingDown,
  Plus,
  MinusCircle
} from 'lucide-react';

export default function Inventory() {
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [transactionType, setTransactionType] = useState('Purchase');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const [sumRes, prodRes] = await Promise.all([
        InventoryService.getSummary(),
        ProductService.getAll({ limit: 50 })
      ]);
      setSummary(sumRes.data.data);
      setProducts(prodRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStockAdjustment = async (e) => {
    e.preventDefault();
    try {
      await InventoryService.adjustStock({
        productId: selectedProductId,
        transactionType,
        quantity,
        reason
      });
      setIsAdjustModalOpen(false);
      setToast({ show: true, message: 'Stock adjusted successfully', type: 'success' });
      fetchInventoryData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to adjust stock');
    }
  };

  return (
    <PageContainer
      title="Inventory Management"
      subtitle="Monitor stock balances, reserved inventory, and record stock adjustments"
      action={
        <PrimaryButton onClick={() => setIsAdjustModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Stock Adjustment
        </PrimaryButton>
      }
    >
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}

      {/* Inventory Dashboard Widgets */}
      {summary && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-slate-500">Total Inventory Value</span>
              <Layers className="h-4 w-4 text-indigo-400" />
            </div>
            <p className="text-xl font-black text-slate-100 mt-2">${(summary.totalInventoryValue || 0).toLocaleString()}</p>
            <span className="text-[10px] text-slate-500 mt-1 block">{summary.totalProductsCount} Catalog Items</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-slate-500">Low Stock Alerts</span>
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-xl font-black text-amber-400 mt-2">{summary.lowStockCount || 0} Items</p>
            <span className="text-[10px] text-slate-500 mt-1 block">Requires Reorder</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-slate-500">Out of Stock Count</span>
              <PackageX className="h-4 w-4 text-rose-400" />
            </div>
            <p className="text-xl font-black text-rose-400 mt-2">{summary.outOfStockCount || 0} Items</p>
            <span className="text-[10px] text-slate-500 mt-1 block">Stock Exhausted</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-slate-500">Reserved Inventory</span>
              <Lock className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-xl font-black text-emerald-400 mt-2">{summary.totalReservedStock || 0} Units</p>
            <span className="text-[10px] text-slate-500 mt-1 block">Locked for Deals</span>
          </div>
        </div>
      )}

      {/* Stock Balances Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-slate-200 text-sm">Stock Balances & Status</h3>
        </div>
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-[10px] uppercase tracking-wider text-slate-400">
              <th className="py-3 px-4">Product Details</th>
              <th className="py-3 px-4 text-center">Physical Stock</th>
              <th className="py-3 px-4 text-center">Reserved</th>
              <th className="py-3 px-4 text-center">Available</th>
              <th className="py-3 px-4">Stock Status</th>
              <th className="py-3 px-4 text-right">Unit Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr><td colSpan={6} className="py-8 text-center text-slate-500">Loading inventory...</td></tr>
            ) : products.map((p) => (
              <tr key={p.id || p._id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4">
                  <p className="font-bold text-slate-200">{p.name}</p>
                  <span className="text-[10px] text-slate-500">SKU: {p.sku || p.productCode}</span>
                </td>
                <td className="py-3 px-4 text-center font-bold text-slate-100">{p.stockQuantity || 0}</td>
                <td className="py-3 px-4 text-center font-bold text-amber-400">{p.reservedQuantity || 0}</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-400">{p.availableQuantity || 0}</td>
                <td className="py-3 px-4"><StatusBadge status={p.stockStatus} /></td>
                <td className="py-3 px-4 text-right font-semibold text-slate-300">${(p.unitPrice || 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stock Adjustment Modal */}
      <Modal isOpen={isAdjustModalOpen} onClose={() => setIsAdjustModalOpen(false)} title="Stock Adjustment">
        <form onSubmit={handleStockAdjustment} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Select Product *</label>
            <select
              required
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
            >
              <option value="">-- Choose Product --</option>
              {products.map(p => (
                <option key={p.id || p._id} value={p.id || p._id}>{p.name} (Stock: {p.stockQuantity})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Transaction Type *</label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
              >
                <option value="Purchase">Purchase (Add Stock)</option>
                <option value="Return">Return (Add Stock)</option>
                <option value="Sale">Sale (Deduct Stock)</option>
                <option value="Adjustment">Adjustment (Deduct Stock)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Quantity *</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Reason / Notes</label>
            <input
              type="text"
              placeholder="e.g. Supplier Shipment Received"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <OutlineButton type="button" onClick={() => setIsAdjustModalOpen(false)}>Cancel</OutlineButton>
            <PrimaryButton type="submit">Submit Adjustment</PrimaryButton>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
}
