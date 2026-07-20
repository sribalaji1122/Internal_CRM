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
import EntityDetailsLayout from '../../components/layout/EntityDetailsLayout';
import TaskService from '../../services/TaskService';
import CompanyService from '../../services/CompanyService';
import DealService from '../../services/DealService';
import LeadService from '../../services/LeadService';
import ContactService from '../../services/ContactService';
import MeetingService from '../../services/MeetingService';
import CampaignService from '../../services/CampaignService';
import DocumentService from '../../services/DocumentService';
import ActivityService from '../../services/ActivityService';
import {
  CheckSquare, Plus, Eye, Edit2, Trash2, RefreshCw, AlertCircle,
  Clock, Target, User, Building2, TrendingUp, Calendar, Flag,
  ListChecks, MessageSquare, FileText, Activity, History, Link2,
  Send, Check, X, Copy, RotateCcw, ChevronDown, CheckCircle,
  Square, CheckCheck, Loader2
} from 'lucide-react';

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES = ['Pending', 'In Progress', 'Waiting', 'Completed', 'Cancelled', 'Overdue'];
const TYPES = ['Call', 'Email', 'Meeting', 'Follow-up', 'Demo', 'Proposal', 'Documentation', 'Internal', 'Custom'];
const REPEATS = ['None', 'Daily', 'Weekly', 'Monthly'];

const PRIORITY_COLORS = {
  Low: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  High: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  Critical: 'bg-red-500/15 text-red-400 border-red-500/30'
};

const emptyForm = {
  title: '', description: '', priority: 'Medium', status: 'Pending', type: 'Internal',
  assignedTo: 'Jane Doe', createdBy: 'Jane Doe',
  companyId: '', contactId: '', leadId: '', dealId: '', meetingId: '', campaignId: '',
  parentTaskId: '', dueDate: '', startDate: '', estimatedHours: '', actualHours: '',
  progress: '0', reminder: '', repeat: 'None', tags: '', notes: ''
};

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ totalRecords: 0, totalPages: 1, currentPage: 1, recordsPerPage: 10 });

  // Filters
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [currentPage, setCurrentPage] = useState(1);

  // Selectors
  const [companies, setCompanies] = useState([]);
  const [deals, setDeals] = useState([]);
  const [leads, setLeads] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [campaigns, setCampaigns] = useState([]);

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Bulk
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAction, setBulkAction] = useState('');

  // Form
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });

  // View Details
  const [activeTab, setActiveTab] = useState('overview');
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [checklist, setChecklist] = useState([]);
  const [comments, setComments] = useState([]);
  const [tabData, setTabData] = useState({ documents: [], activity: [] });
  const [newChecklistText, setNewChecklistText] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);

  const showToast = (message, type = 'success') => setToast({ isOpen: true, message, type });

  const fld = (name) => (e) => setFormData(prev => ({ ...prev, [name]: e.target.value }));

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: currentPage, limit: 10, sort: sortBy, search };
      if (priorityFilter !== 'ALL') params.priority = priorityFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (typeFilter !== 'ALL') params.type = typeFilter;

      const res = await TaskService.getTasks(params);
      if (res.data?.success) {
        setTasks(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [currentPage, sortBy, search, priorityFilter, statusFilter, typeFilter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const fetchSelectorLists = async () => {
    try {
      const [cRes, dRes, lRes, ctRes, mRes, cpRes] = await Promise.all([
        CompanyService.getCompanies({ limit: 200 }),
        DealService.getDeals({ limit: 200 }),
        LeadService.getLeads({ limit: 200 }),
        ContactService.getContacts({ limit: 200 }),
        MeetingService.getMeetings({ limit: 200 }),
        CampaignService.getCampaigns({ limit: 200 })
      ]);
      setCompanies(cRes.data?.data || []);
      setDeals(dRes.data?.data || []);
      setLeads(lRes.data?.data || []);
      setContacts(ctRes.data?.data || []);
      setMeetings(mRes.data?.data || []);
      setCampaigns(cpRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load selectors', err);
    }
  };

  // CRUD Handlers
  const handleOpenAdd = () => {
    fetchSelectorLists();
    setIsEditing(false);
    setFormData(emptyForm);
    setFormErrors({});
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (task) => {
    fetchSelectorLists();
    setIsEditing(true);
    setSelectedTask(task);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'Medium',
      status: task.status || 'Pending',
      type: task.type || 'Internal',
      assignedTo: task.assignedTo || 'Jane Doe',
      createdBy: task.createdBy || 'Jane Doe',
      companyId: task.companyId?._id || task.companyId || '',
      contactId: task.contactId?._id || task.contactId || '',
      leadId: task.leadId?._id || task.leadId || '',
      dealId: task.dealId?._id || task.dealId || '',
      meetingId: task.meetingId?._id || task.meetingId || '',
      campaignId: task.campaignId?._id || task.campaignId || '',
      parentTaskId: task.parentTaskId?._id || task.parentTaskId || '',
      dueDate: task.dueDate ? task.dueDate.substring(0, 10) : '',
      startDate: task.startDate ? task.startDate.substring(0, 10) : '',
      estimatedHours: task.estimatedHours || '',
      actualHours: task.actualHours || '',
      progress: task.progress?.toString() || '0',
      reminder: task.reminder ? task.reminder.substring(0, 16) : '',
      repeat: task.repeat || 'None',
      tags: task.tags?.join(', ') || '',
      notes: task.notes || ''
    });
    setFormErrors({});
    setIsAddEditOpen(true);
  };

  const handleOpenView = async (task) => {
    setSelectedTask(task);
    setActiveTab('overview');
    setChecklist([]);
    setComments([]);
    setTabData({ documents: [], activity: [] });
    setIsViewOpen(true);
    try {
      const res = await TaskService.getTask(task._id);
      if (res.data?.success) setSelectedTask(res.data.data);
    } catch (err) {
      console.error('Failed to load task detail', err);
    }
  };

  const handleTabChange = async (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'overview') return;

    setRelatedLoading(true);
    try {
      if (tabId === 'checklist') {
        const res = await TaskService.getChecklist(selectedTask._id);
        setChecklist(res.data?.data || []);
      } else if (tabId === 'comments') {
        const res = await TaskService.getComments(selectedTask._id);
        setComments(res.data?.data || []);
      } else if (tabId === 'documents') {
        const docRes = await DocumentService.getDocuments('Task', selectedTask._id);
        setTabData(prev => ({ ...prev, documents: docRes.data?.data || [] }));
      } else if (tabId === 'activity' || tabId === 'history') {
        const actRes = await ActivityService.getCompanyActivity(selectedTask._id);
        setTabData(prev => ({ ...prev, activity: actRes.data?.data || [] }));
      }
    } catch (err) {
      console.error(`Failed to load ${tabId}`, err);
    } finally {
      setRelatedLoading(false);
    }
  };

  // Checklist actions
  const handleAddChecklist = async () => {
    if (!newChecklistText.trim()) return;
    try {
      await TaskService.addChecklistItem(selectedTask._id, { text: newChecklistText });
      setNewChecklistText('');
      const res = await TaskService.getChecklist(selectedTask._id);
      setChecklist(res.data?.data || []);
    } catch (err) {
      showToast('Failed to add item', 'error');
    }
  };

  const handleToggleChecklist = async (itemId) => {
    try {
      await TaskService.toggleChecklistItem(selectedTask._id, itemId);
      const res = await TaskService.getChecklist(selectedTask._id);
      setChecklist(res.data?.data || []);
    } catch (err) {
      showToast('Failed to toggle item', 'error');
    }
  };

  const handleDeleteChecklist = async (itemId) => {
    try {
      await TaskService.deleteChecklistItem(selectedTask._id, itemId);
      const res = await TaskService.getChecklist(selectedTask._id);
      setChecklist(res.data?.data || []);
    } catch (err) {
      showToast('Failed to delete item', 'error');
    }
  };

  // Comment actions
  const handleAddComment = async () => {
    if (!newCommentText.trim()) return;
    try {
      await TaskService.addComment(selectedTask._id, { comment: newCommentText });
      setNewCommentText('');
      const res = await TaskService.getComments(selectedTask._id);
      setComments(res.data?.data || []);
    } catch (err) {
      showToast('Failed to add comment', 'error');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await TaskService.deleteComment(selectedTask._id, commentId);
      const res = await TaskService.getComments(selectedTask._id);
      setComments(res.data?.data || []);
    } catch (err) {
      showToast('Failed to delete comment', 'error');
    }
  };

  // Document actions
  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!uploadFileName.trim()) return;
    setUploadLoading(true);
    try {
      const payload = { entityType: 'Task', entityId: selectedTask._id, fileName: uploadFileName, fileSize: Math.round(15000 + Math.random() * 2500000) };
      const res = await DocumentService.uploadDocument(payload);
      if (res.data?.success) {
        showToast('Document uploaded.');
        setUploadFileName('');
        const docRes = await DocumentService.getDocuments('Task', selectedTask._id);
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
        const docRes = await DocumentService.getDocuments('Task', selectedTask._id);
        setTabData(prev => ({ ...prev, documents: docRes.data?.data || [] }));
      }
    } catch (err) {
      showToast('Delete failed', 'error');
    }
  };

  // Quick actions
  const handleComplete = async (task) => {
    try {
      const res = await TaskService.completeTask(task._id);
      if (res.data?.success) { showToast('Task completed!'); fetchTasks(); }
    } catch (err) { showToast('Failed to complete task', 'error'); }
  };

  const handleReopen = async (task) => {
    try {
      const res = await TaskService.reopenTask(task._id);
      if (res.data?.success) { showToast('Task reopened.'); fetchTasks(); }
    } catch (err) { showToast('Failed to reopen task', 'error'); }
  };

  const handleDuplicate = async (task) => {
    try {
      const res = await TaskService.duplicateTask(task._id);
      if (res.data?.success) { showToast('Task duplicated!'); fetchTasks(); }
    } catch (err) { showToast('Failed to duplicate task', 'error'); }
  };

  // Form submit
  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.dueDate) errors.dueDate = 'Due date is required';
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
        estimatedHours: formData.estimatedHours ? Number(formData.estimatedHours) : 0,
        actualHours: formData.actualHours ? Number(formData.actualHours) : 0,
        progress: formData.progress ? Number(formData.progress) : 0,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      };
      // Clean optional ObjectId fields
      ['companyId', 'contactId', 'leadId', 'dealId', 'meetingId', 'campaignId', 'parentTaskId'].forEach(f => {
        if (!payload[f]) payload[f] = null;
      });
      if (!payload.reminder) payload.reminder = null;
      if (!payload.startDate) payload.startDate = null;

      if (isEditing) {
        const res = await TaskService.updateTask(selectedTask._id, payload);
        if (res.data.success) { showToast('Task updated!'); setIsAddEditOpen(false); fetchTasks(); }
      } else {
        const res = await TaskService.createTask(payload);
        if (res.data.success) { showToast('Task created!'); setIsAddEditOpen(false); fetchTasks(); }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Submission failed.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleOpenDelete = (task) => { setSelectedTask(task); setIsDeleteOpen(true); };

  const handleConfirmDelete = async () => {
    setSubmitLoading(true);
    try {
      const res = await TaskService.deleteTask(selectedTask._id);
      if (res.data.success) { showToast('Task deleted.'); setIsDeleteOpen(false); fetchTasks(); }
    } catch (err) {
      showToast('Failed to delete task.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Bulk actions
  const handleSelectAll = (e) => {
    setSelectedIds(e.target.checked ? tasks.map(t => t._id) : []);
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.length === 0) return;
    try {
      if (bulkAction === 'delete') {
        await TaskService.bulkDeleteTasks({ taskIds: selectedIds });
        showToast(`${selectedIds.length} tasks deleted.`);
      } else {
        await TaskService.bulkUpdateTasks({ taskIds: selectedIds, updates: { status: bulkAction } });
        showToast(`${selectedIds.length} tasks updated.`);
      }
      setSelectedIds([]);
      setBulkAction('');
      fetchTasks();
    } catch (err) {
      showToast('Bulk action failed.', 'error');
    }
  };

  // Notes autosave
  const handleNotesSave = async (val) => {
    try {
      await TaskService.updateTask(selectedTask._id, { notes: val });
      showToast('Notes saved.');
    } catch (err) {
      showToast('Failed to save notes.', 'error');
    }
  };

  // Columns
  const columns = [
    {
      header: () => (
        <input type="checkbox" checked={selectedIds.length === tasks.length && tasks.length > 0} onChange={handleSelectAll}
          className="rounded border-slate-600 text-indigo-600 focus:ring-indigo-500" />
      ),
      cell: (row) => (
        <input type="checkbox" checked={selectedIds.includes(row._id)} onChange={() => handleSelectOne(row._id)}
          className="rounded border-slate-600 text-indigo-600 focus:ring-indigo-500" />
      ),
      width: '40px'
    },
    { header: 'Task #', accessor: 'taskNumber', cell: (row) => <span className="font-mono text-xs text-indigo-400">{row.taskNumber}</span> },
    { header: 'Title', accessor: 'title', cell: (row) => <span className="font-semibold text-slate-200 truncate max-w-[200px] block">{row.title}</span> },
    {
      header: 'Type', accessor: 'type',
      cell: (row) => <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">{row.type}</span>
    },
    {
      header: 'Priority', accessor: 'priority',
      cell: (row) => <span className={`text-xs px-2 py-0.5 rounded border font-bold ${PRIORITY_COLORS[row.priority] || ''}`}>{row.priority}</span>
    },
    { header: 'Status', accessor: 'status', cell: (row) => <StatusBadge status={row.status} /> },
    { header: 'Assigned', accessor: 'assignedTo', cell: (row) => <span className="text-xs text-slate-400">{row.assignedTo}</span> },
    {
      header: 'Company', accessor: 'companyId',
      cell: (row) => <span className="text-xs text-slate-400">{row.companyId?.companyName || '—'}</span>
    },
    {
      header: 'Deal', accessor: 'dealId',
      cell: (row) => <span className="text-xs text-slate-400">{row.dealId?.dealName || '—'}</span>
    },
    {
      header: 'Due Date', accessor: 'dueDate',
      cell: (row) => {
        const d = row.dueDate ? new Date(row.dueDate) : null;
        const isOverdue = d && d < new Date() && !['Completed', 'Cancelled'].includes(row.status);
        return <span className={`text-xs ${isOverdue ? 'text-red-400 font-bold' : 'text-slate-400'}`}>{d ? d.toLocaleDateString() : '—'}</span>;
      }
    },
    {
      header: 'Progress', accessor: 'progress',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${row.progress || 0}%` }} />
          </div>
          <span className="text-[10px] text-slate-500">{row.progress || 0}%</span>
        </div>
      )
    },
    {
      header: 'Actions', accessor: '_id',
      cell: (row) => (
        <div className="flex items-center gap-1">
          <IconButton onClick={() => handleOpenView(row)} tooltip="View"><Eye className="h-4 w-4" /></IconButton>
          <IconButton onClick={() => handleOpenEdit(row)} tooltip="Edit"><Edit2 className="h-4 w-4" /></IconButton>
          {row.status !== 'Completed' ? (
            <IconButton onClick={() => handleComplete(row)} tooltip="Complete"><Check className="h-4 w-4 text-emerald-400" /></IconButton>
          ) : (
            <IconButton onClick={() => handleReopen(row)} tooltip="Reopen"><RotateCcw className="h-4 w-4 text-amber-400" /></IconButton>
          )}
          <IconButton onClick={() => handleDuplicate(row)} tooltip="Duplicate"><Copy className="h-4 w-4 text-cyan-400" /></IconButton>
          <IconButton onClick={() => handleOpenDelete(row)} tooltip="Delete"><Trash2 className="h-4 w-4 text-red-400" /></IconButton>
        </div>
      )
    }
  ];

  // View Details Tabs
  const detailTabs = [
    { id: 'overview', label: 'Overview', icon: CheckSquare },
    { id: 'checklist', label: 'Checklist', icon: ListChecks, count: checklist.length },
    { id: 'comments', label: 'Comments', icon: MessageSquare, count: comments.length },
    { id: 'documents', label: 'Documents', icon: FileText, count: tabData.documents.length },
    { id: 'history', label: 'History', icon: History },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'related', label: 'Related Records', icon: Link2 },
    { id: 'notes', label: 'Notes', icon: FileText }
  ];

  // Render tab content
  const renderTabContent = () => {
    if (relatedLoading) {
      return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-indigo-400" /></div>;
    }

    if (activeTab === 'overview') {
      return (
        <div className="space-y-6">
          {/* KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Priority', value: selectedTask?.priority, icon: Flag, color: PRIORITY_COLORS[selectedTask?.priority] },
              { label: 'Status', value: selectedTask?.status, icon: Target },
              { label: 'Type', value: selectedTask?.type, icon: CheckSquare },
              { label: 'Progress', value: `${selectedTask?.progress || 0}%`, icon: TrendingUp },
              { label: 'Due Date', value: selectedTask?.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : '—', icon: Calendar },
              { label: 'Assigned To', value: selectedTask?.assignedTo, icon: User },
              { label: 'Est. Hours', value: selectedTask?.estimatedHours || '0', icon: Clock },
              { label: 'Actual Hours', value: selectedTask?.actualHours || '0', icon: Clock },
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-3 text-center">
                <item.icon className="h-4 w-4 mx-auto text-indigo-400 mb-1" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-450 block">{item.label}</span>
                <span className={`text-sm font-extrabold text-slate-200 mt-1 ${item.color || ''}`}>{item.value}</span>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <SectionCard title="Progress">
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500" style={{ width: `${selectedTask?.progress || 0}%` }} />
            </div>
            <p className="text-xs text-slate-400 mt-1">{selectedTask?.progress || 0}% complete</p>
          </SectionCard>

          {/* Description */}
          {selectedTask?.description && (
            <SectionCard title="Description">
              <p className="text-sm text-slate-300 whitespace-pre-wrap">{selectedTask.description}</p>
            </SectionCard>
          )}

          {/* Dependencies */}
          {selectedTask?.dependsOn?.length > 0 && (
            <SectionCard title="Dependencies (Blocked By)">
              <div className="space-y-2">
                {selectedTask.dependsOn.map(dep => (
                  <div key={dep._id} className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 rounded-lg border border-slate-700/50">
                    <CheckSquare className="h-4 w-4 text-amber-400" />
                    <span className="text-sm text-slate-300">{dep.title}</span>
                    <span className="ml-auto text-xs"><StatusBadge status={dep.status} /></span>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Tags */}
          {selectedTask?.tags?.length > 0 && (
            <SectionCard title="Tags">
              <div className="flex flex-wrap gap-2">
                {selectedTask.tags.map((tag, idx) => (
                  <span key={idx} className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">{tag}</span>
                ))}
              </div>
            </SectionCard>
          )}
        </div>
      );
    }

    if (activeTab === 'checklist') {
      const completedCount = checklist.filter(c => c.isCompleted).length;
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">Checklist ({completedCount}/{checklist.length})</h3>
            {checklist.length > 0 && (
              <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(completedCount / checklist.length) * 100}%` }} />
              </div>
            )}
          </div>

          {/* Items */}
          <div className="space-y-2">
            {checklist.map(item => (
              <div key={item._id} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${item.isCompleted ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-800/40 border-slate-700/50'}`}>
                <button onClick={() => handleToggleChecklist(item._id)} className="shrink-0">
                  {item.isCompleted
                    ? <CheckCircle className="h-5 w-5 text-emerald-400" />
                    : <Square className="h-5 w-5 text-slate-500 hover:text-indigo-400 transition-colors" />
                  }
                </button>
                <span className={`text-sm flex-1 ${item.isCompleted ? 'line-through text-slate-500' : 'text-slate-300'}`}>{item.text}</span>
                <button onClick={() => handleDeleteChecklist(item._id)} className="text-slate-600 hover:text-red-400 transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add new */}
          <div className="flex gap-2">
            <TextInput placeholder="Add checklist item..." value={newChecklistText} onChange={(e) => setNewChecklistText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddChecklist()} />
            <PrimaryButton onClick={handleAddChecklist} disabled={!newChecklistText.trim()}>
              <Plus className="h-4 w-4" />
            </PrimaryButton>
          </div>
        </div>
      );
    }

    if (activeTab === 'comments') {
      return (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-200">Comments ({comments.length})</h3>

          {/* Comment list */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {comments.length === 0 && <p className="text-xs text-slate-500 italic">No comments yet. Be the first to comment.</p>}
            {comments.map(c => (
              <div key={c._id} className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-[10px] text-white font-bold">
                      {c.user?.charAt(0) || 'U'}
                    </div>
                    <span className="text-xs font-semibold text-slate-300">{c.user}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-600">{new Date(c.createdAt).toLocaleString()}</span>
                    <button onClick={() => handleDeleteComment(c._id)} className="text-slate-600 hover:text-red-400 transition-colors">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-300">{c.comment}</p>
              </div>
            ))}
          </div>

          {/* Add comment */}
          <div className="flex gap-2">
            <div className="flex-1">
              <TextArea placeholder="Write a comment..." value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)} rows={2} />
            </div>
            <PrimaryButton onClick={handleAddComment} disabled={!newCommentText.trim()} className="self-end">
              <Send className="h-4 w-4" />
            </PrimaryButton>
          </div>
        </div>
      );
    }

    if (activeTab === 'documents') {
      return (
        <div className="space-y-4">
          <form onSubmit={handleUploadDocument} className="flex gap-2">
            <TextInput placeholder="e.g. task_report.pdf" value={uploadFileName} onChange={(e) => setUploadFileName(e.target.value)} />
            <PrimaryButton type="submit" disabled={uploadLoading || !uploadFileName.trim()}>
              {uploadLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Upload'}
            </PrimaryButton>
          </form>
          {tabData.documents.length === 0
            ? <p className="text-xs text-slate-500 italic">No documents attached.</p>
            : (
              <div className="space-y-2">
                {tabData.documents.map(doc => (
                  <div key={doc._id} className="flex items-center justify-between px-3 py-2 bg-slate-800/40 rounded-lg border border-slate-700/50">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-400" />
                      <span className="text-sm text-slate-300">{doc.fileName}</span>
                      <span className="text-[10px] text-slate-600">{(doc.fileSize / 1024).toFixed(1)} KB</span>
                    </div>
                    <button onClick={() => handleDeleteDocument(doc._id)} className="text-slate-500 hover:text-red-400">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      );
    }

    if (activeTab === 'history' || activeTab === 'activity') {
      return (
        <div className="space-y-3">
          {tabData.activity.length === 0
            ? <p className="text-xs text-slate-500 italic">No activity recorded yet.</p>
            : tabData.activity.map((act, idx) => (
                <div key={idx} className="flex items-start gap-3 px-3 py-2 bg-slate-800/40 rounded-lg border border-slate-700/50">
                  <Activity className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-slate-300">{act.description}</p>
                    <p className="text-[10px] text-slate-600">{new Date(act.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))
          }
        </div>
      );
    }

    if (activeTab === 'related') {
      return (
        <div className="space-y-4">
          {selectedTask?.companyId && typeof selectedTask.companyId === 'object' && (
            <SectionCard title="Related Company">
              <div className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                <Building2 className="h-5 w-5 text-indigo-400" />
                <div>
                  <p className="text-sm font-semibold text-slate-200">{selectedTask.companyId.companyName}</p>
                  <p className="text-[10px] text-slate-500">{selectedTask.companyId.companyCode}</p>
                </div>
              </div>
            </SectionCard>
          )}
          {selectedTask?.dealId && typeof selectedTask.dealId === 'object' && (
            <SectionCard title="Related Deal">
              <div className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="text-sm font-semibold text-slate-200">{selectedTask.dealId.dealName}</p>
                  <p className="text-[10px] text-slate-500">{selectedTask.dealId.dealNumber} • {selectedTask.dealId.stage}</p>
                </div>
              </div>
            </SectionCard>
          )}
          {selectedTask?.leadId && typeof selectedTask.leadId === 'object' && (
            <SectionCard title="Related Lead">
              <div className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                <Target className="h-5 w-5 text-amber-400" />
                <div>
                  <p className="text-sm font-semibold text-slate-200">{selectedTask.leadId.firstName} {selectedTask.leadId.lastName}</p>
                  <p className="text-[10px] text-slate-500">{selectedTask.leadId.company}</p>
                </div>
              </div>
            </SectionCard>
          )}
          {selectedTask?.contactId && typeof selectedTask.contactId === 'object' && (
            <SectionCard title="Related Contact">
              <div className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                <User className="h-5 w-5 text-cyan-400" />
                <div>
                  <p className="text-sm font-semibold text-slate-200">{selectedTask.contactId.firstName} {selectedTask.contactId.lastName}</p>
                  <p className="text-[10px] text-slate-500">{selectedTask.contactId.company}</p>
                </div>
              </div>
            </SectionCard>
          )}
          {selectedTask?.meetingId && typeof selectedTask.meetingId === 'object' && (
            <SectionCard title="Related Meeting">
              <div className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                <Calendar className="h-5 w-5 text-violet-400" />
                <div>
                  <p className="text-sm font-semibold text-slate-200">{selectedTask.meetingId.title}</p>
                  <p className="text-[10px] text-slate-500">{selectedTask.meetingId.meetingDate ? new Date(selectedTask.meetingId.meetingDate).toLocaleDateString() : ''}</p>
                </div>
              </div>
            </SectionCard>
          )}
          {!selectedTask?.companyId && !selectedTask?.dealId && !selectedTask?.leadId && !selectedTask?.contactId && !selectedTask?.meetingId && (
            <p className="text-xs text-slate-500 italic">No related records linked to this task.</p>
          )}
        </div>
      );
    }

    if (activeTab === 'notes') {
      return (
        <SectionCard title="Task Notes">
          <TextArea
            rows={6}
            placeholder="Add notes here... (auto-saves on blur)"
            defaultValue={selectedTask?.notes || ''}
            onBlur={(e) => handleNotesSave(e.target.value)}
          />
        </SectionCard>
      );
    }

    return null;
  };

  return (
    <PageContainer>
      <Toast isOpen={toast.isOpen} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, isOpen: false }))} />

      <PageHeader
        title="Tasks"
        subtitle={`${pagination.totalRecords} total tasks`}
        icon={CheckSquare}
        actions={
          <div className="flex gap-2">
            <OutlineButton onClick={fetchTasks}><RefreshCw className="h-4 w-4" /></OutlineButton>
            <PrimaryButton onClick={handleOpenAdd}><Plus className="h-4 w-4" /> Add Task</PrimaryButton>
          </div>
        }
      />

      {/* Filters */}
      <SectionCard>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[180px]">
            <SearchInput placeholder="Search tasks..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
          </div>
          <SelectInput label="Priority" value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
            options={[{ value: 'ALL', label: 'All Priorities' }, ...PRIORITIES.map(p => ({ value: p, label: p }))]} />
          <SelectInput label="Status" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            options={[{ value: 'ALL', label: 'All Statuses' }, ...STATUSES.map(s => ({ value: s, label: s }))]} />
          <SelectInput label="Type" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
            options={[{ value: 'ALL', label: 'All Types' }, ...TYPES.map(t => ({ value: t, label: t }))]} />
          <SelectInput label="Sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: '-createdAt', label: 'Newest' },
              { value: 'createdAt', label: 'Oldest' },
              { value: 'dueDate', label: 'Due Date ↑' },
              { value: '-dueDate', label: 'Due Date ↓' },
              { value: '-priority', label: 'Priority ↓' }
            ]}
          />
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="mt-3 flex items-center gap-3 px-3 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
            <span className="text-xs font-bold text-indigo-400">{selectedIds.length} selected</span>
            <SelectInput value={bulkAction} onChange={(e) => setBulkAction(e.target.value)}
              options={[
                { value: '', label: 'Choose action...' },
                { value: 'Completed', label: 'Mark Completed' },
                { value: 'In Progress', label: 'Mark In Progress' },
                { value: 'Cancelled', label: 'Mark Cancelled' },
                { value: 'delete', label: 'Delete Selected' }
              ]}
            />
            <PrimaryButton onClick={handleBulkAction} disabled={!bulkAction}>Apply</PrimaryButton>
            <OutlineButton onClick={() => { setSelectedIds([]); setBulkAction(''); }}>Cancel</OutlineButton>
          </div>
        )}
      </SectionCard>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <span className="text-sm text-red-400">{error}</span>
        </div>
      )}

      {/* Table */}
      <SectionCard noPadding>
        <DataTable columns={columns} data={tasks} loading={loading} emptyMessage="No tasks found. Create your first task." />
      </SectionCard>

      {pagination.totalPages > 1 && (
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
        title={isEditing ? 'Edit Task' : 'Add New Task'}
        size="xl"
        footer={
          <div className="flex gap-3 justify-end">
            <OutlineButton onClick={() => setIsAddEditOpen(false)}>Cancel</OutlineButton>
            <PrimaryButton onClick={handleSubmit} disabled={submitLoading}>
              {submitLoading ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
            </PrimaryButton>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Task Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <CheckSquare className="h-3.5 w-3.5" /> Task Details
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="Title *" value={formData.title} onChange={fld('title')} error={formErrors.title} placeholder="Follow up with client" />
              <SelectInput label="Type" value={formData.type} onChange={fld('type')}
                options={TYPES.map(t => ({ value: t, label: t }))} />
              <SelectInput label="Priority" value={formData.priority} onChange={fld('priority')}
                options={PRIORITIES.map(p => ({ value: p, label: p }))} />
              <SelectInput label="Status" value={formData.status} onChange={fld('status')}
                options={STATUSES.map(s => ({ value: s, label: s }))} />
              <TextInput label="Assigned To" value={formData.assignedTo} onChange={fld('assignedTo')} placeholder="Jane Doe" />
              <SelectInput label="Repeat" value={formData.repeat} onChange={fld('repeat')}
                options={REPEATS.map(r => ({ value: r, label: r }))} />
            </div>
          </div>

          {/* Scheduling */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> Scheduling
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <TextInput label="Due Date *" type="date" value={formData.dueDate} onChange={fld('dueDate')} error={formErrors.dueDate} />
              <TextInput label="Start Date" type="date" value={formData.startDate} onChange={fld('startDate')} />
              <TextInput label="Reminder" type="datetime-local" value={formData.reminder} onChange={fld('reminder')} />
            </div>
          </div>

          {/* Effort */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Effort Tracking
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <TextInput label="Estimated Hours" type="number" value={formData.estimatedHours} onChange={fld('estimatedHours')} />
              <TextInput label="Actual Hours" type="number" value={formData.actualHours} onChange={fld('actualHours')} />
              <TextInput label="Progress (%)" type="number" value={formData.progress} onChange={fld('progress')} min="0" max="100" />
            </div>
          </div>

          {/* Associations */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Link2 className="h-3.5 w-3.5" /> Associations
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectInput label="Company" value={formData.companyId} onChange={fld('companyId')}
                options={[{ value: '', label: 'None' }, ...companies.map(c => ({ value: c._id, label: `${c.companyName} (${c.companyCode})` }))]} />
              <SelectInput label="Deal" value={formData.dealId} onChange={fld('dealId')}
                options={[{ value: '', label: 'None' }, ...deals.map(d => ({ value: d._id, label: `${d.dealName} (${d.dealNumber})` }))]} />
              <SelectInput label="Lead" value={formData.leadId} onChange={fld('leadId')}
                options={[{ value: '', label: 'None' }, ...leads.map(l => ({ value: l._id, label: `${l.firstName} ${l.lastName}` }))]} />
              <SelectInput label="Contact" value={formData.contactId} onChange={fld('contactId')}
                options={[{ value: '', label: 'None' }, ...contacts.map(ct => ({ value: ct._id, label: `${ct.firstName} ${ct.lastName}` }))]} />
              <SelectInput label="Meeting" value={formData.meetingId} onChange={fld('meetingId')}
                options={[{ value: '', label: 'None' }, ...meetings.map(m => ({ value: m._id, label: m.title }))]} />
              <SelectInput label="Campaign" value={formData.campaignId} onChange={fld('campaignId')}
                options={[{ value: '', label: 'None' }, ...campaigns.map(cp => ({ value: cp._id, label: cp.name }))]} />
            </div>
          </div>

          {/* Description & Tags */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Details
            </h3>
            <div className="space-y-4">
              <TextArea label="Description" value={formData.description} onChange={fld('description')} rows={3} placeholder="Detailed task description..." />
              <TextInput label="Tags (comma separated)" value={formData.tags} onChange={fld('tags')} placeholder="urgent, follow-up, Q3" />
              <TextArea label="Notes" value={formData.notes} onChange={fld('notes')} rows={2} placeholder="Additional notes..." />
            </div>
          </div>
        </form>
      </Modal>

      {/* ===================== VIEW DETAILS MODAL ===================== */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title=""
        size="full"
        noPadding
      >
        {selectedTask && (
          <EntityDetailsLayout
            title={selectedTask.title}
            subtitle={`${selectedTask.taskNumber} • ${selectedTask.type} • Created ${new Date(selectedTask.createdAt).toLocaleDateString()}`}
            avatarText={selectedTask.title?.substring(0, 2)?.toUpperCase()}
            status={selectedTask.status}
            summaryCards={[
              { label: 'Priority', value: selectedTask.priority, icon: Flag },
              { label: 'Status', value: selectedTask.status, icon: Target },
              { label: 'Type', value: selectedTask.type, icon: CheckSquare },
              { label: 'Progress', value: `${selectedTask.progress || 0}%`, icon: TrendingUp },
              { label: 'Due', value: selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : '—', icon: Calendar },
              { label: 'Assigned', value: selectedTask.assignedTo, icon: User },
              { label: 'Est. Hrs', value: selectedTask.estimatedHours || '0', icon: Clock },
              { label: 'Actual Hrs', value: selectedTask.actualHours || '0', icon: Clock }
            ]}
            tabs={detailTabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onEditClick={() => { setIsViewOpen(false); handleOpenEdit(selectedTask); }}
            onClose={() => setIsViewOpen(false)}
          >
            {renderTabContent()}
          </EntityDetailsLayout>
        )}
      </Modal>

      {/* ===================== DELETE CONFIRMATION ===================== */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${selectedTask?.title}"? This action will soft-delete the task.`}
        confirmText={submitLoading ? 'Deleting...' : 'Delete'}
        confirmVariant="danger"
      />
    </PageContainer>
  );
}
