import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { ShieldCheck, UserCircle, Globe, ChevronRight, Loader2, LockKeyhole } from 'lucide-react';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    tenantSubdomain: '' 
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
      const response = await api.post('/auth/login', formData);
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
      toast.success('Successfully logged in');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white font-sans text-slate-900">
      
      {/* Visual Side (Left) */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-[#0f172a] relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xl tracking-tighter">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <ShieldCheck className="text-[#0f172a] w-5 h-5" />
            </div>
            PROJECT HUB
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-5xl font-bold text-white leading-tight">
            Manage your <br />
            <span className="text-emerald-400">workspace</span> with <br />
            total efficiency.
          </h2>
          <p className="mt-6 text-slate-400 max-w-md text-lg leading-relaxed">
            The professional platform for streamlined project management and team collaboration.
          </p>
        </div>

        <div className="relative z-10 text-slate-500 text-sm flex gap-6">
          <span>System Version 2.4.0</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>

        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-emerald-500/30 rounded-full animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-emerald-500/10 rounded-full"></div>
        </div>
      </div>

      {/* Form Side (Right) */}
      <div className="flex items-center justify-center p-8 lg:p-24 relative">
        <div className="w-full max-w-[400px]">
          <div className="mb-10 text-center lg:text-left">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Account Login</h3>
            <p className="text-slate-500 mt-2">Please enter your credentials to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subdomain */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                Workspace Name
              </label>
              <div className="relative group">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="text"
                  name="tenantSubdomain"
                  placeholder="e.g. my-company"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 ring-1 ring-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                  value={formData.tenantSubdomain}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@email.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 ring-1 ring-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                Password
              </label>
              <div className="relative group">
                <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 ring-1 ring-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full group bg-slate-900 hover:bg-emerald-600 text-white py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center shadow-xl shadow-slate-200 hover:shadow-emerald-200 active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <span className="flex items-center gap-2 uppercase tracking-widest text-xs">
                  Sign In <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

          {/* New Navigation Layout */}
          <div className="mt-12">
            <div className="relative mb-8">
               <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
               <div className="relative flex justify-center text-xs uppercase tracking-widest text-slate-400">
                <span className="bg-white px-4">Don't have an account?</span>
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Link to="/register" className="text-center py-3 text-[10px] font-black tracking-widest border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors uppercase">
                New User
              </Link>
              <Link to="/register-tenant" className="text-center py-3 text-[10px] font-black tracking-widest border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors uppercase">
                New Org
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}