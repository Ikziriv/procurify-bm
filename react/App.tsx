
import React, { useState, useEffect, useRef } from 'react';
import { Role, User, Procurement, Submission, ViewType, AppNotification, Language } from './types';
import { DUMMY_USERS, DUMMY_PROCUREMENTS } from './constants';
import { translations } from './i18n';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProcurementList from './components/ProcurementList';
import UserManagement from './components/UserManagement';
import SubmissionList from './components/SubmissionList';

const App: React.FC = () => {
  // Default language set to 'ID' (Bahasa Indonesia)
  const [language, setLanguage] = useState<Language>('ID');
  const [currentUser, setCurrentUser] = useState<User>(DUMMY_USERS[0]);
  const [currentView, setCurrentView] = useState<ViewType>('DASHBOARD');
  const [users, setUsers] = useState<User[]>(DUMMY_USERS);
  const [procurements, setProcurements] = useState<Procurement[]>(DUMMY_PROCUREMENTS);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const t = translations[language];

  useEffect(() => {
    const storedUsers = localStorage.getItem('procurify_users');
    const storedProcs = localStorage.getItem('procurify_procs');
    const storedSubs = localStorage.getItem('procurify_subs');
    const storedNotifs = localStorage.getItem('procurify_notifs');
    const storedLang = localStorage.getItem('procurify_lang');

    if (storedUsers) setUsers(JSON.parse(storedUsers));
    if (storedProcs) setProcurements(JSON.parse(storedProcs));
    if (storedSubs) setSubmissions(JSON.parse(storedSubs));
    if (storedNotifs) setNotifications(JSON.parse(storedNotifs));
    // If a language was previously saved, it will override the 'ID' default
    if (storedLang) setLanguage(storedLang as Language);
  }, []);

  useEffect(() => {
    localStorage.setItem('procurify_users', JSON.stringify(users));
    localStorage.setItem('procurify_procs', JSON.stringify(procurements));
    localStorage.setItem('procurify_subs', JSON.stringify(submissions));
    localStorage.setItem('procurify_notifs', JSON.stringify(notifications));
    localStorage.setItem('procurify_lang', language);
  }, [users, procurements, submissions, notifications, language]);

  const addNotification = (notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleRoleSwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUser = users.find(u => u.id === e.target.value) || users[0];
    setCurrentUser(selectedUser);
    setCurrentView('DASHBOARD');
    setShowNotifications(false);
  };

  const renderView = () => {
    const commonProps = { language, t };
    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard {...commonProps} user={currentUser} procurements={procurements} submissions={submissions} onNavigate={setCurrentView} />;
      case 'PROCUREMENTS':
        return <ProcurementList {...commonProps} user={currentUser} procurements={procurements} setProcurements={setProcurements} submissions={submissions} setSubmissions={setSubmissions} />;
      case 'USERS':
        return <UserManagement {...commonProps} currentUser={currentUser} users={users} setUsers={setUsers} />;
      case 'SUBMISSIONS':
        return <SubmissionList {...commonProps} currentUser={currentUser} submissions={submissions} procurements={procurements} setSubmissions={setSubmissions} setProcurements={setProcurements} setUsers={setUsers} addNotification={addNotification} onNavigate={setCurrentView} users={users} />;
      default:
        return <div>View not found</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-600">
      <Sidebar language={language} t={t} currentRole={currentUser.role} currentView={currentView} onViewChange={setCurrentView} />

      <main className="flex-1 flex flex-col min-h-screen">
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-10 sticky top-0 z-40">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3 bg-slate-100 rounded-2xl p-1.5 border border-slate-200/50 shadow-inner">
              <button
                onClick={() => setLanguage('EN')}
                className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${language === 'EN' ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('ID')}
                className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${language === 'ID' ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
              >
                ID
              </button>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 rounded-2xl px-5 py-2 border border-slate-200/40">
              <span className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">Authority Level</span>
              <select
                className="bg-transparent border-none text-xs font-black uppercase tracking-widest text-slate-800 focus:ring-0 outline-none cursor-pointer"
                value={currentUser.id}
                onChange={handleRoleSwitch}
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name.split(' ')[0]} / {u.role.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border ${showNotifications ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-xl shadow-blue-500/10' : 'text-slate-400 bg-white border-slate-200/60 hover:border-slate-300 hover:text-slate-600'}`}
              >
                <i className="fa-solid fa-bell text-lg"></i>
                {notifications.filter(n => !n.read && n.userId === currentUser.id).length > 0 && (
                  <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-blue-600 border-2 border-white rounded-full animate-pulse shadow-lg shadow-blue-500/50"></span>
                )}
              </button>
            </div>

            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-900 tracking-tight uppercase tracking-widest">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{currentUser.role.replace('_', ' ')}</p>
              </div>
              <div className="relative">
                <img
                  src={currentUser.avatar || 'https://picsum.photos/100'}
                  alt="Avatar"
                  className="w-12 h-12 rounded-[1.25rem] border-2 border-slate-100 shadow-sm transition-transform group-hover:scale-110 object-cover"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-lg"></div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-12 max-w-[1600px] mx-auto w-full">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
