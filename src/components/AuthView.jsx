import React, { useState } from 'react';
import { Github, Key, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function AuthView({ onAuthenticate }) {
  const [tokenInput, setTokenInput] = useState('');
  const [showPatInput, setShowPatInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleOAuthLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const tokenUrl = 'https://github.com/settings/tokens/new?scopes=repo,user&description=GitEasyDesktopApp';
      if (window.electronAPI?.openExternal) {
        await window.electronAPI.openExternal(tokenUrl);
      } else {
        window.open(tokenUrl, '_blank');
      }
      setShowPatInput(true);
    } catch (err) {
      setError(err.message || 'Failed to open browser for GitHub sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handlePatSubmit = async (e) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const token = tokenInput.trim();
      await window.electronAPI?.saveToken(token);
      onAuthenticate(token);
    } catch (err) {
      setError('Failed to save personal access token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-6 text-center space-y-8">
      <div className="space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-500/30 text-sky-400 mb-2 shadow-inner">
          <Github className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-100">Welcome to GitEasy</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          Upload your local code projects to GitHub in seconds—no command line or technical setup required.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-xs text-left">
          {error}
        </div>
      )}

      {!showPatInput ? (
        <div className="space-y-4">
          <button
            onClick={handleOAuthLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center space-x-3 text-base"
          >
            <Github className="w-5 h-5" />
            <span>{loading ? 'Opening Browser...' : 'Sign in with GitHub'}</span>
          </button>

          <div className="pt-2">
            <button
              onClick={() => setShowPatInput(true)}
              className="text-xs text-slate-400 hover:text-sky-400 transition-colors flex items-center justify-center space-x-1 mx-auto"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Enter GitHub Token Manually</span>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handlePatSubmit} className="space-y-4 text-left bg-slate-800/50 p-5 border border-slate-700/60 rounded-2xl">
          <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-3 text-xs text-sky-200 space-y-1">
            <p className="font-semibold text-sky-300">Quick 3-Step Setup:</p>
            <ol className="list-decimal list-inside space-y-1 text-slate-300">
              <li>GitHub token generator was opened in your browser (with <code className="bg-slate-900 px-1 py-0.5 rounded text-sky-300">repo</code> pre-selected).</li>
              <li>Click <strong>Generate token</strong> at the bottom of GitHub's page.</li>
              <li>Copy and paste your token below:</li>
            </ol>
          </div>

          <div className="flex justify-between items-center pt-1">
            <label className="text-xs font-semibold text-slate-300">GitHub Access Token</label>
            <button
              type="button"
              onClick={handleOAuthLogin}
              className="text-xs text-sky-400 hover:text-sky-300 underline flex items-center space-x-1"
            >
              <span>Re-open GitHub in Browser</span>
            </button>
          </div>
          <input
            type="password"
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
          <button
            type="submit"
            disabled={loading || !tokenInput.trim()}
            className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-xl transition-all flex items-center justify-center space-x-2 text-sm"
          >
            <span>Continue with Token</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      <div className="grid grid-cols-2 gap-3 pt-4 text-xs text-slate-400 border-t border-slate-800/80">
        <div className="flex items-center space-x-2 bg-slate-800/30 p-2.5 rounded-lg border border-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Stored securely locally</span>
        </div>
        <div className="flex items-center space-x-2 bg-slate-800/30 p-2.5 rounded-lg border border-slate-800">
          <Sparkles className="w-4 h-4 text-sky-400 flex-shrink-0" />
          <span>One-click upload flow</span>
        </div>
      </div>
    </div>
  );
}
