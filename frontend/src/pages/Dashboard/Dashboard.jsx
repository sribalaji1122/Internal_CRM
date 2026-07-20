import Modal from '../../components/modal/Modal';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import SectionCard from '../../components/cards/SectionCard';
import StatusBadge from '../../components/badges/StatusBadge';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import OutlineButton from '../../components/buttons/OutlineButton';
import DashboardService from '../../services/DashboardService';
import CompanyService from '../../services/CompanyService';
import DocumentService from '../../services/DocumentService';
import CompanyRelationshipTree from '../../components/common/CompanyRelationshipTree';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadialBarChart,
  RadialBar
} from 'recharts';
import {
  Target,
  Users,
  Calendar,
  Megaphone,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Clock,
  AlertCircle,
  RefreshCw,
  Video,
  Phone,
  MapPin,
  Link,
  FileText,
  User,
  Activity,
  ArrowRight,
  PlusCircle,
  Building2,
  DollarSign,
  CheckCircle,
  XCircle,
  CheckSquare,
  Flag,
  CalendarDays
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tree Widget State
  const [widgetCompany, setWidgetCompany] = useState(null);
  const [widgetTreeData, setWidgetTreeData] = useState({
    leads: [],
    contacts: [],
    deals: [],
    meetings: [],
    campaigns: [],
    documents: [],
    activity: []
  });
  const [widgetLoading, setWidgetLoading] = useState(false);

  // Quick view detail modals
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);

  // Fetch all dashboard stats
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await DashboardService.getOverview();
      if (response.data?.success) {
        setData(response.data.data);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch dashboard metrics');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Failed to load enterprise dashboard analytics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle company tree selection widget
  const handleWidgetCompanyChange = async (e) => {
    const companyId = e.target.value;
    if (!companyId) {
      setWidgetCompany(null);
      return;
    }
    const found = data.companyRelationshipWidget.find(c => c._id === companyId);
    setWidgetCompany(found);
    setWidgetLoading(true);
    try {
      const [leadsRes, contactsRes, dealsRes, meetingsRes, campaignsRes, docsRes, actRes] = await Promise.all([
        CompanyService.getLeads(companyId, { limit: 50 }),
        CompanyService.getContacts(companyId, { limit: 50 }),
        CompanyService.getDeals(companyId, { limit: 50 }),
        CompanyService.getMeetings(companyId, { limit: 50 }),
        CompanyService.getCampaigns(companyId, { limit: 50 }),
        DocumentService.getDocuments('Company', companyId),
        CompanyService.getActivity(companyId, { limit: 50 })
      ]);
      setWidgetTreeData({
        leads: leadsRes.data?.data || [],
        contacts: contactsRes.data?.data || [],
        deals: dealsRes.data?.data || [],
        meetings: meetingsRes.data?.data || [],
        campaigns: campaignsRes.data?.data || [],
        documents: docsRes.data?.data || [],
        activity: actRes.data?.data || []
      });
    } catch (err) {
      console.error('Failed to fetch tree widget data', err);
    } finally {
      setWidgetLoading(false);
    }
  };

  // Chart Colors
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899'];

  if (loading) {
    return (
      <PageContainer>
        <PageHeader
          title="Executive Dashboard"
          description="Retrieving aggregated CRM records and loading live business intelligence analytics..."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white border border-slate-150 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-3 w-20 bg-slate-200 rounded" />
                <div className="h-9 w-9 bg-slate-200 rounded-xl" />
              </div>
              <div className="h-8 w-16 bg-slate-200 rounded" />
              <div className="h-3.5 w-32 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <div className="animate-pulse bg-white border border-slate-150 rounded-2xl p-5 h-72" />
          <div className="animate-pulse bg-white border border-slate-150 rounded-2xl p-5 h-72" />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Executive Dashboard" description="Live pipeline tracking dashboard." />
        <div className="flex flex-col items-center justify-center border border-rose-100 bg-rose-50/20 rounded-2xl p-10 text-center max-w-xl mx-auto my-12">
          <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
          <h3 className="font-bold text-slate-800 text-base">Failed to load CRM stats</h3>
          <p className="text-xs text-rose-600/80 mt-1 max-w-sm leading-relaxed">{error}</p>
          <OutlineButton onClick={fetchDashboardData} className="mt-5 flex items-center gap-2 border-rose-200 text-rose-700 hover:bg-rose-50">
            <RefreshCw className="h-4 w-4" />
            Retry Connection
          </OutlineButton>
        </div>
      </PageContainer>
    );
  }

  // Prepping Chart Data
  const leadFunnelData = Object.entries(data?.leadFunnel || {}).map(([stage, count]) => ({
    name: stage,
    value: count
  }));

  const campaignStatusData = Object.entries(data?.campaignStatus || {}).map(([status, count]) => ({
    name: status,
    value: count
  }));

  const meetingsTypeData = Object.entries(data?.meetingsByType || {}).map(([type, count]) => ({
    name: type,
    meetings: count
  }));

  const dealConversionData = [
    { name: 'Rate', value: data.dealConversionRate, fill: '#10b981' },
    { name: 'Remaining', value: 100 - data.dealConversionRate, fill: '#f1f5f9' }
  ];

  // Re-organize KPI Overview Cards (8 counts)
  const kpis = [
    { title: 'Total Leads', val: data.totalLeads, desc: `${data.qualifiedLeads} Qualified leads`, icon: Target, color: 'text-indigo-500 bg-indigo-50 border-indigo-100', trend: 'Live' },
    { title: 'Total Contacts', val: data.totalContacts, desc: `${data.convertedLeads} Converted`, icon: Users, color: 'text-emerald-500 bg-emerald-50 border-emerald-100', trend: 'CRM' },
    { title: 'Meetings', val: data?.totalMeetings || 0, desc: `${data?.upcomingMeetings?.length || 0} Scheduled`, icon: Calendar, color: 'text-amber-500 bg-amber-50 border-amber-100', trend: 'Active' },
    { title: 'Campaigns', val: data.totalCampaigns, desc: `${data.activeCampaigns} Active`, icon: Megaphone, color: 'text-purple-500 bg-purple-50 border-purple-100', trend: 'Running' },
    { title: 'Companies', val: data.totalCompanies ?? 0, desc: 'Accounts', icon: Building2, color: 'text-sky-500 bg-sky-50 border-sky-100', trend: 'Active' },
    { title: 'Open Deals', val: data.openDeals ?? 0, desc: 'Opportunities', icon: TrendingUp, color: 'text-orange-500 bg-orange-50 border-orange-100', trend: 'Pipeline' },
    { title: 'Won Deals', val: data.wonDeals ?? 0, desc: `${data.lostDeals ?? 0} Lost`, icon: CheckCircle, color: 'text-emerald-500 bg-emerald-50 border-emerald-100', trend: 'Won' },
    { title: 'Deal Value', val: `$${((data.totalDealValue ?? 0) / 1000).toFixed(1)}K`, desc: 'Total Pipeline', icon: DollarSign, color: 'text-rose-500 bg-rose-50 border-rose-100', trend: 'Revenue' }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Executive Dashboard"
        description="Monitor real-time pipeline funnel conversions, campaign outreach, and client meeting tasks."
        actions={
          <OutlineButton onClick={fetchDashboardData} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Analytics
          </OutlineButton>
        }
      />

      {/* 1. KPI Stats Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {kpis.map((card) => {
          const Icon = card.icon;
          return (
            <SectionCard key={card.title} hoverable className="p-0 border-slate-150">
              <div className="flex items-center justify-between p-5 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{card.title}</span>
                <div className={`p-2 rounded-xl border ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="px-5 pb-5">
                <h3 className="text-3xl font-extrabold tracking-tight text-slate-800">{card.val}</h3>
                <p className="mt-1.5 text-xs text-slate-450 flex items-center gap-1 font-semibold">
                  <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                    <ArrowUpRight className="h-3 w-3" />{card.trend}
                  </span>
                  {card.desc}
                </p>
              </div>
            </SectionCard>
          );
        })}
      </div>

      {/* 2. Executive Analytics Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {/* Revenue by Pipeline (Recharts Bar) */}
        <SectionCard title="Revenue by Pipeline">
          <div className="h-60 mt-2">
            {(data?.revenueByPipeline || []).length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-16">No active pipeline data</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.revenueByPipeline || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} fontWeight="bold" />
                  <YAxis stroke="#94a3b8" fontSize={9} fontWeight="bold" />
                  <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Bar dataKey="value" name="Pipeline Value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </SectionCard>

        {/* Deals by Stage (Recharts Donut) */}
        <SectionCard title="Deals by Stage">
          <div className="h-60 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.pipelineSummary || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="stage"
                >
                  {(data?.pipelineSummary || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 9, fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Deal Conversion Rate Gauge */}
        <SectionCard title="Deal Conversion Rate">
          <div className="h-60 mt-2 flex flex-col justify-center items-center">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dealConversionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={80}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#f1f5f9" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <span className="text-3xl font-extrabold text-slate-800">{data?.dealConversionRate || 0}%</span>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Won Deals</p>
              </div>
            </div>
            <p className="text-[10px] text-slate-450 mt-2 font-semibold">Won vs. Lost deal conversions</p>
          </div>
        </SectionCard>

        {/* Monthly Revenue Trend */}
        <SectionCard title="Monthly Revenue Trend (Won)">
          <div className="h-60 mt-2">
            {(data?.monthlyRevenueTrend || []).length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-16">No revenue trend history</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.monthlyRevenueTrend || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={9} fontWeight="bold" />
                  <YAxis stroke="#94a3b8" fontSize={9} fontWeight="bold" />
                  <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Area type="monotone" dataKey="revenue" name="Total Revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </SectionCard>

        {/* Sales Funnel stages count */}
        <SectionCard title="Sales Pipeline Funnel">
          <div className="h-60 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.salesFunnel || []} layout="vertical" margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={9} fontWeight="bold" />
                <YAxis dataKey="stage" type="category" stroke="#94a3b8" fontSize={9} fontWeight="bold" width={80} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="count" name="Opportunities" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Tasks Due Today (Checklist Placeholder) */}
        <SectionCard title="Tasks Due Today">
          <div className="h-60 overflow-y-auto mt-2 space-y-2.5 pr-1 text-xs">
            {(data?.tasksDueToday || []).map((task) => (
              <div key={task._id} className="flex items-start gap-3 p-2.5 border border-slate-150 rounded-xl bg-slate-50/40 hover:bg-slate-50 transition-colors">
                <input type="checkbox" className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 truncate">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border ${task.priority === 'Critical' ? 'bg-rose-50 border-rose-100 text-rose-600' :
                      task.priority === 'High' ? 'bg-orange-50 border-orange-100 text-orange-600' :
                        'bg-slate-50 border-slate-100 text-slate-550'
                      }`}>{task.priority}</span>
                    <span className="text-[9px] text-slate-400 font-semibold">{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* 3. Company Relationship Tree widget explorer */}
      {data.companyRelationshipWidget && data.companyRelationshipWidget.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-3 mb-6">
          <SectionCard title="Company Relationship Tree Explorer" className="lg:col-span-3">
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-150 rounded-xl p-3 max-w-md">
                <Building2 className="h-5 w-5 text-indigo-500 shrink-0" />
                <div className="flex-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Select Account</label>
                  <select
                    onChange={handleWidgetCompanyChange}
                    className="w-full text-xs font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
                  >
                    <option value="">Choose a company account...</option>
                    {data.companyRelationshipWidget.map((c) => (
                      <option key={c._id} value={c._id}>{c.companyName} ({c.companyCode})</option>
                    ))}
                  </select>
                </div>
              </div>

              {widgetLoading ? (
                <div className="flex h-36 items-center justify-center text-xs text-slate-400 italic">Building relationship map...</div>
              ) : widgetCompany ? (
                <div className="p-1">
                  <CompanyRelationshipTree
                    company={widgetCompany}
                    leads={widgetTreeData.leads}
                    contacts={widgetTreeData.contacts}
                    deals={widgetTreeData.deals}
                    meetings={widgetTreeData.meetings}
                    campaigns={widgetTreeData.campaigns}
                    documents={widgetTreeData.documents}
                    activities={widgetTreeData.activity}
                  />
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-6 pl-2 border border-dashed border-slate-200 rounded-xl">
                  Select a company from the selector above to visualize its Leads, Contacts, Deals, Meetings, Campaigns, and Activities in an interactive relationship map.
                </p>
              )}
            </div>
          </SectionCard>
        </div>
      )}

      {/* 4. Tables and Operations Grid */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* Top Companies Table */}
        <SectionCard title="Top Companies by Revenue">
          {data.topCompanies.length === 0 ? (
            <p className="text-xs text-slate-405 italic py-6 text-center">No companies recorded</p>
          ) : (
            <div className="overflow-x-auto text-xs">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-slate-150 text-slate-450 uppercase font-bold tracking-wider">
                    <th className="py-2 px-3">Company</th>
                    <th className="py-2 px-3">Industry</th>
                    <th className="py-2 px-3 text-right">Annual Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                  {data.topCompanies.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-slate-800">{c.companyName}</td>
                      <td className="py-2.5 px-3 text-slate-500">{c.industry}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-700 font-bold">
                        {c.annualRevenue ? `$${Number(c.annualRevenue).toLocaleString()}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        {/* Recently Won Deals */}
        <SectionCard title="Recently Won Deals">
          {data.recentlyWonDeals.length === 0 ? (
            <p className="text-xs text-slate-405 italic py-6 text-center">No won deals recorded</p>
          ) : (
            <div className="overflow-x-auto text-xs">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-slate-150 text-slate-450 uppercase font-bold tracking-wider">
                    <th className="py-2 px-3">Deal</th>
                    <th className="py-2 px-3">Company</th>
                    <th className="py-2 px-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                  {data.recentlyWonDeals.map((d) => (
                    <tr key={d._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-slate-800">{d.dealName}</td>
                      <td className="py-2.5 px-3 text-slate-500">{d.companyId?.companyName || '—'}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-700 font-bold">
                        ${Number(d.dealValue || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </div>

      {/* 5. Bottom Section: Meeting, Recent Companies, Activity Logs */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        {/* Upcoming Meetings */}
        <SectionCard title="Upcoming Meetings Schedule">
          {data.upcomingMeetings.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-6">No scheduled meetings.</p>
          ) : (
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {data.upcomingMeetings.map((meeting) => (
                <div
                  key={meeting._id}
                  onClick={() => setSelectedMeeting(meeting)}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-155 bg-slate-50/40 hover:bg-slate-50 transition-all cursor-pointer shadow-sm text-xs"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <Clock className="h-4 w-4 text-slate-405 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-800 truncate">{meeting.title}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1">
                        {new Date(meeting.meetingDate).toLocaleDateString()} @ {meeting.startTime}
                      </p>
                      <p className="text-[9px] text-indigo-650 font-bold mt-0.5">{meeting.relatedName}</p>
                    </div>
                  </div>
                  <StatusBadge status={meeting.status} />
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Recent Activity Log Feed */}
        <SectionCard title="Unified Activity Log" className="lg:col-span-2">
          {data.recentActivity.length === 0 ? (
            <p className="text-xs text-slate-405 italic py-6 text-center">No recent activities log.</p>
          ) : (
            <div className="flow-root max-h-[320px] overflow-y-auto pr-1 text-xs">
              <ul className="-mb-8">
                {(data?.recentActivity || []).map((item, idx) => (
                  <li key={item.id || item._id || idx}>
                    <div className="relative pb-5">
                      {idx !== data.recentActivity.length - 1 && (
                        <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-100" aria-hidden="true" />
                      )}
                      <div className="relative flex space-x-3 items-start">
                        <div className="shrink-0">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-sm text-[10px] font-bold">
                            {item.actor[0]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <p className="text-xs text-slate-655 leading-relaxed font-semibold">
                                <span className="font-bold text-slate-800">{item.actor}</span> {item.action}
                              </p>
                              <span className="mt-1 inline-flex px-1.5 py-0.2 text-[8px] font-bold uppercase rounded border bg-indigo-50/50 text-indigo-650 border-indigo-100">
                                {item.target}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">
                              {new Date(item.time).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </SectionCard>
      </div>

      {/* ═══════════════════ PHASE 13B: TASK & CALENDAR WIDGETS ═══════════════════ */}
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">

        {/* Today's Tasks */}
        <SectionCard title="Today's Tasks" icon={CheckSquare}>
          {data?.todayTasksList?.length > 0 ? (
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {data.todayTasksList.map((task, idx) => {
                const pColor = task.priority === 'Critical' ? 'bg-red-500' : task.priority === 'High' ? 'bg-orange-500' : task.priority === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500';
                return (
                  <div key={idx} className="flex items-center gap-3 px-3 py-2 bg-slate-800/40 rounded-lg border border-slate-700/50 hover:bg-slate-800/60 transition-colors cursor-pointer" onClick={() => navigate('/tasks')}>
                    <div className={`h-2 w-2 rounded-full shrink-0 ${pColor}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-200 truncate">{task.title}</p>
                      <p className="text-[10px] text-slate-500">{task.companyId?.companyName || task.dealId?.dealName || task.type}</p>
                    </div>
                    <span className="text-[10px] text-slate-600 shrink-0">{task.priority}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-4 text-center">No tasks due today 🎉</p>
          )}
        </SectionCard>

        {/* Overdue Tasks */}
        <SectionCard title="Overdue Tasks" icon={AlertCircle}>
          {data?.overdueTasksList?.length > 0 ? (
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {data.overdueTasksList.map((task, idx) => (
                <div key={idx} className="flex items-center gap-3 px-3 py-2 bg-red-500/5 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition-colors cursor-pointer" onClick={() => navigate('/tasks')}>
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">{task.title}</p>
                    <p className="text-[10px] text-red-400">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                  </div>
                  <span className="text-[10px] text-slate-600 shrink-0">{task.priority}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-4 text-center">No overdue tasks ✅</p>
          )}
        </SectionCard>

        {/* Task Completion Rate */}
        <SectionCard title="Task Completion Rate" icon={TrendingUp}>
          <div className="flex flex-col items-center justify-center py-2">
            <ResponsiveContainer width="100%" height={140}>
              <RadialBarChart
                innerRadius="60%"
                outerRadius="100%"
                data={[{ value: data?.taskCompletionRate || 0, fill: '#6366f1' }]}
                startAngle={180}
                endAngle={0}
              >
                <RadialBar dataKey="value" cornerRadius={10} background={{ fill: '#1e293b' }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="-mt-10 text-center">
              <span className="text-3xl font-extrabold text-indigo-400">{data?.taskCompletionRate || 0}%</span>
              <p className="text-[10px] text-slate-500 mt-1">{data?.completedTasksCount || 0} of {data?.totalTasks || 0} tasks completed</p>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Task by Assignee + Upcoming Tasks + Calendar Today */}
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">

        {/* Tasks by Assignee */}
        <SectionCard title="Tasks by Assignee" icon={User}>
          {data?.tasksByAssignee?.length > 0 ? (
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {data.tasksByAssignee.map((a, idx) => (
                <div key={idx} className="flex items-center gap-3 px-3 py-2 bg-slate-800/40 rounded-lg border border-slate-700/50">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-[10px] text-white font-bold shrink-0">
                    {a._id?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">{a._id || 'Unassigned'}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${a.total > 0 ? (a.completed / a.total) * 100 : 0}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-500">{a.completed}/{a.total}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-4 text-center">No task data available.</p>
          )}
        </SectionCard>

        {/* Upcoming Tasks */}
        <SectionCard title="Upcoming Tasks (7 days)" icon={Clock}>
          {data?.upcomingTasksList?.length > 0 ? (
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {data.upcomingTasksList.map((task, idx) => (
                <div key={idx} className="flex items-center gap-3 px-3 py-2 bg-slate-800/40 rounded-lg border border-slate-700/50 hover:bg-slate-800/60 transition-colors cursor-pointer" onClick={() => navigate('/tasks')}>
                  <Calendar className="h-4 w-4 text-amber-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">{task.title}</p>
                    <p className="text-[10px] text-slate-500">Due {new Date(task.dueDate).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={task.priority} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-4 text-center">No upcoming tasks.</p>
          )}
        </SectionCard>

        {/* Calendar Today Preview */}
        <SectionCard title="Calendar Today" icon={CalendarDays}>
          {data?.calendarToday?.length > 0 ? (
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {data.calendarToday.map((evt, idx) => (
                <div key={idx} className="flex items-center gap-3 px-3 py-2 bg-slate-800/40 rounded-lg border border-slate-700/50 hover:bg-slate-800/60 transition-colors cursor-pointer" onClick={() => navigate('/calendar')}>
                  <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: evt.color || '#6366f1' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">{evt.title}</p>
                    <p className="text-[10px] text-slate-500">{evt.entityType} • {evt.allDay ? 'All day' : new Date(evt.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <span className="text-[10px] text-slate-600">{evt.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-4 text-center">No events today.</p>
          )}
        </SectionCard>
      </div>

      {/* ===================== PHASE 13B.1 FOUNDATION WIDGETS ===================== */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Sales Funnel Breakdown */}
        <SectionCard title="Sales Funnel Pipeline" icon={TrendingUp}>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.pipelineSummary || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="stage" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="totalValue" name="Pipeline Value ($)" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Revenue by Product (Foundation) */}
        <SectionCard title="Revenue by Product Category" icon={DollarSign}>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.revenueByProduct || [
                    { name: 'AC Motors', revenue: 14500 },
                    { name: 'Water Pumps', revenue: 11200 },
                    { name: 'Speed Drives', revenue: 8900 },
                    { name: 'Controllers', revenue: 6400 }
                  ]}
                  dataKey="revenue"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      {/* Top Products & Low Stock Alerts */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Top Products (Placeholder / Foundation) */}
        <SectionCard title="Top Products & Inventory" icon={Building2}>
          <div className="space-y-2 max-h-[220px] overflow-y-auto">
            <div className="flex items-center justify-between px-3 py-2 bg-slate-800/40 rounded-lg border border-slate-700/50">
              <div>
                <p className="text-sm font-semibold text-slate-200">3HP AC Motor (PROD-0001)</p>
                <p className="text-[10px] text-slate-500">Industrial Equipment • Stock: 42</p>
              </div>
              <span className="text-xs font-bold text-emerald-400">$1,450 / unit</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 bg-slate-800/40 rounded-lg border border-slate-700/50">
              <div>
                <p className="text-sm font-semibold text-slate-200">Industrial Water Pump (PROD-0002)</p>
                <p className="text-[10px] text-slate-500">Fluid Control • Stock: 18</p>
              </div>
              <span className="text-xs font-bold text-emerald-400">$2,800 / unit</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 bg-slate-800/40 rounded-lg border border-slate-700/50">
              <div>
                <p className="text-sm font-semibold text-slate-200">Variable Speed Drive (PROD-0003)</p>
                <p className="text-[10px] text-slate-500">Automation • Stock: 5</p>
              </div>
              <span className="text-xs font-bold text-emerald-400">$890 / unit</span>
            </div>
          </div>
        </SectionCard>

        {/* Recent Quotes & Conversion */}
        <SectionCard title="Recent Quotes & Approval Pipeline" icon={FileText}>
          <div className="space-y-2 max-h-[220px] overflow-y-auto">
            <div className="flex items-center justify-between px-3 py-2 bg-slate-800/40 rounded-lg border border-slate-700/50">
              <div>
                <p className="text-sm font-semibold text-slate-200">QUOTE-000101 • Acme Industrial Expansion</p>
                <p className="text-[10px] text-slate-500">Value: $24,500 • Valid until Aug 15</p>
              </div>
              <StatusBadge status="Approved" />
            </div>
            <div className="flex items-center justify-between px-3 py-2 bg-slate-800/40 rounded-lg border border-slate-700/50">
              <div>
                <p className="text-sm font-semibold text-slate-200">QUOTE-000102 • Global Tech Motors Order</p>
                <p className="text-[10px] text-slate-500">Value: $12,800 • Pending Manager Approval</p>
              </div>
              <StatusBadge status="In Progress" />
            </div>
            <div className="flex items-center justify-between px-3 py-2 bg-slate-800/40 rounded-lg border border-slate-700/50">
              <div>
                <p className="text-sm font-semibold text-slate-200">QUOTE-000103 • Nexus Systems Automation</p>
                <p className="text-[10px] text-slate-500">Value: $45,000 • Sent to Client</p>
              </div>
              <StatusBadge status="Scheduled" />
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Modals for Quick Details */}
      <Modal
        isOpen={!!selectedMeeting}
        onClose={() => setSelectedMeeting(null)}
        title="Meeting Info Details"
        footer={<OutlineButton onClick={() => setSelectedMeeting(null)}>Close View</OutlineButton>}
      >
        {selectedMeeting && (
          <div className="space-y-4 text-left text-xs">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">{selectedMeeting.title}</h3>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold">Format: {selectedMeeting.meetingType}</p>
            </div>
            <div className="grid gap-3 grid-cols-2">
              <div>
                <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">Date</span>
                <p className="mt-0.5 text-slate-750 font-bold">{new Date(selectedMeeting.meetingDate).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">Time</span>
                <p className="mt-0.5 text-slate-750 font-bold">{selectedMeeting.startTime}</p>
              </div>
              <div>
                <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">Status</span>
                <div className="mt-1"><StatusBadge status={selectedMeeting.status} /></div>
              </div>
              <div>
                <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">Participant</span>
                <p className="mt-0.5 text-slate-750 font-bold">{selectedMeeting.relatedName}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
