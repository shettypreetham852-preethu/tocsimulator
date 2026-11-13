import React, { useState, useEffect } from 'react';
import { State } from '../../types/automata';
import { X, Trash2, Check } from 'lucide-react';

interface StateEditModalProps {
  state: State | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedState: State) => void;
  onDelete: (stateId: string) => void;
}

export const StateEditModal: React.FC<StateEditModalProps> = ({
  state,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [label, setLabel] = useState('');
  const [isInitial, setIsInitial] = useState(false);
  const [isFinal, setIsFinal] = useState(false);

  useEffect(() => {
    if (state) {
      setLabel(state.label);
      setIsInitial(state.isInitial);
      setIsFinal(state.isFinal);
    }
  }, [state]);

  if (!isOpen || !state) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...state,
      label: label.trim() || state.label,
      isInitial,
      isFinal,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
            Edit State <span className="text-indigo-600 dark:text-indigo-400 font-mono">({state.label})</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
              State Label
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. q0, accept"
              autoFocus
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="space-y-2.5 pt-1">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={isInitial}
                onChange={(e) => setIsInitial(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Initial State (Start)
              </span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={isFinal}
                onChange={(e) => setIsFinal(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Final / Accepting State (Double Circle)
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                onDelete(state.id);
                onClose();
              }}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Delete State
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
