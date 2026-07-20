import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EntityDetailsLayout from '../../components/layout/EntityDetailsLayout';
import ProductService from '../../services/ProductService';
import StatusBadge from '../../components/badges/StatusBadge';
import { Package, TrendingUp, DollarSign, Layers, FileText, Activity } from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [stats, setStats] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const [pRes, statsRes, histRes, txRes] = await Promise.all([
        ProductService.getById(id),
        ProductService.getStats(id).catch(() => ({ data: { data: null } })),
        ProductService.getPriceHistory(id).catch(() => ({ data: { data: [] } })),
        ProductService.getTransactions(id).catch(() => ({ data: { data: [] } }))
      ]);
      setProduct(pRes.data.data);
      setStats(statsRes.data?.data);
      setPriceHistory(histRes.data?.data || []);
      setTransactions(txRes.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !product) {
    return (
      <div className="p-8 text-center text-slate-400">Loading Product Details...</div>
    );
  }

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="space-y-6 text-xs text-slate-300">
          {/* Product Statistics Panel */}
          {stats && (
            <div className="grid grid-cols-4 gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase">Total Sales Revenue</span>
                <p className="text-lg font-black text-indigo-400 mt-1">${(stats.totalRevenue || 0).toLocaleString()}</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase">Units Sold</span>
                <p className="text-lg font-black text-emerald-400 mt-1">{stats.totalSalesUnits || 0} Units</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase">Active Quotes / Deals</span>
                <p className="text-lg font-black text-amber-400 mt-1">{stats.activeQuotesCount || 0} Quotes / {stats.activeDealsCount || 0} Deals</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase">Inventory Value</span>
                <p className="text-lg font-black text-slate-100 mt-1">${(stats.inventoryValue || 0).toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* General Information */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
            <h4 className="font-bold text-slate-200 text-sm">Product Attributes</h4>
            <div className="grid grid-cols-3 gap-4">
              <div><span className="text-slate-500">Product Code:</span> <p className="font-semibold text-slate-200">{product.productCode}</p></div>
              <div><span className="text-slate-500">SKU:</span> <p className="font-semibold text-slate-200">{product.sku || 'N/A'}</p></div>
              <div><span className="text-slate-500">Barcode:</span> <p className="font-semibold text-slate-200">{product.barcode || 'N/A'}</p></div>
              <div><span className="text-slate-500">Category:</span> <p className="font-semibold text-indigo-400">{product.category || 'General'}</p></div>
              <div><span className="text-slate-500">Brand:</span> <p className="font-semibold text-indigo-400">{product.brand || 'Generic'}</p></div>
              <div><span className="text-slate-500">Stock Status:</span> <p className="mt-0.5"><StatusBadge status={product.stockStatus} /></p></div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'inventory',
      label: 'Inventory',
      content: (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs text-slate-300 space-y-4">
          <h4 className="font-bold text-slate-200">Stock Balance Summary</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-500">Current Stock Quantity:</span>
              <p className="text-lg font-bold text-slate-100">{product.stockQuantity || 0}</p>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-500">Reserved Quantity:</span>
              <p className="text-lg font-bold text-amber-400">{product.reservedQuantity || 0}</p>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-500">Available Quantity:</span>
              <p className="text-lg font-bold text-emerald-400">{product.availableQuantity || 0}</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'price-history',
      label: 'Price History',
      content: (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs text-slate-300">
          <h4 className="font-bold text-slate-200 mb-3">Price Modification Audit Trail</h4>
          <div className="space-y-2">
            {priceHistory.length > 0 ? (
              priceHistory.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-slate-400">{new Date(item.changedAt).toLocaleString()}</span>
                    <p className="font-semibold text-slate-200">{item.reason}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 line-through mr-2">${(item.oldPrice || 0).toLocaleString()}</span>
                    <span className="font-extrabold text-indigo-400">${(item.newPrice || 0).toLocaleString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 italic">No price modifications recorded</p>
            )}
          </div>
        </div>
      )
    },
    {
      id: 'transactions',
      label: 'Transactions',
      content: (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs text-slate-300">
          <h4 className="font-bold text-slate-200 mb-3">Inventory Movement History</h4>
          <div className="space-y-2">
            {transactions.length > 0 ? (
              transactions.map((tx, idx) => (
                <div key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-indigo-400">{tx.transactionType}</span> - <span className="text-slate-400">{tx.reason || 'Stock Movement'}</span>
                    <p className="text-[10px] text-slate-500">{new Date(tx.timestamp).toLocaleString()} by {tx.createdBy}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-200">Qty: {tx.quantity}</span>
                    <p className="text-[10px] text-slate-500">Bal: {tx.currentStock}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 italic">No inventory transactions logged</p>
            )}
          </div>
        </div>
      )
    }
  ];

  return (
    <EntityDetailsLayout
      title={product.name}
      subtitle={`Code: ${product.productCode} | SKU: ${product.sku || 'N/A'}`}
      entityType="Product"
      tabs={tabs}
      stats={[
        { label: 'Selling Price', value: `$${(product.unitPrice || 0).toLocaleString()}` },
        { label: 'Stock Balance', value: `${product.stockQuantity || 0} units` },
        { label: 'Category', value: product.category || 'General' },
        { label: 'Status', value: product.stockStatus || 'In Stock' }
      ]}
    />
  );
}
