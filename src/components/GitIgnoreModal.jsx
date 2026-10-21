import React, { useState } from 'react';
import { ShieldAlert, FileCode2, ArrowRight, X, ChevronDown, ChevronUp, Sparkles, Check } from 'lucide-react';

export default function GitIgnoreModal({ isOpen, folderPath, onAddAndUpload, onUploadWithout, onClose }) {
  const [showPreview, setShowPreview] = useState(false);

  if (!isOpen) return null;

  const folderName = folderPath
    ? folderPath.split(/[/\\]/).filter(Boolean).pop() || folderPath
    : 'Selected Folder';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          title="Cancel"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start space-x-4">
          <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center flex-shrink-0 text-amber-400">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-1 pr-6">
            <h3 className="text-xl font-bold text-slate-100">No .gitignore File Detected</h3>
            <p className="text-xs text-slate-400">
              Target folder: <span className="text-slate-200 font-mono font-medium">{folderName}</span>
            </p>
          </div>
        </div>

        {/* Informative Body */}
        <div className="space-y-3 text-sm text-slate-300 leading-relaxed bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4">
          <p>
            We noticed this folder does not have a <code className="text-amber-300 font-mono">.gitignore</code> file.
            Without one, Git will push everything inside this folder to GitHub, including:
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            <div className="flex items-center space-x-2 text-slate-300 bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
              <span><strong className="text-slate-100">node_modules/</strong> (large dependencies)</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300 bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
              <span><strong className="text-slate-100">.env</strong> (secret API keys & tokens)</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300 bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span><strong className="text-slate-100">dist/ & build/</strong> (generated files)</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300 bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span><strong className="text-slate-100">.DS_Store & Thumbs</strong> (OS files)</span>
            </div>
          </div>
        </div>

        {/* Collapsible Preview */}
        <div className="border border-slate-800 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-850/60 hover:bg-slate-800/80 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <span className="flex items-center space-x-2">
              <FileCode2 className="w-4 h-4 text-sky-400" />
              <span>Preview rules to be added to .gitignore</span>
            </span>
            {showPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showPreview && (
            <div className="p-3 bg-slate-950 font-mono text-[11px] text-slate-400 max-h-40 overflow-y-auto space-y-1 border-t border-slate-800">
              <p className="text-slate-500"># Common standard ignore patterns:</p>
              <p>node_modules/ &bull; dist/ &bull; build/ &bull; out/ &bull; release/</p>
              <p>.env &bull; .env.local &bull; *.env &bull; .env.*.local</p>
              <p>*.log &bull; npm-debug.log* &bull; yarn-error.log*</p>
              <p>.cache/ &bull; .vite/ &bull; temp/ &bull; tmp/ &bull; coverage/</p>
              <p>.vscode/* &bull; .idea/ &bull; *.swp</p>
              <p>.DS_Store &bull; Thumbs.db &bull; desktop.ini</p>
              <p>venv/ &bull; .venv/ &bull; __pycache__/ &bull; *.pyc</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={onAddAndUpload}
            className="w-full bg-gradient-to-r from-sky-500 via-indigo-600 to-sky-500 hover:from-sky-400 hover:to-indigo-500 text-white font-bold py-3.5 px-6 rounded-2xl shadow-xl shadow-sky-500/20 transition-all flex items-center justify-center space-x-2 text-base group"
          >
            <Sparkles className="w-5 h-5 text-sky-200" />
            <span>Add .gitignore & Upload to GitHub</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="flex gap-3">
            <button
              onClick={onUploadWithout}
              className="flex-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-medium py-2.5 px-4 rounded-xl border border-slate-700/80 transition-all text-xs"
            >
              Upload Without .gitignore
            </button>

            <button
              onClick={onClose}
              className="bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-medium py-2.5 px-4 rounded-xl transition-all text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
