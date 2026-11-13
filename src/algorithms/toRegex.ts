import { Automaton } from '../types/automata';
import { EPSILON, normalizeEpsilon } from '../utils/labelParser';

export interface StateEliminationStep {
  eliminatedStateLabel: string;
  stepNumber: number;
  remainingStates: string[];
}

export interface ToRegexResult {
  regex: string;
  steps: StateEliminationStep[];
}

// Regex simplification helper functions
function cleanConcat(a: string, b: string): string {
  if (a === '∅' || b === '∅') return '∅';
  if (a === EPSILON || a === '') return b;
  if (b === EPSILON || b === '') return a;
  
  // Wrap in parentheses if union
  const wrapA = a.includes('|') ? `(${a})` : a;
  const wrapB = b.includes('|') ? `(${b})` : b;
  return `${wrapA}${wrapB}`;
}

function cleanUnion(a: string, b: string): string {
  if (a === '∅' || a === '') return b || '∅';
  if (b === '∅' || b === '') return a || '∅';
  if (a === b) return a;
  return `${a}|${b}`;
}

function cleanStar(a: string): string {
  if (a === '∅' || a === EPSILON || a === '') return EPSILON;
  if (a.endsWith('*')) return a;
  if (a.length === 1) return `${a}*`;
  return `(${a})*`;
}

export function convertAutomatonToRegex(automaton: Automaton): ToRegexResult {
  const stateMap = new Map(automaton.states.map(s => [s.id, s]));
  const initialState = automaton.states.find(s => s.isInitial);

  if (!initialState) {
    return { regex: '∅', steps: [] };
  }

  const finalStates = automaton.states.filter(s => s.isFinal);
  if (finalStates.length === 0) {
    return { regex: '∅', steps: [] };
  }

  const startId = '__START__';
  const acceptId = '__ACCEPT__';

  // State ID list in GNFA
  const internalStateIds = automaton.states.map(s => s.id);
  const allStates = [startId, ...internalStateIds, acceptId];

  // Matrix of regex expressions between pairs of states
  const R = new Map<string, string>();
  const edgeKey = (from: string, to: string) => `${from}-->${to}`;

  // Initialize all with empty set
  for (const u of allStates) {
    for (const v of allStates) {
      R.set(edgeKey(u, v), '∅');
    }
  }

  // Add transition from start to initial state with ε
  R.set(edgeKey(startId, initialState.id), EPSILON);

  // Add transitions from all final states to acceptId with ε
  for (const f of finalStates) {
    const existing = R.get(edgeKey(f.id, acceptId))!;
    R.set(edgeKey(f.id, acceptId), cleanUnion(existing, EPSILON));
  }

  // Populate transitions from the automaton
  for (const t of automaton.transitions) {
    const sym = normalizeEpsilon(t.symbol);
    const existing = R.get(edgeKey(t.from, t.to))!;
    R.set(edgeKey(t.from, t.to), cleanUnion(existing, sym));
  }

  // Eliminate internal states one by one
  const steps: StateEliminationStep[] = [];
  const activeInternal = [...internalStateIds];

  let stepCount = 0;
  for (const ripId of internalStateIds) {
    stepCount++;
    const ripLabel = stateMap.get(ripId)?.label || ripId;
    const rLoop = R.get(edgeKey(ripId, ripId))!;
    const rLoopStar = cleanStar(rLoop);

    const otherStates = allStates.filter(s => s !== ripId && activeInternal.includes(s) || s === startId || s === acceptId);

    // Update paths between all remaining state pairs u -> v through ripId
    for (const u of otherStates) {
      if (u === acceptId) continue;
      const rIn = R.get(edgeKey(u, ripId))!;
      if (rIn === '∅') continue;

      for (const v of otherStates) {
        if (v === startId) continue;
        const rOut = R.get(edgeKey(ripId, v))!;
        if (rOut === '∅') continue;

        const currentDirect = R.get(edgeKey(u, v))!;
        
        // throughPath = rIn (rLoop)* rOut
        let throughPath = cleanConcat(rIn, rLoopStar);
        throughPath = cleanConcat(throughPath, rOut);

        const newRegex = cleanUnion(currentDirect, throughPath);
        R.set(edgeKey(u, v), newRegex);
      }
    }

    // Remove ripId from active list
    const ripIndex = activeInternal.indexOf(ripId);
    if (ripIndex !== -1) {
      activeInternal.splice(ripIndex, 1);
    }

    steps.push({
      eliminatedStateLabel: ripLabel,
      stepNumber: stepCount,
      remainingStates: activeInternal.map(id => stateMap.get(id)?.label || id),
    });
  }

  let finalRegex = R.get(edgeKey(startId, acceptId)) || '∅';

  // Post cleanup for common patterns
  if (finalRegex.startsWith('(') && finalRegex.endsWith(')')) {
    let depth = 0;
    let canUnwrap = true;
    for (let i = 0; i < finalRegex.length - 1; i++) {
      if (finalRegex[i] === '(') depth++;
      else if (finalRegex[i] === ')') depth--;
      if (depth === 0) {
        canUnwrap = false;
        break;
      }
    }
    if (canUnwrap) {
      finalRegex = finalRegex.slice(1, -1);
    }
  }

  return {
    regex: finalRegex,
    steps,
  };
}
