import React, { useRef } from 'react';
import { Automaton } from '../../types/automata';
import { parseJFF } from '../../utils/jflapParser';
import { exportAutomatonJff, exportAutomatonJson, exportCanvasPng } from '../../utils/fileExport';
import { X, Upload, Download, FileCode, Image, FileJson } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  automaton: Automaton;
  onImportAutomaton: (imported: Automaton) => void;
  canvasElement: HTMLElement | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  automaton,
  onImportAutomaton,
  canvasElement,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        if (file.name.endsWith('.jff') || file.name.endsWith('.xml')) {
          const parsed = parseJFF(content);
          onImportAutomaton(parsed);
          onClose();
        } else if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(content) as Automaton;
          onImportAutomaton(parsed);
          onClose();
        } else {
          // Attempt XML then JSON
          try {
            const parsed = parseJFF(content);
            onImportAutomaton(parsed);
            onClose();
          } catch {
            const parsed = JSON.parse(content);
            onImportAutomaton(parsed);
            onClose();
          }
        }
      } catch (err: any) {
        alert('Failed to parse file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleExportPng = async () => {
    if (!canvasElement) {
      alert('Canvas element not found.');
      return;
    }
    try {
      await exportCanvasPng(canvasElement, `${automaton.type.toLowerCase()}_diagram.png`);
      onClose();
    } catch (err: any) {
      alert('Failed to export image: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
            Import & Export
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Import */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Import File
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jff,.xml,.json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
            >
              <Upload className="w-4 h-4 text-indigo-500" />
              <span>Choose JFLAP (.jff) or JSON file</span>
            </button>
          </div>

          {/* Export */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Export As
            </span>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => {
                  exportAutomatonJff(automaton);
                  onClose();
                }}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-medium transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <FileCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <div className="text-left">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      JFLAP XML (.jff)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Compatible with official JFLAP 7.x
                    </div>
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => {
                  exportAutomatonJson(automaton);
                  onClose();
                }}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-medium transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <FileJson className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <div className="text-left">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      JSON Machine Data (.json)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Full automaton definition with coordinates
                    </div>
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={handleExportPng}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-medium transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <Image className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <div className="text-left">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      Canvas PNG Image (.png)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      High-resolution state diagram screenshot
                    </div>
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-200/60 dark:bg-slate-700 hover:bg-slate-300/60 dark:hover:bg-slate-600 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
