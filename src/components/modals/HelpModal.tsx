import React from 'react';
import { X, HelpCircle, BookOpen, Keyboard } from 'lucide-react';
import { EPSILON } from '../../utils/labelParser';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                TOC Simulator &mdash; Quick Guide & Syntax Reference
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Transition notation, keyboard shortcuts, and JFLAP compatibility.
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700 dark:text-slate-300">
          {/* Transition Syntax */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 font-bold text-slate-800 dark:text-slate-100 text-sm">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span>Transition Label Syntax</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <h5 className="font-bold text-slate-900 dark:text-slate-100">Deterministic FA (DFA)</h5>
                <p className="text-slate-500 text-[11px]">Format: Single symbol from alphabet</p>
                <div className="font-mono text-[11px] bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700 space-y-1">
                  <div>• <code className="text-indigo-600 dark:text-indigo-400 font-bold">0</code> or <code className="text-indigo-600 dark:text-indigo-400 font-bold">1</code></div>
                  <div>• <code className="text-indigo-600 dark:text-indigo-400 font-bold">a</code> or <code className="text-indigo-600 dark:text-indigo-400 font-bold">b</code></div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <h5 className="font-bold text-slate-900 dark:text-slate-100">Non-Deterministic FA (NFA)</h5>
                <p className="text-slate-500 text-[11px]">Format: Single symbol or ε (epsilon)</p>
                <div className="font-mono text-[11px] bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700 space-y-1">
                  <div>• <code className="text-indigo-600 dark:text-indigo-400 font-bold">0</code>, <code className="text-indigo-600 dark:text-indigo-400 font-bold">1</code>, <code className="text-indigo-600 dark:text-indigo-400 font-bold">a</code></div>
                  <div>• <code className="text-indigo-600 dark:text-indigo-400 font-bold">{EPSILON}</code> (or <code className="text-indigo-600 dark:text-indigo-400 font-bold">λ</code>, <code className="text-indigo-600 dark:text-indigo-400 font-bold">eps</code>)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Canvas Controls */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 font-bold text-slate-800 dark:text-slate-100 text-sm">
              <Keyboard className="w-4 h-4 text-indigo-500" />
              <span>Canvas Editing & Shortcuts</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <strong className="text-slate-900 dark:text-slate-100">Double-click State:</strong>
                <p className="text-slate-500 text-[11px] mt-0.5">Rename state, toggle Initial (Start) or Final (Accepting) double circle.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <strong className="text-slate-900 dark:text-slate-100">Double-click Transition:</strong>
                <p className="text-slate-500 text-[11px] mt-0.5">Edit or add multiple parallel transition labels on the same edge.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <strong className="text-slate-900 dark:text-slate-100">Self-Loop:</strong>
                <p className="text-slate-500 text-[11px] mt-0.5">Drag connection from a node handle back to itself to create a self-loop arc.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <strong className="text-slate-900 dark:text-slate-100">Undo / Redo:</strong>
                <p className="text-slate-500 text-[11px] mt-0.5"><code className="font-mono">Ctrl+Z</code> to undo, <code className="font-mono">Ctrl+Y</code> to redo.</p>
              </div>
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
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
