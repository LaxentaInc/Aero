import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, Db, Collection } from 'mongodb';

// Types and Interfaces
export interface SpamProtectionConfig {
  enabled: boolean;
  logChannelId: string | null;
  
  // Keywords to block
  keywords: string[];
  regexPatterns: string[];
  allowList: string[];
  
  // Mention limits
  mentionLimit: number;
  
  // Preset filters
  blockProfanity: boolean;
  blockSexualContent: boolean;
  blockSlurs: boolean;
  
  // Actions
  blockMessage: boolean;
  timeoutDuration: number; // seconds, 0 = disabled
  sendAlert: boolean;
  
  lastUpdated: Date | null;
}

export interface SpamProtectionDocument {
  guildId: string;
  config: SpamProtectionConfig;
  createdAt: Date;
  lastUpdated: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// MongoDB Connection
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  const client = new MongoClient(uri);
  await client.connect();
  
  const db = client.db('antiraid');
  
  cachedClient = client;
  cachedDb = db;
  
  return { client, db };
}

async function getCollection(): Promise<Collection<SpamProtectionDocument>> {
  const { db } = await connectToDatabase();
  return db.collection<SpamProtectionDocument>('spam_protection_configs');
}

// Default Configuration
const DEFAULT_CONFIG: SpamProtectionConfig = {
  enabled: false,
  logChannelId: null,
  
  keywords: [
    'discord.gg/', 'free nitro', 'virus', 'malware', 
    'raid time', 'mass dm', 'nuke server'
  ],
  regexPatterns: [
    'discord\\.gg\\/[a-zA-Z0-9]+',
    '@(everyone|here)\\s*@(everyone|here)'
  ],
  allowList: ['discord support', 'discord official'],
  
  mentionLimit: 5,
  
  blockProfanity: false,
  blockSexualContent: false,
  blockSlurs: true,
  
  blockMessage: true,
  timeoutDuration: 300, // 5 minutes
  sendAlert: true,
  
  lastUpdated: null
};

// API Route Handlers

// GET - Fetch configuration for a guild
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const guildId = searchParams.get('guildId');

    if (!guildId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Guild ID is required'
      }, { status: 400 });
    }

    const collection = await getCollection();
    const document = await collection.findOne({ guildId });

    if (!document) {
      // Return default config if none exists
      return NextResponse.json<ApiResponse<SpamProtectionConfig>>({
        success: true,
        data: { ...DEFAULT_CONFIG },
        message: 'No configuration found, returning defaults'
      });
    }

    return NextResponse.json<ApiResponse<SpamProtectionConfig>>({
      success: true,
      data: document.config
    });

  } catch (error) {
    console.error('GET /api/spam-protection error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to fetch configuration'
    }, { status: 500 });
  }
}

// POST - Create or update configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { guildId, config } = body;

    if (!guildId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Guild ID is required'
      }, { status: 400 });
    }

    if (!config) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Configuration is required'
      }, { status: 400 });
    }

    // Validate and merge with defaults
    const validatedConfig: SpamProtectionConfig = {
      ...DEFAULT_CONFIG,
      ...config,
      lastUpdated: new Date(),
      
      // Ensure arrays are arrays
      keywords: Array.isArray(config.keywords) ? config.keywords : DEFAULT_CONFIG.keywords,
      regexPatterns: Array.isArray(config.regexPatterns) ? config.regexPatterns : DEFAULT_CONFIG.regexPatterns,
      allowList: Array.isArray(config.allowList) ? config.allowList : DEFAULT_CONFIG.allowList,
      
      // Validate numeric values
      mentionLimit: Math.min(Math.max(config.mentionLimit || DEFAULT_CONFIG.mentionLimit, 0), 50),
      timeoutDuration: Math.min(Math.max(config.timeoutDuration || DEFAULT_CONFIG.timeoutDuration, 0), 2419200)
    };

    const collection = await getCollection();
    const now = new Date();

    const result = await collection.updateOne(
      { guildId },
      {
        $set: {
          guildId,
          config: validatedConfig,
          lastUpdated: now
        },
        $setOnInsert: {
          createdAt: now
        }
      },
      { upsert: true }
    );

    return NextResponse.json<ApiResponse<SpamProtectionConfig>>({
      success: true,
      data: validatedConfig,
      message: result.upsertedId ? 'Configuration created' : 'Configuration updated'
    });

  } catch (error) {
    console.error('POST /api/spam-protection error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to save configuration'
    }, { status: 500 });
  }
}

// PATCH - Update specific parts of configuration
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { guildId, updates } = body;

    if (!guildId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Guild ID is required'
      }, { status: 400 });
    }

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Updates object is required'
      }, { status: 400 });
    }

    const collection = await getCollection();
    
    // Get existing config or use defaults
    let existingDocument = await collection.findOne({ guildId });
    const existingConfig = existingDocument?.config || { ...DEFAULT_CONFIG };

    // Merge updates with existing config
    const updatedConfig: SpamProtectionConfig = {
      ...existingConfig,
      ...updates,
      lastUpdated: new Date()
    };

    // Validate specific fields if they're being updated
    if ('mentionLimit' in updates) {
      updatedConfig.mentionLimit = Math.min(Math.max(updates.mentionLimit, 0), 50);
    }
    if ('timeoutDuration' in updates) {
      updatedConfig.timeoutDuration = Math.min(Math.max(updates.timeoutDuration, 0), 2419200);
    }
    if ('keywords' in updates && Array.isArray(updates.keywords)) {
      updatedConfig.keywords = updates.keywords;
    }
    if ('regexPatterns' in updates && Array.isArray(updates.regexPatterns)) {
      updatedConfig.regexPatterns = updates.regexPatterns;
    }
    if ('allowList' in updates && Array.isArray(updates.allowList)) {
      updatedConfig.allowList = updates.allowList;
    }

    const now = new Date();
    const result = await collection.updateOne(
      { guildId },
      {
        $set: {
          guildId,
          config: updatedConfig,
          lastUpdated: now
        },
        $setOnInsert: {
          createdAt: now
        }
      },
      { upsert: true }
    );

    return NextResponse.json<ApiResponse<SpamProtectionConfig>>({
      success: true,
      data: updatedConfig,
      message: result.upsertedId ? 'Configuration created' : 'Configuration updated'
    });

  } catch (error) {
    console.error('PATCH /api/spam-protection error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to update configuration'
    }, { status: 500 });
  }
}

// DELETE - Reset configuration to defaults or delete entirely
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const guildId = searchParams.get('guildId');
    const resetToDefaults = searchParams.get('reset') === 'true';

    if (!guildId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Guild ID is required'
      }, { status: 400 });
    }

    const collection = await getCollection();

    if (resetToDefaults) {
      // Reset to default configuration
      const now = new Date();
      const defaultConfig = { ...DEFAULT_CONFIG, lastUpdated: now };
      
      await collection.updateOne(
        { guildId },
        {
          $set: {
            guildId,
            config: defaultConfig,
            lastUpdated: now
          },
          $setOnInsert: {
            createdAt: now
          }
        },
        { upsert: true }
      );

      return NextResponse.json<ApiResponse<SpamProtectionConfig>>({
        success: true,
        data: defaultConfig,
        message: 'Configuration reset to defaults'
      });
    } else {
      // Delete configuration entirely
      const result = await collection.deleteOne({ guildId });
      
      return NextResponse.json<ApiResponse>({
        success: true,
        message: result.deletedCount > 0 ? 'Configuration deleted' : 'No configuration found to delete'
      });
    }

  } catch (error) {
    console.error('DELETE /api/spam-protection error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to delete configuration'
    }, { status: 500 });
  }
}

// PUT - Toggle module enabled/disabled
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { guildId, enabled } = body;

    if (!guildId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Guild ID is required'
      }, { status: 400 });
    }

    if (typeof enabled !== 'boolean') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Enabled must be a boolean'
      }, { status: 400 });
    }

    const collection = await getCollection();
    
    // Get existing config or use defaults
    let existingDocument = await collection.findOne({ guildId });
    const existingConfig = existingDocument?.config || { ...DEFAULT_CONFIG };

    const updatedConfig: SpamProtectionConfig = {
      ...existingConfig,
      enabled,
      lastUpdated: new Date()
    };

    const now = new Date();
    await collection.updateOne(
      { guildId },
      {
        $set: {
          guildId,
          config: updatedConfig,
          lastUpdated: now
        },
        $setOnInsert: {
          createdAt: now
        }
      },
      { upsert: true }
    );

    return NextResponse.json<ApiResponse<SpamProtectionConfig>>({
      success: true,
      data: updatedConfig,
      message: `Spam protection ${enabled ? 'enabled' : 'disabled'}`
    });

  } catch (error) {
    console.error('PUT /api/spam-protection error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to toggle module'
    }, { status: 500 });
  }
}