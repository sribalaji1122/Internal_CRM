import React, { useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import OutlineButton from '../../components/buttons/OutlineButton';
import ReportService from '../../services/ReportService';
import Toast from '../../components/toast/Toast';
import {
  Download,
  Calendar,
  Mail,
  FileSpreadsheet,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function Exports() {
  const [selectedEntity, setSelectedEntity] = useState('SALES');
  const [exportFormat, setExportFormat] = useState('CSV');
  
  // Schedule state
  const [frequency, setFrequency] = useState('Weekly');
  const [emailRecipient, setEmailRecipient] = useState('executive@apexcrm.com');

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const handleExportNow = async () => {
    try {
      const res = await ReportService.exportReport({
        reportType: selectedEntity,
        format: exportFormat
      });
      if (exportFormat === 'CSV') {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${selectedEntity}_Export.csv`);
        document.body.appendChild(link);
        link.click();
      } else {
        setToast({ show: true, message: `${selectedEntity} report generated as ${exportFormat}`, type: 'success' });
      }
    } catch (err) {
      alert('Export failed');
    }
  };

  const handleScheduleReport = async (e) => {
    e.preventDefault();
    try {
      await ReportService.scheduleReport({
        reportType: selectedEntity,
        frequency,
        emailRecipient
      });
      setToast({ show: true, message: `${selectedEntity} scheduled for ${frequency} email delivery to ${emailRecipient}`, type: 'success' });
    } catch (err) {
      alert('Schedule failed');
    }
  };

  return (
    <PageContainer
      title="Export Center & Scheduled Reports"
      subtitle="Export CRM datasets, generate data dumps, and schedule recurring email deliveries"
    >
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}

      <div className="grid grid-cols-2 gap-6 text-xs text-slate-300">
        {/* On-Demand Export Wizard */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-indigo-400" />
            <h3 className="font-extrabold text-slate-100 text-sm">On-Demand Dataset Export</h3>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Select Module / Entity *</label>
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
            >
              <option value="SALES">Sales & Deals</option>
              <option value="PRODUCT">Products & Catalog</option>
              <option value="INVENTORY">Inventory Balances</option>
              <option value="QUOTE">Quotes & Proposals</option>
              <option value="CUSTOMER">Customers & Accounts</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Export Format *</label>
            <div className="grid grid-cols-3 gap-3">
              {['CSV', 'EXCEL', 'PDF'].map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setExportFormat(fmt)}
                  className={`p-2.5 rounded-lg border font-bold text-center transition-all ${
                    exportFormat === fmt
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <PrimaryButton onClick={handleExportNow} className="flex items-center gap-2">
              <Download className="h-4 w-4" /> Download Export
            </PrimaryButton>
          </div>
        </div>

        {/* Scheduled Report Delivery Manager */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-400" />
            <h3 className="font-extrabold text-slate-100 text-sm">Automated Recurring Delivery</h3>
          </div>

          <form onSubmit={handleScheduleReport} className="space-y-4">
            <div>
              <label className="block text-slate-400 mb-1">Delivery Frequency *</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
              >
                <option value="Daily">Daily (Every 24 hours)</option>
                <option value="Weekly">Weekly (Every Monday)</option>
                <option value="Monthly">Monthly (1st of Month)</option>
                <option value="Quarterly">Quarterly</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Recipient Email Address *</label>
              <input
                type="email"
                required
                value={emailRecipient}
                onChange={(e) => setEmailRecipient(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <PrimaryButton type="submit" className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500">
                <Mail className="h-4 w-4" /> Schedule Automated Email
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </PageContainer>
  );
}
