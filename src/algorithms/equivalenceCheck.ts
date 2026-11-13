import { Automaton } from '../types/automata';
import { convertNfaToDfa } from './nfaToDfa';
import { normalizeEpsilon } from '../utils/labelParser';

export interface EquivalenceCheckResult {
  areEquivalent: boolean;
  counterexample?: string;
  message: string;
}

export function checkEquivalence(m1: Automaton, m2: Automaton): EquivalenceCheckResult {
  // Ensure both machines are DFAs
  let dfa1 = m1;
  let dfa2 = m2;

  if (m1.type === 'NFA') {
    try {
      dfa1 = convertNfaToDfa(m1).dfa;
    } catch (e: any) {
      return { areEquivalent: false, message: `Failed to convert M1 to DFA: ${e.message}` };
    }
  }

  if (m2.type === 'NFA') {
    try {
      dfa2 = convertNfaToDfa(m2).dfa;
    } catch (e: any) {
      return { areEquivalent: false, message: `Failed to convert M2 to DFA: ${e.message}` };
    }
  }

  const init1 = dfa1.states.find(s => s.isInitial);
  const init2 = dfa2.states.find(s => s.isInitial);

  if (!init1 || !init2) {
    return {
      areEquivalent: false,
      message: 'Both automata must have designated initial states.',
    };
  }

  // Combined alphabet
  const alphabetSet = new Set<string>();
  for (const t of [...dfa1.transitions, ...dfa2.transitions]) {
    const sym = normalizeEpsilon(t.symbol);
    if (sym && sym !== 'ε') alphabetSet.add(sym);
  }
  const alphabet = Array.from(alphabetSet).sort();

  const final1 = new Set(dfa1.states.filter(s => s.isFinal).map(s => s.id));
  const final2 = new Set(dfa2.states.filter(s => s.isFinal).map(s => s.id));

  const delta1 = (sId: string, sym: string): string | null => {
    const tr = dfa1.transitions.find(t => t.from === sId && normalizeEpsilon(t.symbol) === sym);
    return tr ? tr.to : null; // null represents dead/trap state
  };

  const delta2 = (sId: string, sym: string): string | null => {
    const tr = dfa2.transitions.find(t => t.from === sId && normalizeEpsilon(t.symbol) === sym);
    return tr ? tr.to : null;
  };

  // BFS on pairs (state1, state2, stringSoFar)
  interface QueueNode {
    s1: string | null;
    s2: string | null;
    path: string;
  }

  const visited = new Set<string>();
  const pairKey = (s1: string | null, s2: string | null) => `${s1 ?? '__DEAD__'}:${s2 ?? '__DEAD__'}`;

  const queue: QueueNode[] = [{ s1: init1.id, s2: init2.id, path: '' }];
  visited.add(pairKey(init1.id, init2.id));

  while (queue.length > 0) {
    const { s1, s2, path } = queue.shift()!;

    const isAcc1 = s1 !== null && final1.has(s1);
    const isAcc2 = s2 !== null && final2.has(s2);

    if (isAcc1 !== isAcc2) {
      // Found distinguishing string!
      const whichAccepts = isAcc1 ? 'M1 accepts but M2 rejects' : 'M2 accepts but M1 rejects';
      return {
        areEquivalent: false,
        counterexample: path === '' ? 'ε (empty string)' : path,
        message: `Not equivalent. Counterexample string "${path || 'ε'}": ${whichAccepts}.`,
      };
    }

    for (const sym of alphabet) {
      const next1 = s1 !== null ? delta1(s1, sym) : null;
      const next2 = s2 !== null ? delta2(s2, sym) : null;

      const key = pairKey(next1, next2);
      if (!visited.has(key)) {
        visited.add(key);
        queue.push({
          s1: next1,
          s2: next2,
          path: path + sym,
        });
      }
    }
  }

  return {
    areEquivalent: true,
    message: 'Equivalent! Both automata recognize the exact same formal language.',
  };
}
