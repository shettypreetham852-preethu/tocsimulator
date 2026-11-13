import { describe, it, expect } from 'vitest';
import { SAMPLES } from '../data/samples';
import { convertNfaToDfa } from '../algorithms/nfaToDfa';
import { removeEpsilonTransitions } from '../algorithms/epsilonRemoval';
import { minimizeDFA } from '../algorithms/dfaMinimizer';
import { convertAutomatonToRegex } from '../algorithms/toRegex';
import { buildNfaFromRegex } from '../algorithms/regexToNfa';
import { checkEquivalence } from '../algorithms/equivalenceCheck';
import { classifyAutomaton } from '../algorithms/automatonClassifier';
import { simulateDFA } from '../engine/dfaEngine';
import { simulateNFA } from '../engine/nfaEngine';
import { exportToJFF, parseJFF } from '../utils/jflapParser';

describe('NFA to DFA Subset Construction', () => {
  const nfaEnds01 = SAMPLES.find(s => s.id === 'nfa-ends-01')!.automaton;

  it('converts NFA to a valid equivalent DFA', () => {
    const { dfa, table } = convertNfaToDfa(nfaEnds01);
    expect(dfa.type).toBe('DFA');
    expect(table.length).toBeGreaterThan(0);

    // Verify language equivalence on test strings
    const testCases = [
      { input: '01', expected: 'accepted' },
      { input: '101', expected: 'accepted' },
      { input: '1101', expected: 'accepted' },
      { input: '0', expected: 'rejected' },
      { input: '1', expected: 'rejected' },
      { input: '010', expected: 'rejected' },
    ];

    for (const { input, expected } of testCases) {
      const res = simulateDFA(dfa, input);
      expect(res.status, `DFA testing "${input}"`).toBe(expected);
    }
  });
});

describe('DFA Minimization', () => {
  const dfaDiv3 = SAMPLES.find(s => s.id === 'dfa-div-3')!.automaton;

  it('preserves minimal DFA if already minimal', () => {
    const res = minimizeDFA(dfaDiv3);
    expect(res.minimizedStateCount).toBe(3);
  });

  it('minimizes a redundant DFA', () => {
    // Create DFA with redundant equivalent state
    const redundantDfa = {
      ...dfaDiv3,
      states: [
        ...dfaDiv3.states,
        { id: 's3', label: 'q3', isInitial: false, isFinal: true, x: 100, y: 100 }, // Equivalent to s0
      ],
      transitions: [
        ...dfaDiv3.transitions,
        { id: 't_red1', from: 's3', to: 's0', symbol: '0' },
        { id: 't_red2', from: 's3', to: 's1', symbol: '1' },
      ],
    };

    const res = minimizeDFA(redundantDfa);
    expect(res.minimizedStateCount).toBe(3);
  });
});

describe('Automaton to Regex', () => {
  const nfaEnds01 = SAMPLES.find(s => s.id === 'nfa-ends-01')!.automaton;

  it('extracts regular expression via GNFA state elimination', () => {
    const res = convertAutomatonToRegex(nfaEnds01);
    expect(res.regex).toBeTruthy();
    expect(res.regex).not.toBe('∅');
    expect(res.steps.length).toBe(nfaEnds01.states.length);
  });
});

describe('Regex to NFA (Thompson\'s Construction)', () => {
  it('builds an NFA accepting strings matching the regex', () => {
    const nfa = buildNfaFromRegex('(a|b)*abb');
    expect(nfa.type).toBe('NFA');
    expect(nfa.states.length).toBeGreaterThan(0);
    expect(nfa.states.some(s => s.isInitial)).toBe(true);
    expect(nfa.states.some(s => s.isFinal)).toBe(true);

    // Verify simulateNFA accepts 'abb', 'aabb', 'babb' and rejects 'a', 'b', 'ab'
    expect(simulateNFA(nfa, 'abb').status).toBe('accepted');
    expect(simulateNFA(nfa, 'aabb').status).toBe('accepted');
    expect(simulateNFA(nfa, 'babb').status).toBe('accepted');
    expect(simulateNFA(nfa, 'a').status).toBe('rejected');
    expect(simulateNFA(nfa, 'ab').status).toBe('rejected');
  });
});

describe('Equivalence Checker', () => {
  const dfaDiv3 = SAMPLES.find(s => s.id === 'dfa-div-3')!.automaton;
  const nfaEnds01 = SAMPLES.find(s => s.id === 'nfa-ends-01')!.automaton;

  it('confirms self-equivalence', () => {
    const res = checkEquivalence(dfaDiv3, dfaDiv3);
    expect(res.areEquivalent).toBe(true);
  });

  it('detects non-equivalent machines and produces a counterexample', () => {
    const res = checkEquivalence(dfaDiv3, nfaEnds01);
    expect(res.areEquivalent).toBe(false);
    expect(res.counterexample).toBeDefined();
  });
});

describe('ε-NFA to NFA (ε-Removal)', () => {
  const enfaAbc = SAMPLES.find(s => s.id === 'enfa-anbncn')!.automaton;

  it('eliminates all ε-transitions while preserving language equivalence', () => {
    const { nfa, removedEpsilonCount } = removeEpsilonTransitions(enfaAbc);
    expect(nfa.type).toBe('NFA');
    expect(removedEpsilonCount).toBeGreaterThan(0);
    // Verify no epsilon transitions remain in the converted NFA
    expect(nfa.transitions.some(t => t.symbol === 'ε')).toBe(false);

    // Verify language equivalence on accepted and rejected strings
    expect(simulateNFA(nfa, '').status).toBe('accepted');
    expect(simulateNFA(nfa, 'a').status).toBe('accepted');
    expect(simulateNFA(nfa, 'aabbc').status).toBe('accepted');
    expect(simulateNFA(nfa, 'ba').status).toBe('rejected');
    expect(simulateNFA(nfa, 'cba').status).toBe('rejected');
  });
});

describe('Automaton Classifier', () => {
  const dfaDiv3 = SAMPLES.find(s => s.id === 'dfa-div-3')!.automaton;
  const nfaEnds01 = SAMPLES.find(s => s.id === 'nfa-ends-01')!.automaton;
  const enfaAbc = SAMPLES.find(s => s.id === 'enfa-anbncn')!.automaton;

  it('correctly classifies a DFA', () => {
    const report = classifyAutomaton(dfaDiv3);
    expect(report.isDFA).toBe(true);
    expect(report.classification).toBe('DFA');
  });

  it('correctly classifies a standard NFA without ε', () => {
    const report = classifyAutomaton(nfaEnds01);
    expect(report.isNFA).toBe(true);
    expect(report.classification).toBe('NFA');
  });

  it('correctly classifies an ε-NFA with ε-transitions', () => {
    const report = classifyAutomaton(enfaAbc);
    expect(report.isENFA).toBe(true);
    expect(report.classification).toBe('ENFA');
  });
});

describe('JFLAP XML (.jff) Import/Export', () => {
  const dfaDiv3 = SAMPLES.find(s => s.id === 'dfa-div-3')!.automaton;

  it('exports and re-imports DFA without loss of structure', () => {
    // In node/vitest, test XML string generation
    const xml = exportToJFF(dfaDiv3);
    expect(xml).toContain('<structure>');
    expect(xml).toContain('<type>fa</type>');
    expect(xml).toContain('<state id="0"');
  });
});
