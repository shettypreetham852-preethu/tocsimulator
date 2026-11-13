import React from 'react';
import { Automaton } from '../../types/automata';
import { classifyAutomaton } from '../../algorithms/automatonClassifier';
import { X, SearchCheck, CheckCircle2 } from 'lucide-react';

interface ClassifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  automaton: Automaton;
}

export const ClassifierModal: React.FC<ClassifierModalProps> = ({
  isOpen,
  onClose,
  automaton,
}) => {
  if (!isOpen) return null;

  const report = classifyAutomaton(automaton);

  const getDisplayClass = () => {
    if (report.classification === 'ENFA') return 'ε-NFA (Non-deterministic with ε)';
    if (report.classification === 'NFA') return 'NFA (Non-deterministic without ε)';
    return 'DFA (Deterministic Finite Automaton)';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center space-x-2">
            <SearchCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                Automaton Classifier (DFA vs NFA vs ε-NFA)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Analyze determinism, branching, and presence of ε-transitions.
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
        <div className="p-6 space-y-4">
          {/* Classification Banner */}
          <div className={`p-4 rounded-xl border flex items-center space-x-3 ${
            report.isDFA
              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100'
              : report.isENFA
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100'
              : 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-100'
          }`}>
            <CheckCircle2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <div>
              <h4 className="font-bold text-base">
                {getDisplayClass()}
              </h4>
              <p className="text-xs opacity-90 mt-0.5">
                {report.isDFA
                  ? 'Strict Deterministic: Exactly 1 transition per symbol per state, and no ε-transitions.'
                  : report.isENFA
                  ? 'Contains ε-transitions permitting state changes without consuming input.'
                  : 'Contains non-deterministic multi-transitions on the same symbol, but zero ε-transitions.'}
              </p>
            </div>
          </div>

          {/* Diagnostic Reasons */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Diagnostics & Findings
            </h5>
            <ul className="space-y-2">
              {report.reasons.map((r, idx) => (
                <li
                  key={idx}
                  className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-300 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                >
                  <span className="font-mono text-indigo-500 font-bold">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">States</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
                {automaton.states.length}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Transitions</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
                {automaton.transitions.length}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Alphabet</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
                {report.alphabet.length > 0 ? `{${report.alphabet.join(',')}}` : '∅'}
              </span>
            </div>
          </div>
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
