import React, { useState, useEffect, useCallback } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import SectionCard from '../../components/cards/SectionCard';
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
import CompanyService from '../../services/CompanyService';
import DocumentService from '../../services/DocumentService';
import EntityDetailsLayout from '../../components/layout/EntityDetailsLayout';
import CompanyRelationshipTree from '../../components/common/CompanyRelationshipTree';
import {
  Building2,
  Plus,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  AlertCircle,
  Globe,
  Phone,
  Mail,
  Users,
  DollarSign,
  MapPin,
  Briefcase,
  User,
  TrendingUp,
  Target,
  Calendar,
  Megaphone,
  FileText,
  Activity,
  CheckCircle,
  XCircle,
  Upload,
  Trash
} from 'lucide-react';

const INDUSTRY_OPTIONS = [
  'Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing',
  'Education', 'Real Estate', 'Hospitality', 'Logistics', 'Consulting',
  'Media', 'Legal', 'Agriculture', 'Construction', 'Energy', 'Other'
];

const emptyForm = {
  companyName: '', industry: 'Other', website: '', email: '', phone: '',
  alternatePhone: '', addressLine1: '', addressLine2: '', country: '',
  state: '', city: '', postalCode: '', employeeCount: '', annualRevenue: '',
  currency: 'USD', companyType: 'Prospect', ownership: '', parentCompany: '',
  ceo: '', linkedin: '', status: 'Prospect', accountOwner: 'Jane Doe',
  description: '', tags: '', notes: ''
};

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ totalRecords: 0, totalPages: 1, currentPage: 1, recordsPerPage: 10 });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [currentPage, setCurrentPage] = useState(1);

  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Related data and stats
  const [summaryStats, setSummaryStats] = useState(null);
  const [tabData, setTabData] = useState({
    leads: [],
    contacts: [],
    deals: [],
    meetings: [],
    campaigns: [],
    documents: [],
    activity: []
  });
  const [relatedLoading, setRelatedLoading] = useState(false);

  // Document upload simulation
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);

  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ isOpen: true, message, type });
  };

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await CompanyService.getCompanies({
        search, status: statusFilter, companyType: typeFilter,
        sort: sortBy, page: currentPage, limit: 10
      });
      if (res.data.success) {
        setCompanies(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch companies.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter, sortBy, currentPage]);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData(emptyForm);
    setFormErrors({});
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (company) => {
    setIsEditing(true);
    setSelectedCompany(company);
    setFormData({
      companyName: company.companyName || '',
      industry: company.industry || 'Other',
      website: company.website || '',
      email: company.email || '',
      phone: company.phone || '',
      alternatePhone: company.alternatePhone || '',
      addressLine1: company.addressLine1 || '',
      addressLine2: company.addressLine2 || '',
      country: company.country || '',
      state: company.state || '',
      city: company.city || '',
      postalCode: company.postalCode || '',
      employeeCount: company.employeeCount || '',
      annualRevenue: company.annualRevenue || '',
      currency: company.currency || 'USD',
      companyType: company.companyType || 'Prospect',
      ownership: company.ownership || '',
      parentCompany: company.parentCompany || '',
      ceo: company.ceo || '',
      linkedin: company.linkedin || '',
      status: company.status || 'Prospect',
      accountOwner: company.accountOwner || 'Jane Doe',
      description: company.description || '',
      tags: Array.isArray(company.tags) ? company.tags.join(', ') : '',
      notes: company.notes || ''
    });
    setFormErrors({});
    setIsAddEditOpen(true);
  };

  const handleOpenView = async (company) => {
    setSelectedCompany(company);
    setActiveTab('overview');
    setSummaryStats(null);
    setTabData({
      leads: [],
      contacts: [],
      deals: [],
      meetings: [],
      campaigns: [],
      documents: [],
      activity: []
    });
    setIsViewOpen(true);

    try {
      const res = await CompanyService.getCompany(company._id);
      if (res.data?.success) {
        setSelectedCompany(res.data.data);
        setSummaryStats(res.data.summaryStats);
      }
    } catch (err) {
      console.error('Failed to load company stats', err);
    }
  };

  // Lazy loading tab content on change
  const handleTabChange = async (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'overview') return;

    // Load full relationship data set if tree is selected
    if (tabId === 'relationship') {
      setRelatedLoading(true);
      try {
        const [leadsRes, contactsRes, dealsRes, meetingsRes, campaignsRes, docsRes, actRes] = await Promise.all([
          CompanyService.getLeads(selectedCompany._id, { limit: 100 }),
          CompanyService.getContacts(selectedCompany._id, { limit: 100 }),
          CompanyService.getDeals(selectedCompany._id, { limit: 100 }),
          CompanyService.getMeetings(selectedCompany._id, { limit: 100 }),
          CompanyService.getCampaigns(selectedCompany._id, { limit: 100 }),
          DocumentService.getDocuments('Company', selectedCompany._id),
          CompanyService.getActivity(selectedCompany._id, { limit: 100 })
        ]);

        setTabData({
          leads: leadsRes.data?.data || [],
          contacts: contactsRes.data?.data || [],
          deals: dealsRes.data?.data || [],
          meetings: meetingsRes.data?.data || [],
          campaigns: campaignsRes.data?.data || [],
          documents: docsRes.data?.data || [],
          activity: actRes.data?.data || []
        });
      } catch (err) {
        console.error('Failed to load relationship tree dataset', err);
      } finally {
        setRelatedLoading(false);
      }
      return;
    }

    // Lazy load individual tabs
    setRelatedLoading(true);
    try {
      let res;
      if (tabId === 'leads') res = await CompanyService.getLeads(selectedCompany._id);
      else if (tabId === 'contacts') res = await CompanyService.getContacts(selectedCompany._id);
      else if (tabId === 'deals') res = await CompanyService.getDeals(selectedCompany._id);
      else if (tabId === 'meetings') res = await CompanyService.getMeetings(selectedCompany._id);
      else if (tabId === 'campaigns') res = await CompanyService.getCampaigns(selectedCompany._id);
      else if (tabId === 'documents') res = await DocumentService.getDocuments('Company', selectedCompany._id);
      else if (tabId === 'activity') res = await CompanyService.getActivity(selectedCompany._id);

      if (res && res.data?.success) {
        setTabData(prev => ({ ...prev, [tabId]: res.data.data }));
      }
    } catch (err) {
      console.error(`Failed to load ${tabId} tab content`, err);
    } finally {
      setRelatedLoading(false);
    }
  };

  // Simulated document upload trigger
  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!uploadFileName.trim()) return;

    setUploadLoading(true);
    try {
      const payload = {
        entityType: 'Company',
        entityId: selectedCompany._id,
        fileName: uploadFileName,
        fileSize: Math.round(15000 + Math.random() * 2500000) // random size
      };

      const res = await DocumentService.uploadDocument(payload);
      if (res.data?.success) {
        showToast('Document uploaded successfully!');
        setUploadFileName('');
        // Reload documents list
        const docsRes = await DocumentService.getDocuments('Company', selectedCompany._id);
        setTabData(prev => ({ ...prev, documents: docsRes.data?.data || [] }));
        // Update summary count
        if (summaryStats) {
          setSummaryStats(prev => ({ ...prev, documentsCount: prev.documentsCount + 1 }));
        }
      }
    } catch (err) {
      showToast('Document upload failed', 'error');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    try {
      const res = await DocumentService.deleteDocument(docId);
      if (res.data?.success) {
        showToast('Document deleted.');
        // Reload documents list
        const docsRes = await DocumentService.getDocuments('Company', selectedCompany._id);
        setTabData(prev => ({ ...prev, documents: docsRes.data?.data || [] }));
        // Update summary count
        if (summaryStats) {
          setSummaryStats(prev => ({ ...prev, documentsCount: Math.max(0, prev.documentsCount - 1) }));
        }
      }
    } catch (err) {
      showToast('Failed to delete document', 'error');
    }
  };

  const handleOpenDelete = (company) => {
    setSelectedCompany(company);
    setIsDeleteOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.companyName.trim()) errors.companyName = 'Company name is required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email address';
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
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        employeeCount: formData.employeeCount ? Number(formData.employeeCount) : 0,
        annualRevenue: formData.annualRevenue ? Number(formData.annualRevenue) : 0
      };
      if (isEditing) {
        const res = await CompanyService.updateCompany(selectedCompany._id, payload);
        if (res.data.success) { showToast('Company updated successfully!'); setIsAddEditOpen(false); fetchCompanies(); }
      } else {
        const res = await CompanyService.createCompany(payload);
        if (res.data.success) { showToast('Company created successfully!'); setIsAddEditOpen(false); fetchCompanies(); }
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
      const res = await CompanyService.deleteCompany(selectedCompany._id);
      if (res.data.success) { showToast('Company deleted.', 'success'); setIsDeleteOpen(false); fetchCompanies(); }
    } catch (err) {
      showToast('Failed to delete company.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const columns = [
    {
      key: 'companyName',
      header: 'Company Name',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-xs">
            {row.companyName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-slate-800 text-xs">{row.companyName}</p>
            <p className="text-[10px] text-slate-400 font-semibold">{row.companyCode}</p>
          </div>
        </div>
      )
    },
    { key: 'industry', header: 'Industry', render: (row) => <span className="text-xs text-slate-655">{row.industry || '—'}</span> },
    { key: 'phone', header: 'Phone', render: (row) => <span className="text-xs">{row.phone || '—'}</span> },
    { key: 'email', header: 'Email', render: (row) => <span className="text-xs truncate max-w-[145px] block">{row.email || '—'}</span> },
    { key: 'employeeCount', header: 'Employees', render: (row) => <span className="text-xs">{row.employeeCount?.toLocaleString() || '—'}</span> },
    {
      key: 'annualRevenue',
      header: 'Revenue',
      render: (row) => (
        <span className="text-xs font-semibold text-emerald-700">
          {row.annualRevenue ? `$${Number(row.annualRevenue).toLocaleString()}` : '—'}
        </span>
      )
    },
    { key: 'accountOwner', header: 'Owner', render: (row) => <span className="text-xs">{row.accountOwner || '—'}</span> },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <IconButton variant="ghost" icon={<Eye className="h-4 w-4" />} title="View Details" onClick={() => handleOpenView(row)} />
          <IconButton variant="ghost" icon={<Edit2 className="h-4 w-4" />} title="Edit Company" onClick={() => handleOpenEdit(row)} />
          <IconButton variant="danger" icon={<Trash2 className="h-4 w-4" />} title="Delete Company" onClick={() => handleOpenDelete(row)} />
        </div>
      )
    }
  ];

  // Map backend stats into layout summary cards format
  const summaryCards = summaryStats ? [
    { label: 'Total Leads', value: summaryStats.totalLeads, icon: Target },
    { label: 'Total Contacts', value: summaryStats.totalContacts, icon: Users },
    { label: 'Total Deals', value: summaryStats.totalDeals, icon: TrendingUp },
    { label: 'Open Deals', value: summaryStats.openDeals, icon: TrendingUp },
    { label: 'Won Deals', value: summaryStats.wonDeals, icon: CheckCircle },
    { label: 'Lost Deals', value: summaryStats.lostDeals, icon: XCircle },
    { label: 'Pipeline Value', value: `$${Number(summaryStats.pipelineValue || 0).toLocaleString()}`, icon: DollarSign },
    { label: 'Total Revenue', value: `$${Number(summaryStats.totalRevenue || 0).toLocaleString()}`, icon: DollarSign },
    { label: 'Upcoming Meetings', value: summaryStats.upcomingMeetings, icon: Calendar },
    { label: 'Campaigns', value: summaryStats.campaignCount, icon: Megaphone },
    { label: 'Documents', value: summaryStats.documentsCount, icon: FileText }
  ] : [];

  const tabList = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'leads', label: 'Leads', icon: Target },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'deals', label: 'Deals', icon: TrendingUp },
    { id: 'meetings', label: 'Meetings', icon: Calendar },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
    { id: 'documents', label: 'Documents', icon: FileText, count: summaryStats?.documentsCount },
    { id: 'activity', label: 'Activity Timeline', icon: Activity },
    { id: 'relationship', label: 'Company Relationship', icon: Building2 }
  ];

  return (
    <PageContainer>
      {/* Compact Toolbar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">Companies</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage customer accounts, partners, vendors, and organizational contacts.</p>
        </div>
        <div className="flex items-center gap-2">
          <OutlineButton onClick={fetchCompanies} title="Refresh">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </OutlineButton>
          <PrimaryButton onClick={handleOpenAdd}>
            <Building2 className="h-4 w-4" />
            Add Company
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
          <SearchInput label="Search" placeholder="Search by name, email, industry..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="min-w-[140px]">
          <SelectInput label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
              { value: 'Prospect', label: 'Prospect' },
              { value: 'Archived', label: 'Archived' }
            ]}
          />
        </div>
        <div className="min-w-[140px]">
          <SelectInput label="Company Type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Types' },
              { value: 'Customer', label: 'Customer' },
              { value: 'Partner', label: 'Partner' },
              { value: 'Vendor', label: 'Vendor' },
              { value: 'Prospect', label: 'Prospect' },
              { value: 'Distributor', label: 'Distributor' },
              { value: 'Supplier', label: 'Supplier' },
              { value: 'Internal', label: 'Internal' }
            ]}
          />
        </div>
        <div className="min-w-[140px]">
          <SelectInput label="Sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: '-createdAt', label: 'Newest First' },
              { value: 'createdAt', label: 'Oldest First' },
              { value: 'companyName', label: 'Name A–Z' },
              { value: '-companyName', label: 'Name Z–A' },
              { value: '-annualRevenue', label: 'Revenue High–Low' }
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={companies}
        loading={loading}
        emptyTitle="No Companies Found"
        emptyDescription="No company accounts match your current filter criteria."
        emptyAction={<PrimaryButton onClick={handleOpenAdd}>Add First Company</PrimaryButton>}
      />

      {!loading && companies.length > 0 && (
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
        title={isEditing ? 'Edit Company' : 'Add New Company'}
        size="xl"
        footer={
          <div className="flex gap-3 justify-end">
            <OutlineButton onClick={() => setIsAddEditOpen(false)}>Cancel</OutlineButton>
            <PrimaryButton onClick={handleSubmit} disabled={submitLoading}>
              {submitLoading ? 'Saving...' : isEditing ? 'Update Company' : 'Create Company'}
            </PrimaryButton>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic Info */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" /> General Information
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="Company Name *" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} error={formErrors.companyName} placeholder="Acme Corporation" />
              <SelectInput label="Company Type" value={formData.companyType} onChange={(e) => setFormData({ ...formData, companyType: e.target.value })}
                options={['Customer', 'Partner', 'Vendor', 'Prospect', 'Distributor', 'Supplier', 'Internal'].map(v => ({ value: v, label: v }))}
              />
              <SelectInput label="Industry" value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                options={INDUSTRY_OPTIONS.map(v => ({ value: v, label: v }))}
              />
              <SelectInput label="Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                options={['Active', 'Inactive', 'Prospect', 'Archived'].map(v => ({ value: v, label: v }))}
              />
              <TextInput label="Website" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://acme.com" />
              <TextInput label="LinkedIn" value={formData.linkedin} onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })} placeholder="linkedin.com/company/acme" />
              <TextInput label="CEO / Founder" value={formData.ceo} onChange={(e) => setFormData({ ...formData, ceo: e.target.value })} placeholder="John Smith" />
              <TextInput label="Account Owner" value={formData.accountOwner} onChange={(e) => setFormData({ ...formData, accountOwner: e.target.value })} placeholder="Jane Doe" />
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" /> Contact Details
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} error={formErrors.email} placeholder="info@acme.com" />
              <TextInput label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+1 555 000 0000" />
              <TextInput label="Alternate Phone" value={formData.alternatePhone} onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })} />
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> Address
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <TextInput label="Address Line 1" value={formData.addressLine1} onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })} placeholder="123 Main St" />
              </div>
              <TextInput label="Address Line 2" value={formData.addressLine2} onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })} placeholder="Suite 400" />
              <TextInput label="City" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
              <TextInput label="State / Province" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} />
              <TextInput label="Country" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
              <TextInput label="Postal Code" value={formData.postalCode} onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })} />
            </div>
          </div>

          {/* Financials */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" /> Financials & Size
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <NumberInput label="Employee Count" value={formData.employeeCount} onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })} min={0} placeholder="500" />
              <NumberInput label="Annual Revenue ($)" value={formData.annualRevenue} onChange={(e) => setFormData({ ...formData, annualRevenue: e.target.value })} min={0} placeholder="1000000" />
              <SelectInput label="Currency" value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                options={['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD'].map(v => ({ value: v, label: v }))}
              />
              <TextInput label="Ownership" value={formData.ownership} onChange={(e) => setFormData({ ...formData, ownership: e.target.value })} placeholder="Private / Public" />
              <TextInput label="Parent Company" value={formData.parentCompany} onChange={(e) => setFormData({ ...formData, parentCompany: e.target.value })} placeholder="Optional parent" />
            </div>
          </div>

          {/* Notes */}
          <div>
            <TextInput label="Tags (comma separated)" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="enterprise, saas, tier-1" />
            <div className="mt-3">
              <TextArea label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} />
            </div>
            <div className="mt-3">
              <TextArea label="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />
            </div>
          </div>
        </form>
      </Modal>

      {/* ===================== VIEW DETAILS MODAL ===================== */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Company Details Workspace"
        size="xl"
        footer={<OutlineButton onClick={() => setIsViewOpen(false)}>Close details</OutlineButton>}
      >
        {selectedCompany && (
          <div className="h-[70vh] overflow-hidden -m-6">
            <EntityDetailsLayout
              title={selectedCompany.companyName}
              subtitle={`${selectedCompany.companyCode} · ${selectedCompany.industry}`}
              avatarText={selectedCompany.companyName?.charAt(0).toUpperCase()}
              status={selectedCompany.status}
              summaryCards={summaryCards}
              tabs={tabList}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              onEditClick={() => { setIsViewOpen(false); handleOpenEdit(selectedCompany); }}
              onClose={() => setIsViewOpen(false)}
            >
              {/* Tab Contents */}
              {activeTab === 'overview' && (
                <div className="grid gap-5 sm:grid-cols-2 text-xs">
                  <InfoRow icon={<Briefcase className="h-4 w-4 text-slate-400" />} label="Company Type" value={selectedCompany.companyType} />
                  <InfoRow icon={<User className="h-4 w-4 text-slate-400" />} label="CEO / Founder" value={selectedCompany.ceo} />
                  <InfoRow icon={<User className="h-4 w-4 text-slate-400" />} label="Account Owner" value={selectedCompany.accountOwner} />
                  <InfoRow icon={<Users className="h-4 w-4 text-slate-400" />} label="Employees" value={selectedCompany.employeeCount?.toLocaleString()} />
                  <InfoRow icon={<DollarSign className="h-4 w-4 text-slate-400" />} label="Annual Revenue" value={selectedCompany.annualRevenue ? `$${Number(selectedCompany.annualRevenue).toLocaleString()}` : null} />
                  <InfoRow icon={<MapPin className="h-4 w-4 text-slate-400" />} label="Location" value={[selectedCompany.city, selectedCompany.state, selectedCompany.country].filter(Boolean).join(', ')} />
                  
                  {selectedCompany.description && (
                    <div className="sm:col-span-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 p-4 shadow-sm">
                      <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-2">Description</p>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">{selectedCompany.description}</p>
                    </div>
                  )}

                  {selectedCompany.notes && (
                    <div className="sm:col-span-2 rounded-xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 p-4 shadow-sm">
                      <p className="text-[10px] font-extrabold uppercase text-amber-500 tracking-wider mb-2">Notes</p>
                      <p className="text-slate-700 dark:text-slate-350 leading-relaxed font-semibold">{selectedCompany.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'leads' && (
                <RelatedTable
                  loading={relatedLoading}
                  data={tabData.leads}
                  emptyMsg="No leads linked to this company."
                  columns={['Name', 'Email', 'Status', 'Source']}
                  renderRow={(l) => (
                    <tr key={l._id} className="hover:bg-slate-50/50 text-xs border-b border-slate-100">
                      <td className="py-3 font-bold text-slate-800">{l.firstName} {l.lastName}</td>
                      <td className="py-3 text-slate-500 font-semibold">{l.email}</td>
                      <td className="py-3"><StatusBadge status={l.status} /></td>
                      <td className="py-3 text-slate-400 font-medium">{l.leadSource}</td>
                    </tr>
                  )}
                />
              )}

              {activeTab === 'contacts' && (
                <RelatedTable
                  loading={relatedLoading}
                  data={tabData.contacts}
                  emptyMsg="No contacts linked to this company."
                  columns={['Name', 'Email', 'Phone', 'Source']}
                  renderRow={(c) => (
                    <tr key={c._id} className="hover:bg-slate-50/50 text-xs border-b border-slate-100">
                      <td className="py-3 font-bold text-slate-800">{c.firstName} {c.lastName}</td>
                      <td className="py-3 text-slate-500 font-semibold">{c.email}</td>
                      <td className="py-3 text-slate-500 font-medium">{c.phone || '—'}</td>
                      <td className="py-3 text-slate-400 font-medium">{c.contactSource}</td>
                    </tr>
                  )}
                />
              )}

              {activeTab === 'deals' && (
                <RelatedTable
                  loading={relatedLoading}
                  data={tabData.deals}
                  emptyMsg="No deals linked to this company."
                  columns={['Deal Name', 'Stage', 'Value', 'Status']}
                  renderRow={(d) => (
                    <tr key={d._id} className="hover:bg-slate-50/50 text-xs border-b border-slate-100">
                      <td className="py-3 font-bold text-slate-800">{d.dealName}</td>
                      <td className="py-3 text-slate-550 font-semibold">{d.stage}</td>
                      <td className="py-3 font-bold text-emerald-700">${Number(d.dealValue || 0).toLocaleString()}</td>
                      <td className="py-3"><StatusBadge status={d.status} /></td>
                    </tr>
                  )}
                />
              )}

              {activeTab === 'meetings' && (
                <RelatedTable
                  loading={relatedLoading}
                  data={tabData.meetings}
                  emptyMsg="No meetings scheduled with this company."
                  columns={['Meeting Topic', 'Format', 'Date & Time', 'Status']}
                  renderRow={(m) => (
                    <tr key={m._id} className="hover:bg-slate-50/50 text-xs border-b border-slate-100">
                      <td className="py-3 font-bold text-slate-800">{m.title}</td>
                      <td className="py-3 text-slate-500 font-semibold">{m.meetingType}</td>
                      <td className="py-3 text-slate-500 font-medium">
                        {new Date(m.meetingDate).toLocaleDateString()} @ {m.startTime}
                      </td>
                      <td className="py-3"><StatusBadge status={m.status} /></td>
                    </tr>
                  )}
                />
              )}

              {activeTab === 'campaigns' && (
                <RelatedTable
                  loading={relatedLoading}
                  data={tabData.campaigns}
                  emptyMsg="No campaigns linked to contacts of this company."
                  columns={['Campaign Name', 'Type', 'Budget', 'Status']}
                  renderRow={(c) => (
                    <tr key={c._id} className="hover:bg-slate-50/50 text-xs border-b border-slate-100">
                      <td className="py-3 font-bold text-slate-800">{c.name}</td>
                      <td className="py-3 text-slate-500 font-semibold">{c.campaignType}</td>
                      <td className="py-3 font-bold text-slate-655">${Number(c.budget || 0).toLocaleString()}</td>
                      <td className="py-3"><StatusBadge status={c.status} /></td>
                    </tr>
                  )}
                />
              )}

              {activeTab === 'documents' && (
                <div className="space-y-4">
                  {/* simulated document form */}
                  <form onSubmit={handleUploadDocument} className="flex gap-2 items-end bg-white dark:bg-slate-900 p-4 border border-slate-200/50 rounded-xl shadow-sm">
                    <div className="flex-1">
                      <TextInput
                        label="Upload Document Simulation"
                        placeholder="invoice_draft.pdf"
                        value={uploadFileName}
                        onChange={(e) => setUploadFileName(e.target.value)}
                      />
                    </div>
                    <PrimaryButton type="submit" disabled={uploadLoading || !uploadFileName.trim()}>
                      <Upload className="h-4 w-4" />
                      {uploadLoading ? 'Uploading...' : 'Upload'}
                    </PrimaryButton>
                  </form>

                  {/* document list */}
                  <RelatedTable
                    loading={relatedLoading}
                    data={tabData.documents}
                    emptyMsg="No files uploaded to this company workspace."
                    columns={['File Name', 'Size', 'Uploaded By', 'Actions']}
                    renderRow={(doc) => (
                      <tr key={doc._id} className="hover:bg-slate-50/50 text-xs border-b border-slate-100">
                        <td className="py-3 font-bold text-slate-800 flex items-center gap-1.5">
                          <FileText className="h-4 w-4 text-slate-400" />
                          <span>{doc.fileName}</span>
                        </td>
                        <td className="py-3 text-slate-500 font-medium">{(doc.fileSize / 1024).toFixed(1)} KB</td>
                        <td className="py-3 text-slate-500 font-medium">{doc.uploadedBy}</td>
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
                    <p className="text-xs text-slate-400 italic text-center py-6">Loading activity log…</p>
                  ) : tabData.activity.length === 0 ? (
                    <p className="text-xs text-slate-405 italic text-center py-6">No logs recorded for this company account.</p>
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

              {activeTab === 'relationship' && (
                <div className="p-1">
                  {relatedLoading ? (
                    <p className="text-xs text-slate-400 italic text-center py-6">Building relationship tree...</p>
                  ) : (
                    <CompanyRelationshipTree
                      company={selectedCompany}
                      leads={tabData.leads}
                      contacts={tabData.contacts}
                      deals={tabData.deals}
                      meetings={tabData.meetings}
                      campaigns={tabData.campaigns}
                      documents={tabData.documents}
                      activities={tabData.activity}
                    />
                  )}
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
        title="Delete Company"
        message={`Are you sure you want to permanently delete "${selectedCompany?.companyName}"? This action cannot be undone.`}
        confirmLabel="Delete Company"
        loading={submitLoading}
      />

      <Toast isOpen={toast.isOpen} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, isOpen: false })} />
    </PageContainer>
  );
}

// ── Helper Row component ──────────────────────────────────────────────────────
function InfoRow({ icon, label, value }) {
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

// ── Reusable Related Records Table ─────────────────────────────────────────────
function RelatedTable({ loading, data = [], emptyMsg, columns, renderRow }) {
  if (loading) return <p className="text-xs text-slate-400 italic text-center py-8">Loading related records…</p>;
  if (!data || !data.length) return <p className="text-xs text-slate-400 italic text-center py-8">{emptyMsg}</p>;
  return (
    <div className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200/50 rounded-xl shadow-sm">
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
