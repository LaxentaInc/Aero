// app/api/spotify/disconnect/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

let cachedClient: MongoClient | null = null

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient
  }
  const client = await MongoClient.connect(process.env.MONGO_URI!)
  cachedClient = client
  return client
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const client = await connectToDatabase()
    const db = client.db()
    const collection = db.collection('spotify_tokens')
    
    // Delete the user's tokens from database
    const result = await collection.deleteOne({ userId })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log(`User ${userId} tokens deleted from database`)
    
    return NextResponse.json({ 
      success: true,
      message: 'Successfully disconnected from Spotify' 
    })
    
  } catch (error) {
    console.error('Disconnect error:', error)
    return NextResponse.json({ error: 'Disconnect failed' }, { status: 500 })
  }
}