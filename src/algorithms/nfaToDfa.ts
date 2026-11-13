import { Automaton, State, Transition } from '../types/automata';
import { computeEpsilonClosure } from '../engine/nfaEngine';
import { EPSILON, normalizeEpsilon } from '../utils/labelParser';
import { generateId } from '../utils/idGenerator';

export interface NFAToDFAStepRow {
  dfaStateLabel: string;
  nfaSubset: string[]; // State IDs
  nfaSubsetLabels: string[];
  isInitial: boolean;
  isFinal: boolean;
  transitions: Record<string, string>; // symbol -> target DFA state label
}

export interface NFAToDFAResult {
  dfa: Automaton;
  alphabet: string[];
  table: NFAToDFAStepRow[];
}

export function convertNfaToDfa(nfa: Automaton): NFAToDFAResult {
  const stateMap = new Map(nfa.states.map(s => [s.id, s]));
  const initialState = nfa.states.find(s => s.isInitial);
  
  if (!initialState) {
    throw new Error('NFA has no initial state.');
  }

  // Extract alphabet (excluding epsilon)
  const alphabetSet = new Set<string>();
  for (const t of nfa.transitions) {
    const sym = normalizeEpsilon(t.symbol);
    if (sym !== EPSILON && sym !== '') {
      alphabetSet.add(sym);
    }
  }
  const alphabet = Array.from(alphabetSet).sort();

  // Helper to serialize subset to unique string key
  const subsetKey = (ids: string[]) => Array.from(new Set(ids)).sort().join(',');

  const nfaFinalIds = new Set(nfa.states.filter(s => s.isFinal).map(s => s.id));

  // Compute initial closure
  const initClosure = computeEpsilonClosure([initialState.id], nfa).states;
  const initKey = subsetKey(initClosure);

  const subsetToDfaLabel = new Map<string, string>();
  const subsetToIds = new Map<string, string[]>();

  let labelCounter = 0;
  const getNextLabel = () => `D${labelCounter++}`;

  const initLabel = getNextLabel();
  subsetToDfaLabel.set(initKey, initLabel);
  subsetToIds.set(initKey, initClosure);

  const queue: string[] = [initKey];
  const tableRows: NFAToDFAStepRow[] = [];
  const dfaTransitions: { fromLabel: string; toLabel: string; symbol: string }[] = [];

  while (queue.length > 0) {
    const currentKey = queue.shift()!;
    const currentSubset = subsetToIds.get(currentKey)!;
    const currentDfaLabel = subsetToDfaLabel.get(currentKey)!;

    const row: NFAToDFAStepRow = {
      dfaStateLabel: currentDfaLabel,
      nfaSubset: currentSubset,
      nfaSubsetLabels: currentSubset.map(id => stateMap.get(id)?.label || id).sort(),
      isInitial: currentKey === initKey,
      isFinal: currentSubset.some(id => nfaFinalIds.has(id)),
      transitions: {},
    };

    for (const sym of alphabet) {
      // Find all states reachable on symbol sym from any state in currentSubset
      const reachableOnSym = new Set<string>();
      for (const sId of currentSubset) {
        for (const t of nfa.transitions) {
          if (t.from === sId && normalizeEpsilon(t.symbol) === sym) {
            reachableOnSym.add(t.to);
          }
        }
      }

      if (reachableOnSym.size === 0) {
        row.transitions[sym] = '∅';
        continue;
      }

      // Epsilon closure of reachableOnSym
      const closure = computeEpsilonClosure(Array.from(reachableOnSym), nfa).states;
      const targetKey = subsetKey(closure);

      let targetLabel = subsetToDfaLabel.get(targetKey);
      if (!targetLabel) {
        targetLabel = getNextLabel();
        subsetToDfaLabel.set(targetKey, targetLabel);
        subsetToIds.set(targetKey, closure);
        queue.push(targetKey);
      }

      row.transitions[sym] = targetLabel;
      dfaTransitions.push({
        fromLabel: currentDfaLabel,
        toLabel: targetLabel,
        symbol: sym,
      });
    }

    tableRows.push(row);
  }

  // Build DFA Automaton with circle layout
  const dfaStates: State[] = [];
  const stateLabelToId = new Map<string, string>();
  const totalStates = tableRows.length;
  const radius = Math.max(160, totalStates * 45);
  const centerX = 380;
  const centerY = 280;

  tableRows.forEach((row, idx) => {
    const angle = (idx / totalStates) * 2 * Math.PI - Math.PI / 2;
    const id = generateId('dfa_s');
    stateLabelToId.set(row.dfaStateLabel, id);

    // Format readable state label: e.g. "q0,q1"
    const readableName = `{${row.nfaSubsetLabels.join(',')}}`;

    dfaStates.push({
      id,
      label: readableName,
      isInitial: row.isInitial,
      isFinal: row.isFinal,
      x: Math.round(centerX + radius * Math.cos(angle)),
      y: Math.round(centerY + radius * Math.sin(angle)),
    });
  });

  const finalTransitions: Transition[] = dfaTransitions.map(tr => ({
    id: generateId('tr'),
    from: stateLabelToId.get(tr.fromLabel)!,
    to: stateLabelToId.get(tr.toLabel)!,
    symbol: tr.symbol,
  }));

  const dfa: Automaton = {
    type: 'DFA',
    states: dfaStates,
    transitions: finalTransitions,
    alphabet,
  };

  return {
    dfa,
    alphabet,
    table: tableRows,
  };
}
