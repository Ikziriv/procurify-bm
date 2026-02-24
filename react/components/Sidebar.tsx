
import React from 'react';
import { Role, ViewType, Language } from '../types';

interface SidebarProps {
  language: Language;
  t: any;
  currentRole: Role;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ language, t, currentRole, currentView, onViewChange }) => {
  const navItems = [
    { id: 'DASHBOARD', label: t.sidebar.dashboard, icon: 'fa-grid-2', roles: [Role.SUPER_ADMIN, Role.ADMIN_PROCUREMENT, Role.USER_PROCUREMENT] },
    { id: 'PROCUREMENTS', label: t.sidebar.procurements, icon: 'fa-briefcase', roles: [Role.SUPER_ADMIN, Role.ADMIN_PROCUREMENT, Role.USER_PROCUREMENT] },
    { id: 'USERS', label: t.sidebar.users, icon: 'fa-user-group', roles: [Role.SUPER_ADMIN, Role.ADMIN_PROCUREMENT] },
    { id: 'SUBMISSIONS', label: t.sidebar.submissions, icon: 'fa-file-signature', roles: [Role.SUPER_ADMIN, Role.ADMIN_PROCUREMENT, Role.USER_PROCUREMENT] },
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(currentRole));

  return (
    <aside className="w-64 bg-slate-950 text-white flex-shrink-0 min-h-screen flex flex-col border-r border-slate-800/50">
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <i className="fa-solid fa-cube text-white text-sm"></i>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">
            Procurify
          </h1>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <div className="px-4 mb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Navigation</p>
        </div>
        {visibleItems.map(item => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as ViewType)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group ${currentView === item.id
                ? 'bg-slate-800 text-blue-400 shadow-inner'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
              }`}
          >
            <i className={`fa-solid ${item.icon} w-5 text-center transition-transform group-hover:scale-110`}></i>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-6">
        <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50">
          <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-3">Active Session</p>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
            <span className="text-xs font-bold text-slate-300">{currentRole.replace('_', ' ')}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
