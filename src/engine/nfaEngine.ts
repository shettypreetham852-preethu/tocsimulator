import { Automaton } from '../types/automata';
import { NFAActiveBranch, SimulationEngineResult, SimulationStep } from './types';
import { EPSILON, normalizeEpsilon } from '../utils/labelParser';

/**
 * Computes epsilon-closure of a set of states.
 * Returns array of state IDs and the transition IDs traversed.
 */
export function computeEpsilonClosure(
  stateIds: string[],
  automaton: Automaton
): { states: string[]; traversedTransitions: string[] } {
  const closure = new Set<string>(stateIds);
  const queue = [...stateIds];
  const traversed = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    const epsTransitions = automaton.transitions.filter(
      t => t.from === current && normalizeEpsilon(t.symbol) === EPSILON
    );

    for (const t of epsTransitions) {
      traversed.add(t.id);
      if (!closure.has(t.to)) {
        closure.add(t.to);
        queue.push(t.to);
      }
    }
  }

  return {
    states: Array.from(closure),
    traversedTransitions: Array.from(traversed),
  };
}

export function simulateNFA(automaton: Automaton, inputString: string): SimulationEngineResult {
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
        message: 'No initial state defined for NFA.',
      }],
      status: 'rejected',
      message: 'No initial state defined.',
      totalSteps: 1,
    };
  }

  const steps: SimulationStep[] = [];
  const finalStateIds = new Set(automaton.states.filter(s => s.isFinal).map(s => s.id));

  // Compute initial epsilon closure
  const initClosure = computeEpsilonClosure([initialState.id], automaton);
  let currentBranches: NFAActiveBranch[] = initClosure.states.map(sId => ({
    stateId: sId,
    remainingInput: inputString,
    path: [stateMap.get(sId)?.label || sId],
  }));

  let stepIndex = 0;
  const isInitiallyAccepted = inputString.length === 0 && currentBranches.some(b => finalStateIds.has(b.stateId));

  const stateNames = (ids: string[]) => ids.map(id => stateMap.get(id)?.label || id).sort().join(', ');

  steps.push({
    stepIndex,
    status: inputString.length === 0
      ? (isInitiallyAccepted ? 'accepted' : 'rejected')
      : 'running',
    activeStateIds: Array.from(new Set(currentBranches.map(b => b.stateId))),
    activeTransitionIds: initClosure.traversedTransitions,
    description: `Start at ${initialState.label}${
      initClosure.states.length > 1
        ? ` with ε-closure {${stateNames(initClosure.states)}}`
        : ''
    }`,
    nfaConfigs: currentBranches,
  });

  if (inputString.length === 0) {
    steps[0].message = isInitiallyAccepted
      ? `Empty string accepted in final state(s): {${stateNames(currentBranches.filter(b => finalStateIds.has(b.stateId)).map(b => b.stateId))}}.`
      : `Empty string rejected: no active state in {${stateNames(currentBranches.map(b => b.stateId))}} is final.`;
    return {
      steps,
      status: steps[0].status,
      message: steps[0].message,
      totalSteps: 1,
    };
  }

  let charIndex = 0;
  while (charIndex < inputString.length) {
    stepIndex++;
    const nextChar = inputString[charIndex];
    charIndex++;

    const nextBranches: NFAActiveBranch[] = [];
    const usedTransitions = new Set<string>();

    for (const branch of currentBranches) {
      // Find all transitions matching nextChar from branch.stateId
      const matchingTransitions = automaton.transitions.filter(
        t => t.from === branch.stateId && normalizeEpsilon(t.symbol) === nextChar
      );

      for (const t of matchingTransitions) {
        usedTransitions.add(t.id);
        // Compute epsilon closure of target state
        const targetClosure = computeEpsilonClosure([t.to], automaton);
        for (const trId of targetClosure.traversedTransitions) {
          usedTransitions.add(trId);
        }

        const targetLabel = stateMap.get(t.to)?.label || t.to;
        for (const clStateId of targetClosure.states) {
          const clLabel = stateMap.get(clStateId)?.label || clStateId;
          const newPath = [...branch.path, `${nextChar}→${targetLabel}${clStateId !== t.to ? `(ε→${clLabel})` : ''}`];
          nextBranches.push({
            stateId: clStateId,
            remainingInput: inputString.slice(charIndex),
            path: newPath,
          });
        }
      }
    }

    // Deduplicate branches by stateId (and keep the shortest path)
    const branchMap = new Map<string, NFAActiveBranch>();
    for (const b of nextBranches) {
      if (!branchMap.has(b.stateId) || branchMap.get(b.stateId)!.path.length > b.path.length) {
        branchMap.set(b.stateId, b);
      }
    }
    currentBranches = Array.from(branchMap.values());

    const activeStateIds = currentBranches.map(b => b.stateId);
    const isEnd = charIndex === inputString.length;
    const hasFinalState = currentBranches.some(b => finalStateIds.has(b.stateId));

    let status: SimulationStep['status'] = 'running';
    let message: string | undefined;

    if (currentBranches.length === 0) {
      status = 'rejected';
      message = `Rejected: No active transitions on symbol '${nextChar}'. Computation died.`;
    } else if (isEnd) {
      if (hasFinalState) {
        status = 'accepted';
        const acceptingStates = currentBranches
          .filter(b => finalStateIds.has(b.stateId))
          .map(b => stateMap.get(b.stateId)?.label || b.stateId);
        message = `Accepted: Reached accepting state(s) {${acceptingStates.join(', ')}} on end of input.`;
      } else {
        status = 'rejected';
        message = `Rejected: Finished input, but active states {${stateNames(activeStateIds)}} contain no accepting state.`;
      }
    }

    steps.push({
      stepIndex,
      status,
      activeStateIds,
      activeTransitionIds: Array.from(usedTransitions),
      description: currentBranches.length > 0
        ? `Read '${nextChar}', active states: {${stateNames(activeStateIds)}}`
        : `Read '${nextChar}', no valid paths remain (all branches trapped)`,
      message,
      nfaConfigs: currentBranches,
    });

    if (currentBranches.length === 0) {
      break;
    }
  }

  const finalStep = steps[steps.length - 1];
  return {
    steps,
    status: finalStep.status,
    message: finalStep.message || (finalStep.status === 'accepted' ? 'Accepted' : 'Rejected'),
    totalSteps: steps.length,
  };
}
