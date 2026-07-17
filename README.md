# 🏆 Wandr — Your AI-Powered Travel Co-Pilot

> **Track**: Monetizable B2C App | **Database**: Amazon Aurora PostgreSQL Serverless v2 + pg_vector  
> **Hackathon**: H0: Hack the Zero Stack with Vercel v0 and AWS Databases

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://wandr.vercel.app)
[![AWS Aurora PostgreSQL](https://img.shields.io/badge/Database-Aurora%20PostgreSQL-orange?logo=amazonaws)](https://aws.amazon.com/rds/aurora/)
[![Next.js 14](https://img.shields.io/badge/Frontend-Next.js%2014-black?logo=nextdotjs)](https://nextjs.org)

---

## 🎯 Problem

Trip planning is **broken and fragmented**:
- Travelers bounce between 12+ tabs (flights, hotels, activities, weather, visa requirements, currency)
- Group trip coordination is a nightmare — scattered over WhatsApp and Google Docs
- Price tracking requires manual effort or expensive subscriptions
- No single tool remembers your travel style and personalizes future trips

**The result**: The average traveler spends **7 hours planning** a single trip — and still arrives unprepared.

---

## 💡 Solution

Wandr is a **full-stack AI travel co-pilot** built on the Vercel + AWS Aurora PostgreSQL stack:

1. **AI Itinerary Generation** — Describe your dream trip; AI generates a complete day-by-day plan using pg_vector semantic search to find the most relevant destinations and activities from a rich knowledge base
2. **Collaborative Trip Rooms** — Invite travel companions; everyone edits the same live itinerary with real-time conflict resolution
3. **Smart Price Tracking** — Set budget alerts; Aurora PostgreSQL triggers fire when prices cross thresholds
4. **Travel Memory** — Every past trip feeds a personalized preference profile; AI learns your style over time
5. **Monetization Ready** — Stripe subscription tiers (Free / Explorer / Nomad)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Vercel Edge                         │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Next.js App │  │  API Routes  │  │  Edge Config  │  │
│  │  (App Router)│  │  /api/trips  │  │  (Feature     │  │
│  │              │  │  /api/ai-plan│  │   Flags)      │  │
│  └──────────────┘  └──────────────┘  └───────────────┘  │
└────────────────────────────┬────────────────────────────┘
                             │ IAM / OIDC (credential-free)
┌────────────────────────────▼────────────────────────────┐
│                        AWS                               │
│  ┌─────────────────────────────────────────────────┐    │
│  │         Aurora PostgreSQL Serverless v2          │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │    │
│  │  │  users   │  │  trips   │  │  destinations │  │    │
│  │  │ profiles │  │itinerary │  │  + pg_vector  │  │    │
│  │  │  prefs   │  │  items   │  │  embeddings   │  │    │
│  │  └──────────┘  └──────────┘  └──────────────┘  │    │
│  └─────────────────────────────────────────────────┘    │
│  ┌─────────────┐  ┌──────────────────────────────┐      │
│  │  Lambda     │  │  Secrets Manager             │      │
│  │  (Price     │  │  (DB credentials, API keys)  │      │
│  │   Alerts)   │  └──────────────────────────────┘      │
│  └─────────────┘                                        │
└─────────────────────────────────────────────────────────┘
```

See [docs/architecture.md](docs/architecture.md) for the full Mermaid diagram.

---

## 🚀 Features

- **🤖 AI Trip Planner** — Natural language to complete itinerary in <3 seconds using semantic destination search
- **👥 Collaborative Rooms** — Real-time multi-user itinerary editing with Aurora's advisory locks
- **💰 Price Alerts** — Aurora PostgreSQL triggers + Lambda notify users when deals drop
- **🗺️ Visual Map** — Interactive map shows your entire trip at a glance
- **📊 Budget Tracker** — Real-time expense tracking against your trip budget
- **🌍 Destination Discovery** — pg_vector cosine similarity finds hidden gems matching your style
- **✈️ Past Trips Archive** — Every trip stored; AI learns your preferences over time
- **💳 Stripe Subscriptions** — Free (3 trips/month), Explorer ($9/mo), Nomad ($19/mo unlimited)
- **📱 Fully Responsive** — Mobile-first design; plan trips from your phone

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js 14 App Router | File-based routing, Server Components, streaming UI |
| Styling | Tailwind CSS + shadcn/ui | Production-grade components instantly |
| Animations | Framer Motion | Polished transitions that impress judges |
| Database | Aurora PostgreSQL Serverless v2 | Complex relational queries, pg_vector AI search, ACID transactions |
| AI Embeddings | OpenAI text-embedding-3-small | Semantic destination matching |
| AI Generation | OpenAI GPT-4o | Natural language itinerary generation |
| Maps | MapLibre GL + OpenStreetMap | Open-source, free, beautiful |
| Payments | Stripe | Production-ready subscription billing |
| Auth | NextAuth.js + Google OAuth | Frictionless sign-in |
| IaC | AWS CloudFormation | Production infrastructure as code |
| Deployment | Vercel | Edge deployment in 45 countries |

---

## 📸 Screenshots / Demo

> 🎬 Demo Video: [YouTube Link](https://youtube.com/wandr-demo)  
> 🌐 Live App: [wandr.vercel.app](https://wandr.vercel.app)

---

## 🏃 Getting Started

### Prerequisites
- Node.js 20+
- AWS account with Aurora PostgreSQL Serverless v2 cluster
- OpenAI API key
- Stripe account

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/wandr
cd wandr
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
# Fill in your credentials (see .env.example for all required variables)
```

### 3. Set Up Database
```bash
# Run migrations
npm run db:migrate

# Seed destination data with embeddings
npm run db:seed
```

### 4. Run Locally
```bash
npm run dev
# Open http://localhost:3000
```

### 5. Deploy to Vercel
```bash
npx vercel --prod
# Set environment variables in Vercel dashboard
```

### 6. Deploy AWS Infrastructure
```bash
aws cloudformation deploy \
  --template-file infra/cloudformation/main.yml \
  --stack-name wandr-prod \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides Environment=prod
```

---

## 👥 Team

| Name | Role |
|---|---|
| Your Name | Full-Stack Engineer |

---

## 📄 License

MIT License — see [LICENSE](LICENSE)

---

## 🏆 Hackathon Submission Notes

- **AWS Database Used**: Amazon Aurora PostgreSQL Serverless v2 with pg_vector extension
- **Advanced Features**: 
  - `pg_vector` for AI embedding similarity search on 10,000+ destinations
  - Row-level security for multi-user trip isolation
  - Materialized views for trip analytics
  - Aurora Serverless auto-pause for cost optimization
- **Vercel Features Used**: App Router, Server Components, Edge Config, Environment Variables
- **Architecture Diagram**: See [docs/architecture.md](docs/architecture.md)
