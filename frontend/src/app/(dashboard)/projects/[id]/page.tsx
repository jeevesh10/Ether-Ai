'use client';

import React, { useEffect, useState, use } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Plus, MoreHorizontal, Calendar, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Kanban state
  const [todoTasks, setTodoTasks] = useState<any[]>([]);
  const [inProgressTasks, setInProgressTasks] = useState<any[]>([]);
  const [doneTasks, setDoneTasks] = useState<any[]>([]);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState('TODO');
  const [newTaskPriority, setNewTaskPriority] = useState('MEDIUM');
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('');

  // Manage members state
  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const fetchProject = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/projects/${projectId}`);
      setProject(res.data);
      
      const tasks = res.data.tasks || [];
      setTodoTasks(tasks.filter((t: any) => t.status === 'TODO'));
      setInProgressTasks(tasks.filter((t: any) => t.status === 'IN_PROGRESS'));
      setDoneTasks(tasks.filter((t: any) => t.status === 'DONE'));
      
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  useEffect(() => {
    if (user?.role === 'ADMIN' && isManageMembersOpen) {
      axios.get('http://localhost:5000/api/users').then(res => {
        setAllUsers(res.data);
        if (project) {
          setSelectedMembers(project.members.map((m: any) => m.id));
        }
      }).catch(err => console.error(err));
    }
  }, [user, isManageMembersOpen, project]);

  const handleUpdateMembers = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/projects/${projectId}`, {
        memberIds: selectedMembers
      });
      setIsManageMembersOpen(false);
      fetchProject();
    } catch (error) {
      console.error('Error updating members:', error);
      alert('Failed to update members');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/tasks', {
        title: newTaskTitle,
        description: newTaskDesc,
        status: newTaskStatus,
        priority: newTaskPriority,
        assignedToId: newTaskAssignedTo || null,
        projectId
      });
      setIsTaskModalOpen(false);
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskPriority('MEDIUM');
      setNewTaskAssignedTo('');
      fetchProject();
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await axios.put(`http://localhost:5000/api/tasks/${taskId}`, {
        status: newStatus
      });
      fetchProject();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const renderTaskCard = (task: any) => (
    <motion.div 
      key={task.id}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/50 hover:border-slate-500/50 transition-colors shadow-lg shadow-black/20 group cursor-pointer"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-slate-200">{task.title}</h4>
        <button className="text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      {task.description && (
        <p className="text-xs text-slate-400 mb-4 line-clamp-2">{task.description}</p>
      )}
      {task.assignedTo && (
        <div className="flex items-center gap-2 mb-2 text-xs text-slate-400">
          <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-white">
            {task.assignedTo.name.charAt(0)}
          </div>
          <span>{task.assignedTo.name}</span>
        </div>
      )}
      <div className="flex justify-between items-center mt-4">
        <div className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider ${
          task.priority === 'HIGH' ? 'bg-red-500/20 text-red-400' :
          task.priority === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-blue-500/20 text-blue-400'
        }`}>
          {task.priority}
        </div>
        
        {/* Status Actions */}
        <div className="flex gap-1">
          {task.status !== 'TODO' && (
             <button onClick={(e) => { e.stopPropagation(); handleUpdateTaskStatus(task.id, 'TODO'); }} className="text-xs px-2 py-1 bg-slate-700 rounded hover:bg-slate-600 text-slate-300 transition-colors">To Do</button>
          )}
          {task.status !== 'IN_PROGRESS' && (
             <button onClick={(e) => { e.stopPropagation(); handleUpdateTaskStatus(task.id, 'IN_PROGRESS'); }} className="text-xs px-2 py-1 bg-blue-600/50 rounded hover:bg-blue-500 text-blue-200 transition-colors">In Progress</button>
          )}
          {task.status !== 'DONE' && (
             <button onClick={(e) => { e.stopPropagation(); handleUpdateTaskStatus(task.id, 'DONE'); }} className="text-xs px-2 py-1 bg-green-600/50 rounded hover:bg-green-500 text-green-200 transition-colors">Done</button>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (loading) return <div className="flex h-full items-center justify-center">Loading board...</div>;
  if (!project) return <div className="flex h-full items-center justify-center">Project not found</div>;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/projects" className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
          <p className="text-slate-400 text-sm mt-1">{project.description}</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        {user?.role === 'ADMIN' && (
          <>
            <button 
              onClick={() => setIsTaskModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-purple-500/20"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
            <button 
              onClick={() => setIsManageMembersOpen(true)}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Manage Members
            </button>
          </>
        )}
        <div className="flex items-center gap-2 -space-x-2">
          {project.members.map((member: any) => (
            <div key={member.id} className="w-8 h-8 rounded-full bg-slate-700 border-2 border-[hsl(var(--background))] flex items-center justify-center text-xs font-bold" title={member.name}>
              {member.name.charAt(0)}
            </div>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {/* TODO Column */}
        <div className="flex-1 min-w-[320px] max-w-sm flex flex-col glass p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-400"></div>
              <h3 className="font-semibold text-slate-200">To Do</h3>
              <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">{todoTasks.length}</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
            {todoTasks.map(renderTaskCard)}
          </div>
        </div>

        {/* IN PROGRESS Column */}
        <div className="flex-1 min-w-[320px] max-w-sm flex flex-col glass p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <h3 className="font-semibold text-slate-200">In Progress</h3>
              <span className="text-xs bg-blue-500/20 px-2 py-0.5 rounded-full text-blue-400">{inProgressTasks.length}</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
            {inProgressTasks.map(renderTaskCard)}
          </div>
        </div>

        {/* DONE Column */}
        <div className="flex-1 min-w-[320px] max-w-sm flex flex-col glass p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <h3 className="font-semibold text-slate-200">Done</h3>
              <span className="text-xs bg-green-500/20 px-2 py-0.5 rounded-full text-green-400">{doneTasks.length}</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
            {doneTasks.map(renderTaskCard)}
          </div>
        </div>
      </div>

      {/* Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-md p-6 rounded-2xl border border-slate-700 shadow-2xl"
          >
            <h2 className="text-2xl font-bold mb-6 text-white">Add New Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Task Title</label>
                <input 
                  type="text" 
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea 
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white min-h-[80px]"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-300 mb-1">Priority</label>
                  <select 
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white appearance-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-300 mb-1">Assign To</label>
                  <select 
                    value={newTaskAssignedTo}
                    onChange={(e) => setNewTaskAssignedTo(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white appearance-none"
                  >
                    <option value="">Unassigned</option>
                    {project.members.map((member: any) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsTaskModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors shadow-lg shadow-purple-500/20"
                >
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Manage Members Modal */}
      {isManageMembersOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-md p-6 rounded-2xl border border-slate-700 shadow-2xl"
          >
            <h2 className="text-2xl font-bold mb-6 text-white">Manage Project Members</h2>
            <form onSubmit={handleUpdateMembers} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Select Members</label>
                <div className="max-h-60 overflow-y-auto bg-slate-900/80 border border-slate-700 rounded-lg p-2 space-y-1 scrollbar-thin">
                  {allUsers.filter(u => u.id !== user?.id).map((u) => (
                    <label key={u.id} className="flex items-center gap-2 p-2 hover:bg-slate-800 rounded cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-700 text-blue-500 focus:ring-blue-500 bg-slate-800"
                        checked={selectedMembers.includes(u.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMembers([...selectedMembers, u.id]);
                          } else {
                            setSelectedMembers(selectedMembers.filter(id => id !== u.id));
                          }
                        }}
                      />
                      <span className="text-sm text-slate-300">{u.name} <span className="text-slate-500 text-xs">({u.role})</span></span>
                    </label>
                  ))}
                  {allUsers.length <= 1 && (
                    <div className="text-xs text-slate-500 p-2">No other users found. Have them sign up first!</div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsManageMembersOpen(false)}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg shadow-blue-500/20"
                >
                  Save Members
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
