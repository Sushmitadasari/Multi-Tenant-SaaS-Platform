import { useEffect, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { 
  ShieldCheck, Mail, UserCircle, User, Trash2, Plus, 
  X, Activity, MoreVertical, Loader2, Users as UsersIcon,
  ShieldAlert, ChevronRight
} from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', role: 'user' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- SAFE USER PARSING ---
  let currentUser = { role: 'user' };
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
      currentUser = JSON.parse(storedUser);
    }
  } catch (error) {
    console.warn("Corrupted user data in Users page");
  }
  const isAdmin = currentUser.role === 'tenant_admin';

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch (error) {
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/users', formData);
      toast.success('Team member added successfully');
      setShowModal(false);
      setFormData({ fullName: '', email: '', password: '', role: 'user' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this member from the team?")) return;
    try {
      await api.delete(`/users/${userId}`);
      toast.success('Member removed');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Removal failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-6 md:p-12 font-sans selection:bg-emerald-500/30">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-8 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <UserCircle className="h-4 w-4 text-emerald-500" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Team Management</span>
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter text-white">MEMBERS<span className="text-emerald-500 text-5xl">.</span></h1>
            <p className="text-zinc-500 mt-2 font-medium">Manage team access and collaboration roles.</p>
          </div>
          
          {isAdmin && (
            <button 
              onClick={() => setShowModal(true)}
              className="group flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-full transition-all active:scale-95 font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-900/20"
            >
              <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" /> Add Team Member
            </button>
          )}
        </div>

        {/* Member Table Section */}
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
          {loading ? (
             <div className="p-10 space-y-6">
               {[1, 2, 3].map((i) => (
                 <div key={i} className="h-16 bg-zinc-800/50 rounded-2xl animate-pulse w-full"></div>
               ))}
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="px-8 py-6 text-left text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Name</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Account Role</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Status</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Date Joined</th>
                    {isAdmin && <th className="px-8 py-6 text-right text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-zinc-800/30 transition-all group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-emerald-500 font-mono text-xl group-hover:border-emerald-500/50 transition-all">
                            {user.fullName?.[0]}
                          </div>
                          <div>
                            <div className="font-bold text-zinc-100 italic tracking-tight">{user.fullName}</div>
                            <div className="text-xs text-zinc-500 font-mono">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1 text-[10px] font-black rounded-md uppercase tracking-widest border ${
                          user.role === 'tenant_admin' 
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                            : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                        }`}>
                          {user.role === 'tenant_admin' ? 'Administrator' : 'Member'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-tighter">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div> Active Now
                        </div>
                      </td>
                      <td className="px-8 py-6 text-xs font-mono text-zinc-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      {isAdmin && (
                        <td className="px-8 py-6 text-right">
                          {user.id !== currentUser.id ? (
                            <button 
                              onClick={() => handleDelete(user.id)}
                              className="text-zinc-600 hover:text-red-500 p-3 rounded-xl hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          ) : (
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-700 italic">Current User</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="text-center py-24">
                  <ShieldAlert className="h-12 w-12 text-zinc-800 mx-auto mb-4" />
                  <p className="text-zinc-500 font-black uppercase text-xs tracking-[0.3em]">No members found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Slide-Panel for Adding Member */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-end z-50 animate-in fade-in duration-300">
          <div className="bg-zinc-950 w-full max-w-lg h-full border-l border-zinc-800 p-10 animate-in slide-in-from-right duration-500 shadow-2xl">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">Invite member</h3>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Add a new person to your team</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      type="text" required
                      className="w-full pl-12 pr-4 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl focus:border-emerald-500 transition-all outline-none text-white"
                      placeholder="e.g. Jane Smith"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      type="email" required
                      className="w-full pl-12 pr-4 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl focus:border-emerald-500 transition-all outline-none text-white"
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Temporary Password</label>
                  <div className="relative group">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      type="password" required
                      className="w-full pl-12 pr-4 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl focus:border-emerald-500 transition-all outline-none text-white"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Permissions</label>
                  <select 
                    className="w-full px-6 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl focus:border-emerald-500 transition-all outline-none text-zinc-400 appearance-none font-bold text-xs uppercase cursor-pointer"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="user">Member (Standard Access)</option>
                    <option value="tenant_admin">Admin (Full Access)</option>
                  </select>
                </div>
              </div>

              <div className="pt-8">
                <button 
                  type="submit" disabled={isSubmitting}
                  className="w-full bg-emerald-600 text-white py-5 rounded-full hover:bg-emerald-500 font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-emerald-900/20 flex justify-center items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : <>Add to Team <ChevronRight className="h-4 w-4" /></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}