/**
 * POST /api/ai-plan
 * Generate a complete travel itinerary using AI + Aurora PostgreSQL semantic search.
 *
 * Flow:
 * 1. Receive user's trip description
 * 2. Generate an embedding for the description (OpenAI text-embedding-3-small)
 * 3. Find semantically similar destinations via pg_vector cosine search
 * 4. Pass destinations + context to GPT-4o to generate structured itinerary
 * 5. Save itinerary items to Aurora PostgreSQL
 * 6. Stream response back to client
 */

import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db, findSimilarDestinations, createTrip, upsertItineraryItems } from '@/lib/db'
import OpenAI from 'openai'
import { z } from 'zod'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// ─── Request validation ───────────────────────────────────────────────────────
const PlanRequestSchema = z.object({
  description: z.string().min(10).max(1000),
  duration: z.number().int().min(1).max(30),
  budget: z.number().optional(),
  currency: z.string().length(3).default('USD'),
  travelers: z.number().int().min(1).max(20).default(2),
})

// ─── Itinerary item structure from AI ────────────────────────────────────────
const ItineraryItemSchema = z.object({
  day: z.number().int().min(1),
  order: z.number().int().min(0),
  type: z.enum(['activity', 'accommodation', 'transport', 'food', 'note']),
  title: z.string(),
  description: z.string(),
  location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  startTime: z.string().optional(),
  estimatedCost: z.number().optional(),
  bookingUrl: z.string().url().optional(),
})

type ParsedItinerary = {
  tripTitle: string
  summary: string
  items: z.infer<typeof ItineraryItemSchema>[]
  totalEstimatedCost: number
}

export async function POST(req: NextRequest) {
  // ── Authentication check ──
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Parse and validate request ──
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parseResult = PlanRequestSchema.safeParse(body)
  if (!parseResult.success) {
    return Response.json({ error: 'Invalid request', details: parseResult.error.issues }, { status: 400 })
  }

  const { description, duration, budget, currency, travelers } = parseResult.data

  // ── Check trip limit for free tier ──
  const [{ count }] = await db<[{ count: number }]>`
    SELECT COUNT(*)::int AS count
    FROM trips
    WHERE user_id = ${session.user.id}
      AND created_at > NOW() - INTERVAL '30 days'
  `
  const user = await db`SELECT subscription_tier FROM users WHERE id = ${session.user.id}`
  if (user[0]?.subscription_tier === 'free' && count >= 3) {
    return Response.json(
      { error: 'Free tier limit reached (3 trips/month). Please upgrade to Explorer.' },
      { status: 429 }
    )
  }

  try {
    // ── Step 1: Generate embedding for the trip description ──
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: description,
    })
    const queryEmbedding = embeddingResponse.data[0].embedding

    // ── Step 2: Find semantically similar destinations via pg_vector ──
    const similarDestinations = await findSimilarDestinations(queryEmbedding, 15)

    // ── Step 3: Generate itinerary with GPT-4o ──
    const destinationContext = similarDestinations
      .map((d) => `- ${d.name}, ${d.country}: ${d.description} (tags: ${d.tags.join(', ')}, ~$${d.avgCostPerDay}/day)`)
      .join('\n')

    const systemPrompt = `You are an expert travel planner. Generate a detailed, realistic travel itinerary.
Return a JSON object with this exact structure:
{
  "tripTitle": "string",
  "summary": "string (2-3 sentences)",
  "totalEstimatedCost": number,
  "items": [
    {
      "day": number,
      "order": number (0-indexed within day),
      "type": "activity" | "accommodation" | "transport" | "food" | "note",
      "title": "string",
      "description": "string",
      "location": "string",
      "latitude": number,
      "longitude": number,
      "startTime": "HH:MM" | null,
      "estimatedCost": number (per person in ${currency})
    }
  ]
}
Only return valid JSON. No markdown fences.`

    const userPrompt = `Trip description: "${description}"
Duration: ${duration} days
Travelers: ${travelers}
${budget ? `Budget: ${currency} ${budget} total` : ''}

Relevant destinations from our database:
${destinationContext}

Create a day-by-day itinerary. Include 4-6 items per day (morning activity, lunch, afternoon activity, dinner, accommodation). Be specific with real place names and provide accurate GPS coordinates.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    })

    const rawItinerary = completion.choices[0].message.content
    if (!rawItinerary) {
      return Response.json({ error: 'AI generation failed' }, { status: 500 })
    }

    // ── Step 4: Parse and validate AI response ──
    let parsed: ParsedItinerary
    try {
      const raw = JSON.parse(rawItinerary)
      parsed = {
        tripTitle: raw.tripTitle,
        summary: raw.summary,
        totalEstimatedCost: raw.totalEstimatedCost,
        items: raw.items.map((item: unknown) => ItineraryItemSchema.parse(item)),
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      return Response.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }

    // ── Step 5: Save to Aurora PostgreSQL ──
    const trip = await createTrip(session.user.id, {
      title: parsed.tripTitle,
      description: parsed.summary,
      startDate: null,
      endDate: null,
      budget: budget ?? null,
      currency,
    })

    const savedItems = await upsertItineraryItems(
      trip.id,
      parsed.items.map((item) => ({
        tripId: trip.id,
        day: item.day,
        order: item.order,
        type: item.type,
        title: item.title,
        description: item.description ?? null,
        location: item.location ?? null,
        latitude: item.latitude ?? null,
        longitude: item.longitude ?? null,
        startTime: item.startTime ?? null,
        endTime: null,
        estimatedCost: item.estimatedCost ?? null,
        currency,
        bookingUrl: item.bookingUrl ?? null,
        notes: null,
      }))
    )

    return Response.json({
      trip,
      items: savedItems,
      summary: parsed.summary,
      totalEstimatedCost: parsed.totalEstimatedCost,
      destinationsUsed: similarDestinations.slice(0, 5).map((d) => d.name),
    })
  } catch (error) {
    console.error('AI plan generation error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
