const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const repo = 'Alicoder001/agent-skills';

const mandatory = ['global-config', 'typescript', 'git', 'errors'];

const questions = [
  {
    key: 'frontend',
    prompt: 'Frontend?\n1) Next.js\n2) Vite\n3) None\n> ',
    options: {
      '1': ['react-core', 'react-nextjs'],
      '2': ['react-core', 'react-vite'],
      '3': [],
    },
  },
  {
    key: 'state',
    prompt: 'State management?\n1) TanStack Query\n2) Zustand\n3) Redux\n4) None\n> ',
    options: {
      '1': ['tanstack-query'],
      '2': ['zustand'],
      '3': ['redux'],
      '4': [],
    },
  },
  {
    key: 'ui',
    prompt: 'UI library?\n1) Tailwind\n2) shadcn/ui\n3) None\n> ',
    options: {
      '1': ['tailwind'],
      '2': ['shadcn'],
      '3': [],
    },
  },
  {
    key: 'backend',
    prompt: 'Backend?\n1) NestJS\n2) Express\n3) None\n> ',
    options: {
      '1': ['nestjs', 'api-patterns', 'security'],
      '2': ['api-patterns', 'security'],
      '3': [],
    },
  },
  {
    key: 'testing',
    prompt: 'Testing?\n1) Yes\n2) No\n> ',
    options: {
      '1': ['testing'],
      '2': [],
    },
  },
  {
    key: 'design',
    prompt: 'Design guidelines?\n1) Yes\n2) No\n> ',
    options: {
      '1': ['design'],
      '2': [],
    },
  },
  {
    key: 'arch',
    prompt: 'Architecture?\n1) Monorepo\n2) Enterprise DDD\n3) None\n> ',
    options: {
      '1': ['monorepo'],
      '2': ['enterprise-ddd'],
      '3': [],
    },
  },
];

const answers = {};

function ask(index) {
  if (index >= questions.length) {
    return finish();
  }
  const q = questions[index];
  rl.question(q.prompt, (answer) => {
    if (!q.options[answer]) {
      console.log('Invalid choice. Try again.');
      return ask(index);
    }
    answers[q.key] = q.options[answer];
    ask(index + 1);
  });
}

function finish() {
  const selected = new Set(mandatory);
  Object.values(answers).forEach((skills) => {
    skills.forEach((s) => selected.add(s));
  });

  const skillList = Array.from(selected);

  console.log('\n--- Summary ---');
  console.log('Mandatory:', mandatory.join(', '));
  const optional = skillList.filter((s) => !mandatory.includes(s));
  console.log('Selected:', optional.length ? optional.join(', ') : '(none)');

  const lines = [
    `npx skills add ${repo} \\\n  ${skillList.map((s, i) => `--skill ${s}${i === skillList.length - 1 ? '' : ' \\\n  '}`).join('')}`,
  ];

  console.log('\nInstall command:');
  console.log(lines.join('\n'));
  rl.close();
}

console.log('Welcome! Let\'s pick skills for your project.\n');
console.log('Mandatory skills (auto-added):');
mandatory.forEach((s) => console.log(`- ${s}`));
console.log('');

ask(0);
