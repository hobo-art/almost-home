# Almost Home

An interactive multiverse narrative game. You died. The future brought you back. Now you're searching for home — but every version is one letter off.

Navigate with a subscription from the future: finite credits, hidden costs, and the dread of spending too much.

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Accounts: [Anthropic](https://console.anthropic.com/), [Stripe](https://dashboard.stripe.com/), [Resend](https://resend.com/) (for magic link emails)

### Setup

```bash
# Install dependencies
npm install

# Copy env template and fill in your keys
cp .env.example .env

# Set up database
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Run dev server
npm run dev
```

### Stripe Webhook (local dev)

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET` in `.env`.

## Architecture

- **Next.js 14** (App Router) — full-stack TypeScript
- **PostgreSQL** via Prisma — game state, credits, sessions
- **Claude API** — hybrid narrative generation (pre-authored backbone + LLM deviations)
- **Stripe** — credit pack purchases (freemium model)
- **NextAuth.js** — email magic link authentication
- **Framer Motion** — atmospheric UI transitions

## How It Works

**Story Engine**: Pre-authored backbone nodes form the canonical story path. At any decision point, players can choose pre-written options (cheaper) or type custom actions that Claude generates responses for (costs more, scales with deviation from backbone).

**Credit System**: 100 free credits on first visit. Small nudges cost 1-5 credits. Big changes cost 50-300. Some choices have hidden costs — the actual price is revealed after you choose.

**Anonymous-First**: Players start immediately with no signup. Login (email magic link) is prompted at natural narrative beats: running out of credits, buying credits, or finishing the prologue.

## Deploy to Vercel

1. Push to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add environment variables
4. Set up PostgreSQL (Neon or Supabase)
5. Configure Stripe webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
6. Run `npx prisma migrate deploy` against production database
