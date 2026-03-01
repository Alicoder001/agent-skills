#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const REQUIRED_CHECKS = ['typecheck', 'build', 'lint'];

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      continue;
    }
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = 'true';
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
}

function detectRunner(cwd) {
  if (fs.existsSync(path.join(cwd, 'pnpm-lock.yaml'))) {
    return { cmd: 'pnpm', argsPrefix: ['run'] };
  }
  if (fs.existsSync(path.join(cwd, 'yarn.lock'))) {
    return { cmd: 'yarn', argsPrefix: [] };
  }
  if (fs.existsSync(path.join(cwd, 'bun.lockb')) || fs.existsSync(path.join(cwd, 'bun.lock'))) {
    return { cmd: 'bun', argsPrefix: ['run'] };
  }
  return { cmd: 'npm', argsPrefix: ['run'] };
}

function readPackageJson(cwd) {
  const pkgPath = path.join(cwd, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(pkgPath, 'utf8').replace(/^\uFEFF/, '');
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Unable to parse package.json: ${err.message}`);
  }
}

function runScript(runner, scriptName, cwd) {
  const args = [...runner.argsPrefix, scriptName];
  const res = spawnSync(runner.cmd, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  return res.status === 0;
}

function main() {
  const args = parseArgs(process.argv);
  const phase = args.phase || 'phase-unknown';
  const cwd = path.resolve(args.cwd || '.');
  const strict = args.strict !== 'false';
  const pkg = readPackageJson(cwd);

  const report = {
    phase,
    cwd,
    strict,
    checks: [],
  };

  if (!pkg || !pkg.scripts) {
    const message = 'package.json or scripts field not found';
    report.error = message;
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    process.exit(strict ? 2 : 0);
  }

  const runner = detectRunner(cwd);
  let hasFailures = false;

  for (const check of REQUIRED_CHECKS) {
    if (!Object.prototype.hasOwnProperty.call(pkg.scripts, check)) {
      report.checks.push({ name: check, status: 'missing' });
      hasFailures = true;
      continue;
    }

    const ok = runScript(runner, check, cwd);
    report.checks.push({ name: check, status: ok ? 'passed' : 'failed' });
    if (!ok) {
      hasFailures = true;
    }
  }

  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (hasFailures && strict) {
    process.exit(1);
  }
}

main();
