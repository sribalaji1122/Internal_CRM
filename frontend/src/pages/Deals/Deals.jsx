import React, { useState, useEffect, useCallback } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import OutlineButton from '../../components/buttons/OutlineButton';
import SearchInput from '../../components/forms/SearchInput';
import SelectInput from '../../components/forms/SelectInput';
import TextInput from '../../components/forms/TextInput';
import NumberInput from '../../components/forms/NumberInput';
import TextArea from '../../components/forms/TextArea';
import DataTable from '../../components/table/DataTable';
import Pagination from '../../components/pagination/Pagination';
import StatusBadge from '../../components/badges/StatusBadge';
import IconButton from '../../components/buttons/IconButton';
import Modal from '../../components/modal/Modal';
import ConfirmDialog from '../../components/modal/ConfirmDialog';
import Toast from '../../components/toast/Toast';
import DealService from '../../services/DealService';
import CompanyService from '../../services/CompanyService';
import ContactService from '../../services/ContactService';
import LeadService from '../../services/LeadService';
import DocumentService from '../../services/DocumentService';
import ActivityService from '../../services/ActivityService';
import MeetingService from '../../services/MeetingService';
import EntityDetailsLayout from '../../components/layout/EntityDetailsLayout';
import {
  HandshakeIcon,
  Plus,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  AlertCircle,
  DollarSign,
  Building2,
  User,
  TrendingUp,
  Calendar,
  Target,
  Package,
  FileSpreadsheet,
  CheckSquare,
  FileText,
  Activity,
  StickyNote,
  CheckCircle,
  XCircle,
  Upload,
  Trash
} from 'lucide-react';

const STAGES = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Contract', 'Won', 'Lost'];
const STATUSES = ['Open', 'In Progress', 'Won', 'Lost', 'Cancelled'];

const stageColors = {
  Prospecting: 'bg-blue-50 text-blue-700 border-blue-100',
  Qualification: 'bg-violet-50 text-violet-700 border-violet-100',
  Proposal: 'bg-amber-50 text-amber-700 border-amber-100',
  Negotiation: 'bg-orange-50 text-orange-700 border-orange-100',
  Contract: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  Won: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Lost: 'bg-rose-50 text-rose-700 border-rose-100'
};

const emptyForm = {
  dealName: '', companyId: '', primaryContactId: '', leadId: '',
  pipeline: 'Default Pipeline', stage: 'Prospecting', status: 'Open',
  owner: 'Jane Doe', currency: 'USD', dealValue: '', expectedRevenue: '',
  probability: '10', expectedCloseDate: '', actualCloseDate: '',
  competitor: '', source: '', description: '', nextAction: '',
  nextFollowUp: '', discount: '', tax: '', notes: ''
};

export default function Deals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ totalRecords: 0, totalPages: 1, currentPage: 1, recordsPerPage: 10 });

  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [currentPage, setCurrentPage] = useState(1);

  // Selector lists
  const [companies, setCompanies] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [leads, setLeads] = useState([]);

  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Related tab states
  const [tabData, setTabData] = useState({
    meetings: [],
    documents: [],
    activity: []
  });
  const [relatedLoading, setRelatedLoading] = useState(false);

  // Documents simulation
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);

  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => setToast({ isOpen: true, message, type });

  // Fetch selector lists for modal dropdowns
  const fetchSelectorLists = async () => {
    try {
      const [cRes, ctRes, lRes] = await Promise.all([
        CompanyService.getCompanies({ limit: 200 }),
        ContactService.getContacts({ limit: 200 }),
        LeadService.getLeads({ limit: 200 })
      ]);
      setCompanies(cRes.data?.data || []);
      setContacts(ctRes.data?.data || []);
      setLeads(lRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load selector items', err);
    }
  };

  useEffect(() => {
    fetchSelectorLists();
  }, []);

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await DealService.getDeals({
        search, stage: stageFilter, status: statusFilter,
        sort: sortBy, page: currentPage, limit: 10
      });
      if (res.data.success) {
        setDeals(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch deals.');
    } finally {
      setLoading(false);
    }
  }, [search, stageFilter, statusFilter, sortBy, currentPage]);

  useEffect(() => { fetchDeals(); }, [fetchDeals]);

  const handleOpenAdd = () => {
    fetchSelectorLists();
    setIsEditing(false);
    setFormData(emptyForm);
    setFormErrors({});
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (deal) => {
    fetchSelectorLists();
    setIsEditing(true);
    setSelectedDeal(deal);
    setFormData({
      dealName: deal.dealName || '',
      companyId: deal.companyId?._id || deal.companyId || '',
      primaryContactId: deal.primaryContactId?._id || deal.primaryContactId || '',
      leadId: deal.leadId?._id || deal.leadId || '',
      pipeline: deal.pipeline || 'Default Pipeline',
      stage: deal.stage || 'Prospecting',
      status: deal.status || 'Open',
      owner: deal.owner || 'Jane Doe',
      currency: deal.currency || 'USD',
      dealValue: deal.dealValue || '',
      expectedRevenue: deal.expectedRevenue || '',
      probability: deal.probability || '10',
      expectedCloseDate: deal.expectedCloseDate ? deal.expectedCloseDate.substring(0, 10) : '',
      actualCloseDate: deal.actualCloseDate ? deal.actualCloseDate.substring(0, 10) : '',
      competitor: deal.competitor || '',
      source: deal.source || '',
      description: deal.description || '',
      nextAction: deal.nextAction || '',
      nextFollowUp: deal.nextFollowUp ? deal.nextFollowUp.substring(0, 10) : '',
      discount: deal.discount || '',
      tax: deal.tax || '',
      notes: deal.notes || ''
    });
    setFormErrors({});
    setIsAddEditOpen(true);
  };

  const handleLeadChange = (e) => {
    const val = e.target.value;
    const selectedLeadObj = leads.find(l => l._id === val);
    let newCompanyId = formData.companyId;

    if (selectedLeadObj && selectedLeadObj.company) {
      const match = companies.find(c => c.companyName.toLowerCase() === selectedLeadObj.company.toLowerCase());
      if (match) {
        newCompanyId = match._id;
      }
    }

    setFormData(prev => ({
      ...prev,
      leadId: val,
      companyId: newCompanyId
    }));
  };

  const handleContactChange = (e) => {
    const val = e.target.value;
    const selectedContactObj = contacts.find(ct => ct._id === val);
    let newCompanyId = formData.companyId;

    if (selectedContactObj && selectedContactObj.company) {
      const match = companies.find(c => c.companyName.toLowerCase() === selectedContactObj.company.toLowerCase());
      if (match) {
        newCompanyId = match._id;
      }
    }

    setFormData(prev => ({
      ...prev,
      primaryContactId: val,
      companyId: newCompanyId
    }));
  };

  const handleOpenView = async (deal) => {
    setSelectedDeal(deal);
    setActiveTab('overview');
    setTabData({ meetings: [], documents: [], activity: [] });
    setIsViewOpen(true);

    try {
      const res = await DealService.getDeal(deal._id);
      if (res.data?.success) {
        setSelectedDeal(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load deal detail', err);
    }
  };

  const handleTabChange = async (tabId) => {
    setActiveTab(tabId);
    if (['overview', 'products', 'quotes', 'tasks', 'notes'].includes(tabId)) return;

    setRelatedLoading(true);
    try {
      if (tabId === 'meetings') {
        // Fetch meetings and filter by deal contact or lead
        const mRes = await MeetingService.getMeetings({ limit: 100 });
        const meetingsList = mRes.data?.data || [];
        const contactId = selectedDeal.primaryContactId?._id || selectedDeal.primaryContactId;
        const leadId = selectedDeal.leadId?._id || selectedDeal.leadId;
        const filtered = meetingsList.filter(m =>
          (contactId && m.relatedContactId?._id === contactId) ||
          (leadId && m.relatedLeadId?._id === leadId)
        );
        setTabData(prev => ({ ...prev, meetings: filtered }));
      } else if (tabId === 'documents') {
        const docRes = await DocumentService.getDocuments('Deal', selectedDeal._id);
        setTabData(prev => ({ ...prev, documents: docRes.data?.data || [] }));
      } else if (tabId === 'activity') {
        const actRes = await ActivityService.getDealActivity(selectedDeal._id);
        setTabData(prev => ({ ...prev, activity: actRes.data?.data || [] }));
      }
    } catch (err) {
      console.error(`Failed to load ${tabId} tab`, err);
    } finally {
      setRelatedLoading(false);
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!uploadFileName.trim()) return;

    setUploadLoading(true);
    try {
      const payload = {
        entityType: 'Deal',
        entityId: selectedDeal._id,
        fileName: uploadFileName,
        fileSize: Math.round(15000 + Math.random() * 2500000)
      };

      const res = await DocumentService.uploadDocument(payload);
      if (res.data?.success) {
        showToast('Document uploaded.');
        setUploadFileName('');
        const docRes = await DocumentService.getDocuments('Deal', selectedDeal._id);
        setTabData(prev => ({ ...prev, documents: docRes.data?.data || [] }));
      }
    } catch (err) {
      showToast('Upload failed', 'error');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    try {
      const res = await DocumentService.deleteDocument(docId);
      if (res.data?.success) {
        showToast('Document deleted.');
        const docRes = await DocumentService.getDocuments('Deal', selectedDeal._id);
        setTabData(prev => ({ ...prev, documents: docRes.data?.data || [] }));
      }
    } catch (err) {
      showToast('Delete failed', 'error');
    }
  };

  const handleOpenDelete = (deal) => {
    setSelectedDeal(deal);
    setIsDeleteOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.dealName.trim()) errors.dealName = 'Deal name is required';
    if (!formData.companyId) errors.companyId = 'Associated company is required';
    if (!formData.expectedCloseDate) errors.expectedCloseDate = 'Expected close date is required';
    if (formData.probability && (Number(formData.probability) < 0 || Number(formData.probability) > 100)) {
      errors.probability = 'Probability must be 0–100';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitLoading(true);
    try {
      const payload = {
        ...formData,
        dealValue: formData.dealValue ? Number(formData.dealValue) : 0,
        expectedRevenue: formData.expectedRevenue ? Number(formData.expectedRevenue) : 0,
        probability: formData.probability ? Number(formData.probability) : 10,
        discount: formData.discount ? Number(formData.discount) : 0,
        tax: formData.tax ? Number(formData.tax) : 0
      };

      // Clean optional ObjectId and Date fields to avoid Mongoose CastError on empty strings
      if (!payload.primaryContactId) payload.primaryContactId = null;
      if (!payload.leadId) payload.leadId = null;
      if (!payload.actualCloseDate) payload.actualCloseDate = null;
      if (!payload.nextFollowUp) payload.nextFollowUp = null;

      if (isEditing) {
        const res = await DealService.updateDeal(selectedDeal._id, payload);
        if (res.data.success) { showToast('Deal updated successfully!'); setIsAddEditOpen(false); fetchDeals(); }
      } else {
        const res = await DealService.createDeal(payload);
        if (res.data.success) { showToast('Deal created successfully!'); setIsAddEditOpen(false); fetchDeals(); }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Submission failed.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    setSubmitLoading(true);
    try {
      const res = await DealService.deleteDeal(selectedDeal._id);
      if (res.data.success) { showToast('Deal deleted.', 'success'); setIsDeleteOpen(false); fetchDeals(); }
    } catch (err) {
      showToast('Failed to delete deal.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const fld = (name) => (e) => setFormData({ ...formData, [name]: e.target.value });

  const columns = [
    {
      key: 'dealName',
      header: 'Deal Name',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-xs">
            {row.dealName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-slate-800 text-xs">{row.dealName}</p>
            <p className="text-[10px] text-slate-405 font-semibold">{row.dealNumber}</p>
          </div>
        </div>
      )
    },
    { key: 'company', header: 'Company', render: (row) => <span className="text-xs text-slate-655 font-bold">{row.companyId?.companyName || '—'}</span> },
    { key: 'stage', header: 'Stage', render: (row) => <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${stageColors[row.stage]}`}>{row.stage}</span> },
    { key: 'value', header: 'Value', render: (row) => <span className="text-xs font-bold text-emerald-700">${Number(row.dealValue || 0).toLocaleString()}</span> },
    { key: 'probability', header: 'Prob.', render: (row) => <span className="text-xs">{row.probability}%</span> },
    { key: 'expectedClose', header: 'Close Date', render: (row) => <span className="text-xs text-slate-400 font-semibold">{row.expectedCloseDate ? new Date(row.expectedCloseDate).toLocaleDateString() : '—'}</span> },
    { key: 'owner', header: 'Owner', render: (row) => <span className="text-xs">{row.owner || '—'}</span> },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <IconButton variant="ghost" icon={<Eye className="h-4 w-4" />} title="View Details" onClick={() => handleOpenView(row)} />
          <IconButton variant="ghost" icon={<Edit2 className="h-4 w-4" />} title="Edit Deal" onClick={() => handleOpenEdit(row)} />
          <IconButton variant="danger" icon={<Trash2 className="h-4 w-4" />} title="Delete Deal" onClick={() => handleOpenDelete(row)} />
        </div>
      )
    }
  ];

  // Map stats into Summary Cards format
  const summaryCards = selectedDeal ? [
    { label: 'Deal Value', value: `$${Number(selectedDeal.dealValue || 0).toLocaleString()}`, icon: DollarSign },
    { label: 'Expected Revenue', value: `$${Number(selectedDeal.expectedRevenue || 0).toLocaleString()}`, icon: DollarSign },
    { label: 'Probability', value: `${selectedDeal.probability}%`, icon: TrendingUp },
    { label: 'Expected Close', value: selectedDeal.expectedCloseDate ? new Date(selectedDeal.expectedCloseDate).toLocaleDateString() : '—', icon: Calendar },
    { label: 'Owner', value: selectedDeal.owner || '—', icon: User },
    { label: 'Pipeline', value: selectedDeal.pipeline || '—', icon: Target },
    { label: 'Current Stage', value: selectedDeal.stage || '—', icon: HandshakeIcon },
    { label: 'Status', value: selectedDeal.status || '—', icon: CheckCircle }
  ] : [];

  const tabList = [
    { id: 'overview', label: 'Overview', icon: HandshakeIcon },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'quotes', label: 'Quotes', icon: FileSpreadsheet },
    { id: 'meetings', label: 'Meetings', icon: Calendar },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'activity', label: 'Activity Timeline', icon: Activity },
    { id: 'notes', label: 'Notes', icon: StickyNote }
  ];

  return (
    <PageContainer>
      {/* Compact Toolbar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">Deals (Opportunities)</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track active pipeline value, close probabilities, and associated accounts.</p>
        </div>
        <div className="flex items-center gap-2">
          <OutlineButton onClick={fetchDeals} title="Refresh">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </OutlineButton>
          <PrimaryButton onClick={handleOpenAdd}>
            <TrendingUp className="h-4 w-4" />
            Add Deal
          </PrimaryButton>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-rose-100 bg-rose-50/50 p-4 text-sm text-rose-800">
          <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <SearchInput label="Search" placeholder="Search by name, competitor, owner..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="min-w-[140px]">
          <SelectInput label="Stage" value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Stages' },
              ...STAGES.map(s => ({ value: s, label: s }))
            ]}
          />
        </div>
        <div className="min-w-[140px]">
          <SelectInput label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              ...STATUSES.map(s => ({ value: s, label: s }))
            ]}
          />
        </div>
        <div className="min-w-[140px]">
          <SelectInput label="Sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: '-createdAt', label: 'Newest First' },
              { value: 'createdAt', label: 'Oldest First' },
              { value: 'dealName', label: 'Name A–Z' },
              { value: '-dealValue', label: 'Value High–Low' },
              { value: 'expectedCloseDate', label: 'Close Date' }
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={deals}
        loading={loading}
        emptyTitle="No Deals Found"
        emptyDescription="No pipeline deals match your search criteria."
        emptyAction={<PrimaryButton onClick={handleOpenAdd}>Create First Deal</PrimaryButton>}
      />

      {!loading && deals.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalRecords={pagination.totalRecords}
          recordsPerPage={pagination.recordsPerPage}
          onPageChange={setCurrentPage}
        />
      )}

      {/* ===================== CREATE / EDIT MODAL ===================== */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={isEditing ? 'Edit Deal' : 'Add New Deal'}
        size="xl"
        footer={
          <div className="flex gap-3 justify-end">
            <OutlineButton onClick={() => setIsAddEditOpen(false)}>Cancel</OutlineButton>
            <PrimaryButton onClick={handleSubmit} disabled={submitLoading}>
              {submitLoading ? 'Saving...' : isEditing ? 'Update Deal' : 'Create Deal'}
            </PrimaryButton>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* General Info */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <HandshakeIcon className="h-3.5 w-3.5" /> Deal Details
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="Deal Name *" value={formData.dealName} onChange={fld('dealName')} error={formErrors.dealName} placeholder="Enterprise Expansion License" />
              <SelectInput label="Associated Company *" value={formData.companyId} onChange={fld('companyId')} error={formErrors.companyId}
                options={[{ value: '', label: 'Select Company' }, ...companies.map(c => ({ value: c._id, label: `${c.companyName} (${c.companyCode})` }))]}
              />
              <SelectInput label="Primary Contact" value={formData.primaryContactId} onChange={handleContactChange}
                options={[{ value: '', label: 'None' }, ...contacts.map(ct => ({ value: ct._id, label: `${ct.firstName} ${ct.lastName} (${ct.company})` }))]}
              />
              <SelectInput label="Related Lead" value={formData.leadId} onChange={handleLeadChange}
                options={[{ value: '', label: 'None' }, ...leads.map(l => ({ value: l._id, label: `${l.firstName} ${l.lastName} (${l.company})` }))]}
              />
              <TextInput label="Owner" value={formData.owner} onChange={fld('owner')} placeholder="Jane Doe" />
            </div>
          </div>

          {/* Pipeline */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" /> Pipeline & Stage
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <SelectInput label="Pipeline" value={formData.pipeline} onChange={fld('pipeline')}
                options={[{ value: 'Default Pipeline', label: 'Default Pipeline' }]}
              />
              <SelectInput label="Stage" value={formData.stage} onChange={fld('stage')}
                options={STAGES.map(s => ({ value: s, label: s }))}
              />
              <SelectInput label="Status" value={formData.status} onChange={fld('status')}
                options={STATUSES.map(s => ({ value: s, label: s }))}
              />
            </div>
          </div>

          {/* Financials */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" /> Financial Details
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <NumberInput label="Deal Value ($)" value={formData.dealValue} onChange={fld('dealValue')} min={0} placeholder="50000" />
              <NumberInput label="Expected Revenue ($)" value={formData.expectedRevenue} onChange={fld('expectedRevenue')} min={0} />
              <NumberInput label="Probability (%)" value={formData.probability} onChange={fld('probability')} min={0} max={100} error={formErrors.probability} />
              <NumberInput label="Discount (%)" value={formData.discount} onChange={fld('discount')} min={0} max={100} />
              <NumberInput label="Tax (%)" value={formData.tax} onChange={fld('tax')} min={0} />
              <SelectInput label="Currency" value={formData.currency} onChange={fld('currency')}
                options={['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD'].map(v => ({ value: v, label: v }))}
              />
            </div>
          </div>

          {/* Dates */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> Dates & Next Steps
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="Expected Close Date *" type="date" value={formData.expectedCloseDate} onChange={fld('expectedCloseDate')} error={formErrors.expectedCloseDate} />
              <TextInput label="Actual Close Date" type="date" value={formData.actualCloseDate} onChange={fld('actualCloseDate')} />
              <TextInput label="Next Follow-Up Date" type="date" value={formData.nextFollowUp} onChange={fld('nextFollowUp')} />
              <TextInput label="Source" value={formData.source} onChange={fld('source')} placeholder="Inbound / Referral" />
              <TextInput label="Competitor" value={formData.competitor} onChange={fld('competitor')} placeholder="Competitor Name" />
              <div className="sm:col-span-2">
                <TextInput label="Next Action" value={formData.nextAction} onChange={fld('nextAction')} placeholder="Schedule proposal review call..." />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="grid gap-4 sm:grid-cols-1">
            <TextArea label="Description" value={formData.description} onChange={fld('description')} rows={2} />
            <TextArea label="Notes" value={formData.notes} onChange={fld('notes')} rows={2} />
          </div>
        </form>
      </Modal>

      {/* ===================== VIEW DETAILS MODAL ===================== */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Deal Workspace Details"
        size="xl"
        footer={<OutlineButton onClick={() => setIsViewOpen(false)}>Close Workspace</OutlineButton>}
      >
        {selectedDeal && (
          <div className="h-[70vh] overflow-hidden -m-6">
            <EntityDetailsLayout
              title={selectedDeal.dealName}
              subtitle={`${selectedDeal.dealNumber} · ${selectedDeal.companyId?.companyName || 'Unknown Company'}`}
              avatarText={selectedDeal.dealName?.charAt(0).toUpperCase()}
              status={selectedDeal.status}
              summaryCards={summaryCards}
              tabs={tabList}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              onEditClick={() => { setIsViewOpen(false); handleOpenEdit(selectedDeal); }}
              onClose={() => setIsViewOpen(false)}
            >
              {/* Tab Contents */}
              {activeTab === 'overview' && (
                <div className="grid gap-5 sm:grid-cols-2 text-xs">
                  <ViewField icon={<Building2 className="h-4 w-4 text-slate-400" />} label="Company" value={selectedDeal.companyId?.companyName} />
                  <ViewField icon={<User className="h-4 w-4 text-slate-400" />} label="Primary Contact" value={selectedDeal.primaryContactId ? `${selectedDeal.primaryContactId.firstName} ${selectedDeal.primaryContactId.lastName}` : null} />
                  <ViewField icon={<User className="h-4 w-4 text-slate-400" />} label="Owner" value={selectedDeal.owner} />
                  <ViewField icon={<Target className="h-4 w-4 text-slate-400" />} label="Source" value={selectedDeal.source} />
                  <ViewField icon={<Calendar className="h-4 w-4 text-slate-400" />} label="Expected Close Date" value={selectedDeal.expectedCloseDate ? new Date(selectedDeal.expectedCloseDate).toLocaleDateString() : null} />
                  <ViewField icon={<TrendingUp className="h-4 w-4 text-slate-400" />} label="Competitor" value={selectedDeal.competitor} />
                  <ViewField icon={<CheckSquare className="h-4 w-4 text-slate-400" />} label="Next Action" value={selectedDeal.nextAction} />
                  <ViewField icon={<Calendar className="h-4 w-4 text-slate-400" />} label="Next Follow-Up Date" value={selectedDeal.nextFollowUp ? new Date(selectedDeal.nextFollowUp).toLocaleDateString() : null} />

                  {selectedDeal.description && (
                    <div className="sm:col-span-2 rounded-xl bg-white border border-slate-200/50 p-4 shadow-sm">
                      <p className="text-[10px] font-extrabold uppercase text-slate-405 mb-2">Description</p>
                      <p className="text-slate-700 leading-relaxed font-semibold">{selectedDeal.description}</p>
                    </div>
                  )}

                  {selectedDeal.notes && (
                    <div className="sm:col-span-2 rounded-xl bg-amber-50/50 border border-amber-100 p-4 shadow-sm">
                      <p className="text-[10px] font-extrabold uppercase text-amber-500 mb-2">Notes</p>
                      <p className="text-slate-700 leading-relaxed font-semibold">{selectedDeal.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Placeholders for Products, Quotes, and Tasks */}
              {['products', 'quotes', 'tasks'].includes(activeTab) && (
                <div className="flex flex-col items-center justify-center border border-dashed border-indigo-200 bg-indigo-50/20 rounded-xl p-10 text-center max-w-sm mx-auto my-8">
                  {activeTab === 'products' && <Package className="h-10 w-10 text-indigo-500 mb-3" />}
                  {activeTab === 'quotes' && <FileSpreadsheet className="h-10 w-10 text-indigo-500 mb-3" />}
                  {activeTab === 'tasks' && <CheckSquare className="h-10 w-10 text-indigo-500 mb-3" />}
                  <h4 className="font-bold text-slate-800 text-sm">Feature Preview</h4>
                  <p className="text-xs text-slate-500 mt-1">Coming in Phase 13B</p>
                </div>
              )}

              {activeTab === 'meetings' && (
                <RelatedTable
                  loading={relatedLoading}
                  data={tabData.meetings}
                  emptyMsg="No scheduled meetings linked to this deal's contact/lead."
                  columns={['Meeting Topic', 'Format', 'Date & Time', 'Status']}
                  renderRow={(m) => (
                    <tr key={m._id} className="hover:bg-slate-50/50 text-xs border-b border-slate-100">
                      <td className="py-3 font-bold text-slate-850">{m.title}</td>
                      <td className="py-3 text-slate-500 font-semibold">{m.meetingType}</td>
                      <td className="py-3 text-slate-500 font-semibold">
                        {new Date(m.meetingDate).toLocaleDateString()} @ {m.startTime}
                      </td>
                      <td className="py-3"><StatusBadge status={m.status} /></td>
                    </tr>
                  )}
                />
              )}

              {activeTab === 'documents' && (
                <div className="space-y-4">
                  <form onSubmit={handleUploadDocument} className="flex gap-2 items-end bg-white p-4 border border-slate-200/50 rounded-xl shadow-sm">
                    <div className="flex-1">
                      <TextInput
                        label="Upload Document Simulation"
                        placeholder="signed_contract.pdf"
                        value={uploadFileName}
                        onChange={(e) => setUploadFileName(e.target.value)}
                      />
                    </div>
                    <PrimaryButton type="submit" disabled={uploadLoading || !uploadFileName.trim()}>
                      <Upload className="h-4 w-4" />
                      {uploadLoading ? 'Uploading...' : 'Upload'}
                    </PrimaryButton>
                  </form>

                  <RelatedTable
                    loading={relatedLoading}
                    data={tabData.documents}
                    emptyMsg="No documents associated with this deal."
                    columns={['File Name', 'Size', 'Uploaded By', 'Actions']}
                    renderRow={(doc) => (
                      <tr key={doc._id} className="hover:bg-slate-50/50 text-xs border-b border-slate-100">
                        <td className="py-3 font-bold text-slate-800 flex items-center gap-1.5">
                          <FileText className="h-4 w-4 text-slate-400" />
                          <span>{doc.fileName}</span>
                        </td>
                        <td className="py-3 text-slate-505 font-medium">{(doc.fileSize / 1024).toFixed(1)} KB</td>
                        <td className="py-3 text-slate-505 font-medium">{doc.uploadedBy}</td>
                        <td className="py-3">
                          <IconButton
                            variant="danger"
                            icon={<Trash className="h-3.5 w-3.5" />}
                            title="Delete file"
                            onClick={() => handleDeleteDocument(doc._id)}
                          />
                        </td>
                      </tr>
                    )}
                  />
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-4">
                  {relatedLoading ? (
                    <p className="text-xs text-slate-400 italic text-center py-6">Loading activities...</p>
                  ) : tabData.activity.length === 0 ? (
                    <p className="text-xs text-slate-405 italic text-center py-6">No logs recorded for this deal opportunity.</p>
                  ) : (
                    <div className="flow-root pr-1">
                      <ul className="-mb-8">
                        {tabData.activity.map((item, idx) => (
                          <li key={item._id}>
                            <div className="relative pb-6">
                              {idx !== tabData.activity.length - 1 && (
                                <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
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
                                        <span className="font-bold text-slate-800">{item.actor}</span> {item.description}
                                      </p>
                                      <span className="mt-1 inline-flex px-1.5 py-0.2 text-[8px] font-bold uppercase rounded border bg-indigo-50/50 text-indigo-650 border-indigo-100">
                                        {item.activityType}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">
                                      {new Date(item.createdAt).toLocaleDateString()}
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
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <SectionCard title="Notepad Quick Notes">
                    <TextArea
                      label="Add or Update Deal Notes"
                      value={selectedDeal.notes || ''}
                      onChange={async (e) => {
                        const val = e.target.value;
                        setSelectedDeal(prev => ({ ...prev, notes: val }));
                        // Debounce or save on blur or quick update call
                      }}
                      onBlur={async () => {
                        try {
                          await DealService.updateDeal(selectedDeal._id, { notes: selectedDeal.notes });
                          showToast('Notes saved.');
                        } catch (err) {
                          showToast('Failed to save notes', 'error');
                        }
                      }}
                      rows={6}
                      placeholder="Type details, call logs, next action summaries..."
                    />
                    <p className="text-[10px] text-slate-400 mt-2 font-semibold italic">Changes are auto-saved on click outside the textarea field.</p>
                  </SectionCard>
                </div>
              )}
            </EntityDetailsLayout>
          </div>
        )}
      </Modal>

      {/* ===================== DELETE CONFIRM ===================== */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Deal"
        message={`Are you sure you want to delete "${selectedDeal?.dealName}"? This cannot be undone.`}
        confirmLabel="Delete Deal"
        loading={submitLoading}
      />

      <Toast isOpen={toast.isOpen} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, isOpen: false })} />
    </PageContainer>
  );
}

function ViewField({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5 py-2 border-b border-slate-100">
      <span className="text-slate-400 shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="text-slate-750 font-bold mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function RelatedTable({ loading, data = [], emptyMsg, columns, renderRow }) {
  if (loading) return <p className="text-xs text-slate-400 italic text-center py-8">Loading records…</p>;
  if (!data || !data.length) return <p className="text-xs text-slate-400 italic text-center py-8">{emptyMsg}</p>;
  return (
    <div className="overflow-x-auto bg-white border border-slate-200/50 rounded-xl shadow-sm">
      <table className="min-w-full text-left text-xs">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-450 uppercase font-bold tracking-wider">
            {columns.map(col => <th key={col} className="py-3 px-4">{col}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 px-4 font-semibold text-slate-700">{data.map(renderRow)}</tbody>
      </table>
    </div>
  );
}
