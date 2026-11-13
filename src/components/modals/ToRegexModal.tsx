import React, { useState } from 'react';
import { ToRegexResult } from '../../algorithms/toRegex';
import { X, Copy, Check, Binary } from 'lucide-react';

interface ToRegexModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ToRegexResult | null;
}

export const ToRegexModal: React.FC<ToRegexModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !result) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(result.regex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center space-x-2">
            <Binary className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                Automaton → Regular Expression
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Computed via Generalized NFA (GNFA) State Elimination.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Resulting Regex Box */}
          <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
              Equivalent Regular Expression:
            </span>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-base font-bold text-indigo-900 dark:text-indigo-100 break-all select-all">
                {result.regex}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 inline-flex items-center px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Elimination Steps */}
          {result.steps.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                State Elimination Sequence
              </h4>
              <div className="space-y-1.5">
                {result.steps.map((st) => (
                  <div
                    key={st.stepNumber}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-400">
                        #{st.stepNumber}
                      </span>
                      <span className="text-slate-700 dark:text-slate-300">
                        Eliminated state <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{st.eliminatedStateLabel}</span>
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-500">
                      Remaining: {st.remainingStates.length > 0 ? st.remainingStates.join(', ') : '∅'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-200/60 dark:bg-slate-700 hover:bg-slate-300/60 dark:hover:bg-slate-600 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
