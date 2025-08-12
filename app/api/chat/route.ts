// app/api/chat/route.ts
import { NextResponse, NextRequest } from 'next/server'

interface ChatMessage {
  id: string
  text: string
  timestamp: string
  user: string
}

// In-memory storage (will reset on server restart)
// For production, use a database like Supabase, MongoDB, or PostgreSQL
let messages: ChatMessage[] = []

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ messages })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const message: ChatMessage = await request.json()
    
    // Basic validation
    if (!message.text || !message.user || !message.id || !message.timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      )
    }
    
    // Limit message length
    if (message.text.length > 200) {
      return NextResponse.json(
        { error: 'Message too long' }, 
        { status: 400 }
      )
    }
    
    // Add message to storage
    messages.push(message)
    
    // Keep only last 100 messages to prevent memory issues
    if (messages.length > 100) {
      messages = messages.slice(-100)
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}