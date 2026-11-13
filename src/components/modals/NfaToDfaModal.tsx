import React from 'react';
import { NFAToDFAResult } from '../../algorithms/nfaToDfa';
import { Automaton } from '../../types/automata';
import { X, ArrowRight, Download, Check } from 'lucide-react';

interface NfaToDfaModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: NFAToDFAResult | null;
  onLoadDfa: (dfa: Automaton) => void;
}

export const NfaToDfaModal: React.FC<NfaToDfaModalProps> = ({
  isOpen,
  onClose,
  result,
  onLoadDfa,
}) => {
  if (!isOpen || !result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
              NFA → DFA (Subset Construction)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Converted using powerset construction with ε-closure computation.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: Step Table */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 font-sans text-slate-500 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">DFA State</th>
                  <th className="py-2.5 px-3">NFA Subset</th>
                  {result.alphabet.map((sym) => (
                    <th key={sym} className="py-2.5 px-3">
                      δ(S, {sym})
                    </th>
                  ))}
                  <th className="py-2.5 px-3">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {result.table.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-750 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-indigo-600 dark:text-indigo-400">
                      {row.dfaStateLabel}
                    </td>
                    <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200 font-medium">
                      &#123;{row.nfaSubsetLabels.join(', ')}&#125;
                    </td>
                    {result.alphabet.map((sym) => (
                      <td key={sym} className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        {row.transitions[sym] || '∅'}
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
            Created {result.dfa.states.length} DFA states and {result.dfa.transitions.length} transitions.
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
                onLoadDfa(result.dfa);
                onClose();
              }}
              className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              <Check className="w-4 h-4 mr-1.5" />
              Load DFA to Canvas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
