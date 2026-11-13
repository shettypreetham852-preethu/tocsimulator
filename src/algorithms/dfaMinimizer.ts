import { Automaton, State, Transition } from '../types/automata';
import { generateId } from '../utils/idGenerator';
import { normalizeEpsilon } from '../utils/labelParser';

export interface MinimizationPartitionStep {
  step: number;
  description: string;
  groups: string[][]; // Array of groups, where each group has state labels
}

export interface MinimizationResult {
  minimizedDfa: Automaton;
  steps: MinimizationPartitionStep[];
  removedUnreachableCount: number;
  originalStateCount: number;
  minimizedStateCount: number;
}

export function minimizeDFA(dfa: Automaton): MinimizationResult {
  const originalStateCount = dfa.states.length;
  const stateMap = new Map(dfa.states.map(s => [s.id, s]));
  const initialState = dfa.states.find(s => s.isInitial);

  if (!initialState) {
    throw new Error('DFA has no initial state to minimize.');
  }

  // 1. Identify Reachable States via BFS
  const reachableIds = new Set<string>([initialState.id]);
  const queue = [initialState.id];

  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const t of dfa.transitions) {
      if (t.from === cur && !reachableIds.has(t.to)) {
        reachableIds.add(t.to);
        queue.push(t.to);
      }
    }
  }

  const reachableStates = dfa.states.filter(s => reachableIds.has(s.id));
  const removedUnreachableCount = originalStateCount - reachableStates.length;

  // Extract alphabet
  const alphabetSet = new Set<string>();
  for (const t of dfa.transitions) {
    if (reachableIds.has(t.from) && reachableIds.has(t.to)) {
      const sym = normalizeEpsilon(t.symbol);
      if (sym) alphabetSet.add(sym);
    }
  }
  const alphabet = Array.from(alphabetSet).sort();

  // Helper for transition function: delta(stateId, symbol) -> stateId or undefined
  const delta = (sId: string, sym: string): string | undefined => {
    const tr = dfa.transitions.find(t => t.from === sId && normalizeEpsilon(t.symbol) === sym);
    return tr ? tr.to : undefined;
  };

  // 2. Initial Partition: Accepting (F) and Non-Accepting (Q \ F)
  const finalIds: string[] = [];
  const nonFinalIds: string[] = [];

  for (const s of reachableStates) {
    if (s.isFinal) finalIds.push(s.id);
    else nonFinalIds.push(s.id);
  }

  let partitions: string[][] = [];
  if (finalIds.length > 0) partitions.push(finalIds);
  if (nonFinalIds.length > 0) partitions.push(nonFinalIds);

  const stepsLog: MinimizationPartitionStep[] = [];
  const formatGroups = (pts: string[][]) =>
    pts.map(g => g.map(id => stateMap.get(id)?.label || id).sort());

  stepsLog.push({
    step: 0,
    description: `Initial split into Final {${finalIds.map(id => stateMap.get(id)?.label).join(',')}} and Non-Final {${nonFinalIds.map(id => stateMap.get(id)?.label).join(',')}}`,
    groups: formatGroups(partitions),
  });

  // Helper to find which partition index a state belongs to
  const getGroupIndex = (sId: string | undefined, currentParts: string[][]): number => {
    if (!sId) return -1;
    return currentParts.findIndex(g => g.includes(sId));
  };

  // 3. Iterative Partition Refinement
  let changed = true;
  let iteration = 0;

  while (changed && iteration < 50) {
    iteration++;
    changed = false;
    const newPartitions: string[][] = [];

    for (const group of partitions) {
      if (group.length <= 1) {
        newPartitions.push(group);
        continue;
      }

      // Group states by signature: [groupIndex for each symbol in alphabet]
      const signatureMap = new Map<string, string[]>();

      for (const sId of group) {
        const sig = alphabet
          .map(sym => {
            const target = delta(sId, sym);
            return `${sym}->${getGroupIndex(target, partitions)}`;
          })
          .join('|');

        if (!signatureMap.has(sig)) {
          signatureMap.set(sig, []);
        }
        signatureMap.get(sig)!.push(sId);
      }

      if (signatureMap.size > 1) {
        changed = true;
        for (const subGroup of signatureMap.values()) {
          newPartitions.push(subGroup);
        }
      } else {
        newPartitions.push(group);
      }
    }

    partitions = newPartitions;

    if (changed) {
      stepsLog.push({
        step: iteration,
        description: `Iteration ${iteration}: Refined into ${partitions.length} equivalent classes`,
        groups: formatGroups(partitions),
      });
    }
  }

  stepsLog.push({
    step: iteration + 1,
    description: `Partition stabilized with ${partitions.length} minimal state(s).`,
    groups: formatGroups(partitions),
  });

  // 4. Construct Minimized DFA
  const groupToNewState = new Map<number, State>();
  const totalStates = partitions.length;
  const radius = Math.max(160, totalStates * 50);
  const centerX = 380;
  const centerY = 280;

  const minStates: State[] = partitions.map((group, idx) => {
    const angle = (idx / totalStates) * 2 * Math.PI - Math.PI / 2;
    const hasInitial = group.includes(initialState.id);
    const hasFinal = group.some(id => stateMap.get(id)?.isFinal);
    const combinedLabel = group.map(id => stateMap.get(id)?.label || id).sort().join('/');

    const newState: State = {
      id: generateId('min_s'),
      label: combinedLabel.length > 10 ? `q'${idx}` : combinedLabel,
      isInitial: hasInitial,
      isFinal: hasFinal,
      x: Math.round(centerX + radius * Math.cos(angle)),
      y: Math.round(centerY + radius * Math.sin(angle)),
    };

    groupToNewState.set(idx, newState);
    return newState;
  });

  // Build transitions between groups
  const minTransitions: Transition[] = [];
  const addedTransitions = new Set<string>();

  partitions.forEach((group, fromGroupIdx) => {
    const representative = group[0];
    const fromState = groupToNewState.get(fromGroupIdx)!;

    for (const sym of alphabet) {
      const targetStateId = delta(representative, sym);
      if (targetStateId) {
        const toGroupIdx = getGroupIndex(targetStateId, partitions);
        if (toGroupIdx !== -1) {
          const toState = groupToNewState.get(toGroupIdx)!;
          const key = `${fromState.id}->${toState.id}:${sym}`;
          if (!addedTransitions.has(key)) {
            addedTransitions.add(key);
            minTransitions.push({
              id: generateId('tr_min'),
              from: fromState.id,
              to: toState.id,
              symbol: sym,
            });
          }
        }
      }
    }
  });

  const minimizedDfa: Automaton = {
    type: 'DFA',
    states: minStates,
    transitions: minTransitions,
    alphabet,
  };

  return {
    minimizedDfa,
    steps: stepsLog,
    removedUnreachableCount,
    originalStateCount,
    minimizedStateCount: minStates.length,
  };
}
