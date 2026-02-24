
import React, { useState } from 'react';
import { Procurement, Role, User, Submission, Language } from '../types';
import { generateProcurementDescription } from '../services/geminiService';

interface ProcurementListProps {
  language: Language;
  t: any;
  user: User;
  procurements: Procurement[];
  setProcurements: React.Dispatch<React.SetStateAction<Procurement[]>>;
  submissions: Submission[];
  setSubmissions: React.Dispatch<React.SetStateAction<Submission[]>>;
}

const ProcurementList: React.FC<ProcurementListProps> = ({
  language, t, user, procurements, setProcurements, submissions, setSubmissions
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const [newProc, setNewProc] = useState({ title: '', description: '', budget: '', deadline: '' });
  const [applyForm, setApplyForm] = useState({ companyName: '', description: '', image: '' });

  const handleCreateProcurement = (e: React.FormEvent) => {
    e.preventDefault();
    const proc: Procurement = {
      id: `TEN-${Math.floor(Math.random() * 9000) + 1000}`,
      ...newProc,
      status: 'OPEN',
      createdBy: user.id,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setProcurements([proc, ...procurements]);
    setShowAddModal(false);
    setNewProc({ title: '', description: '', budget: '', deadline: '' });
  };

  const handleAIHelp = async () => {
    if (!newProc.title) return alert("System requires a title to initiate AI draft.");
    setLoadingAI(true);
    const desc = await generateProcurementDescription(newProc.title);
    setNewProc(prev => ({ ...prev, description: desc }));
    setLoadingAI(false);
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showApplyModal) return;

    const submission: Submission = {
      id: `SUB-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      procurementId: showApplyModal,
      userId: user.id,
      companyName: applyForm.companyName,
      companyDescription: applyForm.description,
      profileImage: applyForm.image,
      status: 'PENDING',
      submittedAt: new Date().toLocaleString()
    };

    setSubmissions([...submissions, submission]);
    setShowApplyModal(null);
    setApplyForm({ companyName: '', description: '', image: '' });
  };

  const handleCloseProcurement = (id: string) => {
    if (confirm("Are you sure you want to close this procurement? This will prevent further applications and enable vendor evaluations.")) {
      setProcurements(prev => prev.map(p => p.id === id ? { ...p, status: 'CLOSED' } : p));
    }
  };

  const isApplied = (procId: string) => submissions.some(s => s.procurementId === procId && s.userId === user.id);

  return (
    <div className="space-y-10 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t.procurement.title}</h1>
          <p className="text-slate-500 mt-1 font-medium">{t.procurement.subtitle}</p>
        </div>
        {(user.role === Role.ADMIN_PROCUREMENT || user.role === Role.SUPER_ADMIN) && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
          >
            <i className="fa-solid fa-plus text-xs"></i>
            {t.procurement.publish}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {procurements.map(proc => (
          <div key={proc.id} className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 flex flex-col group border-b-4 border-b-transparent hover:border-b-blue-500">
            <div className="p-8 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 bg-blue-50 px-2.5 py-1 rounded-lg">Ref: {proc.id}</span>
                <div className={`w-2.5 h-2.5 rounded-full ${proc.status === 'OPEN' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`}></div>
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">{proc.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-3 mb-8 font-medium leading-relaxed">{proc.description}</p>

              <div className="mt-auto pt-6 border-t border-slate-50 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Fiscal Budget</p>
                  <p className="text-sm font-bold text-slate-900">{proc.budget}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Closing Date</p>
                  <p className="text-sm font-bold text-slate-900">{proc.deadline}</p>
                </div>
              </div>
            </div>

            <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex gap-3">
              {user.role === Role.USER_PROCUREMENT ? (
                <button
                  disabled={isApplied(proc.id) || proc.status !== 'OPEN'}
                  onClick={() => setShowApplyModal(proc.id)}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all tracking-widest uppercase ${isApplied(proc.id)
                      ? 'bg-emerald-50 text-emerald-600 cursor-default'
                      : 'bg-slate-900 text-white hover:bg-blue-600 shadow-lg active:scale-95'
                    }`}
                >
                  {isApplied(proc.id) ? t.procurement.applied : t.procurement.applyNow}
                </button>
              ) : (
                <>
                  <button className="flex-1 text-[10px] font-black uppercase tracking-widest py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all active:scale-95">
                    {t.procurement.edit}
                  </button>
                  <button
                    onClick={() => handleCloseProcurement(proc.id)}
                    disabled={proc.status === 'CLOSED'}
                    className={`flex-1 text-[10px] font-black uppercase tracking-widest py-3 rounded-xl border transition-all active:scale-95 ${proc.status === 'CLOSED' ? 'bg-slate-100 text-slate-400 border-slate-200' : 'border-rose-100 text-rose-600 bg-white hover:bg-rose-50'}`}
                  >
                    {proc.status === 'CLOSED' ? 'Completed' : t.procurement.close}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-slideUp border border-slate-200">
            <div className="p-10 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">System Notice: New Tender</h2>
                <p className="text-slate-500 text-sm font-medium mt-1">Initiating procurement documentation workflow.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all">
                <i className="fa-solid fa-times text-sm"></i>
              </button>
            </div>
            <form onSubmit={handleCreateProcurement} className="p-10 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.procurement.tenderTitle}</label>
                <input
                  required
                  value={newProc.title}
                  onChange={e => setNewProc({ ...newProc, title: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-semibold"
                  placeholder="e.g., Enterprise Data Lake Modernization"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Draft Specification</label>
                  <button
                    type="button"
                    onClick={handleAIHelp}
                    disabled={loadingAI}
                    className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:text-blue-800 flex items-center gap-2 group transition-all"
                  >
                    <i className={`fa-solid ${loadingAI ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'} group-hover:scale-125`}></i>
                    {loadingAI ? t.procurement.generating : 'Consult AI Draft'}
                  </button>
                </div>
                <textarea
                  required
                  rows={6}
                  value={newProc.description}
                  onChange={e => setNewProc({ ...newProc, description: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium leading-relaxed"
                  placeholder="Enter detailed technical requirements..."
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.procurement.budget}</label>
                  <input
                    required
                    value={newProc.budget}
                    onChange={e => setNewProc({ ...newProc, budget: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-semibold"
                    placeholder="$250,000.00"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.procurement.deadline}</label>
                  <input
                    required
                    type="date"
                    value={newProc.deadline}
                    onChange={e => setNewProc({ ...newProc, deadline: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-semibold"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest border border-slate-200 hover:bg-slate-50 transition-all">{t.procurement.cancel}</button>
                <button type="submit" className="flex-1 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest bg-slate-900 text-white hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10">{t.procurement.publishNow}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcurementList;
