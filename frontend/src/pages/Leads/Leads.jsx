import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import SectionCard from '../../components/cards/SectionCard';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import OutlineButton from '../../components/buttons/OutlineButton';
import SearchInput from '../../components/forms/SearchInput';
import SelectInput from '../../components/forms/SelectInput';
import TextInput from '../../components/forms/TextInput';
import EmailInput from '../../components/forms/EmailInput';
import PhoneInput from '../../components/forms/PhoneInput';
import TextArea from '../../components/forms/TextArea';
import DataTable from '../../components/table/DataTable';
import Pagination from '../../components/pagination/Pagination';
import StatusBadge from '../../components/badges/StatusBadge';
import IconButton from '../../components/buttons/IconButton';
import Modal from '../../components/modal/Modal';
import ConfirmDialog from '../../components/modal/ConfirmDialog';
import Toast from '../../components/toast/Toast';
import LeadService from '../../services/LeadService';
import ContactService from '../../services/ContactService';
import MeetingService from '../../services/MeetingService';
import SavedFilterService from '../../services/SavedFilterService';
import {
  Target,
  Plus,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  AlertCircle,
  Calendar,
  Check,
  ArrowUpRight,
  Clock,
  Download,
  Upload,
  Sliders,
  Bookmark,
  Trash,
  Settings,
  ChevronDown
} from 'lucide-react';

export default function Leads() {
  const location = useLocation();
  const navigate = useNavigate();

  // Leads & Pagination State
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    totalRecords: 0,
    totalPages: 1,
    currentPage: 1,
    recordsPerPage: 10
  });

  // Query/Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [currentPage, setCurrentPage] = useState(1);

  // Bulk Operations State
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  // Saved Filters State
  const [savedFilters, setSavedFilters] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [isSaveFilterOpen, setIsSaveFilterOpen] = useState(false);

  // CSV Import State
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importPreview, setImportPreview] = useState([]);
  const [importErrors, setImportErrors] = useState([]);
  const [csvRawText, setCsvRawText] = useState('');

  // Column Visibility States
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem('crm_leads_columns');
    return saved ? JSON.parse(saved) : ['select', 'name', 'company', 'email', 'phone', 'leadSource', 'status', 'createdAt', 'actions'];
  });
  const [isColumnManagerOpen, setIsColumnManagerOpen] = useState(false);

  // Modals Toggles
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Selected Contexts
  const [selectedLead, setSelectedLead] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Toast Alerts
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });

  // Associated meetings timeline state
  const [leadMeetings, setLeadMeetings] = useState([]);
  const [meetingsLoading, setMeetingsLoading] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    title: '',
    meetingDate: '',
    startTime: '',
    meetingType: 'Video Conference',
    notes: ''
  });
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  // Form Inputs State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    leadSource: 'Web Referral',
    status: 'New',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ isOpen: true, message, type });
  };

  // Fetch leads callback
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await LeadService.getLeads({
        search,
        status: statusFilter,
        leadSource: sourceFilter,
        sort: sortBy,
        page: currentPage,
        limit: 10
      });
      if (response.data && response.data.success) {
        setLeads(response.data.data);
        setPagination(response.data.pagination);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch leads');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Network error occurred while fetching leads.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sourceFilter, sortBy, currentPage]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Load associated meetings when details modal is shown
  const fetchLeadMeetings = useCallback(async (leadId) => {
    setMeetingsLoading(true);
    try {
      const response = await MeetingService.getMeetings({ relatedLeadId: leadId });
      if (response.data?.success) {
        setLeadMeetings(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load meetings for lead', err);
    } finally {
      setMeetingsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isViewOpen && selectedLead) {
      fetchLeadMeetings(selectedLead._id);
    }
  }, [isViewOpen, selectedLead, fetchLeadMeetings]);

  // Check URL query parameters for direct record lookup
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const leadId = params.get('id');
    if (leadId && leads.length > 0) {
      const match = leads.find(l => l._id === leadId);
      if (match) {
        setSelectedLead(match);
        setIsViewOpen(true);
        // Clear search query parameters to clean layout URL
        navigate(location.pathname, { replace: true });
      }
    }
  }, [location.search, leads, navigate]);

  // Fetch saved filters list
  const fetchSavedFilters = useCallback(async () => {
    try {
      const response = await SavedFilterService.getSavedFilters('leads');
      if (response.data?.success) {
        setSavedFilters(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load saved filters', err);
    }
  }, []);

  useEffect(() => {
    fetchSavedFilters();
  }, [fetchSavedFilters]);

  // Reset page number on search criteria update
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [search, statusFilter, sourceFilter]);

  // Save Column preferences
  const saveColumnPreferences = (columns) => {
    setVisibleColumns(columns);
    localStorage.setItem('crm_leads_columns', JSON.stringify(columns));
  };

  // CSV text parser
  const parseCSV = (text) => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l !== '');
    if (lines.length === 0) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    const results = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      if (values.length !== headers.length) continue;
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx];
      });
      results.push(row);
    }
    return results;
  };

  // Export dataset to CSV
  const handleExportCSV = (exportSelected = false) => {
    const exportData = exportSelected
      ? leads.filter(l => selectedIds.includes(l._id))
      : leads;

    if (exportData.length === 0) {
      showToast('No records selected for export', 'warning');
      return;
    }

    const columnsToExport = [
      { key: 'firstName', header: 'First Name' },
      { key: 'lastName', header: 'Last Name' },
      { key: 'email', header: 'Email' },
      { key: 'phone', header: 'Phone' },
      { key: 'company', header: 'Company' },
      { key: 'jobTitle', header: 'Job Title' },
      { key: 'leadSource', header: 'Lead Source' },
      { key: 'status', header: 'Status' }
    ];

    const headerRow = columnsToExport.map(col => col.header).join(',');
    const dataRows = exportData.map(row => 
      columnsToExport.map(col => {
        const val = row[col.key] || '';
        const cleanVal = String(val).replace(/"/g, '""');
        return `"${cleanVal}"`;
      }).join(',')
    );

    const csvContent = [headerRow, ...dataRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Leads exported successfully!', 'success');
  };

  // Handle CSV file upload
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setCsvRawText(text);
      const parsed = parseCSV(text);
      setImportPreview(parsed.slice(0, 5)); // show preview of first 5 rows
    };
    reader.readAsText(file);
  };

  // Submit CSV dataset import
  const handleImportSubmit = async () => {
    if (!csvRawText) return;
    const parsed = parseCSV(csvRawText);
    setSubmitLoading(true);
    try {
      const response = await LeadService.importLeads({ leads: parsed });
      if (response.data?.success) {
        showToast(response.data.message, 'success');
        setIsImportOpen(false);
        setImportPreview([]);
        setCsvRawText('');
        fetchLeads();
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || err.message || 'CSV Import failed.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Save Filter params callback
  const handleSaveFilter = async () => {
    if (!filterName.trim()) return;
    try {
      const response = await SavedFilterService.createSavedFilter({
        name: filterName,
        module: 'leads',
        filters: { search, statusFilter, sourceFilter, sortBy }
      });
      if (response.data?.success) {
        showToast('Filter saved successfully!', 'success');
        setIsSaveFilterOpen(false);
        setFilterName('');
        fetchSavedFilters();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to save filter settings', 'error');
    }
  };

  // Load Saved Filter state
  const handleLoadFilter = (filter) => {
    if (filter.filters.search !== undefined) setSearch(filter.filters.search);
    if (filter.filters.statusFilter !== undefined) setStatusFilter(filter.filters.statusFilter);
    if (filter.filters.sourceFilter !== undefined) setSourceFilter(filter.filters.sourceFilter);
    if (filter.filters.sortBy !== undefined) setSortBy(filter.filters.sortBy);
    showToast(`Loaded filter "${filter.name}"`, 'success');
  };

  // Clear all active filters
  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setSourceFilter('ALL');
    setSortBy('-createdAt');
    showToast('Filters cleared', 'info');
  };

  // Delete Saved Filter
  const handleDeleteFilter = async (id, e) => {
    e.stopPropagation();
    try {
      const response = await SavedFilterService.deleteSavedFilter(id);
      if (response.data?.success) {
        showToast('Filter deleted successfully', 'success');
        fetchSavedFilters();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Bulk update handler
  const handleBulkUpdate = async () => {
    if (selectedIds.length === 0 || !bulkStatus) return;
    setBulkLoading(true);
    try {
      const response = await LeadService.bulkUpdateLeads({ ids: selectedIds, status: bulkStatus });
      if (response.data?.success) {
        showToast(response.data.message, 'success');
        setSelectedIds([]);
        setBulkStatus('');
        fetchLeads();
      }
    } catch (err) {
      console.error(err);
      showToast('Bulk update operation failed', 'error');
    } finally {
      setBulkLoading(false);
    }
  };

  // Bulk delete confirm action
  const handleBulkConfirmDelete = async () => {
    setBulkLoading(true);
    try {
      const response = await LeadService.bulkDeleteLeads({ ids: selectedIds });
      if (response.data?.success) {
        showToast(response.data.message, 'success');
        setSelectedIds([]);
        setIsBulkDeleteOpen(false);
        fetchLeads();
      }
    } catch (err) {
      console.error(err);
      showToast('Bulk delete operation failed', 'error');
    } finally {
      setBulkLoading(false);
    }
  };

  // Single Lead conversions
  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      jobTitle: '',
      leadSource: 'Web Referral',
      status: 'New',
      notes: ''
    });
    setFormErrors({});
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (lead) => {
    setIsEditing(true);
    setSelectedLead(lead);
    setFormData({
      firstName: lead.firstName || '',
      lastName: lead.lastName || '',
      email: lead.email || '',
      phone: lead.phone || '',
      company: lead.company || '',
      jobTitle: lead.jobTitle || '',
      leadSource: lead.leadSource || 'Web Referral',
      status: lead.status || 'New',
      notes: lead.notes || ''
    });
    setFormErrors({});
    setIsAddEditOpen(true);
  };

  const handleOpenView = (lead) => {
    setSelectedLead(lead);
    setIsViewOpen(true);
  };

  const handleOpenDelete = (lead) => {
    setSelectedLead(lead);
    setIsDeleteOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.company.trim()) errors.company = 'Company descriptor is required';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email address format';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitLoading(true);
    try {
      if (isEditing) {
        const response = await LeadService.updateLead(selectedLead._id, formData);
        if (response.data.success) {
          showToast('Lead updated successfully!', 'success');
          setIsAddEditOpen(false);
          fetchLeads();
        }
      } else {
        const response = await LeadService.createLead(formData);
        if (response.data.success) {
          showToast('Lead created successfully!', 'success');
          setIsAddEditOpen(false);
          fetchLeads();
        }
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || err.message || 'An error occurred during submission.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    setSubmitLoading(true);
    try {
      const response = await LeadService.deleteLead(selectedLead._id);
      if (response.data.success) {
        showToast('Lead deleted successfully!', 'success');
        setIsDeleteOpen(false);
        fetchLeads();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || err.message || 'Failed to delete lead.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!scheduleData.title.trim() || !scheduleData.meetingDate || !scheduleData.startTime) {
      showToast('Please fill out all required meeting fields', 'error');
      return;
    }
    setSubmitLoading(true);
    try {
      const response = await MeetingService.createMeeting({
        ...scheduleData,
        relatedType: 'Lead',
        relatedLeadId: selectedLead._id,
        status: 'Scheduled'
      });
      if (response.data.success) {
        showToast('Meeting scheduled successfully!', 'success');
        setIsScheduleOpen(false);
        fetchLeadMeetings(selectedLead._id);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to schedule meeting', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Define Columns array
  const columnsList = [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          checked={selectedIds.length === leads.length && leads.length > 0}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedIds(leads.map(l => l._id));
            } else {
              setSelectedIds([]);
            }
          }}
          className="rounded border-slate-350 text-indigo-600 focus:ring-indigo-100"
        />
      ),
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(row._id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedIds([...selectedIds, row._id]);
            } else {
              setSelectedIds(selectedIds.filter(id => id !== row._id));
            }
          }}
          className="rounded border-slate-350 text-indigo-600 focus:ring-indigo-100"
        />
      )
    },
    {
      key: 'name',
      header: 'Name',
      render: (row) => (
        <div className="font-bold text-slate-800 text-xs">
          {row.firstName} {row.lastName}
          {row.jobTitle && <span className="block text-[10px] font-normal text-slate-400 mt-0.5">{row.jobTitle}</span>}
        </div>
      )
    },
    { key: 'company', header: 'Company' },
    { key: 'email', header: 'Email Address' },
    { key: 'phone', header: 'Phone' },
    { key: 'leadSource', header: 'Lead Source' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'createdAt',
      header: 'Created Date',
      render: (row) => new Date(row.createdAt).toLocaleDateString()
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <IconButton variant="ghost" icon={<Eye className="h-4 w-4" />} title="View Details" onClick={() => handleOpenView(row)} />
          <IconButton variant="ghost" icon={<Edit2 className="h-4 w-4" />} title="Edit Lead" onClick={() => handleOpenEdit(row)} />
          <IconButton variant="danger" icon={<Trash2 className="h-4 w-4" />} title="Delete Lead" onClick={() => handleOpenDelete(row)} />
        </div>
      )
    }
  ];

  // Filter columns based on preferences
  const activeColumns = columnsList.filter(col => visibleColumns.includes(col.key));

  return (
    <PageContainer>
      {/* Compact Page Toolbar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">Leads Pipeline</h1>
          <p className="text-xs text-slate-500 mt-0.5">Qualify prospect accounts and monitor active sales engagements.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <OutlineButton onClick={() => setIsColumnManagerOpen(true)} title="Column Management">
            <Sliders className="h-4 w-4" />
          </OutlineButton>
          <OutlineButton onClick={() => setIsImportOpen(true)} title="Import CSV leads dataset">
            <Upload className="h-4 w-4" />
          </OutlineButton>
          <OutlineButton onClick={() => handleExportCSV(false)} title="Export all leads to CSV">
            <Download className="h-4 w-4" />
          </OutlineButton>
          <OutlineButton onClick={fetchLeads} title="Refresh Table data">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </OutlineButton>
          <PrimaryButton onClick={handleOpenAdd}>
            <Plus className="h-4.5 w-4.5" />
            Add Lead
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
        <div className="flex-1 min-w-[200px]">
          <SearchInput
            label="Search"
            placeholder="Search by name, company, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="min-w-[140px]">
          <SelectInput
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'New', label: 'New' },
              { value: 'Contacted', label: 'Contacted' },
              { value: 'Qualified', label: 'Qualified' },
              { value: 'Lost', label: 'Lost' }
            ]}
          />
        </div>
        <div className="min-w-[140px]">
          <SelectInput
            label="Lead Source"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Sources' },
              { value: 'Web Referral', label: 'Web Referral' },
              { value: 'Direct Outreach', label: 'Direct Outreach' },
              { value: 'Partner Referral', label: 'Partner Referral' },
              { value: 'Cold Email', label: 'Cold Email' },
              { value: 'Other', label: 'Other' }
            ]}
          />
        </div>
        <div className="min-w-[140px]">
          <SelectInput
            label="Sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: '-createdAt', label: 'Newest First' },
              { value: 'createdAt', label: 'Oldest First' },
              { value: 'company', label: 'Company A-Z' },
              { value: '-company', label: 'Company Z-A' }
            ]}
          />
        </div>
        <div className="flex items-end gap-2">
          <OutlineButton size="xs" onClick={() => setIsSaveFilterOpen(true)} title="Save current filters">
            <Bookmark className="h-3.5 w-3.5" />
          </OutlineButton>
          <OutlineButton size="xs" onClick={handleClearFilters} className="text-xs border-slate-200 hover:bg-slate-50">
            Clear
          </OutlineButton>
        </div>
      </div>

      {/* Saved Filters chips */}
      {savedFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {savedFilters.map((f) => (
            <div
              key={f._id}
              className="group flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600 cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition"
              onClick={() => handleLoadFilter(f)}
            >
              <Bookmark className="h-3 w-3" />
              {f.name}
              <button
                onClick={(e) => handleDeleteFilter(f._id, e)}
                className="opacity-0 group-hover:opacity-100 ml-0.5 text-rose-400 hover:text-rose-600 transition"
              >
                <Trash className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Bulk Operations Action Bar */}
      {selectedIds.length > 0 && (
        <div className="sticky bottom-4 z-40 flex items-center justify-between gap-4 rounded-xl border border-indigo-150 bg-indigo-50/95 px-5 py-3 shadow-lg backdrop-blur-md animate-in slide-in-from-bottom-2 duration-200 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-800">
              {selectedIds.length} leads selected
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <SelectInput
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              options={[
                { value: '', label: 'Bulk Status Update...' },
                { value: 'New', label: 'New' },
                { value: 'Contacted', label: 'Contacted' },
                { value: 'Qualified', label: 'Qualified' },
                { value: 'Lost', label: 'Lost' }
              ]}
            />
            <PrimaryButton onClick={handleBulkUpdate} disabled={bulkLoading || !bulkStatus} size="sm">
              Apply Update
            </PrimaryButton>
            <OutlineButton onClick={() => handleExportCSV(true)} size="sm" className="border-indigo-200 text-indigo-700 bg-white hover:bg-indigo-50">
              <Download className="h-4 w-4 mr-1 shrink-0" />
              Export Selected
            </OutlineButton>
            <IconButton variant="danger" icon={<Trash className="h-4 w-4" />} title="Bulk Delete" onClick={() => setIsBulkDeleteOpen(true)} />
          </div>
        </div>
      )}

      {/* Leads Table */}
      <DataTable
        columns={activeColumns}
        data={leads}
        loading={loading}
        emptyTitle="No Leads Found"
        emptyDescription="Get started by creating a lead or uploading a CSV segment."
        emptyAction={
          <PrimaryButton onClick={handleOpenAdd}>
            Create Lead Invite
          </PrimaryButton>
        }
      />

      {/* Pagination component */}
      {!loading && leads.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalRecords={pagination.totalRecords}
          recordsPerPage={pagination.recordsPerPage}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}

      {/* Saved Filter Save Name Modal */}
      <Modal
        isOpen={isSaveFilterOpen}
        onClose={() => setIsSaveFilterOpen(false)}
        title="Save Query Filter layout"
        footer={
          <>
            <OutlineButton onClick={() => setIsSaveFilterOpen(false)}>
              Cancel
            </OutlineButton>
            <PrimaryButton onClick={handleSaveFilter}>
              Save Filters
            </PrimaryButton>
          </>
        }
      >
        <TextInput
          label="Filter Name"
          placeholder="e.g. My Qualified Leads"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
        />
      </Modal>

      {/* Column Visibility Manager Modal */}
      <Modal
        isOpen={isColumnManagerOpen}
        onClose={() => setIsColumnManagerOpen(false)}
        title="Manage Columns Visibility"
        footer={
          <PrimaryButton onClick={() => setIsColumnManagerOpen(false)}>
            Apply Settings
          </PrimaryButton>
        }
      >
        <div className="grid grid-cols-2 gap-3 text-xs">
          {[
            { key: 'select', label: 'Bulk Checkboxes' },
            { key: 'name', label: 'Lead Name' },
            { key: 'company', label: 'Company' },
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Phone' },
            { key: 'leadSource', label: 'Lead Source' },
            { key: 'status', label: 'Pipeline Status' },
            { key: 'createdAt', label: 'Created Date' },
            { key: 'actions', label: 'Action Buttons' }
          ].map((col) => {
            const isVisible = visibleColumns.includes(col.key);
            return (
              <label key={col.key} className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={() => {
                    if (isVisible) {
                      saveColumnPreferences(visibleColumns.filter(k => k !== col.key));
                    } else {
                      saveColumnPreferences([...visibleColumns, col.key]);
                    }
                  }}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-100"
                />
                {col.label}
              </label>
            );
          })}
        </div>
      </Modal>

      {/* Import CSV Modal */}
      <Modal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        title="Upload CSV dataset"
        footer={
          <>
            <OutlineButton onClick={() => { setIsImportOpen(false); setImportPreview([]); }} disabled={submitLoading}>
              Cancel
            </OutlineButton>
            <PrimaryButton onClick={handleImportSubmit} loading={submitLoading} disabled={importPreview.length === 0}>
              Start Ingestion
            </PrimaryButton>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <p className="text-slate-450 font-bold mb-2">Please select a CSV file. Expected headers: <code className="bg-slate-50 px-1 border rounded text-[10px] font-mono text-indigo-600 font-bold">firstName,lastName,email,phone,company,jobTitle</code></p>
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="block w-full border border-slate-150 rounded-xl p-2 bg-slate-50/50 cursor-pointer font-semibold text-slate-650"
            />
          </div>

          {importPreview.length > 0 && (
            <div>
              <h5 className="font-bold text-slate-800 mb-1.5 uppercase tracking-wider text-[10px]">Import Preview (Top 5 rows)</h5>
              <div className="overflow-x-auto border border-slate-150 rounded-lg">
                <table className="min-w-full text-left text-[10px]">
                  <thead>
                    <tr className="border-b border-slate-150 bg-slate-50 font-bold text-slate-500 uppercase tracking-wider">
                      <th className="p-2">Name</th>
                      <th className="p-2">Email</th>
                      <th className="p-2">Company</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {importPreview.map((row, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-bold">{row.firstName} {row.lastName}</td>
                        <td className="p-2 text-slate-500">{row.email}</td>
                        <td className="p-2 text-slate-500">{row.company}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Add / Edit Lead Modal Form */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={isEditing ? 'Modify Lead Information' : 'Launch New Lead Invite'}
        footer={
          <>
            <OutlineButton onClick={() => setIsAddEditOpen(false)} disabled={submitLoading}>
              Cancel
            </OutlineButton>
            <PrimaryButton onClick={handleSubmit} loading={submitLoading}>
              {isEditing ? 'Save Changes' : 'Launch Invite'}
            </PrimaryButton>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="First Name"
              placeholder="e.g. John"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              error={formErrors.firstName}
            />
            <TextInput
              label="Last Name"
              placeholder="e.g. Doe"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              error={formErrors.lastName}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <EmailInput
              label="Email Address"
              placeholder="e.g. john.doe@acme.com"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={formErrors.email}
            />
            <PhoneInput
              label="Phone Number"
              placeholder="e.g. 555-0199"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              error={formErrors.phone}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="Company Name"
              placeholder="e.g. Acme Corp"
              required
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              error={formErrors.company}
            />
            <TextInput
              label="Job Title"
              placeholder="e.g. Sales Manager"
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              error={formErrors.jobTitle}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectInput
              label="Lead Channel Source"
              value={formData.leadSource}
              onChange={(e) => setFormData({ ...formData, leadSource: e.target.value })}
              options={[
                { value: 'Web Referral', label: 'Web Referral' },
                { value: 'Direct Outreach', label: 'Direct Outreach' },
                { value: 'Partner Referral', label: 'Partner Referral' },
                { value: 'Cold Email', label: 'Cold Email' },
                { value: 'Other', label: 'Other' }
              ]}
              error={formErrors.leadSource}
            />
            <SelectInput
              label="Pipeline Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'New', label: 'New' },
                { value: 'Contacted', label: 'Contacted' },
                { value: 'Qualified', label: 'Qualified' },
                { value: 'Lost', label: 'Lost' }
              ]}
              error={formErrors.status}
            />
          </div>
          <TextArea
            label="Internal Notes / Context"
            placeholder="Add qualification takeaways or sales context..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            error={formErrors.notes}
          />
        </form>
      </Modal>

      {/* Delete Lead Confirm Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Cancel & Archive CRM Lead"
        message={`Are you sure you want to permanently delete the lead "${selectedLead?.firstName} ${selectedLead?.lastName}"? This action removes all records of this prospect.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        variant="danger"
        loading={submitLoading}
      />

      {/* Bulk Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        onConfirm={handleBulkConfirmDelete}
        title="Bulk Delete Leads"
        message={`Are you sure you want to permanently delete these ${selectedIds.length} selected Leads? This action is irreversible.`}
        confirmText="Yes, Delete All"
        cancelText="Cancel"
        variant="danger"
        loading={bulkLoading}
      />

      {/* Lead Details Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Lead Analysis Details"
        footer={
          <OutlineButton onClick={() => setIsViewOpen(false)}>
            Close View
          </OutlineButton>
        }
      >
        {selectedLead && (
          <div className="space-y-4 text-left">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">{selectedLead.firstName} {selectedLead.lastName}</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{selectedLead.jobTitle || 'No Title'} at {selectedLead.company}</p>
              </div>
              <StatusBadge status={selectedLead.status} />
            </div>

            <div className="grid gap-4 grid-cols-2 text-xs">
              <div>
                <p className="font-bold uppercase tracking-wider text-slate-400">Email Address</p>
                <p className="mt-0.5 text-slate-700 font-medium">{selectedLead.email}</p>
              </div>
              <div>
                <p className="font-bold uppercase tracking-wider text-slate-400">Phone Number</p>
                <p className="mt-0.5 text-slate-700 font-medium">{selectedLead.phone || 'No phone recorded'}</p>
              </div>
              <div>
                <p className="font-bold uppercase tracking-wider text-slate-400">Lead Source</p>
                <p className="mt-0.5 text-slate-700 font-medium">{selectedLead.leadSource}</p>
              </div>
              <div>
                <p className="font-bold uppercase tracking-wider text-slate-400">Created Date</p>
                <p className="mt-0.5 text-slate-700 font-medium flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  {new Date(selectedLead.createdAt).toLocaleString()}
                </p>
              </div>

              {selectedLead.isConverted && selectedLead.convertedContactId && (
                <div className="col-span-2">
                  <p className="font-bold uppercase tracking-wider text-slate-400">Converted Contact ID</p>
                  <p className="mt-0.5 text-slate-700 font-mono text-[10px] bg-slate-50 px-2 py-1 rounded border border-slate-150 break-all select-all">
                    {selectedLead.convertedContactId}
                  </p>
                </div>
              )}
              {selectedLead.notes && (
                <div className="col-span-2 border-t border-slate-100 pt-3">
                  <p className="font-bold uppercase tracking-wider text-slate-400 mb-1">Notes / Context Details</p>
                  <div className="bg-slate-50/70 rounded-lg p-3 text-slate-600 border border-slate-150 whitespace-pre-wrap leading-relaxed">
                    {selectedLead.notes}
                  </div>
                </div>
              )}

              {/* Meetings Section */}
              <div className="col-span-2 border-t border-slate-100 pt-4 mt-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Meetings Timeline</h4>
                  </div>
                  <PrimaryButton
                    onClick={() => {
                      setScheduleData({
                        title: '',
                        meetingDate: '',
                        startTime: '',
                        meetingType: 'Video Conference',
                        notes: ''
                      });
                      setIsScheduleOpen(true);
                    }}
                    size="xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Schedule Meeting
                  </PrimaryButton>
                </div>

                {meetingsLoading ? (
                  <p className="text-xs text-slate-400">Loading meetings...</p>
                ) : leadMeetings.length === 0 ? (
                  <div className="bg-slate-50/50 rounded-lg border border-slate-150 p-4 text-center">
                    <p className="text-xs text-slate-400 font-semibold">No scheduled interactions.</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Schedule a conversation or call to start pipeline activities.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {leadMeetings.map((m) => (
                      <div key={m._id} className="flex items-start justify-between bg-slate-50 hover:bg-slate-100/50 border border-slate-150 rounded-lg p-2.5 transition">
                        <div>
                          <h5 className="font-bold text-slate-700 text-xs">{m.title}</h5>
                          <div className="text-[10px] text-slate-400 font-semibold mt-1 flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(m.meetingDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {m.startTime}
                            </span>
                            <span>•</span>
                            <span>{m.meetingType}</span>
                          </div>
                        </div>
                        <StatusBadge status={m.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Quick Schedule Meeting Modal */}
      <Modal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        title="Schedule Lead Meeting"
        footer={
          <>
            <OutlineButton onClick={() => setIsScheduleOpen(false)} disabled={submitLoading}>
              Cancel
            </OutlineButton>
            <PrimaryButton onClick={handleScheduleSubmit} loading={submitLoading}>
              Create Invite
            </PrimaryButton>
          </>
        }
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <TextInput
            label="Meeting Title"
            placeholder="e.g. Intro discovery call"
            required
            value={scheduleData.title}
            onChange={(e) => setScheduleData({ ...scheduleData, title: e.target.value })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="Meeting Date"
              type="date"
              required
              value={scheduleData.meetingDate}
              onChange={(e) => setScheduleData({ ...scheduleData, meetingDate: e.target.value })}
            />
            <TextInput
              label="Start Time"
              type="time"
              required
              value={scheduleData.startTime}
              onChange={(e) => setScheduleData({ ...scheduleData, startTime: e.target.value })}
            />
          </div>
          <SelectInput
            label="Meeting Format Type"
            value={scheduleData.meetingType}
            onChange={(e) => setScheduleData({ ...scheduleData, meetingType: e.target.value })}
            options={[
              { value: 'Online', label: 'Online' },
              { value: 'Phone Call', label: 'Phone Call' },
              { value: 'Video Conference', label: 'Video Conference' },
              { value: 'In Person', label: 'In Person' },
              { value: 'Customer Visit', label: 'Customer Visit' },
              { value: 'Internal Discussion', label: 'Internal Discussion' }
            ]}
          />
          <TextArea
            label="Internal Notes / Agenda"
            placeholder="Introduce discussion points..."
            value={scheduleData.notes}
            onChange={(e) => setScheduleData({ ...scheduleData, notes: e.target.value })}
          />
        </form>
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
