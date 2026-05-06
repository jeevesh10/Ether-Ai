'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FolderKanban, Plus, MoreVertical, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/projects');
      setProjects(res.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    const fetchUsers = async () => {
      if (user?.role === 'ADMIN') {
        try {
          const res = await axios.get('http://localhost:5000/api/users');
          setUsers(res.data);
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      }
    };
    fetchUsers();
  }, [user]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/projects', {
        title: newProjectTitle,
        description: newProjectDesc,
        memberIds: selectedMembers
      });
      setIsModalOpen(false);
      setNewProjectTitle('');
      setNewProjectDesc('');
      setSelectedMembers([]);
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project');
    }
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center">Loading projects...</div>;
  }

  return (
    <div className="space-y-8 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-slate-400 mt-1">Manage and track your team's projects.</p>
        </div>
        
        {user?.role === 'ADMIN' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, idx) => (
          <motion.div 
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Link href={`/projects/${project.id}`}>
              <div className="glass-card p-6 rounded-2xl hover:border-blue-500/50 hover:shadow-blue-500/10 transition-all cursor-pointer h-full flex flex-col group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-slate-800 rounded-xl group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                    <FolderKanban className="w-6 h-6" />
                  </div>
                  <button className="text-slate-500 hover:text-slate-300 p-1" onClick={(e) => e.preventDefault()}>
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
                
                <h3 className="text-xl font-semibold mb-2 line-clamp-1">{project.title}</h3>
                <p className="text-slate-400 text-sm mb-6 flex-1 line-clamp-2">
                  {project.description || 'No description provided.'}
                </p>
                
                <div className="flex justify-between items-center text-sm text-slate-500 border-t border-slate-800 pt-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(project.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="bg-slate-800 px-3 py-1 rounded-full text-xs font-medium text-slate-300">
                    {project._count.tasks} Tasks
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-20 glass-card rounded-2xl">
          <FolderKanban className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-slate-300 mb-2">No projects found</h3>
          <p className="text-slate-500">
            {user?.role === 'ADMIN' ? 'Create a new project to get started.' : 'You have not been assigned to any projects yet.'}
          </p>
        </div>
      )}

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-md p-6 rounded-2xl border border-slate-700 shadow-2xl"
          >
            <h2 className="text-2xl font-bold mb-6 text-white">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Project Title</label>
                <input 
                  type="text" 
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description (Optional)</label>
                <textarea 
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white min-h-[80px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Assign Members</label>
                <div className="max-h-32 overflow-y-auto bg-slate-900/80 border border-slate-700 rounded-lg p-2 space-y-1 scrollbar-thin">
                  {users.filter(u => u.id !== user?.id).map((u) => (
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
                  {users.length <= 1 && (
                    <div className="text-xs text-slate-500 p-2">No other users found. Have them sign up first!</div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg shadow-blue-500/20"
                >
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
