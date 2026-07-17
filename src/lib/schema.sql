-- =============================================================================
-- Wandr — Aurora PostgreSQL Schema
-- Includes pg_vector extension for AI embedding similarity search
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;           -- pg_vector for AI embeddings
CREATE EXTENSION IF NOT EXISTS pg_trgm;          -- Trigram text search

-- =============================================================================
-- USERS
-- =============================================================================
CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email               TEXT UNIQUE NOT NULL,
    name                TEXT NOT NULL,
    image               TEXT,
    travel_style        TEXT[] DEFAULT '{}',      -- e.g. ['adventure', 'food', 'culture']
    stripe_customer_id  TEXT UNIQUE,
    subscription_tier   TEXT NOT NULL DEFAULT 'free'
                            CHECK (subscription_tier IN ('free', 'explorer', 'nomad')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe ON users(stripe_customer_id);

-- =============================================================================
-- TRIPS
-- =============================================================================
CREATE TABLE trips (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    description     TEXT,
    start_date      DATE,
    end_date        DATE,
    budget          NUMERIC(12, 2),
    currency        CHAR(3) NOT NULL DEFAULT 'USD',
    cover_image     TEXT,
    status          TEXT NOT NULL DEFAULT 'planning'
                        CHECK (status IN ('planning', 'booked', 'completed')),
    is_public       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_dates ON trips(start_date, end_date);

-- =============================================================================
-- TRIP COLLABORATORS
-- =============================================================================
CREATE TABLE trip_collaborators (
    trip_id     UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role        TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('viewer', 'editor', 'admin')),
    joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (trip_id, user_id)
);

-- =============================================================================
-- ITINERARY ITEMS
-- =============================================================================
CREATE TABLE itinerary_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id         UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    day             SMALLINT NOT NULL CHECK (day >= 1),
    "order"         SMALLINT NOT NULL DEFAULT 0,
    type            TEXT NOT NULL DEFAULT 'activity'
                        CHECK (type IN ('activity', 'accommodation', 'transport', 'food', 'note')),
    title           TEXT NOT NULL,
    description     TEXT,
    location        TEXT,
    latitude        DOUBLE PRECISION,
    longitude       DOUBLE PRECISION,
    start_time      TIME,
    end_time        TIME,
    estimated_cost  NUMERIC(10, 2),
    currency        CHAR(3) NOT NULL DEFAULT 'USD',
    booking_url     TEXT,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (trip_id, day, "order")
);

CREATE INDEX idx_items_trip_id ON itinerary_items(trip_id);
CREATE INDEX idx_items_day ON itinerary_items(trip_id, day);

-- =============================================================================
-- DESTINATIONS — with pg_vector embeddings for semantic search
-- =============================================================================
CREATE TABLE destinations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            TEXT NOT NULL,
    country         TEXT NOT NULL,
    region          TEXT,
    description     TEXT NOT NULL,
    tags            TEXT[] DEFAULT '{}',
    image_url       TEXT,
    avg_cost_per_day NUMERIC(8, 2),
    currency        CHAR(3) NOT NULL DEFAULT 'USD',
    latitude        DOUBLE PRECISION,
    longitude       DOUBLE PRECISION,
    -- 1536-dimensional vector from text-embedding-3-small
    embedding       vector(1536),
    -- Full-text search using tsvector
    search_vector   tsvector GENERATED ALWAYS AS (
                        to_tsvector('english', name || ' ' || country || ' ' || description)
                    ) STORED,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- HNSW index for fast approximate nearest-neighbor search (pg_vector)
-- Optimized for cosine distance (travel descriptions are best compared with cosine)
CREATE INDEX idx_destinations_embedding ON destinations
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- Full-text search index
CREATE INDEX idx_destinations_fts ON destinations USING gin(search_vector);

-- Traditional tag search
CREATE INDEX idx_destinations_tags ON destinations USING gin(tags);

-- =============================================================================
-- PRICE ALERTS
-- =============================================================================
CREATE TABLE price_alerts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trip_id         UUID REFERENCES trips(id) ON DELETE CASCADE,
    alert_type      TEXT NOT NULL CHECK (alert_type IN ('flight', 'hotel', 'activity')),
    destination     TEXT NOT NULL,
    origin          TEXT,
    travel_date     DATE,
    threshold_price NUMERIC(10, 2) NOT NULL,
    currency        CHAR(3) NOT NULL DEFAULT 'USD',
    current_price   NUMERIC(10, 2),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    last_checked    TIMESTAMPTZ,
    notified_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alerts_user_id ON price_alerts(user_id);
CREATE INDEX idx_alerts_active ON price_alerts(is_active) WHERE is_active = TRUE;

-- =============================================================================
-- AUDIT: Updated-at trigger
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_trips_updated_at
    BEFORE UPDATE ON trips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY — multi-user isolation
-- =============================================================================
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

-- Users can only read their own trips or public trips or trips they collaborate on
CREATE POLICY trips_select ON trips FOR SELECT
    USING (
        user_id = current_setting('app.current_user_id')::uuid
        OR is_public = TRUE
        OR EXISTS (
            SELECT 1 FROM trip_collaborators tc
            WHERE tc.trip_id = id
              AND tc.user_id = current_setting('app.current_user_id')::uuid
        )
    );

-- Only trip owners can modify trips
CREATE POLICY trips_modify ON trips FOR ALL
    USING (user_id = current_setting('app.current_user_id')::uuid);

-- Itinerary items follow their trip's access policy
CREATE POLICY items_select ON itinerary_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM trips t
            WHERE t.id = trip_id
              AND (
                  t.user_id = current_setting('app.current_user_id')::uuid
                  OR t.is_public = TRUE
                  OR EXISTS (
                      SELECT 1 FROM trip_collaborators tc
                      WHERE tc.trip_id = t.id
                        AND tc.user_id = current_setting('app.current_user_id')::uuid
                  )
              )
        )
    );

-- =============================================================================
-- ANALYTICS: Materialized view for user trip stats (refresh daily)
-- =============================================================================
CREATE MATERIALIZED VIEW user_trip_stats AS
SELECT
    u.id AS user_id,
    COUNT(DISTINCT t.id) AS total_trips,
    COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed') AS completed_trips,
    SUM(t.budget) AS total_budget_planned,
    AVG(EXTRACT(EPOCH FROM (t.end_date::timestamptz - t.start_date::timestamptz)) / 86400)::int AS avg_trip_duration_days,
    COUNT(DISTINCT UNNEST(d.tags)) AS unique_destination_tags
FROM users u
LEFT JOIN trips t ON t.user_id = u.id
LEFT JOIN itinerary_items ii ON ii.trip_id = t.id
LEFT JOIN destinations d ON d.name = ii.location
GROUP BY u.id;

CREATE UNIQUE INDEX idx_trip_stats_user ON user_trip_stats(user_id);
