'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Shield, Users } from 'lucide-react';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading || user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Team Task Manager
        </div>
        <div className="space-x-4">
          <Link href="/login" className="text-slate-300 hover:text-white transition-colors">
            Log In
          </Link>
          <Link href="/signup" className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-20 pb-32 max-w-5xl mx-auto w-full">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8"
        >
          Manage tasks with <br className="hidden md:block"/>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
            unprecedented clarity
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-slate-400 mb-12 max-w-2xl"
        >
          A powerful, collaborative task management platform designed to help your team organize, track, and accomplish projects effortlessly.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link 
            href="/signup" 
            className="group px-8 py-4 bg-white text-black text-lg font-bold rounded-full hover:bg-slate-200 transition-all flex items-center gap-2"
          >
            Start for free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mt-32 text-left">
          <div className="glass p-6 rounded-2xl">
            <CheckCircle2 className="w-10 h-10 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
            <p className="text-slate-400">Monitor task statuses in real-time with intuitive dashboards and Kanban boards.</p>
          </div>
          <div className="glass p-6 rounded-2xl">
            <Users className="w-10 h-10 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Collaborate</h3>
            <p className="text-slate-400">Assign tasks, form teams, and work together seamlessly on complex projects.</p>
          </div>
          <div className="glass p-6 rounded-2xl">
            <Shield className="w-10 h-10 text-pink-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Secure RBAC</h3>
            <p className="text-slate-400">Enterprise-grade Role-Based Access Control to manage permissions securely.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
