import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { 
  LayoutDashboard, 
  CheckCircle2, 
  Clock, 
  PlusCircle, 
  Zap, 
  ChevronRight, 
  Layers 
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ 
    activeProjects: 0, 
    completedTasks: 0, 
    pendingTasks: 0 
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- SAFE USER PARSING ---
  let user = { fullName: 'User' };
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
      user = JSON.parse(storedUser);
    }
  } catch (err) {
    console.warn("Corrupted user data in Dashboard, using default.");
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const projectsRes = await api.get('/projects');
        const projects = projectsRes.data.data || [];
        const activeProjects = projects.filter(p => p.status === 'active').length;
        
        setStats({
          activeProjects,
          completedTasks: 0, 
          pendingTasks: 0    
        });

        setRecentProjects(projects.slice(0, 3)); 
        setLoading(false);
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
        if (err.response && err.response.status !== 401) {
            setError("Unable to load your dashboard data at this time.");
        }
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#09090b]">
      <div className="relative flex items-center justify-center">
        <div className="absolute h-16 w-16 border-4 border-emerald-500/20 rounded-full"></div>
        <div className="h-16 w-16 border-4 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
      <p className="mt-6 text-zinc-400 font-medium tracking-widest uppercase text-xs">Loading Dashboard</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#09090b] p-8">
      <div className="max-w-md mx-auto p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-center gap-3">
        <Zap className="h-5 w-5" />
        <span className="text-sm font-medium">{error}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-emerald-500/30">
      <div className="max-w-7xl mx-auto p-6 lg:p-12">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white italic">
              WORKFLOW<span className="text-emerald-500 text-5xl">.</span>
            </h1>
            <p className="text-zinc-500 mt-1 font-medium">
              Welcome back, <span className="text-zinc-200">{user.fullName}</span>. Here is your project overview.
            </p>
          </div>
          <Link 
            to="/projects" 
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-full transition-all duration-300 shadow-lg shadow-emerald-900/20 active:scale-95 font-bold"
          >
            <PlusCircle className="h-5 w-5" />
            CREATE PROJECT
          </Link>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {[
            { label: 'Active Projects', val: stats.activeProjects, icon: Layers, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
            { label: 'Tasks Completed', val: stats.completedTasks, icon: CheckCircle2, color: 'text-blue-400', bg: 'bg-blue-400/10' },
            { label: 'Tasks Pending', val: stats.pendingTasks, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10' },
          ].map((item, idx) => (
            <div key={idx} className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl hover:border-zinc-700 transition-colors">
              <div className={`inline-flex p-3 rounded-2xl ${item.bg} ${item.color} mb-4`}>
                <item.icon className="h-6 w-6" />
              </div>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{item.label}</p>
              <h2 className="text-4xl font-light text-white mt-1">{item.val}</h2>
            </div>
          ))}
        </div>

        {/* Recent Activity Section */}
        <section className="bg-zinc-900/30 border border-zinc-800 rounded-[2rem] overflow-hidden">
          <div className="px-8 py-6 border-b border-zinc-800 flex justify-between items-center">
            <h2 className="text-xl font-semibold flex items-center gap-3">
              <Zap className="h-5 w-5 text-emerald-500 fill-emerald-500/20" /> 
              Recent Activity
            </h2>
            <Link to="/projects" className="text-xs font-bold text-zinc-400 hover:text-emerald-400 uppercase tracking-tighter transition-colors">
              View All Projects
            </Link>
          </div>

          <div className="p-6">
            {recentProjects.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {recentProjects.map((project) => (
                  <Link to={`/projects/${project.id}`} key={project.id} className="group">
                    <div className="flex items-center justify-between p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 group-hover:bg-zinc-800/50 group-hover:border-emerald-500/30 transition-all">
                      <div className="flex items-center gap-5">
                        <div className="h-14 w-14 bg-zinc-800 rounded-2xl flex items-center justify-center border border-zinc-700 group-hover:border-emerald-500/50 transition-all">
                          <span className="text-emerald-500 font-mono text-xl">{project.name.charAt(0)}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-zinc-100 text-lg">{project.name}</h4>
                          <p className="text-xs text-zinc-500 font-mono uppercase">
                            Last Updated: {new Date(project.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                         <span className={`hidden sm:block px-4 py-1 text-[10px] font-black rounded-md uppercase tracking-[0.2em] border ${
                            project.status === 'active' 
                              ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' 
                              : 'text-zinc-500 border-zinc-700 bg-zinc-800'
                          }`}>
                          {project.status}
                        </span>
                        <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-emerald-500 transform group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="bg-zinc-800 inline-flex p-6 rounded-full mb-4">
                    <Layers className="h-10 w-10 text-zinc-600" />
                </div>
                <h3 className="text-zinc-300 font-bold text-xl">No projects found</h3>
                <p className="text-zinc-500 text-sm mt-2 max-w-xs mx-auto">You haven't created any projects yet. Click the button above to get started.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}