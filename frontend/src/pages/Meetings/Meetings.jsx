import React, { useState, useEffect, useCallback } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import SectionCard from '../../components/cards/SectionCard';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import OutlineButton from '../../components/buttons/OutlineButton';
import SearchInput from '../../components/forms/SearchInput';
import SelectInput from '../../components/forms/SelectInput';
import TextInput from '../../components/forms/TextInput';
import TextArea from '../../components/forms/TextArea';
import DataTable from '../../components/table/DataTable';
import Pagination from '../../components/pagination/Pagination';
import StatusBadge from '../../components/badges/StatusBadge';
import IconButton from '../../components/buttons/IconButton';
import Modal from '../../components/modal/Modal';
import ConfirmDialog from '../../components/modal/ConfirmDialog';
import Toast from '../../components/toast/Toast';
import MeetingService from '../../services/MeetingService';
import LeadService from '../../services/LeadService';
import ContactService from '../../services/ContactService';
import { Calendar, Plus, Eye, Edit2, Trash2, RefreshCw, AlertCircle, MapPin, Video, Phone, Link, FileText, User } from 'lucide-react';

export default function Meetings() {
  // Meetings & Pagination State
  const [meetings, setMeetings] = useState([]);
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
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [currentPage, setCurrentPage] = useState(1);

  // Selector Lists (for associating Lead/Contact in schedule modal)
  const [leadsList, setLeadsList] = useState([]);
  const [contactsList, setContactsList] = useState([]);

  // Modals & Dialog Toggles
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Selected Record Contexts
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Toast Alerts
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });

  // Form Inputs & Validation State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    relatedType: 'Lead',
    relatedLeadId: '',
    relatedContactId: '',
    meetingDate: '',
    startTime: '',
    endTime: '',
    meetingType: 'Video Conference',
    status: 'Scheduled',
    location: '',
    meetingLink: '',
    agenda: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch lists for select dropdowns
  const fetchRelationLists = async () => {
    try {
      const [leadsRes, contactsRes] = await Promise.all([
        LeadService.getLeads({ limit: 100 }),
        ContactService.getContacts({ limit: 100 })
      ]);
      if (leadsRes.data?.success) setLeadsList(leadsRes.data.data);
      if (contactsRes.data?.success) setContactsList(contactsRes.data.data);
    } catch (err) {
      console.error('Failed to load relation lists', err);
    }
  };

  // Fetch meetings callback from service
  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await MeetingService.getMeetings({
        search,
        meetingType: typeFilter,
        status: statusFilter,
        date: dateFilter,
        sort: sortBy,
        page: currentPage,
        limit: 10
      });
      if (response.data && response.data.success) {
        setMeetings(response.data.data);
        setPagination(response.data.pagination);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch meetings');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Network error occurred while fetching meetings.');
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, statusFilter, dateFilter, sortBy, currentPage]);

  // Load meetings on parameter updates
  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

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
    fetchRelationLists();
    setFormData({
      title: '',
      description: '',
      relatedType: 'Lead',
      relatedLeadId: '',
      relatedContactId: '',
      meetingDate: '',
      startTime: '',
      endTime: '',
      meetingType: 'Video Conference',
      status: 'Scheduled',
      location: '',
      meetingLink: '',
      agenda: '',
      notes: ''
    });
    setFormErrors({});
    setIsAddEditOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (meeting) => {
    setIsEditing(true);
    setSelectedMeeting(meeting);
    fetchRelationLists();

    // Format date string to YYYY-MM-DD
    const formattedDate = meeting.meetingDate ? new Date(meeting.meetingDate).toISOString().split('T')[0] : '';

    setFormData({
      title: meeting.title || '',
      description: meeting.description || '',
      relatedType: meeting.relatedType || 'Lead',
      relatedLeadId: meeting.relatedLeadId?._id || '',
      relatedContactId: meeting.relatedContactId?._id || '',
      meetingDate: formattedDate,
      startTime: meeting.startTime || '',
      endTime: meeting.endTime || '',
      meetingType: meeting.meetingType || 'Video Conference',
      status: meeting.status || 'Scheduled',
      location: meeting.location || '',
      meetingLink: meeting.meetingLink || '',
      agenda: meeting.agenda || '',
      notes: meeting.notes || ''
    });
    setFormErrors({});
    setIsAddEditOpen(true);
  };

  // Open view modal
  const handleOpenView = (meeting) => {
    setSelectedMeeting(meeting);
    setIsViewOpen(true);
  };

  // Open delete dialog
  const handleOpenDelete = (meeting) => {
    setSelectedMeeting(meeting);
    setIsDeleteOpen(true);
  };

  // Validate form inputs
  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Meeting title is required';
    if (!formData.meetingDate) errors.meetingDate = 'Meeting date is required';
    if (!formData.startTime) errors.startTime = 'Start time is required';
    if (!formData.meetingType) errors.meetingType = 'Meeting type is required';
    if (!formData.status) errors.status = 'Meeting status is required';

    if (formData.relatedType === 'Lead' && !formData.relatedLeadId) {
      errors.relatedLeadId = 'Please select a related Lead';
    }
    if (formData.relatedType === 'Contact' && !formData.relatedContactId) {
      errors.relatedContactId = 'Please select a related Contact';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Action
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitLoading(true);
    try {
      if (isEditing) {
        const response = await MeetingService.updateMeeting(selectedMeeting._id, formData);
        if (response.data.success) {
          showToast('Meeting updated successfully!', 'success');
          setIsAddEditOpen(false);
          fetchMeetings();
        } else {
          throw new Error(response.data.message);
        }
      } else {
        const response = await MeetingService.createMeeting(formData);
        if (response.data.success) {
          showToast('Meeting scheduled successfully!', 'success');
          setIsAddEditOpen(false);
          fetchMeetings();
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

  // Confirm Delete Action
  const handleConfirmDelete = async () => {
    setSubmitLoading(true);
    try {
      const response = await MeetingService.deleteMeeting(selectedMeeting._id);
      if (response.data.success) {
        showToast('Meeting deleted successfully!', 'success');
        setIsDeleteOpen(false);
        fetchMeetings();
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || err.message || 'Failed to delete meeting.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Table Columns Definition
  const columns = [
    {
      key: 'title',
      header: 'Meeting',
      render: (row) => (
        <div>
          <h4 className="font-bold text-slate-800 text-xs">{row.title}</h4>
          <p className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">{row.description || 'No description'}</p>
        </div>
      )
    },
    {
      key: 'relatedTo',
      header: 'Related To',
      render: (row) => {
        const person = row.relatedType === 'Lead' ? row.relatedLeadId : row.relatedContactId;
        if (!person) return <span className="text-slate-400 text-xs italic">Unlinked</span>;
        return (
          <div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-slate-700 text-xs">{person.firstName} {person.lastName}</span>
              <span className={`inline-flex px-1 text-[8px] font-bold rounded ${row.relatedType === 'Lead' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
                {row.relatedType}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">{person.company}</p>
          </div>
        );
      }
    },
    { key: 'meetingType', header: 'Meeting Type' },
    {
      key: 'meetingDate',
      header: 'Date',
      render: (row) => new Date(row.meetingDate).toLocaleDateString()
    },
    {
      key: 'time',
      header: 'Time',
      render: (row) => `${row.startTime} ${row.endTime ? `- ${row.endTime}` : ''}`
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'location',
      header: 'Location / Link',
      render: (row) => {
        if (row.meetingLink) {
          return (
            <a href={row.meetingLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline">
              <Video className="h-3 w-3" />
              Join Call
            </a>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 text-slate-500 text-xs">
            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
            <span className="truncate max-w-[120px]">{row.location || 'Local Office'}</span>
          </span>
        );
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <IconButton variant="ghost" icon={<Eye className="h-4 w-4" />} title="View Details" onClick={() => handleOpenView(row)} />
          <IconButton variant="ghost" icon={<Edit2 className="h-4 w-4" />} title="Edit Meeting" onClick={() => handleOpenEdit(row)} />
          <IconButton variant="danger" icon={<Trash2 className="h-4 w-4" />} title="Delete Meeting" onClick={() => handleOpenDelete(row)} />
        </div>
      )
    }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Meetings Pipeline"
        description="Organize, schedule, and review client interactions, calls, and visit activities."
        actions={
          <>
            <OutlineButton onClick={fetchMeetings} title="Refresh Table data">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </OutlineButton>
            <PrimaryButton onClick={handleOpenAdd}>
              <Plus className="h-4.5 w-4.5" />
              Schedule Meeting
            </PrimaryButton>
          </>
        }
      />

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-rose-100 bg-rose-50/50 p-4 text-sm text-rose-800">
          <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold">Failed to fetch database items</h4>
            <p className="mt-0.5 text-xs text-rose-700/80">{error}</p>
          </div>
        </div>
      )}

      {/* Filter and Queries Card */}
      <SectionCard className="mb-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2">
            <SearchInput
              label="Global Query Search"
              placeholder="Search by title, related person, or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <SelectInput
              label="Meeting Type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Types' },
                { value: 'Online', label: 'Online' },
                { value: 'Phone Call', label: 'Phone Call' },
                { value: 'Video Conference', label: 'Video Conference' },
                { value: 'In Person', label: 'In Person' },
                { value: 'Customer Visit', label: 'Customer Visit' },
                { value: 'Internal Discussion', label: 'Internal Discussion' }
              ]}
            />
          </div>
          <div>
            <SelectInput
              label="Appointment Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'Scheduled', label: 'Scheduled' },
                { value: 'Completed', label: 'Completed' },
                { value: 'Cancelled', label: 'Cancelled' },
                { value: 'Rescheduled', label: 'Rescheduled' },
                { value: 'Missed', label: 'Missed' }
              ]}
            />
          </div>
          <div>
            <TextInput
              label="Filter By Date"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>
      </SectionCard>

      {/* Meetings Table */}
      <DataTable
        columns={columns}
        data={meetings}
        loading={loading}
        emptyTitle="No Meetings Found"
        emptyDescription="We couldn't find any calendar meetings matching your filter query."
        emptyAction={
          <PrimaryButton onClick={handleOpenAdd}>
            Schedule First Meeting
          </PrimaryButton>
        }
      />

      {/* Pagination component */}
      {!loading && meetings.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalRecords={pagination.totalRecords}
          recordsPerPage={pagination.recordsPerPage}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}

      {/* Schedule Meeting Modal Form */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={isEditing ? 'Modify Meeting Schedule' : 'Schedule New CRM Meeting'}
        footer={
          <>
            <OutlineButton onClick={() => setIsAddEditOpen(false)} disabled={submitLoading}>
              Cancel
            </OutlineButton>
            <PrimaryButton onClick={handleSubmit} loading={submitLoading}>
              {isEditing ? 'Save Changes' : 'Schedule Meeting'}
            </PrimaryButton>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextInput
            label="Meeting Title"
            placeholder="e.g. Sync & Budget Review"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            error={formErrors.title}
          />
          <TextArea
            label="Short Description"
            placeholder="Introduce the purpose of the calendar invite..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            error={formErrors.description}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectInput
              label="Related Type"
              value={formData.relatedType}
              onChange={(e) => setFormData({ ...formData, relatedType: e.target.value, relatedLeadId: '', relatedContactId: '' })}
              options={[
                { value: 'Lead', label: 'Lead' },
                { value: 'Contact', label: 'Contact' }
              ]}
              error={formErrors.relatedType}
            />

            {formData.relatedType === 'Lead' ? (
              <SelectInput
                label="Select Associated Lead"
                value={formData.relatedLeadId}
                onChange={(e) => setFormData({ ...formData, relatedLeadId: e.target.value })}
                options={[
                  { value: '', label: 'Select a Lead...' },
                  ...leadsList.map(l => ({ value: l._id, label: `${l.firstName} ${l.lastName} (${l.company})` }))
                ]}
                error={formErrors.relatedLeadId}
              />
            ) : (
              <SelectInput
                label="Select Associated Contact"
                value={formData.relatedContactId}
                onChange={(e) => setFormData({ ...formData, relatedContactId: e.target.value })}
                options={[
                  { value: '', label: 'Select a Contact...' },
                  ...contactsList.map(c => ({ value: c._id, label: `${c.firstName} ${c.lastName} (${c.company})` }))
                ]}
                error={formErrors.relatedContactId}
              />
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <TextInput
              label="Meeting Date"
              type="date"
              required
              value={formData.meetingDate}
              onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
              error={formErrors.meetingDate}
            />
            <TextInput
              label="Start Time"
              type="time"
              required
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              error={formErrors.startTime}
            />
            <TextInput
              label="End Time"
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              error={formErrors.endTime}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectInput
              label="Meeting Format Type"
              value={formData.meetingType}
              onChange={(e) => setFormData({ ...formData, meetingType: e.target.value })}
              options={[
                { value: 'Online', label: 'Online' },
                { value: 'Phone Call', label: 'Phone Call' },
                { value: 'Video Conference', label: 'Video Conference' },
                { value: 'In Person', label: 'In Person' },
                { value: 'Customer Visit', label: 'Customer Visit' },
                { value: 'Internal Discussion', label: 'Internal Discussion' }
              ]}
              error={formErrors.meetingType}
            />
            <SelectInput
              label="Appointment Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'Scheduled', label: 'Scheduled' },
                { value: 'Completed', label: 'Completed' },
                { value: 'Cancelled', label: 'Cancelled' },
                { value: 'Rescheduled', label: 'Rescheduled' },
                { value: 'Missed', label: 'Missed' }
              ]}
              error={formErrors.status}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="Physical Location"
              placeholder="e.g. Boardroom A"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              error={formErrors.location}
            />
            <TextInput
              label="Online Meeting Link"
              placeholder="https://meet.google.com/abc-defg-hij"
              value={formData.meetingLink}
              onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
              error={formErrors.meetingLink}
            />
          </div>

          <TextArea
            label="Agenda"
            placeholder="List specific agenda outline points..."
            value={formData.agenda}
            onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
            error={formErrors.agenda}
          />
          <TextArea
            label="Internal Notes / Follow-ups"
            placeholder="Add comments, takeaways or next steps after meeting..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            error={formErrors.notes}
          />
        </form>
      </Modal>

      {/* Delete Meeting Confirm Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Cancel & Delete Calendar Meeting"
        message={`Are you sure you want to permanently delete the meeting "${selectedMeeting?.title}"? This action removes all records of this interaction.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        variant="danger"
        loading={submitLoading}
      />

      {/* Meeting Details Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Meeting Details Info"
        footer={
          <OutlineButton onClick={() => setIsViewOpen(false)}>
            Close View
          </OutlineButton>
        }
      >
        {selectedMeeting && (
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">{selectedMeeting.title}</h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">{selectedMeeting.description || 'No description provided'}</p>
            </div>

            <div className="grid gap-4 grid-cols-2 text-xs">
              <div>
                <p className="font-bold uppercase tracking-wider text-slate-400">Meeting Format</p>
                <p className="mt-0.5 text-slate-700 font-medium flex items-center gap-1">
                  {selectedMeeting.meetingType === 'Video Conference' ? <Video className="h-3.5 w-3.5 text-slate-400" /> : selectedMeeting.meetingType === 'Phone Call' ? <Phone className="h-3.5 w-3.5 text-slate-400" /> : <Calendar className="h-3.5 w-3.5 text-slate-400" />}
                  {selectedMeeting.meetingType}
                </p>
              </div>
              <div>
                <p className="font-bold uppercase tracking-wider text-slate-400">Appointment Status</p>
                <div className="mt-1"><StatusBadge status={selectedMeeting.status} /></div>
              </div>
              <div>
                <p className="font-bold uppercase tracking-wider text-slate-400">Date</p>
                <p className="mt-0.5 text-slate-700 font-medium flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  {new Date(selectedMeeting.meetingDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="font-bold uppercase tracking-wider text-slate-400">Time / Schedule</p>
                <p className="mt-0.5 text-slate-700 font-medium">{selectedMeeting.startTime} {selectedMeeting.endTime ? `- ${selectedMeeting.endTime}` : ''}</p>
              </div>

              {selectedMeeting.meetingLink && (
                <div className="col-span-2">
                  <p className="font-bold uppercase tracking-wider text-slate-400">Meeting URL Link</p>
                  <a href={selectedMeeting.meetingLink} target="_blank" rel="noopener noreferrer" className="mt-0.5 inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 underline break-all font-semibold">
                    <Link className="h-3.5 w-3.5" />
                    {selectedMeeting.meetingLink}
                  </a>
                </div>
              )}

              {selectedMeeting.location && !selectedMeeting.meetingLink && (
                <div className="col-span-2">
                  <p className="font-bold uppercase tracking-wider text-slate-400">Physical Location</p>
                  <p className="mt-0.5 text-slate-700 font-medium flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {selectedMeeting.location}
                  </p>
                </div>
              )}

              {/* Related Person Reference */}
              <div className="col-span-2 border-t border-slate-100 pt-3">
                <p className="font-bold uppercase tracking-wider text-slate-400 mb-1.5">Associated Lead / Contact</p>
                {(() => {
                  const person = selectedMeeting.relatedType === 'Lead' ? selectedMeeting.relatedLeadId : selectedMeeting.relatedContactId;
                  if (!person) return <span className="text-slate-400 italic">Unlinked Opportunity</span>;
                  return (
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-150 p-2.5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <div>
                          <h5 className="font-bold text-slate-800">{person.firstName} {person.lastName}</h5>
                          <p className="text-[10px] text-slate-400 font-semibold">{person.company}</p>
                        </div>
                      </div>
                      <span className={`inline-flex px-1.5 py-0.5 text-[9px] font-bold rounded ${selectedMeeting.relatedType === 'Lead' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'}`}>
                        {selectedMeeting.relatedType}
                      </span>
                    </div>
                  );
                })()}
              </div>

              {selectedMeeting.agenda && (
                <div className="col-span-2 border-t border-slate-100 pt-3">
                  <p className="font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-slate-400" />
                    Meeting Agenda
                  </p>
                  <div className="bg-slate-50/70 rounded-lg p-2.5 text-slate-600 border border-slate-150 whitespace-pre-wrap">
                    {selectedMeeting.agenda}
                  </div>
                </div>
              )}

              {selectedMeeting.notes && (
                <div className="col-span-2 border-t border-slate-100 pt-3">
                  <p className="font-bold uppercase tracking-wider text-slate-400 mb-1">Notes / Context</p>
                  <div className="bg-slate-50/70 rounded-lg p-2.5 text-slate-600 border border-slate-150 whitespace-pre-wrap">
                    {selectedMeeting.notes}
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
