
import React, { useState, useMemo } from 'react';
import { Submission, Procurement, Role, User, AppNotification, StatusHistoryEntry, ViewType, Language } from '../types';

interface SubmissionListProps {
  language: Language;
  t: any;
  currentUser: User;
  submissions: Submission[];
  procurements: Procurement[];
  users: User[];
  setSubmissions: React.Dispatch<React.SetStateAction<Submission[]>>;
  setProcurements: React.Dispatch<React.SetStateAction<Procurement[]>>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  addNotification: (notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  onNavigate: (view: ViewType) => void;
}

type StatusFilter = 'all' | 'PENDING' | 'ACCEPTED' | 'REJECTED';

const SubmissionList: React.FC<SubmissionListProps> = ({ language, t, currentUser, submissions, procurements, users, setSubmissions, setProcurements, setUsers, addNotification, onNavigate }) => {
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all');
  const [filterProcurement, setFilterProcurement] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [viewingVendorId, setViewingVendorId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [isRatingLogged, setIsRatingLogged] = useState(false);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isRejectingBatch, setIsRejectingBatch] = useState(false);

  const isVendor = currentUser.role === Role.USER_PROCUREMENT;
  const isAdmin = currentUser.role === Role.ADMIN_PROCUREMENT || currentUser.role === Role.SUPER_ADMIN;

  // Derive unique procurements that have submissions for the filter
  const submissionProcurements = useMemo(() => {
    const ids = new Set(submissions.map(s => s.procurementId));
    return procurements.filter(p => ids.has(p.id));
  }, [submissions, procurements]);

  const filteredSubmissions = useMemo(() => {
    let result = isVendor ? submissions.filter(s => s.userId === currentUser.id) : submissions;

    // 1. Status Filter
    if (filterStatus !== 'all') {
      result = result.filter(s => s.status === filterStatus);
    }

    // 2. Procurement Filter
    if (filterProcurement !== 'all') {
      result = result.filter(s => s.procurementId === filterProcurement);
    }

    // 3. Search Query (Company Name or Procurement Title)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s => {
        const proc = procurements.find(p => p.id === s.procurementId);
        return s.companyName.toLowerCase().includes(query) ||
          (proc?.title.toLowerCase().includes(query));
      });
    }

    // Default sorting: Newest first
    return result.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }, [submissions, isVendor, currentUser.id, filterStatus, filterProcurement, searchQuery, procurements]);

  const selectedSubmission = useMemo(() =>
    submissions.find(s => s.id === selectedSubmissionId),
    [submissions, selectedSubmissionId]
  );

  const selectedProcurement = useMemo(() =>
    procurements.find(p => p.id === selectedSubmission?.procurementId),
    [procurements, selectedSubmission]
  );

  const selectedVendorUser = useMemo(() =>
    users.find(u => u.id === selectedSubmission?.userId),
    [users, selectedSubmission]
  );

  const vendorToView = useMemo(() =>
    users.find(u => u.id === viewingVendorId),
    [users, viewingVendorId]
  );

  const vendorSubHistory = useMemo(() => {
    if (!viewingVendorId) return [];
    return submissions.filter(s => s.userId === viewingVendorId);
  }, [submissions, viewingVendorId]);

  const calculateAvgRating = (ratings?: number[]) => {
    if (!ratings || ratings.length === 0) return 0;
    return (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
  };

  const performUpdateStatus = (id: string, status: 'PENDING' | 'ACCEPTED' | 'REJECTED') => {
    const sub = submissions.find(s => s.id === id);
    if (!sub) return;
    const proc = procurements.find(p => p.id === sub.procurementId);
    const historyEntry: StatusHistoryEntry = {
      status,
      changedBy: currentUser.name,
      changedAt: new Date().toLocaleString()
    };
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status, history: [...(s.history || []), historyEntry] } : s));
    const notificationTitle = status === 'REJECTED' ? 'Application Status: Not Selected' : `Status Update: ${status}`;
    const notificationMsg = status === 'REJECTED'
      ? `Following a comprehensive review of the current procurement cycle, we regret to inform you that your proposal for "${proc?.title || 'the project'}" has not been selected at this time.`
      : `Your application review for "${proc?.title || 'the project'}" is complete.`;
    addNotification({
      userId: sub.userId,
      title: notificationTitle,
      message: notificationMsg,
      type: status === 'ACCEPTED' ? 'SUCCESS' : 'WARNING'
    });
  };

  const handleBulkReject = () => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach(id => performUpdateStatus(id, 'REJECTED'));
    setSelectedIds([]);
    setIsRejectingBatch(false);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredSubmissions.length) setSelectedIds([]);
    else setSelectedIds(filteredSubmissions.map(s => s.id));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleExportPDF = async () => {
    if (!selectedSubmission) return;
    setIsExporting(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      const margin = 20;
      let y = 20;
      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('SUBMISSION AUDIT REPORT', margin, 27);
      doc.setFontSize(9);
      doc.text(`Internal Document ID: ${selectedSubmission.id}`, 145, 22);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 145, 27);
      y = 55;
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.text('PROJECT CONTEXT', margin, y);
      y += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Tender Title: ${selectedProcurement?.title || 'N/A'}`, margin, y);
      y += 6;
      doc.text(`Budget Allocation: ${selectedProcurement?.budget || 'N/A'}`, margin, y);
      y += 6;
      doc.text(`Submission Status: ${selectedSubmission.status}`, margin, y);
      y += 15;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('VENDOR INFORMATION', margin, y);
      y += 8;
      doc.setFontSize(10);
      doc.text(`Entity Name: ${selectedSubmission.companyName}`, margin, y);
      y += 6;
      doc.text(`Primary Contact: ${selectedVendorUser?.name || 'N/A'}`, margin, y);
      y += 6;
      doc.text(`Verified Email: ${selectedVendorUser?.email || 'N/A'}`, margin, y);
      y += 15;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('PROPOSAL SUMMARY', margin, y);
      y += 8;
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      const splitDesc = doc.splitTextToSize(selectedSubmission.companyDescription, 170);
      doc.text(splitDesc, margin, y);
      y += (splitDesc.length * 5) + 15;
      if (selectedSubmission.history && selectedSubmission.history.length > 0) {
        if (y > 230) { doc.addPage(); y = 20; }
        doc.setFontSize(12);
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        doc.text('AUDIT TRAIL / STATUS HISTORY', margin, y);
        y += 10;
        selectedSubmission.history.forEach((entry) => {
          if (y > 265) { doc.addPage(); y = 20; }
          doc.setFillColor(248, 250, 252);
          doc.rect(margin - 2, y - 5, 174, 15, 'F');
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(79, 70, 229);
          doc.text(`TRANSITION TO ${entry.status}`, margin, y);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 116, 139);
          doc.text(`${entry.changedAt}`, margin + 110, y);
          y += 5;
          doc.setTextColor(30, 41, 59);
          doc.text(`Authorized by: ${entry.changedBy}`, margin, y);
          y += 15;
        });
      }
      doc.save(`Audit_${selectedSubmission.companyName.replace(/\s+/g, '_')}_${selectedSubmission.id}.pdf`);
    } catch (error) {
      console.error('PDF Generation failed:', error);
      alert('Failed to generate professional report.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleRateVendor = (stars: number) => {
    if (!selectedSubmission) return;
    setUsers(prev => prev.map(u => u.id === selectedSubmission.userId ? { ...u, ratings: [...(u.ratings || []), stars] } : u));
    setIsRatingLogged(true);
    setTimeout(() => setIsRatingLogged(false), 3000); // Reset feedback after 3s
  };

  return (
    <div className="space-y-10 animate-fadeIn relative">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{isVendor ? t.submissions.myTitle : t.submissions.title}</h1>
          <p className="text-slate-500 mt-1 font-medium">{t.submissions.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-white p-2 rounded-[1.5rem] border border-slate-200/60 shadow-sm">
          <div className="relative">
            <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.submissions.search}
              className="bg-slate-50 border-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all w-full md:w-64 placeholder:text-slate-400"
            />
          </div>

          <div className="h-8 w-px bg-slate-100 hidden md:block"></div>

          <div className="flex items-center gap-3">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-2">Context</span>
            <select
              value={filterProcurement}
              onChange={(e) => setFilterProcurement(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer min-w-[140px]"
            >
              <option value="all">All Projects</option>
              {submissionProcurements.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-2">Status</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as StatusFilter)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer min-w-[140px]"
            >
              <option value="all">{t.submissions.allStatus}</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </header>

      {/* BATCH ACTION BAR */}
      {isAdmin && selectedIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-8 border border-slate-700/50 animate-slideUp">
          <div className="flex items-center gap-4 pr-8 border-r border-slate-700">
            <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-black">{selectedIds.length}</span>
            <p className="text-sm font-bold tracking-tight">Records Selected</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRejectingBatch(true)}
              className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
            >
              Reject Selected
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors px-4"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                {isAdmin && (
                  <th className="px-8 py-5 w-16">
                    <button
                      onClick={toggleSelectAll}
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedIds.length === filteredSubmissions.length && filteredSubmissions.length > 0 ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}
                    >
                      {selectedIds.length === filteredSubmissions.length && filteredSubmissions.length > 0 && <i className="fa-solid fa-check text-[10px] text-white"></i>}
                    </button>
                  </th>
                )}
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Application Reference</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Tender</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Current Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 text-2xl mb-4 border border-slate-100">
                        <i className="fa-solid fa-filter-circle-xmark"></i>
                      </div>
                      <p className="text-sm font-bold text-slate-400">No submission records match your current criteria.</p>
                      <button onClick={() => { setSearchQuery(''); setFilterStatus('all'); setFilterProcurement('all'); }} className="mt-4 text-xs font-black text-blue-600 uppercase tracking-widest hover:underline">Reset All Filters</button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map(sub => {
                  const proc = procurements.find(p => p.id === sub.procurementId);
                  const isSelected = selectedIds.includes(sub.id);
                  return (
                    <tr key={sub.id} className={`group hover:bg-slate-50/50 transition-colors ${isSelected ? 'bg-blue-50/30' : ''}`}>
                      {isAdmin && (
                        <td className="px-8 py-6">
                          <button
                            onClick={() => toggleSelect(sub.id)}
                            className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300 group-hover:border-blue-300'}`}
                          >
                            {isSelected && <i className="fa-solid fa-check text-[10px] text-white"></i>}
                          </button>
                        </td>
                      )}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-lg transition-colors ${isSelected ? 'bg-blue-600' : 'bg-slate-900'}`}>
                            {sub.id.substring(0, 3)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{sub.companyName}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{sub.submittedAt.split(',')[0]}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs font-semibold text-slate-600 truncate max-w-[200px]">{proc?.title || 'Unknown Project'}</p>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${sub.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-600' :
                            sub.status === 'REJECTED' ? 'bg-rose-50 text-rose-600' :
                              'bg-amber-50 text-amber-600'
                          }`}>
                          <span className={`w-1 h-1 rounded-full ${sub.status === 'ACCEPTED' ? 'bg-emerald-500' : sub.status === 'REJECTED' ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button
                          onClick={() => { setSelectedSubmissionId(sub.id); setIsRatingLogged(false); }}
                          className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:shadow-lg transition-all"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* BATCH REJECT CONFIRMATION MODAL */}
      {isRejectingBatch && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-12 text-center animate-slideUp border border-slate-200">
            <div className="w-20 h-20 rounded-[2rem] bg-rose-50 text-rose-600 flex items-center justify-center text-3xl mx-auto mb-8 border border-rose-100 shadow-xl shadow-rose-500/10">
              <i className="fa-solid fa-ban"></i>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4">Confirm Batch Rejection</h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10">
              You are about to reject <span className="font-black text-slate-900">{selectedIds.length}</span> submissions. This action is final and will trigger formal system notifications to all affected vendors.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setIsRejectingBatch(false)}
                className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
              >
                Cancel Action
              </button>
              <button
                onClick={handleBulkReject}
                className="flex-1 py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-500/20 active:scale-95"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedSubmission && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden animate-slideUp border border-slate-200">
            <div className="p-10 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl shadow-xl">
                  <i className="fa-solid fa-file-contract"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedSubmission.companyName}</h2>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Audit Record ID: {selectedSubmission.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setViewingVendorId(selectedSubmission.userId)}
                  className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm active:scale-95"
                >
                  <i className="fa-solid fa-user-tie text-blue-500"></i>
                  View Profile
                </button>
                <button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/10 active:scale-95 disabled:opacity-50"
                >
                  <i className={`fa-solid ${isExporting ? 'fa-spinner fa-spin' : 'fa-file-pdf'}`}></i>
                  {isExporting ? 'Generating...' : 'Export Audit PDF'}
                </button>
                <button onClick={() => setSelectedSubmissionId(null)} className="w-12 h-12 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors">
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>
            </div>

            <div className="p-10 grid grid-cols-1 lg:grid-cols-3 gap-12 max-h-[70vh] overflow-y-auto flex-shrink">
              <div className="lg:col-span-2 space-y-12">
                <section>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 border-b border-slate-50 pb-2">Proposal Content</h4>
                  <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line font-medium p-8 bg-slate-50 rounded-3xl border border-slate-100 shadow-inner">
                    {selectedSubmission.companyDescription}
                  </div>
                </section>

                <section className="animate-fadeIn">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 border-b border-slate-50 pb-2 flex items-center gap-2">
                    <i className="fa-solid fa-building text-blue-500"></i>
                    Corporate Profile & Background
                  </h4>
                  <div className="text-slate-600 text-sm leading-relaxed font-medium p-8 bg-blue-50/30 border border-blue-100/50 rounded-3xl shadow-sm italic">
                    {selectedVendorUser?.history || "No official corporate history has been provided by this vendor in their profile settings. Verification is required before awarding."}
                  </div>
                </section>

                <section>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 border-b border-slate-50 pb-2">Internal Audit Journal</h4>
                  <div className="space-y-6 relative pl-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
                    {(selectedSubmission.history || []).map((entry, idx) => (
                      <div key={idx} className="relative group">
                        <div className={`absolute -left-[23px] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-sm z-10 ${entry.status === 'ACCEPTED' ? 'bg-emerald-500' : entry.status === 'REJECTED' ? 'bg-rose-500' : 'bg-amber-400'
                          }`}></div>
                        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm group-hover:border-blue-100 transition-all">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">Status Change: {entry.status}</p>
                            <span className="text-[10px] text-slate-400 font-bold">{entry.changedAt}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-medium">Authorized by Senior Officer: {entry.changedBy}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="space-y-8">
                <div className="p-8 bg-blue-600 rounded-[2.5rem] text-white shadow-xl shadow-blue-500/20">
                  <h4 className="text-[9px] font-black uppercase tracking-[0.2em] mb-4 text-blue-200">Reference Project</h4>
                  <p className="text-lg font-bold leading-tight">{selectedProcurement?.title}</p>
                  <div className="mt-6 pt-6 border-t border-blue-500 space-y-4">
                    <div>
                      <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest mb-1">Fiscal Budget</p>
                      <p className="text-sm font-bold">{selectedProcurement?.budget}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest mb-1">Submission Time</p>
                      <p className="text-sm font-bold">{selectedSubmission.submittedAt}</p>
                    </div>
                  </div>
                </div>

                {isAdmin && selectedSubmission.status === 'ACCEPTED' && selectedProcurement?.status === 'CLOSED' && (
                  <div className="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100 animate-fadeIn">
                    <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-4">Post-Project Evaluation</h4>
                    {isRatingLogged ? (
                      <div className="text-center py-4 bg-white/50 rounded-2xl border border-amber-200">
                        <i className="fa-solid fa-circle-check text-emerald-500 text-xl mb-2"></i>
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Metric Logged Successfully</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs text-amber-800 font-medium mb-6 leading-relaxed">Please evaluate the vendor's performance for this successfully completed engagement.</p>
                        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-amber-200/50 shadow-inner">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              onClick={() => handleRateVendor(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              className={`text-2xl transition-all hover:scale-125 active:scale-90 ${star <= (hoverRating || 0) ? 'text-amber-500' : 'text-amber-200'}`}
                            >
                              <i className="fa-solid fa-star"></i>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
              {isAdmin && selectedSubmission.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => performUpdateStatus(selectedSubmission.id, 'REJECTED')}
                    className="px-8 py-3 rounded-xl border border-rose-200 bg-white text-rose-600 text-xs font-black uppercase tracking-widest hover:bg-rose-50 transition-all active:scale-95"
                  >
                    Reject Proposal
                  </button>
                  <button
                    onClick={() => performUpdateStatus(selectedSubmission.id, 'ACCEPTED')}
                    className="px-8 py-3 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95"
                  >
                    Award Contract
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedSubmissionId(null)}
                className="px-8 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VENDOR PROFILE MODAL */}
      {viewingVendorId && vendorToView && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden animate-slideUp border border-slate-200 flex flex-col h-[90vh]">
            <div className="relative h-64 bg-slate-950 flex items-end px-12 pb-12 flex-shrink-0">
              <div className="absolute top-8 right-8 flex gap-3">
                <button onClick={() => setViewingVendorId(null)} className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all">
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>
              <div className="flex items-center gap-8 translate-y-16">
                <img
                  src={vendorToView.avatar}
                  className="w-32 h-32 rounded-3xl border-8 border-white shadow-2xl object-cover bg-white"
                  alt={vendorToView.name}
                />
                <div className="pb-4">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">{vendorToView.companyName || vendorToView.name}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 px-3 py-1 rounded-full">Official Partner</span>
                    <div className="flex items-center gap-1.5 text-amber-500 font-bold text-sm bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">
                      <i className="fa-solid fa-star"></i>
                      {calculateAvgRating(vendorToView.ratings)} (Global Performance Rating)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-24 p-12 grid grid-cols-1 lg:grid-cols-3 gap-12 overflow-y-auto flex-1">
              <div className="lg:col-span-2 space-y-12">
                <section>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 border-b border-slate-50 pb-2">Corporate History & Profile</h4>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium whitespace-pre-line bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-inner">
                    {vendorToView.history || "This vendor has not yet provided a detailed corporate history. Documentation is pending verification by the system administrator."}
                  </p>
                </section>

                <section>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 border-b border-slate-50 pb-2">Portfolio & Submission History</h4>
                  <div className="space-y-4">
                    {vendorSubHistory.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No historical submissions recorded.</p>
                    ) : (
                      vendorSubHistory.map(historySub => {
                        const subProc = procurements.find(p => p.id === historySub.procurementId);
                        return (
                          <div key={historySub.id} className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex-1">
                              <p className="text-sm font-bold text-slate-800">{subProc?.title || 'Unknown Project'}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Ref: {historySub.id} • {historySub.submittedAt.split(',')[0]}</p>
                            </div>
                            <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${historySub.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-600' :
                                historySub.status === 'REJECTED' ? 'bg-rose-50 text-rose-600' :
                                  'bg-amber-50 text-amber-600'
                              }`}>
                              {historySub.status}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>

                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Founded</p>
                    <p className="text-sm font-bold text-slate-800">{vendorToView.foundedYear || '2010'}</p>
                  </div>
                  <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Team Size</p>
                    <p className="text-sm font-bold text-slate-800">{vendorToView.employeeCount || '50-100'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Contact Channels</h4>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-sm">
                        <i className="fa-solid fa-envelope text-xs"></i>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                        <p className="text-xs font-bold text-slate-800 truncate max-w-[150px]">{vendorToView.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-sm">
                        <i className="fa-solid fa-phone text-xs"></i>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Phone Line</p>
                        <p className="text-xs font-bold text-slate-800">{vendorToView.phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-sm">
                        <i className="fa-solid fa-globe text-xs"></i>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Web Presence</p>
                        <p className="text-xs font-bold text-slate-800 truncate max-w-[150px]">{vendorToView.website || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-xl shadow-slate-950/20">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Account Status</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                    <p className="text-xs font-bold uppercase tracking-widest">Verified Vendor</p>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-4 leading-relaxed italic">Verified partners have completed the full KYC (Know Your Customer) compliance process.</p>
                </div>
              </div>
            </div>

            <div className="p-10 bg-slate-50 border-t border-slate-100 flex-shrink-0 flex justify-end">
              <button
                onClick={() => setViewingVendorId(null)}
                className="px-12 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionList;
