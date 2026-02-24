
import React, { useMemo } from 'react';
import { User, Procurement, Submission, Role, ViewType, Language } from '../types';

interface DashboardProps {
  language: Language;
  t: any;
  user: User;
  procurements: Procurement[];
  submissions: Submission[];
  onNavigate: (view: ViewType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ language, t, user, procurements, submissions, onNavigate }) => {
  const isAdmin = user.role === Role.ADMIN_PROCUREMENT || user.role === Role.SUPER_ADMIN;

  const stats = [
    { label: t.dashboard.activeTenders, value: procurements.filter(p => p.status === 'OPEN').length, icon: 'fa-layer-group', color: 'text-blue-600' },
    { label: t.dashboard.totalSubmissions, value: submissions.length, icon: 'fa-clipboard-list', color: 'text-slate-600' },
    { label: user.role === Role.USER_PROCUREMENT ? t.dashboard.mySubmissions : t.dashboard.pendingReview, value: user.role === Role.USER_PROCUREMENT ? submissions.filter(s => s.userId === user.id).length : submissions.filter(s => s.status === 'PENDING').length, icon: 'fa-clock-rotate-left', color: 'text-amber-500' },
    { label: 'Avg Rating', value: user.ratings ? (user.ratings.reduce((a, b) => a + b, 0) / user.ratings.length).toFixed(1) : '4.8', icon: 'fa-star', color: 'text-blue-600' },
  ];

  return (
    <div className="space-y-10 animate-fadeIn">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Console</h1>
          <p className="text-slate-500 mt-2 font-medium">Monitoring procurement lifecycle and vendor engagement.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Environment</p>
            <p className="text-sm font-bold text-slate-900">Production Main</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm">
            <i className="fa-solid fa-server"></i>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-7 rounded-3xl border border-slate-200/60 shadow-sm transition-all hover:shadow-xl hover:shadow-blue-500/5 group hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl bg-slate-50 ${stat.color} flex items-center justify-center text-sm border border-slate-100 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600`}>
                <i className={`fa-solid ${stat.icon}`}></i>
              </div>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200/60 overflow-hidden shadow-sm">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                <i className="fa-solid fa-folder-tree text-blue-500"></i>
                Latest Procurements
              </h2>
              <button onClick={() => onNavigate('PROCUREMENTS')} className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest">Global View</button>
            </div>
            <div className="divide-y divide-slate-50">
              {procurements.slice(0, 4).map(p => (
                <div key={p.id} className="p-6 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{p.title}</h3>
                    <div className="flex items-center gap-4 mt-1.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Budget: {p.budget}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Until: {p.deadline}</span>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${p.status === 'OPEN' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                    {p.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-blue-500/10">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2">Internal Guidelines</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">All tender evaluations must follow the 2024 revised procurement standard ISO-9001.</p>
              <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/20">
                View Documentation
              </button>
            </div>
            <i className="fa-solid fa-shield-halved absolute -bottom-4 -right-4 text-8xl text-white/5 rotate-12"></i>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">Live Activity</h3>
            <div className="space-y-6">
              {[1, 2].map(i => (
                <div key={i} className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">New Submission Received</p>
                    <p className="text-[10px] text-slate-400 mt-1">Vendor PH Solutions applied to Cloud Upgrade.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
