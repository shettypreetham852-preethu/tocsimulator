import React from 'react';
import { EpsilonRemovalResult } from '../../algorithms/epsilonRemoval';
import { Automaton } from '../../types/automata';
import { X, Check, Wand2 } from 'lucide-react';

interface EpsilonRemovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: EpsilonRemovalResult | null;
  onLoadNfa: (nfa: Automaton) => void;
}

export const EpsilonRemovalModal: React.FC<EpsilonRemovalModalProps> = ({
  isOpen,
  onClose,
  result,
  onLoadNfa,
}) => {
  if (!isOpen || !result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center space-x-2">
            <Wand2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                ε-NFA → NFA (ε-Removal)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Eliminates ε-transitions via formula: δ&apos;(q, a) = ε-closure( δ( ε-closure(q), a ) )
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
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="p-3 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-800 dark:text-indigo-200">
            Eliminated {result.removedEpsilonCount} ε-transition(s). Preserved language equivalence.
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 font-sans text-slate-500 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">State</th>
                  <th className="py-2.5 px-3">ε-Closure</th>
                  {result.alphabet.map((sym) => (
                    <th key={sym} className="py-2.5 px-3">
                      δ&apos;(q, {sym})
                    </th>
                  ))}
                  <th className="py-2.5 px-3">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {result.table.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-750 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-indigo-600 dark:text-indigo-400">
                      {row.stateLabel}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                      &#123;{row.epsilonClosureLabels.join(', ')}&#125;
                    </td>
                    {result.alphabet.map((sym) => (
                      <td key={sym} className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        {row.transitions[sym] ? `\{${row.transitions[sym].join(', ')}\}` : '∅'}
                      </td>
                    ))}
                    <td className="py-2.5 px-3">
                      <div className="flex space-x-1">
                        {row.isInitial && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-sans font-semibold">
                            Start
                          </span>
                        )}
                        {row.isFinal && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-sans font-semibold">
                            Accept
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
          <span className="text-xs text-slate-500 font-sans">
            Resulting NFA has {result.nfa.states.length} states and {result.nfa.transitions.length} transitions (0 ε-transitions).
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
                onLoadNfa(result.nfa);
                onClose();
              }}
              className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              <Check className="w-4 h-4 mr-1.5" />
              Load NFA to Canvas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
