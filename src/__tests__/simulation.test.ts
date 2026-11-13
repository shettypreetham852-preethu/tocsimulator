import { describe, it, expect } from 'vitest';
import { SAMPLES } from '../data/samples';
import { simulateDFA } from '../engine/dfaEngine';
import { simulateNFA } from '../engine/nfaEngine';

describe('DFA Simulation Engine', () => {
  const dfaDiv3 = SAMPLES.find(s => s.id === 'dfa-div-3')!.automaton;
  const dfaEven = SAMPLES.find(s => s.id === 'dfa-even-zeros-ones')!.automaton;

  it('accepts binary numbers divisible by 3', () => {
    const acceptStrings = ['0', '11', '110', '1001', '1100', '1111'];
    for (const str of acceptStrings) {
      const result = simulateDFA(dfaDiv3, str);
      expect(result.status, `Testing accept: "${str}"`).toBe('accepted');
    }
  });

  it('rejects binary numbers not divisible by 3', () => {
    const rejectStrings = ['1', '10', '100', '101', '111', '1000'];
    for (const str of rejectStrings) {
      const result = simulateDFA(dfaDiv3, str);
      expect(result.status, `Testing reject: "${str}"`).toBe('rejected');
    }
  });

  it('accepts strings with even 0s and even 1s', () => {
    const acceptStrings = ['', '00', '11', '0011', '0101', '1010', '110011'];
    for (const str of acceptStrings) {
      const result = simulateDFA(dfaEven, str);
      expect(result.status, `Testing even accept: "${str}"`).toBe('accepted');
    }
  });

  it('rejects strings with odd 0s or odd 1s', () => {
    const rejectStrings = ['0', '1', '001', '011', '1110', '100'];
    for (const str of rejectStrings) {
      const result = simulateDFA(dfaEven, str);
      expect(result.status, `Testing even reject: "${str}"`).toBe('rejected');
    }
  });
});

describe('NFA & ε-NFA Simulation Engine', () => {
  const nfaEnds01 = SAMPLES.find(s => s.id === 'nfa-ends-01')!.automaton;
  const enfaAbc = SAMPLES.find(s => s.id === 'enfa-anbncn')!.automaton;
  const enfaUnion = SAMPLES.find(s => s.id === 'enfa-union-branches')!.automaton;

  it('accepts strings ending with "01" on standard NFA', () => {
    const acceptStrings = ['01', '001', '101', '1101', '01001', '1110001'];
    for (const str of acceptStrings) {
      const result = simulateNFA(nfaEnds01, str);
      expect(result.status, `Testing NFA accept: "${str}"`).toBe('accepted');
    }
  });

  it('rejects strings not ending with "01" on standard NFA', () => {
    const rejectStrings = ['0', '1', '10', '010', '111', '000'];
    for (const str of rejectStrings) {
      const result = simulateNFA(nfaEnds01, str);
      expect(result.status, `Testing NFA reject: "${str}"`).toBe('rejected');
    }
  });

  it('accepts strings matching a*b*c* on ε-NFA with ε-transitions', () => {
    const acceptStrings = ['', 'a', 'b', 'c', 'aabbc', 'aaaccc', 'abc'];
    for (const str of acceptStrings) {
      const result = simulateNFA(enfaAbc, str);
      expect(result.status, `Testing ε-NFA accept: "${str}"`).toBe('accepted');
    }
  });

  it('rejects strings not matching a*b*c* on ε-NFA', () => {
    const rejectStrings = ['ba', 'cba', 'bca', 'cb'];
    for (const str of rejectStrings) {
      const result = simulateNFA(enfaAbc, str);
      expect(result.status, `Testing ε-NFA reject: "${str}"`).toBe('rejected');
    }
  });

  it('accepts union branches (ab | ba) on ε-NFA', () => {
    expect(simulateNFA(enfaUnion, 'ab').status).toBe('accepted');
    expect(simulateNFA(enfaUnion, 'ba').status).toBe('accepted');
    expect(simulateNFA(enfaUnion, 'a').status).toBe('rejected');
    expect(simulateNFA(enfaUnion, 'b').status).toBe('rejected');
    expect(simulateNFA(enfaUnion, 'aa').status).toBe('rejected');
  });
});
