import React, { useState } from 'react';
import { Automaton } from '../../types/automata';
import { checkEquivalence, EquivalenceCheckResult } from '../../algorithms/equivalenceCheck';
import { SAMPLES } from '../../data/samples';
import { X, Scale, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface EquivalenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAutomaton: Automaton;
}

export const EquivalenceModal: React.FC<EquivalenceModalProps> = ({
  isOpen,
  onClose,
  currentAutomaton,
}) => {
  const [selectedSampleId, setSelectedSampleId] = useState<string>(SAMPLES[0].id);
  const [checkResult, setCheckResult] = useState<EquivalenceCheckResult | null>(null);

  if (!isOpen) return null;

  const handleRunCheck = () => {
    const targetSample = SAMPLES.find(s => s.id === selectedSampleId);
    if (!targetSample) return;

    const res = checkEquivalence(currentAutomaton, targetSample.automaton);
    setCheckResult(res);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                Automata Equivalence Check
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Determine if two automata recognize the exact same language (L(M₁) = L(M₂)).
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
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Compare Current Automaton with:
            </label>
            <select
              value={selectedSampleId}
              onChange={(e) => {
                setSelectedSampleId(e.target.value);
                setCheckResult(null);
              }}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            >
              {SAMPLES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.automaton.type})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleRunCheck}
            className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors"
          >
            Run Equivalence Verification
          </button>

          {/* Results */}
          {checkResult && (
            <div className={`p-4 rounded-xl border animate-in fade-in duration-200 ${
              checkResult.areEquivalent
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100'
            }`}>
              <div className="flex items-start space-x-3">
                {checkResult.areEquivalent ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <h4 className="font-bold text-sm">
                    {checkResult.areEquivalent ? 'Equivalent Automata!' : 'Not Equivalent'}
                  </h4>
                  <p className="text-xs leading-relaxed opacity-90">
                    {checkResult.message}
                  </p>
                  {checkResult.counterexample !== undefined && (
                    <div className="mt-2 pt-2 border-t border-rose-200 dark:border-rose-800/80">
                      <span className="text-[11px] font-semibold uppercase tracking-wider block text-rose-700 dark:text-rose-300">
                        Distinguishing Counterexample:
                      </span>
                      <code className="text-xs font-mono font-bold bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-rose-300 dark:border-rose-700 mt-1 inline-block">
                        &quot;{checkResult.counterexample}&quot;
                      </code>
                    </div>
                  )}
                </div>
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
