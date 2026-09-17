import React from 'react';
import { GitBranch, LogOut, User } from 'lucide-react';

export default function Header({ user, onSignOut }) {
  return (
    <header className="border-b border-slate-800 bg-slate-950/60 backdrop-blur px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="bg-gradient-to-tr from-sky-500 to-indigo-600 p-2 rounded-xl shadow-lg shadow-sky-500/20">
          <GitBranch className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-sky-400 to-indigo-300 bg-clip-text text-transparent">
            GitEasy
          </h1>
          <p className="text-xs text-slate-400">Desktop GitHub Uploader for Beginners</p>
        </div>
      </div>

      {user && (
        <div className="flex items-center space-x-4 bg-slate-800/60 border border-slate-700/60 rounded-full px-4 py-1.5">
          <img
            src={user.avatar_url || 'https://github.com/github.png'}
            alt={user.login}
            className="w-7 h-7 rounded-full border border-slate-600"
          />
          <span className="text-sm font-medium text-slate-200">@{user.login}</span>
          <button
            onClick={onSignOut}
            title="Sign Out"
            className="text-slate-400 hover:text-red-400 transition-colors p-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
}
