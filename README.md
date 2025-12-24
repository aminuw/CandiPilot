# CandiPilot 🚀

SaaS B2C de suivi de candidatures de stages pour étudiants français.

## Stack

- **Next.js 15** (App Router)
- **Supabase** (Auth + Postgres + RLS)
- **shadcn/ui** + Tailwind CSS
- **Stripe** (Paiements)
- **Google Gemini** (IA)

## Fonctionnalités

- ✅ Kanban 6 colonnes avec drag & drop
- ✅ Auto-fill depuis URL d'offres
- ✅ Relances IA personnalisées
- ✅ Freemium (20 candidatures gratuites)
- ✅ Mobile responsive

## Installation

### 1. Cloner et installer

```bash
git clone <votre-repo>
cd CandiPilot
npm install
```

### 2. Configurer Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Aller dans **SQL Editor** et exécuter le contenu de `supabase/schema.sql`
3. Copier les clés depuis **Settings > API**

### 3. Configurer les variables d'environnement

Renommer `env.example.txt` en `.env.local` et remplir :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GEMINI_API_KEY=AIza...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRICE_ID=price_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Configurer Stripe (optionnel)

1. Créer un produit "CandiPilot Pro" à 5.99€/mois
2. Copier le Price ID
3. Configurer le webhook vers `/api/stripe/webhook`

### 5. Lancer en développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## Déploiement Vercel

### Méthode 1 : CLI

```bash
npm install -g vercel
vercel
```

### Méthode 2 : GitHub

1. Push votre code sur GitHub
2. Connecter le repo sur [vercel.com](https://vercel.com)
3. Ajouter les variables d'environnement
4. Déployer

### Variables à configurer sur Vercel

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PRICE_ID`
- `NEXT_PUBLIC_APP_URL` (votre domaine Vercel)

## Structure

```
src/
├── app/
│   ├── page.tsx              # Landing + Auth
│   ├── dashboard/page.tsx    # Kanban + Stats
│   ├── new/page.tsx          # Nouvelle candidature
│   ├── app/[id]/page.tsx     # Détail candidature
│   ├── billing/page.tsx      # Stripe checkout
│   └── api/
│       ├── applications/count/
│       ├── fetch-metadata/
│       ├── ai/followup/
│       └── stripe/checkout|webhook/
├── components/
│   ├── ui/                   # shadcn components
│   ├── auth-form.tsx
│   ├── kanban-board.tsx
│   ├── application-*.tsx
│   └── ...
└── lib/
    ├── supabase/             # Clients Supabase
    ├── constants.ts
    ├── types.ts
    └── utils.ts
```

## Limites Freemium

- **Free** : 20 candidatures
- **Pro** : Illimité (5.99€/mois)

Modifier dans `src/lib/constants.ts`.

## Licence

MIT © 2024
