import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Terminal, 
  Users2, 
  Power, 
  Menu, 
  X, 
  Activity,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // SAFE USER PARSING 2.0
  let user = { fullName: 'User', email: '' };
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
      user = JSON.parse(storedUser);
    }
  } catch (error) {
    console.warn("User data corrupted, using default.");
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const navItems = [
    { label: 'DASHBOARD', path: '/dashboard', icon: Activity },
    { label: 'PROJECTS', path: '/projects', icon: Terminal },
    { label: 'USERS', path: '/users', icon: Users2 },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-400 font-sans flex overflow-hidden">
      
      {/* --- DESKTOP NAVIGATION --- */}
      <aside className="hidden md:flex flex-col w-72 bg-[#09090b] border-r border-zinc-800/50 relative z-30">
        {/* Brand Logo */}
        <div className="p-8 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-[#09090b] shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <Box className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white italic tracking-tighter leading-none">CORE</h1>
              <span className="text-[10px] font-bold text-emerald-500 tracking-[0.3em]">SYSTEM</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center justify-between px-4 py-4 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-zinc-800/50 text-emerald-400 shadow-inner' 
                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-4">
                  <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-emerald-400' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                </div>
                {isActive && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-6 mt-auto">
          <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-3xl mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-emerald-500 font-bold text-sm">
                {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-black text-zinc-100 uppercase truncate tracking-tighter">{user.fullName}</p>
                <p className="text-[10px] text-zinc-500 truncate font-mono">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="group flex w-full items-center justify-between px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-red-400 hover:bg-red-500/5 rounded-2xl transition-all border border-transparent hover:border-red-500/20"
            >
              <span className="flex items-center gap-2">
                <Power className="h-4 w-4" /> Disconnect
              </span>
              <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>
      </aside>

      {/* --- MOBILE HEADER --- */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-800 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Box className="h-6 w-6 text-emerald-500" />
          <h1 className="text-lg font-black text-white italic tracking-tighter">CORE</h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="h-10 w-10 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800 text-emerald-500"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* --- MOBILE MENU OVERLAY --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/90 z-40 animate-in fade-in duration-300">
          <div className="flex flex-col h-full pt-24 p-8 space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-4 p-6 rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] transition-all border ${
                  location.pathname === item.path 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-zinc-900/50 text-zinc-500 border-zinc-800'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-4 p-6 rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] text-red-500 bg-red-500/5 border border-red-500/10 mt-auto mb-10"
            >
              <Power className="h-5 w-5" />
              Terminate Session
            </button>
          </div>
        </div>
      )}

      {/* --- MAIN VIEWPORT --- */}
      <main className="flex-1 h-screen overflow-y-auto bg-[#050505] relative">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
        
        <div className="pt-24 md:pt-0 w-full min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}