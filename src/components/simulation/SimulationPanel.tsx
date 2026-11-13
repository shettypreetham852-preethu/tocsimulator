import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Automaton, BatchTestItem } from '../../types/automata';
import { SimulationStep } from '../../engine/types';
import { NFAConfigurations } from './NFAConfigurations';
import { TraceLog } from './TraceLog';
import { BatchTestTable } from './BatchTestTable';
import {
  CheckCircle2,
  XCircle,
  Activity,
  ListOrdered,
  FlaskConical,
} from 'lucide-react';

interface SimulationPanelProps {
  automaton: Automaton;
  steps: SimulationStep[];
  currentStepIndex: number;
  onSelectStep: (index: number) => void;
  inputString: string;
  testSuite: BatchTestItem[];
  onUpdateTestSuite: (suite: BatchTestItem[]) => void;
  onSelectInputForLiveSim: (input: string) => void;
}

export const SimulationPanel: React.FC<SimulationPanelProps> = ({
  automaton,
  steps,
  currentStepIndex,
  onSelectStep,
  testSuite,
  onUpdateTestSuite,
  onSelectInputForLiveSim,
}) => {
  const [activeTab, setActiveTab] = useState<'live' | 'batch' | 'trace'>('live');

  const currentStep = steps[currentStepIndex] || steps[0];
  const status = currentStep?.status || 'idle';

  // Trigger celebration on accept
  useEffect(() => {
    if (status === 'accepted') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6, x: 0.8 },
          disableForReducedMotion: true,
        });
      } catch (e) {
        // Ignored if canvas not ready
      }
    }
  }, [status, currentStepIndex]);

  return (
    <div className="w-80 md:w-96 flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-lg select-none">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40 p-1.5 space-x-1">
        <button
          type="button"
          onClick={() => setActiveTab('live')}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'live'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Simulation</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('batch')}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'batch'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Multiple Run</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('trace')}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'trace'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <ListOrdered className="w-3.5 h-3.5" />
          <span>Trace ({steps.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: LIVE SIMULATION */}
        {activeTab === 'live' && (
          <div className="space-y-4">
            {/* Status Banner */}
            {status === 'accepted' && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 animate-in fade-in slide-in-from-top-2 duration-200 shadow-xs">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">String Accepted</h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                      {currentStep?.message || currentStep?.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {status === 'rejected' && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100 animate-in fade-in slide-in-from-top-2 duration-200 shadow-xs">
                <div className="flex items-center space-x-2">
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">String Rejected</h4>
                    <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                      {currentStep?.message || currentStep?.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {status === 'running' && (
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100 text-xs shadow-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                  <span className="font-semibold">Simulating: {currentStep?.description}</span>
                </div>
              </div>
            )}

            {/* DFA Configuration Preview */}
            {automaton.type === 'DFA' && currentStep?.dfaConfig && (
              <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                <h5 className="font-semibold text-slate-700 dark:text-slate-300">Input Breakdown</h5>
                <div className="flex items-center space-x-2 font-mono text-xs">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded">
                    Consumed: &quot;{currentStep.dfaConfig.consumedInput}&quot;
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/60 px-2 py-1 rounded">
                    Remaining: &quot;{currentStep.dfaConfig.remainingInput}&quot;
                  </span>
                </div>
              </div>
            )}

            {/* NFA Configurations Preview */}
            {automaton.type === 'NFA' && currentStep?.nfaConfigs && (
              <NFAConfigurations
                configs={currentStep.nfaConfigs}
                states={automaton.states}
              />
            )}
          </div>
        )}

        {/* TAB 2: MULTIPLE RUN */}
        {activeTab === 'batch' && (
          <BatchTestTable
            automaton={automaton}
            testSuite={testSuite}
            onUpdateTestSuite={onUpdateTestSuite}
            onSelectInputForLiveSim={(str) => {
              onSelectInputForLiveSim(str);
              setActiveTab('live');
            }}
          />
        )}

        {/* TAB 3: TRACE LOG */}
        {activeTab === 'trace' && (
          <TraceLog
            steps={steps}
            currentStepIndex={currentStepIndex}
            onSelectStep={onSelectStep}
            states={automaton.states}
          />
        )}
      </div>
    </div>
  );
};
