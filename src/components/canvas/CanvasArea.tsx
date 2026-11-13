import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant,
} from '@xyflow/react';
import { Automaton, EditorTool, State, Transition } from '../../types/automata';
import { StateNode, StateNodeData } from './StateNode';
import { TransitionEdge, TransitionEdgeData } from './TransitionEdge';
import { CanvasToolbar } from './CanvasToolbar';
import { StateEditModal } from './StateEditModal';
import { TransitionModal } from './TransitionModal';
import { mergeTransitionLabels } from '../../utils/labelParser';
import { generateId, getNextStateLabel } from '../../utils/idGenerator';
import { SimulationStep } from '../../engine/types';

interface CanvasAreaProps {
  automaton: Automaton;
  onUpdateAutomaton: (updated: Automaton) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  currentStep?: SimulationStep;
  canvasContainerRef: React.RefObject<HTMLDivElement | null>;
}

const nodeTypes = {
  stateNode: StateNode,
};

const edgeTypes = {
  transitionEdge: TransitionEdge,
};

function InnerCanvas({
  automaton,
  onUpdateAutomaton,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  currentStep,
  canvasContainerRef,
}: CanvasAreaProps) {
  const [currentTool, setCurrentTool] = useState<EditorTool>('select');
  const [editingState, setEditingState] = useState<State | null>(null);
  
  // Transition modal state
  const [transitionModalOpen, setTransitionModalOpen] = useState(false);
  const [activeEdgeFromTo, setActiveEdgeFromTo] = useState<{ from: string; to: string } | null>(null);

  // Pending transition source for two-click transition tool
  const [pendingSourceStateId, setPendingSourceStateId] = useState<string | null>(null);

  const { screenToFlowPosition, fitView } = useReactFlow();

  // Active state IDs and active transition IDs from simulation step
  const activeStateSet = useMemo(() => new Set(currentStep?.activeStateIds || []), [currentStep]);
  const activeTransitionSet = useMemo(() => new Set(currentStep?.activeTransitionIds || []), [currentStep]);
  const isAccepted = currentStep?.status === 'accepted';
  const isRejected = currentStep?.status === 'rejected';

  // Map Automaton states -> React Flow Nodes
  const nodes: Node[] = useMemo(() => {
    return automaton.states.map((s) => {
      const isActive = activeStateSet.has(s.id);
      return {
        id: s.id,
        type: 'stateNode',
        position: { x: s.x, y: s.y },
        data: {
          label: s.label,
          isInitial: s.isInitial,
          isFinal: s.isFinal,
          isActive,
          isAccepted: isActive && isAccepted,
          isRejected: isActive && isRejected,
          onEdit: (id: string) => {
            const st = automaton.states.find((state) => state.id === id);
            if (st) setEditingState(st);
          },
        } as StateNodeData,
      };
    });
  }, [automaton.states, activeStateSet, isAccepted, isRejected]);

  // Group transitions by from->to pair for merged labels
  const edges: Edge[] = useMemo(() => {
    const pairMap = new Map<string, Transition[]>();
    for (const t of automaton.transitions) {
      const key = `${t.from}-->${t.to}`;
      if (!pairMap.has(key)) pairMap.set(key, []);
      pairMap.get(key)!.push(t);
    }

    const resultEdges: Edge[] = [];
    for (const [key, trList] of pairMap.entries()) {
      const [from, to] = key.split('-->');
      const isAnyActive = trList.some((t) => activeTransitionSet.has(t.id));
      const mergedLabel = mergeTransitionLabels(trList, automaton.type);

      resultEdges.push({
        id: key,
        source: from,
        target: to,
        type: 'transitionEdge',
        data: {
          label: mergedLabel,
          isActive: isAnyActive,
          isCurved: from !== to,
          onEdit: () => {
            setActiveEdgeFromTo({ from, to });
            setTransitionModalOpen(true);
          },
          onDelete: () => {
            onUpdateAutomaton({
              ...automaton,
              transitions: automaton.transitions.filter((t) => !(t.from === from && t.to === to)),
            });
          },
        } as TransitionEdgeData,
      });
    }
    return resultEdges;
  }, [automaton.transitions, automaton.type, activeTransitionSet, automaton]);

  // Handle node drag stop: update (x, y) in Automaton
  const onNodeDragStop = useCallback(
    (_: unknown, node: Node) => {
      const updatedStates = automaton.states.map((s) =>
        s.id === node.id ? { ...s, x: Math.round(node.position.x), y: Math.round(node.position.y) } : s
      );
      onUpdateAutomaton({ ...automaton, states: updatedStates });
    },
    [automaton, onUpdateAutomaton]
  );

  // Canvas Click (Add State tool)
  const onPaneClick = useCallback(
    (e: React.MouseEvent) => {
      if (currentTool === 'addState') {
        const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
        const nextLabel = getNextStateLabel(automaton.states);
        const newState: State = {
          id: generateId('state'),
          label: nextLabel,
          isInitial: automaton.states.length === 0, // First state is start by default
          isFinal: false,
          x: Math.round(position.x - 28),
          y: Math.round(position.y - 28),
        };
        onUpdateAutomaton({
          ...automaton,
          states: [...automaton.states, newState],
        });
      }
    },
    [currentTool, screenToFlowPosition, automaton, onUpdateAutomaton]
  );

  // Node Click (Delete tool or Add Transition click)
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (currentTool === 'delete') {
        // Delete state and all transitions attached to it
        onUpdateAutomaton({
          ...automaton,
          states: automaton.states.filter((s) => s.id !== node.id),
          transitions: automaton.transitions.filter((t) => t.from !== node.id && t.to !== node.id),
        });
      } else if (currentTool === 'addTransition') {
        if (!pendingSourceStateId) {
          setPendingSourceStateId(node.id);
        } else {
          setActiveEdgeFromTo({ from: pendingSourceStateId, to: node.id });
          setTransitionModalOpen(true);
          setPendingSourceStateId(null);
        }
      }
    },
    [currentTool, pendingSourceStateId, automaton, onUpdateAutomaton]
  );

  // Edge Click (Delete tool)
  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      if (currentTool === 'delete') {
        const [from, to] = edge.id.split('-->');
        onUpdateAutomaton({
          ...automaton,
          transitions: automaton.transitions.filter((t) => !(t.from === from && t.to === to)),
        });
      }
    },
    [currentTool, automaton, onUpdateAutomaton]
  );

  // React Flow onConnect (Drag transition from handle)
  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      setActiveEdgeFromTo({ from: connection.source, to: connection.target });
      setTransitionModalOpen(true);
    },
    []
  );

  // Clear Canvas
  const handleClear = useCallback(() => {
    onUpdateAutomaton({
      ...automaton,
      states: [],
      transitions: [],
    });
  }, [automaton, onUpdateAutomaton]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          onRedo();
        } else {
          e.preventDefault();
          onUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        onRedo();
      } else if (e.key.toLowerCase() === 'v') {
        setCurrentTool('select');
      } else if (e.key.toLowerCase() === 's') {
        setCurrentTool('addState');
      } else if (e.key.toLowerCase() === 't') {
        setCurrentTool('addTransition');
      } else if (e.key.toLowerCase() === 'd') {
        setCurrentTool('delete');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onUndo, onRedo]);

  const stateMap = useMemo(() => new Map(automaton.states.map((s) => [s.id, s])), [automaton.states]);
  const activeFromState = activeEdgeFromTo ? stateMap.get(activeEdgeFromTo.from) : null;
  const activeToState = activeEdgeFromTo ? stateMap.get(activeEdgeFromTo.to) : null;

  const existingTransitionsForActiveEdge = useMemo(() => {
    if (!activeEdgeFromTo) return [];
    return automaton.transitions.filter(
      (t) => t.from === activeEdgeFromTo.from && t.to === activeEdgeFromTo.to
    );
  }, [automaton.transitions, activeEdgeFromTo]);

  return (
    <div ref={canvasContainerRef} className="relative w-full h-full bg-slate-50 dark:bg-slate-950">
      {/* Canvas Floating Toolbar */}
      <CanvasToolbar
        currentTool={currentTool}
        onSelectTool={setCurrentTool}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={onUndo}
        onRedo={onRedo}
        onFitView={() => fitView({ padding: 0.2 })}
        onClear={handleClear}
      />

      {/* Tool Hint Indicator */}
      {currentTool === 'addState' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-semibold shadow-md pointer-events-none animate-in fade-in duration-100">
          Click anywhere on canvas to place a new state
        </div>
      )}

      {currentTool === 'addTransition' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-semibold shadow-md pointer-events-none animate-in fade-in duration-100">
          {pendingSourceStateId
            ? `Selected ${stateMap.get(pendingSourceStateId)?.label || 'source'}. Now click target state.`
            : 'Click source state, then target state (or drag handle).'}
        </div>
      )}

      {currentTool === 'delete' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-semibold shadow-md pointer-events-none animate-in fade-in duration-100">
          Click any state or transition to delete it
        </div>
      )}

      {/* React Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeDragStop={onNodeDragStop}
        onPaneClick={onPaneClick}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onConnect={onConnect}
        fitView
        deleteKeyCode={null}
        minZoom={0.2}
        maxZoom={3}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#94a3b8" />
        <Controls showInteractive={false} className="!bg-white/90 dark:!bg-slate-800/90 !border-slate-200 dark:!border-slate-700 !rounded-xl !shadow-md" />
      </ReactFlow>

      {/* State Edit Modal */}
      <StateEditModal
        state={editingState}
        isOpen={!!editingState}
        onClose={() => setEditingState(null)}
        onSave={(updated) => {
          onUpdateAutomaton({
            ...automaton,
            states: automaton.states.map((s) => (s.id === updated.id ? updated : s)),
          });
        }}
        onDelete={(id) => {
          onUpdateAutomaton({
            ...automaton,
            states: automaton.states.filter((s) => s.id !== id),
            transitions: automaton.transitions.filter((t) => t.from !== id && t.to !== id),
          });
        }}
      />

      {/* Transition Modal */}
      {activeEdgeFromTo && activeFromState && activeToState && (
        <TransitionModal
          isOpen={transitionModalOpen}
          onClose={() => {
            setTransitionModalOpen(false);
            setActiveEdgeFromTo(null);
          }}
          sourceStateLabel={activeFromState.label}
          targetStateLabel={activeToState.label}
          fromStateId={activeEdgeFromTo.from}
          toStateId={activeEdgeFromTo.to}
          machineType={automaton.type}
          existingTransitions={existingTransitionsForActiveEdge}
          onAddTransition={(newTr) => {
            onUpdateAutomaton({
              ...automaton,
              transitions: [...automaton.transitions, newTr],
            });
          }}
          onDeleteTransition={(trId) => {
            onUpdateAutomaton({
              ...automaton,
              transitions: automaton.transitions.filter((t) => t.id !== trId),
            });
          }}
        />
      )}
    </div>
  );
}

export const CanvasArea: React.FC<CanvasAreaProps> = (props) => {
  return (
    <ReactFlowProvider>
      <InnerCanvas {...props} />
    </ReactFlowProvider>
  );
};
