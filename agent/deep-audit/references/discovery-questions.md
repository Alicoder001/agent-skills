# Discovery Questions

Loyiha mohiyati yoki audit chegarasi noaniq bo'lsa, shu savollarni bering. Har safar bitta savol bering.

## 0. Tilni Tasdiqlash

Savol:
`Audit davomida O'zbekcha davom etamizmi?`

Variantlar:
1. `Ha, O'zbekcha` (Tavsiya etiladi)
2. `Yo'q, English`

## 1. Audit Ustuvorligi

Savol:
`Bu auditda birinchi ustuvor yo'nalish qaysi bo'lsin?`

Variantlar:
1. `Ishonchlilik va to'g'rilik` (Tavsiya etiladi): Avval production xatolarini kamaytirish.
2. `Yetkazib berish tezligi`: Tez soddalashtirish va bloklarni ochish.
3. `Maintainability`: Arxitektura va uzoq muddatli refaktor qiymatiga urg'u.

## 2. Scope Strategiyasi

Savol:
`To'liq qamrovni olamizmi yoki avval kritik yo'llarga fokus qilamizmi?`

Variantlar:
1. `Avval kritik yo'llar` (Tavsiya etiladi): Eng xavfli modullardan boshlab bosqichma-bosqich kengaytirish.
2. `Avval to'liq qamrov`: Refaktordan oldin barcha sectionlarni map qilish va audit qilish.
3. `Feature-first`: Bitta biznes feature'ni end-to-end chuqur kuzatish.

## 3. O'zgarish Xavfi Darajasi

Savol:
`Bu run uchun qaysi xavf darajasi qabul qilinadi?`

Variantlar:
1. `Past xavf` (Tavsiya etiladi): Kichik va qaytariladigan commitlar, qattiq verification gate.
2. `Balansli`: O'rta darajadagi refaktor va kuchli regression tekshiruvlari.
3. `Aggressive`: Katta strukturaviy o'zgarishlar, bosqichli rollback rejasi bilan.

## 4. Verification Qattiqligi

Savol:
`Bu run uchun quality gate qanchalik qattiq bo'lsin?`

Variantlar:
1. `Qattiq` (Tavsiya etiladi): `typecheck/build/lint` yiqilsa jarayon to'xtaydi.
2. `Exception bilan qattiq`: Faqat aniq exception log bilan davom etish.
3. `Advisory`: Ogohlantirish bilan davom etish, hard stop yo'q.

## 5. Log Formati

Tanlangan javoblarni har doim `clarifications.md` ga yozing:

```markdown
# Aniqlashtirishlar

- S1 Ustuvorlik: <tanlangan variant>
- S2 Scope: <tanlangan variant>
- S3 Xavf darajasi: <tanlangan variant>
- S4 Verification: <tanlangan variant>
- Izoh:
```
