import { Automaton, State, Transition } from '../types/automata';
import { EPSILON } from '../utils/labelParser';
import { generateId } from '../utils/idGenerator';

interface Fragment {
  start: string;
  accept: string;
  states: State[];
  transitions: Transition[];
}

/**
 * Preprocesses regex:
 * 1. Inserts explicit concatenation operator '.' where needed
 * 2. Converts infix to postfix using Shunting-Yard
 */
function toPostfix(regex: string): string {
  // Clean whitespace
  const clean = regex.replace(/\s+/g, '');
  if (!clean) return '';

  // Insert explicit concatenation operator '.'
  let formatted = '';
  const isSymbol = (c: string) => /[a-zA-Z0-9ελε]/.test(c) || c === 'ε' || c === 'λ';

  for (let i = 0; i < clean.length; i++) {
    const c1 = clean[i];
    formatted += c1;

    if (i + 1 < clean.length) {
      const c2 = clean[i + 1];
      // Insert '.' if:
      // - symbol followed by symbol: 'ab' -> 'a.b'
      // - symbol followed by '(': 'a(' -> 'a.('
      // - ')' followed by symbol: ')a' -> ').a'
      // - ')' followed by '(': ')(' -> ').('
      // - '*' or '+' or '?' followed by symbol or '(': 'a*b' -> 'a*.b'
      const c1CanEnd = isSymbol(c1) || c1 === ')' || c1 === '*' || c1 === '+' || c1 === '?';
      const c2CanStart = isSymbol(c2) || c2 === '(';

      if (c1CanEnd && c2CanStart) {
        formatted += '.';
      }
    }
  }

  // Precedence map
  const precedence: Record<string, number> = {
    '*': 3,
    '+': 3,
    '?': 3,
    '.': 2,
    '|': 1,
  };

  const output: string[] = [];
  const stack: string[] = [];

  for (let i = 0; i < formatted.length; i++) {
    const token = formatted[i];

    if (token === '(') {
      stack.push(token);
    } else if (token === ')') {
      while (stack.length > 0 && stack[stack.length - 1] !== '(') {
        output.push(stack.pop()!);
      }
      stack.pop(); // Pop '('
    } else if (precedence[token]) {
      // Unary operators (*, +, ?) are right-associative
      while (
        stack.length > 0 &&
        stack[stack.length - 1] !== '(' &&
        precedence[stack[stack.length - 1]] >= precedence[token] &&
        token !== '*' && token !== '+' && token !== '?'
      ) {
        output.push(stack.pop()!);
      }
      stack.push(token);
    } else {
      // Literal
      output.push(token);
    }
  }

  while (stack.length > 0) {
    output.push(stack.pop()!);
  }

  return output.join('');
}

export function buildNfaFromRegex(regex: string): Automaton {
  const postfix = toPostfix(regex);
  if (!postfix) {
    const s0: State = { id: generateId('s'), label: 'q0', isInitial: true, isFinal: true, x: 200, y: 250 };
    return {
      type: 'NFA',
      states: [s0],
      transitions: [],
      alphabet: [],
    };
  }

  let stateCounter = 0;
  const createNode = (): State => ({
    id: generateId('s'),
    label: `q${stateCounter++}`,
    isInitial: false,
    isFinal: false,
    x: 0,
    y: 0,
  });

  const stack: Fragment[] = [];

  for (let i = 0; i < postfix.length; i++) {
    const token = postfix[i];

    if (token === '.') {
      // Concatenation
      if (stack.length < 2) continue;
      const f2 = stack.pop()!;
      const f1 = stack.pop()!;

      // Link f1.accept to f2.start with ε
      const bridgeTransition: Transition = {
        id: generateId('tr'),
        from: f1.accept,
        to: f2.start,
        symbol: EPSILON,
      };

      stack.push({
        start: f1.start,
        accept: f2.accept,
        states: [...f1.states, ...f2.states],
        transitions: [...f1.transitions, ...f2.transitions, bridgeTransition],
      });
    } else if (token === '|') {
      // Union
      if (stack.length < 2) continue;
      const f2 = stack.pop()!;
      const f1 = stack.pop()!;

      const start = createNode();
      const accept = createNode();

      const newTransitions: Transition[] = [
        { id: generateId('tr'), from: start.id, to: f1.start, symbol: EPSILON },
        { id: generateId('tr'), from: start.id, to: f2.start, symbol: EPSILON },
        { id: generateId('tr'), from: f1.accept, to: accept.id, symbol: EPSILON },
        { id: generateId('tr'), from: f2.accept, to: accept.id, symbol: EPSILON },
      ];

      stack.push({
        start: start.id,
        accept: accept.id,
        states: [start, accept, ...f1.states, ...f2.states],
        transitions: [...f1.transitions, ...f2.transitions, ...newTransitions],
      });
    } else if (token === '*') {
      // Kleene Star
      if (stack.length < 1) continue;
      const f = stack.pop()!;

      const start = createNode();
      const accept = createNode();

      const newTransitions: Transition[] = [
        { id: generateId('tr'), from: start.id, to: f.start, symbol: EPSILON },
        { id: generateId('tr'), from: start.id, to: accept.id, symbol: EPSILON },
        { id: generateId('tr'), from: f.accept, to: f.start, symbol: EPSILON },
        { id: generateId('tr'), from: f.accept, to: accept.id, symbol: EPSILON },
      ];

      stack.push({
        start: start.id,
        accept: accept.id,
        states: [start, accept, ...f.states],
        transitions: [...f.transitions, ...newTransitions],
      });
    } else if (token === '+') {
      // Kleene Plus: one or more
      if (stack.length < 1) continue;
      const f = stack.pop()!;

      const start = createNode();
      const accept = createNode();

      const newTransitions: Transition[] = [
        { id: generateId('tr'), from: start.id, to: f.start, symbol: EPSILON },
        { id: generateId('tr'), from: f.accept, to: f.start, symbol: EPSILON },
        { id: generateId('tr'), from: f.accept, to: accept.id, symbol: EPSILON },
      ];

      stack.push({
        start: start.id,
        accept: accept.id,
        states: [start, accept, ...f.states],
        transitions: [...f.transitions, ...newTransitions],
      });
    } else if (token === '?') {
      // Optional: zero or one
      if (stack.length < 1) continue;
      const f = stack.pop()!;

      const start = createNode();
      const accept = createNode();

      const newTransitions: Transition[] = [
        { id: generateId('tr'), from: start.id, to: f.start, symbol: EPSILON },
        { id: generateId('tr'), from: start.id, to: accept.id, symbol: EPSILON },
        { id: generateId('tr'), from: f.accept, to: accept.id, symbol: EPSILON },
      ];

      stack.push({
        start: start.id,
        accept: accept.id,
        states: [start, accept, ...f.states],
        transitions: [...f.transitions, ...newTransitions],
      });
    } else {
      // Base symbol (literal or ε)
      const sym = (token === 'ε' || token === 'λ') ? EPSILON : token;
      const start = createNode();
      const accept = createNode();

      stack.push({
        start: start.id,
        accept: accept.id,
        states: [start, accept],
        transitions: [
          { id: generateId('tr'), from: start.id, to: accept.id, symbol: sym },
        ],
      });
    }
  }

  const finalFragment = stack.pop();
  if (!finalFragment) {
    throw new Error('Invalid regular expression.');
  }

  // Mark initial and final
  for (const s of finalFragment.states) {
    if (s.id === finalFragment.start) s.isInitial = true;
    if (s.id === finalFragment.accept) s.isFinal = true;
  }

  // Topological / BFS layout to assign pleasant X, Y coordinates
  const adj = new Map<string, string[]>();
  for (const t of finalFragment.transitions) {
    if (!adj.has(t.from)) adj.set(t.from, []);
    adj.get(t.from)!.push(t.to);
  }

  const distances = new Map<string, number>();
  distances.set(finalFragment.start, 0);
  const queue = [finalFragment.start];

  while (queue.length > 0) {
    const cur = queue.shift()!;
    const d = distances.get(cur)!;
    const neighbors = adj.get(cur) || [];
    for (const n of neighbors) {
      if (!distances.has(n)) {
        distances.set(n, d + 1);
        queue.push(n);
      }
    }
  }

  // Group states by distance
  const layers = new Map<number, State[]>();
  finalFragment.states.forEach(s => {
    const dist = distances.get(s.id) || 0;
    if (!layers.has(dist)) layers.set(dist, []);
    layers.get(dist)!.push(s);
  });

  const layerKeys = Array.from(layers.keys()).sort((a, b) => a - b);
  const startX = 140;
  const startY = 260;
  const spacingX = 160;
  const spacingY = 110;

  layerKeys.forEach(l => {
    const statesInLayer = layers.get(l)!;
    const count = statesInLayer.length;
    statesInLayer.forEach((st, idx) => {
      st.x = startX + l * spacingX;
      st.y = startY + (idx - (count - 1) / 2) * spacingY;
    });
  });

  // Extract alphabet
  const alphabet = Array.from(
    new Set(
      finalFragment.transitions
        .map(t => t.symbol)
        .filter((s): s is string => !!s && s !== EPSILON)
    )
  ).sort();

  return {
    type: 'NFA',
    states: finalFragment.states,
    transitions: finalFragment.transitions,
    alphabet,
  };
}
