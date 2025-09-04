import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

// MongoDB connection
let cachedClient: MongoClient | null = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  const client = new MongoClient(process.env.MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  });

  await client.connect();
  cachedClient = client;
  return client;
}

// Types
interface Guild {
  guildId: string;
  name: string;
  ownerId: string;
  icon: string | null;
  memberCount: number;
  botHasPermissions: boolean;
  botJoinedAt: Date;
  lastUpdated: Date;
  features: string[];
}

interface GuildResponse {
  guildId: string;
  name: string;
  icon: string | null;
  memberCount: number;
  botJoinedAt: string;
  lastUpdated: string;
  features: string[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Validate required parameter
    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await connectToDatabase();
    const db = client.db('antiraid');
    const guildsCollection = db.collection<Guild>('bot_guilds');

    // Query guilds owned by the user where bot has permissions
    const guilds = await guildsCollection
      .find({
        ownerId: userId,
        botHasPermissions: true,
      })
      .sort({ name: 1 }) // Sort alphabetically by name
      .toArray();

    // Transform the data for frontend consumption
    const response: GuildResponse[] = guilds.map((guild) => ({
      guildId: guild.guildId,
      name: guild.name,
      icon: guild.icon,
      memberCount: guild.memberCount,
      botJoinedAt: guild.botJoinedAt.toISOString(),
      lastUpdated: guild.lastUpdated.toISOString(),
      features: guild.features,
    }));

    return NextResponse.json({
      success: true,
      guilds: response,
      count: response.length,
    });

  } catch (error) {
    console.error('Error fetching guilds:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Optional: Add POST method for webhook updates or manual sync triggers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, guildId, userId } = body;

    if (action === 'refresh' && userId) {
      // Trigger a refresh for specific user's guilds
      // You could add logic here to notify the bot to resync
      
      return NextResponse.json({
        success: true,
        message: 'Refresh triggered'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action or missing parameters' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error in POST /api/guilds:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Optional: Add additional utility methods
export async function HEAD(request: NextRequest) {
  // Health check endpoint
  try {
    const client = await connectToDatabase();
    await client.db('antiraid').admin().ping();
    
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}