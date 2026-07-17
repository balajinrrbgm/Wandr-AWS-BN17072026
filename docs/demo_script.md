# Wandr — Demo Script

**Total demo time**: 2:45 minutes (safe for 3-minute limit)

---

## Pre-Demo Checklist
- [ ] Wandr tab open at `wandr.vercel.app`
- [ ] Logged in as demo user (with 3 past trips already in the account)
- [ ] Second browser window open (for collaboration demo)
- [ ] Second user invite link pre-generated
- [ ] Price alert for "Tokyo flights" pre-set at $800
- [ ] AWS Console tab open showing Aurora cluster (for screenshot proof)
- [ ] Network throttle OFF (fast connection)
- [ ] Text for trip description copied to clipboard:
  *"10-day Japan trip in October for 2 people who love street food, ancient temples, and off-the-beaten-path experiences. Budget around $4,000 total."*

---

## Demo Flow

### [0:00–0:20] Hook — The Problem

**Action**: Open the landing page  
**Say**: *"The average traveler spends 7 hours planning a single trip. They're bouncing between 12 browser tabs, spamming a WhatsApp group, and copy-pasting into a Google Doc. There had to be a better way."*

**Show**: Animated destination cards and the hero headline  
**Say**: *"Wandr is an AI travel co-pilot built on Aurora PostgreSQL and Vercel. You describe your trip. We plan it. Let me show you."*

---

### [0:20–1:00] AI Itinerary Generation

**Action**: Click "Plan Your First Trip Free" → land on plan page  
**Say**: *"I want a 10-day Japan trip — type that in plain English."*

**Action**: Paste trip description → click Generate  
**Say**: *"Behind the scenes, Wandr generates an AI embedding of my description and runs a cosine similarity search against 50,000 destinations stored in Aurora PostgreSQL using the pg_vector extension. It finds the most semantically relevant destinations — not keyword matches — and passes that context to GPT-4o to build the itinerary."*

**Action**: Watch itinerary stream in (takes ~2 seconds)  
**Say**: *"Under 3 seconds. Complete day-by-day plan — activities, restaurants, accommodations, real GPS coordinates. And it's already saved to Aurora PostgreSQL."*

**Highlight**: Point to Day 4 showing Yanaka neighborhood  
**Say**: *"Notice it recommended Yanaka — a hidden gem that matches our 'off the beaten path' preference. That's the semantic search working — it found that Yanaka scores high for 'authentic, local, non-touristy' in embedding space."*

---

### [1:00–1:30] Collaborative Planning

**Action**: Click "Invite Collaborator" → show invite link  
**Say**: *"Now let me invite my travel companion."*

**Action**: Open second browser window with pre-shared invite link  
**Say**: *"Both of us can now edit this itinerary in real-time. Watch what happens when I move Day 3's dinner reservation to Day 4."*

**Action**: Drag itinerary item in window 1 — show it updating in window 2  
**Say**: *"Real-time sync. No conflicts, no versioning hell. Aurora PostgreSQL's advisory locks ensure changes are atomic — two people can never overwrite each other."*

---

### [1:30–1:55] Price Alerts

**Action**: Navigate to Price Alerts tab  
**Say**: *"I've set a price alert for Tokyo flights — notify me when prices drop below $800."*

**Show**: Active alert with "checking every 6 hours" status  
**Say**: *"An EventBridge rule triggers a Lambda function every 6 hours. The Lambda reads all active alerts from Aurora, checks current prices, and uses SES to email users when their threshold is crossed. Full serverless pipeline — Aurora is the source of truth."*

---

### [1:55–2:20] Travel Memory + Past Trips

**Action**: Navigate to Dashboard / Past Trips  
**Say**: *"This user has 3 past completed trips. Each trip updated their travel preference profile — Wandr learned they prefer street food over fine dining, temples over museums, boutique hotels over chains."*

**Show**: Travel style profile visualization  
**Say**: *"Every future AI recommendation is influenced by this profile. The embeddings of your past trips are averaged and used as a prior in the semantic search."*

---

### [2:20–2:40] Architecture + AWS Database Proof

**Action**: Switch to AWS Console tab showing Aurora cluster  
**Say**: *"And here's the production Aurora PostgreSQL Serverless v2 cluster — currently running at 1 ACU, auto-scaling as needed. All trip data, itinerary items, destination embeddings, price alerts — all here. The cluster has pg_vector enabled and row-level security enforcing user isolation at the database layer."*

**Show**: Quick toggle to Vercel project dashboard showing environment variables  
**Say**: *"Database credentials secured in AWS Secrets Manager — never hardcoded, never in version control."*

---

### [2:40–2:45] Close

**Say**: *"Wandr is not a demo. It's a product. Aurora PostgreSQL handles the complex relational data, pg_vector enables AI-powered recommendations, and Vercel deploys it globally in milliseconds. You could launch this Monday."*

**Show**: Pricing page briefly  
**Say**: *"Free tier, Explorer at $9/month, Nomad at $19 — with a clear path to profitability through subscriptions and travel affiliates."*

---

## Backup Plans

| Failure | Recovery |
|---|---|
| AI generation times out | Pre-generated itinerary screenshot ready; say "Here's a previously generated example" |
| Collaboration demo fails | Show single-user flow only; skip collaboration section |
| Aurora connection error | Show local development screenshots; mention "Aurora is provisioned, there's a connectivity issue in demo env" |
| Stripe page fails | Skip pricing demo; mention it in verbal description |

---

## Key Talking Points to Hit

1. **pg_vector in Aurora** — embeddings stored *in* the relational database (not a separate service)
2. **Row-level security** — user isolation enforced at the DB layer, not just application layer
3. **Serverless scaling** — Aurora scales from 0.5 to 64 ACUs automatically
4. **CloudFormation** — entire AWS infrastructure defined as code
5. **Shippable** — has real monetization (Stripe), real auth (Google OAuth), production security
