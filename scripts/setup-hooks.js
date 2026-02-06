const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const hooksPath = path.join(ROOT, '.githooks');

function ensureExecutable(filePath) {
  try {
    fs.chmodSync(filePath, 0o755);
  } catch (error) {
    // Best-effort on platforms that do not use chmod semantics.
  }
}

function run() {
  if (!fs.existsSync(hooksPath)) {
    console.error('Missing .githooks directory.');
    process.exit(1);
  }

  const preCommit = path.join(hooksPath, 'pre-commit');
  const prePush = path.join(hooksPath, 'pre-push');
  if (!fs.existsSync(preCommit) || !fs.existsSync(prePush)) {
    console.error('Missing required hook files: pre-commit and pre-push.');
    process.exit(1);
  }

  ensureExecutable(preCommit);
  ensureExecutable(prePush);

  execSync('git config core.hooksPath .githooks', {
    cwd: ROOT,
    stdio: 'inherit'
  });

  console.log('Git hooks installed via core.hooksPath=.githooks');
}

run();
