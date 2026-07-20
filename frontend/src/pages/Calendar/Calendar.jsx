import React, { useState, useEffect, useCallback, useRef } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import SectionCard from '../../components/cards/SectionCard';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import OutlineButton from '../../components/buttons/OutlineButton';
import TextInput from '../../components/forms/TextInput';
import TextArea from '../../components/forms/TextArea';
import SelectInput from '../../components/forms/SelectInput';
import Modal from '../../components/modal/Modal';
import ConfirmDialog from '../../components/modal/ConfirmDialog';
import Toast from '../../components/toast/Toast';
import CalendarService from '../../services/CalendarService';
import {
  CalendarDays, ChevronLeft, ChevronRight, Plus, Clock, MapPin,
  Eye, Edit2, Trash2, AlertCircle, Loader2, LayoutGrid,
  List, Rows3, CalendarRange, GanttChartSquare, X
} from 'lucide-react';

const VIEWS = [
  { id: 'month', label: 'Month', icon: LayoutGrid },
  { id: 'week', label: 'Week', icon: Rows3 },
  { id: 'day', label: 'Day', icon: CalendarRange },
  { id: 'agenda', label: 'Agenda', icon: List },
  { id: 'timeline', label: 'Timeline', icon: GanttChartSquare }
];

const EVENT_TYPE_COLORS = {
  Meeting: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/40', dot: 'bg-indigo-500' },
  Task: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/40', dot: 'bg-amber-500' },
  Deal: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/40', dot: 'bg-emerald-500' },
  Campaign: { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/40', dot: 'bg-rose-500' },
  FollowUp: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/40', dot: 'bg-cyan-500' },
  Holiday: { bg: 'bg-violet-500/20', text: 'text-violet-400', border: 'border-violet-500/40', dot: 'bg-violet-500' },
  CompanyEvent: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/40', dot: 'bg-blue-500' },
  Birthday: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/40', dot: 'bg-pink-500' },
  Standalone: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/40', dot: 'bg-slate-500' }
};

const ENTITY_TYPES = ['Meeting', 'Task', 'Deal', 'Campaign', 'Holiday', 'CompanyEvent', 'Birthday', 'FollowUp', 'Standalone'];
const EVENT_STATUSES = ['Scheduled', 'Completed', 'Cancelled', 'Tentative'];
const RECURRENCES = ['None', 'Daily', 'Weekly', 'Monthly', 'Yearly'];
const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7am to 9pm

const emptyEventForm = {
  title: '', description: '', entityType: 'Standalone', start: '', end: '',
  allDay: false, color: '#6366f1', recurrence: 'None', status: 'Scheduled',
  location: '', notes: ''
};

// Helpers
const isSameDay = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
const formatTime = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(emptyEventForm);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => setToast({ isOpen: true, message, type });

  // Drag state
  const [draggedEvent, setDraggedEvent] = useState(null);

  const fld = (name) => (e) => setFormData(prev => ({ ...prev, [name]: e.target.value }));
  const fldCheck = (name) => (e) => setFormData(prev => ({ ...prev, [name]: e.target.checked }));

  // Fetch events for current view range
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      let start, end;
      if (view === 'month') {
        start = new Date(year, month, 1);
        start.setDate(start.getDate() - start.getDay()); // start of week containing 1st
        end = new Date(year, month + 1, 0);
        end.setDate(end.getDate() + (6 - end.getDay())); // end of week containing last
      } else if (view === 'week') {
        start = new Date(currentDate);
        start.setDate(start.getDate() - start.getDay());
        end = new Date(start);
        end.setDate(end.getDate() + 6);
      } else if (view === 'day') {
        start = new Date(currentDate);
        end = new Date(currentDate);
      } else {
        // agenda/timeline: next 30 days
        start = new Date(currentDate);
        end = new Date(currentDate);
        end.setDate(end.getDate() + 30);
      }

      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      const res = await CalendarService.getEvents({
        start: start.toISOString(),
        end: end.toISOString()
      });

      setEvents(res.data?.data || []);
    } catch (err) {
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [currentDate, view]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // Navigation
  const navigate = (dir) => {
    const d = new Date(currentDate);
    if (view === 'month') d.setMonth(d.getMonth() + dir);
    else if (view === 'week') d.setDate(d.getDate() + (7 * dir));
    else d.setDate(d.getDate() + dir);
    setCurrentDate(d);
  };

  const goToday = () => setCurrentDate(new Date());

  const handleDayClick = (date) => {
    setCurrentDate(date);
    setView('day');
  };

  // Event CRUD
  const handleOpenAdd = (prefillDate) => {
    setIsEditing(false);
    const dateStr = prefillDate ? new Date(prefillDate).toISOString().substring(0, 16) : '';
    setFormData({ ...emptyEventForm, start: dateStr, end: dateStr });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (evt) => {
    setIsEditing(true);
    setSelectedEvent(evt);
    setFormData({
      title: evt.title || '',
      description: evt.description || '',
      entityType: evt.entityType || evt.type || 'Standalone',
      start: evt.start ? new Date(evt.start).toISOString().substring(0, 16) : '',
      end: evt.end ? new Date(evt.end).toISOString().substring(0, 16) : '',
      allDay: evt.allDay || false,
      color: evt.color || '#6366f1',
      recurrence: evt.recurrence || 'None',
      status: evt.status || 'Scheduled',
      location: evt.location || '',
      notes: evt.notes || ''
    });
    setIsAddEditOpen(true);
    setIsDetailOpen(false);
  };

  const handleEventClick = (evt) => {
    setSelectedEvent(evt);
    setIsDetailOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.start) return;
    setSubmitLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.end) payload.end = payload.start;

      if (isEditing && selectedEvent?.id) {
        const res = await CalendarService.updateEvent(selectedEvent.id, payload);
        if (res.data?.success) { showToast('Event updated!'); setIsAddEditOpen(false); fetchEvents(); }
      } else {
        const res = await CalendarService.createEvent(payload);
        if (res.data?.success) { showToast('Event created!'); setIsAddEditOpen(false); fetchEvents(); }
      }
    } catch (err) {
      showToast('Failed to save event', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent?.id) return;
    try {
      await CalendarService.deleteEvent(selectedEvent.id);
      showToast('Event deleted.');
      setIsDeleteOpen(false);
      setIsDetailOpen(false);
      fetchEvents();
    } catch (err) {
      showToast('Failed to delete', 'error');
    }
  };

  // Drag & Drop
  const handleDragStart = (evt) => setDraggedEvent(evt);

  const handleDrop = async (targetDate) => {
    if (!draggedEvent || !draggedEvent.id) return;
    try {
      const newStart = new Date(targetDate);
      const oldStart = new Date(draggedEvent.start);
      // Keep time, change date
      newStart.setHours(oldStart.getHours(), oldStart.getMinutes());

      await CalendarService.updateEvent(draggedEvent.id, { start: newStart.toISOString() });
      showToast('Event rescheduled!');
      fetchEvents();
    } catch (err) {
      showToast('Failed to reschedule', 'error');
    } finally {
      setDraggedEvent(null);
    }
  };

  // Get color classes for event type
  const getTypeColor = (type) => EVENT_TYPE_COLORS[type] || EVENT_TYPE_COLORS.Standalone;

  // Get events for a specific date
  const getEventsForDate = (date) => events.filter(e => isSameDay(new Date(e.start), date));

  // Check for conflicts
  const hasConflict = (evt) => {
    if (evt.allDay) return false;
    const evtStart = new Date(evt.start).getTime();
    const evtEnd = new Date(evt.end || evt.start).getTime();
    return events.some(other => {
      if (other.id === evt.id || other.allDay) return false;
      const otherStart = new Date(other.start).getTime();
      const otherEnd = new Date(other.end || other.start).getTime();
      return evtStart < otherEnd && evtEnd > otherStart;
    });
  };

  // ─── RENDER VIEWS ───

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const weeks = [];
    const d = new Date(startDate);
    while (d <= lastDay || d.getDay() !== 0) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(d));
        d.setDate(d.getDate() + 1);
      }
      weeks.push(week);
      if (d > lastDay && d.getDay() === 0) break;
    }

    const today = new Date();

    return (
      <div className="border border-slate-800 rounded-xl overflow-hidden">
        {/* Day names header */}
        <div className="grid grid-cols-7 bg-slate-900/80 border-b border-slate-800">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="px-2 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {day}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-slate-800/50 last:border-b-0">
            {week.map((day, di) => {
              const isCurrentMonth = day.getMonth() === month;
              const isToday = isSameDay(day, today);
              const dayEvents = getEventsForDate(day);

              return (
                <div
                  key={di}
                  className={`min-h-[90px] p-1.5 border-r border-slate-800/30 last:border-r-0 cursor-pointer transition-colors hover:bg-slate-800/30 ${!isCurrentMonth ? 'bg-slate-950/40' : ''}`}
                  onClick={() => handleDayClick(day)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(day)}
                >
                  <div className={`text-xs font-bold mb-1 ${isToday ? 'h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center' : isCurrentMonth ? 'text-slate-300' : 'text-slate-600'}`}>
                    {day.getDate()}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map((evt, idx) => {
                      const color = getTypeColor(evt.type);
                      return (
                        <div
                          key={idx}
                          draggable
                          onDragStart={(e) => { e.stopPropagation(); handleDragStart(evt); }}
                          onClick={(e) => { e.stopPropagation(); handleEventClick(evt); }}
                          className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium cursor-pointer ${color.bg} ${color.text} border ${color.border} ${hasConflict(evt) ? 'ring-1 ring-red-500' : ''}`}
                        >
                          {evt.title}
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <div className="text-[9px] text-slate-500 font-bold pl-1">+{dayEvents.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = new Date(currentDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
    const today = new Date();

    return (
      <div className="border border-slate-800 rounded-xl overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)] bg-slate-900/80 border-b border-slate-800">
          <div className="p-2 border-r border-slate-800/50" />
          {days.map((day, idx) => (
            <div key={idx} className={`p-2 text-center border-r border-slate-800/30 last:border-r-0 ${isSameDay(day, today) ? 'bg-indigo-600/10' : ''}`}>
              <div className="text-[10px] font-bold uppercase text-slate-500">{day.toLocaleDateString('en', { weekday: 'short' })}</div>
              <div className={`text-lg font-bold ${isSameDay(day, today) ? 'text-indigo-400' : 'text-slate-300'}`}>{day.getDate()}</div>
            </div>
          ))}
        </div>

        {/* Time slots */}
        <div className="max-h-[500px] overflow-y-auto">
          {HOURS.map(hour => (
            <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-slate-800/30 last:border-b-0">
              <div className="p-1.5 text-right pr-2 border-r border-slate-800/50">
                <span className="text-[10px] text-slate-600 font-mono">{hour > 12 ? hour - 12 : hour}{hour >= 12 ? 'PM' : 'AM'}</span>
              </div>
              {days.map((day, idx) => {
                const slotDate = new Date(day);
                slotDate.setHours(hour, 0, 0, 0);
                const slotEvents = events.filter(e => {
                  const eStart = new Date(e.start);
                  return isSameDay(eStart, day) && eStart.getHours() === hour;
                });

                return (
                  <div
                    key={idx}
                    className="min-h-[40px] p-0.5 border-r border-slate-800/20 last:border-r-0 hover:bg-slate-800/20 cursor-pointer transition-colors"
                    onClick={() => handleOpenAdd(slotDate)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(slotDate)}
                  >
                    {slotEvents.map((evt, eidx) => {
                      const color = getTypeColor(evt.type);
                      return (
                        <div
                          key={eidx}
                          draggable
                          onDragStart={(e) => { e.stopPropagation(); handleDragStart(evt); }}
                          onClick={(e) => { e.stopPropagation(); handleEventClick(evt); }}
                          className={`text-[10px] px-1.5 py-1 rounded mb-0.5 truncate font-medium cursor-pointer ${color.bg} ${color.text} border ${color.border} ${hasConflict(evt) ? 'ring-1 ring-red-500' : ''}`}
                        >
                          {evt.title}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const today = new Date();
    const isToday = isSameDay(currentDate, today);
    const dayEvents = getEventsForDate(currentDate);
    const allDayEvents = dayEvents.filter(e => e.allDay);
    const timedEvents = dayEvents.filter(e => !e.allDay);

    return (
      <div className="border border-slate-800 rounded-xl overflow-hidden">
        {/* Day header */}
        <div className={`p-4 border-b border-slate-800 ${isToday ? 'bg-indigo-600/10' : 'bg-slate-900/80'}`}>
          <div className="text-sm font-bold text-slate-400">{currentDate.toLocaleDateString('en', { weekday: 'long' })}</div>
          <div className={`text-2xl font-extrabold ${isToday ? 'text-indigo-400' : 'text-slate-200'}`}>
            {currentDate.toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <div className="text-xs text-slate-500 mt-1">{dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}</div>
        </div>

        {/* All day events */}
        {allDayEvents.length > 0 && (
          <div className="p-3 bg-slate-900/40 border-b border-slate-800/50">
            <div className="text-[10px] font-bold uppercase text-slate-500 mb-2">All Day</div>
            <div className="space-y-1">
              {allDayEvents.map((evt, idx) => {
                const color = getTypeColor(evt.type);
                return (
                  <div key={idx} onClick={() => handleEventClick(evt)}
                    className={`px-3 py-2 rounded-lg cursor-pointer ${color.bg} ${color.text} border ${color.border}`}>
                    <span className="text-xs font-semibold">{evt.title}</span>
                    <span className="text-[10px] ml-2 opacity-70">{evt.type}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Hourly slots */}
        <div className="max-h-[500px] overflow-y-auto">
          {HOURS.map(hour => {
            const slotDate = new Date(currentDate);
            slotDate.setHours(hour, 0, 0, 0);
            const slotEvents = timedEvents.filter(e => new Date(e.start).getHours() === hour);

            return (
              <div key={hour} className="flex border-b border-slate-800/30 last:border-b-0">
                <div className="w-16 p-2 text-right pr-3 border-r border-slate-800/50 shrink-0">
                  <span className="text-[10px] text-slate-600 font-mono">{hour > 12 ? hour - 12 : hour}:00 {hour >= 12 ? 'PM' : 'AM'}</span>
                </div>
                <div
                  className="flex-1 min-h-[48px] p-1 hover:bg-slate-800/20 cursor-pointer transition-colors"
                  onClick={() => handleOpenAdd(slotDate)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(slotDate)}
                >
                  {slotEvents.map((evt, idx) => {
                    const color = getTypeColor(evt.type);
                    return (
                      <div
                        key={idx}
                        draggable
                        onDragStart={() => handleDragStart(evt)}
                        onClick={(e) => { e.stopPropagation(); handleEventClick(evt); }}
                        className={`px-3 py-2 rounded-lg mb-1 cursor-pointer ${color.bg} ${color.text} border ${color.border} ${hasConflict(evt) ? 'ring-2 ring-red-500' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold">{evt.title}</span>
                          <span className="text-[10px] opacity-70">{formatTime(evt.start)}</span>
                        </div>
                        {evt.location && <div className="text-[10px] opacity-60 mt-0.5 flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{evt.location}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAgendaView = () => {
    // Group events by date
    const grouped = {};
    events.forEach(evt => {
      const dateKey = new Date(evt.start).toDateString();
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(evt);
    });

    const sortedDates = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b));

    return (
      <div className="space-y-4">
        {sortedDates.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No upcoming events in this range.</p>
          </div>
        )}
        {sortedDates.map(dateStr => {
          const date = new Date(dateStr);
          const isToday = isSameDay(date, new Date());
          return (
            <div key={dateStr}>
              <div className={`text-xs font-bold uppercase tracking-wider mb-2 px-1 ${isToday ? 'text-indigo-400' : 'text-slate-500'}`}>
                {isToday ? '📅 Today — ' : ''}{date.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
              <div className="space-y-2">
                {grouped[dateStr].map((evt, idx) => {
                  const color = getTypeColor(evt.type);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleEventClick(evt)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer border transition-all hover:scale-[1.01] ${color.bg} ${color.border}`}
                    >
                      <div className={`h-2 w-2 rounded-full shrink-0 ${color.dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${color.text}`}>{evt.title}</p>
                        {evt.location && <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5"><MapPin className="h-2.5 w-2.5" />{evt.location}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-500">{evt.allDay ? 'All day' : formatTime(evt.start)}</span>
                        <div className="text-[9px] text-slate-600 mt-0.5">{evt.type}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTimelineView = () => {
    const types = [...new Set(events.map(e => e.type))].sort();
    if (types.length === 0) {
      return (
        <div className="text-center py-12 text-slate-500">
          <GanttChartSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No events to display on timeline.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {types.map(type => {
          const typeEvents = events.filter(e => e.type === type).sort((a, b) => new Date(a.start) - new Date(b.start));
          const color = getTypeColor(type);
          return (
            <div key={type}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`h-3 w-3 rounded-full ${color.dot}`} />
                <h3 className={`text-xs font-bold uppercase tracking-wider ${color.text}`}>{type}s ({typeEvents.length})</h3>
              </div>
              <div className="relative pl-6 border-l-2 border-slate-800 space-y-3">
                {typeEvents.map((evt, idx) => (
                  <div key={idx} className="relative">
                    <div className={`absolute -left-[25px] top-2 h-3 w-3 rounded-full border-2 border-slate-900 ${color.dot}`} />
                    <div
                      onClick={() => handleEventClick(evt)}
                      className={`px-4 py-3 rounded-xl cursor-pointer border transition-all hover:scale-[1.01] ${color.bg} ${color.border}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-semibold ${color.text}`}>{evt.title}</span>
                        <span className="text-[10px] text-slate-500">{new Date(evt.start).toLocaleDateString()}</span>
                      </div>
                      {evt.status && <span className="text-[10px] text-slate-600">{evt.status}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // View title
  const getViewTitle = () => {
    if (view === 'month') return currentDate.toLocaleDateString('en', { month: 'long', year: 'numeric' });
    if (view === 'week') {
      const weekStart = new Date(currentDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return `${weekStart.toLocaleDateString('en', { month: 'short', day: 'numeric' })} – ${weekEnd.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    if (view === 'day') return currentDate.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    return 'Upcoming Events';
  };

  return (
    <PageContainer>
      <Toast isOpen={toast.isOpen} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, isOpen: false }))} />

      <PageHeader
        title="Calendar"
        subtitle={`${events.length} events`}
        icon={CalendarDays}
        actions={
          <PrimaryButton onClick={() => handleOpenAdd()}><Plus className="h-4 w-4" /> New Event</PrimaryButton>
        }
      />

      {/* Toolbar */}
      <SectionCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Navigation */}
          <div className="flex items-center gap-2">
            <OutlineButton onClick={() => navigate(-1)}><ChevronLeft className="h-4 w-4" /></OutlineButton>
            <PrimaryButton onClick={goToday}>Today</PrimaryButton>
            <OutlineButton onClick={() => navigate(1)}><ChevronRight className="h-4 w-4" /></OutlineButton>
            <h2 className="text-lg font-bold text-slate-200 ml-3">{getViewTitle()}</h2>
          </div>

          {/* View Tabs */}
          <div className="flex bg-slate-900/60 rounded-lg border border-slate-800 p-0.5">
            {VIEWS.map(v => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                  view === v.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <v.icon className="h-3.5 w-3.5" />
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-slate-800/50">
          {Object.entries(EVENT_TYPE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className={`h-2 w-2 rounded-full ${color.dot}`} />
              <span className="text-[10px] text-slate-500">{type}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <span className="text-sm text-red-400">{error}</span>
        </div>
      )}

      {/* Calendar Content */}
      <SectionCard>
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-indigo-400" /></div>
        ) : (
          <>
            {view === 'month' && renderMonthView()}
            {view === 'week' && renderWeekView()}
            {view === 'day' && renderDayView()}
            {view === 'agenda' && renderAgendaView()}
            {view === 'timeline' && renderTimelineView()}
          </>
        )}
      </SectionCard>

      {/* ===================== EVENT DETAIL POPOVER ===================== */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Event Details"
        size="md"
        footer={
          <div className="flex gap-2 justify-end">
            {selectedEvent?.entityType === 'Standalone' && (
              <>
                <OutlineButton onClick={() => handleOpenEdit(selectedEvent)}><Edit2 className="h-4 w-4" /> Edit</OutlineButton>
                <OutlineButton onClick={() => { setIsDeleteOpen(true); }} className="text-red-400 border-red-500/30 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /> Delete</OutlineButton>
              </>
            )}
            <PrimaryButton onClick={() => setIsDetailOpen(false)}>Close</PrimaryButton>
          </div>
        }
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className={`h-3 w-3 rounded-full mt-1 ${getTypeColor(selectedEvent.type).dot}`} />
              <div>
                <h3 className="text-lg font-bold text-slate-200">{selectedEvent.title}</h3>
                <p className="text-xs text-slate-500">{selectedEvent.type} • {selectedEvent.status}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="h-4 w-4 text-indigo-400" />
                <span>{selectedEvent.allDay ? 'All day' : formatTime(selectedEvent.start)}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <CalendarDays className="h-4 w-4 text-indigo-400" />
                <span>{new Date(selectedEvent.start).toLocaleDateString()}</span>
              </div>
              {selectedEvent.location && (
                <div className="flex items-center gap-2 text-slate-400 col-span-2">
                  <MapPin className="h-4 w-4 text-indigo-400" />
                  <span>{selectedEvent.location}</span>
                </div>
              )}
            </div>

            {selectedEvent.description && (
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">Description</h4>
                <p className="text-sm text-slate-300">{selectedEvent.description}</p>
              </div>
            )}

            {selectedEvent.notes && (
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">Notes</h4>
                <p className="text-sm text-slate-300">{selectedEvent.notes}</p>
              </div>
            )}

            {hasConflict(selectedEvent) && (
              <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                <span className="text-xs text-red-400 font-bold">⚠ Schedule conflict detected with another event</span>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ===================== ADD/EDIT EVENT MODAL ===================== */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={isEditing ? 'Edit Event' : 'New Event'}
        size="lg"
        footer={
          <div className="flex gap-3 justify-end">
            <OutlineButton onClick={() => setIsAddEditOpen(false)}>Cancel</OutlineButton>
            <PrimaryButton onClick={handleSubmit} disabled={submitLoading}>
              {submitLoading ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event'}
            </PrimaryButton>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextInput label="Event Title *" value={formData.title} onChange={fld('title')} placeholder="Team standup meeting" />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label="Start *" type="datetime-local" value={formData.start} onChange={fld('start')} />
            <TextInput label="End" type="datetime-local" value={formData.end} onChange={fld('end')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <SelectInput label="Type" value={formData.entityType} onChange={fld('entityType')}
              options={ENTITY_TYPES.map(t => ({ value: t, label: t }))} />
            <SelectInput label="Status" value={formData.status} onChange={fld('status')}
              options={EVENT_STATUSES.map(s => ({ value: s, label: s }))} />
            <SelectInput label="Recurrence" value={formData.recurrence} onChange={fld('recurrence')}
              options={RECURRENCES.map(r => ({ value: r, label: r }))} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label="Location" value={formData.location} onChange={fld('location')} placeholder="Zoom / Office" />
            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" checked={formData.allDay} onChange={fldCheck('allDay')}
                className="rounded border-slate-600 text-indigo-600 focus:ring-indigo-500" id="allDay" />
              <label htmlFor="allDay" className="text-sm text-slate-300">All Day Event</label>
            </div>
          </div>
          <TextArea label="Description" value={formData.description} onChange={fld('description')} rows={2} />
          <TextArea label="Notes" value={formData.notes} onChange={fld('notes')} rows={2} />
        </form>
      </Modal>

      {/* ===================== DELETE CONFIRM ===================== */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Event"
        message={`Are you sure you want to delete "${selectedEvent?.title}"?`}
        confirmText="Delete"
        confirmVariant="danger"
      />
    </PageContainer>
  );
}
