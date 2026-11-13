import React, { useState } from 'react';
import { BatchTestItem, Automaton } from '../../types/automata';
import { runSimulation } from '../../engine/simulationRunner';
import { Play, Plus, Trash2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { generateId } from '../../utils/idGenerator';

interface BatchTestTableProps {
  automaton: Automaton;
  testSuite: BatchTestItem[];
  onUpdateTestSuite: (suite: BatchTestItem[]) => void;
  onSelectInputForLiveSim: (input: string) => void;
}

export const BatchTestTable: React.FC<BatchTestTableProps> = ({
  automaton,
  testSuite,
  onUpdateTestSuite,
  onSelectInputForLiveSim,
}) => {
  const [newString, setNewString] = useState('');
  const [newExpected, setNewExpected] = useState<'accept' | 'reject'>('accept');
  const [isRunning, setIsRunning] = useState(false);

  const handleRunAll = () => {
    setIsRunning(true);
    const updated = testSuite.map((item) => {
      const result = runSimulation(automaton, item.input);
      const actual: BatchTestItem['actual'] = result.status === 'accepted' ? 'accept' : 'reject';

      let passed = true;
      if (item.expected === 'accept') {
        passed = actual === 'accept';
      } else if (item.expected === 'reject') {
        passed = actual === 'reject';
      }

      return {
        ...item,
        actual,
        steps: result.totalSteps,
        passed,
      };
    });

    onUpdateTestSuite(updated);
    setIsRunning(false);
  };

  const handleAddRow = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: BatchTestItem = {
      id: generateId('test'),
      input: newString,
      expected: newExpected,
    };
    onUpdateTestSuite([...testSuite, newItem]);
    setNewString('');
  };

  const handleRemoveRow = (id: string) => {
    onUpdateTestSuite(testSuite.filter(t => t.id !== id));
  };

  const testedCount = testSuite.filter(t => t.actual !== undefined).length;
  const passedCount = testSuite.filter(t => t.passed === true).length;
  const passPercent = testedCount > 0 ? Math.round((passedCount / testedCount) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Controls & Summary */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleRunAll}
          disabled={isRunning || testSuite.length === 0}
          className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors"
        >
          <Play className="w-3.5 h-3.5 mr-1.5" />
          Run All ({testSuite.length})
        </button>

        {testedCount > 0 && (
          <div className="text-right">
            <span className={`text-xs font-bold font-mono ${passPercent === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {passedCount} / {testedCount} Passed ({passPercent}%)
            </span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs max-h-64">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800 text-[10px]">
            <tr>
              <th className="py-2 px-3">Input</th>
              <th className="py-2 px-3">Expected</th>
              <th className="py-2 px-3">Actual</th>
              <th className="py-2 px-3">Steps</th>
              <th className="py-2 px-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
            {testSuite.map((item) => {
              return (
                <tr
                  key={item.id}
                  onClick={() => onSelectInputForLiveSim(item.input)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  title="Click to load into live single-step simulation"
                >
                  <td className="py-2 px-3 font-medium text-slate-900 dark:text-slate-100">
                    &quot;{item.input}&quot;
                  </td>
                  <td className="py-2 px-3">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      item.expected === 'accept'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                    }`}>
                      {item.expected}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    {item.actual ? (
                      <span className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        item.actual === 'accept'
                          ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                          : item.actual === 'reject'
                          ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                          : 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
                      }`}>
                        {item.passed ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <XCircle className="w-3 h-3 text-rose-500" />
                        )}
                        <span>{item.actual}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">-</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-slate-500">
                    {item.steps !== undefined ? item.steps : '-'}
                  </td>
                  <td className="py-2 px-2 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors"
                      title="Remove test"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Row Form */}
      <form onSubmit={handleAddRow} className="flex items-center space-x-2 pt-1">
        <input
          type="text"
          value={newString}
          onChange={(e) => setNewString(e.target.value)}
          placeholder="New test string (e.g. 101)"
          className="flex-1 px-3 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
        />
        <select
          value={newExpected}
          onChange={(e) => setNewExpected(e.target.value as 'accept' | 'reject')}
          className="px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-300"
        >
          <option value="accept">Accept</option>
          <option value="reject">Reject</option>
        </select>
        <button
          type="submit"
          className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add
        </button>
      </form>
    </div>
  );
};
