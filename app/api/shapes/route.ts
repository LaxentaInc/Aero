// /api/shapes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"  // ← Change this!
import { connectToDatabase } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

// GET /api/shapes - List shapes
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const publicOnly = searchParams.get('public') === 'true'
  const pending = searchParams.get('pending') === 'true'
  
  // Public endpoint - no auth

  if (publicOnly) {
    const db = await connectToDatabase()
    const shapes = db.collection('shapes')
    
    const publicShapes = await shapes
      .find({ isPublic: true })
      .project({
        id: 1,
        discordInfo: 1,
        description: 1,
        tags: 1,
        guilds: 1
      })
      .limit(50)
      .toArray()
    
    return NextResponse.json({ success: true, shapes: publicShapes })
  }
  
  // Backend polling - needs API token
  if (pending) {
    const authHeader = req.headers.get('authorization')
    if (!authHeader || authHeader.substring(7) !== process.env.BOT_API_AUTH) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const db = await connectToDatabase()
    const shapes = db.collection('shapes')
    
    const pendingShapes = await shapes.find({
      $or: [
        { status: 'pending' },
        { action: { $in: ['stop', 'update'] } }
      ]
    }).toArray()
    
    // Mark as creating
    for (const shape of pendingShapes) {
      if (shape.status === 'pending') {
        await shapes.updateOne(
          { id: shape.id },
          { $set: { status: 'creating' } }
        )
      }
    }
    
    return NextResponse.json({ success: true, bots: pendingShapes })
  }
  
  // Frontend - needs Discord auth
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Please login' }, { status: 401 })
  }
  
  const db = await connectToDatabase()
  const shapes = db.collection('shapes')
  
  const userShapes = await shapes
    .find({ userId: session.user.id })
    .toArray()
  
  return NextResponse.json({ 
    success: true, 
    shapes: userShapes 
  })
}

// POST /api/shapes - Create shape
export async function POST(req: NextRequest) {
  // Status update endpoint (backend only)
  if (req.nextUrl.pathname.endsWith('/status')) {
    const authHeader = req.headers.get('authorization')
    if (!authHeader || authHeader.substring(7) !== process.env.BOT_API_AUTH) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { botId, status, error, hostInfo, guilds } = await req.json()
    const db = await connectToDatabase()
    const shapes = db.collection('shapes')
    
    await shapes.updateOne(
      { id: botId },
      { 
        $set: { 
          status, 
          error, 
          hostInfo, 
          guilds,
          updatedAt: new Date() 
        } 
      }
    )
    
    return NextResponse.json({ success: true })
  }
  
  // Create new shape (frontend only)
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Please login' }, { status: 401 })
  }
  
  const body = await req.json()
  const { token, model, limit, instruction, cooldown, maxLength, isPublic, description, tags } = body
  
  // Validate Discord bot token
  const discordInfo = await fetchDiscordBotInfo(token)
  if (!discordInfo) {
    return NextResponse.json({ error: 'Invalid Discord bot token' }, { status: 400 })
  }
  
  const db = await connectToDatabase()
  const shapes = db.collection('shapes')
  
  const shapeConfig = {
    id: uuidv4(),
    token,
    userId: session.user.id,
    model: model || 'llama-3-lumimaid-70b',
    limit: Math.min(limit || 10, 15),
    instruction,
    cooldown,
    maxLength,
    action: 'create',
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
    discordInfo,
    guilds: 0,
    isPublic: isPublic || false,
    description: description || '',
    tags: tags || []
  }
  
  await shapes.insertOne(shapeConfig)
  
  return NextResponse.json({ success: true, shape: shapeConfig })
}

async function fetchDiscordBotInfo(token: string) {
  try {
    const response = await fetch('https://discord.com/api/v10/users/@me', {
      headers: { 'Authorization': `Bot ${token}` }
    })
    
    if (response.ok) {
      const data = await response.json()
      return {
        id: data.id,
        username: data.username,
        avatar: data.avatar ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png` : null,
        discriminator: data.discriminator
      }
    }
  } catch (error) {
    console.error('Failed to fetch Discord bot info:', error)
  }
  return null
}