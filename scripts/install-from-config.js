const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const configPath = process.argv[2] || path.join(process.cwd(), 'skills.config.json');

if (!fs.existsSync(configPath)) {
  console.error(`Config not found: ${configPath}`);
  process.exit(1);
}

const rawConfig = fs.readFileSync(configPath, 'utf8').replace(/^\uFEFF/, '');
const config = JSON.parse(rawConfig);
const repo = config.repo || 'Alicoder001/agent-skills';

const selected = new Set(config.mandatory || []);

const selections = config.selections || {};
const choices = config.choices || {};

for (const key of Object.keys(selections)) {
  const choiceKey = selections[key];
  const def = choices[key];
  if (!def || !def.options || !def.options[choiceKey]) {
    console.error(`Invalid selection: ${key} -> ${choiceKey}`);
    process.exit(1);
  }
  def.options[choiceKey].forEach((s) => selected.add(s));
}

const skills = Array.from(selected);

console.log('Installing skills:');
skills.forEach((s) => console.log(`- ${s}`));
console.log('');

for (const skill of skills) {
  const args = ['skills', 'add', repo, '--skill', skill];
  const result = spawnSync('npx', args, { stdio: 'inherit', shell: true });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

console.log('\nDone.');
