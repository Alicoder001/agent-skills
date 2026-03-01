#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

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

function required(args, key) {
  const value = args[key];
  if (!value) {
    throw new Error(`Missing required flag: --${key}`);
  }
  return value;
}

function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeIfMissing(filePath, content) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

function main() {
  const args = parseArgs(process.argv);
  const auditRoot = path.resolve(required(args, 'audit-root'));
  const section = required(args, 'section');
  const order = String(args.order || '01').padStart(2, '0');

  const sectionsRoot = path.join(auditRoot, 'sections');
  const sectionSlug = slugify(section) || 'section';
  const sectionDir = path.join(sectionsRoot, `${order}-${sectionSlug}`);

  ensureDir(sectionDir);

  writeIfMissing(
    path.join(sectionDir, 'section-audit.md'),
    `# Section Audit: ${section}

## Intent

## Section Phases
1. Intent and contract confirmation
2. Dependency and failure-point trace
3. Evidence-backed findings
4. Fix options and recommendation
5. Phase gate result (\`typecheck/build/lint\`)

## Files Reviewed
- \`path:line\`

## Findings
| ID | Severity | Evidence | Impact | Root Cause | Recommendation |
|---|---|---|---|---|---|

## Test and Reliability Notes
- Existing tests:
- Missing tests:
- Regression risk:
`
  );

  writeIfMissing(
    path.join(sectionDir, 'implementation-plan.md'),
    `# Section Implementation Plan: ${section}

## Objectives
1.
2.

## Phases
| Phase | Goal | Inputs | Output |
|---|---|---|---|
| 1 | Stabilize critical risks | finding IDs | patch set |
| 2 | Refactor section structure | finding IDs | clean architecture delta |
| 3 | Validate and close | tests + review | verified result |

## Rollback Strategy
- Trigger:
- Recovery:
`
  );

  writeIfMissing(
    path.join(sectionDir, 'tasks.md'),
    `# Section Tasks: ${section}

- [ ] ST-001
- [ ] ST-002
- [ ] ST-003
- [ ] ST-004
- [ ] ST-005

## Notes
- Owner:
- Blockers:
- Last update:
- Continuity holati:
`
  );

  writeIfMissing(
    path.join(sectionDir, 'roadmap.md'),
    `# Section Roadmap: ${section}

## Milestones
1. Section audit complete
2. Critical fixes complete
3. Verification complete

## Dependencies
- M1 -> M2
- M2 -> M3

## Deferred Work
- Item:
`
  );

  process.stdout.write(
    `${JSON.stringify(
      {
        section_dir: sectionDir,
        section_slug: sectionSlug,
      },
      null,
      2
    )}\n`
  );
}

main();
