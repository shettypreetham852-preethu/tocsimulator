import React from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, FastForward } from 'lucide-react';
import { SimulationStatus } from '../../engine/types';

interface SimulationControlBarProps {
  inputString: string;
  onChangeInput: (val: string) => void;
  status: SimulationStatus;
  currentStepIndex: number;
  totalSteps: number;
  isPlaying: boolean;
  speedMs: number;
  onChangeSpeed: (ms: number) => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onTogglePlay: () => void;
  onReset: () => void;
  onJumpToEnd: () => void;
}

export const SimulationControlBar: React.FC<SimulationControlBarProps> = ({
  inputString,
  onChangeInput,
  status,
  currentStepIndex,
  totalSteps,
  isPlaying,
  speedMs,
  onChangeSpeed,
  onStepForward,
  onStepBackward,
  onTogglePlay,
  onReset,
  onJumpToEnd,
}) => {
  const canStepBack = currentStepIndex > 0;
  const canStepForward = currentStepIndex < totalSteps - 1;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 select-none">
      {/* Input String Field */}
      <div className="flex items-center space-x-2 flex-1 min-w-[200px] max-w-sm">
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
          Input:
        </label>
        <div className="relative flex-1">
          <input
            type="text"
            value={inputString}
            onChange={(e) => onChangeInput(e.target.value)}
            placeholder="(Empty string ε)"
            className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 placeholder:italic"
          />
          {inputString.length > 0 && (
            <button
              type="button"
              onClick={() => onChangeInput('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              title="Clear input (test empty string ε)"
            >
              ε
            </button>
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center space-x-1.5">
        <button
          type="button"
          onClick={onReset}
          disabled={currentStepIndex === 0 && !isPlaying}
          title="Reset to step 0"
          className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onStepBackward}
          disabled={!canStepBack || isPlaying}
          title="Step back"
          className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onTogglePlay}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium text-white flex items-center space-x-1.5 shadow-xs transition-all ${
            isPlaying
              ? 'bg-amber-600 hover:bg-amber-700'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
          title={isPlaying ? 'Pause simulation' : 'Run simulation automatically'}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>Run</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onStepForward}
          disabled={!canStepForward || isPlaying}
          title="Step forward"
          className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onJumpToEnd}
          disabled={!canStepForward || isPlaying}
          title="Jump to end"
          className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
        >
          <FastForward className="w-4 h-4" />
        </button>
      </div>

      {/* Step Indicator & Speed Slider */}
      <div className="flex items-center space-x-4">
        {/* Step Badge */}
        <div className="text-xs font-mono font-medium px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          Step <span className="font-bold text-indigo-600 dark:text-indigo-400">{currentStepIndex}</span> / {Math.max(0, totalSteps - 1)}
        </div>

        {/* Speed Slider */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Speed:</span>
          <input
            type="range"
            min="100"
            max="1500"
            step="50"
            value={1600 - speedMs}
            onChange={(e) => onChangeSpeed(1600 - Number(e.target.value))}
            title={`Speed: ${(1000 / speedMs).toFixed(1)} steps/sec (${speedMs}ms)`}
            className="w-20 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>
      </div>
    </div>
  );
};
