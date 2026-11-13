import { useState, useCallback, useRef } from 'react';
import { Automaton } from '../types/automata';

export function useHistory(initialState: Automaton) {
  const [present, setPresent] = useState<Automaton>(initialState);
  const pastRef = useRef<Automaton[]>([]);
  const futureRef = useRef<Automaton[]>([]);

  const pushState = useCallback((newAutomaton: Automaton) => {
    setPresent((current) => {
      pastRef.current = [...pastRef.current.slice(-49), current];
      futureRef.current = [];
      return newAutomaton;
    });
  }, []);

  const undo = useCallback(() => {
    if (pastRef.current.length === 0) return;
    setPresent((current) => {
      const previous = pastRef.current[pastRef.current.length - 1];
      pastRef.current = pastRef.current.slice(0, pastRef.current.length - 1);
      futureRef.current = [current, ...futureRef.current];
      return previous;
    });
  }, []);

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return;
    setPresent((current) => {
      const next = futureRef.current[0];
      futureRef.current = futureRef.current.slice(1);
      pastRef.current = [...pastRef.current, current];
      return next;
    });
  }, []);

  const reset = useCallback((newInitial: Automaton) => {
    pastRef.current = [];
    futureRef.current = [];
    setPresent(newInitial);
  }, []);

  return {
    automaton: present,
    setAutomaton: pushState,
    undo,
    redo,
    canUndo: pastRef.current.length > 0,
    canRedo: futureRef.current.length > 0,
    reset,
  };
}
