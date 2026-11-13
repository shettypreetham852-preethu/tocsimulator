import { Automaton } from '../types/automata';
import { EPSILON, normalizeEpsilon } from '../utils/labelParser';

export interface ClassificationReport {
  isDFA: boolean;
  isNFA: boolean;
  isENFA: boolean;
  classification: 'DFA' | 'NFA' | 'ENFA';
  reasons: string[];
  epsilonTransitions: { from: string; to: string }[];
  branchingStates: { stateLabel: string; symbol: string; count: number }[];
  missingTransitions: { stateLabel: string; symbol: string }[];
  alphabet: string[];
}

export function classifyAutomaton(automaton: Automaton): ClassificationReport {
  const stateMap = new Map(automaton.states.map(s => [s.id, s]));
  const reasons: string[] = [];

  // Extract alphabet (excluding epsilon)
  const alphabetSet = new Set<string>();
  for (const t of automaton.transitions) {
    const sym = normalizeEpsilon(t.symbol);
    if (sym && sym !== EPSILON) {
      alphabetSet.add(sym);
    }
  }
  const alphabet = Array.from(alphabetSet).sort();

  // 1. Check for epsilon transitions
  const epsilonTransitions: { from: string; to: string }[] = [];
  for (const t of automaton.transitions) {
    const sym = normalizeEpsilon(t.symbol);
    if (sym === EPSILON) {
      const fromLabel = stateMap.get(t.from)?.label || t.from;
      const toLabel = stateMap.get(t.to)?.label || t.to;
      epsilonTransitions.push({ from: fromLabel, to: toLabel });
    }
  }

  if (epsilonTransitions.length > 0) {
    reasons.push(
      `Contains ${epsilonTransitions.length} ε-transition(s): ${epsilonTransitions
        .map(e => `${e.from} → ${e.to}`)
        .join(', ')}.`
    );
  }

  // 2. Check for multiple transitions on the same symbol from a single state
  const branchingStates: { stateLabel: string; symbol: string; count: number }[] = [];
  const stateSymCounts = new Map<string, number>();

  for (const t of automaton.transitions) {
    const sym = normalizeEpsilon(t.symbol);
    if (sym === EPSILON) continue;
    const key = `${t.from}:::${sym}`;
    stateSymCounts.set(key, (stateSymCounts.get(key) || 0) + 1);
  }

  for (const [key, count] of stateSymCounts.entries()) {
    if (count > 1) {
      const [fromId, sym] = key.split(':::');
      const stateLabel = stateMap.get(fromId)?.label || fromId;
      branchingStates.push({ stateLabel, symbol: sym, count });
      reasons.push(
        `Non-deterministic branch: State "${stateLabel}" has ${count} transitions on symbol '${sym}'.`
      );
    }
  }

  // 3. Check missing transitions (completeness)
  const missingTransitions: { stateLabel: string; symbol: string }[] = [];
  for (const state of automaton.states) {
    for (const sym of alphabet) {
      const hasTr = automaton.transitions.some(
        t => t.from === state.id && normalizeEpsilon(t.symbol) === sym
      );
      if (!hasTr) {
        missingTransitions.push({ stateLabel: state.label, symbol: sym });
      }
    }
  }

  const hasEps = epsilonTransitions.length > 0;
  const hasBranching = branchingStates.length > 0;

  let classification: 'DFA' | 'NFA' | 'ENFA' = 'DFA';
  if (hasEps) {
    classification = 'ENFA';
  } else if (hasBranching) {
    classification = 'NFA';
  } else {
    classification = 'DFA';
  }

  const isDFA = classification === 'DFA';
  const isNFA = classification === 'NFA';
  const isENFA = classification === 'ENFA';

  if (isDFA) {
    if (missingTransitions.length > 0) {
      reasons.push(
        `Deterministic: No ε-transitions or branching. Note: Has ${missingTransitions.length} implicit trap/undefined transitions across states.`
      );
    } else {
      reasons.push('Strict DFA: Exactly 1 transition for every alphabet symbol from every state, and no ε-transitions.');
    }
  } else if (isNFA) {
    reasons.push('Standard NFA: Non-deterministic branching present, but contains zero ε-transitions.');
  } else {
    reasons.push('ε-NFA: Non-deterministic automaton featuring ε-transitions.');
  }

  return {
    isDFA,
    isNFA,
    isENFA,
    classification,
    reasons,
    epsilonTransitions,
    branchingStates,
    missingTransitions,
    alphabet,
  };
}
