# Verification Protocol

## The 3-Level Verification Architecture

Every AI-assisted project MUST have verification at three levels. This is the single most important architectural pattern for preventing false closure, fake states, and status overstatement.

```
Level 1: Task Self-Check          → After EACH task implementation
Level 2: Subphase Verification    → After ALL tasks in a subphase
Level 3: Phase Closure Audit      → Dedicated subphase per phase
```

**Why three levels?** Each catches failures the others miss:
- Task self-check catches implementation-level errors immediately
- Subphase gate catches cross-task integration failures and truth-gate violations
- Phase audit catches drift, false patterns, and status overstatement across subphases

## Level 1: Task Self-Check

After completing each task, BEFORE marking it `IMPLEMENTED`, the agent MUST run this protocol.

### The 5 Mandatory Questions

| # | Question | Purpose |
|---|----------|---------|
| 1 | **What exactly did I implement?** State the claim in concrete terms. | Forces precision |
| 2 | **How could this claim be false?** List at least 2 ways. | Forces adversarial thinking |
| 3 | **What file, search, or test proves my claim?** Name it specifically. | Forces evidence |
| 4 | **Did I introduce any forbidden patterns?** Check against project truth-gates. | Catches rule violations |
| 5 | **Could my changes break something adjacent?** Check for regressions. | Catches side effects |

### Task Self-Check Template (embed in every task card)

```markdown
## Self-Check (before marking IMPLEMENTED)
- [ ] Stated what I implemented in concrete terms
- [ ] Identified at least 2 ways my claim could be false
- [ ] Named the specific file/search/test that proves correctness
- [ ] Ran truth-gate scan on affected files — no violations
- [ ] Confirmed no regression in adjacent code
- [ ] lint/typecheck/build passes
```

### Self-Check Failure Criteria

The self-check FAILS if:
- You cannot name the specific file that proves your claim
- You did not run the code or a relevant test
- You relied only on lint/typecheck as evidence of business correctness
- You cannot explain what changed from the user's perspective
- A truth-gate scan finds violations in your changes

When self-check fails → fix the issue, re-run self-check. Do not mark `IMPLEMENTED`.

## Level 2: Subphase Verification Gate

After all tasks in a subphase are `IMPLEMENTED`, run the verification gate BEFORE marking `VERIFIED`.

### Gate Checklist Template

```markdown
## Subphase Verification Gate (before marking VERIFIED)

### Functional Verification
- [ ] Feature works end-to-end (not just "route exists" or "page renders")
- [ ] Happy path verified with real or realistic data
- [ ] Error states verified (what happens when things fail?)
- [ ] Edge cases checked (empty state, max values, concurrent access)

### Truth-Gate Scan
- [ ] No forbidden patterns in affected files (run `check:truth-gates` if available)
- [ ] No placeholder/fake content in active routes
- [ ] No architecture boundary violations (import rules)
- [ ] No text integrity issues (encoding, mojibake)

### Quality Checks
- [ ] lint/typecheck/build passes for affected packages
- [ ] [Project-specific quality check if applicable]

### Design/UX Checks (if applicable)
- [ ] Responsive behavior verified at target viewports
- [ ] Design fidelity checked against mockups/specs
- [ ] Shared component compliance verified
- [ ] Accessible (keyboard navigation, ARIA labels)

### Status
All checks above must pass before this subphase moves to VERIFIED.
If ANY check fails → create remediation tasks, re-run gate after fixes.
```

### Subphase README Exit Criteria Pattern

Every subphase README should end with explicit exit criteria:

```markdown
## Exit Criteria

### Functional
- [ ] [Specific functional requirement 1]
- [ ] [Specific functional requirement 2]

### Truth-Gate
- [ ] No forbidden patterns: [list specific patterns to scan for in this subphase]
- [ ] No architecture violations: [list specific import boundaries to check]

### Quality
- [ ] lint/typecheck/build green for [affected packages]
- [ ] [Project-specific quality check]

### Status
All checks pass → mark VERIFIED. Any failure → fix and re-check.
```

## Level 3: Phase Closure Audit

Every phase MUST include a **dedicated verification subphase** as its LAST subphase. This is not optional — it is a structural requirement of the roadmap.

### Phase Verification Subphase Pattern

For Phase N with subphases N.1 through N.K, the last subphase N.(K+1) is always the verification and closure audit.

```
Phase 2: Core Business
  2.1 Organization module
  2.2 Employee CRUD
  2.3 Device management
  2.4 Phase 2 Verification & Closure   ← MANDATORY LAST SUBPHASE

Phase 3: Face Enrollment
  3.1 Face profile
  3.2 Enrollment state machine
  3.3 ISAPI integration
  3.4 Desktop enrollment
  3.5 Provisioning queue
  3.6 Phase 3 Verification & Closure   ← MANDATORY LAST SUBPHASE
```

### Phase Closure Audit Checklist

```markdown
## Phase N Verification & Closure

### 1. Re-Verification Pass
- [ ] Re-run ALL subphase gate checks (not just the latest subphase)
- [ ] Re-run ALL truth-gate scripts for the full phase scope
- [ ] Confirm lint/typecheck/build passes for the entire workspace

### 2. Adversarial Self-Audit
For EACH subphase in this phase:
- [ ] "What did we claim is done in subphase N.X?"
- [ ] "How could this claim still be false?"
- [ ] "What search or test disproves the risk?"
- [ ] "Run the search/test NOW — what was found?"

Explicitly search for:
- [ ] Forbidden patterns in all active routes touched by this phase
- [ ] Placeholder/fake/demo content
- [ ] Architecture boundary violations
- [ ] Text integrity issues
- [ ] Local UI forks where shared components should be used
- [ ] [Project-specific concerns]

### 3. Roadmap-Code Alignment
- [ ] Roadmap status accurately reflects code reality
- [ ] No status document overstates implementation truth
- [ ] Phase README exit criteria all genuinely checked — not just marked

### 4. Documentation Alignment
- [ ] HANDOFF.md reflects post-closure state
- [ ] progress.md reflects verified reality, not intended/hoped reality
- [ ] todo.md reflects next phase work
- [ ] Phase README marked with final status

### 5. Sign-Off
Phase moves to CLOSED only when ALL sections above pass.
If ANY check fails → create remediation tasks, re-enter the phase.
Phase does NOT move to CLOSED until remediation is complete and re-verified.
```

## 4. Truth-Gate Design Patterns

Truth-gates are project-specific. They must be designed during the architecture phase based on the project's risk profile.

### Step 1: Identify the Project's Risks

Interview / discovery questions:

| Question | What It Reveals |
|----------|----------------|
| "Does this project forbid fake/demo data in production routes?" | Need forbidden-pattern truth-gates |
| "Does this project have a shared UI system?" | Need shared-component compliance gates |
| "Does this project have strict architecture boundaries?" | Need import-graph gates |
| "Does this project have text/i18n requirements?" | Need text-integrity gates |
| "Does this project have design mockups that must be matched?" | Need design-fidelity gates |
| "Does this project have security constraints?" | Need security-scan gates |
| "Does this project have performance budgets?" | Need performance-check gates |

### Step 2: Define Forbidden Patterns Per Risk

For each identified risk, define the concrete patterns to scan for:

```javascript
// Example truth-gate definitions
const TRUTH_GATES = {
  'no-fake-data': {
    patterns: ['demo-data', 'placeholder', 'fallback', 'mock-', 'fake-'],
    scope: 'active route directories only',
    severity: 'critical'
  },
  'shared-ui-compliance': {
    check: 'imports of Button, Input, Modal, etc. must come from @project/ui',
    scope: 'all app directories',
    severity: 'high'
  },
  'text-integrity': {
    patterns: ['â€', '\\u00e2', 'Ð', '???'],
    scope: 'all locale files and active templates',
    severity: 'high'
  },
  'architecture-boundaries': {
    check: 'no cross-app imports, no circular package dependencies',
    scope: 'all source files',
    severity: 'critical'
  }
};
```

### Step 3: Build and Wire the Script

See `enforcement-architecture.md` §4 for the script skeleton and wiring instructions.

### Step 4: Integrate into Verification Levels

- **Task self-check:** Agent runs truth-gate scan on affected files
- **Subphase gate:** Agent runs full truth-gate script for subphase scope
- **Phase audit:** Agent runs truth-gate script for entire phase scope

## 5. Adversarial Self-Audit Protocol

The adversarial audit is a structured process where the agent actively tries to DISPROVE its own claims. This is the most important step in preventing false closure.

### Why Adversarial Audit Exists

Without it, the agent naturally optimizes for:
- Momentum (moving forward feels productive)
- Local coherence (the last thing it did seems correct)
- Confirmation bias (looking for evidence that supports the claim)

The adversarial audit forces the opposite: looking for evidence that the claim is WRONG.

### The Adversarial Process

1. **State the claim** — "I claim that [X] is complete and correct."
2. **Attack the claim** — "What are the top 3 ways this could still be wrong?"
3. **Design the test** — "What search, file read, or runtime test would reveal each failure?"
4. **Execute the test** — Actually run each search/test. Do not skip this step.
5. **Report honestly** — "I found [result]. The claim is [confirmed / falsified]."

### Common False-Closure Patterns to Watch For

| Pattern | How the Agent Tricks Itself | What Catches It |
|---------|---------------------------|-----------------|
| "Route exists" = done | Page renders but has placeholder content | Content inspection, truth-gate scan |
| "Lint passes" = done | Syntax correct, business logic wrong | Functional end-to-end check |
| "API works" = done | Endpoint returns data but UI ignores it | Verify the full data path |
| "Build passes" = done | Build succeeds but runtime fails | Actually run the application |
| "Looks correct" = done | Visual check missed edge case | Check multiple viewports, states, users |
| "Error is handled" = done | Error caught but fallback hides failure | Verify error state is honest, not masked |
| "Tests pass" = done | Tests don't cover the actual requirement | Check test coverage of the specific claim |

### When Adversarial Audit Finds Issues

1. Do NOT update status documents.
2. Create specific remediation tasks.
3. Fix the issues.
4. Re-run the adversarial audit.
5. Only proceed to closure when re-audit passes.

## 6. Closure Workflow Summary

```
TASK COMPLETION:
  Implement → Self-Check (5 questions) → IMPLEMENTED
  ⤷ If self-check fails: fix → re-check → do not advance

SUBPHASE COMPLETION:
  All tasks IMPLEMENTED → Verification Gate → VERIFIED
  ⤷ If gate fails: remediate → re-gate → do not advance

PHASE COMPLETION:
  All subphases VERIFIED → Phase Audit Subphase → CLOSED
  ⤷ If audit fails: remediate → re-audit → do not advance

STATUS UPDATE:
  Update roadmap/progress/handoff ONLY after VERIFIED or CLOSED
  Never update status documents optimistically after implementation
```

## 7. Verification Architecture for Different Project Types

The 3-level structure is universal. The truth-gate content adapts to the project:

| Project Type | Key Truth-Gates | Phase Audit Focus |
|-------------|----------------|-------------------|
| Web app with design mockups | Fake data, UI drift, design fidelity, responsive | Visual + data-path audit |
| API-only backend | Input validation, auth boundaries, error semantics | Contract + security audit |
| Monorepo multi-app | Import boundaries, shared package compliance, alias resolution | Cross-app consistency audit |
| Security-sensitive | Credential handling, injection patterns, OWASP checks | Penetration + code review audit |
| Performance-sensitive | Bundle size, query efficiency, render performance | Benchmark + profiling audit |
| i18n / multilingual | Text integrity, locale coverage, encoding correctness | Full locale sweep audit |

Always design truth-gates during the architecture phase — never retrofit them after failures occur.
