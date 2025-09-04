import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, Db, Collection } from 'mongodb';

// Types
interface SpamProtectionConfig {
  enabled: boolean;
  logChannelId: string | null;
  timeoutDuration: number;
  customMessage: string;
  keywordList: string[];
  trustedUsers: string[];
  trustedRoles: string[];
  mentionLimit: number;
  enableSpamProtection: boolean;
  enableMentionSpam: boolean;
  enableKeywordFilter: boolean;
  enableDuplicateText: boolean;
  logActions: boolean;
  debug: boolean;
}

interface SpamProtectionDocument {
  guildId: string;
  config: SpamProtectionConfig;
  autoModRuleIds: string[];
  lastUpdated: Date;
  createdAt: Date;
}

// MongoDB connection
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function connectToMongoDB(): Promise<{ db: Db; collection: Collection<SpamProtectionDocument> }> {
  if (cachedClient && cachedDb) {
    return {
      db: cachedDb,
      collection: cachedDb.collection<SpamProtectionDocument>('spam_protection_configs')
    };
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  const client = new MongoClient(mongoUri);
  await client.connect();

  const db = client.db('antiraid');
  const collection = db.collection<SpamProtectionDocument>('spam_protection_configs');

  // Cache the connection
  cachedClient = client;
  cachedDb = db;

  return { db, collection };
}

// Default configuration
const defaultConfig: SpamProtectionConfig = {
  enabled: true,
  logChannelId: null,
  timeoutDuration: 600,
  customMessage: 'Your message was flagged by spam protection.',
  keywordList: [],
  trustedUsers: [],
  trustedRoles: [],
  mentionLimit: 5,
  enableSpamProtection: true,
  enableMentionSpam: true,
  enableKeywordFilter: false,
  enableDuplicateText: true,
  logActions: true,
  debug: false
};

// Validation functions
const validateConfig = (config: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Required boolean fields
  const booleanFields = [
    'enabled', 'enableSpamProtection', 'enableMentionSpam', 
    'enableKeywordFilter', 'enableDuplicateText', 'logActions', 'debug'
  ];
  
  booleanFields.forEach(field => {
    if (typeof config[field] !== 'boolean') {
      errors.push(`${field} must be a boolean`);
    }
  });

  // Numeric validations
  if (typeof config.timeoutDuration !== 'number' || config.timeoutDuration < 60 || config.timeoutDuration > 2419200) {
    errors.push('timeoutDuration must be a number between 60 and 2419200 seconds');
  }

  if (typeof config.mentionLimit !== 'number' || config.mentionLimit < 1 || config.mentionLimit > 50) {
    errors.push('mentionLimit must be a number between 1 and 50');
  }

  // String validations
  if (typeof config.customMessage !== 'string' || config.customMessage.length > 2000) {
    errors.push('customMessage must be a string with maximum 2000 characters');
  }

  // Array validations
  if (!Array.isArray(config.keywordList)) {
    errors.push('keywordList must be an array');
  } else {
    config.keywordList.forEach((keyword: any, index: number) => {
      if (typeof keyword !== 'string' || keyword.length === 0 || keyword.length > 100) {
        errors.push(`keywordList[${index}] must be a non-empty string with maximum 100 characters`);
      }
    });
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
    console.error('Spam Protection Config GET Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST handler - Create or update configuration for a guild
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { guildId, config, autoModRuleIds = [] } = body;

    // Validate guild ID
    if (!guildId || !validateGuildId(guildId)) {
      return NextResponse.json(
        { error: 'Valid guild ID is required' },
        { status: 400 }
      );
    }

    // Validate configuration
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

    // Validate autoModRuleIds if provided
    if (!Array.isArray(autoModRuleIds)) {
      return NextResponse.json(
        { error: 'autoModRuleIds must be an array' },
        { status: 400 }
      );
    }

    for (let i = 0; i < autoModRuleIds.length; i++) {
      const ruleId = autoModRuleIds[i];
      if (typeof ruleId !== 'string' || !/^\d+$/.test(ruleId)) {
        return NextResponse.json(
          { error: `autoModRuleIds[${i}] must be a valid Discord rule ID (numeric string)` },
          { status: 400 }
        );
      }
    }

    const { collection } = await connectToMongoDB();

    const now = new Date();
    
    // Prepare the document
    const document: SpamProtectionDocument = {
      guildId,
      config: {
        enabled: config.enabled,
        logChannelId: config.logChannelId,
        timeoutDuration: config.timeoutDuration,
        customMessage: config.customMessage,
        keywordList: config.keywordList,
        trustedUsers: config.trustedUsers,
        trustedRoles: config.trustedRoles,
        mentionLimit: config.mentionLimit,
        enableSpamProtection: config.enableSpamProtection,
        enableMentionSpam: config.enableMentionSpam,
        enableKeywordFilter: config.enableKeywordFilter,
        enableDuplicateText: config.enableDuplicateText,
        logActions: config.logActions,
        debug: config.debug
      },
      autoModRuleIds: autoModRuleIds,
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
    console.error('Spam Protection Config POST Error:', error);
    
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
    console.error('Spam Protection Config DELETE Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT handler - Reset configuration to defaults for a guild
export async function PUT(request: NextRequest) {
  try {
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

    const { collection } = await connectToMongoDB();

    const now = new Date();
    const existingDoc = await collection.findOne({ guildId });
    
    const document: SpamProtectionDocument = {
      guildId,
      config: { ...defaultConfig },
      autoModRuleIds: existingDoc?.autoModRuleIds || [],
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
    console.error('Spam Protection Config PUT Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}