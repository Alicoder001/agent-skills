const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const EVAL_FILE = path.join(ROOT, 'evals', 'trigger-evals.json');
const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'when', 'need', 'use', 'using',
  'into', 'about', 'your', 'have', 'has', 'are', 'was', 'were', 'how', 'what', 'which',
  'will', 'would', 'could', 'should', 'can', 'but', 'not', 'only', 'also', 'very',
  'best', 'more', 'less', 'mode', 'rules', 'patterns', 'skill'
]);

function readUtf8(filePath) {
  return fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
}

function normalizeText(value) {
  return value
    .toLowerCase()
    .replace(/next\.js/g, 'nextjs')
    .replace(/rtk query/g, 'rtk-query')
    .replace(/tanstack query/g, 'tanstack-query')
    .replace(/[^a-z0-9-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(value) {
  return normalizeText(value)
    .split(' ')
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !STOPWORDS.has(token));
}

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) {
    return null;
  }
  const lines = match[1].split(/\r?\n/);
  const map = {};
  for (const line of lines) {
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (m) {
      map[m[1]] = m[2].trim();
    }
  }
  return map;
}

function loadSkills() {
  const categories = ['agent', 'arch', 'backend', 'core', 'frontend', 'infra', 'perf'];
  const skills = [];
  for (const category of categories) {
    const categoryPath = path.join(ROOT, category);
    if (!fs.existsSync(categoryPath)) {
      continue;
    }
    const dirs = fs.readdirSync(categoryPath, { withFileTypes: true }).filter((d) => d.isDirectory());
    for (const dir of dirs) {
      const skillPath = path.join(categoryPath, dir.name, 'SKILL.md');
      if (!fs.existsSync(skillPath)) {
        continue;
      }
      const content = readUtf8(skillPath);
      const fm = parseFrontmatter(content);
      if (!fm || !fm.name || !fm.description) {
        continue;
      }
      const nameTokens = tokenize(fm.name.replace(/-/g, ' '));
      const descTokens = tokenize(fm.description);
      skills.push({
        name: fm.name,
        category,
        description: fm.description,
        nameTokens,
        descTokens
      });
    }
  }
  return skills.sort((a, b) => a.name.localeCompare(b.name));
}

function scoreSkill(prompt, skill) {
  const promptTokens = new Set(tokenize(prompt));
  let score = 0;

  for (const token of skill.nameTokens) {
    if (promptTokens.has(token)) {
      score += 4;
    }
  }

  for (const token of skill.descTokens) {
    if (promptTokens.has(token)) {
      score += 1;
    }
  }

  return score;
}

function evaluateCase(testCase, skills, noneThreshold) {
  const scored = skills.map((skill) => ({
    name: skill.name,
    score: scoreSkill(testCase.prompt, skill)
  }));
  scored.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  const best = scored[0];
  const expected = testCase.expected;

  if (expected === null) {
    const pass = best.score <= noneThreshold;
    return {
      id: testCase.id,
      prompt: testCase.prompt,
      expected,
      actual: pass ? null : best.name,
      score: best.score,
      pass
    };
  }

  const pass = best.name === expected;
  return {
    id: testCase.id,
    prompt: testCase.prompt,
    expected,
    actual: best.name,
    score: best.score,
    pass
  };
}

function run() {
  if (!fs.existsSync(EVAL_FILE)) {
    console.error(`Eval file not found: ${EVAL_FILE}`);
    process.exit(1);
  }

  const raw = JSON.parse(readUtf8(EVAL_FILE));
  const threshold = typeof raw.pass_threshold === 'number' ? raw.pass_threshold : 0.85;
  const noneThreshold = typeof raw.none_score_threshold === 'number' ? raw.none_score_threshold : 4;
  const cases = Array.isArray(raw.cases) ? raw.cases : [];
  const skills = loadSkills();

  if (skills.length === 0) {
    console.error('No skills loaded.');
    process.exit(1);
  }

  const results = cases.map((testCase) => evaluateCase(testCase, skills, noneThreshold));
  const passed = results.filter((r) => r.pass).length;
  const total = results.length;
  const accuracy = total === 0 ? 0 : passed / total;

  console.log(`Trigger evals: ${passed}/${total} passed (${(accuracy * 100).toFixed(1)}%)`);
  if (accuracy < threshold) {
    console.error(`Required threshold: ${(threshold * 100).toFixed(1)}%`);
  }

  const failed = results.filter((r) => !r.pass);
  if (failed.length > 0) {
    console.error('\nFailed cases:');
    for (const item of failed) {
      console.error(`- ${item.id}: expected=${item.expected}, actual=${item.actual}, score=${item.score}`);
    }
  }

  if (accuracy < threshold) {
    process.exit(1);
  }
}

run();
