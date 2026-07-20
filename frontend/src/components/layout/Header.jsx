import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  User,
  LogOut,
  HelpCircle,
  X,
  Target,
  Users,
  Calendar,
  Megaphone,
  Check,
  BellRing,
  Building2,
  TrendingUp,
  CheckSquare
} from 'lucide-react';
import SearchService from '../../services/SearchService';
import NotificationService from '../../services/NotificationService';

export default function Header({ setIsMobileOpen, isSidebarCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Universal Search states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ leads: [], contacts: [], meetings: [], campaigns: [], companies: [], deals: [] });
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeSearchIndex, setActiveSearchIndex] = useState(0);

  // Notification states
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);

  const searchInputRef = useRef(null);
  const notificationsRef = useRef(null);

  // Format title
  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/': return 'Executive Dashboard';
      case '/leads': return 'Leads Directory';
      case '/contacts': return 'Contacts Hub';
      case '/meetings': return 'Meetings Planner';
      case '/campaigns': return 'Outreach Campaigns';
      case '/companies': return 'Companies';
      case '/deals': return 'Deals Pipeline';
      case '/tasks': return 'Task Manager';
      case '/calendar': return 'Calendar';
      case '/settings': return 'User Settings';
      default: return 'Enterprise CRM';
    }
  };

  // Keyboard shortcut Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Autofocus input when modal opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => { searchInputRef.current.focus(); }, 50);
    } else {
      setSearchQuery('');
      setSearchResults({ leads: [], contacts: [], meetings: [], campaigns: [], companies: [], deals: [] });
    }
  }, [isSearchOpen]);

  // Click outside listener for notifications
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Notifications count and list
  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const [listRes, countRes] = await Promise.all([
        NotificationService.getNotifications(),
        NotificationService.getUnreadCount()
      ]);
      if (listRes.data?.success) setNotifications(listRes.data.data);
      if (countRes.data?.success) setUnreadCount(countRes.data.data.count);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setNotifLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Poll notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Debounced search logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ leads: [], contacts: [], meetings: [], campaigns: [], companies: [], deals: [], tasks: [] });
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const response = await SearchService.globalSearch(searchQuery);
        if (response.data?.success) {
          setSearchResults(response.data.data);
          setActiveSearchIndex(0);
        }
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Flattened results list for arrow key navigation
  const getFlattenedResults = () => {
    const flat = [];
    Object.entries(searchResults).forEach(([category, list]) => {
      list.forEach(item => {
        flat.push({ ...item, category });
      });
    });
    return flat;
  };

  const flattenedResults = getFlattenedResults();

  // Handle keyboard navigation inside search modal
  const handleSearchKeyDown = (e) => {
    if (flattenedResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSearchIndex((prev) => (prev + 1) % flattenedResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSearchIndex((prev) => (prev - 1 + flattenedResults.length) % flattenedResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const activeItem = flattenedResults[activeSearchIndex];
      handleSelectResult(activeItem);
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
    }
  };

  const handleSelectResult = (item) => {
    setIsSearchOpen(false);
    if (item.category === 'leads') navigate(`/leads?id=${item._id}`);
    else if (item.category === 'contacts') navigate(`/contacts?id=${item._id}`);
    else if (item.category === 'meetings') navigate('/meetings');
    else if (item.category === 'campaigns') navigate('/campaigns');
    else if (item.category === 'companies') navigate('/companies');
    else if (item.category === 'deals') navigate('/deals');
    else if (item.category === 'tasks') navigate('/tasks');
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      const response = await NotificationService.markAllAsRead();
      if (response.data?.success) {
        setUnreadCount(0);
        // Toggle notifications isRead locally
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Mark single as read
  const handleMarkRead = async (id) => {
    try {
      const response = await NotificationService.markAsRead(id);
      if (response.data?.success) {
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md">
        {/* Left: Hamburg menu & Page title */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 lg:hidden transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="text-sm font-extrabold text-slate-800 lg:text-base tracking-tight transition-all duration-200 uppercase">
            {getPageTitle(location.pathname)}
          </h2>
        </div>

        {/* Middle: Universal Global Search Bar */}
        <div className="hidden max-w-md flex-1 px-8 md:block">
          <div
            onClick={() => setIsSearchOpen(true)}
            className="relative flex items-center justify-between w-full rounded-xl border border-slate-200 bg-slate-50/40 px-3.5 py-1.5 text-xs text-slate-450 hover:border-slate-300 cursor-pointer transition-all duration-200 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-400" />
              <span className="font-semibold text-slate-400">Search leads, contacts, campaigns...</span>
            </div>
            <kbd className="inline-flex h-5 select-none items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 font-mono text-[9px] font-bold text-slate-400 shadow-sm">
              <span className="text-[10px]">Ctrl</span>K
            </kbd>
          </div>
        </div>

        {/* Right side: Notifications Center & Profile */}
        <div className="flex items-center gap-4">
          {/* Mobile search toggle */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 md:hidden transition-colors"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Notification Center Dropdown */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-150 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition shadow-sm"
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-extrabold text-white ring-1 ring-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 z-40 origin-top-right rounded-xl border border-slate-150 bg-white shadow-xl p-1 animate-in fade-in-50 slide-in-from-top-1 duration-150">
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 mb-1">
                  <div className="flex items-center gap-1.5">
                    <BellRing className="h-4 w-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-800">Notification Center</span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] font-bold text-indigo-600 hover:underline hover:text-indigo-800"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                  {notifLoading ? (
                    <p className="text-xs text-slate-400 py-6 text-center">Loading alerts...</p>
                  ) : notifications.length === 0 ? (
                    <div className="py-8 px-4 text-center text-xs text-slate-400 font-semibold">
                      All caught up! No recent alerts.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => !n.isRead && handleMarkRead(n._id)}
                        className={`flex items-start gap-2.5 p-2.5 text-xs transition cursor-pointer hover:bg-slate-50/50 rounded-lg ${
                          !n.isRead ? 'bg-indigo-50/30 font-semibold' : 'opacity-80'
                        }`}
                      >
                        <span className={`h-2 w-2 rounded-full shrink-0 mt-1.5 ${!n.isRead ? 'bg-indigo-500' : 'bg-transparent'}`} />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[11px] font-bold text-slate-800">{n.title}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">{n.description}</p>
                          <span className="text-[8px] text-slate-400 mt-1 block">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-slate-200" />

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2.5 rounded-xl p-1 hover:bg-slate-50 transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700 shadow-sm text-xs">
                JD
              </div>
              <span className="hidden text-xs font-bold text-slate-700 lg:block">
                Jane Doe
              </span>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 lg:block ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                <div className="absolute right-0 mt-2 w-52 z-20 origin-top-right rounded-xl border border-slate-150 bg-white p-1 shadow-lg animate-in fade-in-50 slide-in-from-top-1 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Signed in as</p>
                    <p className="text-xs font-bold text-slate-800 truncate">jane.doe@apexcrm.com</p>
                  </div>
                  <button
                    onClick={() => { setIsProfileOpen(false); navigate('/settings'); }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-650 hover:bg-slate-50 transition-colors"
                  >
                    <User className="h-4 w-4 text-slate-400" />
                    My preferences
                  </button>
                  <button
                    onClick={() => setIsProfileOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-650 hover:bg-slate-50 transition-colors"
                  >
                    <HelpCircle className="h-4 w-4 text-slate-400" />
                    Help Guide
                  </button>
                  <div className="h-px bg-slate-100 my-1" />
                  <button
                    onClick={() => setIsProfileOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4 text-rose-400" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Universal Search Modal (Ctrl + K Overlay) */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 p-4 pt-[15vh] backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setIsSearchOpen(false)} />
          
          <div className="relative w-full max-w-lg rounded-xl border border-slate-150 bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Search Input Bar */}
            <div className="relative flex items-center border-b border-slate-150 px-4 py-3 bg-slate-50/50">
              <Search className="h-4.5 w-4.5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Type query to search leads, contacts, campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="flex-1 bg-transparent px-3 text-xs outline-none text-slate-800 placeholder:text-slate-400"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Results Layer */}
            <div className="max-h-[360px] overflow-y-auto p-2.5 divide-y divide-slate-100">
              {searchLoading && (
                <div className="py-8 text-center text-xs text-slate-400 font-semibold">
                  Searching CRM records...
                </div>
              )}

              {!searchLoading && searchQuery.trim() !== '' && flattenedResults.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400 font-semibold">
                  No records found matching your query.
                </div>
              )}

              {!searchLoading && searchQuery.trim() === '' && (
                <div className="py-6 text-center text-xs text-slate-400 font-semibold">
                  Search Universal Enterprise Index
                  <span className="block mt-1 text-[10px] text-slate-400 font-medium">Use arrow keys ↑↓ to select, and Enter to inspect.</span>
                </div>
              )}

              {!searchLoading && flattenedResults.length > 0 && (
                <div className="space-y-4">
                  {/* Leads Results */}
                  {searchResults.leads.length > 0 && (
                    <div>
                      <h4 className="px-2.5 py-1 text-[9px] font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                        <Target className="h-3 w-3" /> Leads
                      </h4>
                      {searchResults.leads.map((l) => {
                        const globalIdx = flattenedResults.findIndex(item => item._id === l._id && item.category === 'leads');
                        const isFocused = globalIdx === activeSearchIndex;
                        return (
                          <div
                            key={l._id}
                            onClick={() => handleSelectResult({ ...l, category: 'leads' })}
                            className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 cursor-pointer text-xs transition ${
                              isFocused ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span>{l.firstName} {l.lastName}</span>
                            <span className="text-[10px] opacity-75">{l.company}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Contacts Results */}
                  {searchResults.contacts.length > 0 && (
                    <div>
                      <h4 className="px-2.5 py-1 text-[9px] font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                        <Users className="h-3 w-3" /> Contacts
                      </h4>
                      {searchResults.contacts.map((c) => {
                        const globalIdx = flattenedResults.findIndex(item => item._id === c._id && item.category === 'contacts');
                        const isFocused = globalIdx === activeSearchIndex;
                        return (
                          <div
                            key={c._id}
                            onClick={() => handleSelectResult({ ...c, category: 'contacts' })}
                            className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 cursor-pointer text-xs transition ${
                              isFocused ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span>{c.firstName} {c.lastName}</span>
                            <span className="text-[10px] opacity-75">{c.company}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Meetings Results */}
                  {searchResults.meetings.length > 0 && (
                    <div>
                      <h4 className="px-2.5 py-1 text-[9px] font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                        <Calendar className="h-3 w-3" /> Meetings
                      </h4>
                      {searchResults.meetings.map((m) => {
                        const globalIdx = flattenedResults.findIndex(item => item._id === m._id && item.category === 'meetings');
                        const isFocused = globalIdx === activeSearchIndex;
                        return (
                          <div
                            key={m._id}
                            onClick={() => handleSelectResult({ ...m, category: 'meetings' })}
                            className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 cursor-pointer text-xs transition ${
                              isFocused ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span>{m.title}</span>
                            <span className="text-[10px] opacity-75">{m.meetingType}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Campaigns Results */}
                  {searchResults.campaigns.length > 0 && (
                    <div>
                      <h4 className="px-2.5 py-1 text-[9px] font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                        <Megaphone className="h-3 w-3" /> Campaigns
                      </h4>
                      {searchResults.campaigns.map((cp) => {
                        const globalIdx = flattenedResults.findIndex(item => item._id === cp._id && item.category === 'campaigns');
                        const isFocused = globalIdx === activeSearchIndex;
                        return (
                          <div
                            key={cp._id}
                            onClick={() => handleSelectResult({ ...cp, category: 'campaigns' })}
                            className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 cursor-pointer text-xs transition ${
                              isFocused ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span>{cp.name}</span>
                            <span className="text-[10px] opacity-75">{cp.campaignType}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Companies Results */}
                  {searchResults.companies?.length > 0 && (
                    <div>
                      <h4 className="px-2.5 py-1 text-[9px] font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                        <Building2 className="h-3 w-3" /> Companies
                      </h4>
                      {searchResults.companies.map((co) => {
                        const globalIdx = flattenedResults.findIndex(item => item._id === co._id && item.category === 'companies');
                        const isFocused = globalIdx === activeSearchIndex;
                        return (
                          <div
                            key={co._id}
                            onClick={() => handleSelectResult({ ...co, category: 'companies' })}
                            className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 cursor-pointer text-xs transition ${
                              isFocused ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span>{co.companyName}</span>
                            <span className="text-[10px] opacity-75">{co.industry}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Deals Results */}
                  {searchResults.deals?.length > 0 && (
                    <div>
                      <h4 className="px-2.5 py-1 text-[9px] font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                        <TrendingUp className="h-3 w-3" /> Deals
                      </h4>
                      {searchResults.deals.map((d) => {
                        const globalIdx = flattenedResults.findIndex(item => item._id === d._id && item.category === 'deals');
                        const isFocused = globalIdx === activeSearchIndex;
                        return (
                          <div
                            key={d._id}
                            onClick={() => handleSelectResult({ ...d, category: 'deals' })}
                            className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 cursor-pointer text-xs transition ${
                              isFocused ? 'bg-orange-50 text-orange-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span>{d.dealName}</span>
                            <span className="text-[10px] opacity-75">{d.companyId?.companyName || d.stage}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Tasks Results */}
                  {searchResults.tasks?.length > 0 && (
                    <div>
                      <h4 className="px-2.5 py-1 text-[9px] font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                        <CheckSquare className="h-3 w-3" /> Tasks
                      </h4>
                      {searchResults.tasks.map((t) => {
                        const globalIdx = flattenedResults.findIndex(item => item._id === t._id && item.category === 'tasks');
                        const isFocused = globalIdx === activeSearchIndex;
                        return (
                          <div
                            key={t._id}
                            onClick={() => handleSelectResult({ ...t, category: 'tasks' })}
                            className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 cursor-pointer text-xs transition ${
                              isFocused ? 'bg-amber-50 text-amber-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span>{t.title}</span>
                            <span className="text-[10px] opacity-75">{t.taskNumber} • {t.priority}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}
