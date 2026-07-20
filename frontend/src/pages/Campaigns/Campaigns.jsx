import React, { useState, useEffect, useCallback } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import SectionCard from '../../components/cards/SectionCard';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import OutlineButton from '../../components/buttons/OutlineButton';
import SearchInput from '../../components/forms/SearchInput';
import SelectInput from '../../components/forms/SelectInput';
import TextInput from '../../components/forms/TextInput';
import NumberInput from '../../components/forms/NumberInput';
import TextArea from '../../components/forms/TextArea';
import MultiSelect from '../../components/forms/MultiSelect';
import DataTable from '../../components/table/DataTable';
import Pagination from '../../components/pagination/Pagination';
import StatusBadge from '../../components/badges/StatusBadge';
import IconButton from '../../components/buttons/IconButton';
import Modal from '../../components/modal/Modal';
import ConfirmDialog from '../../components/modal/ConfirmDialog';
import Toast from '../../components/toast/Toast';
import CampaignService from '../../services/CampaignService';
import ContactService from '../../services/ContactService';
import { Megaphone, Plus, Eye, Edit2, Trash2, Mail, Users, Globe, Calendar, RefreshCw, AlertCircle, TrendingUp, DollarSign, FileText, User } from 'lucide-react';

export default function Campaigns() {
  // Campaigns & Pagination state
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    totalRecords: 0,
    totalPages: 1,
    currentPage: 1,
    recordsPerPage: 10
  });

  // Query & Filters state
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [currentPage, setCurrentPage] = useState(1);

  // Contacts list for selector in modal
  const [contactsList, setContactsList] = useState([]);

  // Modals & Dialog Toggles
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Selected Campaign Context
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Toast Alerts
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });

  // Form Inputs & Validation State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    campaignType: 'Email Campaign',
    status: 'Draft',
    budget: '',
    startDate: '',
    endDate: '',
    owner: '',
    associatedContacts: [],
    expectedRevenue: '',
    actualRevenue: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch contacts for selector dropdown/multiselect
  const fetchContacts = async () => {
    try {
      const response = await ContactService.getContacts({ limit: 200 });
      if (response.data?.success) {
        setContactsList(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load contacts list', err);
    }
  };

  // Fetch campaigns callback from service
  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await CampaignService.getCampaigns({
        search,
        campaignType: typeFilter,
        status: statusFilter,
        date: dateFilter,
        sort: sortBy,
        page: currentPage,
        limit: 10
      });
      if (response.data && response.data.success) {
        setCampaigns(response.data.data);
        setPagination(response.data.pagination);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch campaigns');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Network error occurred while fetching campaigns.');
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, statusFilter, dateFilter, sortBy, currentPage]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Reset page number on search criteria update
  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter, statusFilter, dateFilter]);

  const showToast = (message, type = 'success') => {
    setToast({ isOpen: true, message, type });
  };

  // Open add modal
  const handleOpenAdd = () => {
    setIsEditing(false);
    fetchContacts();
    setFormData({
      name: '',
      description: '',
      campaignType: 'Email Campaign',
      status: 'Draft',
      budget: '',
      startDate: '',
      endDate: '',
      owner: '',
      associatedContacts: [],
      expectedRevenue: '',
      actualRevenue: '',
      notes: ''
    });
    setFormErrors({});
    setIsAddEditOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (campaign) => {
    setIsEditing(true);
    setSelectedCampaign(campaign);
    fetchContacts();

    // Format Date strings to YYYY-MM-DD
    const formattedStart = campaign.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : '';
    const formattedEnd = campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : '';

    setFormData({
      name: campaign.name || '',
      description: campaign.description || '',
      campaignType: campaign.campaignType || 'Email Campaign',
      status: campaign.status || 'Draft',
      budget: campaign.budget || '',
      startDate: formattedStart,
      endDate: formattedEnd,
      owner: campaign.owner || '',
      associatedContacts: campaign.associatedContacts?.map(c => c._id) || [],
      expectedRevenue: campaign.expectedRevenue || '',
      actualRevenue: campaign.actualRevenue || '',
      notes: campaign.notes || ''
    });
    setFormErrors({});
    setIsAddEditOpen(true);
  };

  // Open view modal
  const handleOpenView = async (campaign) => {
    setLoading(true);
    try {
      const response = await CampaignService.getCampaign(campaign._id);
      if (response.data?.success) {
        setSelectedCampaign(response.data.data);
        setIsViewOpen(true);
      } else {
        throw new Error(response.data?.message || 'Failed to load campaign detail');
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to load details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Open delete dialog
  const handleOpenDelete = (campaign) => {
    setSelectedCampaign(campaign);
    setIsDeleteOpen(true);
  };

  // Validate form inputs
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Campaign name is required';
    if (!formData.campaignType) errors.campaignType = 'Campaign type is required';
    if (!formData.status) errors.status = 'Campaign status is required';
    if (formData.budget === '' || formData.budget === null) {
      errors.budget = 'Budget is required';
    } else if (Number(formData.budget) < 0) {
      errors.budget = 'Budget must be positive';
    }
    if (!formData.startDate) errors.startDate = 'Start date is required';
    if (!formData.endDate) {
      errors.endDate = 'End date is required';
    } else if (formData.startDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      errors.endDate = 'End date cannot be earlier than start date';
    }

    if (formData.expectedRevenue !== '' && Number(formData.expectedRevenue) < 0) {
      errors.expectedRevenue = 'Expected revenue must be positive';
    }
    if (formData.actualRevenue !== '' && Number(formData.actualRevenue) < 0) {
      errors.actualRevenue = 'Actual revenue must be positive';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Create or Update Campaign Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitLoading(true);
    try {
      if (isEditing) {
        const response = await CampaignService.updateCampaign(selectedCampaign._id, formData);
        if (response.data.success) {
          showToast('Campaign updated successfully!', 'success');
          setIsAddEditOpen(false);
          fetchCampaigns();
        } else {
          throw new Error(response.data.message);
        }
      } else {
        const response = await CampaignService.createCampaign(formData);
        if (response.data.success) {
          showToast('Campaign created successfully!', 'success');
          setIsAddEditOpen(false);
          fetchCampaigns();
        } else {
          throw new Error(response.data.message);
        }
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || err.message || 'An error occurred during submission.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Delete Campaign Confirm Action
  const handleConfirmDelete = async () => {
    setSubmitLoading(true);
    try {
      const response = await CampaignService.deleteCampaign(selectedCampaign._id);
      if (response.data.success) {
        showToast('Campaign deleted successfully!', 'success');
        setIsDeleteOpen(false);
        fetchCampaigns();
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || err.message || 'Failed to delete campaign.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Table Columns mapping
  const columns = [
    {
      key: 'name',
      header: 'Campaign Name',
      render: (row) => {
        const getIcon = () => {
          if (row.campaignType === 'Email Campaign') return <Mail className="h-4.5 w-4.5" />;
          if (row.campaignType === 'LinkedIn Campaign') return <Globe className="h-4.5 w-4.5" />;
          return <Megaphone className="h-4.5 w-4.5" />;
        };
        return (
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
              {getIcon()}
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 text-xs">{row.name}</h4>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{row.campaignType}</span>
            </div>
          </div>
        );
      }
    },
    { key: 'campaignType', header: 'Type' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'budget',
      header: 'Budget',
      render: (row) => <span>${Number(row.budget).toLocaleString()}</span>
    },
    {
      key: 'contacts',
      header: 'Contacts',
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
          <Users className="h-3 w-3 text-slate-400" />
          {row.associatedContacts?.length || 0}
        </span>
      )
    },
    {
      key: 'startDate',
      header: 'Start Date',
      render: (row) => new Date(row.startDate).toLocaleDateString()
    },
    {
      key: 'endDate',
      header: 'End Date',
      render: (row) => new Date(row.endDate).toLocaleDateString()
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <IconButton variant="ghost" icon={<Eye className="h-4 w-4" />} title="View Details" onClick={() => handleOpenView(row)} />
          <IconButton variant="ghost" icon={<Edit2 className="h-4 w-4" />} title="Edit Campaign" onClick={() => handleOpenEdit(row)} />
          <IconButton variant="danger" icon={<Trash2 className="h-4 w-4" />} title="Delete Campaign" onClick={() => handleOpenDelete(row)} />
        </div>
      )
    }
  ];

  return (
    <PageContainer>
      {/* Compact Page Toolbar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">Marketing Campaigns</h1>
          <p className="text-xs text-slate-500 mt-0.5">Launch targeted segments, trace budget metrics, and monitor outreach revenues.</p>
        </div>
        <div className="flex items-center gap-2">
          <OutlineButton onClick={fetchCampaigns} title="Refresh Table data">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </OutlineButton>
          <PrimaryButton onClick={handleOpenAdd}>
            <Megaphone className="h-4.5 w-4.5" />
            Create Campaign
          </PrimaryButton>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-rose-100 bg-rose-50/50 p-4 text-sm text-rose-800">
          <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold">Failed to fetch database items</h4>
            <p className="mt-0.5 text-xs text-rose-700/80">{error}</p>
          </div>
        </div>
      )}

      {/* Filters Row */}
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[180px]">
          <SearchInput
            label="Search"
            placeholder="Search by name, description, or owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="min-w-[140px]">
          <SelectInput
            label="Campaign Type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Types' },
              { value: 'Email Campaign', label: 'Email Campaign' },
              { value: 'LinkedIn Campaign', label: 'LinkedIn Campaign' },
              { value: 'Google Ads', label: 'Google Ads' },
              { value: 'Meta Ads', label: 'Meta Ads' },
              { value: 'Webinar', label: 'Webinar' },
              { value: 'Trade Show', label: 'Trade Show' },
              { value: 'Referral', label: 'Referral' },
              { value: 'Product Launch', label: 'Product Launch' },
              { value: 'Custom', label: 'Custom' }
            ]}
          />
        </div>
        <div className="min-w-[130px]">
          <SelectInput
            label="Timeline Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'Draft', label: 'Draft' },
              { value: 'Planned', label: 'Planned' },
              { value: 'Active', label: 'Active' },
              { value: 'Paused', label: 'Paused' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Cancelled', label: 'Cancelled' }
            ]}
          />
        </div>
        <div className="min-w-[150px]">
          <TextInput
            label="Filter By Date"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Campaigns Table */}
      <DataTable
        columns={columns}
        data={campaigns}
        loading={loading}
        emptyTitle="No Campaigns Found"
        emptyDescription="We couldn't find any marketing campaigns matching your active query."
        emptyAction={
          <PrimaryButton onClick={handleOpenAdd}>
            Create First Campaign
          </PrimaryButton>
        }
      />

      {/* Pagination component */}
      {!loading && campaigns.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalRecords={pagination.totalRecords}
          recordsPerPage={pagination.recordsPerPage}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}

      {/* Add / Edit Modal Form */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={isEditing ? 'Modify Campaign Details' : 'Launch New CRM Campaign'}
        footer={
          <>
            <OutlineButton onClick={() => setIsAddEditOpen(false)} disabled={submitLoading}>
              Cancel
            </OutlineButton>
            <PrimaryButton onClick={handleSubmit} loading={submitLoading}>
              {isEditing ? 'Save Changes' : 'Launch Campaign'}
            </PrimaryButton>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <TextInput
            label="Campaign Name"
            placeholder="e.g. Q3 Email Re-engagement Flow"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
          />
          <TextArea
            label="Campaign Description"
            placeholder="Add scope details or marketing objectives..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            error={formErrors.description}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectInput
              label="Campaign Outreach Format Type"
              value={formData.campaignType}
              onChange={(e) => setFormData({ ...formData, campaignType: e.target.value })}
              options={[
                { value: 'Email Campaign', label: 'Email Campaign' },
                { value: 'LinkedIn Campaign', label: 'LinkedIn Campaign' },
                { value: 'Google Ads', label: 'Google Ads' },
                { value: 'Meta Ads', label: 'Meta Ads' },
                { value: 'Webinar', label: 'Webinar' },
                { value: 'Trade Show', label: 'Trade Show' },
                { value: 'Referral', label: 'Referral' },
                { value: 'Product Launch', label: 'Product Launch' },
                { value: 'Custom', label: 'Custom' }
              ]}
              error={formErrors.campaignType}
            />
            <SelectInput
              label="Campaign Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'Draft', label: 'Draft' },
                { value: 'Planned', label: 'Planned' },
                { value: 'Active', label: 'Active' },
                { value: 'Paused', label: 'Paused' },
                { value: 'Completed', label: 'Completed' },
                { value: 'Cancelled', label: 'Cancelled' }
              ]}
              error={formErrors.status}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <NumberInput
              label="Allocated Budget ($)"
              placeholder="e.g. 5000"
              required
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              error={formErrors.budget}
            />
            <TextInput
              label="Start Date"
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              error={formErrors.startDate}
            />
            <TextInput
              label="End Date"
              type="date"
              required
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              error={formErrors.endDate}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="Campaign Owner"
              placeholder="e.g. Sales Marketing Team"
              value={formData.owner}
              onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
              error={formErrors.owner}
            />
            <NumberInput
              label="Expected Revenue ($)"
              placeholder="e.g. 15000"
              value={formData.expectedRevenue}
              onChange={(e) => setFormData({ ...formData, expectedRevenue: e.target.value })}
              error={formErrors.expectedRevenue}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <NumberInput
              label="Actual Revenue ($)"
              placeholder="e.g. 12000"
              value={formData.actualRevenue}
              onChange={(e) => setFormData({ ...formData, actualRevenue: e.target.value })}
              error={formErrors.actualRevenue}
            />
            <MultiSelect
              label="Select Associated Contacts"
              options={contactsList.map(c => ({ value: c._id, label: `${c.firstName} ${c.lastName} (${c.company})` }))}
              selectedValues={formData.associatedContacts}
              onChange={(vals) => setFormData({ ...formData, associatedContacts: vals })}
              error={formErrors.associatedContacts}
            />
          </div>

          <TextArea
            label="Internal Notes / Takeaways"
            placeholder="Add key findings, marketing lists details, or conversion analysis..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            error={formErrors.notes}
          />
        </form>
      </Modal>

      {/* Delete Campaign Confirm Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Cancel & Archive Campaign"
        message={`Are you sure you want to permanently delete the marketing campaign "${selectedCampaign?.name}"? All associated revenue metrics and timeline listings will be deleted.`}
        confirmText="Yes, Archive"
        cancelText="Cancel"
        variant="danger"
        loading={submitLoading}
      />

      {/* Campaign Details Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Campaign Analysis Report"
        footer={
          <OutlineButton onClick={() => setIsViewOpen(false)}>
            Close View
          </OutlineButton>
        }
      >
        {selectedCampaign && (
          <div className="space-y-4 text-left">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">{selectedCampaign.name}</h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">{selectedCampaign.description || 'No description provided'}</p>
            </div>

            <div className="grid gap-4 grid-cols-2 text-xs">
              <div>
                <p className="font-bold uppercase tracking-wider text-slate-400 font-bold">Outreach Channel Type</p>
                <p className="mt-0.5 text-slate-700 font-medium">{selectedCampaign.campaignType}</p>
              </div>
              <div>
                <p className="font-bold uppercase tracking-wider text-slate-400 font-bold">Campaign Status</p>
                <div className="mt-1"><StatusBadge status={selectedCampaign.status} /></div>
              </div>
              <div>
                <p className="font-bold uppercase tracking-wider text-slate-400 font-bold">Start Date</p>
                <p className="mt-0.5 text-slate-700 font-medium flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  {new Date(selectedCampaign.startDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="font-bold uppercase tracking-wider text-slate-400 font-bold">End Date</p>
                <p className="mt-0.5 text-slate-700 font-medium flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  {new Date(selectedCampaign.endDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="font-bold uppercase tracking-wider text-slate-400 font-bold">Campaign Owner</p>
                <p className="mt-0.5 text-slate-700 font-medium flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  {selectedCampaign.owner || 'Unassigned'}
                </p>
              </div>
              <div>
                <p className="font-bold uppercase tracking-wider text-slate-400 font-bold">Allocated Budget</p>
                <p className="mt-0.5 text-slate-700 font-bold flex items-center gap-0.5">
                  <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                  {Number(selectedCampaign.budget).toLocaleString()}
                </p>
              </div>

              {/* Revenue Summary Section */}
              <div className="col-span-2 border-t border-slate-100 pt-3">
                <p className="font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-slate-400" />
                  Outreach Revenue Summary
                </p>
                <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-150 p-2.5 rounded-lg">
                  <div>
                    <h6 className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Expected Revenue</h6>
                    <p className="text-xs font-bold text-slate-700 mt-0.5 flex items-center gap-0.5">
                      <DollarSign className="h-3 w-3 text-slate-400" />
                      {selectedCampaign.expectedRevenue ? Number(selectedCampaign.expectedRevenue).toLocaleString() : '0'}
                    </p>
                  </div>
                  <div>
                    <h6 className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Actual Revenue Generated</h6>
                    <p className="text-xs font-bold text-emerald-700 mt-0.5 flex items-center gap-0.5">
                      <DollarSign className="h-3 w-3 text-emerald-500" />
                      {selectedCampaign.actualRevenue ? Number(selectedCampaign.actualRevenue).toLocaleString() : '0'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Associated Contacts timeline/list */}
              <div className="col-span-2 border-t border-slate-100 pt-3">
                <p className="font-bold uppercase tracking-wider text-slate-400 mb-2 font-bold flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-slate-400" />
                  Associated Marketing Contacts ({selectedCampaign.associatedContacts?.length || 0})
                </p>
                {selectedCampaign.associatedContacts?.length === 0 ? (
                  <p className="text-xs text-slate-450 italic">No associated contacts.</p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2 max-h-[160px] overflow-y-auto pr-1">
                    {selectedCampaign.associatedContacts?.map(c => (
                      <div key={c._id} className="flex flex-col p-2 bg-slate-50 border border-slate-150 rounded-lg hover:border-indigo-200 transition">
                        <span className="font-bold text-slate-800 text-[11px]">{c.firstName} {c.lastName}</span>
                        <span className="text-[9px] text-slate-400 font-semibold">{c.company}</span>
                        <span className="text-[9px] text-slate-400 truncate mt-0.5">{c.email}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedCampaign.notes && (
                <div className="col-span-2 border-t border-slate-100 pt-3">
                  <p className="font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-slate-400" />
                    Internal Notes / Comments
                  </p>
                  <div className="bg-slate-50/70 rounded-lg p-2.5 text-slate-650 border border-slate-150 whitespace-pre-wrap">
                    {selectedCampaign.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Toasts */}
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />
    </PageContainer>
  );
}
