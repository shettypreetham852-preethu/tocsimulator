import React from 'react';
import { SimulationStep } from '../../engine/types';
import { State } from '../../types/automata';
import { CheckCircle2, XCircle, AlertCircle, PlayCircle } from 'lucide-react';

interface TraceLogProps {
  steps: SimulationStep[];
  currentStepIndex: number;
  onSelectStep: (index: number) => void;
  states: State[];
}

export const TraceLog: React.FC<TraceLogProps> = ({
  steps,
  currentStepIndex,
  onSelectStep,
  states,
}) => {
  const stateMap = new Map(states.map(s => [s.id, s]));

  const getStatusIcon = (status: SimulationStep['status']) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
      case 'rejected':
        return <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
      default:
        return <PlayCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
    }
  };

  return (
    <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
      {steps.map((step, idx) => {
        const isCurrent = idx === currentStepIndex;
        const stateLabels = step.activeStateIds
          .map(id => stateMap.get(id)?.label || id)
          .join(', ');

        return (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectStep(idx)}
            className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs ${
              isCurrent
                ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-600 shadow-xs'
                : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-1.5 font-medium">
                {getStatusIcon(step.status)}
                <span className={`font-mono ${isCurrent ? 'font-bold text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                  Step {step.stepIndex}
                </span>
              </div>
              {stateLabels && (
                <span className="font-mono text-[11px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  {stateLabels}
                </span>
              )}
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              {step.description}
            </p>
          </button>
        );
      })}
    </div>
  );
};
