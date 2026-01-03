import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { 
  ChevronLeft, CalendarDays, CheckCircle2, ListTodo, Trash2, Plus, 
  Settings2, Activity, ShieldAlert, Check, X, LayoutGrid
} from 'lucide-react';

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', status: 'todo' });
  const [loading, setLoading] = useState(true);

  const fetchProjectData = async () => {
    try {
      const projectRes = await api.get(`/projects/${id}`);
      setProject(projectRes.data.data);
      const tasksRes = await api.get(`/tasks?projectId=${id}`); 
      setTasks(tasksRes.data.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load project details');
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjectData(); }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if(!newTask.title.trim()) return;
    try {
      await api.post('/tasks', { ...newTask, projectId: id });
      toast.success('Task added successfully');
      setNewTask({ title: '', status: 'todo' });
      setShowTaskForm(false);
      fetchProjectData();
    } catch (error) {
      toast.error('Failed to add task');
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
      fetchProjectData();
    } catch (error) {
      toast.error('Failed to update task status');
      fetchProjectData();
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task removed');
      fetchProjectData();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const completedCount = tasks.filter(t => t.status === 'done').length;
  const progressPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  if (loading) return (
    <div className="min-h-screen flex justify-center items-center bg-[#09090b]">
      <div className="flex flex-col items-center">
        <div className="h-12 w-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-500 font-sans text-xs tracking-widest uppercase">Loading Project</p>
      </div>
    </div>
  );

  if (!project) return (
    <div className="min-h-screen flex justify-center items-center bg-[#09090b]">
        <div className="text-center bg-zinc-900 p-10 rounded-3xl border border-zinc-800">
            <ShieldAlert className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white uppercase tracking-tighter">Project Not Found</h2>
            <Link to="/projects" className="text-emerald-500 font-bold hover:text-emerald-400 mt-6 inline-block text-sm">RETURN TO PROJECTS</Link>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-6 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Navigation */}
        <Link 
            to="/projects" 
            className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-emerald-500 transition-all"
        >
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Projects
        </Link>

        {/* Project Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-zinc-900/50 p-8 rounded-[2rem] border border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-4">
                  <h1 className="text-4xl font-black text-white italic tracking-tighter">{project.name}</h1>
                  <span className={`px-4 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      project.status === 'active' 
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                      : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                  }`}>
                      {project.status}
                  </span>
              </div>
              <p className="text-zinc-400 leading-relaxed max-w-xl font-medium">{project.description || "No description provided for this project."}</p>
            </div>
            
            <div className="mt-10 pt-6 border-t border-zinc-800/50 flex items-center gap-6">
              <div className="flex items-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                <CalendarDays className="h-4 w-4 mr-2 text-emerald-500" />
                Created on: {new Date(project.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                <Settings2 className="h-4 w-4 mr-2 text-emerald-500" />
                Project ID: {id.substring(0,8)}
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="bg-zinc-900/50 p-8 rounded-[2rem] border border-zinc-800 flex flex-col items-center justify-center text-center">
              <div className="relative h-32 w-32 flex items-center justify-center mb-4">
                <svg className="h-full w-full transform -rotate-90">
                  <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-800" />
                  <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
                    strokeDasharray={364.4}
                    strokeDashoffset={364.4 - (364.4 * progressPercentage) / 100}
                    className="text-emerald-500 transition-all duration-1000 ease-in-out" 
                  />
                </svg>
                <span className="absolute text-2xl font-black italic">{progressPercentage}%</span>
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-zinc-500">{completedCount} of {tasks.length} tasks completed</p>
          </div>
        </div>

        {/* Task Management Bar */}
        <div className="flex justify-between items-center px-2">
          <h2 className="text-sm font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-3">
            <LayoutGrid className="h-4 w-4 text-emerald-500" /> Project Tasks
          </h2>
          {!showTaskForm && (
              <button 
                onClick={() => setShowTaskForm(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-full transition-all active:scale-95 text-xs font-black uppercase tracking-widest"
              >
                + Add New Task
              </button>
          )}
        </div>

        {/* Task Form */}
        {showTaskForm && (
          <div className="bg-zinc-900 border-2 border-emerald-500/30 p-8 rounded-3xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-black uppercase text-xs tracking-widest text-emerald-500">Create a new task</h3>
                <button onClick={() => setShowTaskForm(false)} className="text-zinc-500 hover:text-white">
                    <X className="h-5 w-5" />
                </button>
            </div>
            <form onSubmit={handleCreateTask} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input 
                autoFocus
                className="md:col-span-2 bg-zinc-800 border-0 text-white rounded-xl px-5 py-4 focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                placeholder="What needs to be done?"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                required
              />
              <select 
                  className="bg-zinc-800 border-0 text-zinc-300 rounded-xl px-5 py-4 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer font-bold text-xs uppercase"
                  value={newTask.status}
                  onChange={(e) => setNewTask({...newTask, status: e.target.value})}
              >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Completed</option>
              </select>
              <button type="submit" className="bg-white text-black py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-emerald-500 hover:text-white transition-colors">
                Save Task
              </button>
            </form>
          </div>
        )}

        {/* Task List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => (
            <div 
                key={task.id} 
                className={`p-6 rounded-3xl border transition-all duration-300 flex items-center justify-between group ${
                    task.status === 'done' 
                    ? 'bg-zinc-900/30 border-zinc-800/50' 
                    : 'bg-zinc-900 border-zinc-800 hover:border-emerald-500/50 shadow-xl'
                }`}
            >
              <div className="flex items-center gap-5">
                <button 
                    onClick={() => handleUpdateStatus(task.id, task.status === 'done' ? 'todo' : 'done')}
                    className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${
                    task.status === 'done' 
                        ? 'bg-emerald-500/10 text-emerald-500' 
                        : 'bg-zinc-800 text-zinc-600 group-hover:bg-zinc-700'
                    }`}
                >
                  {task.status === 'done' ? <Check className="h-6 w-6" /> : <Activity className="h-5 w-5" />}
                </button>

                <div>
                  <p className={`font-bold text-lg ${
                      task.status === 'done' ? 'text-zinc-600 line-through' : 'text-zinc-100'
                  }`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`h-1.5 w-1.5 rounded-full ${
                        task.status === 'done' ? 'bg-emerald-500' : task.status === 'in_progress' ? 'bg-blue-500' : 'bg-amber-500'
                    }`} />
                    <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-500">
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-zinc-600 hover:text-red-500 p-2 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}

          {tasks.length === 0 && !showTaskForm && (
            <div className="md:col-span-2 text-center py-20 bg-zinc-900/20 border-2 border-dashed border-zinc-800 rounded-[2rem]">
              <ListTodo className="h-10 w-10 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-zinc-500 font-black uppercase text-xs tracking-widest">No tasks yet</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}