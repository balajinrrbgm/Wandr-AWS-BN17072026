/**
 * GET  /api/trips       — List current user's trips
 * POST /api/trips       — Create a new trip
 */

import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserTrips, createTrip } from '@/lib/db'
import { z } from 'zod'

const CreateTripSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  budget: z.number().positive().optional(),
  currency: z.string().length(3).default('USD'),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const trips = await getUserTrips(session.user.id)
  return Response.json({ trips })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parseResult = CreateTripSchema.safeParse(body)
  if (!parseResult.success) {
    return Response.json({ error: 'Invalid request', details: parseResult.error.issues }, { status: 400 })
  }

  const { title, description, startDate, endDate, budget, currency } = parseResult.data

  const trip = await createTrip(session.user.id, {
    title,
    description: description ?? null,
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
    budget: budget ?? null,
    currency,
  })

  return Response.json({ trip }, { status: 201 })
}
