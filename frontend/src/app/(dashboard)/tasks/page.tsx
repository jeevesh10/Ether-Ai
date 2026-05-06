'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { CheckSquare, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function MyTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/tasks');
        // Filter tasks assigned to current user
        const myTasks = res.data.filter((t: any) => t.assignedTo?.id === user?.id);
        setTasks(myTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user]);

  if (loading) {
    return <div className="flex h-full items-center justify-center">Loading tasks...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
          <p className="text-slate-400 mt-1">Tasks specifically assigned to you.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {tasks.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-2xl">
            <CheckSquare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-300 mb-2">No assigned tasks</h3>
            <p className="text-slate-500">You're all caught up! Enjoy your day.</p>
          </div>
        ) : (
          tasks.map((task, idx) => (
            <motion.div 
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card p-6 rounded-2xl flex items-center gap-6 group hover:border-blue-500/50 transition-colors"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                task.status === 'DONE' ? 'bg-green-500/20 text-green-400' :
                task.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
                'bg-slate-500/20 text-slate-400'
              }`}>
                {task.status === 'DONE' ? <CheckSquare className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-200">{task.title}</h3>
                <p className="text-slate-400 text-sm flex items-center gap-2 mt-1">
                  <span className="text-blue-400">{task.project.title}</span>
                  • 
                  {task.dueDate ? (
                    <span className={new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? 'text-red-400 flex items-center gap-1' : ''}>
                      {new Date(task.dueDate) < new Date() && task.status !== 'DONE' && <AlertCircle className="w-3 h-3" />}
                      Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                    </span>
                  ) : (
                    'No due date'
                  )}
                </p>
              </div>

              <div className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${
                task.priority === 'HIGH' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                task.priority === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                {task.priority}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
