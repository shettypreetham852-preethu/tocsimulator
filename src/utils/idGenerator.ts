let idCounter = 100;

export function generateId(prefix = 'id'): string {
  idCounter += 1;
  return `${prefix}_${Date.now()}_${idCounter}`;
}

export function getNextStateLabel(existingStates: { label: string }[]): string {
  const existingLabels = new Set(existingStates.map(s => s.label));
  let i = 0;
  while (true) {
    const candidate = `q${i}`;
    if (!existingLabels.has(candidate)) {
      return candidate;
    }
    i++;
  }
}
