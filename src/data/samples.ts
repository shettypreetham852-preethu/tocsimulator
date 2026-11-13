import { Automaton, BatchTestItem } from '../types/automata';
import { EPSILON } from '../utils/labelParser';

export interface SampleMachineDef {
  id: string;
  name: string;
  description: string;
  automaton: Automaton;
  defaultInput: string;
  testSuite: BatchTestItem[];
}

export const SAMPLES: SampleMachineDef[] = [
  {
    id: 'dfa-div-3',
    name: 'DFA: Binary Divisible by 3',
    description: 'Accepts binary strings whose integer value is divisible by 3 (alphabet: {0, 1}).',
    defaultInput: '110',
    automaton: {
      type: 'DFA',
      alphabet: ['0', '1'],
      states: [
        { id: 's0', label: 'q0', isInitial: true, isFinal: true, x: 180, y: 220 },
        { id: 's1', label: 'q1', isInitial: false, isFinal: false, x: 420, y: 140 },
        { id: 's2', label: 'q2', isInitial: false, isFinal: false, x: 420, y: 300 },
      ],
      transitions: [
        { id: 't0', from: 's0', to: 's0', symbol: '0' },
        { id: 't1', from: 's0', to: 's1', symbol: '1' },
        { id: 't2', from: 's1', to: 's2', symbol: '0' },
        { id: 't3', from: 's1', to: 's0', symbol: '1' },
        { id: 't4', from: 's2', to: 's1', symbol: '0' },
        { id: 't5', from: 's2', to: 's2', symbol: '1' },
      ],
    },
    testSuite: [
      { id: 't-1', input: '0', expected: 'accept' },
      { id: 't-2', input: '11', expected: 'accept' },
      { id: 't-3', input: '110', expected: 'accept' },
      { id: 't-4', input: '1001', expected: 'accept' },
      { id: 't-5', input: '1100', expected: 'accept' },
      { id: 't-6', input: '1', expected: 'reject' },
      { id: 't-7', input: '10', expected: 'reject' },
      { id: 't-8', input: '100', expected: 'reject' },
      { id: 't-9', input: '101', expected: 'reject' },
      { id: 't-10', input: '111', expected: 'reject' },
    ],
  },
  {
    id: 'dfa-even-zeros-ones',
    name: 'DFA: Even 0s and Even 1s',
    description: 'Accepts strings containing both an even number of 0s and an even number of 1s (alphabet: {0, 1}).',
    defaultInput: '0011',
    automaton: {
      type: 'DFA',
      alphabet: ['0', '1'],
      states: [
        { id: 'ee', label: 'qEE', isInitial: true, isFinal: true, x: 200, y: 160 },
        { id: 'oe', label: 'qOE', isInitial: false, isFinal: false, x: 440, y: 160 },
        { id: 'eo', label: 'qEO', isInitial: false, isFinal: false, x: 200, y: 340 },
        { id: 'oo', label: 'qOO', isInitial: false, isFinal: false, x: 440, y: 340 },
      ],
      transitions: [
        { id: 't_ee_0', from: 'ee', to: 'oe', symbol: '0' },
        { id: 't_ee_1', from: 'ee', to: 'eo', symbol: '1' },
        { id: 't_oe_0', from: 'oe', to: 'ee', symbol: '0' },
        { id: 't_oe_1', from: 'oe', to: 'oo', symbol: '1' },
        { id: 't_eo_0', from: 'eo', to: 'oo', symbol: '0' },
        { id: 't_eo_1', from: 'eo', to: 'ee', symbol: '1' },
        { id: 't_oo_0', from: 'oo', to: 'eo', symbol: '0' },
        { id: 't_oo_1', from: 'oo', to: 'oe', symbol: '1' },
      ],
    },
    testSuite: [
      { id: 'e-1', input: '', expected: 'accept' },
      { id: 'e-2', input: '00', expected: 'accept' },
      { id: 'e-3', input: '11', expected: 'accept' },
      { id: 'e-4', input: '0011', expected: 'accept' },
      { id: 'e-5', input: '0101', expected: 'accept' },
      { id: 'e-6', input: '0', expected: 'reject' },
      { id: 'e-7', input: '1', expected: 'reject' },
      { id: 'e-8', input: '001', expected: 'reject' },
      { id: 'e-9', input: '011', expected: 'reject' },
    ],
  },
  {
    id: 'nfa-ends-01',
    name: 'NFA: Ending in "01"',
    description: 'Accepts all strings over {0, 1} that end with "01". Uses non-deterministic branching without ε-transitions.',
    defaultInput: '1001',
    automaton: {
      type: 'NFA',
      alphabet: ['0', '1'],
      states: [
        { id: 's0', label: 'q0', isInitial: true, isFinal: false, x: 180, y: 220 },
        { id: 's1', label: 'q1', isInitial: false, isFinal: false, x: 380, y: 220 },
        { id: 's2', label: 'q2', isInitial: false, isFinal: true, x: 580, y: 220 },
      ],
      transitions: [
        { id: 't0', from: 's0', to: 's0', symbol: '0' },
        { id: 't1', from: 's0', to: 's0', symbol: '1' },
        { id: 't2', from: 's0', to: 's1', symbol: '0' },
        { id: 't3', from: 's1', to: 's2', symbol: '1' },
      ],
    },
    testSuite: [
      { id: 'n-1', input: '01', expected: 'accept' },
      { id: 'n-2', input: '001', expected: 'accept' },
      { id: 'n-3', input: '101', expected: 'accept' },
      { id: 'n-4', input: '1101', expected: 'accept' },
      { id: 'n-5', input: '01001', expected: 'accept' },
      { id: 'n-6', input: '0', expected: 'reject' },
      { id: 'n-7', input: '1', expected: 'reject' },
      { id: 'n-8', input: '10', expected: 'reject' },
      { id: 'n-9', input: '010', expected: 'reject' },
      { id: 'n-10', input: '111', expected: 'reject' },
    ],
  },
  {
    id: 'enfa-anbncn',
    name: 'ε-NFA: a*b*c*',
    description: 'Accepts strings matching the language a*b*c*. Features ε-transitions chaining state q0 (a*) → q1 (b*) → q2 (c*).',
    defaultInput: 'aabbc',
    automaton: {
      type: 'ENFA',
      alphabet: ['a', 'b', 'c'],
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isFinal: true, x: 180, y: 220 },
        { id: 'q1', label: 'q1', isInitial: false, isFinal: true, x: 380, y: 220 },
        { id: 'q2', label: 'q2', isInitial: false, isFinal: true, x: 580, y: 220 },
      ],
      transitions: [
        { id: 't_a', from: 'q0', to: 'q0', symbol: 'a' },
        { id: 't_eps1', from: 'q0', to: 'q1', symbol: EPSILON },
        { id: 't_b', from: 'q1', to: 'q1', symbol: 'b' },
        { id: 't_eps2', from: 'q1', to: 'q2', symbol: EPSILON },
        { id: 't_c', from: 'q2', to: 'q2', symbol: 'c' },
      ],
    },
    testSuite: [
      { id: 'abc-1', input: '', expected: 'accept' },
      { id: 'abc-2', input: 'a', expected: 'accept' },
      { id: 'abc-3', input: 'b', expected: 'accept' },
      { id: 'abc-4', input: 'c', expected: 'accept' },
      { id: 'abc-5', input: 'aabbc', expected: 'accept' },
      { id: 'abc-6', input: 'aaaccc', expected: 'accept' },
      { id: 'abc-7', input: 'ba', expected: 'reject' },
      { id: 'abc-8', input: 'cba', expected: 'reject' },
      { id: 'abc-9', input: 'bca', expected: 'reject' },
    ],
  },
  {
    id: 'enfa-union-branches',
    name: 'ε-NFA: (ab | ba)',
    description: 'Uses initial ε-transitions to non-deterministically branch to either the "ab" path or the "ba" path.',
    defaultInput: 'ab',
    automaton: {
      type: 'ENFA',
      alphabet: ['a', 'b'],
      states: [
        { id: 'start', label: 'qStart', isInitial: true, isFinal: false, x: 140, y: 240 },
        { id: 'q_ab1', label: 'qAB1', isInitial: false, isFinal: false, x: 280, y: 150 },
        { id: 'q_ab2', label: 'qAB2', isInitial: false, isFinal: false, x: 420, y: 150 },
        { id: 'q_ba1', label: 'qBA1', isInitial: false, isFinal: false, x: 280, y: 330 },
        { id: 'q_ba2', label: 'qBA2', isInitial: false, isFinal: false, x: 420, y: 330 },
        { id: 'accept', label: 'qAcc', isInitial: false, isFinal: true, x: 560, y: 240 },
      ],
      transitions: [
        { id: 't_eps_top', from: 'start', to: 'q_ab1', symbol: EPSILON },
        { id: 't_eps_bot', from: 'start', to: 'q_ba1', symbol: EPSILON },
        { id: 't_a1', from: 'q_ab1', to: 'q_ab2', symbol: 'a' },
        { id: 't_b1', from: 'q_ab2', to: 'accept', symbol: 'b' },
        { id: 't_b2', from: 'q_ba1', to: 'q_ba2', symbol: 'b' },
        { id: 't_a2', from: 'q_ba2', to: 'accept', symbol: 'a' },
      ],
    },
    testSuite: [
      { id: 'u-1', input: 'ab', expected: 'accept' },
      { id: 'u-2', input: 'ba', expected: 'accept' },
      { id: 'u-3', input: 'a', expected: 'reject' },
      { id: 'u-4', input: 'b', expected: 'reject' },
      { id: 'u-5', input: 'aa', expected: 'reject' },
      { id: 'u-6', input: 'bb', expected: 'reject' },
    ],
  },
];
