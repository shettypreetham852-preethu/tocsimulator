import { MachineType, Transition } from '../types/automata';

export const EPSILON = 'ε';

/**
 * Normalizes epsilon representations: '', 'λ', 'eps', 'epsilon', 'E' to 'ε'
 */
export function normalizeEpsilon(val: string | undefined): string {
  if (!val) return EPSILON;
  const trimmed = val.trim();
  if (trimmed === '' || trimmed === 'ε' || trimmed === 'λ' || trimmed.toLowerCase() === 'eps' || trimmed.toLowerCase() === 'epsilon') {
    return EPSILON;
  }
  return trimmed;
}

/**
 * Returns human-readable single transition label
 */
export function formatTransitionLabel(t: Transition, _type?: MachineType): string {
  return normalizeEpsilon(t.symbol);
}

/**
 * Merges parallel transitions between the same two states into a combined label
 */
export function mergeTransitionLabels(transitions: Transition[], type?: MachineType): string {
  if (transitions.length === 0) return '';
  const labels = transitions.map(t => formatTransitionLabel(t, type));
  const unique = Array.from(new Set(labels));
  return unique.join(', ');
}

/**
 * Parses user input string into transition fields based on machine type (DFA, NFA, or ENFA).
 */
export function parseTransitionInput(
  rawInput: string,
  type: MachineType
): { valid: boolean; error?: string; transition?: Partial<Transition> } {
  const str = rawInput.trim();
  const sym = normalizeEpsilon(str);

  if (type === 'DFA' && sym === EPSILON) {
    return { valid: false, error: 'DFA does not allow ε (epsilon) transitions.' };
  }

  if (type === 'NFA' && sym === EPSILON) {
    return {
      valid: false,
      error: 'Standard NFA does not allow ε-transitions. Switch machine type to ε-NFA to use ε.',
    };
  }

  return { valid: true, transition: { symbol: sym } };
}
