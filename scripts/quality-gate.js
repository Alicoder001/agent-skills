const { spawnSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const steps = [
  { name: 'Generate metadata', cmd: 'node', args: ['scripts/generate-openai-yaml.js'] },
  { name: 'Validate catalog', cmd: 'node', args: ['scripts/validate-skills.js'] },
  { name: 'Run trigger evals', cmd: 'node', args: ['scripts/run-trigger-evals.js'] },
];

for (const step of steps) {
  console.log(`\n==> ${step.name}`);
  const result = spawnSync(step.cmd, step.args, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: true,
  });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

console.log('\nQuality gate passed.');
