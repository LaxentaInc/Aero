import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

// CORS headers - define at the top
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
}

// Store processed bot IDs to prevent duplicates
let processedBotIds = new Set()
let botQueue = []
const VALID_BEARER_TOKEN = 'Bearer laxenta-hidden-after-this' // Added "Bearer " prefix

// Verify authorization
const isValidToken = (token) => {
  return token === VALID_BEARER_TOKEN
}

// POST endpoint - Frontend creates new bot
export async function POST(request) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.token) {
      return NextResponse.json(
        { error: 'Missing required fields: name, token' },
        { status: 400, headers: corsHeaders }
      )
    }
    
    // Check for duplicate token in queue
    const existingBot = botQueue.find(bot => bot.token === body.token)
    if (existingBot) {
      return NextResponse.json(
        { error: 'A bot with this token is already queued' },
        { status: 409, headers: corsHeaders }
      )
    }
    
    // Generate unique bot ID
    const botId = Date.now().toString(36) + Math.random().toString(36).substr(2)
    const fileName = body.fileName || `{body.name.toLowerCase().replace(/[^a-z0-<span class="hljs-number">9</span>-]/g, <span class="hljs-string">&#x27;-&#x27;</span>)}</span>-<span class="hljs-subst">{botId}.js`
    
    const botConfig = {
      id: botId,
      fileName: fileName,
      name: body.name,
      token: body.token,
      model: body.model || 'anubis-pro-105b-v1',
      instruction: body.instruction || '',
      userId: body.userId || 'web-created',
      settings: {
        temperature: parseFloat(body.settings?.temperature || 0.9),
        presence_penalty: parseFloat(body.settings?.presence_penalty || 0.6),
        frequency_penalty: parseFloat(body.settings?.frequency_penalty || 0.7),
        limit: parseInt(body.settings?.limit || 10),
        maxLength: parseInt(body.settings?.maxLength || 4000),
        typingInterval: parseInt(body.settings?.typingInterval || 5000),
        requestTimeout: parseInt(body.settings?.requestTimeout || 30000),
        maxRetries: parseInt(body.settings?.maxRetries || 3),
        cooldown: parseInt(body.settings?.cooldown || 3000)
      },
      presence: {
        status: body.presence?.status || 'online',
        activity: body.presence?.activity || 'with humans',
        activityType: body.presence?.activityType || 'PLAYING'
      },
      createdAt: new Date().toISOString(),
      isRunning: false
    }
    
    // Add to queue
    botQueue.push(botConfig)
    
    console.log(`[API] New bot queued: botConfig.name</span>(<spanclass="hljs−subst">{botConfig.name}</span> (<span class="hljs-subst">botConfig.name</span>(<spanclass="hljs−subst">{botConfig.id})`)
    
    return NextResponse.json({
      success: true,
      message: 'Bot configuration queued successfully',
      bot: {
        id: botConfig.id,
        name: botConfig.name,
        createdAt: botConfig.createdAt
      }
    }, { headers: corsHeaders })
    
  } catch (error) {
    console.error('POST /api/ai error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// GET endpoint - Bot creator site polls this
export async function GET(request) {
  try {
    const headersList = await headers()
    const authToken = headersList.get('authorization')
    
    // Check authorization
    if (!isValidToken(authToken)) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401, headers: corsHeaders }
      )
    }
    
    // Get only unprocessed bots
    const newBots = botQueue.filter(bot => !processedBotIds.has(bot.id))
    
    // Mark these bots as sent
    newBots.forEach(bot => {
      processedBotIds.add(bot.id)
    })
    
    console.log(`[API] Sending ${newBots.length} new bots to creator`)
    
    return NextResponse.json({
      success: true,
      bots: newBots,
      count: newBots.length,
      timestamp: new Date().toISOString()
    }, { headers: corsHeaders })
    
  } catch (error) {
    console.error('GET /api/ai error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// PUT endpoint - Bot creator confirms bot was created
export async function PUT(request) {
  try {
    const headersList = await headers()
    const authToken = headersList.get('authorization')
    
    if (!isValidToken(authToken)) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401, headers: corsHeaders }
      )
    }
    
    const body = await request.json()
    const { botId, status } = body
    
    if (!botId || !status) {
      return NextResponse.json(
        { error: 'Missing botId or status' },
        { status: 400, headers: corsHeaders }
      )
    }
    
    if (status === 'created') {
      // Remove from queue once confirmed
      const beforeCount = botQueue.length
      botQueue = botQueue.filter(bot => bot.id !== botId)
      const removed = beforeCount - botQueue.length
      console.log(`[API] Bot botId</span>confirmedascreated<spanclass="hljs−subst">{botId}</span> confirmed as created<span class="hljs-subst">botId</span>confirmedascreated<spanclass="hljs−subst">{removed ? '' : ' (not found in queue)'}`)
    } else if (status === 'failed') {
      // Remove from processed so it gets sent again
      processedBotIds.delete(botId)
      console.log(`[API] Bot ${botId} creation failed, will retry`)
    }
    
    return NextResponse.json({
      success: true,
      message: `Bot botId</span>statusupdatedto<spanclass="hljs−subst">{botId}</span> status updated to <span class="hljs-subst">botId</span>statusupdatedto<spanclass="hljs−subst">{status}`
    }, { headers: corsHeaders })
    
  } catch (error) {
    console.error('PUT /api/ai error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// DELETE endpoint - Clean up old data
export async function DELETE(request) {
  try {
    const headersList = await headers()
    const authToken = headersList.get('authorization')
    
    if (!isValidToken(authToken)) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401, headers: corsHeaders }
      )
    }
    
    const oldCount = botQueue.length
    const processedCount = processedBotIds.size
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    
    // Remove bots older than 1 hour that were processed
    botQueue = botQueue.filter(bot => {
      const createdAt = new Date(bot.createdAt)
      const isProcessed = processedBotIds.has(bot.id)
      const isOld = createdAt < oneHourAgo
      
      // Also clean up processedBotIds
      if (isProcessed && isOld) {
        processedBotIds.delete(bot.id)
        return false
      }
      return true
    })
    
    const removed = oldCount - botQueue.length
    const processedRemoved = processedCount - processedBotIds.size
    
    return NextResponse.json({
      success: true,
      message: `Cleaned up removed</span>oldbotconfigsand<spanclass="hljs−subst">{removed}</span> old bot configs and <span class="hljs-subst">removed</span>oldbotconfigsand<spanclass="hljs−subst">{processedRemoved} processed IDs`
    }, { headers: corsHeaders })
    
  } catch (error) {
    console.error('DELETE /api/ai error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// OPTIONS endpoint for CORS preflight
export async function OPTIONS(request) {
  return NextResponse.json({}, { headers: corsHeaders })
}