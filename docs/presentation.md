# Wandr — Presentation Deck

## Slide 1: Title

**WANDR**
*Your AI Travel Co-Pilot*

Built on Aurora PostgreSQL + Vercel
H0: Hack the Zero Stack · 2026

Team: [Your Name]

---

## Slide 2: The Problem

### The average traveler spends **7 hours** planning a single trip

- 📑 **12+ browser tabs** open simultaneously (flights, hotels, activities, visa requirements, currency, weather...)
- 💬 **Group chaos**: Trip decisions scattered across WhatsApp, Google Docs, email threads
- 💸 **Price opacity**: No single tool tracks prices and alerts you to deals
- 🧠 **Amnesia**: Every new trip starts from zero — nothing remembers you prefer boutique hotels and street food

> *"I just want to tell someone what kind of trip I want and have them plan it for me."*
> — Every traveler, ever

---

## Slide 3: The Solution

### Wandr: From description to complete itinerary in **3 seconds**

**Three sentences describe your dream trip →**
- AI generates a complete day-by-day itinerary
- Semantic search finds the most relevant destinations from our 50K+ knowledge base  
- Your travel crew collaborates in real-time — one source of truth

**Three core innovations:**
1. 🧠 **pg_vector semantic search** — AI embeddings in Aurora PostgreSQL find destinations matching your *vibe*, not just keywords
2. 👥 **Collaborative planning rooms** — Real-time multi-user itinerary editing
3. 🔔 **Smart price alerts** — Aurora triggers + Lambda watch prices 24/7

---

## Slide 4: Live Demo

### Demo Flow (2 minutes)

1. **Landing page** — Enter trip description: *"10-day Japan trip for 2 people who love food, temples, and hidden gems"*
2. **AI generation** — Watch itinerary appear with day-by-day plan, map visualization, cost estimate
3. **Collaboration** — Invite a travel companion; show real-time co-editing
4. **Price alert** — Set a flight price threshold; show alert configuration
5. **Past trips** — Show how AI learned this user prefers street food over restaurants

### Key Screenshots
- Landing page with animated destination cards
- AI generation streaming with typing effect
- Interactive map view with all trip pins
- Collaboration panel with multiple cursors
- Dashboard with trip history + travel stats

---

## Slide 5: Architecture & Technical Depth

### Aurora PostgreSQL Serverless v2 — Why not a simple database?

| Feature Used | What It Enables |
|---|---|
| **pg_vector** (HNSW index) | Semantic destination search: find "hidden gems" in 50K destinations in <50ms |
| **Row-Level Security** | Per-user trip isolation — no user can ever see another's trips, enforced at DB layer |
| **Materialized Views** | Daily analytics refresh without impacting live query performance |
| **Full-text search** (tsvector) | Keyword search over destination names + descriptions |
| **ACID Transactions** | Safe collaborative editing — atomic writes for multi-user itinerary changes |
| **Serverless Scaling** | 0.5 → 64 ACUs automatically; Aurora pauses at zero traffic (dev cost = ~$0) |

### CloudFormation Infrastructure as Code
- Complete VPC with public/private subnets
- Aurora in private subnet (zero public exposure)
- Lambda in VPC for price alerts
- EventBridge scheduling
- CloudWatch alarms for CPU and latency
- Secrets Manager for all credentials

---

## Slide 6: Innovation Highlights

### What makes this genuinely different

**Innovation 1: AI Embeddings in Aurora PostgreSQL**
Most teams store AI embeddings in Pinecone or a separate vector DB. Wandr uses Aurora's pg_vector extension — the embedding lives *next to* the relational data it describes. One database, one connection pool, zero infrastructure overhead.

**Innovation 2: Travel Memory Profile**
Every trip you complete updates your embedding-based travel profile. Future recommendations use cosine similarity against your past trip embeddings to find destinations that match *how you travel*, not just what you search.

**Innovation 3: Collaborative + Conflict-Free**
Aurora advisory locks ensure two users editing the same itinerary day can't overwrite each other. The UI shows real-time presence indicators powered by Next.js Server-Sent Events.

**Innovation 4: Cost-Aware Architecture**
Aurora Serverless auto-pauses during off-hours. All pricing tiers have a clear monetization story. This isn't a demo — it's a product you could launch Monday.

---

## Slide 7: Impact & Future Vision

### Today's Wandr
- ✅ AI itinerary generation with semantic destination search
- ✅ Real-time collaborative planning for up to 20 travelers
- ✅ Smart price alerts with Lambda + EventBridge
- ✅ Stripe subscription billing (Free / Explorer $9 / Nomad $19)

### Scalability Story
- Aurora Serverless v2 scales to 64 ACUs → handles millions of simultaneous trips
- pg_vector HNSW scales to tens of millions of destination embeddings
- Vercel Edge network: <100ms response time globally

### Business Model
- **Year 1**: 50,000 MAU → ~5% conversion to paid → $54K MRR
- **Year 2**: Travel affiliate partnerships (hotels, flights, tours) → additional revenue stream
- **Year 3**: White-label API for travel agencies

### Roadmap
- Mobile app (React Native)
- Direct hotel/flight booking integration
- AI travel companion chat (remember context across trips)
- Social features (share itineraries, follow travel creators)

---

## Slide 8: Thank You

### Wandr — Stop planning. Start exploring.

**Built with:**
- Amazon Aurora PostgreSQL Serverless v2 (pg_vector, RLS, materialized views)
- Vercel + Next.js 14 App Router
- OpenAI GPT-4o + text-embedding-3-small
- AWS CloudFormation (full IaC)
- Stripe subscription billing

**Try it:** wandr.vercel.app  
**Code:** github.com/yourusername/wandr  
**#H0Hackathon**

*Questions?*
