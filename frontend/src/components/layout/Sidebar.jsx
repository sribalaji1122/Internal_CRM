import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Target,
  Users,
  Calendar,
  CalendarDays,
  Megaphone,
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
  Building2,
  TrendingUp,
  CheckSquare,
  Package,
  FileText,
  Layers,
  BarChart3,
  PieChart,
  Download
} from 'lucide-react';

export default function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
  const mainItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Leads', path: '/leads', icon: Target },
    { name: 'Contacts', path: '/contacts', icon: Users },
    { name: 'Companies', path: '/companies', icon: Building2 },
    { name: 'Deals', path: '/deals', icon: TrendingUp },
  ];

  const salesItems = [
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Quotes', path: '/quotes', icon: FileText },
    { name: 'Inventory', path: '/inventory', icon: Layers },
  ];

  const biItems = [
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Executive BI', path: '/bi-dashboards', icon: PieChart },
    { name: 'Export Center', path: '/exports', icon: Download },
  ];

  const activityItems = [
    { name: 'Meetings', path: '/meetings', icon: Calendar },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Calendar', path: '/calendar', icon: CalendarDays },
  ];

  const otherItems = [
    { name: 'Campaigns', path: '/campaigns', icon: Megaphone },
  ];

  const bottomItems = [
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const activeLinkClass = "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 bg-indigo-600/10 text-indigo-400 border-l-2 border-indigo-500 shadow-[inset_1px_0_0_0_rgba(99,102,241,0.2)]";
  const inactiveLinkClass = "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-l-2 border-transparent";

  const renderNavLinks = (items) => (
    <ul className="space-y-1.5 px-3">
      {items.map((item) => {
        const IconComponent = item.icon;
        return (
          <li key={item.name}>
            <NavLink
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) => isActive ? activeLinkClass : inactiveLinkClass}
              title={isCollapsed ? item.name : undefined}
            >
              <IconComponent className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </NavLink>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-950 border-r border-slate-800 text-slate-100 transition-all duration-300 lg:static lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white shadow-md shadow-indigo-600/20">
              C
            </div>
            {!isCollapsed && (
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent truncate">
                ApexCRM
              </span>
            )}
          </div>
          {/* Desktop Collapse Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex h-6 w-6 items-center justify-center rounded-md border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
          {renderNavLinks(mainItems)}

          {/* Sales Section */}
          {!isCollapsed && (
            <div className="px-5 pt-4 pb-1">
              <span className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-slate-600">Sales</span>
            </div>
          )}
          {isCollapsed && <div className="my-2 mx-3 border-t border-slate-800/60" />}
          {renderNavLinks(salesItems)}

          {/* Business Intelligence Section */}
          {!isCollapsed && (
            <div className="px-5 pt-4 pb-1">
              <span className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-slate-600">Business Intelligence</span>
            </div>
          )}
          {isCollapsed && <div className="my-2 mx-3 border-t border-slate-800/60" />}
          {renderNavLinks(biItems)}

          {/* Activities Section */}
          {!isCollapsed && (
            <div className="px-5 pt-4 pb-1">
              <span className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-slate-600">Activities</span>
            </div>
          )}
          {isCollapsed && <div className="my-2 mx-3 border-t border-slate-800/60" />}
          {renderNavLinks(activityItems)}

          {/* Marketing */}
          {!isCollapsed && (
            <div className="px-5 pt-4 pb-1">
              <span className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-slate-600">Marketing</span>
            </div>
          )}
          {isCollapsed && <div className="my-2 mx-3 border-t border-slate-800/60" />}
          {renderNavLinks(otherItems)}
        </nav>

        {/* Sidebar Bottom / Settings & User Profile */}
        <div className="mt-auto border-t border-slate-800 pt-4 pb-6 space-y-4">
          {renderNavLinks(bottomItems)}

          {/* User Profile Section */}
          <div className={`px-4 ${isCollapsed ? 'flex justify-center' : ''}`}>
            <div className={`flex items-center gap-3 p-2 rounded-lg bg-slate-900/50 border border-slate-800/40 ${isCollapsed ? 'w-10 h-10 p-0 justify-center' : 'w-full'}`}>
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-semibold text-sm shadow-sm">
                JD
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-slate-900 bg-green-500" />
              </div>
              {!isCollapsed && (
                <div className="flex-1 overflow-hidden">
                  <h4 className="text-xs font-semibold text-slate-200 truncate">Jane Doe</h4>
                  <p className="text-[10px] text-slate-500 truncate">jane.doe@apexcrm.com</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
