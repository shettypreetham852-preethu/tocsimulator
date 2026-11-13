import { Automaton, State, Transition } from '../types/automata';
import { generateId } from './idGenerator';
import { EPSILON } from './labelParser';

/**
 * Parses JFLAP .jff XML string into an Automaton (FA: DFA or NFA)
 */
export function parseJFF(xmlString: string): Automaton {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

  // Check for XML parse errors
  const parseError = xmlDoc.getElementsByTagName('parsererror');
  if (parseError.length > 0) {
    throw new Error('Invalid XML document: ' + parseError[0].textContent);
  }

  const structure = xmlDoc.getElementsByTagName('structure')[0];
  if (!structure) {
    throw new Error('Invalid JFLAP format: missing <structure> tag.');
  }

  const automatonTag = structure.getElementsByTagName('automaton')[0];
  if (!automatonTag) {
    throw new Error('Invalid JFLAP format: missing <automaton> tag.');
  }

  // Parse states
  const stateNodes = automatonTag.getElementsByTagName('state');
  const states: State[] = [];
  const jffIdToAppId = new Map<string, string>();

  for (let i = 0; i < stateNodes.length; i++) {
    const sElem = stateNodes[i];
    const jffId = sElem.getAttribute('id') || String(i);
    const label = sElem.getAttribute('name') || `q${jffId}`;

    const xVal = parseFloat(sElem.getElementsByTagName('x')[0]?.textContent || '200');
    const yVal = parseFloat(sElem.getElementsByTagName('y')[0]?.textContent || '200');

    const isInitial = sElem.getElementsByTagName('initial').length > 0;
    const isFinal = sElem.getElementsByTagName('final').length > 0;

    const appId = generateId('state');
    jffIdToAppId.set(jffId, appId);

    states.push({
      id: appId,
      label,
      isInitial,
      isFinal,
      x: isNaN(xVal) ? 200 + i * 100 : Math.round(xVal),
      y: isNaN(yVal) ? 200 : Math.round(yVal),
    });
  }

  // Parse transitions
  const transitionNodes = automatonTag.getElementsByTagName('transition');
  const transitions: Transition[] = [];

  for (let i = 0; i < transitionNodes.length; i++) {
    const tElem = transitionNodes[i];
    const fromJff = tElem.getElementsByTagName('from')[0]?.textContent?.trim() || '';
    const toJff = tElem.getElementsByTagName('to')[0]?.textContent?.trim() || '';

    const fromAppId = jffIdToAppId.get(fromJff);
    const toAppId = jffIdToAppId.get(toJff);

    if (!fromAppId || !toAppId) continue;

    const readText = tElem.getElementsByTagName('read')[0]?.textContent ?? '';
    const symbol = readText === '' ? EPSILON : readText;

    transitions.push({
      id: generateId('tr'),
      from: fromAppId,
      to: toAppId,
      symbol,
    });
  }

  // Determine if it has epsilon transitions or multiple transitions
  const hasEpsilon = transitions.some(t => t.symbol === EPSILON);

  return {
    type: hasEpsilon ? 'NFA' : 'DFA',
    states,
    transitions,
  };
}

/**
 * Serializes an Automaton to JFLAP .jff XML string
 */
export function exportToJFF(automaton: Automaton): string {
  const appIdToJffId = new Map<string, string>();
  automaton.states.forEach((s, idx) => {
    appIdToJffId.set(s.id, String(idx));
  });

  const stateXmls = automaton.states.map((s) => {
    const id = appIdToJffId.get(s.id)!;
    const initialTag = s.isInitial ? '\n\t\t\t<initial/>' : '';
    const finalTag = s.isFinal ? '\n\t\t\t<final/>' : '';
    return `\t\t<state id="${id}" name="${escapeXml(s.label)}">
\t\t\t<x>${s.x}.0</x>
\t\t\t<y>${s.y}.0</y>${initialTag}${finalTag}
\t\t</state>`;
  }).join('\n');

  const transitionXmls = automaton.transitions.map(t => {
    const fromId = appIdToJffId.get(t.from) || '0';
    const toId = appIdToJffId.get(t.to) || '0';
    const isEps = !t.symbol || t.symbol === EPSILON || t.symbol === 'λ';
    const readTag = isEps ? '<read/>' : `<read>${escapeXml(t.symbol || '')}</read>`;

    return `\t\t<transition>
\t\t\t<from>${fromId}</from>
\t\t\t<to>${toId}</to>
\t\t\t${readTag}
\t\t</transition>`;
  }).filter(Boolean).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Created with TOC Simulator (JFLAP Compatible) -->
<structure>
\t<type>fa</type>
\t<automaton>
\t\t<!-- The list of states. -->
${stateXmls}
\t\t<!-- The list of transitions. -->
${transitionXmls}
\t</automaton>
</structure>
`;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
