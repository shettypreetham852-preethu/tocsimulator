import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Automaton, BatchTestItem, MachineType } from './types/automata';
import { SAMPLES, SampleMachineDef } from './data/samples';
import { useHistory } from './hooks/useHistory';
import { useTheme } from './hooks/useTheme';
import { runSimulation } from './engine/simulationRunner';
import { convertNfaToDfa, NFAToDFAResult } from './algorithms/nfaToDfa';
import { removeEpsilonTransitions, EpsilonRemovalResult } from './algorithms/epsilonRemoval';
import { minimizeDFA, MinimizationResult } from './algorithms/dfaMinimizer';
import { convertAutomatonToRegex, ToRegexResult } from './algorithms/toRegex';
import { Navbar } from './components/header/Navbar';
import { CanvasArea } from './components/canvas/CanvasArea';
import { SimulationControlBar } from './components/simulation/SimulationControlBar';
import { SimulationPanel } from './components/simulation/SimulationPanel';
import { EpsilonRemovalModal } from './components/modals/EpsilonRemovalModal';
import { NfaToDfaModal } from './components/modals/NfaToDfaModal';
import { MinimizationModal } from './components/modals/MinimizationModal';
import { ToRegexModal } from './components/modals/ToRegexModal';
import { RegexToNfaModal } from './components/modals/RegexToNfaModal';
import { EquivalenceModal } from './components/modals/EquivalenceModal';
import { ClassifierModal } from './components/modals/ClassifierModal';
import { HelpModal } from './components/modals/HelpModal';
import { ExportModal } from './components/modals/ExportModal';

export function App() {
  const { theme, toggleTheme } = useTheme();
  const initialSample = SAMPLES[0]; // DFA Divisible by 3

  // Automaton state with undo/redo history
  const {
    automaton,
    setAutomaton,
    undo,
    redo,
    canUndo,
    canRedo,
    reset: resetAutomatonHistory,
  } = useHistory(initialSample.automaton);

  // Simulation state
  const [inputString, setInputString] = useState(initialSample.defaultInput);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(600);

  // Batch testing suite
  const [testSuite, setTestSuite] = useState<BatchTestItem[]>(initialSample.testSuite);

  // Modal states
  const [epsilonRemovalOpen, setEpsilonRemovalOpen] = useState(false);
  const [epsilonRemovalResult, setEpsilonRemovalResult] = useState<EpsilonRemovalResult | null>(null);

  const [nfaToDfaOpen, setNfaToDfaOpen] = useState(false);
  const [nfaToDfaResult, setNfaToDfaResult] = useState<NFAToDFAResult | null>(null);

  const [minimizationOpen, setMinimizationOpen] = useState(false);
  const [minimizationResult, setMinimizationResult] = useState<MinimizationResult | null>(null);

  const [toRegexOpen, setToRegexOpen] = useState(false);
  const [toRegexResult, setToRegexResult] = useState<ToRegexResult | null>(null);

  const [regexToNfaOpen, setRegexToNfaOpen] = useState(false);
  const [equivalenceOpen, setEquivalenceOpen] = useState(false);
  const [classifierOpen, setClassifierOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Compute simulation steps whenever automaton or inputString changes
  const simulationResult = useMemo(() => {
    return runSimulation(automaton, inputString);
  }, [automaton, inputString]);

  // Keep step index within valid bounds
  const totalSteps = simulationResult.steps.length;
  useEffect(() => {
    if (currentStepIndex >= totalSteps) {
      setCurrentStepIndex(Math.max(0, totalSteps - 1));
    }
  }, [totalSteps, currentStepIndex]);

  // Playback loop
  useEffect(() => {
    if (!isPlaying) return;

    if (currentStepIndex >= totalSteps - 1) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStepIndex((prev) => {
        if (prev + 1 >= totalSteps - 1) {
          setIsPlaying(false);
        }
        return Math.min(totalSteps - 1, prev + 1);
      });
    }, speedMs);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, totalSteps, speedMs]);

  // Handle Load Sample
  const handleLoadSample = (sample: SampleMachineDef) => {
    setIsPlaying(false);
    resetAutomatonHistory(sample.automaton);
    setInputString(sample.defaultInput);
    setCurrentStepIndex(0);
    setTestSuite(sample.testSuite);
  };

  // Switch Machine Type
  const handleChangeMachineType = (newType: MachineType) => {
    if (newType === automaton.type) return;
    setIsPlaying(false);
    // Find matching sample for new type or update current
    const matchSample = SAMPLES.find((s) => s.automaton.type === newType);
    if (matchSample) {
      handleLoadSample(matchSample);
    } else {
      setAutomaton({
        ...automaton,
        type: newType,
      });
    }
  };

  // Tool Handlers
  const handleOpenEpsilonRemoval = () => {
    try {
      const res = removeEpsilonTransitions(automaton);
      setEpsilonRemovalResult(res);
      setEpsilonRemovalOpen(true);
    } catch (err: any) {
      alert('ε-Removal error: ' + err.message);
    }
  };

  const handleOpenNfaToDfa = () => {
    try {
      const res = convertNfaToDfa(automaton);
      setNfaToDfaResult(res);
      setNfaToDfaOpen(true);
    } catch (err: any) {
      alert('NFA to DFA conversion error: ' + err.message);
    }
  };

  const handleOpenMinimization = () => {
    try {
      const res = minimizeDFA(automaton);
      setMinimizationResult(res);
      setMinimizationOpen(true);
    } catch (err: any) {
      alert('DFA Minimization error: ' + err.message);
    }
  };

  const handleOpenToRegex = () => {
    try {
      const res = convertAutomatonToRegex(automaton);
      setToRegexResult(res);
      setToRegexOpen(true);
    } catch (err: any) {
      alert('Automaton to Regex error: ' + err.message);
    }
  };

  const currentStep = simulationResult.steps[currentStepIndex];

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans">
      {/* Top Navbar */}
      <Navbar
        currentType={automaton.type}
        onChangeMachineType={handleChangeMachineType}
        onLoadSample={handleLoadSample}
        onOpenEpsilonRemoval={handleOpenEpsilonRemoval}
        onOpenNfaToDfa={handleOpenNfaToDfa}
        onOpenMinimization={handleOpenMinimization}
        onOpenToRegex={handleOpenToRegex}
        onOpenRegexToNfa={() => setRegexToNfaOpen(true)}
        onOpenEquivalence={() => setEquivalenceOpen(true)}
        onOpenClassifier={() => setClassifierOpen(true)}
        onOpenExport={() => setExportOpen(true)}
        onOpenHelp={() => setHelpOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Center Canvas Area + Control Bar */}
        <div className="flex flex-col flex-1 h-full overflow-hidden relative">
          {/* Simulation Control Bar */}
          <SimulationControlBar
            inputString={inputString}
            onChangeInput={(str) => {
              setInputString(str);
              setCurrentStepIndex(0);
              setIsPlaying(false);
            }}
            status={currentStep?.status || 'idle'}
            currentStepIndex={currentStepIndex}
            totalSteps={totalSteps}
            isPlaying={isPlaying}
            speedMs={speedMs}
            onChangeSpeed={setSpeedMs}
            onStepForward={() => {
              setIsPlaying(false);
              setCurrentStepIndex((prev) => Math.min(totalSteps - 1, prev + 1));
            }}
            onStepBackward={() => {
              setIsPlaying(false);
              setCurrentStepIndex((prev) => Math.max(0, prev - 1));
            }}
            onTogglePlay={() => {
              if (currentStepIndex >= totalSteps - 1) {
                setCurrentStepIndex(0);
              }
              setIsPlaying(!isPlaying);
            }}
            onReset={() => {
              setIsPlaying(false);
              setCurrentStepIndex(0);
            }}
            onJumpToEnd={() => {
              setIsPlaying(false);
              setCurrentStepIndex(Math.max(0, totalSteps - 1));
            }}
          />

          {/* Interactive React Flow Canvas */}
          <div className="flex-1 w-full h-full relative">
            <CanvasArea
              automaton={automaton}
              onUpdateAutomaton={setAutomaton}
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={undo}
              onRedo={redo}
              currentStep={currentStep}
              canvasContainerRef={canvasContainerRef}
            />
          </div>
        </div>

        {/* Right Simulation Panel */}
        <SimulationPanel
          automaton={automaton}
          steps={simulationResult.steps}
          currentStepIndex={currentStepIndex}
          onSelectStep={(idx) => {
            setIsPlaying(false);
            setCurrentStepIndex(idx);
          }}
          inputString={inputString}
          testSuite={testSuite}
          onUpdateTestSuite={setTestSuite}
          onSelectInputForLiveSim={(inp) => {
            setInputString(inp);
            setCurrentStepIndex(0);
            setIsPlaying(false);
          }}
        />
      </div>

      {/* Modals */}
      <EpsilonRemovalModal
        isOpen={epsilonRemovalOpen}
        onClose={() => setEpsilonRemovalOpen(false)}
        result={epsilonRemovalResult}
        onLoadNfa={(nfa) => {
          resetAutomatonHistory(nfa);
          setCurrentStepIndex(0);
        }}
      />

      <NfaToDfaModal
        isOpen={nfaToDfaOpen}
        onClose={() => setNfaToDfaOpen(false)}
        result={nfaToDfaResult}
        onLoadDfa={(dfa) => {
          resetAutomatonHistory(dfa);
          setCurrentStepIndex(0);
        }}
      />

      <MinimizationModal
        isOpen={minimizationOpen}
        onClose={() => setMinimizationOpen(false)}
        result={minimizationResult}
        onLoadMinimizedDfa={(minDfa) => {
          resetAutomatonHistory(minDfa);
          setCurrentStepIndex(0);
        }}
      />

      <ToRegexModal
        isOpen={toRegexOpen}
        onClose={() => setToRegexOpen(false)}
        result={toRegexResult}
      />

      <RegexToNfaModal
        isOpen={regexToNfaOpen}
        onClose={() => setRegexToNfaOpen(false)}
        onLoadNfa={(nfa) => {
          resetAutomatonHistory(nfa);
          setCurrentStepIndex(0);
        }}
      />

      <EquivalenceModal
        isOpen={equivalenceOpen}
        onClose={() => setEquivalenceOpen(false)}
        currentAutomaton={automaton}
      />

      <ClassifierModal
        isOpen={classifierOpen}
        onClose={() => setClassifierOpen(false)}
        automaton={automaton}
      />

      <HelpModal
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
      />

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        automaton={automaton}
        onImportAutomaton={(imported) => {
          resetAutomatonHistory(imported);
          setCurrentStepIndex(0);
        }}
        canvasElement={canvasContainerRef.current}
      />
    </div>
  );
}

export default App;
