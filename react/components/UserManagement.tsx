
import React, { useState } from 'react';
import { User, Role, Language } from '../types';

interface UserManagementProps {
  language: Language;
  t: any;
  currentUser: User;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const UserManagement: React.FC<UserManagementProps> = ({ language, t, currentUser, users, setUsers }) => {
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: Role.USER_PROCUREMENT });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const u: User = {
      id: Math.random().toString(36).substr(2, 9),
      ...newUser,
      avatar: `https://picsum.photos/seed/${Math.random()}/200`
    };
    setUsers([...users, u]);
    setShowModal(false);
    setNewUser({ name: '', email: '', role: Role.USER_PROCUREMENT });
  };

  const deleteUser = (id: string) => {
    if (id === currentUser.id) return alert("You cannot delete yourself.");
    setUsers(users.filter(u => u.id !== id));
  };

  const canManage = (role: Role) => {
    if (currentUser.role === Role.SUPER_ADMIN) return true;
    if (currentUser.role === Role.ADMIN_PROCUREMENT && role === Role.USER_PROCUREMENT) return true;
    return false;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.userManagement.title}</h1>
          <p className="text-slate-500">{t.userManagement.subtitle}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg"
        >
          <i className="fa-solid fa-user-plus"></i>
          {t.userManagement.addUser}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t.userManagement.user}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t.userManagement.role}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t.userManagement.status}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t.userManagement.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} className="w-10 h-10 rounded-full border shadow-sm" alt="" />
                    <div>
                      <p className="font-semibold text-slate-800">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${user.role === Role.SUPER_ADMIN ? 'bg-purple-100 text-purple-700' :
                      user.role === Role.ADMIN_PROCUREMENT ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                    }`}>
                    {user.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    {t.userManagement.active}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      disabled={!canManage(user.role)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-30"
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button
                      onClick={() => deleteUser(user.id)}
                      disabled={!canManage(user.role)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-red-300 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-30"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-md rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">{t.userManagement.addUser}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t.userManagement.fullName}</label>
                <input
                  required
                  value={newUser.name}
                  onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t.userManagement.email}</label>
                <input
                  required
                  type="email"
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t.userManagement.systemRole}</label>
                <select
                  value={newUser.role}
                  onChange={e => setNewUser({ ...newUser, role: e.target.value as Role })}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                >
                  <option value={Role.USER_PROCUREMENT}>User (Vendor)</option>
                  <option value={Role.ADMIN_PROCUREMENT}>Procurement Admin</option>
                  {currentUser.role === Role.SUPER_ADMIN && (
                    <option value={Role.SUPER_ADMIN}>Super Admin</option>
                  )}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl font-bold border hover:bg-slate-50 transition-all">{t.procurement.cancel}</button>
                <button type="submit" className="flex-1 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg">{t.userManagement.create}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
