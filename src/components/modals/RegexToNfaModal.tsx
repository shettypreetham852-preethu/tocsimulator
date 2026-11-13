import React, { useState } from 'react';
import { buildNfaFromRegex } from '../../algorithms/regexToNfa';
import { Automaton } from '../../types/automata';
import { X, Wand2, Check, ArrowRight } from 'lucide-react';
import { EPSILON } from '../../utils/labelParser';

interface RegexToNfaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadNfa: (nfa: Automaton) => void;
}

export const RegexToNfaModal: React.FC<RegexToNfaModalProps> = ({
  isOpen,
  onClose,
  onLoadNfa,
}) => {
  const [regexInput, setRegexInput] = useState('(a|b)*abb');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConvert = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    try {
      const nfa = buildNfaFromRegex(regexInput);
      onLoadNfa(nfa);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid regular expression format.');
    }
  };

  const insertToken = (token: string) => {
    setRegexInput((prev) => prev + token);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center space-x-2">
            <Wand2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                Regex → NFA (Thompson&apos;s Construction)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Construct an ε-NFA directly from a regular expression.
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

        {/* Form */}
        <form onSubmit={handleConvert} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Regular Expression
            </label>
            <input
              type="text"
              value={regexInput}
              onChange={(e) => setRegexInput(e.target.value)}
              placeholder="e.g. (a|b)*abb or 0(0|1)*1"
              autoFocus
              className="w-full px-3.5 py-2.5 text-base font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Quick Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] text-slate-400 mr-1">Insert:</span>
            {['(', ')', '|', '*', '+', '?', EPSILON, 'a', 'b', '0', '1'].map((sym) => (
              <button
                key={sym}
                type="button"
                onClick={() => insertToken(sym)}
                className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-mono transition-colors"
              >
                {sym}
              </button>
            ))}
          </div>

          {/* Preset Samples */}
          <div>
            <span className="text-[11px] text-slate-400 block mb-1.5">Presets:</span>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {[
                '(a|b)*abb',
                '(0|1)*01',
                'a*b*',
                '(a|b)(a|b)*',
                '0*10*10*',
              ].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setRegexInput(p)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-mono transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">
              {error}
            </p>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              <Check className="w-4 h-4 mr-1.5" />
              Build & Load NFA
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
