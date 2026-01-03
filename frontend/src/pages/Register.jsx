import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { 
  User, Mail, Lock, Building2, 
  ShieldCheck, UserPlus, ChevronRight, 
  Loader2, Layout, UserCircle 
} from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',      
    email: '',
    password: '',
    tenantSubdomain: '', 
    role: 'User'
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/auth/register', formData);
      toast.success('Registration successful! Please sign in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col lg:flex-row font-sans selection:bg-emerald-500/30">
      
      {/* Visual Sidebar */}
      <div className="hidden lg:flex w-1/3 bg-[#0f172a] p-12 flex-col justify-between border-r border-zinc-800 relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2 bg-emerald-500 rounded-lg">
            <Layout className="w-6 h-6 text-[#09090b]" />
          </div>
          <span className="text-white font-black tracking-tighter text-xl italic">PROJECT HUB</span>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-black text-white leading-tight italic">
            JOIN THE <br />
            <span className="text-emerald-500">COMMUNITY.</span>
          </h2>
          <p className="mt-4 text-zinc-500 font-medium">Create your account and start collaborating with your team today.</p>
        </div>

        <div className="relative z-10">
          <div className="flex gap-4 opacity-50">
             <UserCircle className="text-emerald-500 w-5 h-5" />
             <div className="h-px flex-1 bg-zinc-800 self-center"></div>
          </div>
        </div>

        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#10b981 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}>
        </div>
      </div>

      {/* Main Registration Area */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-24 bg-[#09090b]">
        <div className="w-full max-w-xl">
          <div className="mb-10 lg:hidden text-center">
             <h1 className="text-3xl font-black text-white italic tracking-tighter">PROJECT HUB</h1>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h3 className="text-3xl font-black text-zinc-100 tracking-tighter">CREATE ACCOUNT</h3>
            <p className="text-zinc-500 mt-1 text-sm font-medium uppercase tracking-widest">Step 01: Profile Setup</p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Workspace */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Workspace Name</label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="text"
                  name="tenantSubdomain"
                  required
                  placeholder="e.g. company-name"
                  className="w-full pl-12 pr-4 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all outline-none text-white placeholder:text-zinc-700"
                  value={formData.tenantSubdomain}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl focus:border-emerald-500/50 transition-all outline-none text-white placeholder:text-zinc-700"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl focus:border-emerald-500/50 transition-all outline-none text-white placeholder:text-zinc-700"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Create a password"
                  className="w-full pl-12 pr-4 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl focus:border-emerald-500/50 transition-all outline-none text-white placeholder:text-zinc-700"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Account Role</label>
              <div className="relative group">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                <select
                  name="role"
                  className="w-full pl-12 pr-4 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl focus:border-emerald-500/50 transition-all outline-none text-zinc-400 appearance-none cursor-pointer font-bold text-xs uppercase"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="User">Standard Member</option>
                  <option value="Manager">Project Manager</option>
                  <option value="Admin">Administrator</option>
                </select>
              </div>
            </div>

            {/* Submit */}
            <div className="md:col-span-2 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full group bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all active:scale-95 shadow-lg shadow-emerald-900/20"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-5 w-5 mx-auto" />
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    Sign Up <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-12 text-center lg:text-left border-t border-zinc-800 pt-8">
            <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-4">
              Already have an account?
            </p>
            <Link to="/login" className="text-emerald-500 font-black uppercase text-xs tracking-tighter hover:text-white transition-colors">
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}