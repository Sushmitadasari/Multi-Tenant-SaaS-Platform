import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { 
  Plus, LayoutGrid, Calendar, User, 
  Trash2, X, FolderKanban, Boxes, 
  ArrowUpRight, Loader2, Info 
} from 'lucide-react';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/projects');
      setProjects(res.data.data);
    } catch (error) {
      toast.error('Unable to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;
    try {
      await api.post('/projects', newProject);
      toast.success('Project created successfully');
      setNewProject({ name: '', description: '' });
      setShowForm(false);
      fetchProjects();
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  const handleDelete = async (e, projectId) => {
    e.preventDefault();
    e.stopPropagation(); 
    if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;
    try {
      await api.delete(`/projects/${projectId}`);
      toast.success('Project deleted');
      fetchProjects();
    } catch (error) {
      toast.error('Error deleting project');
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Modern Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <div className="h-2 w-2 bg-emerald-500 animate-pulse rounded-full" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Workspace Overview</span>
            </div>
            <h1 className="text-5xl font-black italic tracking-tighter text-white">PROJECTS<span className="text-emerald-500">.</span></h1>
          </div>
          
          <button 
            onClick={() => setShowForm(!showForm)}
            className={`group relative overflow-hidden px-8 py-4 rounded-full transition-all duration-500 active:scale-95 font-black text-xs uppercase tracking-widest ${
              showForm 
                ? 'bg-zinc-800 text-zinc-400' 
                : 'bg-white text-black hover:bg-emerald-500 hover:text-white'
            }`}
          >
            <span className="relative z-10 flex items-center gap-2">
               {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
               {showForm ? 'Cancel' : 'New Project'}
            </span>
          </button>
        </div>

        {/* Floating Entry Form */}
        {showForm && (
          <div className="mb-16 bg-zinc-900/80 backdrop-blur-xl border border-emerald-500/20 p-8 rounded-[2.5rem] shadow-2xl shadow-emerald-500/5 animate-in fade-in zoom-in-95 duration-300">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-1">Project Name</label>
                  <input 
                    autoFocus
                    className="w-full bg-zinc-800/50 border-0 border-b-2 border-zinc-800 text-white text-xl rounded-2xl px-6 py-4 focus:border-emerald-500 transition-all outline-none placeholder:text-zinc-600"
                    placeholder="Enter project title..."
                    value={newProject.name}
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Description</label>
                  <textarea 
                    className="w-full bg-zinc-800/50 border-0 border-b-2 border-zinc-800 text-white rounded-2xl px-6 py-4 focus:border-emerald-500 transition-all outline-none placeholder:text-zinc-600 min-h-[60px] resize-none"
                    placeholder="Provide a brief project overview..."
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button className="bg-emerald-600 text-white px-12 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading Grid */}
        {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-80 bg-zinc-900/50 rounded-[2rem] border border-zinc-800 p-8 animate-pulse" />
                ))}
            </div>
        ) : (
        <>
            {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project) => (
                <Link to={`/projects/${project.id}`} key={project.id} className="group relative">
                    <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] h-full flex flex-col justify-between transition-all duration-500 hover:border-emerald-500/50 hover:bg-zinc-800/50 hover:-translate-y-2">
                        
                        <div className="flex justify-between items-start mb-10">
                            <div className="h-14 w-14 bg-zinc-800 border border-zinc-700 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                <FolderKanban className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`px-4 py-1 text-[9px] font-black uppercase tracking-[0.2em] rounded-md border ${
                                    project.status === 'active' 
                                    ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20' 
                                    : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                                }`}>
                                    {project.status}
                                </span>
                                <button 
                                    onClick={(e) => handleDelete(e, project.id)}
                                    className="p-2 text-zinc-700 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-2xl font-black text-white italic tracking-tight group-hover:text-emerald-400 transition-colors mb-3">
                                {project.name}
                            </h3>
                            <p className="text-zinc-500 text-sm font-medium line-clamp-2 leading-relaxed">
                                {project.description || "No description provided."}
                            </p>
                        </div>

                        <div className="mt-10 pt-6 border-t border-zinc-800 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600">
                                <User className="h-3 w-3 text-emerald-500" />
                                {project.creator?.fullName || 'Member'}
                            </div>
                            <ArrowUpRight className="h-5 w-5 text-zinc-800 group-hover:text-emerald-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                        </div>
                    </div>
                </Link>
                ))}
            </div>
            ) : (
                <div className="text-center py-32 bg-zinc-900/20 border-2 border-dashed border-zinc-800 rounded-[3rem]">
                    <Boxes className="h-16 w-16 text-zinc-800 mx-auto mb-6" />
                    <h3 className="text-2xl font-black text-zinc-500 uppercase italic tracking-widest">No Projects Yet</h3>
                    <p className="text-zinc-600 mt-4 mb-10 text-sm">Create your first project to get started.</p>
                    <button 
                        onClick={() => setShowForm(true)}
                        className="bg-zinc-800 hover:bg-white hover:text-black text-zinc-400 px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest transition-all"
                    >
                        Create Project
                    </button>
                </div>
            )}
        </>
        )}
      </div>
    </div>
  );
}