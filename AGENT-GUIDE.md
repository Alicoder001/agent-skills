# Agent Task Management Guide

## Maqsad

Bu hujjat tasklarni agentlarga to'g'ri taqsimlash, boshqarish va bajarish metodologiyasini tushuntiradi.

---

## 1. Tasklarni Qabul Qilish

### 1.1 — Tasklarni tahlil qil
- User tasklarni yuborganida, avval **to'liq tushun**
- Agar noanik bo'lsa — **so'ra**, taxmin qilma
- Tushungan tasklarni guruhla

### 1.2 — Tasklarni faylga saqla
- Barcha tasklarni `tasks.md` faylga yoz
- Har bir task uchun:
  - **Tavsif** — nima qilish kerak
  - **Muammo** — agar bug bo'lsa
  - **Acceptance** — qachon tugagan deb hisoblanadi

---

## 2. Agentlarga Ajratish

### 2.1 — Agent nomlash
- **Oddiy harflar:** Agent A, Agent B, Agent C, ...
- **Kod nomi:** `agent-a`, `agent-b`, `agent-c`, ...

### 2.2 — Agentlarni ajratish prinsipi

#### ✅ TO'G'RI:
```
AGENT A — Alias (alohida katta ish)
AGENT B — Qurilmalar + Live davomat
AGENT C — Hisobot + Audit + Toast + Error
AGENT D — Auth + Password + Rollar
AGENT E — Settings (Departments + Cutoff)
```

#### ❌ NOTO'G'RI:
```
AGENT A — Alias + Live davomat (aralash)
AGENT B — Hisobot + Password (aralash)
```

### 2.3 — Ajratish qoidalari

1. **Katta hajmli tasklarni ALOHIDA agentga ber**
   - Masalan: "barcha importlarni aliasga o'tkazish" — butun loyihani qamrab oladi
   - Boshqa tasklar bilan aralashtirma

2. **Bir xil sahifa yoki modul bo'lsa — bir agentga ber**
   - Masalan: Live davomat — pagination + filter + "hozir ichida" = barchasi B agentda

3. **Bir xil texnik soha bo'lsa — bir agentga ber**
   - Masalan: Hisobot + Export + Sanalar + Toast + Error = barchasi C agentda

4. **Agentlar bir-biriga bog'liq bo'lmasligi kerak**
   - Parallel ishlay olishi shart
   - Hech bir agent boshqasining fayllariga tegmasin

---

## 3. Agent Izolyatsiyasi

### 3.1 — Qattiq qoida

```
⚠️ MUHIM: Agentlar Izolyatsiyasi

- Har bir agent FAQAT o'z vazifasiga mas'ul
- Hech bir agent boshqa agentning fayllariga tegmasin
- Hech bir agent boshqa agentning taskini qilmasin
- Agar bir fayl bir nechta agentga kerak bo'lsa — agentlar parallel ishlasin, 
  lekin bir-birining o'zgarishlariga tegmasin
- Conflict bo'lsa — userga xabar berilsin
```

### 3.2 — Nimaga kerak?
- Git conflict oldini oladi
- Tasklar aralashib ketmaydi
- Har bir agentning mas'uliyati aniq
- Debug qilish oson

---

## 4. Task Prioritetlash

### 4.1 — Priority darajalari

| Priority | Tavsif | Misol |
|----------|--------|-------|
| **HIGH** | Bug fix, core feature | Cutoff vaqt, Departments tahrirlash |
| **MEDIUM** | UX improvements, feature | Hisobot, Live davomat filter |
| **LOW** | Cleanup, refactor | Aliasga o'tkazish |

### 4.2 — Kim birinchi?
1. HIGH priority agentlar (parallel ishlay oladi)
2. MEDIUM priority agentlar
3. LOW priority agentlar

---

## 5. Todo List Boshqaruvi

### 5.1 — Har bir task uchun todo yarat
```json
{
  "id": "1",
  "content": "Task A.1 — Tavsif",
  "status": "pending"
}
```

### 5.2 — Statuslar
- `pending` — boshlanmagan
- `in_progress` — ish boshlangan
- `completed` — tugallangan + typecheck + lint o'tgan

### 5.3 — Har bir taskdan keyin
```bash
pnpm typecheck
pnpm lint
pnpm test (agar mavjud bo'lsa)
```

---

## 6. Hujjat Strukturasi

### 6.1 — `tasks.md` format

```markdown
# Employee FaceID — Task List (Agentlarga Ajratilgan)

---

## 🤖 AGENT A — ALIAS (Alohida)
**Kod nomi:** `agent-a`
**Mas'uliyat:** BUTUN loyihani aliasga o'tkazish

### Task A.1 — Tavsif
- **Tavsif:** ...
- **Fayllar:** ...
- **Acceptance:** ...

---

## ⚠️ MUHIM: Agentlar Izolyatsiyasi
...

---

## 📋 UMUMIY MA'LUMOTLAR

### Jami Agentlar: X
1. **AGENT A** — Y task (...)
2. **AGENT B** — Y task (...)

### Jami Tasklar: Z

### Priority (Tavsiya)
1. **HIGH:** ...
2. **MEDIUM:** ...
3. **LOW:** ...

### Dependency
- ...

### Tekshirish (Har bir agentdan keyin)
```bash
pnpm typecheck
pnpm lint
pnpm test
```
```

---

## 7. Agent Ishga Tushirish

### 7.1 — Agentni chaqirish
```
Agent A ni ishga tushir:
- Task A.1 ni bajar
- Boshqa agentlarning fayllariga tegma
- Tugagandan keyin: pnpm typecheck && pnpm lint
```

### 7.2 — Parallel ishga tushirish
Agar agentlar bir-biriga bog'liq bo'lmasa:
```
Agent B, C, D ni parallel ishga tushir:
- Har biri o'z tasklarini bajaradi
- Bir-birining fayllariga tegmaydi
```

---

## 8. Xatoliklarni Boshqarish

### 8.1 — Agar conflict bo'lsa
1. Agentni to'xtat
2. Userga xabar ber
3. Qaysi fayllar conflict ekanligini ko'rsat
4. Userdan ruxsat so'ra

### 8.2 — Agar task tushunarsiz bo'lsa
1. Agentni to'xtat
2. Userdan so'ra
3. Taxmin qilib davom etma

### 8.3 — Agar typecheck/lint xato bersa
1. Xatolarni tuzat
2. Qayta tekshir
3. `completed` deb belgilama agar xato bo'lsa

---

## 9. Checklist

Har safar yangi task kelganda:

- [ ] Tasklarni tushundim
- [ ] Noaniq bo'lsa — so'radim
- [ ] `tasks.md` ga yozdim
- [ ] Agentlarga ajratdim (izolyatsiya bilan)
- [ ] Todo listga qo'shdim
- [ ] Priority belgiladim
- [ ] Agentlarni ishga tushirdim
- [ ] Har bir agentdan keyin typecheck + lint qildim

---

## 10. Misol: Real Workflow

### Input:
```
User: 14 ta task berdi (turli sahifalar, turli muammolar)
```

### Workflow:
1. Tasklarni tahlil qil (2 daqiqa)
2. `tasks.md` ga yoz (5 daqiqa)
3. Agentlarga ajrat (3 daqiqa)
   - Agent A: Alias (alohida)
   - Agent B: Live davomat (4 task)
   - Agent C: Hisobot (6 task)
   - Agent D: Auth (3 task)
   - Agent E: Settings (2 task)
4. Todo listga qo'sh (2 daqiqa)
5. Priority belgila (1 daqiqa)
6. Agentlarni ishga tushir (parallel)

### Output:
- 16 ta task
- 5 ta agent
- Har biri o'z doirasida
- Parallel ishlay oladi
- Conflict yo'q

---

## 11. Xulosa

**Asosiy prinsiplar:**
1. **Tushun** — avval tahlil qil, keyin harakat qil
2. **So'ra** — noaniq bo'lsa taxmin qilma
3. **Ajrat** — har bir taskni aniq agentga ber
4. **Izolyatsiya qil** — agentlar bir-biriga tegmasin
5. **Tekshir** — typecheck + lint har safar
6. **Hujjatlashtir** — barcha tasklar `tasks.md` da bo'lsin
