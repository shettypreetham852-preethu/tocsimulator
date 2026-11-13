import React, { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from '@xyflow/react';

export interface TransitionEdgeData extends Record<string, unknown> {
  label: string;
  isActive?: boolean;
  onEdit?: (edgeId: string) => void;
  onDelete?: (edgeId: string) => void;
  isCurved?: boolean;
}

export const TransitionEdge = memo(({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) => {
  const edgeData = (data || {}) as unknown as TransitionEdgeData;
  const isSelfLoop = source === target;
  const isActive = edgeData.isActive;

  let edgePath = '';
  let labelX = 0;
  let labelY = 0;

  if (isSelfLoop) {
    // Generate curved self-loop path above the node
    const radiusX = 26;
    const radiusY = 38;
    const startX = sourceX - 12;
    const startY = sourceY - 14;
    const endX = sourceX + 12;
    const endY = sourceY - 14;

    // Cubic bezier arc looping up
    edgePath = `M ${startX} ${startY} C ${startX - radiusX} ${startY - radiusY}, ${endX + radiusX} ${endY - radiusY}, ${endX} ${endY}`;
    labelX = sourceX;
    labelY = startY - radiusY - 4;
  } else {
    // Normal or opposing edge
    // Add curvature offset if source < target to prevent overlapping opposite edges
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Check if curved needed
    const isCurved = edgeData.isCurved ?? true;
    if (isCurved && dist > 10) {
      // Perpendicular vector for curved arc
      const curvature = 24;
      const nx = -dy / dist;
      const ny = dx / dist;

      // Midpoint offset
      const midX = (sourceX + targetX) / 2 + nx * curvature;
      const midY = (sourceY + targetY) / 2 + ny * curvature;

      edgePath = `M ${sourceX} ${sourceY} Q ${midX} ${midY} ${targetX} ${targetY}`;
      labelX = midX;
      labelY = midY;
    } else {
      const [bezierPath, bLabelX, bLabelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
      });
      edgePath = bezierPath;
      labelX = bLabelX;
      labelY = bLabelY;
    }
  }

  const strokeColor = isActive
    ? '#3b82f6'
    : selected
    ? '#6366f1'
    : '#94a3b8';

  const strokeWidth = isActive ? 3 : selected ? 2.5 : 1.75;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: strokeColor,
          strokeWidth,
          transition: 'stroke 0.2s, stroke-width 0.2s',
        }}
      />
      {/* Animated dash if active */}
      {isActive && (
        <path
          d={edgePath}
          fill="none"
          stroke="#60a5fa"
          strokeWidth={4}
          strokeDasharray="6,6"
          className="animate-pulse"
        />
      )}

      {edgeData.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <div
              onDoubleClick={(e) => {
                e.stopPropagation();
                edgeData.onEdit?.(id);
              }}
              title="Double click to edit transition"
              className={`px-2 py-0.5 rounded text-xs font-mono font-medium shadow-sm border transition-all cursor-pointer select-none max-w-xs text-center whitespace-pre ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-700 shadow-md scale-105'
                  : selected
                  ? 'bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border-indigo-400 dark:border-indigo-600'
                  : 'bg-white/95 dark:bg-slate-800/95 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500'
              }`}
            >
              {edgeData.label}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

TransitionEdge.displayName = 'TransitionEdge';
