// app/api/toggleRaid/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

interface ToggleRequest {
  guildId: string;
  enabled: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: ToggleRequest = await request.json();
    const { guildId, enabled } = body;

    // Validation
    if (!guildId || typeof enabled !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: guildId and enabled' },
        { status: 400 }
      );
    }

    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { success: false, error: 'MongoDB connection string not configured' },
        { status: 500 }
      );
    }

    let mongoClient: MongoClient | null = null;

    try {
      mongoClient = new MongoClient(process.env.MONGODB_URI);
      await mongoClient.connect();
      
      const db = mongoClient.db('antiraid');
      const collection = db.collection('antiraid_main_settings');
      
      // Upsert the setting
      await collection.updateOne(
        { guildId },
        { 
          $set: { 
            guildId,
            antiRaidEnabled: enabled,
            lastUpdated: new Date()
          } 
        },
        { upsert: true }
      );
      
      console.log(`🛡️ Anti-raid ${enabled ? 'enabled' : 'disabled'} for guild ${guildId}`);
      
      return NextResponse.json({ 
        success: true, 
        message: `Anti-raid system ${enabled ? 'enabled' : 'disabled'} globally` 
      });
      
    } finally {
      if (mongoClient) {
        await mongoClient.close();
      }
    }

  } catch (error) {
    console.error('❌ Toggle raid error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}