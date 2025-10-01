// app/api/raidStatus/[guildId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

interface RouteParams {
  params: {
    guildId: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { guildId } = params;

    if (!guildId) {
      return NextResponse.json(
        { success: false, error: 'Valid guildId is required' },
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
      
      // Find the setting for this guild
      const setting = await collection.findOne({ guildId });
      
      // Default to enabled if no setting exists
      const antiRaidEnabled = setting?.antiRaidEnabled ?? true;
      
      return NextResponse.json({ 
        success: true, 
        data: {
          antiRaidEnabled,
          lastUpdated: setting?.lastUpdated
        }
      });
      
    } finally {
      if (mongoClient) {
        await mongoClient.close();
      }
    }

  } catch (error) {
    console.error('❌ Raid status check error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}