/**
 * Aurora PostgreSQL database connection using postgres.js
 * Uses connection pooling optimized for Vercel serverless functions.
 *
 * Security: Connection string loaded from environment variables only.
 * Never hard-code credentials.
 */

import postgres from 'postgres'

// Singleton pattern prevents connection exhaustion in serverless environments
let sql: ReturnType<typeof postgres> | null = null

function getDb() {
  if (sql) return sql

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  sql = postgres(connectionString, {
    // Connection pool settings optimized for Vercel serverless
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    // SSL required for Aurora
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false,
    // Transform column names from snake_case to camelCase
    transform: {
      column: postgres.toCamel,
    },
    // Debug queries in development
    debug: process.env.NODE_ENV === 'development',
  })

  return sql
}

export const db = getDb()

// ─── Type-safe query helpers ──────────────────────────────────────────────────

export type User = {
  id: string
  email: string
  name: string
  image: string | null
  travelStyle: string[]
  stripeCustomerId: string | null
  subscriptionTier: 'free' | 'explorer' | 'nomad'
  createdAt: Date
}

export type Trip = {
  id: string
  userId: string
  title: string
  description: string | null
  startDate: Date | null
  endDate: Date | null
  budget: number | null
  currency: string
  coverImage: string | null
  status: 'planning' | 'booked' | 'completed'
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

export type ItineraryItem = {
  id: string
  tripId: string
  day: number
  order: number
  type: 'activity' | 'accommodation' | 'transport' | 'food' | 'note'
  title: string
  description: string | null
  location: string | null
  latitude: number | null
  longitude: number | null
  startTime: string | null
  endTime: string | null
  estimatedCost: number | null
  currency: string
  bookingUrl: string | null
  notes: string | null
  createdAt: Date
}

export type Destination = {
  id: string
  name: string
  country: string
  region: string | null
  description: string
  tags: string[]
  imageUrl: string | null
  avgCostPerDay: number | null
  currency: string
  // pg_vector embedding stored as string, converted to float[] in queries
  embeddingText: string
}

// ─── Query functions ──────────────────────────────────────────────────────────

/**
 * Find destinations semantically similar to the given embedding.
 * Uses pg_vector's <=> cosine distance operator.
 */
export async function findSimilarDestinations(
  queryEmbedding: number[],
  limit = 10,
  excludeIds: string[] = []
): Promise<(Destination & { similarity: number })[]> {
  const embeddingStr = `[${queryEmbedding.join(',')}]`

  const results = await db<(Destination & { similarity: number })[]>`
    SELECT
      d.*,
      1 - (d.embedding <=> ${embeddingStr}::vector) AS similarity
    FROM destinations d
    WHERE d.id != ALL(${excludeIds}::uuid[])
    ORDER BY d.embedding <=> ${embeddingStr}::vector
    LIMIT ${limit}
  `
  return results
}

/**
 * Get a user's trips with item counts.
 */
export async function getUserTrips(userId: string): Promise<(Trip & { itemCount: number })[]> {
  return db<(Trip & { itemCount: number })[]>`
    SELECT
      t.*,
      COUNT(i.id)::int AS item_count
    FROM trips t
    LEFT JOIN itinerary_items i ON i.trip_id = t.id
    WHERE t.user_id = ${userId}
    GROUP BY t.id
    ORDER BY t.created_at DESC
  `
}

/**
 * Get a full trip with all itinerary items.
 */
export async function getTripWithItems(
  tripId: string,
  userId: string
): Promise<{ trip: Trip; items: ItineraryItem[] } | null> {
  const [trip] = await db<Trip[]>`
    SELECT t.*
    FROM trips t
    LEFT JOIN trip_collaborators tc ON tc.trip_id = t.id AND tc.user_id = ${userId}
    WHERE t.id = ${tripId}
      AND (t.user_id = ${userId} OR tc.user_id IS NOT NULL OR t.is_public = true)
  `
  if (!trip) return null

  const items = await db<ItineraryItem[]>`
    SELECT * FROM itinerary_items
    WHERE trip_id = ${tripId}
    ORDER BY day ASC, "order" ASC
  `
  return { trip, items }
}

/**
 * Create a new trip and return it.
 */
export async function createTrip(
  userId: string,
  data: Pick<Trip, 'title' | 'description' | 'startDate' | 'endDate' | 'budget' | 'currency'>
): Promise<Trip> {
  const [trip] = await db<Trip[]>`
    INSERT INTO trips (user_id, title, description, start_date, end_date, budget, currency)
    VALUES (${userId}, ${data.title}, ${data.description ?? null}, ${data.startDate ?? null},
            ${data.endDate ?? null}, ${data.budget ?? null}, ${data.currency})
    RETURNING *
  `
  return trip
}

/**
 * Upsert itinerary items for a trip (used after AI generation).
 */
export async function upsertItineraryItems(
  tripId: string,
  items: Omit<ItineraryItem, 'id' | 'createdAt'>[]
): Promise<ItineraryItem[]> {
  if (items.length === 0) return []

  return db<ItineraryItem[]>`
    INSERT INTO itinerary_items ${db(items)}
    ON CONFLICT (trip_id, day, "order") DO UPDATE
    SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      location = EXCLUDED.location,
      latitude = EXCLUDED.latitude,
      longitude = EXCLUDED.longitude,
      type = EXCLUDED.type,
      estimated_cost = EXCLUDED.estimated_cost,
      booking_url = EXCLUDED.booking_url
    RETURNING *
  `
}
