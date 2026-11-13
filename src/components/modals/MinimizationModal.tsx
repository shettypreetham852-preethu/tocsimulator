import React from 'react';
import { MinimizationResult } from '../../algorithms/dfaMinimizer';
import { Automaton } from '../../types/automata';
import { X, Check, Minimize2, Sparkles } from 'lucide-react';

interface MinimizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: MinimizationResult | null;
  onLoadMinimizedDfa: (dfa: Automaton) => void;
}

export const MinimizationModal: React.FC<MinimizationModalProps> = ({
  isOpen,
  onClose,
  result,
  onLoadMinimizedDfa,
}) => {
  if (!isOpen || !result) return null;

  const reduction = result.originalStateCount - result.minimizedStateCount;
  const reductionPercent = Math.round((reduction / result.originalStateCount) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center space-x-2">
            <Minimize2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                DFA Minimization (Hopcroft Algorithm)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Equivalent state partition refinement and unreachable state elimination.
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
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500">Original States</span>
              <p className="text-xl font-bold font-mono text-slate-800 dark:text-slate-100 mt-0.5">
                {result.originalStateCount}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500">Minimized States</span>
              <p className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                {result.minimizedStateCount}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500">Reduction</span>
              <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                {reduction > 0 ? `-${reduction} (${reductionPercent}%)` : 'Already Minimal'}
              </p>
            </div>
          </div>

          {result.removedUnreachableCount > 0 && (
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs">
              Removed {result.removedUnreachableCount} unreachable state(s) before minimization.
            </div>
          )}

          {/* Partition Steps */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Partition Refinement Steps
            </h4>
            <div className="space-y-2">
              {result.steps.map((st) => (
                <div
                  key={st.step}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5"
                >
                  <p className="font-semibold text-slate-700 dark:text-slate-300">
                    {st.description}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1 font-mono">
                    {st.groups.map((group, gIdx) => (
                      <span
                        key={gIdx}
                        className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs shadow-2xs"
                      >
                        &#123;{group.join(', ')}&#125;
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
          <span className="text-xs text-slate-500 font-sans">
            Minimal DFA has {result.minimizedDfa.states.length} states.
          </span>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onLoadMinimizedDfa(result.minimizedDfa);
                onClose();
              }}
              className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              <Check className="w-4 h-4 mr-1.5" />
              Load Minimized DFA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
