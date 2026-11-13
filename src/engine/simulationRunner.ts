import { Automaton } from '../types/automata';
import { SimulationEngineResult } from './types';
import { simulateDFA } from './dfaEngine';
import { simulateNFA } from './nfaEngine';

export function runSimulation(
  automaton: Automaton,
  inputString: string
): SimulationEngineResult {
  switch (automaton.type) {
    case 'DFA':
      return simulateDFA(automaton, inputString);
    case 'NFA':
    case 'ENFA':
      return simulateNFA(automaton, inputString);
    default:
      return {
        steps: [],
        status: 'rejected',
        message: 'Unknown machine type',
        totalSteps: 0,
      };
  }
}
