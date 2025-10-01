import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, Db, Collection } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // Adjust path to your auth config

// Types
interface AccountAgeConfig {
  enabled: boolean;
  minAccountAge: number;
  action: string;
  timeoutDuration: number;
  logChannelId: string | null;
  trustedUsers: string[];
  trustedRoles: string[];
  bypassTrusted: boolean;
  logActions: boolean;
  debug: boolean;
}

interface AccountAgeDocument {
  guildId: string;
  config: AccountAgeConfig;
  lastUpdated: Date;
  createdAt: Date;
}

interface Guild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
}

// MongoDB connection
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function connectToMongoDB(): Promise<{ db: Db; collection: Collection<AccountAgeDocument> }> {
  if (cachedClient && cachedDb) {
    return {
      db: cachedDb,
      collection: cachedDb.collection<AccountAgeDocument>('account_age_configs')
    };
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  const client = new MongoClient(mongoUri);
  await client.connect();

  const db = client.db('antiraid');
  const collection = db.collection<AccountAgeDocument>('account_age_configs');

  // Cache the connection
  cachedClient = client;
  cachedDb = db;

  return { db, collection };
}

// Default configuration
const defaultConfig: AccountAgeConfig = {
  enabled: true,
  minAccountAge: 7,
  action: 'notify',
  timeoutDuration: 600,
  logChannelId: null,
  trustedUsers: [],
  trustedRoles: [],
  bypassTrusted: true,
  logActions: true,
  debug: false
};

// Security: Check if user has permission to manage a guild
const userCanManageGuild = (guilds: Guild[] | undefined, guildId: string): boolean => {
  if (!guilds || !Array.isArray(guilds)) {
    return false;
  }

  const guild = guilds.find(g => g.id === guildId);
  if (!guild) {
    return false;
  }

  // Check if user is owner OR has MANAGE_GUILD permission (0x20)
  const hasManagePermission = (BigInt(guild.permissions) & BigInt(0x20)) === BigInt(0x20);
  return guild.owner || hasManagePermission;
};

// Validation functions
const validateConfig = (config: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Required boolean fields
  const booleanFields = ['enabled', 'bypassTrusted', 'logActions', 'debug'];
  
  booleanFields.forEach(field => {
    if (typeof config[field] !== 'boolean') {
      errors.push(`${field} must be a boolean`);
    }
  });

  // Numeric validations
  if (typeof config.minAccountAge !== 'number' || config.minAccountAge < 1 || config.minAccountAge > 365) {
    errors.push('minAccountAge must be a number between 1 and 365 days');
  }

  if (typeof config.timeoutDuration !== 'number' || config.timeoutDuration < 60 || config.timeoutDuration > 2419200) {
    errors.push('timeoutDuration must be a number between 60 and 2419200 seconds');
  }

  // Action validation
  const validActions = ['notify', 'kick', 'ban', 'timeout'];
  if (typeof config.action !== 'string' || !validActions.includes(config.action)) {
    errors.push(`action must be one of: ${validActions.join(', ')}`);
  }

  // Array validations
  if (!Array.isArray(config.trustedUsers)) {
    errors.push('trustedUsers must be an array');
  } else {
    config.trustedUsers.forEach((userId: any, index: number) => {
      if (typeof userId !== 'string' || !/^\d+$/.test(userId)) {
        errors.push(`trustedUsers[${index}] must be a valid Discord user ID (numeric string)`);
      }
    });
  }

  if (!Array.isArray(config.trustedRoles)) {
    errors.push('trustedRoles must be an array');
  } else {
    config.trustedRoles.forEach((roleId: any, index: number) => {
      if (typeof roleId !== 'string' || !/^\d+$/.test(roleId)) {
        errors.push(`trustedRoles[${index}] must be a valid Discord role ID (numeric string)`);
      }
    });
  }

  // Optional fields
  if (config.logChannelId !== null && (typeof config.logChannelId !== 'string' || !/^\d+$/.test(config.logChannelId))) {
    errors.push('logChannelId must be null or a valid Discord channel ID (numeric string)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateGuildId = (guildId: string): boolean => {
  return typeof guildId === 'string' && /^\d+$/.test(guildId) && guildId.length >= 17 && guildId.length <= 20;
};

// GET handler - Fetch configuration for a guild
export async function GET(request: NextRequest) {
  try {
    // SECURITY LAYER 1: Authentication
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

    if (!validateGuildId(guildId)) {
      return NextResponse.json(
        { error: 'Invalid guild ID format' },
        { status: 400 }
      );
    }

    // SECURITY LAYER 2: Authorization
    if (!userCanManageGuild(session.user.guilds, guildId)) {
      return NextResponse.json(
        { error: 'You do not have permission to manage this guild' },
        { status: 403 }
      );
    }

    const { collection } = await connectToMongoDB();
    const document = await collection.findOne({ guildId });

    if (!document) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(document);

  } catch (error) {
    console.error('Account Age Config GET Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST handler - Create or update configuration for a guild
export async function POST(request: NextRequest) {
  try {
    // SECURITY LAYER 1: Authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { guildId, config } = body;

    // SECURITY LAYER 2: Validate guild ID
    if (!guildId || !validateGuildId(guildId)) {
      return NextResponse.json(
        { error: 'Valid guild ID is required' },
        { status: 400 }
      );
    }

    // SECURITY LAYER 3: Authorization - Check if user can manage this guild
    if (!userCanManageGuild(session.user.guilds, guildId)) {
      return NextResponse.json(
        { error: 'You do not have permission to manage this guild' },
        { status: 403 }
      );
    }

    // SECURITY LAYER 4: Validate configuration
    if (!config) {
      return NextResponse.json(
        { error: 'Configuration is required' },
        { status: 400 }
      );
    }

    const validation = validateConfig(config);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Invalid configuration', details: validation.errors },
        { status: 400 }
      );
    }

    const { collection } = await connectToMongoDB();

    const now = new Date();
    
    // Prepare the document with sanitized data
    const document: AccountAgeDocument = {
      guildId,
      config: {
        enabled: config.enabled,
        minAccountAge: config.minAccountAge,
        action: config.action,
        timeoutDuration: config.timeoutDuration,
        logChannelId: config.logChannelId,
        trustedUsers: config.trustedUsers,
        trustedRoles: config.trustedRoles,
        bypassTrusted: config.bypassTrusted,
        logActions: config.logActions,
        debug: config.debug
      },
      lastUpdated: now,
      createdAt: now
    };

    // Use upsert to create or update the document
    const result = await collection.replaceOne(
      { guildId },
      {
        ...document,
        createdAt: (await collection.findOne({ guildId }))?.createdAt || now
      },
      { upsert: true }
    );

    if (result.acknowledged) {
      const updatedDocument = await collection.findOne({ guildId });
      return NextResponse.json(updatedDocument, { status: 200 });
    } else {
      throw new Error('Failed to save configuration');
    }

  } catch (error) {
    console.error('Account Age Config POST Error:', error);
    
    // Handle specific MongoDB errors
    if (error instanceof Error) {
      if (error.message.includes('connection')) {
        return NextResponse.json(
          { error: 'Database connection failed' },
          { status: 503 }
        );
      }
      
      if (error.message.includes('validation')) {
        return NextResponse.json(
          { error: 'Configuration validation failed' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE handler - Remove configuration for a guild
export async function DELETE(request: NextRequest) {
  try {
    // SECURITY LAYER 1: Authentication
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

    if (!validateGuildId(guildId)) {
      return NextResponse.json(
        { error: 'Invalid guild ID format' },
        { status: 400 }
      );
    }

    // SECURITY LAYER 2: Authorization
    if (!userCanManageGuild(session.user.guilds, guildId)) {
      return NextResponse.json(
        { error: 'You do not have permission to manage this guild' },
        { status: 403 }
      );
    }

    const { collection } = await connectToMongoDB();
    const result = await collection.deleteOne({ guildId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Configuration deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Account Age Config DELETE Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT handler - Reset configuration to defaults for a guild
export async function PUT(request: NextRequest) {
  try {
    // SECURITY LAYER 1: Authentication
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

    if (!validateGuildId(guildId)) {
      return NextResponse.json(
        { error: 'Invalid guild ID format' },
        { status: 400 }
      );
    }

    // SECURITY LAYER 2: Authorization
    if (!userCanManageGuild(session.user.guilds, guildId)) {
      return NextResponse.json(
        { error: 'You do not have permission to manage this guild' },
        { status: 403 }
      );
    }

    const { collection } = await connectToMongoDB();

    const now = new Date();
    const existingDoc = await collection.findOne({ guildId });
    
    const document: AccountAgeDocument = {
      guildId,
      config: { ...defaultConfig },
      lastUpdated: now,
      createdAt: existingDoc?.createdAt || now
    };

    const result = await collection.replaceOne(
      { guildId },
      document,
      { upsert: true }
    );

    if (result.acknowledged) {
      const updatedDocument = await collection.findOne({ guildId });
      return NextResponse.json(updatedDocument, { status: 200 });
    } else {
      throw new Error('Failed to reset configuration');
    }

  } catch (error) {
    console.error('Account Age Config PUT Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}