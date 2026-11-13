# TOC Simulator (Theory of Computation) &mdash; FA Edition

A visual, interactive Theory of Computation simulator and automaton editor inspired by **JFLAP**, running entirely client-side in the browser. Supports **DFA**, **NFA**, and **ε-NFA (E-NFA)**.

Built with **React 19**, **Vite**, **TypeScript**, **Tailwind CSS v4**, and **@xyflow/react** (React Flow).

---

## 🚀 Supported Machine Models

1. **DFA (Deterministic Finite Automaton)**:
   - Strictly 1 transition per symbol in alphabet $\Sigma$ from each state.
   - Zero $\epsilon$-transitions allowed.
   - Real-time input breakdown: consumed prefix vs remaining suffix.
2. **NFA (Standard Non-deterministic Finite Automaton)**:
   - Non-deterministic branching (0, 1, or multiple transitions on symbol $a \in \Sigma$).
   - Strict: no $\epsilon$-transitions.
3. **ε-NFA / E-NFA (Non-deterministic Finite Automaton with ε-Transitions)**:
   - Allows $\epsilon$ ($\lambda$) transitions without consuming input.
   - Multi-path parallel execution with automatic $\epsilon$-closure computation.
   - Configuration breakdown showing active state branches, remaining strings, and traversed paths.

---

## 🛠️ Conversions & Formal Languages Tools

- **ε-NFA → NFA (ε-Removal)**:
  - Eliminates all $\epsilon$-transitions via the textbook formula:
    $$\delta'(q, a) = \hat{\epsilon}(\delta(\hat{\epsilon}(q), a))$$
  - Displays the $\epsilon$-closure table for all states and loads the resulting standard NFA directly onto the canvas.
- **NFA / ε-NFA → DFA (Subset Construction)**:
  - Powerset construction with $\epsilon$-closure computation and transition table.
  - Automatically generates a circular layout DFA and loads it onto the canvas.
- **DFA Minimization (Hopcroft's Algorithm)**:
  - Removes unreachable states and refines equivalent partitions ($P_0, P_1, \dots$).
- **Automaton → Regular Expression**:
  - Generalized NFA (GNFA) state elimination algorithm.
- **Regex → ε-NFA (Thompson's Construction)**:
  - Compiles expressions with concatenation, union (`|`), star (`*`), plus (`+`), optional (`?`), and parentheses.
- **Automata Equivalence Check**:
  - Verifies $L(M_1) \equiv L(M_2)$ with distinguishing counterexample strings.
- **3-Way Automaton Classifier**:
  - Tests whether a machine is a **DFA**, a **Standard NFA** (without $\epsilon$), or an **ε-NFA** (with $\epsilon$).

---

## 🎨 Pre-Built Samples
1. **DFA: Binary Divisible by 3** (Alphabet $\{0, 1\}$)
2. **DFA: Even 0s and Even 1s** (Alphabet $\{0, 1\}$)
3. **NFA: Ending in "01"** (Alphabet $\{0, 1\}$, standard NFA without $\epsilon$)
4. **ε-NFA: $a^*b^*c^*$** (Alphabet $\{a, b, c\}$, chained with $\epsilon$-transitions)
5. **ε-NFA: $(ab \mid ba)$** (Alphabet $\{a, b\}$, branching with $\epsilon$-transitions)

---

## 💻 Getting Started

```powershell
cd C:\Users\preet\.gemini\antigravity\scratch\toc-simulator

# Run unit tests (21 tests)
npm test

# Build production bundle
npm run build

# Start dev server
npm run dev
```

Open your browser at **`http://localhost:5173/`**.
