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
import IconButton from '../../components/buttons/IconButton';
import Modal from '../../components/modal/Modal';
import ConfirmDialog from '../../components/modal/ConfirmDialog';
import Toast from '../../components/toast/Toast';
import StatusBadge from '../../components/badges/StatusBadge';
import ContactService from '../../services/ContactService';
import MeetingService from '../../services/MeetingService';
import CampaignService from '../../services/CampaignService';
import SavedFilterService from '../../services/SavedFilterService';
import {
  Users,
  Plus,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  AlertCircle,
  Calendar,
  Clock,
  Briefcase,
  Megaphone,
  Download,
  Upload,
  Sliders,
  Bookmark,
  Trash,
  UserPlus
} from 'lucide-react';

export default function Contacts() {
  const location = useLocation();
  const navigate = useNavigate();

  // Contacts & Pagination State
  const [contacts, setContacts] = useState([]);
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
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [currentPage, setCurrentPage] = useState(1);

  // Bulk Operations State
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  // Saved Filters State
  const [savedFilters, setSavedFilters] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [isSaveFilterOpen, setIsSaveFilterOpen] = useState(false);

  // CSV Import State
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importPreview, setImportPreview] = useState([]);
  const [csvRawText, setCsvRawText] = useState('');

  // Column Visibility States
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem('crm_contacts_columns');
    return saved ? JSON.parse(saved) : ['select', 'name', 'company', 'email', 'phone', 'contactSource', 'createdAt', 'actions'];
  });
  const [isColumnManagerOpen, setIsColumnManagerOpen] = useState(false);

  // Modals Toggles
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Selected Contexts
  const [selectedContact, setSelectedContact] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Toast Alerts
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });

  // Associated meetings/campaigns timelines
  const [contactMeetings, setContactMeetings] = useState([]);
  const [contactCampaigns, setContactCampaigns] = useState([]);
  const [meetingsLoading, setMeetingsLoading] = useState(false);
  const [campaignsLoading, setCampaignsLoading] = useState(false);

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
    contactSource: 'Web Referral'
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ isOpen: true, message, type });
  };

  // Fetch contacts callback
  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ContactService.getContacts({
        search,
        contactSource: sourceFilter,
        sort: sortBy,
        page: currentPage,
        limit: 10
      });
      if (response.data && response.data.success) {
        setContacts(response.data.data);
        setPagination(response.data.pagination);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch contacts');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Network error occurred while fetching contacts.');
    } finally {
      setLoading(false);
    }
  }, [search, sourceFilter, sortBy, currentPage]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Load associated timelines on view details
  const fetchContactTimelines = useCallback(async (contactId) => {
    setMeetingsLoading(true);
    setCampaignsLoading(true);
    try {
      const [meetingsRes, campaignsRes] = await Promise.all([
        MeetingService.getMeetings({ relatedContactId: contactId }),
        CampaignService.getCampaigns({ contactId })
      ]);
      if (meetingsRes.data?.success) setContactMeetings(meetingsRes.data.data);
      if (campaignsRes.data?.success) setContactCampaigns(campaignsRes.data.data);
    } catch (err) {
      console.error('Failed to load contact timelines', err);
    } finally {
      setMeetingsLoading(false);
      setCampaignsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isViewOpen && selectedContact) {
      fetchContactTimelines(selectedContact._id);
    }
  }, [isViewOpen, selectedContact, fetchContactTimelines]);

  // Check URL query parameters for direct record lookup
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const contactId = params.get('id');
    if (contactId && contacts.length > 0) {
      const match = contacts.find(c => c._id === contactId);
      if (match) {
        setSelectedContact(match);
        setIsViewOpen(true);
        navigate(location.pathname, { replace: true });
      }
    }
  }, [location.search, contacts, navigate]);

  // Fetch saved filters list
  const fetchSavedFilters = useCallback(async () => {
    try {
      const response = await SavedFilterService.getSavedFilters('contacts');
      if (response.data?.success) {
        setSavedFilters(response.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchSavedFilters();
  }, [fetchSavedFilters]);

  // Reset page number on search criteria update
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [search, sourceFilter]);

  // Save Column preferences
  const saveColumnPreferences = (columns) => {
    setVisibleColumns(columns);
    localStorage.setItem('crm_contacts_columns', JSON.stringify(columns));
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
      ? contacts.filter(c => selectedIds.includes(c._id))
      : contacts;

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
      { key: 'contactSource', header: 'Source' }
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
    link.setAttribute('download', `contacts_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Contacts exported successfully!', 'success');
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
      setImportPreview(parsed.slice(0, 5));
    };
    reader.readAsText(file);
  };

  // Submit CSV dataset import
  const handleImportSubmit = async () => {
    if (!csvRawText) return;
    const parsed = parseCSV(csvRawText);
    setSubmitLoading(true);
    try {
      const response = await ContactService.importContacts({ contacts: parsed });
      if (response.data?.success) {
        showToast(response.data.message, 'success');
        setIsImportOpen(false);
        setImportPreview([]);
        setCsvRawText('');
        fetchContacts();
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
        module: 'contacts',
        filters: { search, sourceFilter, sortBy }
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
    if (filter.filters.sourceFilter !== undefined) setSourceFilter(filter.filters.sourceFilter);
    if (filter.filters.sortBy !== undefined) setSortBy(filter.filters.sortBy);
    showToast(`Loaded filter "${filter.name}"`, 'success');
  };

  // Clear all active filters
  const handleClearFilters = () => {
    setSearch('');
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

  // Bulk delete confirm action
  const handleBulkConfirmDelete = async () => {
    setBulkLoading(true);
    try {
      const response = await ContactService.bulkDeleteContacts({ ids: selectedIds });
      if (response.data?.success) {
        showToast(response.data.message, 'success');
        setSelectedIds([]);
        setIsBulkDeleteOpen(false);
        fetchContacts();
      }
    } catch (err) {
      console.error(err);
      showToast('Bulk delete operation failed', 'error');
    } finally {
      setBulkLoading(false);
    }
  };

  // Single Contact CRUD
  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      jobTitle: '',
      contactSource: 'Web Referral'
    });
    setFormErrors({});
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (contact) => {
    setIsEditing(true);
    setSelectedContact(contact);
    setFormData({
      firstName: contact.firstName || '',
      lastName: contact.lastName || '',
      email: contact.email || '',
      phone: contact.phone || '',
      company: contact.company || '',
      jobTitle: contact.jobTitle || '',
      contactSource: contact.contactSource || 'Web Referral'
    });
    setFormErrors({});
    setIsAddEditOpen(true);
  };

  const handleOpenView = (contact) => {
    setSelectedContact(contact);
    setIsViewOpen(true);
  };

  const handleOpenDelete = (contact) => {
    setSelectedContact(contact);
    setIsDeleteOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.company.trim()) errors.company = 'Company is required';
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
        const response = await ContactService.updateContact(selectedContact._id, formData);
        if (response.data.success) {
          showToast('Contact updated successfully!', 'success');
          setIsAddEditOpen(false);
          fetchContacts();
        }
      } else {
        const response = await ContactService.createContact(formData);
        if (response.data.success) {
          showToast('Contact created successfully!', 'success');
          setIsAddEditOpen(false);
          fetchContacts();
        }
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || err.message || 'Submission failed.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    setSubmitLoading(true);
    try {
      const response = await ContactService.deleteContact(selectedContact._id);
      if (response.data.success) {
        showToast('Contact deleted successfully!', 'success');
        setIsDeleteOpen(false);
        fetchContacts();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to delete contact.', 'error');
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
        relatedType: 'Contact',
        relatedContactId: selectedContact._id,
        status: 'Scheduled'
      });
      if (response.data.success) {
        showToast('Meeting scheduled successfully!', 'success');
        setIsScheduleOpen(false);
        fetchContactTimelines(selectedContact._id);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to schedule meeting', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Columns definition mapping
  const columnsList = [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          checked={selectedIds.length === contacts.length && contacts.length > 0}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedIds(contacts.map(c => c._id));
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
      header: 'Contact Name',
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
    { key: 'contactSource', header: 'Source' },
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
          <IconButton variant="ghost" icon={<Edit2 className="h-4 w-4" />} title="Edit Contact" onClick={() => handleOpenEdit(row)} />
          <IconButton variant="danger" icon={<Trash2 className="h-4 w-4" />} title="Delete Contact" onClick={() => handleOpenDelete(row)} />
        </div>
      )
    }
  ];

  const activeColumns = columnsList.filter(col => visibleColumns.includes(col.key));

  return (
    <PageContainer>
      {/* Compact Page Toolbar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">Contacts Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">Search active client profiles and accounts converted from pipeline leads.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <OutlineButton onClick={() => setIsColumnManagerOpen(true)} title="Column Management">
            <Sliders className="h-4 w-4" />
          </OutlineButton>
          <OutlineButton onClick={() => setIsImportOpen(true)} title="Import CSV contacts dataset">
            <Upload className="h-4 w-4" />
          </OutlineButton>
          <OutlineButton onClick={() => handleExportCSV(false)} title="Export all contacts to CSV">
            <Download className="h-4 w-4" />
          </OutlineButton>
          <OutlineButton onClick={fetchContacts} title="Refresh Table data">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </OutlineButton>
          <PrimaryButton onClick={handleOpenAdd}>
            <UserPlus className="h-4.5 w-4.5" />
            Add Contact
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
            label="Contact Source"
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
          <span className="text-xs font-bold text-indigo-800">
            {selectedIds.length} contacts selected
          </span>
          <div className="flex items-center gap-2.5">
            <OutlineButton onClick={() => handleExportCSV(true)} size="sm" className="border-indigo-200 text-indigo-700 bg-white hover:bg-indigo-50">
              <Download className="h-4 w-4 mr-1 shrink-0" />
              Export Selected
            </OutlineButton>
            <IconButton variant="danger" icon={<Trash className="h-4 w-4" />} title="Bulk Delete" onClick={() => setIsBulkDeleteOpen(true)} />
          </div>
        </div>
      )}

      {/* Table */}
      <DataTable
        columns={activeColumns}
        data={contacts}
        loading={loading}
        emptyTitle="No Contacts Found"
        emptyDescription="Get started by creating a contact manually or uploading a CSV segment."
        emptyAction={
          <PrimaryButton onClick={handleOpenAdd}>
            Create Contact Profile
          </PrimaryButton>
        }
      />

      {/* Pagination */}
      {!loading && contacts.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalRecords={pagination.totalRecords}
          recordsPerPage={pagination.recordsPerPage}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}

      {/* Save Filter Modal */}
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
          placeholder="e.g. Cold Contacts List"
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
            { key: 'name', label: 'Contact Name' },
            { key: 'company', label: 'Company' },
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Phone' },
            { key: 'contactSource', label: 'Source' },
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
            <p className="text-slate-450 font-bold mb-2">Select a CSV file. Expected headers: <code className="bg-slate-50 px-1 border rounded text-[10px] font-mono text-indigo-600 font-bold">firstName,lastName,email,phone,company,jobTitle</code></p>
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

      {/* Add / Edit Contact Modal Form */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={isEditing ? 'Modify Contact Profile' : 'Create Contact Profile'}
        footer={
          <>
            <OutlineButton onClick={() => setIsAddEditOpen(false)} disabled={submitLoading}>
              Cancel
            </OutlineButton>
            <PrimaryButton onClick={handleSubmit} loading={submitLoading}>
              {isEditing ? 'Save Changes' : 'Create Profile'}
            </PrimaryButton>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="First Name"
              placeholder="e.g. Alice"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              error={formErrors.firstName}
            />
            <TextInput
              label="Last Name"
              placeholder="e.g. Smith"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              error={formErrors.lastName}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <EmailInput
              label="Email Address"
              placeholder="e.g. alice.smith@corp.com"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={formErrors.email}
            />
            <PhoneInput
              label="Phone Number"
              placeholder="e.g. 555-0210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              error={formErrors.phone}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="Company"
              placeholder="e.g. Acme Corp"
              required
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              error={formErrors.company}
            />
            <TextInput
              label="Job Title"
              placeholder="e.g. VP of Product"
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              error={formErrors.jobTitle}
            />
          </div>
          <SelectInput
            label="Contact Source"
            value={formData.contactSource}
            onChange={(e) => setFormData({ ...formData, contactSource: e.target.value })}
            options={[
              { value: 'Web Referral', label: 'Web Referral' },
              { value: 'Direct Outreach', label: 'Direct Outreach' },
              { value: 'Partner Referral', label: 'Partner Referral' },
              { value: 'Cold Email', label: 'Cold Email' },
              { value: 'Other', label: 'Other' }
            ]}
            error={formErrors.contactSource}
          />
        </form>
      </Modal>

      {/* Delete Contact Confirm Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Archive Contact Profile"
        message={`Are you sure you want to delete the contact "${selectedContact?.firstName} ${selectedContact?.lastName}"? This action will remove their history.`}
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
        title="Bulk Delete Contacts"
        message={`Are you sure you want to permanently delete these ${selectedIds.length} selected Contacts? This action is irreversible.`}
        confirmText="Yes, Delete All"
        cancelText="Cancel"
        variant="danger"
        loading={bulkLoading}
      />

      {/* Contact Details Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Contact Analysis Details"
        footer={
          <OutlineButton onClick={() => setIsViewOpen(false)}>
            Close View
          </OutlineButton>
        }
      >
        {selectedContact && (
          <div className="space-y-4 text-left">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">{selectedContact.firstName} {selectedContact.lastName}</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{selectedContact.jobTitle || 'No Title'} at {selectedContact.company}</p>
              </div>
            </div>

            <div className="grid gap-4 grid-cols-2 text-xs">
              <div>
                <p className="font-bold uppercase tracking-wider text-slate-400">Email Address</p>
                <p className="mt-0.5 text-slate-700 font-medium">{selectedContact.email}</p>
              </div>
              <div>
                <p className="font-bold uppercase tracking-wider text-slate-400">Phone Number</p>
                <p className="mt-0.5 text-slate-700 font-medium">{selectedContact.phone || 'No phone recorded'}</p>
              </div>
              <div>
                <p className="font-bold uppercase tracking-wider text-slate-400">Contact Source</p>
                <p className="mt-0.5 text-slate-700 font-medium">{selectedContact.contactSource || 'Web Referral'}</p>
              </div>
              <div>
                <p className="font-bold uppercase tracking-wider text-slate-400">Created Date</p>
                <p className="mt-0.5 text-slate-700 font-medium flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  {new Date(selectedContact.createdAt).toLocaleString()}
                </p>
              </div>

              {selectedContact.originalLeadId && (
                <div className="col-span-2">
                  <p className="font-bold uppercase tracking-wider text-slate-400">Original Lead MongoDB ID</p>
                  <p className="mt-0.5 text-slate-750 font-mono text-[10px] bg-slate-50 px-2 py-1 rounded border border-slate-150 break-all select-all">
                    {selectedContact.originalLeadId}
                  </p>
                </div>
              )}

              {/* Associated Campaigns */}
              <div className="col-span-2 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Megaphone className="h-4 w-4 text-slate-400" />
                  <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Associated Outreach Campaigns</h4>
                </div>
                {campaignsLoading ? (
                  <p className="text-xs text-slate-400">Loading campaigns...</p>
                ) : contactCampaigns.length === 0 ? (
                  <p className="text-xs text-slate-450 italic">No marketing campaigns associated with this contact.</p>
                ) : (
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                    {contactCampaigns.map((cp) => (
                      <div key={cp._id} className="flex justify-between items-center bg-slate-50 border border-slate-150 p-2.5 rounded-lg">
                        <div>
                          <span className="font-bold text-slate-700 text-xs">{cp.name}</span>
                          <span className="block text-[9px] text-slate-400 font-semibold mt-0.5">Budget: ${cp.budget}</span>
                        </div>
                        <StatusBadge status={cp.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Associated Meetings */}
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
                ) : contactMeetings.length === 0 ? (
                  <div className="bg-slate-50/50 rounded-lg border border-slate-150 p-4 text-center">
                    <p className="text-xs text-slate-400 font-semibold">No scheduled interactions.</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Schedule a conversation or call to start pipeline activities.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {contactMeetings.map((m) => (
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
        title="Schedule Contact Meeting"
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
