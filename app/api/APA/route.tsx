import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, Db } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

interface AntiPermissionAbuseConfig {
  enabled: boolean;
  trustedUsers: string[];
  trustedRoles: string[];
  bypassTrusted: boolean;
  dangerousPermissions: string[];
  monitorRoleCreation: boolean;
  monitorRoleUpdates: boolean;
  monitorRoleAssignments: boolean;
  punishmentActions: string[];
  stripExecutorRoles: boolean;
  timeoutDuration: number;
  monitorBots: boolean;
  notifyOwner: boolean;
  notifyOnPermissionFailure: boolean;
  notifyOnDuplicates: boolean;
  logChannelId: string | null;
  logActions: boolean;
  punishmentCooldown: number;
  auditLogCacheDuration: number;
  auditLogTimeout: number;
  debug: boolean;
}

interface AntiPermissionAbuseDocument {
  guildId: string;
  config: AntiPermissionAbuseConfig;
  lastUpdated: string;
  createdAt: string;
}

function validateConfig(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  const boolFields = [
    'enabled', 'bypassTrusted', 'monitorRoleCreation', 'monitorRoleUpdates',
    'monitorRoleAssignments', 'stripExecutorRoles', 'monitorBots', 'notifyOwner',
    'notifyOnPermissionFailure', 'notifyOnDuplicates', 'logActions', 'debug'
  ];
  
  boolFields.forEach(field => {
    if (typeof data[field] !== 'boolean') {
      errors.push(`${field} must be boolean`);
    }
  });

  const numberFields = [
    'timeoutDuration', 'punishmentCooldown', 'auditLogCacheDuration', 'auditLogTimeout'
  ];
  
  numberFields.forEach(field => {
    if (typeof data[field] !== 'number' || data[field] < 1) {
      errors.push(`${field} must be a positive number`);
    }
  });

  if (!Array.isArray(data.trustedUsers)) {
    errors.push('trustedUsers must be array');
  }
  if (!Array.isArray(data.trustedRoles)) {
    errors.push('trustedRoles must be array');
  }
  if (!Array.isArray(data.punishmentActions)) {
    errors.push('punishmentActions must be array');
  }
  if (!Array.isArray(data.dangerousPermissions)) {
    errors.push('dangerousPermissions must be array');
  }

  const validActions = ['timeout', 'kick', 'ban', 'remove_roles'];
  if (Array.isArray(data.punishmentActions)) {
    data.punishmentActions.forEach((action: string) => {
      if (!validActions.includes(action)) {
        errors.push(`Invalid punishment action: ${action}`);
      }
    });
  }

  const validPermissions = [
    'Administrator', 'ManageGuild', 'ManageRoles', 'ManageChannels',
    'BanMembers', 'KickMembers', 'ManageWebhooks', 'ManageGuildExpressions'
  ];
  if (Array.isArray(data.dangerousPermissions)) {
    data.dangerousPermissions.forEach((perm: string) => {
      if (!validPermissions.includes(perm)) {
        errors.push(`Invalid permission: ${perm}`);
      }
    });
  }

  if (data.logChannelId !== null && typeof data.logChannelId !== 'string') {
    errors.push('logChannelId must be string or null');
  }

  return { valid: errors.length === 0, errors };
}

// Check if user can manage guild using bot_guilds collection
async function userCanManageGuild(userId: string, guildId: string): Promise<boolean> {
  try {
    const { db } = await connectToDatabase();
    const guildsCollection = db.collection('bot_guilds');
    
    // Check if guild exists in DB with this user as owner and bot has permissions
    const guild = await guildsCollection.findOne({
      guildId: guildId,
      ownerId: userId,
      botHasPermissions: true
    });
    
    return guild !== null;
  } catch (error) {
    console.error('issues checking guild permissions:', error);
    return false;
  }
}

// GET - Fetch config for a guild
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const guildId = searchParams.get('guildId');

    if (!guildId) {
      return NextResponse.json(
        { error: 'Guild ID is required' },
        { status: 400 }
      );
    }

    // Use new permission check
    const canManage = await userCanManageGuild(session.user.id, guildId);
    if (!canManage) {
      return NextResponse.json(
        { error: 'You do not have permission to access this guild' },
        { status: 403 }
      );
    }

    const { db } = await connectToDatabase();
    const collection = db.collection('anti_permission_abuse_configs');
    
    const doc = await collection.findOne({ guildId });

    if (!doc) {
      return NextResponse.json(
        { error: 'Configuration not found for this guild' },
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
    console.error('[Anti-Permission GET] Error:', error.message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create or update config
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No console cowboys allowed |  Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { guildId, config } = body;

    if (!guildId || typeof guildId !== 'string') {
      return NextResponse.json(
        { error: 'Guild ID is required and must be a string' },
        { status: 400 }
      );
    }

    // Use new permission check
    const canManage = await userCanManageGuild(session.user.id, guildId);
    if (!canManage) {
      return NextResponse.json(
        { error: 'No console cowboys allowed | You do not have permission to modify this guild' },
        { status: 403 }
      );
    }

    if (!config || typeof config !== 'object') {
      return NextResponse.json(
        { error: 'Configuration object is required' },
        { status: 400 }
      );
    }

    const validation = validateConfig(config);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid configuration', validationErrors: validation.errors },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const collection = db.collection('anti_permission_abuse_configs');

    const now = new Date();
    const existingDoc = await collection.findOne({ guildId });

    await collection.updateOne(
      { guildId },
      {
        $set: {
          guildId,
          config,
          lastUpdated: now,
          lastUpdatedBy: session.user.id,
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
    console.error('[Anti-Permission POST] Error:', error.message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Partially update config
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { guildId, configUpdates } = body;

    if (!guildId || typeof guildId !== 'string') {
      return NextResponse.json(
        { error: 'Guild ID is required' },
        { status: 400 }
      );
    }

    // Use new permission check
    const canManage = await userCanManageGuild(session.user.id, guildId);
    if (!canManage) {
      return NextResponse.json(
        { error: 'You do not have permission to modify this guild' },
        { status: 403 }
      );
    }

    if (!configUpdates || typeof configUpdates !== 'object') {
      return NextResponse.json(
        { error: 'Configuration updates object is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const collection = db.collection('anti_permission_abuse_configs');

    const existingDoc = await collection.findOne({ guildId });
    if (!existingDoc) {
      return NextResponse.json(
        { error: 'Configuration not found. Use POST to create a new configuration.' },
        { status: 404 }
      );
    }

    const mergedConfig = { ...existingDoc.config, ...configUpdates };

    const validation = validateConfig(mergedConfig);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid configuration after merge', validationErrors: validation.errors },
        { status: 400 }
      );
    }

    const now = new Date();
    await collection.updateOne(
      { guildId },
      {
        $set: {
          config: mergedConfig,
          lastUpdated: now,
          lastUpdatedBy: session.user.id
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
    console.error('[Anti-Permission PATCH] Error:', error.message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove config for a guild
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const guildId = searchParams.get('guildId');

    if (!guildId) {
      return NextResponse.json(
        { error: 'Guild ID is required' },
        { status: 400 }
      );
    }

    // Use new permission check
    const canManage = await userCanManageGuild(session.user.id, guildId);
    if (!canManage) {
      return NextResponse.json(
        { error: 'You do not have permission to delete configuration for this guild' },
        { status: 403 }
      );
    }

    const { db } = await connectToDatabase();
    const collection = db.collection('anti_permission_abuse_configs');

    const result = await collection.deleteOne({ guildId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Configuration not found for this guild' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      guildId,
      action: 'deleted'
    });

  } catch (error: any) {
    console.error('[Anti-Permission DELETE] Error:', error.message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}