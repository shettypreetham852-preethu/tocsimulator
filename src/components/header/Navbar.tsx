import React, { useState } from 'react';
import { MachineType } from '../../types/automata';
import { SAMPLES, SampleMachineDef } from '../../data/samples';
import {
  Cpu,
  Sparkles,
  Wand2,
  Minimize2,
  Binary,
  Scale,
  SearchCheck,
  Download,
  HelpCircle,
  Sun,
  Moon,
  ChevronDown,
} from 'lucide-react';

interface NavbarProps {
  currentType: MachineType;
  onChangeMachineType: (type: MachineType) => void;
  onLoadSample: (sample: SampleMachineDef) => void;
  onOpenEpsilonRemoval: () => void;
  onOpenNfaToDfa: () => void;
  onOpenMinimization: () => void;
  onOpenToRegex: () => void;
  onOpenRegexToNfa: () => void;
  onOpenEquivalence: () => void;
  onOpenClassifier: () => void;
  onOpenExport: () => void;
  onOpenHelp: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentType,
  onChangeMachineType,
  onLoadSample,
  onOpenEpsilonRemoval,
  onOpenNfaToDfa,
  onOpenMinimization,
  onOpenToRegex,
  onOpenRegexToNfa,
  onOpenEquivalence,
  onOpenClassifier,
  onOpenExport,
  onOpenHelp,
  theme,
  onToggleTheme,
}) => {
  const [samplesOpen, setSamplesOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  const machineTypes: { id: MachineType; label: string }[] = [
    { id: 'DFA', label: 'DFA' },
    { id: 'NFA', label: 'NFA' },
    { id: 'ENFA', label: 'ε-NFA' },
  ];

  return (
    <header className="h-14 px-4 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex items-center justify-between select-none z-20 shrink-0">
      {/* Brand / Logo */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-sm">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
              <span>TOC Simulator</span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                FA Edition
              </span>
            </h1>
          </div>
        </div>

        {/* Machine Type Selector */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 space-x-0.5 border border-slate-200 dark:border-slate-700">
          {machineTypes.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onChangeMachineType(t.id)}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                currentType === t.id
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Menus and Actions */}
      <div className="flex items-center space-x-2">
        {/* Samples Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setSamplesOpen(!samplesOpen);
              setToolsOpen(false);
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Samples</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {samplesOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setSamplesOpen(false)} />
              <div className="absolute right-0 mt-1 w-64 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                <span className="block px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Pre-built Automata
                </span>
                {SAMPLES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      onLoadSample(s);
                      setSamplesOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {s.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                        {s.description}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500">
                      {s.automaton.type === 'ENFA' ? 'ε-NFA' : s.automaton.type}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Conversions & Tools Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setToolsOpen(!toolsOpen);
              setSamplesOpen(false);
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors"
          >
            <Wand2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Tools</span>
            <ChevronDown className="w-3 h-3 text-indigo-400" />
          </button>

          {toolsOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setToolsOpen(false)} />
              <div className="absolute right-0 mt-1 w-56 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 z-40 animate-in fade-in zoom-in-95 duration-100 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    onOpenEpsilonRemoval();
                    setToolsOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors flex items-center space-x-2 text-slate-700 dark:text-slate-200"
                >
                  <Wand2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>ε-NFA → NFA (Remove ε)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onOpenNfaToDfa();
                    setToolsOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors flex items-center space-x-2 text-slate-700 dark:text-slate-200"
                >
                  <Wand2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>NFA / ε-NFA → DFA</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onOpenMinimization();
                    setToolsOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors flex items-center space-x-2 text-slate-700 dark:text-slate-200"
                >
                  <Minimize2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>DFA Minimization</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onOpenToRegex();
                    setToolsOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors flex items-center space-x-2 text-slate-700 dark:text-slate-200"
                >
                  <Binary className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Automaton → Regex</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onOpenRegexToNfa();
                    setToolsOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors flex items-center space-x-2 text-slate-700 dark:text-slate-200"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Regex → ε-NFA</span>
                </button>

                <div className="border-t border-slate-100 dark:border-slate-700 my-1" />

                <button
                  type="button"
                  onClick={() => {
                    onOpenEquivalence();
                    setToolsOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors flex items-center space-x-2 text-slate-700 dark:text-slate-200"
                >
                  <Scale className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Equivalence Check</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onOpenClassifier();
                    setToolsOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors flex items-center space-x-2 text-slate-700 dark:text-slate-200"
                >
                  <SearchCheck className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Classifier (DFA/NFA/ε-NFA)</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Import/Export */}
        <button
          type="button"
          onClick={onOpenExport}
          title="Import or Export JFLAP / JSON / PNG"
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Help */}
        <button
          type="button"
          onClick={onOpenHelp}
          title="Help & Transition Label Syntax"
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>
    </header>
  );
};
