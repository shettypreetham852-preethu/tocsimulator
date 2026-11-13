import React from 'react';
import { EditorTool } from '../../types/automata';
import { MousePointer, CircleDot, MoveRight, Trash2, Undo2, Redo2, Maximize, RotateCcw } from 'lucide-react';

interface CanvasToolbarProps {
  currentTool: EditorTool;
  onSelectTool: (tool: EditorTool) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onFitView: () => void;
  onClear: () => void;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  currentTool,
  onSelectTool,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onFitView,
  onClear,
}) => {
  const tools: { id: EditorTool; label: string; icon: React.FC<{ className?: string }>; tooltip: string }[] = [
    { id: 'select', label: 'Select', icon: MousePointer, tooltip: 'Select & Move (V)' },
    { id: 'addState', label: 'Add State', icon: CircleDot, tooltip: 'Click canvas to add state (S)' },
    { id: 'addTransition', label: 'Transition', icon: MoveRight, tooltip: 'Click-drag between states (T)' },
    { id: 'delete', label: 'Delete', icon: Trash2, tooltip: 'Click node/edge to delete (D)' },
  ];

  return (
    <div className="absolute top-4 left-4 z-10 flex items-center bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200/80 dark:border-slate-700/80 p-1 space-x-1 select-none">
      {/* Editor Tools */}
      <div className="flex items-center space-x-1 pr-2 border-r border-slate-200 dark:border-slate-700">
        {tools.map((t) => {
          const Icon = t.icon;
          const isActive = currentTool === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelectTool(t.id)}
              title={t.tooltip}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Undo / Redo */}
      <div className="flex items-center space-x-0.5 px-1 pr-2 border-r border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      {/* Canvas View helpers */}
      <div className="flex items-center space-x-0.5 pl-1">
        <button
          type="button"
          onClick={onFitView}
          title="Fit view to all states"
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
        >
          <Maximize className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Clear all states and transitions on canvas?')) {
              onClear();
            }
          }}
          title="Clear canvas"
          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
