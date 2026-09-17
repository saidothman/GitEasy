import React, { useState, useEffect } from 'react';
import { Octokit } from '@octokit/rest';
import { FolderGit2, Plus, Lock, Globe, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RepoSelector({ token, selectedRepo, onSelectRepo }) {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Create New Repo modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoDesc, setNewRepoDesc] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchRepos = async () => {
    setLoading(true);
    setError(null);
    try {
      const octokit = new Octokit({ auth: token });
      const response = await octokit.rest.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 100,
      });
      setRepos(response.data);
    } catch (err) {
      console.error('Failed to fetch repos:', err);
      setError('Failed to fetch repositories from GitHub. Please check your network or token permissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRepos();
    }
  }, [token]);

  const handleCreateRepo = async (e) => {
    e.preventDefault();
    if (!newRepoName.trim()) return;

    setCreating(true);
    setError(null);
    try {
      const octokit = new Octokit({ auth: token });
      const response = await octokit.rest.repos.createForAuthenticatedUser({
        name: newRepoName.trim(),
        description: newRepoDesc.trim(),
        private: isPrivate,
        auto_init: false, // Leave empty so git pipeline can push initial commit cleanly
      });

      const createdRepo = response.data;
      setRepos((prev) => [createdRepo, ...prev]);
      onSelectRepo(createdRepo);
      setShowCreateModal(false);
      setNewRepoName('');
      setNewRepoDesc('');
    } catch (err) {
      console.error('Failed to create repository:', err);
      setError(err.message || 'Failed to create new repository on GitHub.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
          <FolderGit2 className="w-4 h-4 text-sky-400" />
          <span>Step 2: Select Target GitHub Repository</span>
        </label>
        <button
          type="button"
          onClick={fetchRepos}
          disabled={loading}
          className="text-xs text-slate-400 hover:text-sky-400 transition-colors flex items-center space-x-1"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <select
            value={selectedRepo ? selectedRepo.full_name : ''}
            onChange={(e) => {
              const selected = repos.find((r) => r.full_name === e.target.value);
              onSelectRepo(selected || null);
            }}
            disabled={loading}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 appearance-none focus:outline-none focus:border-sky-500 disabled:opacity-50"
          >
            <option value="">-- Choose an existing repository --</option>
            {repos.map((repo) => (
              <option key={repo.id} value={repo.full_name}>
                {repo.private ? '🔒 ' : '🌐 '} {repo.name} ({repo.owner.login})
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 font-medium px-4 py-3 rounded-xl transition-all flex items-center space-x-2 text-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Create New</span>
        </button>
      </div>

      {selectedRepo && (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Target: <strong className="text-slate-100">{selectedRepo.full_name}</strong></span>
          </div>
          <span className="flex items-center space-x-1 text-slate-400 bg-slate-900/60 px-2 py-1 rounded">
            {selectedRepo.private ? <Lock className="w-3 h-3 text-amber-400" /> : <Globe className="w-3 h-3 text-sky-400" />}
            <span>{selectedRepo.private ? 'Private' : 'Public'}</span>
          </span>
        </div>
      )}

      {/* Create New Repo Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                <Plus className="w-5 h-5 text-sky-400" />
                <span>Create New GitHub Repository</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRepo} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Repository Name *</label>
                <input
                  type="text"
                  placeholder="my-awesome-project"
                  value={newRepoName}
                  onChange={(e) => setNewRepoName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="A cool project created with GitEasy"
                  value={newRepoDesc}
                  onChange={(e) => setNewRepoDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center space-x-3 bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  id="privacy"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                />
                <label htmlFor="privacy" className="text-xs text-slate-300 cursor-pointer flex items-center space-x-1.5">
                  {isPrivate ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Globe className="w-3.5 h-3.5 text-sky-400" />}
                  <span>Make repository private</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newRepoName.trim()}
                  className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-all flex items-center space-x-2"
                >
                  <span>{creating ? 'Creating...' : 'Create & Select'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
