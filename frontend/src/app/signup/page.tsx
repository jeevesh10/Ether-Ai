'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import Link from 'next/link';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', {
        name,
        email,
        password,
        role
      });
      
      login(response.data.token, response.data.user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card w-full max-w-md p-8 rounded-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
            Join the Team
          </h1>
          <p className="text-slate-400 mt-2">Create your account to get started</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-100 transition-all"
              placeholder="John Doe"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-100 transition-all"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-100 transition-all"
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-100 transition-all appearance-none"
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 rounded-lg shadow-lg shadow-purple-500/30 transition-all disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-slate-400 mt-8 text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors">
            Log in here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
