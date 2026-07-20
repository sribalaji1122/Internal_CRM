import React, { useState, useEffect } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import OutlineButton from '../../components/buttons/OutlineButton';
import Modal from '../../components/modal/Modal';
import ReportService from '../../services/ReportService';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  ArrowRight,
  Printer,
  ChevronRight,
  TrendingUp,
  Package,
  Users
} from 'lucide-react';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('sales');
  const [salesReport, setSalesReport] = useState(null);
  const [productReport, setProductReport] = useState(null);
  const [customerReport, setCustomerReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // Drill-down Modal
  const [drillDownItem, setDrillDownItem] = useState(null);
  const [isDrillDownOpen, setIsDrillDownOpen] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, [activeTab]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'sales') {
        const res = await ReportService.getSalesReport();
        setSalesReport(res.data.data);
      } else if (activeTab === 'products') {
        const res = await ReportService.getProductReport();
        setProductReport(res.data.data);
      } else if (activeTab === 'customers') {
        const res = await ReportService.getCustomerReport();
        setCustomerReport(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const res = await ReportService.exportReport({
        reportType: activeTab.toUpperCase(),
        format
      });
      if (format === 'CSV') {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${activeTab}_Report.csv`);
        document.body.appendChild(link);
        link.click();
      } else {
        alert('PDF Export generated successfully');
      }
    } catch (err) {
      alert('Export failed');
    }
  };

  return (
    <PageContainer
      title="Business Intelligence Report Center"
      subtitle="Comprehensive analytical reports, drill-down metrics, and export utilities"
      action={
        <div className="flex items-center gap-2">
          <OutlineButton onClick={() => handleExport('CSV')} className="flex items-center gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </OutlineButton>
          <PrimaryButton onClick={() => handleExport('PDF')} className="flex items-center gap-2">
            <Printer className="h-4 w-4" /> Export PDF
          </PrimaryButton>
        </div>
      }
    >
      {/* Report Tabs */}
      <div className="flex border-b border-slate-800 mb-6 gap-6">
        <button
          onClick={() => setActiveTab('sales')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'sales'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Sales & Revenue Reports
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'products'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Product & Inventory Reports
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'customers'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Customer Intelligence Reports
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">Generating analytical report...</div>
      ) : activeTab === 'sales' && salesReport ? (
        <div className="space-y-6 text-xs text-slate-300">
          {/* Sales Report KPI Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase">Total Revenue</span>
              <p className="text-xl font-black text-indigo-400 mt-1">${(salesReport.totalRevenue || 0).toLocaleString()}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase">Deals Won</span>
              <p className="text-xl font-black text-emerald-400 mt-1">{salesReport.wonDealsCount} / {salesReport.totalDealsCount}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase">Win Rate</span>
              <p className="text-xl font-black text-amber-400 mt-1">{salesReport.winRatePercent}%</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase">Top Salesperson</span>
              <p className="text-xl font-black text-slate-100 mt-1">Jane Doe</p>
            </div>
          </div>

          {/* Revenue by Salesperson Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h4 className="font-bold text-slate-200 mb-3">Revenue Breakdown by Salesperson</h4>
            <div className="space-y-2">
              {salesReport.revenueBySalesperson.map((rep, idx) => (
                <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-200">{rep.name}</span>
                    <p className="text-[10px] text-slate-500">{rep.dealsWon} Deals Won</p>
                  </div>
                  <span className="font-extrabold text-indigo-400 text-sm">${rep.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Drill-down Deals List */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h4 className="font-bold text-slate-200 mb-3">Drill-Down: Revenue $\rightarrow$ Company $\rightarrow$ Deal</h4>
            <div className="divide-y divide-slate-800">
              {salesReport.dealsList.map((deal) => (
                <div
                  key={deal.id}
                  onClick={() => { setDrillDownItem(deal); setIsDrillDownOpen(true); }}
                  className="p-3 hover:bg-slate-800/40 flex justify-between items-center cursor-pointer transition-colors"
                >
                  <div>
                    <p className="font-bold text-slate-200 hover:text-indigo-400">{deal.dealName}</p>
                    <span className="text-[10px] text-slate-500">{deal.companyName} | Owner: {deal.owner}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-slate-100">${(deal.amount || 0).toLocaleString()}</span>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === 'products' && productReport ? (
        <div className="space-y-6 text-xs text-slate-300">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase">Total Inventory Valuation</span>
              <p className="text-xl font-black text-indigo-400 mt-1">${(productReport.totalInventoryValue || 0).toLocaleString()}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase">Low Stock Alerts</span>
              <p className="text-xl font-black text-amber-400 mt-1">{productReport.lowStockCount} Products</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase">Out of Stock Alerts</span>
              <p className="text-xl font-black text-rose-400 mt-1">{productReport.outOfStockCount} Products</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <h4 className="font-bold text-slate-200 mb-3">Top Selling Products</h4>
            <div className="space-y-2">
              {productReport.topSellingProducts.map((prod, idx) => (
                <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-200">{prod.name}</span>
                    <p className="text-[10px] text-slate-500">{prod.unitsSold} Units Sold</p>
                  </div>
                  <span className="font-extrabold text-emerald-400 text-sm">${prod.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === 'customers' && customerReport ? (
        <div className="space-y-6 text-xs text-slate-300">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase">Active Customers</span>
              <p className="text-xl font-black text-indigo-400 mt-1">{customerReport.totalCustomers} Accounts</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase">Average Order Value</span>
              <p className="text-xl font-black text-emerald-400 mt-1">${customerReport.avgOrderValue.toLocaleString()}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase">Quote Acceptance Rate</span>
              <p className="text-xl font-black text-amber-400 mt-1">{customerReport.quoteAcceptanceRate}%</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <h4 className="font-bold text-slate-200 mb-3">Top Enterprise Customers</h4>
            <div className="space-y-2">
              {customerReport.topCustomers.map((cust, idx) => (
                <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-200">{cust.companyName}</span>
                    <p className="text-[10px] text-slate-500">{cust.dealsCount} Deals | AOV: ${cust.aov.toLocaleString()}</p>
                  </div>
                  <span className="font-extrabold text-indigo-400 text-sm">${cust.totalRevenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* Drill-down Modal */}
      <Modal isOpen={isDrillDownOpen} onClose={() => setIsDrillDownOpen(false)} title="Drill-Down Entity Details">
        {drillDownItem && (
          <div className="space-y-4 text-xs text-slate-300">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <span className="text-[10px] text-indigo-400 font-extrabold uppercase">Deal Overview</span>
              <p className="font-bold text-slate-100 text-sm">{drillDownItem.dealName}</p>
              <p className="text-slate-400">Company: {drillDownItem.companyName}</p>
              <p className="text-slate-400">Amount: ${(drillDownItem.amount || 0).toLocaleString()}</p>
              <p className="text-slate-400">Stage: {drillDownItem.stage} | Status: {drillDownItem.status}</p>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <span className="text-[10px] text-emerald-400 font-extrabold uppercase">Associated Quote & Product Breakdown</span>
              <p className="text-slate-300 font-semibold">Quote QUOTE-10001 (Rev v1)</p>
              <p className="text-slate-500">Products: 3HP AC Motor x 4 units ($5,800)</p>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
