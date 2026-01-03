import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { 
  Building2, Globe, User, Mail, 
  Lock, ChevronRight, Loader2, 
  Layout, Sparkles, ShieldCheck 
} from 'lucide-react';

export default function RegisterTenant() {
  const [formData, setFormData] = useState({
    tenantName: '',
    subdomain: '',
    adminFullName: '',
    adminEmail: '',
    adminPassword: ''
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
      await api.post('/auth/register-tenant', formData);
      toast.success('Organization created successfully');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create organization');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
            <Layout className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Register.Org</h1>
          <p className="text-zinc-500 mt-2 text-sm font-bold tracking-[0.2em] uppercase">Setup your company workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Company Profile */}
          <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2.5rem] backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-8">
               <Sparkles className="w-4 h-4 text-emerald-500 fill-emerald-500" />
               <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Company Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Company Name</label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                  <input 
                    name="tenantName" 
                    required 
                    placeholder="e.g. Acme Corporation" 
                    className="w-full pl-12 pr-4 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:border-emerald-500 transition-all outline-none text-white placeholder:text-zinc-700"
                    onChange={handleChange} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Workspace ID</label>
                <div className="relative group">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                  <input 
                    name="subdomain" 
                    required 
                    placeholder="e.g. acme-team" 
                    className="w-full pl-12 pr-4 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:border-emerald-500 transition-all outline-none text-white placeholder:text-zinc-700 lowercase"
                    onChange={handleChange} 
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/10 px-4 py-2 rounded-xl">
               <span className="text-[10px] font-bold text-zinc-500 uppercase">Your Workspace URL:</span>
               <span className="text-[10px] font-mono text-emerald-400">{formData.subdomain || 'company'}.project-hub.com</span>
            </div>
          </div>

          {/* Section 2: Administrator Setup */}
          <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2.5rem] backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-8">
               <ShieldCheck className="w-4 h-4 text-emerald-500 fill-emerald-500" />
               <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Administrator Account</h3>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                  <input 
                    name="adminFullName" 
                    required 
                    placeholder="Full Name" 
                    className="w-full pl-12 pr-4 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:border-emerald-500 transition-all outline-none text-white placeholder:text-zinc-700"
                    onChange={handleChange} 
                  />
                </div>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                  <input 
                    type="email" 
                    name="adminEmail" 
                    required 
                    placeholder="Email Address" 
                    className="w-full pl-12 pr-4 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:border-emerald-500 transition-all outline-none text-white placeholder:text-zinc-700"
                    onChange={handleChange} 
                  />
                </div>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                <input 
                  type="password" 
                  name="adminPassword" 
                  required 
                  placeholder="Create Password" 
                  className="w-full pl-12 pr-4 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:border-emerald-500 transition-all outline-none text-white placeholder:text-zinc-700"
                  onChange={handleChange} 
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white hover:bg-emerald-500 text-black hover:text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] transition-all active:scale-95 shadow-2xl shadow-emerald-500/10 flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <>Create Organization <ChevronRight className="h-4 w-4" /></>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/login" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}