import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, Db } from 'mongodb';

// MongoDB connection singleton
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI not found in environment variables');
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('antiraid');

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

// Config validation schema
interface AntiNukeConfig {
  enabled: boolean;
  antiNukeEnabled: boolean;
  channelDeleteThreshold: number;
  roleDeleteThreshold: number;
  webhookCreateThreshold: number;
  emojiDeleteThreshold: number;
  stickerDeleteThreshold: number;
  timeWindow: number;
  trustedUsers: string[];
  trustedRoles: string[];
  bypassTrusted: boolean;
  punishmentActions: string[];
  timeoutDuration: number;
  enableRollback: boolean;
  rollbackChannels: boolean;
  rollbackRoles: boolean;
  rollbackEmojis: boolean;
  notifyOwner: boolean;
  logChannelId: string | null;
  logActions: boolean;
  antiWebhookSpam: boolean;
  antiSelfBot: boolean;
  maxWebhooksPerChannel: number;
  debug: boolean;
}

function validateConfig(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required boolean fields
  const boolFields = ['enabled', 'antiNukeEnabled', 'bypassTrusted', 'enableRollback', 
                      'rollbackChannels', 'rollbackRoles', 'rollbackEmojis', 
                      'notifyOwner', 'logActions', 'antiWebhookSpam', 'antiSelfBot', 'debug'];
  
  boolFields.forEach(field => {
    if (typeof data[field] !== 'boolean') errors.push(`${field} must be boolean`);
  });

  // Check threshold numbers (must be positive)
  const thresholds = ['channelDeleteThreshold', 'roleDeleteThreshold', 'webhookCreateThreshold',
                     'emojiDeleteThreshold', 'stickerDeleteThreshold', 'timeWindow', 
                     'timeoutDuration', 'maxWebhooksPerChannel'];
  
  thresholds.forEach(field => {
    if (typeof data[field] !== 'number' || data[field] < 1) {
      errors.push(`${field} must be a positive number`);
    }
  });

  // Check arrays
  if (!Array.isArray(data.trustedUsers)) errors.push('trustedUsers must be array');
  if (!Array.isArray(data.trustedRoles)) errors.push('trustedRoles must be array');
  if (!Array.isArray(data.punishmentActions)) errors.push('punishmentActions must be array');

  // Validate punishment actions
  const validActions = ['remove_roles', 'timeout', 'kick', 'ban', 'notify'];
  if (Array.isArray(data.punishmentActions)) {
    data.punishmentActions.forEach((action: string) => {
      if (!validActions.includes(action)) {
        errors.push(`Invalid punishment action: ${action}`);
      }
    });
  }

  // logChannelId can be null or string
  if (data.logChannelId !== null && typeof data.logChannelId !== 'string') {
    errors.push('logChannelId must be string or null');
  }

  return { valid: errors.length === 0, errors };
}

// GET - Fetch config for a guild
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const guildId = searchParams.get('guildId');

    if (!guildId) {
      return NextResponse.json(
        { error: 'guildId query parameter required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const collection = db.collection('anti_nuke_protection_configs');
    
    const doc = await collection.findOne({ guildId });

    if (!doc) {
      return NextResponse.json(
        { error: 'Config not found for this guild' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      guildId: doc.guildId,
      config: doc.config,
      lastUpdated: doc.lastUpdated,
      createdAt: doc.createdAt
    });

  } catch (error: any) {
    console.error('GET /api/antinuke error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create or update config
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { guildId, config } = body;

    if (!guildId || typeof guildId !== 'string') {
      return NextResponse.json(
        { error: 'guildId is required and must be string' },
        { status: 400 }
      );
    }

    if (!config || typeof config !== 'object') {
      return NextResponse.json(
        { error: 'config object is required' },
        { status: 400 }
      );
    }

    // Validate config structure
    const validation = validateConfig(config);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid config', validationErrors: validation.errors },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const collection = db.collection('anti_nuke_protection_configs');

    const now = new Date();
    const existingDoc = await collection.findOne({ guildId });

    const result = await collection.updateOne(
      { guildId },
      {
        $set: {
          guildId,
          config,
          lastUpdated: now,
          ...(existingDoc ? {} : { createdAt: now })
        }
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      guildId,
      config,
      action: existingDoc ? 'updated' : 'created',
      lastUpdated: now.toISOString()
    });

  } catch (error: any) {
    console.error('POST /api/antinuke error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Partially update config
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { guildId, configUpdates } = body;

    if (!guildId || typeof guildId !== 'string') {
      return NextResponse.json(
        { error: 'guildId is required' },
        { status: 400 }
      );
    }

    if (!configUpdates || typeof configUpdates !== 'object') {
      return NextResponse.json(
        { error: 'configUpdates object is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const collection = db.collection('anti_nuke_protection_configs');

    const existingDoc = await collection.findOne({ guildId });
    if (!existingDoc) {
      return NextResponse.json(
        { error: 'Config not found for this guild. Use POST to create.' },
        { status: 404 }
      );
    }

    // Merge existing config with updates
    const mergedConfig = { ...existingDoc.config, ...configUpdates };

    // Validate merged config
    const validation = validateConfig(mergedConfig);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid config after merge', validationErrors: validation.errors },
        { status: 400 }
      );
    }

    const now = new Date();
    await collection.updateOne(
      { guildId },
      {
        $set: {
          config: mergedConfig,
          lastUpdated: now
        }
      }
    );

    return NextResponse.json({
      success: true,
      guildId,
      config: mergedConfig,
      action: 'partially_updated',
      lastUpdated: now.toISOString()
    });

  } catch (error: any) {
    console.error('PATCH /api/antinuke error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remove config for a guild
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const guildId = searchParams.get('guildId');

    if (!guildId) {
      return NextResponse.json(
        { error: 'guildId query parameter required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const collection = db.collection('anti_nuke_protection_configs');

    const result = await collection.deleteOne({ guildId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Config not found for this guild' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      guildId,
      action: 'deleted'
    });

  } catch (error: any) {
    console.error('DELETE /api/antinuke error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}