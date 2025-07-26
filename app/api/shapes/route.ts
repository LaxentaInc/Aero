// /api/shapes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { MongoClient, Db, Collection } from 'mongodb';

// MongoDB connection
let cachedDb: Db | null = null;

async function connectToDatabase(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  const client = await MongoClient.connect(process.env.MONGO_URI!);
  const db = client.db('shape-manager');
  cachedDb = db;
  return db;
}

interface ShapeConfig {
  id: string;
  token: string;
  userId?: string;
  model?: string;
  limit?: number;
  instruction?: string;
  cooldown?: number;
  maxLength?: number;
  action?: 'create' | 'stop' | 'update';
  status?: 'pending' | 'creating' | 'online' | 'offline' | 'error' | 'failed';
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  hostInfo?: any;
  discordInfo?: {
    id: string;
    username: string;
    avatar: string | null;
    discriminator: string;
  };
  guilds?: number;
  isPublic?: boolean;
  description?: string;
  tags?: string[];
  inviteUrl?: string;
}

// Authentication middleware
function authenticate(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.substring(7);
  const validToken = process.env.BOT_API_AUTH || 'your-secret-auth-token';
  
  return token === validToken;
}

// Helper function to fetch Discord bot info
async function fetchDiscordBotInfo(token: string) {
  try {
    const response = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        'Authorization': `Bot ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        id: data.id,
        username: data.username,
        avatar: data.avatar ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png` : null,
        discriminator: data.discriminator
      };
    }
  } catch (error) {
    console.error('Failed to fetch Discord bot info:', error);
  }
  return null;
}

// GET /api/shapes - Get shapes with search
export async function GET(req: NextRequest) {
  const db = await connectToDatabase();
  const shapes = db.collection<ShapeConfig>('shapes');
  
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search');
  const publicOnly = searchParams.get('public') === 'true';
  const userId = searchParams.get('userId');
  const pending = searchParams.get('pending') === 'true';
  
  const isAuthenticated = authenticate(req);
  
  try {
    let query: any = {};
    
    if (pending) {
      if (!isAuthenticated) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      query = {
        $or: [
          { status: 'pending' },
          { action: { $in: ['stop', 'update'] } }
        ]
      };
      
      const pendingShapes = await shapes.find(query).toArray();
      
      for (const shape of pendingShapes) {
        if (shape.status === 'pending') {
          await shapes.updateOne(
            { id: shape.id },
            { $set: { status: 'creating' } }
          );
        }
      }
      
      return NextResponse.json({ success: true, bots: pendingShapes });
    }
    
    if (publicOnly) {
      query.isPublic = true;
    }
    
    if (userId) {
      query.userId = userId;
    }
    
    if (search) {
      query.$or = [
        { 'discordInfo.username': { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
      
      if (isAuthenticated) {
        query.$or.push({ instruction: { $regex: search, $options: 'i' } });
      }
    }
    
    const allShapes = await shapes
      .find(query)
      .sort({ guilds: -1, createdAt: -1 })
      .limit(publicOnly ? 50 : 100)
      .toArray();
    
    const sanitizedShapes = allShapes.map(shape => {
      const sanitized: any = {
        id: shape.id,
        status: shape.status,
        discordInfo: shape.discordInfo,
        guilds: shape.guilds,
        isPublic: shape.isPublic,
        description: shape.description,
        tags: shape.tags,
        createdAt: shape.createdAt,
        inviteUrl: shape.discordInfo?.id 
          ? `https://discord.com/api/oauth2/authorize?client_id=${shape.discordInfo.id}&permissions=8&scope=bot%20applications.commands`
          : undefined
      };
      
      if (isAuthenticated || shape.userId === userId) {
        sanitized.token = shape.token;
        sanitized.userId = shape.userId;
        sanitized.model = shape.model;
        sanitized.limit = shape.limit;
        sanitized.instruction = shape.instruction;
        sanitized.cooldown = shape.cooldown;
        sanitized.maxLength = shape.maxLength;
        sanitized.action = shape.action;
        sanitized.error = shape.error;
        sanitized.hostInfo = shape.hostInfo;
      }
      
      return sanitized;
    });
    
    return NextResponse.json({ 
      success: true, 
      shapes: sanitizedShapes,
      total: await shapes.countDocuments(query)
    });
    
  } catch (error) {
    console.error('Failed to fetch shapes:', error);
    return NextResponse.json({ error: 'Failed to fetch shapes' }, { status: 500 });
  }
}

// POST /api/shapes - Create new shape
export async function POST(req: NextRequest) {
  if (!authenticate(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = await connectToDatabase();
  const shapes = db.collection<ShapeConfig>('shapes');
  
  const pathname = req.nextUrl.pathname;
  
  // Update shape status (for bot host)
  if (pathname.endsWith('/status')) {
    const { botId, status, error, hostInfo, guilds } = await req.json();
    
    const updateData: any = {
      status,
      error,
      hostInfo,
      updatedAt: new Date()
    };
    
    if (guilds !== undefined) {
      updateData.guilds = guilds;
    }
    
    const result = await shapes.updateOne(
      { id: botId },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Shape not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  }
  
  // Create new shape
  const body = await req.json();
  const { token, model, limit, instruction, cooldown, maxLength, userId, isPublic, description, tags } = body;
  
  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }
  
  // Check if token already exists
  const existingShape = await shapes.findOne({ token });
  if (existingShape) {
    return NextResponse.json({ 
      error: 'Shape with this token already exists', 
      shapeId: existingShape.id 
    }, { status: 400 });
  }
  
  // Fetch Discord bot info
  const discordInfo = await fetchDiscordBotInfo(token);
  if (!discordInfo) {
    return NextResponse.json({ error: 'Invalid Discord bot token' }, { status: 400 });
  }
  
  const shapeConfig: ShapeConfig = {
    id: uuidv4(),
    token,
    userId,
    model,
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
  };
  
  await shapes.insertOne(shapeConfig);
  
  return NextResponse.json({ 
    success: true, 
    shape: {
      ...shapeConfig,
      inviteUrl: `https://discord.com/api/oauth2/authorize?client_id=${discordInfo.id}&permissions=8&scope=bot%20applications.commands`
    }
  });
}

// PUT /api/shapes/:id - Update shape
export async function PUT(req: NextRequest) {
  if (!authenticate(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = await connectToDatabase();
  const shapes = db.collection<ShapeConfig>('shapes');
  
  const id = req.nextUrl.pathname.split('/').pop();
  if (!id) {
    return NextResponse.json({ error: 'Shape ID required' }, { status: 400 });
  }

  const shape = await shapes.findOne({ id });
  if (!shape) {
    return NextResponse.json({ error: 'Shape not found' }, { status: 404 });
  }

  const updates = await req.json();
  
  // Update shape config
  const updateData = {
    ...updates,
    action: 'update',
    updatedAt: new Date()
  };
  
  // Don't allow certain fields to be updated
  delete updateData.id;
  delete updateData.token;
  delete updateData.discordInfo;
  
  await shapes.updateOne(
    { id },
    { $set: updateData }
  );
  
  return NextResponse.json({ success: true });
}

// DELETE /api/shapes/:id - Stop/Delete shape
export async function DELETE(req: NextRequest) {
  if (!authenticate(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = await connectToDatabase();
  const shapes = db.collection<ShapeConfig>('shapes');
  
  const id = req.nextUrl.pathname.split('/').pop();
  if (!id) {
    return NextResponse.json({ error: 'Shape ID required' }, { status: 400 });
  }

  const shape = await shapes.findOne({ id });
  if (!shape) {
    return NextResponse.json({ error: 'Shape not found' }, { status: 404 });
  }

  // Mark for deletion
  await shapes.updateOne(
    { id },
    { $set: { action: 'stop' } }
  );
  
  // After a delay, actually delete it
  setTimeout(async () => {
    await shapes.deleteOne({ id });
  }, 5000);
  
  return NextResponse.json({ success: true });
}

// POST /api/shapes/toggle-public - Toggle shape public status
export async function PATCH(req: NextRequest) {
  if (!authenticate(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = await connectToDatabase();
  const shapes = db.collection<ShapeConfig>('shapes');
  
  const { id, isPublic, description, tags } = await req.json();
  
  if (!id) {
    return NextResponse.json({ error: 'Shape ID required' }, { status: 400 });
  }

  const updateData: any = {
    isPublic,
    updatedAt: new Date()
  };
  
  if (description !== undefined) updateData.description = description;
  if (tags !== undefined) updateData.tags = tags;
  
  const result = await shapes.updateOne(
    { id },
    { $set: updateData }
  );
  
  if (result.matchedCount === 0) {
    return NextResponse.json({ error: 'Shape not found' }, { status: 404 });
  }
  
  return NextResponse.json({ success: true });
}