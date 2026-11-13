export type MachineType = 'DFA' | 'NFA' | 'ENFA';

export interface State {
  id: string;
  label: string;
  isInitial: boolean;
  isFinal: boolean;
  x: number;
  y: number;
}

export interface Transition {
  id: string;
  from: string; // Source state ID
  to: string;   // Target state ID
  symbol?: string; // Symbol or 'ε' / 'λ' / ''
}

export interface Automaton {
  type: MachineType;
  states: State[];
  transitions: Transition[];
  alphabet?: string[];
}

export type EditorTool = 'select' | 'addState' | 'addTransition' | 'delete';

export interface BatchTestItem {
  id: string;
  input: string;
  expected: 'accept' | 'reject' | 'auto';
  actual?: 'accept' | 'reject';
  steps?: number;
  passed?: boolean;
}
