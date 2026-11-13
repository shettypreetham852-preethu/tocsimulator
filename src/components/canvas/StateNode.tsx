import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

export interface StateNodeData extends Record<string, unknown> {
  label: string;
  isInitial: boolean;
  isFinal: boolean;
  isActive?: boolean;
  isAccepted?: boolean;
  isRejected?: boolean;
  onEdit?: (id: string) => void;
}

export const StateNode = memo(({ id, data, selected }: NodeProps) => {
  const { label, isInitial, isFinal, isActive, isAccepted, isRejected, onEdit } = data as unknown as StateNodeData;

  let ringColor = 'border-slate-400 dark:border-slate-500';
  let bgColor = 'bg-white dark:bg-slate-800';
  let pulseClass = '';

  if (isAccepted) {
    ringColor = 'border-emerald-500 dark:border-emerald-400';
    bgColor = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100';
    pulseClass = 'node-accept-pulse';
  } else if (isRejected) {
    ringColor = 'border-rose-500 dark:border-rose-400';
    bgColor = 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100';
    pulseClass = 'node-reject-pulse';
  } else if (isActive) {
    ringColor = 'border-blue-500 dark:border-blue-400';
    bgColor = 'bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100';
    pulseClass = 'node-active-pulse';
  } else if (selected) {
    ringColor = 'border-indigo-500 ring-2 ring-indigo-300 dark:ring-indigo-700';
  }

  return (
    <div
      onDoubleClick={(e) => {
        e.stopPropagation();
        onEdit?.(id);
      }}
      className={`relative flex items-center justify-center w-14 h-14 rounded-full border-2 transition-all duration-150 cursor-pointer shadow-md select-none group ${ringColor} ${bgColor} ${pulseClass}`}
    >
      {/* Handles for transitions on 4 sides */}
      <Handle type="target" position={Position.Top} id="top-t" className="!w-2 !h-2 !bg-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Top} id="top-s" className="!w-2 !h-2 !bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="target" position={Position.Right} id="right-t" className="!w-2 !h-2 !bg-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Right} id="right-s" className="!w-2 !h-2 !bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="target" position={Position.Bottom} id="bottom-t" className="!w-2 !h-2 !bg-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Bottom} id="bottom-s" className="!w-2 !h-2 !bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="target" position={Position.Left} id="left-t" className="!w-2 !h-2 !bg-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Left} id="left-s" className="!w-2 !h-2 !bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Initial state arrow pointing in from the left */}
      {isInitial && (
        <div className="absolute -left-5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400 drop-shadow" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="0,4 20,12 0,20" />
          </svg>
        </div>
      )}

      {/* Final state inner circle */}
      {isFinal && (
        <div className="absolute inset-1 rounded-full border-2 border-inherit pointer-events-none" />
      )}

      {/* State label */}
      <span className="font-semibold text-xs tracking-tight px-1 text-center truncate max-w-[46px] z-10 pointer-events-none">
        {label}
      </span>
    </div>
  );
});

StateNode.displayName = 'StateNode';
