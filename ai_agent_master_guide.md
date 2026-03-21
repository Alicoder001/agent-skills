# AI Agent & Prompt Engineering — To'liq Qo'llanma
> **Manba:** Internet research (2025–2026) + Notion workspace + AI Development Framework hujjati + Multi-Agent Planning Pipeline  
> **Muallif:** Golibjon Xasanov · Webchi  
> **Versiya:** 1.0 · 2026-03-21  
> **Maqsad:** Claude Code, Codex va boshqa AI agentlardan maksimal samaradorlik bilan foydalanish — token optimizatsiyasi, context saqlanishi, sessiyalar orasida davom ettirish

---

## MUNDARIJA

1. [Muammo: Nima Uchun AI Agentlar Adashadi](#1-muammo)
2. [Falsafa: Bino Qurilishi Tamoyili](#2-falsafa)
3. [Context Engineering — Asosiy Nazariya](#3-context-engineering)
4. [CLAUDE.md — Token Tejashning Kaliti](#4-claudemd)
5. [AGENTS.md — Yagona Manba (SSOT)](#5-agentsmd)
6. [Skills — Lazy Loading Prinsipi](#6-skills)
7. [4 Qatlamli Agent Prompt Arxitekturasi](#7-4-qatlamli-prompt)
8. [Multi-Agent Pipeline — To'liq Arxitektura](#8-multi-agent-pipeline)
9. [Context Saqlanish Tizimi — 3 Fayl](#9-context-saqlanish)
10. [Task Card Template](#10-task-card)
11. [Context Budget Qoidalari](#11-context-budget)
12. [Sessiyalar Orasida O'tish Strategiyasi](#12-sessiya-otish)
13. [Plan Mode & Token Tejash](#13-plan-mode)
14. [Hooks — Deterministik Avtomatlashtirish](#14-hooks)
15. [Subagentlar — Parallel Arxitektura](#15-subagentlar)
16. [Tool Search — Token Tejashning Yangi Usuli](#16-tool-search)
17. [Prompt Strukturasi — Konkret Misollar](#17-prompt-strukturasi)
18. [Anti-Pattern Jadvali](#18-anti-patterns)
19. [Papka Tuzilishi — Rasmiy Standart](#19-papka-tuzilishi)
20. [Hujjatlashtirish Strategiyasi](#20-hujjatlashtirish)
21. [Webchi Loyihasidagi Qo'llanish](#21-webchi)
22. [Tezkor Nazorat Ro'yxati](#22-checklist)

---

## 1. Muammo

AI agentlar ikki fundamental muammoga duch keladi. Bu muammolarni tushunmasdan yechim qurish — yana muammo qurish demakdir.

### 1.1 Stateless tabiat

Har yangi sessiyada agent hamma narsani unutadi. Oldingi sessiyada nima qilingani, qaysi qaror qabul qilingani, qaysi muammolar hal etilgani — barchasi yo'q bo'ladi. Shuning uchun u eski ishni qayta qilishi, yoki ustiga yamab ketishi mumkin.

### 1.2 Context-blindness

Agent o'ziga berilgan kontekst sifatida ishlaydi. 50 sahifalik loyiha hujjatini ko'rsa ham, 3–4 asosiy narsani eslab qoladi, qolganini o'zi to'ldiradi — ko'pincha noto'g'ri. Qanchalik ko'p kontekst, shunchalik ko'p xatolik.

### 1.3 "Dumb Zone" effekti

> **Context "dumb zone":** Context window 80%+ to'lganda model sifati keskin tushadi. Bu "context rot" — ma'lumotlar to'planishi bilan model aslida kamroq eslab qoladi.

**Natija:** Palapartish ish. Qaysidir qismlar chala qoladi, qaysidir qismlar ustiga yamab ketiladi, ketma-ketlik yo'qoladi. Bino qurilishi kabi emas — qurilish maydonchasida tasodifiy ishlaydigan ishchilar kabi.

---

## 2. Falsafa

### Bino Qurilishi Tamoyili

Yechimning asosi — bino qurilishi metaforasi. Binoda poydevor bo'lmay devor qurilmaydi, devor bo'lmay tom qo'yilmaydi. Har bosqichda qabul akti bor. AI loyihasida ham xuddi shunday bo'lishi kerak.

### 2.1 Uch Asosiy Prinsip

**Prinsip 1: Locked Progression**  
Har bir qadam faqat oldingi qadam to'liq tugagandan keyin ochiladi. Executor keyingi fazaga o'ta olmaydi — Review gate tasdiq bermasa.

**Prinsip 2: Minimal Context**  
Har agent faqat o'zi uchun yozilgan bitta varaq ko'radi. 500 sahifalik loyiha hujjatini ko'rmaydi. Qanchalik kam kontekst — shunchalik aniq ish.

**Prinsip 3: Living Memory**  
`progress.md` — loyihaning yagona xotirasi. Agentlar o'zgarganda ham loyiha davom etadi. Har agent shu faylni o'qib kiradi, tugagach shu faylga yozadi.

### 2.2 Planning vs Execution Ajratish

Ko'pchilik bu ikki bosqichni aralashtirib yuboradi. Bu eng katta xato.

| | Planning bosqichi | Execution bosqichi |
|---|---|---|
| Maqsad | Nima qilish kerakligini aniqlash | Qilish |
| Natija | Faqat `.md` fayllar | Kod, fayllar, outputlar |
| Agent soni | Bir marta ishlaydigan agentlar | Har task uchun yangi instance |
| Kontekst | Butun loyiha ko'rinadi | Faqat bitta task card |
| Vaqt ulushi | Loyihaning 15–20%i | 80–85% |

---

## 3. Context Engineering

### Asosiy Falsafa

**Context engineering** — LLM cheklovlariga qarshi tokenlar foydaliligini optimizatsiya qilish san'ati.

Savol shunday qo'yilishi kerak:  
> *"Qaysi token konfiguratsiyasi modelning kerakli xulq-atvorini keltirib chiqarishi eng ehtimoli yuqori?"*

### Asosiy Qonunlar

```
1. Sifat > Miqdor
   500 sahifalik hujjat vs 10 qatorli task card → task card g'alaba qiladi

2. Lazy Loading > Eager Loading
   Hammani oldindan yuklama — kerak bo'lganda yukla

3. Living Files > Static Docs
   Bir marta yoziladigan hujjat vs har sessiyada yangilanadigan fayl

4. Structured > Narrative
   Strukturali prompt narrativ promptdan 30% kam token sarflaydi

5. 40–60% Rule
   Context window 40–60% band bo'lsa optimal ishlaydi
   80%+ → "dumb zone" → hallucination oshadi
```

---

## 4. CLAUDE.md

### Nima Kiradi, Nima Kirmaydi

`CLAUDE.md` har sessiyada yuklanadi — shuning uchun faqat keng qo'llaniladigan narsalarni kiriting.

**✅ CLAUDE.md ga KIRADI (agent bila olmaydi):**
```
- TypeScript strict — any mutlaqo taqiqlangan
- Qotgan fayllarni o'zgartirma
- pnpm ishlatamiz, npm emas
- Har qaror uchun 1 jumla sabab ayt
- Arxitektura xaritasidan chetga chiqma
- style={{}} taqiqlangan
- Hardcode rang/font taqiqlangan
```

**❌ CLAUDE.md ga KIRMAYDI (tool tekshiradi):**
```
- "console.log bo'lmasin"    → ESLint
- "TypeScript ishlatamiz"    → tsconfig
- "Prettier formati"         → .prettierrc
- "import tartibi"           → ESLint import plugin
```

> **ETH Zurich Tadqiqoti (2026):** LLM tomonidan yaratilgan rules fayllar ishlash samaradorligini **-3%** kamaytiradi va xarajatni **+20%** oshiradi. Inson tomonidan yozilgan qoidalar — **+4%** samaradorlik.  
> **Xulosa:** Rules faylga faqat agent o'zi bila olmaydigan narsalarni yozing.

### CLAUDE.md Hajmi

```
Maqsadli hajm: 50–100 satr maksimum
Anthropic tizim prompti ~50 ta ko'rsatma oladi — sizniki ham shuncha limit

Har bir satr uchun: "Buni olib tashlasamda Claude xato qiladimi?"
Agar yo'q → qisqartiring.
Shishib ketgan CLAUDE.md → Claude ko'rsatmalarni e'tiborsiz qoldiradi!
```

### CLAUDE.md Tili

```
❌ Noto'g'ri: "Prefer TypeScript"
✅ To'g'ri:   "MUST use TypeScript strict mode"

❌ Noto'g'ri: "Try to avoid any"
✅ To'g'ri:   "NEVER use 'any' — this is a hard rule"

"MUST" va "NEVER" kalit so'zlari ishonchli ishlaydi.
```

### Namuna CLAUDE.md

```markdown
# WEBCHI PROJECT — Claude Instructions

## Project
Next.js 14 + TypeScript + Tailwind v4 web agency platform.
Stack: pnpm · Prisma · PostgreSQL · next-intl

## Rules (MUST follow)
- MUST use TypeScript strict — `any` is NEVER allowed
- MUST use pnpm — npm/yarn are NEVER allowed  
- NEVER use `style={{}}` — Tailwind classes only
- NEVER hardcode colors/fonts — use CSS tokens `@theme{}`
- NEVER hardcode text — use `t('key')` only
- NEVER modify frozen files: metadata.ts, analytics.ts
- Each decision MUST include 1-sentence reason

## Commands
- Dev: `pnpm dev`
- Build: `pnpm build`
- Test: `pnpm test`
- Lint: `pnpm lint`

## Skills (load when needed)
See .claude/skills/ — load only when relevant task starts.

## Session Protocol
1. START: Read _memory/progress.md + _memory/todo.md
2. END: Update both files before closing session
3. At 50% context: create HANDOFF.md then /compact
```

---

## 5. AGENTS.md

### Yagona Manba (SSOT) Prinsipi

`AGENTS.md` — barcha toollar o'qiydigan yagona manba.

```
AGENTS.md        ← YAGONA MANBA
CLAUDE.md        ← "./AGENTS.md ga qarang" + qisqa kontekst
.cursor/rules/   ← AGENTS.md ni mirror qiladi (.mdc format)
.github/copilot-instructions.md ← symlink → AGENTS.md
.windsurfrules   ← AGENTS.md dan sync
```

**Nima uchun kuchli:** Bitta fayl o'zgarsa, barcha toollar (Claude Code, Cursor, Codex, Copilot, Windsurf) sinxron bo'ladi.

### Tool Qo'llab-Quvvatlashi

| Tool | Fayl formati | AGENTS.md |
|------|-------------|-----------|
| Cursor | `.cursor/rules/*.mdc` | ✅ Ha |
| Claude Code | `CLAUDE.md` · `.claude/rules/` | ✅ Ha |
| Codex (OpenAI) | `AGENTS.md` (native) | ✅ Ha |
| GitHub Copilot | `.github/copilot-instructions.md` | ✅ Ha |
| Windsurf | `.windsurfrules` | ✅ Ha |
| API (to'g'ridan) | System Prompt | — qo'lda beriladi |

### Webchi Global AGENTS.md

```markdown
# WEBCHI GLOBAL RULES v1.0

## 1. KOD SIFATI
- TypeScript strict — any mutlaqo taqiqlangan
- style={{}} — taqiqlangan, faqat Tailwind
- Hardcode rang/font — taqiqlangan, faqat CSS token (@theme{})
- Hardcode matn — taqiqlangan, faqat t('key') funksiyasi
- Magic number — taqiqlangan, config da bo'lsin
- default export — faqat page.tsx va layout.tsx
- pnpm — npm/yarn taqiqlangan

## 2. FAYL TUZILMASI
- Komponent — har doim o'z papkasida
- index.ts orqali export
- Papka nomi — kebab-case
- Komponent nomi — PascalCase
- Funksiya nomi — camelCase

## 3. ARXITEKTURA
- Arxitektura xaritasidan chetga chiqma
- Yangi dependency qo'shma — config da tasdiqlash kerak
- Qotgan fayllarni o'zgartirma (metadata.ts, analytics.ts)
- Global Layer ga tegma
- Slot qoidasi: har qatlam faqat bir pastki qatlamni to'ldiradi

## 4. AGENT CHEGARALARI
- Har qaror uchun 1 jumla sabab ayt
- Noaniq bo'lsa — savollar ro'yxati, taxmin qilma
- Template Creator ≠ Builder
- Loyihadagi o'zgarish templatega tegmaydi

## 5. LOKALIZATSIYA
- Hardcode matn MUTLAQO taqiqlangan — faqat t() funksiyasi
- messages/ papkasi — yagona matn manbai (SSOT)
- app/[locale]/ — routing majburiy
- Default locale: uz | Supported: uz, ru, en
- hreflang teglari — multi-locale saytlarda majburiy

## 6. SESSION MEMORY
- Har sessiya BOSHIDA: _memory/progress.md va _memory/todo.md o'qi
- Ish TUGAGACH: ikkalasini yangilab chiq
- Keyingi fazaga faqat Review gate tasdiqlasadan o't
- Har qaror uchun 1 jumla sabab yoz (progress.md > Muhim qarorlar)
- Context 50%+ bo'lsa: HANDOFF.md yarat, /compact ber
```

### Cursor uchun .mdc Format

```yaml
---
description: Webchi global qoidalar
globs: "**/*"
alwaysApply: true
---
# Global Rules
[qoidalar mazmuni]
```

```yaml
---
description: Tibbiyot sohasi qoidalari
globs: "**/tibbiyot/**"
alwaysApply: false
---
# Medical Rules
[qoidalar mazmuni]
```

---

## 6. Skills

### Lazy Loading Prinsipi

Boshlang'ich context og'irlashtirmaslik uchun skills faqat kerak bo'lganda yuklanadi.

**Natija:** 54% boshlang'ich context kamayishi (7,584 tokendan 3,434 ga).

### Skill Fayl Strukturasi

```
.claude/skills/
├── architect.skill.md       ← Brief tahlil, 8 qatlam JSON chiqarish
├── builder-web.skill.md     ← Next.js + FSD + Tailwind v4
├── builder-api.skill.md     ← NestJS + Clean Arch + Prisma
├── builder-mobile.skill.md  ← Expo + React Native
├── builder-bot.skill.md     ← Telegraf / Grammy + scenes
├── qa.skill.md              ← QA checklist, xato topish
├── graduate.skill.md        ← Graduation paketi, hujjat
└── template-creator.skill.md ← Yangi template, 8-qadam
```

### Skill Description — Trigger Yozish

Description — skillning "trigger" si. Claude 100+ skill orasidan to'g'ri birini tanlash uchun description dan foydalanadi.

```markdown
---
name: pdf-reader
description: >
  Extracts text, tables, and forms from PDF files. Use when 
  working with .pdf files or user mentions PDFs, forms, 
  or document extraction. Do NOT use for PDF creation.
tools: Read, Bash
---
```

**Qoidalar:**
- Uchinchi shaxsda yozing
- Nima qilishini va qachon ishlatilishini aniq ko'rsating
- "Do NOT use when..." ham yozing
- 2–4 jumla yetarli

### Skills Jadvali (Webchi)

| Skill fayli | Vazifa | Trigger |
|-------------|--------|---------|
| `architect.skill.md` | Brief tahlil, JSON xarita | "arxitektura", "brief", "tahlil" |
| `builder-web.skill.md` | Next.js + FSD + Tailwind | "web qurish", "frontend" |
| `builder-api.skill.md` | NestJS + Clean Arch | "API", "backend", "endpoint" |
| `builder-mobile.skill.md` | Expo + React Native | "mobile", "app" |
| `builder-bot.skill.md` | Telegraf/Grammy | "bot", "telegram" |
| `qa.skill.md` | Tekshirish, xato | "test", "QA", "check" |
| `graduate.skill.md` | Faza yakunlash | "graduate", "finish", "deploy" |
| `template-creator.skill.md` | Yangi template | "template qo'sh", "yangi soha" |

---

## 7. 4 Qatlamli Prompt Arxitekturasi

Agent prompti shunchaki "sen X sifatida gapir" emas. U **strukturali, qatlamli va dinamik** bo'lishi kerak.

### Universal Behavioral Rules (Barcha Agentlarga)

```javascript
MUTLAQ QOIDALAR:
1. Sen REAL mutaxassissan — hech qachon "AI", "model", "Claude" dema
2. Faqat o'z VAKOLATING doirasida qaror qabul qil
3. Vakolatdan tashqari so'rov → "Bu [Ism]ning sohasiga kiradi"
4. Bilmagan narsani bilmasligingni ayt — hech qachon to'qima
5. Javob QISQA va ANIQ bo'lsin: 2–5 gap odatda yetarli
6. O'z shaxsiyating va munosabatlaring bor — robotday gapirma
7. Sheriklaring ismini ishlat, ular real odamlar
8. Til: O'zbek, professional, soha terminologiyasi bilan
```

### Qatlam 1 — Identity Prompt

**Maqsad:** Agentning kim ekanligini, qanday fikrlashini va qanday gapirishi aniq belgilash.

❌ **Noto'g'ri:**
```
"Sen CTO Marcussan. Texnik masalalar haqida gapirasan."
```

✅ **To'g'ri:**
```
Sen AI Corp CTO Marcus Webbsan.
- 12 yillik software engineering tajribang bor. Google va Stripe'da ishlagan.
- Qaror uslubi: avval trade-off'larni aniqla, keyin qaror qabul qil.
  "Tez qaror yaxshimas, to'g'ri qaror yaxshi" — sening mottoing.
- Microservices tarafdori. Monolith ko'rganda ichingdan g'ijimlaysan.
- Nutq uslubi: aniq, texnik, pattern va yechim tilida gapirasan.
  Ortiqcha ijtimoiy so'z ishlatmaysan — to the point.
- Kuchli tomon: system design, scalability, code quality standards.
- Zaif tomon: UX nuanslarini tushunmaysan. Ba'zan over-engineer qilasan.
```

**Farq nima:** Ikkinchisida agent **qanday fikrlashini** bilamiz, nafaqat nima qilishini.

### Qatlam 2 — Domain Knowledge Prompt

**Maqsad:** Konkret bilim inject qilish — umumiy emas, joriy loyiha haqiqati.

❌ **Noto'g'ri:**
```
"Texnik arxitektura, backend, API haqida bilasan."
```

✅ **To'g'ri:**
```
TEXNIK BILIM VA LOYIHA KONTEKSTI:
- Stack: Node.js 20 + Express, PostgreSQL 14 + Redis 7, Docker + K8s (AWS EKS)
- Frontend: React 18 + TypeScript, Vite, Zustand state management
- Joriy arxitektura: monolith → microservices migratsiyasi boshlangan
  Auth service ajratilgan, Payment service keyingi
- Aktiv texnik qarz: legacy ORM (Sequelize → Prisma migratsiya kerak)
- Monitoring: DataDog + PagerDuty, SLA: 99.9%
- CI/CD: GitHub Actions + ArgoCD

JORIY SPRINT TEXNIK HOLATI:
- Auth service staging'da, load test o'tmoqda
- Redis connection pool muammosi hal qilinmagan
- Frontend bundle size 340KB (maqsad: <200KB)
```

### Qatlam 3 — Authority Prompt

**Maqsad:** Nima qila olishi va nima qila olmasligini aniq belgilash.

```javascript
VAKOLATIM (TO'G'RIDAN QAROR QABUL QILAMAN):
✅ Texnik arxitektura va stack tanlov
✅ Deploy freeze e'lon qilish
✅ Backend PR approve/reject
✅ Technical debt prioritetlash
✅ Engineering hiring bar belgilash

TASDIQLASH KERAK:
💬 Product feature prioritetlari → Tom + Alex qaror qiladi
💬 $10,000+ xarajatlar → Alex tasdiqlaydi
💬 Yangi xodim yollash → Alex qaror qiladi

MENING SOHAMDAN TASHQARIDA:
❌ Design va UX masalalari → Zoe
❌ Sprint tarkibi → Tom
❌ ML model arxitekturasi → Leon

VAKOLATDAN TASHQARIDA SO'ROV BO'LSA:
"Bu [ism]ning qaroriga bog'liq. [ism] bilan gaplash."
```

### Qatlam 4 — Relationships Prompt

**Maqsad:** Jamoa dinamikasi — ishonch, ziddiyat, hamkorlik.

```javascript
JAMOA MUNOSABATLARI:

Yuki Tanaka (Senior Eng):
  Ishonch: YUQORI. Arxitektura bo'yicha undan maslahat olaman.
  Muloqot: bevosita, texnik detalda.

Tom Bradley (PM):
  Ishonch: O'RTA. Product sense bor, lekin texnik estimatsiyaga ishonmayman.
  Ziddiyat: Tom tezroq ship qilmoqchi, men sifat uchun kurashaman.
  Muloqot: diplomatik, lekin aniq chegaralar.

Omar Rashid (Frontend):
  Ishonch: O'RTA-YUQORI. Ba'zan API konventsiyalarni e'tiborsiz qoldiradi.
  Muloqot: code review orqali, comment'lar bilan.
```

### Dinamik Context Injection

Har bir API chaqiruvida runtime'da qo'shiladigan qism:

```javascript
const buildCurrentContext = (channelId, agentId) => `
JORIY HOLAT [${new Date().toISOString()}]:
Kanal: #${getChannel(channelId).name}
Sprint: ${companyState.currentSprint}
Aktiv muammolar: ${companyState.activeIssues.join(', ') || 'yo\'q'}
Oxirgi qarorlar: ${getRecentDecisions(channelId, 3).join('; ') || 'yo\'q'}
Siz bilan oxirgi suhbat: ${getLastInteraction(agentId) || 'birinchi marta'}
`;
```

### Prompt Sifatini Tekshirish

```
- [ ] Agent bir mavzuda ikki xil pozitsiya bildira oladimi? (shaxsiyat bormi)
- [ ] Vakolatdan tashqari so'rovda to'g'ri odamga yo'naltiradimi?
- [ ] Konkret texnologiya va raqamlar bilan gapiradimi?
- [ ] Boshqa agentlar bilan o'ziga xos munosabati bormi?
- [ ] Dinamik kontekst inject qilinayaptimi?
```

---

## 8. Multi-Agent Pipeline

### To'liq Pipeline Arxitekturasi

```
PLANNING BOSQICHI (bir marta)
─────────────────────────────────────────────────────
[Falsafa agenti]
  Input:  Loyiha g'oyasi
  Output: philosophy.md (~500 so'z)
  ↓

[Fazalar arxitektori agenti]
  Input:  philosophy.md
  Output: phases.md (~300 so'z)
  ↓

[Subfaza planeri × N faza]
  Input:  phases.md (faqat bitta faza ko'radi)
  Output: subfases_phaseN.md (~600 so'z × N)
  ↓

[Task planeri × M subfaza]
  Input:  subfases_phaseN.md
  Output: tasks_subfaseN.md (task card × M)

EXECUTION BOSQICHI (har task uchun)
─────────────────────────────────────────────────────
[Bootstrap agenti — bir marta]
  Input:  Barcha _planning/ .md fayllar
  Output: _memory/progress.md, muhit tayyor
  ↓

[Task executor × 1 — loop]
  Input:  _memory/progress.md + bitta task card
  Output: Bajarilgan task + progress yangilanishi
  ↓ (loop: keyingi task)

[Review agenti — har faza oxirida]
  Input:  Faza barcha tasklari outputlari
  Output: Gate ochish (✅) yoki yopish (🔴)
  ↓

[Hujjatlashtirish agenti — exit criteria]
  Input:  Faza outputlari
  Output: _docs/phaseN_docs.md
```

### Agent Jadvali

| Bosqich | Agent nomi | Kiruvchi | Chiquvchi |
|---------|-----------|----------|-----------|
| PLANNING | Falsafa agenti | Loyiha g'oyasi | `philosophy.md` |
| PLANNING | Fazalar arxitektori | `philosophy.md` | `phases.md` |
| PLANNING | Subfaza planeri ×N | `phases.md` | `subfases_phaseN.md` |
| PLANNING | Task planeri ×M | `subfases_phaseN.md` | `tasks_subfaseN.md` |
| EXEC | Bootstrap agenti | Barcha .md fayllar | `progress.md`, muhit |
| EXEC | Task executor ×1 | `progress.md` + task card | Bajarilgan task + progress yangilanishi |
| EXEC | Review agenti | Faza barcha tasklari | Gate ochish / yopish |
| EXEC | Docs agenti | Faza outputlari | Faza hujjatlari |

### Qadamma-Qadam Jarayon

**Qadam 1: Falsafa (bir marta)**  
Hammadan oldin — loyiha nima uchun quriladi? Qanday prinsiplar bilan? Nimalardan qochish kerak? Bu hujjat loyiha davomida o'zgarmaydi.

**Qadam 2: Fazalar skeleti (bir marta)**  
Fazalar arxitektori philosophy.md ni o'qiydi va loyihani nechta yirik fazaga bo'ladi. Faqat skelet. Hech narsa qilmaydi.

**Qadam 3: Subfazalar (N marta)**  
Subfaza planeri har bir fazani alohida oladi. Faqat bitta fazani ko'radi, qolganlarini bilmaydi.

**Qadam 4: Task cardlar (M marta)**  
Task planeri har subfazani atomik tasklarga maydalaydi. Planning shu yerda tugaydi.

**Qadam 5: Bootstrap (bir marta)**  
Birinchi execution agenti. `progress.md` faylini yaratadi, repo strukturasini sozlaydi. Bu fayl bundan keyin loyihaning yagona xotirasi.

**Qadam 6: Task executor loop**  
Eng kichik va eng muhim agent. Faqat `progress.md` va bitta task cardni ko'radi. Bajaradi, exit checklist tekshiradi, progress.md ni yangilaydi. Keyingi sessiyada yangi instance shu yerdan davom etadi.

**Qadam 7: Review gate (har faza oxirida)**  
Tasdiq bermasa — keyingi faza ochilmaydi. Bino qurilishidagi qabul akti.

**Qadam 8: Hujjatlashtirish (har faza oxirida)**  
Docs agenti Review dan oldin ishlaydi. Faza hujjatlanmagan bo'lsa — faza tugamagan hisoblanadi.

---

## 9. Context Saqlanish Tizimi

### 3 Asosiy Fayl

| Fayl | Rol | Yangilanish |
|------|-----|-------------|
| `progress.md` | Loyiha uzun xotirasi | Har sessiya boshida O'QI, oxirida YOZIB CHIQ |
| `todo.md` | Sessiya qisqa xotirasi | Har sessiya boshida yangilanadi, agent har qadamda o'zi yangilaydi |
| `HANDOFF.md` | Sessiyalar ko'prigi | Context 50%+ bo'lganda yoki sessiya uzilganda |

### progress.md — Loyihaning Miyasi

```markdown
# Project Progress

## Joriy holat
- Faza: Phase 1 — Backend
- Subfaza: 1.2 — Authentication
- Task: 1.2.3 — JWT middleware
- Status: 🟡 IN PROGRESS
- Oxirgi yangilanish: 2026-03-21

## Bajarilganlar
- [x] Phase 0 — Bootstrap (100%)
- [x] Phase 1.1 — Database setup (100%)
- [~] Phase 1.2 — Authentication (60%)

## Joriy task bayoni
JWT middleware yozilishi kerak. express-jwt ishlatiladi.
Input: config/auth.js mavjud, secret key unda.
Output: middleware/auth.js fayli.

## Keyingi qadam
Task 1.2.4 — Role-based access control

## Muhim qarorlar
| Sana | Qaror | Sabab |
|------|-------|-------|
| 2026-03-18 | bcrypt o'rniga argon2 | Security best practice |
| 2026-03-18 | PostgreSQL o'rniga SQLite | MVP uchun soddalik |
```

### todo.md — "Manus Mexanizmi"

> **Manus mexanizmi:** Agent `todo.md` ni har qadamda o'zi yangilab boradi. Maqsad: "hozir nima qilish kerak" ni modelning so'nggi attention span'iga doim itarib turish. Bu hallucination ni kamaytiradi.

```markdown
# Joriy task: 1.2.3 — JWT middleware

## Bajarilishi kerak
- [ ] express-jwt o'rnatish
- [ ] middleware/auth.js fayl yaratish
- [ ] token validation funksiyasi
- [ ] error handling (401, 403)
- [ ] tests yozish

## Bajarildi
- [x] config/auth.js mavjudligini tekshirdim
- [x] express-jwt o'rnatdim

## Hozir qilyapman
middleware/auth.js da token validation yozyapman

## Sessiya tugagach
1. Yuqoridagi ro'yxatni yangilab chiq
2. progress.md ni yangilab chiq
3. Keyingi sessiya uchun todo.md ni yangilab chiq
```

**Muhim:** `todo.md` — 20 qator maksimum.

### HANDOFF.md — Sessiya O'tish Ko'prigi

```markdown
# HANDOFF.md

## Maqsad
[Nima qurilmoqda edi]

## Hozirgi holat
[Nima ishladi, nima ishlamadi]

## Bloker
[Nima to'sqinlik qildi — bo'lsa]

## Keyingi aniq qadam
[Bitta aniq harakat — noaniq emas]

## O'zgartirilgan fayllar
- src/middleware/auth.js
- tests/auth.test.js
- _memory/progress.md
```

**Foydalanish:**
```bash
# Context 50%+ bo'lganda agent ga bering:
"Create HANDOFF.md with: goal, progress so far, 
what worked, what didn't, exact next step, changed files"

# Keyin:
/compact

# Yangi sessiyada:
"Read HANDOFF.md and continue from where we left off"
```

---

## 10. Task Card Template

Har bir task executor agentga **faqat shu format** beriladi. Boshqa hech narsa yo'q.

```
═══════════════════════════════════════════════
TASK CARD — 1.2.3
═══════════════════════════════════════════════

CONTEXT (2 qator max):
E-commerce backend, Node.js + Express.
Hozir: Phase 1.2 Authentication.

DONE SO FAR:
progress.md ga qarang: _memory/progress.md
Muhim: bcrypt o'rniga argon2 ishlatilmoqda.

MY JOB:
JWT middleware yozish.
- express-jwt v9 ishlatish
- /api/* routelarni himoya qilish
- /api/auth/* ni ochiq qoldirish
- 401 va 403 errorlarni handle qilish

CONTEXT BUDGET:
Bu card: ~30% context
Execution uchun: ~70% qoladi

OUTPUT:
middleware/auth.js — tayyor middleware
tests/auth.test.js — asosiy testlar

EXIT CHECK:
[ ] middleware/auth.js mavjud
[ ] /api/test route himoyalangan
[ ] /api/auth/login ochiq
[ ] testlar o'tdi
[ ] progress.md yangilandi
[ ] todo.md yangilandi

NEXT TASK:
1.2.4 — Role-based access control
Input: middleware/auth.js tayyor bo'lishi shart

═══════════════════════════════════════════════
```

**CONTEXT BUDGET** — bu kuchli yangilik: agent task cardni o'qiyotganda qancha joy qolganini biladi va shunga qarab ishlaydi.

---

## 11. Context Budget Qoidalari

Research tasdiqlagan: context window **40–60%** da ushlanishi kerak. Qolgan joy execution uchun.

### Fayl Hajm Chegaralari

| Fayl | Maksimal hajm | Token taxminiy |
|------|--------------|----------------|
| `philosophy.md` | 1 sahifa / ~500 so'z | ~600 token |
| `phases.md` | 1 sahifa / ~300 so'z | ~400 token |
| `subfases_phaseN.md` | 2 sahifa / ~600 so'z | ~800 token |
| Task card | ~30% context window | ~30K token (100K da) |
| `progress.md` | 1 sahifa / ~400 so'z | ~500 token |
| `todo.md` | 20 qator max | ~200 token |

### Planning Depth Limiti

```
Maksimum 2 daraja chuqur plan:
  Faza → Subfaza → Task

Task ichini planlamang — u execution paytida aniqlanadi.
Planning o'zi loyihaning 15–20% vaqtidan oshmasligi kerak.
```

### Amaliy Hisob

```
Ideal sessiya context taqsimoti:
  Task card:       ~30%
  progress.md:     ~10%
  todo.md:          ~5%
  AGENTS.md:        ~5%
  ─────────────────────
  Execution:       ~50% (kod yozish, o'qish, tool calls)

❌ Noto'g'ri: 80%+ → dumb zone → hallucination oshadi
✅ To'g'ri:   40–60% band → optimal
```

---

## 12. Sessiyalar Orasida O'tish Strategiyasi

### /compact ni Qachon Berish

```
✅ /compact — max 50% da (PROAKTIV)
❌ /compact — 80%+ da (KEC QOLDI)

Yangi task boshlanganda: /clear
Context kompressiya: /compact
```

### Sessiya Oqimi

```
Sessiya 1 boshlandi
  → progress.md o'qildi  (qayerdaman?)
  → todo.md o'qildi      (hozir nima?)
  → Ish bajarildi
  
Context 50%+ bo'lsa:
  → HANDOFF.md yaratildi
  → /compact berildi
  → Davom ettildi (yoki sessiya yopildi)

Sessiya yopildi:
  → progress.md yangilandi
  → todo.md yangilandi

━━━━━━━━━━━━━━━━━━━━━━━━━━━

Sessiya 2 boshlandi
  → HANDOFF.md o'qildi   (kelgan joydan)
  → Toza context bilan davom
  → Hech narsa yo'qolmadi
  → Token ham tejaldi
```

### Claude Code buyruqlari

```bash
# Sessiya boshida
claude
> Read _memory/progress.md and _memory/todo.md, then continue

# Context tekshirish
/status

# Proaktiv compaction
/compact

# Yangi task uchun toza sessiya
/clear

# HANDOFF yaratish
"Create HANDOFF.md summarizing current state and next step"
```

---

## 13. Plan Mode & Token Tejash

### Plan Mode

```bash
# Plan Mode yoqish — fayl o'zgartirmasdan analiz
/plan

# Amaliy: code review sessiyasi
"Review our auth system — how token refresh works"
# 38,000 token → 18,000 token (53% tejash)

# Qoida: fayl o'zgartirmaydigan har qanday vazifa uchun Plan Mode
# Bu iste'molni 2 barobarga kamaytiradi
```

### Strukturali Prompt — 30% Token Tejash

```bash
# ❌ Yomon (450 token)
"I'd like you to look at the auth.ts file and find out 
why authentication doesn't work when the token expires 
and the refresh mechanism fails..."

# ✅ Yaxshi (280 token)
"File: auth.ts
Bug: auth failure on token expiry
Action: fix refresh token validation"
```

### Subagentlar bilan Token Tejash

```bash
# "use subagents" iborasi — kuchli trigger
"Use subagents to investigate our auth system — 
how token refresh works and what OAuth utils exist.
Report back with findings only (1-2K token summary)."
```

Subagent o'nlab minglab token sarflashi mumkin, lekin bosh agentga faqat **1,000–2,000 tokenlik xulosa** qaytaradi.

---

## 14. Hooks — Deterministik Avtomatlashtirish

> **Farq:** Ko'rsatmalar maslahat xaracterida, hooklar esa deterministik va har doim ishlaydi.

### Asosiy Hooklar

```json
// .claude/settings.json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "npx eslint --fix $FILE && npx prettier --write $FILE"
      }
    ],
    "PreCompact": [
      {
        "command": "cat .claude/core-instructions.md"
      }
    ],
    "PostTaskComplete": [
      {
        "command": "cat _memory/progress.md | head -20"
      }
    ]
  }
}
```

### PreCompact Hook — Muhim!

```json
"PreCompact": [{
  "command": "cat AGENTS.md"
}]
```

**Nima uchun:** Standart compaction muhim ma'lumotlarni yo'qotishi mumkin. Bu hook AGENTS.md ni compaction paytida saqlab qoladi.

### Claude Code ga Hook Yozdirish

```bash
"Write a PostToolUse hook that runs eslint after every Write or Edit tool call"
"Write a PreCompact hook that re-injects AGENTS.md content"
```

---

## 15. Subagentlar — Parallel Arxitektura

### Git Worktree bilan Parallel Development

```bash
git worktree add ../feature-auth feature-auth
git worktree add ../feature-payment feature-payment

# Terminal 1 — Auth
cd ../feature-auth && claude
"Build the JWT authentication system per task card 1.2.3"

# Terminal 2 — Payment
cd ../feature-payment && claude  
"Build the Stripe integration per task card 2.1.1"

# Parallel, mustaqil contextlar, bir-biriga aralashmaydi
```

### Subagent Trigger

```bash
# Bosh agent — yuqori darajali reja
"Use subagents to:
  1. Investigate how our Redis connection pool is configured
  2. Check what auth utils we have in /src/utils/
  Report back with summary only — don't change any files."

# Har subagent:
# - O'z toza context oynasida ishlaydi
# - Mustaqil vazifa bajaradi
# - Faqat 1-2K token xulosa qaytaradi
```

---

## 16. Tool Search — Token Tejashning Yangi Usuli

5 ta MCP server ulangan holda 58 ta tool ~**55K token** oladi.  
`defer_loading: true` bilan — **85% token kamayish**, barcha tool larga to'liq kirish saqlanadi.

```json
// MCP server konfiguratsiyasi
{
  "mcpServers": {
    "filesystem": {
      "defer_loading": true
    },
    "database": {
      "defer_loading": true
    }
  }
}
```

**Natija:** Opus 4 model MCP evallarida 49%→74%, Opus 4.5 esa 79.5%→88.1% ga yaxshilandi.

---

## 17. Prompt Strukturasi

### API / CLI uchun

```bash
# CLI
webchi build \
  --rules webchi-standards/AGENTS.md \
  --skill webchi-standards/skills/architect.skill.md \
  --brief "Toshkentdagi stomatologiya klinikasi..."

# API
{
  "system": "[AGENTS.md mazmuni] + [skill mazmuni]",
  "messages": [{"role": "user", "content": "[Brief]"}]
}
```

### Design Agent uchun Premium Prompt

```
You are a senior UI/UX designer at a world-class creative agency.
Design a premium, conversion-optimized web agency portfolio website.
Every detail must feel intentional, refined, and production-ready.

━━━ BRAND ━━━
[Brand details]

━━━ VISUAL LANGUAGE ━━━
- Typography hierarchy: clear, intentional
- Spacing: generous whitespace, breathing room
- Animations: subtle, purposeful, max 300ms

━━━ TECHNICAL CONSTRAINTS ━━━
- Framework: Next.js 14 + Tailwind v4
- Performance: Core Web Vitals 90+
- Output: Production-ready component code only

━━━ FORBIDDEN ━━━
- Generic stock imagery
- Cookie-cutter layouts
- Unnecessary animations
```

### Webchi Builder Prompt

```markdown
# WEBCHI — webchi-standards/ Reponi Qur

Sen Webchi agentlik platformasining Template Creator rolisida ishlayapsan.

## Qoidalar (HECH QACHON chetga chiqma)
- TypeScript strict — `any` mutlaqo taqiqlangan
- `style={{}}` — taqiqlangan, faqat Tailwind
- Hardcode matn — taqiqlangan, faqat `t('key')`
- pnpm — npm/yarn taqiqlangan
- default export — faqat `page.tsx` va `layout.tsx`

## Qurilish tartibi (pastdan yuqoriga — MAJBURIY)
1. UI Kit: Button, Card, Input, Badge, Avatar
2. Universal Bloklar: Navbar, Hero, Footer, CTA
3. Industry Bloklar: DoctorCard, MenuSection
4. Soha Templatelar: webchi-medical-tier2

## Har qaror uchun
1 jumla sabab yoz. Noaniq bo'lsa — savol ber, taxmin qilma.

Boshlash signali: webchi-standards/AGENTS.md faylini yoz.
```

---

## 18. Anti-Pattern Jadvali

### Prompt Anti-Patternlari

| ❌ Noto'g'ri | ✅ To'g'ri |
|-------------|-----------|
| "Sen X sifatida gapir" | "Sen X sifatida fikrla va qaror qabul qil" |
| Faqat unvon berish | Konkret bilim, tajriba, uslub berish |
| "Hamma narsaga javob ber" | Vakolat chegarasini aniq belgilash |
| Munosabatsiz agent | Har bir sherigi haqida pozitsiya |
| Statik prompt | Dinamik context injection |
| "O'zbek tilida yoz" | Soha terminologiyasi bilan professional o'zbek |
| "Prefer TypeScript" | "MUST use TypeScript strict mode" |
| "Try to avoid any" | "NEVER use 'any'" |

### Context Anti-Patternlari

| ❌ Noto'g'ri | ✅ To'g'ri |
|-------------|-----------|
| 500 sahifalik hujjat berish | 10 qatorli task card berish |
| /compact ni 80%+ da berish | /compact ni 50% da berish |
| Sessiya boshida progress.md o'qimaslik | Har sessiya boshida O'QI |
| Planning va execution aralashtirib yuborish | Ikki bosqichni qat'iy ajratish |
| Task ichini planlashtirish | Task ichini execution da aniqlash |
| Hujjatni "keyinroq" qoldirish | Hujjat = exit criteria |
| ESLint qoidasini CLAUDE.md ga yozish | ESLint config ga yozish |
| Bir sessiyada katta loyiha tugallash | Atomic tasklarga bo'lish |

### CLAUDE.md Anti-Patternlari

```
❌ Noto'g'ri — LLM ga bering:
  "console.log bo'lmasin"
  "TypeScript ishlatamiz"  
  "Prettier formati"
  "import tartibi"

✅ To'g'ri — Tool ga bering:
  ESLint: "no-console": ["error"]
  tsconfig: "strict": true
  .prettierrc: {...}
  ESLint import plugin
```

---

## 19. Papka Tuzilishi

### Rasmiy Standart (AI Development Framework dan)

```
project/
├── _planning/                    ← Planning bosqichi natijalari
│   ├── philosophy.md             ← Loyiha falsafasi (O'ZGARMAYDI)
│   ├── phases.md                 ← Fazalar skeleti
│   ├── subfases_phase0.md        ← Har faza uchun subfazalar
│   ├── subfases_phase1.md
│   ├── tasks_subfase0_1.md       ← Har subfaza uchun task cardlar
│   └── tasks_subfase1_2.md
│
├── _memory/                      ← Execution xotirasi
│   ├── progress.md               ← Loyihaning yagona xotirasi
│   └── todo.md                   ← Joriy task ro'yxati (20 qator max)
│
├── _docs/                        ← Hujjatlar (har faza exit criteria)
│   ├── phase0_docs.md
│   └── phase1_docs.md
│
├── AGENTS.md                     ← Yagona manba — barcha toollar o'qiydi
├── CLAUDE.md                     ← "./AGENTS.md ga qarang" + qisqa kontekst
│
├── .claude/
│   ├── settings.json             ← Hooks konfiguratsiyasi
│   ├── rules/                    ← Conditional qoidalar
│   │   ├── global.md
│   │   ├── medical.md
│   │   └── typescript.md
│   └── skills/                   ← Lazy loading skills
│       ├── architect.skill.md
│       ├── builder-web.skill.md
│       └── ...
│
├── .cursor/
│   └── rules/
│       ├── global.mdc
│       └── industry/
│
├── .github/
│   └── copilot-instructions.md   ← symlink → AGENTS.md
│
├── tooling/
│   ├── .eslintrc.json            ← Kod qoidalari (tool tomonidan)
│   ├── .prettierrc               ← Formatlash
│   └── tsconfig.base.json        ← TypeScript
│
└── src/                          ← Haqiqiy kod
```

### Golden Template Tuzilishi (Webchi)

```
golden-template/
├── app/
│   └── [locale]/
│       ├── layout.tsx
│       └── page.tsx
├── messages/
│   ├── uz/common.json
│   ├── ru/common.json
│   └── en/common.json
├── config/
│   ├── site.config.ts
│   └── i18n.config.ts
├── middleware.ts
├── lib/
│   ├── metadata.ts              ← hreflang, QOTGAN
│   └── analytics.ts             ← GA4, QOTGAN
├── components/
│   └── ui/                      ← UI Kit
│       ├── Button/
│       ├── Card/
│       ├── Input/
│       ├── Badge/
│       ├── Avatar/
│       └── Separator/
├── package.json                 ← pnpm
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── .env.example
└── AGENTS.md                    ← Loyiha darajasidagi qoidalar
```

---

## 20. Hujjatlashtirish Strategiyasi

### Ikki Xil Xatolik

| | Noto'g'ri yondashuv | To'g'ri yondashuv |
|---|---|---|
| Vaqt | Implementation tugagach | Kod bilan parallel |
| Mas'uliyat | "Keyinroq kimdir yozadi" | Docs agenti — exit criteria |
| Holat | O'lik hujjat (kod o'zgargan) | Tirik hujjat (progress.md) |
| Gate | Ixtiyoriy | Majburiy — faza ochilmaydi |

### Har Faza Uchun Docs Minimumi

```markdown
# Phase N — Docs

## Faza maqsadi va bajarilganlari
[Nima qilindi, nima muvaffaqiyatli bo'ldi]

## Muhim texnik qarorlar
| Qaror | Sabab | Muqobil |
|-------|-------|---------|
| argon2 → bcrypt | Security best practice | Performance slightly worse |

## Qabul qilingan standartlar
[Konvensiyalar, pattern lar]

## Keyingi faza uchun kontekst
[Nima bilish kerak, nima o'zgardi]

## O'zgartirilgan fayllar
- src/middleware/auth.js
- src/config/auth.ts
- tests/auth.test.js
```

---

## 21. Webchi Loyihasidagi Qo'llanish

### Hozirgi Holat (Notion dan)

```
Faza: Phase 0 — Meta-Planning
Status: 🟡 IN PROGRESS
Oxirgi yangilanish: 2026-03-18

Bajarilganlar:
  [x] philosophy.md yozildi
  [x] phases.md yozildi (6 faza aniqlandi)
  [x] Barcha 6 faza subfaza sahifalari yaratildi
  [x] progress.md yaratildi
  [x] todo.md yaratildi
  
Qolganlar:
  [ ] Phase 1-5 har subfaza uchun task cardlar
  [ ] Phase 0 Review gate
  [ ] Phase 1 boshlashga ruxsat
```

### Muhim Qarorlar

| Sana | Qaror |
|------|-------|
| 2026-03-18 | 6 ta asosiy faza aniqlandi |
| 2026-03-18 | Multi-agent framework Notion da boshqariladi |
| 2026-03-18 | Birinchi bloker: webchi.uz launch qilinmagan |

### Webchi Agent Pipeline

```
[Architect Agent — Opus 4]
  Brief tahlil → 8 qatlam JSON xarita

[Builder Agent — Sonnet 4.5]
  JSON xarita → Kod yozish

[QA Agent]
  Kod → Tekshirish

[Graduate Agent]
  QA tasdiqlandi → Deploy + Hujjat
```

### Industry Skills

**Medical Rules:**
```markdown
- Trust signals majburiy (litsenziya, sertifikat bloki)
- Shifokor profili — faqat DoctorCard komponenti
- Booking — faqat standart BookingWidget
- GDPR — bemor ma'lumotlari himoyasi majburiy
- MedicalBusiness + Physician SEO schema majburiy
```

**Education Rules:**
```markdown
- Kurs kartochka — faqat CourseCard komponenti
- Ariza forma — faqat EnrollmentForm komponenti
- EducationalOrganization + Course SEO schema
```

**Restaurant Rules:**
```markdown
- Menyu — faqat MenuSection komponenti
- Bron — faqat TableBooking komponenti
- Restaurant + Menu SEO schema majburiy
```

---

## 22. Tezkor Nazorat Ro'yxati

### Har Sessiya Boshlash Protokoli

```
□ _memory/progress.md o'qi
□ _memory/todo.md o'qi
□ Joriy task qaysi? Nima qolgan?
□ Context qancha band? (maqsad: <50%)
```

### Har Sessiya Tugatish Protokoli

```
□ progress.md yangilandi
□ todo.md yangilandi (keyingi sessiya uchun)
□ Muhim qaror bo'ldimi? → progress.md > Muhim qarorlar
□ Faza tugadimi? → Review gate → Docs agent
```

### Context 50%+ bo'lsa

```
□ HANDOFF.md yarat
□ /compact ber
□ Yoki yangi sessiyada: HANDOFF.md o'qi → davom et
```

### AGENTS.md Sifat Tekshiruvi

```
□ Har qoida uchun: "Buni olib tashlasamda Claude xato qiladimi?"
□ ESLint/Prettier bilan tekshirilishi mumkin narsalar — tool ga ber
□ 50–100 satr orasidami?
□ MUST/NEVER til ishlatilganmi?
□ Session Memory Protocol bo'limi bormi?
```

### Agent Prompt Sifat Tekshiruvi

```
□ Identity: Qanday fikrlanishini bildizadi? (nafaqat unvon)
□ Domain: Konkret stack, versiyalar, joriy holat bormi?
□ Authority: ✅ 💬 ❌ to'liq belgilangan?
□ Relationships: Har hamkor haqida pozitsiya bormi?
□ Dinamik context injection bormi?
□ 2–5 gapli javob yetarliligini biladi?
```

### Task Card Tekshiruvi

```
□ CONTEXT: 2 qator max
□ DONE SO FAR: progress.md ga reference bor
□ MY JOB: Aniq, o'lchanuvchi
□ CONTEXT BUDGET: ~30% ko'rsatilgan
□ OUTPUT: Konkret fayl nomlari
□ EXIT CHECK: Checkbox ro'yxat
□ NEXT TASK: Aniq keyingi qadam
```

---

## Yakuniy Xulosa

> **Butun sistemaning kuchi bir gapda:** har agent o'zi uchun yozilgan bitta varaq qog'oz ko'radi, xolos.

**Agent qanchalik kam kontekst olsa — shunchalik aniq ishlaydi.**  
Bu paradoks emas, bu haqiqat. 500 sahifalik loyiha o'rniga 10 qatorli task card bering — sifat oshadi.

Bu metodologiya AI agentlarning kamchiligini bartaraf etmaydi — u ular atrofida tizim quradi.  
Agent hali ham unutadi. Lekin tizim unga eslatadi.  
Agent hali ham adashishi mumkin. Lekin tizim uni yo'lga soladi.

---

```
AI Agent & Prompt Engineering — To'liq Qo'llanma
v1.0 · 2026-03-21
Golibjon Xasanov · Webchi · webchi.uz

Manbalar:
  - Internet research: claudelog.com, docs.claude.com, r/ClaudeAI
  - Notion workspace: WebDev Agency OS, AI Corp Orchestrator System
  - AI Development Framework v2 (docx)
  - Multi-Agent Planning Pipeline (svg)
```
