import React from 'react';
import { CheckCircle, AlertCircle, Loader2, Circle, AlertTriangle } from 'lucide-react';
import { translateGitError } from '../utils/errorTranslator';

export default function ProgressTracker({ steps, activeStepIndex, rawError, onRetry }) {
  const isFailed = rawError !== null;
  const translatedError = rawError ? translateGitError(rawError) : null;

  return (
    <div className="space-y-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100">Upload Progress</h3>
          <p className="text-xs text-slate-400">Step-by-step Git execution status</p>
        </div>
        {isFailed && (
          <button
            onClick={onRetry}
            className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
          >
            Try Again
          </button>
        )}
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {steps.map((step, idx) => {
          let status = 'pending';
          if (idx < activeStepIndex) status = 'success';
          else if (idx === activeStepIndex && !isFailed) status = 'in-progress';
          else if (idx === activeStepIndex && isFailed) status = 'error';

          return (
            <div
              key={idx}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                status === 'in-progress'
                  ? 'bg-sky-500/10 border-sky-500/30 text-sky-200'
                  : status === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                  : status === 'error'
                  ? 'bg-red-500/10 border-red-500/30 text-red-300'
                  : 'bg-slate-850 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center space-x-3">
                {status === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
                {status === 'in-progress' && <Loader2 className="w-5 h-5 text-sky-400 animate-spin flex-shrink-0" />}
                {status === 'error' && <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
                {status === 'pending' && <Circle className="w-5 h-5 text-slate-600 flex-shrink-0" />}

                <span className="text-sm font-medium">{step.title}</span>
              </div>

              <span className="text-xs font-semibold capitalize px-2.5 py-0.5 rounded-full bg-slate-900/60">
                {status === 'in-progress' ? 'Running' : status}
              </span>
            </div>
          );
        })}
      </div>

      {/* Error Card */}
      {isFailed && translatedError && (
        <div className="bg-red-950/40 border border-red-800/60 rounded-xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-red-400 font-semibold text-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>Upload Issue Detected</span>
          </div>
          <p className="text-xs text-red-200 leading-relaxed pl-7">
            {translatedError}
          </p>
          <details className="pt-2 pl-7">
            <summary className="text-[11px] text-red-400/80 cursor-pointer hover:underline">
              Show technical error logs
            </summary>
            <pre className="mt-2 text-[10px] bg-slate-950 p-2.5 rounded text-red-300 overflow-x-auto font-mono max-h-32">
              {rawError}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
