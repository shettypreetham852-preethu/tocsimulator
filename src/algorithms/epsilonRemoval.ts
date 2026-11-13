import { Automaton, State, Transition } from '../types/automata';
import { computeEpsilonClosure } from '../engine/nfaEngine';
import { EPSILON, normalizeEpsilon } from '../utils/labelParser';
import { generateId } from '../utils/idGenerator';

export interface EpsilonRemovalStepRow {
  stateLabel: string;
  epsilonClosureLabels: string[];
  isInitial: boolean;
  isFinal: boolean;
  transitions: Record<string, string[]>; // symbol -> array of target state labels
}

export interface EpsilonRemovalResult {
  nfa: Automaton;
  alphabet: string[];
  table: EpsilonRemovalStepRow[];
  removedEpsilonCount: number;
}

/**
 * Converts an ε-NFA to an equivalent standard NFA by eliminating all ε-transitions.
 * Transition function formula:
 * δ'(q, a) = ε-closure( δ( ε-closure(q), a ) )
 */
export function removeEpsilonTransitions(enfa: Automaton): EpsilonRemovalResult {
  const stateMap = new Map(enfa.states.map(s => [s.id, s]));
  const initialState = enfa.states.find(s => s.isInitial);

  if (!initialState) {
    throw new Error('Automaton has no initial state designated.');
  }

  // Count epsilon transitions
  const epsilonTransitions = enfa.transitions.filter(
    t => normalizeEpsilon(t.symbol) === EPSILON
  );
  const removedEpsilonCount = epsilonTransitions.length;

  // Extract alphabet (excluding epsilon)
  const alphabetSet = new Set<string>();
  for (const t of enfa.transitions) {
    const sym = normalizeEpsilon(t.symbol);
    if (sym !== EPSILON && sym !== '') {
      alphabetSet.add(sym);
    }
  }
  const alphabet = Array.from(alphabetSet).sort();

  const originalFinalIds = new Set(enfa.states.filter(s => s.isFinal).map(s => s.id));

  // Step 1: Compute ε-closure for every state
  const closures = new Map<string, string[]>();
  for (const s of enfa.states) {
    closures.set(s.id, computeEpsilonClosure([s.id], enfa).states);
  }

  // Step 2: Build new final states: state q is final if ε-closure(q) contains any original final state
  const newFinalIds = new Set<string>();
  for (const s of enfa.states) {
    const cl = closures.get(s.id) || [];
    if (cl.some(id => originalFinalIds.has(id))) {
      newFinalIds.add(s.id);
    }
  }

  // Step 3: Compute δ'(q, a) = ε-closure( δ( ε-closure(q), a ) )
  const newTransitions: Transition[] = [];
  const tableRows: EpsilonRemovalStepRow[] = [];

  for (const s of enfa.states) {
    const cl = closures.get(s.id) || [s.id];
    const rowTransitions: Record<string, string[]> = {};

    for (const sym of alphabet) {
      // Find all states reachable on symbol sym from any state in cl
      const directReachable = new Set<string>();
      for (const p of cl) {
        for (const t of enfa.transitions) {
          if (t.from === p && normalizeEpsilon(t.symbol) === sym) {
            directReachable.add(t.to);
          }
        }
      }

      if (directReachable.size === 0) {
        rowTransitions[sym] = ['∅'];
        continue;
      }

      // Epsilon closure of directReachable
      const extendedReachable = computeEpsilonClosure(Array.from(directReachable), enfa).states;
      const targetLabels = extendedReachable.map(id => stateMap.get(id)?.label || id).sort();
      rowTransitions[sym] = targetLabels;

      // Add transitions to new NFA
      for (const targetId of extendedReachable) {
        newTransitions.push({
          id: generateId('tr_no_eps'),
          from: s.id,
          to: targetId,
          symbol: sym,
        });
      }
    }

    tableRows.push({
      stateLabel: s.label,
      epsilonClosureLabels: cl.map(id => stateMap.get(id)?.label || id).sort(),
      isInitial: s.isInitial,
      isFinal: newFinalIds.has(s.id),
      transitions: rowTransitions,
    });
  }

  // Deduplicate transitions
  const uniqueTrMap = new Map<string, Transition>();
  for (const t of newTransitions) {
    const key = `${t.from}->${t.to}:${t.symbol}`;
    if (!uniqueTrMap.has(key)) {
      uniqueTrMap.set(key, t);
    }
  }

  // Construct new states preserving positions
  const newStates: State[] = enfa.states.map(s => ({
    ...s,
    isFinal: newFinalIds.has(s.id),
  }));

  const nfa: Automaton = {
    type: 'NFA',
    states: newStates,
    transitions: Array.from(uniqueTrMap.values()),
    alphabet,
  };

  return {
    nfa,
    alphabet,
    table: tableRows,
    removedEpsilonCount,
  };
}
