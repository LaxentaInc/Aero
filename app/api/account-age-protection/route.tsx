import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, Db, Collection } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

// NEW: Check if user can manage guild using your internal API
async function userCanManageGuild(userId: string, guildId: string): Promise<boolean> {
  try {
    const client = await connectToMongoDB();
    const guildsCollection = client.db.collection('bot_guilds');
    
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

// Validation functions
const validateConfig = (config: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  const booleanFields = ['enabled', 'bypassTrusted', 'logActions', 'debug'];
  
  booleanFields.forEach(field => {
    if (typeof config[field] !== 'boolean') {
      errors.push(`${field} must be a boolean`);
    }
  });

  if (typeof config.minAccountAge !== 'number' || config.minAccountAge < 1 || config.minAccountAge > 365) {
    errors.push('minAccountAge must be a number between 1 and 365 days');
  }

  if (typeof config.timeoutDuration !== 'number' || config.timeoutDuration < 60 || config.timeoutDuration > 2419200) {
    errors.push('timeoutDuration must be a number between 60 and 2419200 seconds');
  }

  const validActions = ['notify', 'kick', 'ban', 'timeout'];
  if (typeof config.action !== 'string' || !validActions.includes(config.action)) {
    errors.push(`action must be one of: ${validActions.join(', ')}`);
  }

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

// GET handler
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'SAAADD, Authentication is required. Please log in.' },
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

    // Use the new permission check
    const canManage = await userCanManageGuild(session.user.id, guildId);
    if (!canManage) {
      return NextResponse.json(
        { error: 'Nu uh console cowboy, You do not have permission to manage this guild' },
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

// POST handler
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Sad, Authentication is required. Please log in.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { guildId, config } = body;

    if (!guildId || !validateGuildId(guildId)) {
      return NextResponse.json(
        { error: 'Valid guild ID is required' },
        { status: 400 }
      );
    }

    // Use the new permission check
    const canManage = await userCanManageGuild(session.user.id, guildId);
    if (!canManage) {
      return NextResponse.json(
        { error: 'NOO CONSOLE COWBOY, You do not have permission to manage this guild' },
        { status: 403 }
      );
    }

    if (!config) {
      return NextResponse.json(
        { error: 'Configuration is required' },
        { status: 400 }
      );
    }

    const validation = validateConfig(config);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'WRONG AND INVALID configuration', details: validation.errors },
        { status: 400 }
      );
    }

    const { collection } = await connectToMongoDB();

    const now = new Date();
    
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
      throw new Error('CAN\'T save configuration');
    }

  } catch (error) {
    console.error('Account Age Config POST Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('connection')) {
        return NextResponse.json(
          { error: 'DB connection failed' },
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

// DELETE handler
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Nuuu console cowboy, Authentication is required. Please log in.' },
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

    // Use the new permission check
    const canManage = await userCanManageGuild(session.user.id, guildId);
    if (!canManage) {
      return NextResponse.json(
        { error: 'NO console cowboy, You do not have permission to manage this guild' },
        { status: 403 }
      );
    }

    const { collection } = await connectToMongoDB();
    const result = await collection.deleteOne({ guildId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Configuration Not yet created for this guild. Create one' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      // { message: 'Configuration deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('AMC DELETE Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT handler
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Sorry console cowboy, But Authentication is required. Please log in.' },
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

    // Use the new permission check
    const canManage = await userCanManageGuild(session.user.id, guildId);
    if (!canManage) {
      return NextResponse.json(
        { error: '  Sorry console cowboy, you do not have permission to manage this guild' },
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
      throw new Error('wtf? failed to reset configuration');
    }

  } catch (error) {
    console.error('AMC PUT err:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}