import React, { useState } from 'react';
import { MachineType, Transition } from '../../types/automata';
import { EPSILON, formatTransitionLabel, normalizeEpsilon } from '../../utils/labelParser';
import { generateId } from '../../utils/idGenerator';
import { X, Plus, Trash2, ArrowRight } from 'lucide-react';

interface TransitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceStateLabel: string;
  targetStateLabel: string;
  fromStateId: string;
  toStateId: string;
  machineType: MachineType;
  existingTransitions: Transition[];
  onAddTransition: (t: Transition) => void;
  onDeleteTransition: (transitionId: string) => void;
}

export const TransitionModal: React.FC<TransitionModalProps> = ({
  isOpen,
  onClose,
  sourceStateLabel,
  targetStateLabel,
  fromStateId,
  toStateId,
  machineType,
  existingTransitions,
  onAddTransition,
  onDeleteTransition,
}) => {
  const [symbol, setSymbol] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const sym = normalizeEpsilon(symbol);
    if (machineType === 'DFA' && sym === EPSILON) {
      setError('DFA does not allow ε (epsilon) transitions.');
      return;
    }
    if (machineType === 'NFA' && sym === EPSILON) {
      setError('Standard NFA does not allow ε-transitions. Switch machine type to ε-NFA to use ε.');
      return;
    }

    const newTr: Transition = {
      id: generateId('tr'),
      from: fromStateId,
      to: toStateId,
      symbol: sym,
    };

    onAddTransition(newTr);
    setSymbol('');
  };

  const getMachineDisplay = () => {
    if (machineType === 'ENFA') return 'ε-NFA';
    return machineType;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center space-x-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
            <span>Transition:</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
              {sourceStateLabel}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
              {targetStateLabel}
            </span>
            <span className="text-xs font-normal text-slate-400">({getMachineDisplay()})</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Existing Transitions on this Edge */}
          {existingTransitions.length > 0 && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Existing Transitions ({existingTransitions.length})
              </label>
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {existingTransitions.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                  >
                    <span className="text-slate-800 dark:text-slate-200 font-medium">
                      {formatTransitionLabel(t, machineType)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onDeleteTransition(t.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                      title="Delete this transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Transition Form */}
          <form onSubmit={handleAdd} className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Add Symbol
            </label>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder={machineType === 'ENFA' ? 'e.g. 0, a, or ε' : 'e.g. 0 or a'}
                autoFocus
                className="flex-1 px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
              />
              {machineType === 'ENFA' && (
                <button
                  type="button"
                  onClick={() => setSymbol(EPSILON)}
                  className="px-3 py-2 text-xs font-mono font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                  title="Insert ε (epsilon)"
                >
                  {EPSILON}
                </button>
              )}
            </div>

            {/* Quick symbol shortcuts */}
            <div className="flex items-center space-x-1.5 text-xs text-slate-500">
              <span className="text-[11px] text-slate-400">Quick:</span>
              {['0', '1', 'a', 'b'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSymbol(s)}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-mono transition-colors"
                >
                  {s}
                </button>
              ))}
              {machineType === 'ENFA' && (
                <button
                  type="button"
                  onClick={() => setSymbol(EPSILON)}
                  className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-mono font-bold transition-colors"
                >
                  {EPSILON}
                </button>
              )}
            </div>

            {error && (
              <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">
                {error}
              </p>
            )}

            {/* Submit button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center py-2 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Transition
            </button>
          </form>

          {/* Done footer */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
