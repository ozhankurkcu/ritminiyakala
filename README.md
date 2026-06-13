# ritminiyakala.com

> Global Spor Aktivite Keşif & Eşleştirme Platformu  
> Dorlion Ltd. — MVP v1

---

## Monorepo Yapısı

```
ritminiyakala/
├── apps/
│   ├── web/          # Next.js 14 — Web App (MVP)
│   └── mobile/       # Flutter — iOS & Android (post-MVP)
├── firebase/
│   ├── firestore.rules
│   ├── storage.rules
│   └── firestore.indexes.json
├── .github/
│   └── workflows/    # CI/CD (GitHub Actions)
├── firebase.json
└── README.md
```

## Kurulum

### Web App

```bash
cd apps/web
npm install
cp .env.example .env.local  # Firebase keys ekle
npm run dev
```

Uygulama → http://localhost:3000

### Firebase Emulator (local test)

```bash
npm install -g firebase-tools
firebase emulators:start
```

## Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| Web Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Mobile (post-MVP) | Flutter |
| Database | Firebase Firestore |
| Auth | Firebase Auth |
| Storage | Firebase Storage |
| i18n | next-intl (TR + EN) |
| Hosting | Firebase Hosting / Vercel |

## Marka

- Primary: `#631C99` (Mor)
- Secondary: `#FF7E00` (Turuncu)
- Accent: `#60E1EB` (Turkuaz)
- Text: `#696969` (Füme)

---

Dorlion Ltd. © 2026
