import React from 'react';
import { AlertTriangle, Download, RefreshCw } from 'lucide-react';

export default function GitCheckModal({ onRecheck }) {
  const handleDownload = () => {
    window.electronAPI?.openExternal('https://git-scm.com/downloads');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-8 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8 text-amber-400" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-100">Git is Not Installed</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            GitEasy requires <strong className="text-slate-200">Git</strong> installed on your computer to push code to GitHub. Don't worry—it's free and quick to install!
          </p>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 text-left text-xs text-slate-300 space-y-2">
          <p className="font-semibold text-slate-200">Instructions:</p>
          <ol className="list-decimal list-inside space-y-1 text-slate-400">
            <li>Click <strong>Download Git</strong> below to open the official installer page.</li>
            <li>Run the installer (accepting default options is recommended).</li>
            <li>Once installed, click <strong>Re-check System</strong>.</li>
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleDownload}
            className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Download Git</span>
          </button>

          <button
            onClick={onRecheck}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3 px-4 rounded-xl border border-slate-700 transition-all flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Re-check System</span>
          </button>
        </div>
      </div>
    </div>
  );
}
