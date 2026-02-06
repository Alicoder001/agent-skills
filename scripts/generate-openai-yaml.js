const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const IGNORE_DIRS = new Set([
  '.git',
  '.github',
  'node_modules',
  '.vscode',
  'scripts',
]);

function readUtf8(filePath) {
  return fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
}

function titleCase(value) {
  return value
    .split(/[-_ ]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function parseFrontmatter(markdown) {
  const normalized = markdown.replace(/^\uFEFF/, '');
  const match = normalized.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) {
    return null;
  }
  const frontmatter = match[1];
  const lines = frontmatter.split(/\r?\n/);
  const map = {};
  for (const line of lines) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (match) {
      map[match[1]] = match[2].trim();
    }
  }
  return map;
}

function normalizeDescription(description) {
  if (!description) {
    return '';
  }
  return description.replace(/\s+/g, ' ').trim();
}

function buildYaml(data) {
  const lines = [
    'version: 1',
    `display_name: ${JSON.stringify(data.display_name)}`,
    `short_description: ${JSON.stringify(data.short_description)}`,
    `default_prompt: ${JSON.stringify(data.default_prompt)}`,
  ];
  return `${lines.join('\n')}\n`;
}

function generateForSkill(skillPath) {
  const skillDir = path.dirname(skillPath);
  const content = readUtf8(skillPath);
  const fm = parseFrontmatter(content);
  if (!fm || !fm.name || !fm.description) {
    throw new Error(`Missing frontmatter name/description: ${skillPath}`);
  }

  const displayName = titleCase(fm.name);
  const description = normalizeDescription(fm.description);
  const shortDescription = description.length > 140 ? `${description.slice(0, 137)}...` : description;
  const defaultPrompt = description.length > 0
    ? `Use this skill when: ${description}`
    : `Use this skill when working on ${displayName}.`;

  const yaml = buildYaml({
    display_name: displayName,
    short_description: shortDescription,
    default_prompt: defaultPrompt,
  });

  const agentsDir = path.join(skillDir, 'agents');
  if (!fs.existsSync(agentsDir)) {
    fs.mkdirSync(agentsDir);
  }

  const outPath = path.join(agentsDir, 'openai.yaml');
  fs.writeFileSync(outPath, yaml, 'utf8');
  return outPath;
}

function run() {
  const skills = [];
  const queue = [ROOT];
  while (queue.length > 0) {
    const current = queue.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (IGNORE_DIRS.has(entry.name)) {
          continue;
        }
        queue.push(fullPath);
      } else if (entry.isFile() && entry.name === 'SKILL.md') {
        skills.push(fullPath);
      }
    }
  }

  skills.sort();
  const outputs = [];
  for (const skillPath of skills) {
    outputs.push(generateForSkill(skillPath));
  }

  console.log(`Generated ${outputs.length} openai.yaml files.`);
}

run();
