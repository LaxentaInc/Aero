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

// CORRECTED INTERFACE - Matches bot module exactly
interface AntiNukeConfig {
  // Core settings
  enabled: boolean;
  
  // Thresholds
  channelDeleteThreshold: number;
  roleDeleteThreshold: number;
  webhookCreateThreshold: number;
  emojiDeleteThreshold: number;
  stickerDeleteThreshold: number;
  banThreshold: number;
  kickThreshold: number;
  timeWindow: number;
  
  // Trust system
  trustedUsers: string[];
  trustedRoles: string[];
  bypassTrusted: boolean;
  
  // BOT HANDLING
  botAutoban: boolean;
  
  // USER PUNISHMENT
  userPunishmentActions: string[];
  timeoutDuration: number;
  
  // RAPID FIRE DETECTION (instant ban system)
  rapidFireEnabled: boolean;
  rapidFireThreshold: number;
  rapidFireWindow: number;
  rapidFireAction: string;
  
  // Rollback system
  enableRollback: boolean;
  rollbackChannels: boolean;
  rollbackRoles: boolean;
  rollbackEmojis: boolean;
  maxChannelBackups: number;
  maxRoleBackups: number;
  maxEmojiBackups: number;
  maxStickerBackups: number;
  backupRetentionHours: number;
  
  // Notifications and logging
  notifyOwner: boolean;
  logChannelId: string | null;
  logActions: boolean;
  
  // Performance
  auditLogCacheDuration: number;
  debug: boolean;
}

function getDefaultConfig(): AntiNukeConfig {
  return {
    enabled: true,
    channelDeleteThreshold: 3,
    roleDeleteThreshold: 3,
    webhookCreateThreshold: 3,
    emojiDeleteThreshold: 5,
    stickerDeleteThreshold: 3,
    banThreshold: 3,
    kickThreshold: 5,
    timeWindow: 30,
    trustedUsers: [],
    trustedRoles: [],
    bypassTrusted: true,
    
    botAutoban: true,
    userPunishmentActions: ['remove_roles', 'timeout'],
    timeoutDuration: 1800,
    
    rapidFireEnabled: true,
    rapidFireThreshold: 2,
    rapidFireWindow: 1000,
    rapidFireAction: 'ban',
    
    enableRollback: true,
    rollbackChannels: true,
    rollbackRoles: true,
    rollbackEmojis: true,
    maxChannelBackups: 20,
    maxRoleBackups: 50,
    maxEmojiBackups: 100,
    maxStickerBackups: 100,
    backupRetentionHours: 24,
    notifyOwner: true,
    logChannelId: null,
    logActions: true,
    auditLogCacheDuration: 2000,
    debug: false
  };
}

function validateConfig(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  const boolFields = [
    'enabled', 'bypassTrusted', 'botAutoban',
    'rapidFireEnabled',
    'enableRollback', 'rollbackChannels', 'rollbackRoles', 'rollbackEmojis',
    'notifyOwner', 'logActions', 'debug'
  ];
  
  boolFields.forEach(field => {
    if (typeof data[field] !== 'boolean') {
      errors.push(`${field} must be boolean`);
    }
  });

  const thresholds = [
    'channelDeleteThreshold', 'roleDeleteThreshold', 'webhookCreateThreshold',
    'emojiDeleteThreshold', 'stickerDeleteThreshold', 'banThreshold', 
    'kickThreshold', 'timeWindow', 'timeoutDuration',
    'rapidFireThreshold', 'rapidFireWindow',
    'maxChannelBackups', 'maxRoleBackups', 'maxEmojiBackups', 'maxStickerBackups',
    'backupRetentionHours', 'auditLogCacheDuration'
  ];
  
  thresholds.forEach(field => {
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
  if (!Array.isArray(data.userPunishmentActions)) {
    errors.push('userPunishmentActions must be array');
  }

  const validUserActions = ['remove_roles', 'timeout', 'kick', 'ban'];
  if (Array.isArray(data.userPunishmentActions)) {
    data.userPunishmentActions.forEach((action: string) => {
      if (!validUserActions.includes(action)) {
        errors.push(`Invalid user punishment action: ${action}`);
      }
    });
  }

  const validRapidFireActions = ['ban', 'kick', 'timeout'];
  if (data.rapidFireAction && !validRapidFireActions.includes(data.rapidFireAction)) {
    errors.push(`rapidFireAction must be one of: ${validRapidFireActions.join(', ')}`);
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
    
    const guild = await guildsCollection.findOne({
      guildId: guildId,
      ownerId: userId,
      botHasPermissions: true
    });
    
    return guild !== null;
  } catch (error) {
    console.error('Error checking guild permissions:', error);
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

    const canManage = await userCanManageGuild(session.user.id, guildId);
    if (!canManage) {
      return NextResponse.json(
        { error: 'You do not have permission to access this guild' },
        { status: 403 }
      );
    }

    const { db } = await connectToDatabase();
    const collection = db.collection('anti_nuke_protection_configs');
    
    const doc = await collection.findOne({ guildId });

    if (!doc) {
      // Return default config if none exists
      const defaultConfig = getDefaultConfig();
      return NextResponse.json({
        success: true,
        guildId,
        config: defaultConfig,
        isDefault: true,
        message: 'Using default configuration. Save to persist changes.'
      });
    }

    // Merge with defaults to ensure all fields exist (handles old configs)
    const mergedConfig = { ...getDefaultConfig(), ...doc.config };

    return NextResponse.json({
      success: true,
      guildId: doc.guildId,
      config: mergedConfig,
      lastUpdated: doc.lastUpdated,
      createdAt: doc.createdAt,
      isDefault: false
    });

  } catch (error: any) {
    console.error('[Anti-Nuke GET] Error:', error.message);
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
        { error: 'No console cowboys allowed | Authentication required. Please log in.' },
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

    // Merge with defaults to ensure all fields exist
    const completeConfig = { ...getDefaultConfig(), ...config };

    // Validate config structure
    const validation = validateConfig(completeConfig);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid configuration', validationErrors: validation.errors },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const collection = db.collection('anti_nuke_protection_configs');

    const now = new Date();
    const existingDoc = await collection.findOne({ guildId });

    await collection.updateOne(
      { guildId },
      {
        $set: {
          guildId,
          config: completeConfig,
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
      config: completeConfig,
      action: existingDoc ? 'updated' : 'created',
      lastUpdated: now.toISOString()
    });

  } catch (error: any) {
    console.error('[Anti-Nuke POST] Error:', error.message);
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
    const collection = db.collection('anti_nuke_protection_configs');

    const existingDoc = await collection.findOne({ guildId });
    
    // Start with defaults, merge existing, then apply updates
    const baseConfig = getDefaultConfig();
    const currentConfig = existingDoc ? existingDoc.config : {};
    const mergedConfig = { ...baseConfig, ...currentConfig, ...configUpdates };

    // Validate merged config
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
          guildId,
          config: mergedConfig,
          lastUpdated: now,
          lastUpdatedBy: session.user.id,
          ...(!existingDoc ? { createdAt: now } : {})
        }
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      guildId,
      config: mergedConfig,
      action: existingDoc ? 'partially_updated' : 'created',
      lastUpdated: now.toISOString()
    });

  } catch (error: any) {
    console.error('[Anti-Nuke PATCH] Error:', error.message);
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

    const canManage = await userCanManageGuild(session.user.id, guildId);
    if (!canManage) {
      return NextResponse.json(
        { error: 'You do not have permission to delete configuration for this guild' },
        { status: 403 }
      );
    }

    const { db } = await connectToDatabase();
    const collection = db.collection('anti_nuke_protection_configs');

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
      action: 'deleted',
      message: 'Configuration deleted. Default settings will be used.'
    });

  } catch (error: any) {
    console.error('[Anti-Nuke DELETE] Error:', error.message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
