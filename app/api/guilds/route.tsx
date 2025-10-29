import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

// connection
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

    // required parameter
    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 }
      );
    }

    const client = await connectToDatabase();
    const db = client.db('antiraid');
    const guildsCollection = db.collection<Guild>('bot_guilds');

    // query guilds owned by the user where bot has permissions
    const guilds = await guildsCollection
      .find({
        ownerId: userId,
        botHasPermissions: true,
      })
      .sort({ name: 1 }) // sort alphabetically by name
      .toArray();

    // transform the data for frontend
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