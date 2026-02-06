const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKILL_CATEGORIES = ['agent', 'arch', 'backend', 'core', 'frontend', 'infra', 'perf'];
const SOFT_LINE_BUDGET = 300;
const HARD_LINE_LIMIT = 500;
const SOFT_WORD_BUDGET = 900;
const HARD_WORD_LIMIT = 1400;

const errors = [];
const warnings = [];

function walkFiles(dir, result = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, result);
      continue;
    }
    result.push(fullPath);
  }
  return result;
}

function readUtf8(filePath) {
  return fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
}

function normalizeSkillName(skillPathWithCategory) {
  return skillPathWithCategory.split('/').pop();
}

function titleCase(value) {
  return value
    .split(/[-_ ]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function parseWizardMandatory(wizardText) {
  const match = wizardText.match(/const mandatory = \[([^\]]+)\];/);
  if (!match) {
    return null;
  }
  const values = match[1]
    .split(',')
    .map((v) => v.trim())
    .map((v) => v.replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);
  return values;
}

function parseFindSkillsAgentTable(findSkillsText) {
  const marker = '### Agent Skills';
  const markerIndex = findSkillsText.indexOf(marker);
  if (markerIndex < 0) {
    return null;
  }

  const afterMarker = findSkillsText.slice(markerIndex + marker.length);
  const nextSectionIndex = afterMarker.indexOf('\n## ');
  const section = nextSectionIndex >= 0 ? afterMarker.slice(0, nextSectionIndex) : afterMarker;

  const names = [];
  const regex = /^\|\s*([a-z0-9-]+)\s*\|/gim;
  let match;
  while ((match = regex.exec(section)) !== null) {
    const value = match[1];
    if (value !== 'skill') {
      names.push(value);
    }
  }
  return names;
}

function hasNulByte(filePath) {
  const buffer = fs.readFileSync(filePath);
  for (const byte of buffer) {
    if (byte === 0) {
      return true;
    }
  }
  return false;
}

function countWords(text) {
  return text
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean).length;
}

function stripCodeBlocks(markdownText) {
  return markdownText.replace(/```[\s\S]*?```/g, '');
}

function extractMarkdownLinks(markdownText) {
  const text = stripCodeBlocks(markdownText);
  const links = [];
  const regex = /\[[^\]]*]\(([^)]+)\)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    links.push(match[1].trim());
  }
  return links;
}

function isExternalLink(link) {
  const normalized = link.toLowerCase();
  return normalized.startsWith('http://')
    || normalized.startsWith('https://')
    || normalized.startsWith('mailto:')
    || normalized.startsWith('tel:')
    || normalized.startsWith('#');
}

function normalizeLinkTarget(rawLink) {
  let link = rawLink;
  if (link.startsWith('<') && link.endsWith('>')) {
    link = link.slice(1, -1);
  }
  if (link.includes(' ')) {
    link = link.split(' ')[0];
  }
  link = link.split('#')[0];
  link = link.split('?')[0];
  return link.trim();
}

function checkMarkdownLinks(filePath, content) {
  const relFile = path.relative(ROOT, filePath);
  const links = extractMarkdownLinks(content);
  for (const rawLink of links) {
    const target = normalizeLinkTarget(rawLink);
    if (!target || isExternalLink(target)) {
      continue;
    }
    const resolved = path.resolve(path.dirname(filePath), target);
    if (!fs.existsSync(resolved)) {
      errors.push(`Broken local markdown link in ${relFile}: ${rawLink}`);
    }
  }
}

function checkSkillFiles() {
  for (const category of SKILL_CATEGORIES) {
    const categoryPath = path.join(ROOT, category);
    if (!fs.existsSync(categoryPath)) {
      errors.push(`Missing skill category directory: ${category}`);
      continue;
    }

    const entries = fs.readdirSync(categoryPath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }
      const skillDir = path.join(categoryPath, entry.name);
      const skillFile = path.join(skillDir, 'SKILL.md');
      if (!fs.existsSync(skillFile)) {
        errors.push(`Missing SKILL.md: ${path.relative(ROOT, skillDir)}`);
        continue;
      }

      const content = readUtf8(skillFile);
      const lines = content.split(/\r?\n/);
      const words = countWords(content);

      if (lines.length > HARD_LINE_LIMIT) {
        errors.push(`SKILL.md exceeds hard line limit (${HARD_LINE_LIMIT}): ${path.relative(ROOT, skillFile)} (${lines.length})`);
      } else if (lines.length > SOFT_LINE_BUDGET) {
        warnings.push(`SKILL.md exceeds soft line budget (${SOFT_LINE_BUDGET}): ${path.relative(ROOT, skillFile)} (${lines.length})`);
      }

      if (words > HARD_WORD_LIMIT) {
        errors.push(`SKILL.md exceeds hard word limit (${HARD_WORD_LIMIT}): ${path.relative(ROOT, skillFile)} (${words})`);
      } else if (words > SOFT_WORD_BUDGET) {
        warnings.push(`SKILL.md exceeds soft word budget (${SOFT_WORD_BUDGET}): ${path.relative(ROOT, skillFile)} (${words})`);
      }

      if (!content.startsWith('---\n') && !content.startsWith('---\r\n')) {
        errors.push(`Missing frontmatter opening separator: ${path.relative(ROOT, skillFile)}`);
        continue;
      }

      const secondSepIndex = lines.findIndex((line, idx) => idx > 0 && line.trim() === '---');
      if (secondSepIndex < 0) {
        errors.push(`Missing frontmatter closing separator: ${path.relative(ROOT, skillFile)}`);
        continue;
      }

      const frontmatterLines = lines.slice(1, secondSepIndex);
      const keys = frontmatterLines
        .map((line) => line.match(/^([A-Za-z0-9_-]+):/))
        .filter(Boolean)
        .map((match) => match[1]);

      const hasName = keys.includes('name');
      const hasDescription = keys.includes('description');
      if (!hasName || !hasDescription) {
        errors.push(`Frontmatter must include name and description: ${path.relative(ROOT, skillFile)}`);
      }

      const extraKeys = keys.filter((key) => !['name', 'description'].includes(key));
      if (extraKeys.length > 0) {
        errors.push(`Unsupported frontmatter keys in ${path.relative(ROOT, skillFile)}: ${extraKeys.join(', ')}`);
      }

      const nameLine = frontmatterLines.find((line) => line.startsWith('name:'));
      if (!nameLine) {
        continue;
      }
      const declaredName = nameLine.replace('name:', '').trim();
      if (declaredName !== entry.name) {
        errors.push(`Skill name mismatch in ${path.relative(ROOT, skillFile)}: expected "${entry.name}", got "${declaredName}"`);
      }

      checkMarkdownLinks(skillFile, content);

      const agentsDir = path.join(skillDir, 'agents');
      const openaiYaml = path.join(agentsDir, 'openai.yaml');
      if (!fs.existsSync(openaiYaml)) {
        errors.push(`Missing agents/openai.yaml: ${path.relative(ROOT, skillDir)}`);
      } else {
        const yaml = readUtf8(openaiYaml);
        const linesYaml = yaml.split(/\r?\n/).filter(Boolean);
        const parsedYaml = {};
        for (const line of linesYaml) {
          const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
          if (m) {
            let value = m[2].trim();
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
              value = value.slice(1, -1);
            }
            parsedYaml[m[1]] = value;
          }
        }
        const requiredYamlKeys = ['version', 'display_name', 'short_description', 'default_prompt'];
        for (const key of requiredYamlKeys) {
          if (!Object.prototype.hasOwnProperty.call(parsedYaml, key)) {
            errors.push(`Missing key "${key}" in ${path.relative(ROOT, openaiYaml)}`);
          }
        }
        const expectedDisplay = titleCase(declaredName);
        if (parsedYaml.display_name && parsedYaml.display_name !== expectedDisplay) {
          warnings.push(`display_name mismatch in ${path.relative(ROOT, openaiYaml)}: expected "${expectedDisplay}", got "${parsedYaml.display_name}"`);
        }
        if (parsedYaml.short_description && parsedYaml.short_description.length > 160) {
          warnings.push(`short_description too long (>160) in ${path.relative(ROOT, openaiYaml)}`);
        }
      }

      const referencesDir = path.join(skillDir, 'references');
      if (fs.existsSync(referencesDir)) {
        const referencesMentioned = /references\//i.test(content);
        if (!referencesMentioned) {
          warnings.push(`Skill has references directory but no references mention in SKILL.md: ${path.relative(ROOT, skillFile)}`);
        }

        const referenceFiles = walkFiles(referencesDir).filter((file) => file.toLowerCase().endsWith('.md'));
        if (referenceFiles.length === 0) {
          warnings.push(`Empty references directory: ${path.relative(ROOT, referencesDir)}`);
        }
        for (const refFile of referenceFiles) {
          const refContent = readUtf8(refFile);
          checkMarkdownLinks(refFile, refContent);
        }
      } else if (lines.length > SOFT_LINE_BUDGET || words > SOFT_WORD_BUDGET) {
        warnings.push(`Large skill without references directory: ${path.relative(ROOT, skillFile)}`);
      }
    }
  }
}

function checkCatalogDrift() {
  const bundlesPath = path.join(ROOT, 'bundles.json');
  const configPath = path.join(ROOT, 'skills.config.json');
  const wizardPath = path.join(ROOT, 'scripts', 'skills-wizard.js');
  const findSkillsPath = path.join(ROOT, 'agent', 'find-skills', 'SKILL.md');

  const bundles = JSON.parse(readUtf8(bundlesPath));
  const config = JSON.parse(readUtf8(configPath));
  const wizardText = readUtf8(wizardPath);
  const findSkillsText = readUtf8(findSkillsPath);

  const essentialBundle = bundles?.bundles?.essential?.skills || [];
  const expectedMandatory = essentialBundle.map(normalizeSkillName).sort();
  const configMandatory = (config?.mandatory || []).slice().sort();

  if (expectedMandatory.join('|') !== configMandatory.join('|')) {
    errors.push(
      `Mandatory skills drift between bundles.json and skills.config.json: expected [${expectedMandatory.join(', ')}], got [${configMandatory.join(', ')}]`
    );
  }

  const wizardMandatory = parseWizardMandatory(wizardText);
  if (!wizardMandatory) {
    errors.push('Unable to parse mandatory skills from scripts/skills-wizard.js');
  } else {
    const wizardSorted = wizardMandatory.slice().sort();
    if (wizardSorted.join('|') !== expectedMandatory.join('|')) {
      errors.push(
        `Mandatory skills drift between bundles.json and scripts/skills-wizard.js: expected [${expectedMandatory.join(', ')}], got [${wizardSorted.join(', ')}]`
      );
    }
  }

  const expectedAgentSkills = (bundles?.categories?.agent?.skills || []).slice().sort();
  const findSkillsAgent = parseFindSkillsAgentTable(findSkillsText);
  if (!findSkillsAgent) {
    errors.push('Unable to find "### Agent Skills" section in agent/find-skills/SKILL.md');
  } else {
    const actual = Array.from(new Set(findSkillsAgent)).sort();
    const missing = expectedAgentSkills.filter((name) => !actual.includes(name));
    if (missing.length > 0) {
      errors.push(`agent/find-skills/SKILL.md is missing agent skill rows: ${missing.join(', ')}`);
    }
  }
}

function checkEncoding() {
  const files = walkFiles(ROOT);
  const ignoredDirs = ['.git', 'node_modules'];
  for (const file of files) {
    const rel = path.relative(ROOT, file);
    if (ignoredDirs.some((d) => rel.split(path.sep).includes(d))) {
      continue;
    }
    if (hasNulByte(file)) {
      errors.push(`NUL byte detected: ${rel}`);
    }
  }
}

function run() {
  checkSkillFiles();
  checkCatalogDrift();
  checkEncoding();

  if (warnings.length > 0) {
    console.log('Warnings:');
    warnings.forEach((warning) => console.log(`- ${warning}`));
  }

  if (errors.length > 0) {
    console.error('\nValidation failed with errors:');
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log('Validation passed.');
}

run();
