export type SimulationStatus = 'idle' | 'running' | 'accepted' | 'rejected';

export interface TraceEntry {
  step: number;
  description: string;
  activeStateIds: string[];
  activeTransitionIds: string[];
  remainingInput?: string;
}

export interface NFAActiveBranch {
  stateId: string;
  remainingInput: string;
  path: string[];
}

export interface SimulationStep {
  stepIndex: number;
  status: SimulationStatus;
  activeStateIds: string[];
  activeTransitionIds: string[];
  description: string;
  message?: string;
  
  dfaConfig?: {
    stateId: string;
    remainingInput: string;
    consumedInput: string;
  };
  
  nfaConfigs?: NFAActiveBranch[];
}

export interface SimulationEngineResult {
  steps: SimulationStep[];
  status: SimulationStatus;
  message: string;
  totalSteps: number;
}
