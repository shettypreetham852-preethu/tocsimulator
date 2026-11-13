import { toPng } from 'html-to-image';
import { Automaton } from '../types/automata';
import { exportToJFF } from './jflapParser';

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportAutomatonJson(automaton: Automaton, filename = 'machine.json') {
  const json = JSON.stringify(automaton, null, 2);
  downloadFile(json, filename, 'application/json');
}

export function exportAutomatonJff(automaton: Automaton, filename?: string) {
  const ext = filename || `${automaton.type.toLowerCase()}_machine.jff`;
  const xml = exportToJFF(automaton);
  downloadFile(xml, ext, 'text/xml');
}

export async function exportCanvasPng(element: HTMLElement, filename = 'automaton.png') {
  try {
    const dataUrl = await toPng(element, {
      backgroundColor: '#ffffff',
      filter: (node: Node) => {
        // Exclude mini-map or control panels if desired, or include full view
        if ((node as HTMLElement).classList?.contains('react-flow__controls')) return false;
        if ((node as HTMLElement).classList?.contains('react-flow__panel')) return false;
        return true;
      },
    });
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    console.error('Failed to export canvas to PNG:', err);
    throw err;
  }
}
