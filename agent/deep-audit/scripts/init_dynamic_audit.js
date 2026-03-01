#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const VALID_MODES = new Set(['project', 'section', 'feature-trace']);
const VALID_DEPTHS = new Set(['deep', 'medium', 'low']);
const VALID_CONTINUITIES = new Set(['section-lock', 'full-lock', 'manual-pause']);

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key.startsWith('--')) {
      continue;
    }
    const name = key.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[name] = 'true';
      continue;
    }
    args[name] = next;
    i += 1;
  }
  return args;
}

function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function stampNow() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}${mm}${dd}-${hh}${mi}`;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeIfMissing(filePath, content) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

function required(args, key) {
  const value = args[key];
  if (!value) {
    throw new Error(`Missing required flag: --${key}`);
  }
  return value;
}

function resolveContinuity(mode, requested) {
  if (requested) {
    if (!VALID_CONTINUITIES.has(requested)) {
      throw new Error(`Invalid --continuity "${requested}". Use: section-lock | full-lock | manual-pause`);
    }
    return requested;
  }
  return mode === 'section' ? 'section-lock' : 'full-lock';
}

function main() {
  const args = parseArgs(process.argv);
  const mode = required(args, 'mode');
  const depth = required(args, 'depth');
  const scope = required(args, 'scope');

  if (!VALID_MODES.has(mode)) {
    throw new Error(`Invalid --mode "${mode}". Use: project | section | feature-trace`);
  }
  if (!VALID_DEPTHS.has(depth)) {
    throw new Error(`Invalid --depth "${depth}". Use: deep | medium | low`);
  }
  const continuity = resolveContinuity(mode, args.continuity);

  const root = path.resolve(args.root || '.');
  const targetSlug = slugify(scope) || 'target';
  const stamp = args.stamp || stampNow();
  const auditId = args['audit-id'] || `${mode}-${depth}-${targetSlug}-${stamp}`;

  const auditRoot = path.join(root, 'work-items', 'audits', auditId);
  const sectionsDir = path.join(auditRoot, 'sections');

  ensureDir(auditRoot);
  ensureDir(sectionsDir);

  writeIfMissing(
    path.join(auditRoot, 'audit-map.md'),
    `# Audit Map: ${auditId}

## Scope
- Mode: ${mode}
- Depth: ${depth}
- Continuity: ${continuity}
- Target: ${scope}
- Exclusions:

## System Understanding
- Domain purpose:
- Core flows:
- Critical constraints:
- Success criteria:

## Clarification Log
- Savol:
- Variantlar:
- Tavsiya etilgan:
- Foydalanuvchi tanlovi:

## Section Inventory
| Section | Purpose | Key Files | Dependencies | Risk |
|---|---|---|---|---|

## Audit Order
1.
2.
3.
`
  );

  writeIfMissing(
    path.join(auditRoot, 'system-understanding.md'),
    `# System Understanding: ${auditId}

## Project Essence
- Primary business/domain objective:
- Key users or consumers:
- Critical journey:

## Quality Priorities
- Reliability:
- Maintainability:
- Delivery speed:
- Security:

## Constraints
- Technical constraints:
- Operational constraints:
- Compliance constraints:
`
  );

  writeIfMissing(
    path.join(auditRoot, 'clarifications.md'),
    `# Aniqlashtirishlar: ${auditId}

- Savol:
- Variantlar:
- Tavsiya etilgan:
- Foydalanuvchi qarori:
- S5 Continuity: ${continuity}
- Izoh:
`
  );

  writeIfMissing(
    path.join(auditRoot, 'implementation-plan.md'),
    `# Implementation Plan: ${scope}

## Objectives
1.
2.

## Phases
| Phase | Goal | Inputs | Output |
|---|---|---|---|
| 0 | Baseline and understanding | system model + clarifications | shared context |
| 1 | | | |
| 2 | | | |
| 3 | | | |

## Rollback Strategy
- Trigger:
- Recovery:
`
  );

  writeIfMissing(
    path.join(auditRoot, 'tasks.md'),
    `# Tasks: ${scope}

- [ ] T-001
- [ ] T-002
- [ ] T-003
- [ ] T-004
- [ ] T-005
- [ ] T-006

## Notes
- Owner:
- Blockers:
- Last update:
- User confirmation for push:
- Continuity holati: active (${continuity})
`
  );

  writeIfMissing(
    path.join(auditRoot, 'roadmap.md'),
    `# Roadmap: ${scope}

## Milestones
1. Audit complete
2. Critical fixes complete
3. Verification complete

## Dependencies
- M1 -> M2
- M2 -> M3

## Deferred Work
- Item:
`
  );

  const output = {
    audit_id: auditId,
    continuity,
    audit_root: auditRoot,
    sections_dir: sectionsDir,
    section_init_command: `node agent/deep-audit/scripts/init_section_audit.js --audit-root "${auditRoot}" --section "<section-name>" --order <nn>`,
    phase_check_command: 'node agent/deep-audit/scripts/run_phase_checks.js --phase "<phase-name>"',
  };
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
}

main();
