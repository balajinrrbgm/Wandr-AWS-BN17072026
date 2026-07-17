# Wandr — Architecture Design Document

## System Architecture Overview

```mermaid
graph TB
    subgraph Client["🌐 Client (Browser / Mobile)"]
        UI[Next.js App Router\nReact Server Components]
    end

    subgraph Vercel["☁️ Vercel Edge Network (45 regions)"]
        direction TB
        EDGE[Edge Runtime\nGlobal CDN]
        API[API Routes\n/api/trips\n/api/ai-plan\n/api/alerts\n/api/stripe]
        ISR[Incremental Static\nRegeneration]
        ENV[Environment Variables\nSecure credential storage]
    end

    subgraph AWS["☁️ AWS"]
        direction TB
        subgraph RDS["Amazon Aurora PostgreSQL Serverless v2"]
            AURORA_W[Writer Instance\ndb.serverless]
            AURORA_R[Reader Instance\ndb.serverless]
            subgraph Schema["Database Schema"]
                USERS[(users)]
                TRIPS[(trips)]
                ITEMS[(itinerary_items)]
                DEST[(destinations\n+ pg_vector embeddings)]
                ALERTS[(price_alerts)]
                COLLAB[(trip_collaborators)]
            end
        end
        SM[AWS Secrets Manager\nDB credentials]
        LAMBDA[Lambda\nPrice Alert Checker]
        EB[EventBridge\nScheduler every 6h]
        SES[SES\nEmail notifications]
        CW[CloudWatch\nMetrics + Alarms]
        VPC[VPC\nPrivate subnets]
    end

    subgraph External["External Services"]
        OPENAI[OpenAI API\nGPT-4o + text-embedding-3-small]
        STRIPE[Stripe\nSubscription billing]
        GOOGLE[Google OAuth\nAuthentication]
    end

    %% Client → Vercel
    UI -->|HTTPS| EDGE
    EDGE --> API
    EDGE --> ISR

    %% Vercel → AWS
    API -->|PostgreSQL over TLS\nIAM/OIDC auth| AURORA_W
    AURORA_W --> AURORA_R
    API -->|GetSecretValue| SM
    SM -.->|Inject credentials| API

    %% Aurora internal
    AURORA_W --- USERS
    AURORA_W --- TRIPS
    AURORA_W --- ITEMS
    AURORA_W --- DEST
    AURORA_W --- ALERTS
    AURORA_W --- COLLAB

    %% Lambda flow
    EB -->|Trigger every 6h| LAMBDA
    LAMBDA -->|Read active alerts| AURORA_W
    LAMBDA -->|Check prices| External
    LAMBDA -->|Send notifications| SES
    LAMBDA -.->|Metrics| CW
    AURORA_W -.->|Logs| CW

    %% External
    API -->|Embeddings + Chat| OPENAI
    API -->|Payment processing| STRIPE
    UI -->|OAuth flow| GOOGLE

    %% VPC
    AURORA_W -.->|Inside VPC| VPC
    LAMBDA -.->|Inside VPC| VPC

    style AWS fill:#FF9900,color:#000,stroke:#FF9900
    style Vercel fill:#000,color:#fff,stroke:#444
    style RDS fill:#2496ED,color:#fff,stroke:#2496ED
    style Client fill:#f0f9ff,color:#000,stroke:#0ca2e8
    style External fill:#f5f5f5,color:#000,stroke:#999
```

## Component Breakdown

| Component | Technology | Responsibility |
|---|---|---|
| Frontend | Next.js 14 App Router | Server-rendered React UI, streaming, SEO |
| Styling | Tailwind CSS + shadcn/ui | Professional UI components |
| Animations | Framer Motion | Polished micro-interactions |
| API Layer | Next.js Route Handlers | REST API, auth middleware, rate limiting |
| Database ORM | postgres.js | Type-safe Aurora PostgreSQL queries |
| AI Embeddings | OpenAI text-embedding-3-small | 1536-dim vectors for destination search |
| AI Generation | OpenAI GPT-4o | Natural language → structured itinerary |
| Vector Search | pg_vector (Aurora extension) | Cosine similarity over destination embeddings |
| Authentication | NextAuth.js | Session management, Google OAuth |
| Payments | Stripe | Subscription tiers, webhook processing |
| Infrastructure | AWS CloudFormation | Reproducible IaC deployment |
| Monitoring | CloudWatch | Metrics, alarms, Aurora performance insights |

## Aurora PostgreSQL — Why This Database?

Aurora PostgreSQL Serverless v2 is the ideal database for Wandr because:

1. **Complex relationships**: Trips contain itinerary items, linked to destinations, with collaborators — requires JOINS, foreign keys, transactions
2. **pg_vector extension**: Stores 1536-dimensional AI embeddings directly in Aurora, enabling semantic destination search without a separate vector database
3. **Full-text search**: `tsvector`/`tsquery` for keyword search over destination names and descriptions
4. **Row-level security**: Per-user trip isolation at the database layer — not just application layer
5. **Serverless scaling**: Aurora pauses during low traffic (cost optimization) and scales to 64 ACUs during peak
6. **Materialized views**: Pre-computed trip analytics refresh daily without impacting live query performance
7. **ACID transactions**: Critical for collaborative editing — multiple users editing the same trip safely

## Data Flow: AI Itinerary Generation

```mermaid
sequenceDiagram
    participant User
    participant Vercel as Vercel API
    participant OpenAI
    participant Aurora as Aurora PostgreSQL

    User->>Vercel: POST /api/ai-plan\n{ description, duration, budget }
    Vercel->>Vercel: Validate request + check tier limits
    Vercel->>Aurora: COUNT active trips (rate limit check)
    Aurora-->>Vercel: Trip count
    Vercel->>OpenAI: Generate embedding\n(text-embedding-3-small)
    OpenAI-->>Vercel: 1536-dim vector
    Vercel->>Aurora: SELECT * FROM destinations\nORDER BY embedding <=> $1 LIMIT 15\n(pg_vector cosine search)
    Aurora-->>Vercel: 15 most relevant destinations
    Vercel->>OpenAI: GPT-4o chat completion\n(description + destinations context)
    OpenAI-->>Vercel: Structured JSON itinerary
    Vercel->>Aurora: INSERT INTO trips + itinerary_items\n(transaction)
    Aurora-->>Vercel: Saved trip with IDs
    Vercel-->>User: { trip, items, summary }
```

## Security Architecture

| Concern | Implementation |
|---|---|
| Database credentials | AWS Secrets Manager — never in code or env files |
| Vercel → AWS auth | Vercel OIDC (no long-lived AWS keys) |
| Database access | Aurora in private VPC subnets, no public exposure |
| Row-level security | PostgreSQL RLS policies enforce user isolation at DB layer |
| API authentication | NextAuth.js session validation on every API route |
| Input validation | Zod schemas on all API inputs |
| Security headers | X-Frame-Options, CSP, Referrer-Policy on all routes |
| Payment data | Never stored — Stripe handles all card data |

## Scalability Design

- **Aurora Serverless v2**: Scales from 0.5 to 64 ACUs automatically; handles traffic spikes
- **Read replicas**: Heavy analytics queries routed to reader instance
- **pg_vector HNSW index**: O(log n) approximate nearest-neighbor — scales to millions of destinations
- **Vercel Edge**: Global CDN reduces latency; ISR caches popular destination pages
- **Connection pooling**: postgres.js pool prevents connection exhaustion under concurrent Vercel function invocations
- **Lambda for async work**: Price alert checking offloaded from critical path
