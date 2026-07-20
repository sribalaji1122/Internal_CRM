import React, { useState, useEffect } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import OutlineButton from '../../components/buttons/OutlineButton';
import AnalyticsService from '../../services/AnalyticsService';
import {
  PieChart,
  TrendingUp,
  RefreshCw,
  Award,
  Layers,
  DollarSign,
  UserCheck
} from 'lucide-react';

export default function RoleDashboards() {
  const [activeRole, setActiveRole] = useState('CEO');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoleDashboard();
  }, [activeRole]);

  const fetchRoleDashboard = async () => {
    try {
      setLoading(true);
      const res = await AnalyticsService.getRoleDashboard(activeRole);
      setDashboardData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const roles = ['CEO', 'Sales Manager', 'Inventory Manager', 'Finance', 'Support'];

  return (
    <PageContainer
      title="Role-Based Executive BI Dashboards"
      subtitle="Tailored analytics, specialized KPIs, and interactive visual charts per executive role"
      action={
        <OutlineButton onClick={fetchRoleDashboard} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh Real-Time
        </OutlineButton>
      }
    >
      {/* Role Selector Tabs */}
      <div className="flex border-b border-slate-800 mb-6 gap-3 overflow-x-auto pb-1">
        {roles.map((r) => (
          <button
            key={r}
            onClick={() => setActiveRole(r)}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeRole === r
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {loading || !dashboardData ? (
        <div className="p-12 text-center text-slate-500">Loading {activeRole} Dashboard metrics...</div>
      ) : (
        <div className="space-y-6 text-xs text-slate-300">
          <h3 className="font-extrabold text-slate-100 text-base">{dashboardData.roleName}</h3>

          {/* Role-Specific KPI Cards */}
          <div className="grid grid-cols-4 gap-4">
            {dashboardData.kpis.map((kpi, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase">{kpi.title}</span>
                <p className="text-xl font-black text-slate-100 mt-1">{kpi.value}</p>
                <span className={`text-[10px] font-bold mt-1 block ${kpi.trend === 'up' ? 'text-emerald-400' : kpi.trend === 'down' ? 'text-rose-400' : 'text-slate-400'}`}>
                  {kpi.change}
                </span>
              </div>
            ))}
          </div>

          {/* Visualization Component */}
          {dashboardData.primaryChart && (
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <h4 className="font-bold text-slate-200 text-sm mb-4">{dashboardData.primaryChart.title}</h4>
              
              {/* Render Bar / Line / Donut Chart Layout */}
              <div className="h-64 flex items-end justify-around border-b border-slate-800 pb-4 pt-8 gap-4 px-6">
                {dashboardData.primaryChart.data.map((item, idx) => {
                  const maxVal = Math.max(...dashboardData.primaryChart.data.map(d => d.value || d.revenue || 1));
                  const val = item.value || item.revenue || 0;
                  const heightPercent = Math.max(15, Math.round((val / maxVal) * 100));

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <span className="text-[10px] font-bold text-indigo-400">${val.toLocaleString()}</span>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full max-w-[48px] bg-gradient-to-t from-indigo-600 to-violet-500 rounded-t-lg shadow-lg shadow-indigo-600/20 transition-all duration-500 hover:brightness-125"
                      />
                      <span className="text-[10px] text-slate-400 font-semibold">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
}
