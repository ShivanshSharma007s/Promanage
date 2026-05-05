import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  LogOut, Plus, FolderKanban, CheckSquare, Clock, LayoutDashboard,
  Trash2, AlertTriangle, Users, TrendingUp, X, Calendar, Flag,
  Loader2, ChevronRight, Search
} from 'lucide-react';

const API = import.meta.env.DEV ? 'http://localhost:5000' : '';

/* ==================== TOAST ==================== */
const ToastContainer = ({ toasts, removeToast }) => (
  <div className="toast-container">
    {toasts.map(t => (
      <div key={t.id} className={`toast ${t.type}`}>
        {t.type === 'success' ? <CheckSquare size={16} color="var(--success)" /> :
         t.type === 'error' ? <AlertTriangle size={16} color="var(--danger)" /> :
         <Clock size={16} color="var(--accent)" />}
        <span style={{ flex: 1 }}>{t.message}</span>
        <button className="btn-ghost" onClick={() => removeToast(t.id)} style={{padding: '0.2rem'}}><X size={14} /></button>
      </div>
    ))}
  </div>
);

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedProject, setSelectedProject] = useState(null);
  const [view, setView] = useState('dashboard'); // dashboard | board
  const [search, setSearch] = useState('');
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(null); // {type, id, name}

  // Form states
  const [projectForm, setProjectForm] = useState({ name: '', description: '' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'Medium', dueDate: '', projectId: '', assigneeId: '' });

  /* ---- Toasts ---- */
  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  /* ---- Data Fetching ---- */
  const fetchAll = useCallback(async () => {
    try {
      const [projRes, taskRes, usersRes, statsRes] = await Promise.all([
        axios.get(`${API}/api/projects`),
        axios.get(`${API}/api/tasks${selectedProject ? `?projectId=${selectedProject}` : ''}`),
        axios.get(`${API}/api/auth/users`),
        axios.get(`${API}/api/tasks/stats/dashboard`)
      ]);
      setProjects(projRes.data);
      setTasks(taskRes.data);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedProject]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ---- Handlers ---- */
  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/api/projects`, projectForm);
      setShowProjectModal(false);
      setProjectForm({ name: '', description: '' });
      addToast('Project created successfully!');
      fetchAll();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create project', 'error');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const pid = taskForm.projectId || (selectedProject ? selectedProject : projects[0]?.id);
    if (!pid) return addToast('Please create a project first', 'error');
    try {
      await axios.post(`${API}/api/tasks`, { ...taskForm, projectId: pid });
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', priority: 'Medium', dueDate: '', projectId: '', assigneeId: '' });
      addToast('Task created successfully!');
      fetchAll();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create task', 'error');
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await axios.patch(`${API}/api/tasks/${taskId}/status`, { status });
      addToast(`Task moved to ${status}`, 'info');
      fetchAll();
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async () => {
    if (!showDeleteModal) return;
    const { type, id } = showDeleteModal;
    try {
      await axios.delete(`${API}/api/${type}s/${id}`);
      setShowDeleteModal(null);
      if (type === 'project' && selectedProject === id) setSelectedProject(null);
      addToast(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`);
      fetchAll();
    } catch (err) {
      addToast(`Failed to delete ${type}`, 'error');
    }
  };

  /* ---- Derived Data ---- */
  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  const isOverdue = (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';

  const currentProjectName = selectedProject
    ? projects.find(p => p.id === selectedProject)?.name || 'Project'
    : 'All Projects';

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
        <Loader2 size={40} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* ===== SIDEBAR ===== */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">PM</div>
          <div>
            <h2>ProManage</h2>
            <span>Project Tracker</span>
          </div>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-title">Navigation</div>
          <ul className="sidebar-nav">
            <li className={`sidebar-nav-item ${view === 'dashboard' && !selectedProject ? 'active' : ''}`}
                onClick={() => { setView('dashboard'); setSelectedProject(null); }}>
              <LayoutDashboard size={18} /> Dashboard
            </li>
          </ul>
        </div>

        <div className="sidebar-section" style={{ flex: 1 }}>
          <div className="sidebar-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Projects
            {user.role === 'Admin' && (
              <button className="btn-ghost" onClick={() => setShowProjectModal(true)} title="New Project" style={{padding: 2}}>
                <Plus size={14} />
              </button>
            )}
          </div>
          <ul className="sidebar-nav">
            {projects.map(p => (
              <li key={p.id}
                  className={`sidebar-nav-item ${selectedProject === p.id ? 'active' : ''}`}
                  onClick={() => { setSelectedProject(p.id); setView('board'); }}>
                <FolderKanban size={16} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{p.name}</span>
                <span className="nav-count">{p._count?.tasks || 0}</span>
              </li>
            ))}
            {projects.length === 0 && (
              <li style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>No projects yet</li>
            )}
          </ul>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{user.name?.charAt(0).toUpperCase()}</div>
            <div className="sidebar-user-info">
              <h4>{user.name}</h4>
              <span>{user.role}</span>
            </div>
          </div>
          <button className="btn btn-secondary" style={{ width: '100%' }} onClick={logout}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="main-content">

        {/* Dashboard View */}
        {view === 'dashboard' && !selectedProject && (
          <>
            <div className="page-header">
              <div>
                <h1>Dashboard</h1>
                <p>Welcome back, {user.name}! Here's an overview of your workspace.</p>
              </div>
              <div className="page-header-actions">
                {user.role === 'Admin' && (
                  <button className="btn btn-secondary" onClick={() => setShowProjectModal(true)}>
                    <Plus size={16} /> New Project
                  </button>
                )}
                <button className="btn btn-primary" onClick={() => setShowTaskModal(true)} disabled={projects.length === 0}>
                  <CheckSquare size={16} /> New Task
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card-header">
                  <span>Total Projects</span>
                  <div className="stat-card-icon purple"><FolderKanban size={18} /></div>
                </div>
                <div className="stat-card-value">{stats.totalProjects || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-header">
                  <span>Total Tasks</span>
                  <div className="stat-card-icon green"><CheckSquare size={18} /></div>
                </div>
                <div className="stat-card-value">{stats.totalTasks || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-header">
                  <span>Overdue</span>
                  <div className="stat-card-icon red"><AlertTriangle size={18} /></div>
                </div>
                <div className="stat-card-value" style={{ color: stats.overdue > 0 ? 'var(--danger)' : 'inherit' }}>{stats.overdue || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-header">
                  <span>Team Members</span>
                  <div className="stat-card-icon yellow"><Users size={18} /></div>
                </div>
                <div className="stat-card-value">{stats.totalUsers || 0}</div>
              </div>
            </div>

            {/* Status breakdown mini bar */}
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              {[
                { label: 'Todo', val: stats.todo, color: 'var(--text-secondary)' },
                { label: 'In Progress', val: stats.inProgress, color: 'var(--accent)' },
                { label: 'Done', val: stats.done, color: 'var(--success)' },
                { label: 'High Priority', val: stats.highPriority, color: 'var(--danger)' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{s.label}:</span>
                  <span style={{ fontWeight: 700 }}>{s.val || 0}</span>
                </div>
              ))}
            </div>

            {/* Projects Grid */}
            <div className="board-section">
              <div className="board-title"><FolderKanban size={20} color="var(--accent)" /> Projects</div>
              {projects.length > 0 ? (
                <div className="projects-grid">
                  {projects.map(p => (
                    <div key={p.id} className="project-card" onClick={() => { setSelectedProject(p.id); setView('board'); }}>
                      <div className="project-card-header">
                        <div className="project-card-title">{p.name}</div>
                        {user.role === 'Admin' && (
                          <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); setShowDeleteModal({ type: 'project', id: p.id, name: p.name }); }}>
                            <Trash2 size={14} color="var(--danger)" />
                          </button>
                        )}
                      </div>
                      <div className="project-card-desc">{p.description || 'No description'}</div>
                      <div className="project-card-stats">
                        <span><CheckSquare size={14} /> {p._count?.tasks || 0} tasks</span>
                        <span><Users size={14} /> {p.owner?.name}</span>
                        {p.overdueCount > 0 && <span style={{color: 'var(--danger)'}}><AlertTriangle size={14} /> {p.overdueCount} overdue</span>}
                      </div>
                      <div className="project-card-progress">
                        <div className="project-card-progress-label">
                          <span>Progress</span>
                          <span>{p.progress}%</span>
                        </div>
                        <div className="progress-bar-container">
                          <div className="progress-bar-fill" style={{ width: `${p.progress}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FolderKanban size={40} />
                  <p>{user.role === 'Admin' ? 'No projects yet. Click "New Project" to get started!' : 'No projects available. Ask an Admin to create one.'}</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Board View (Project Tasks) */}
        {(view === 'board' || selectedProject) && (
          <>
            <div className="page-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}
                        onClick={() => { setSelectedProject(null); setView('dashboard'); }}>
                    Dashboard
                  </span>
                  <ChevronRight size={14} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>{currentProjectName}</span>
                </div>
                <h1>{currentProjectName}</h1>
                <p>{filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="page-header-actions">
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="form-input" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)}
                         style={{ paddingLeft: '2.25rem', width: 200 }} />
                </div>
                <button className="btn btn-primary" onClick={() => setShowTaskModal(true)} disabled={projects.length === 0}>
                  <Plus size={16} /> Add Task
                </button>
              </div>
            </div>

            {/* Kanban Board */}
            <div className="board-columns">
              {['Todo', 'In Progress', 'Done'].map(status => {
                const columnTasks = filteredTasks.filter(t => t.status === status);
                const dotClass = status === 'Todo' ? 'todo' : status === 'In Progress' ? 'progress' : 'done';
                return (
                  <div key={status} className="board-column">
                    <div className="board-column-header">
                      <div className="board-column-title">
                        <div className={`board-column-dot ${dotClass}`} />
                        {status}
                      </div>
                      <span className="board-column-count">{columnTasks.length}</span>
                    </div>
                    <div className="board-column-tasks">
                      {columnTasks.map(task => (
                        <div key={task.id} className="task-card" style={isOverdue(task) ? { borderColor: 'rgba(239,68,68,0.3)' } : {}}>
                          <div className="task-card-header">
                            <div className="task-card-title">{task.title}</div>
                            <div className="task-card-actions">
                              <button className="btn btn-ghost btn-sm" onClick={() => setShowDeleteModal({ type: 'task', id: task.id, name: task.title })}>
                                <Trash2 size={13} color="var(--danger)" />
                              </button>
                            </div>
                          </div>
                          {task.description && <div className="task-card-desc">{task.description}</div>}
                          <div className="task-card-footer">
                            <div className="task-card-meta">
                              <span className={`badge badge-${task.priority?.toLowerCase()}`}>
                                <Flag size={10} /> {task.priority}
                              </span>
                              {task.project && <span className="badge badge-project">{task.project.name}</span>}
                              {isOverdue(task) && <span className="badge badge-overdue"><AlertTriangle size={10} /> Overdue</span>}
                              {task.dueDate && !isOverdue(task) && (
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                                  <Calendar size={10} /> {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <select className="status-select" value={task.status} onChange={e => updateTaskStatus(task.id, e.target.value)}>
                              <option value="Todo">Todo</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Done">Done</option>
                            </select>
                          </div>
                          {task.assignee && (
                            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              <div style={{ width: 20, height: 20, borderRadius: 6, background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent-hover)' }}>
                                {task.assignee.name.charAt(0)}
                              </div>
                              {task.assignee.name}
                            </div>
                          )}
                        </div>
                      ))}
                      {columnTasks.length === 0 && (
                        <div className="empty-state">
                          <CheckSquare size={24} />
                          <p>No tasks</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ===== MODALS ===== */}

        {/* Create Project Modal */}
        {showProjectModal && (
          <div className="modal-overlay" onClick={() => setShowProjectModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create Project</h2>
                <button className="btn btn-ghost" onClick={() => setShowProjectModal(false)}><X size={18} /></button>
              </div>
              <form onSubmit={handleCreateProject}>
                <div className="form-group">
                  <label className="form-label">Project Name *</label>
                  <input className="form-input" placeholder="e.g. Website Redesign" required
                         value={projectForm.name} onChange={e => setProjectForm({ ...projectForm, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" placeholder="Brief description of the project..."
                            value={projectForm.description} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowProjectModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Project</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Task Modal */}
        {showTaskModal && (
          <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create Task</h2>
                <button className="btn btn-ghost" onClick={() => setShowTaskModal(false)}><X size={18} /></button>
              </div>
              <form onSubmit={handleCreateTask}>
                <div className="form-group">
                  <label className="form-label">Task Title *</label>
                  <input className="form-input" placeholder="e.g. Design new landing page" required
                         value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" placeholder="Describe the task..."
                            value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="form-select" value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <input type="date" className="form-input" value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Project</label>
                    <select className="form-select" value={taskForm.projectId || selectedProject || ''}
                            onChange={e => setTaskForm({ ...taskForm, projectId: e.target.value })}>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Assign To</label>
                    <select className="form-select" value={taskForm.assigneeId} onChange={e => setTaskForm({ ...taskForm, assigneeId: e.target.value })}>
                      <option value="">Unassigned</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Task</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="modal-overlay" onClick={() => setShowDeleteModal(null)}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--danger-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <Trash2 size={24} color="var(--danger)" />
                </div>
                <h2 style={{ marginBottom: '0.5rem' }}>Delete {showDeleteModal.type}?</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Are you sure you want to delete <strong>"{showDeleteModal.name}"</strong>? This action cannot be undone.
                  {showDeleteModal.type === 'project' && <><br />All tasks in this project will also be deleted.</>}
                </p>
              </div>
              <div className="modal-footer" style={{ justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDelete}><Trash2 size={14} /> Delete</button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Dashboard;
