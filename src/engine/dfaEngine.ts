import { Automaton } from '../types/automata';
import { SimulationEngineResult, SimulationStep } from './types';
import { normalizeEpsilon } from '../utils/labelParser';

export function simulateDFA(automaton: Automaton, inputString: string): SimulationEngineResult {
  const steps: SimulationStep[] = [];
  const stateMap = new Map(automaton.states.map(s => [s.id, s]));
  const initialState = automaton.states.find(s => s.isInitial);

  if (!initialState) {
    return {
      steps: [{
        stepIndex: 0,
        status: 'rejected',
        activeStateIds: [],
        activeTransitionIds: [],
        description: 'Error: No initial state designated',
        message: 'No initial state defined for DFA.',
      }],
      status: 'rejected',
      message: 'No initial state defined.',
      totalSteps: 1,
    };
  }

  let currentState = initialState;
  let remaining = inputString;
  let consumed = '';
  let stepIndex = 0;

  // Step 0: Initial state
  steps.push({
    stepIndex,
    status: remaining.length === 0 ? (currentState.isFinal ? 'accepted' : 'rejected') : 'running',
    activeStateIds: [currentState.id],
    activeTransitionIds: [],
    description: `Start at ${currentState.label} with input "${inputString}"`,
    dfaConfig: {
      stateId: currentState.id,
      remainingInput: remaining,
      consumedInput: consumed,
    },
  });

  if (remaining.length === 0) {
    const isAcc = currentState.isFinal;
    steps[0].status = isAcc ? 'accepted' : 'rejected';
    steps[0].message = isAcc
      ? `Empty string accepted in final state ${currentState.label}.`
      : `Empty string rejected: state ${currentState.label} is not a final state.`;
    return {
      steps,
      status: steps[0].status,
      message: steps[0].message,
      totalSteps: 1,
    };
  }

  while (remaining.length > 0) {
    stepIndex++;
    const nextChar = remaining[0];
    
    // Find matching transition
    const transition = automaton.transitions.find(t => 
      t.from === currentState.id && normalizeEpsilon(t.symbol) === nextChar
    );

    if (!transition) {
      // No transition on this symbol -> Rejection
      steps.push({
        stepIndex,
        status: 'rejected',
        activeStateIds: [currentState.id],
        activeTransitionIds: [],
        description: `No transition from ${currentState.label} on symbol '${nextChar}'. Rejection.`,
        message: `Rejected: trapped at state ${currentState.label} with no transition on symbol '${nextChar}'.`,
        dfaConfig: {
          stateId: currentState.id,
          remainingInput: remaining,
          consumedInput: consumed,
        },
      });
      return {
        steps,
        status: 'rejected',
        message: `Rejected: no transition from ${currentState.label} on symbol '${nextChar}'.`,
        totalSteps: steps.length,
      };
    }

    const nextState = stateMap.get(transition.to);
    if (!nextState) {
      steps.push({
        stepIndex,
        status: 'rejected',
        activeStateIds: [currentState.id],
        activeTransitionIds: [transition.id],
        description: `Target state missing. Rejection.`,
        message: 'Invalid target state ID.',
        dfaConfig: {
          stateId: currentState.id,
          remainingInput: remaining,
          consumedInput: consumed,
        },
      });
      return {
        steps,
        status: 'rejected',
        message: 'Invalid target state ID.',
        totalSteps: steps.length,
      };
    }

    consumed += nextChar;
    remaining = remaining.slice(1);
    currentState = nextState;

    const isEnd = remaining.length === 0;
    const isAccepted = isEnd && currentState.isFinal;
    const isRejected = isEnd && !currentState.isFinal;
    const currentStatus = isAccepted ? 'accepted' : isRejected ? 'rejected' : 'running';

    let desc = `Read '${nextChar}', transitioned ${transition.from === transition.to ? 'looping on' : 'to'} ${currentState.label}`;
    if (isAccepted) {
      desc += ` (Accepting state reached with full input consumed)`;
    } else if (isRejected) {
      desc += ` (Full input consumed, but ${currentState.label} is not an accepting state)`;
    }

    steps.push({
      stepIndex,
      status: currentStatus,
      activeStateIds: [currentState.id],
      activeTransitionIds: [transition.id],
      description: desc,
      message: isAccepted
        ? `Accepted: Finished input in accepting state ${currentState.label}.`
        : isRejected
        ? `Rejected: Finished input in non-accepting state ${currentState.label}.`
        : undefined,
      dfaConfig: {
        stateId: currentState.id,
        remainingInput: remaining,
        consumedInput: consumed,
      },
    });
  }

  const finalStep = steps[steps.length - 1];
  return {
    steps,
    status: finalStep.status,
    message: finalStep.message || (finalStep.status === 'accepted' ? 'Accepted' : 'Rejected'),
    totalSteps: steps.length,
  };
}
