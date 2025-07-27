import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectToDatabase } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

// GET /api/shapes - List shapes
export async function GET(req: NextRequest) {
  // Check for publicOnly parameter
  const url = req.nextUrl.clone()
  const publicOnly = url.searchParams.get('publicOnly') === 'true'
  url.searchParams.delete('publicOnly')

  // For backend polling, check Authorization header against process.env.BOT_API_AUTH
  if (req.headers.get('authorization') === `Bot ${process.env.BOT_API_AUTH}`) {
    const client = await connectToDatabase()
    const db = client.db()

    const shapes = await db.collection('shapes').find({ status: { $ne: 'offline' } }).toArray()
    return NextResponse.json({ success: true, shapes })
  }

  // For authenticated frontend requests, use session auth
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Please login' }, { status: 401 })
  }
  const client = await connectToDatabase()
  const db = client.db()

  // Fetch user shapes
  const userShapes = await db.collection('shapes').find({ userId: session.user.id }).toArray()
  return NextResponse.json({ success: true, shapes: userShapes })
}

// POST /api/shapes - Create shape (or update status for backend)
export async function POST(req: NextRequest) {
  // For backend status update, check pathname
  if (req.nextUrl.pathname.endsWith('/status')) {
    const authHeader = req.headers.get('authorization')
    if (!authHeader || authHeader.substring(7) !== process.env.BOT_API_AUTH) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await req.json()
    const client = await connectToDatabase()
    const db = client.db()

    // Update shape status in DB
    await db.collection('shapes').updateOne({ token: body.token }, { $set: { status: body.status, updatedAt: new Date() } })
    return NextResponse.json({ success: true })
  }

  // Frontend: Create new shape with session validation
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Please login' }, { status: 401 })
  }
  const body = await req.json()

  // Validate request body
  if (!body.token || !body.model || !body.limit || !body.instruction) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Fetch Discord bot info
  const discordInfo = await fetchDiscordBotInfo(body.token)
  if (!discordInfo) {
    return NextResponse.json({ error: 'Invalid bot token' }, { status: 400 })
  }

  const client = await connectToDatabase()
  const db = client.db()

  // Create shapeConfig with proper fields:
  const shapeConfig = {
    id: uuidv4(),
    token: body.token,
    userId: session.user.id,
    status: 'pending',
    action: 'create',
    createdAt: new Date(),
    updatedAt: new Date(),
    guilds: discordInfo.guilds || 0,
    isPublic: body.isPublic || false,
    description: body.description || '',
    tags: body.tags || [],
    config: {
      model: body.model,
      limit: body.limit,
      instruction: body.instruction
    },
    discordInfo: {
      id: discordInfo.id,
      username: discordInfo.username,
      avatar: discordInfo.avatar,
      discriminator: discordInfo.discriminator
    }
  }

  // Insert new shapeConfig into DB
  await db.collection('shapes').insertOne(shapeConfig)
  return NextResponse.json({ success: true, shape: shapeConfig })
}

async function fetchDiscordBotInfo(token: string) {
  try {
    const response = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        Authorization: `Bot ${token}`
      }
    })
    if (!response.ok) throw new Error('Failed to fetch')
    const data = await response.json()
    return {
      id: data.id,
      username: data.username,
      avatar: data.avatar,
      discriminator: data.discriminator,
      guilds: data.guilds ? data.guilds.length : 0
    }
  } catch (error) {
    return null
  }
}