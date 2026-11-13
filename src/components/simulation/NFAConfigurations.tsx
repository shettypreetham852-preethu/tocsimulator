import React from 'react';
import { NFAActiveBranch } from '../../engine/types';
import { GitBranch } from 'lucide-react';
import { State } from '../../types/automata';

interface NFAConfigurationsProps {
  configs: NFAActiveBranch[];
  states: State[];
}

export const NFAConfigurations: React.FC<NFAConfigurationsProps> = ({ configs, states }) => {
  const stateMap = new Map(states.map(s => [s.id, s]));

  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <GitBranch className="w-3.5 h-3.5 text-indigo-500" />
          <span>Active Configurations ({configs.length})</span>
        </div>
      </div>

      {configs.length === 0 ? (
        <p className="text-xs text-rose-500 dark:text-rose-400 italic">
          All computation branches died (trapped/no transitions).
        </p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {configs.map((c, idx) => {
            const st = stateMap.get(c.stateId);
            const isFinal = st?.isFinal;

            return (
              <div
                key={idx}
                className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs shadow-2xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                      {st?.label || c.stateId}
                    </span>
                    {isFinal && (
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded">
                        Accepting State
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-slate-500 text-[11px]">
                    Remaining: &quot;{c.remainingInput || 'ε'}&quot;
                  </span>
                </div>
                {c.path.length > 1 && (
                  <div className="text-[10px] text-slate-400 font-mono truncate" title={c.path.join(' → ')}>
                    Path: {c.path.join(' → ')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
